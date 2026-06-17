#!/usr/bin/env python3
"""engine_guard.py - PreToolUse hook: protect the shared ENGINE from project-chat edits.

Wired in ~/.claude/settings.json as a PreToolUse hook on Edit|Write|MultiEdit|NotebookEdit.
The "engine" is a TOOL shared (via junctions) by every project. A project chat must only
touch its own files (src/scenes, src/utils, public, Root.tsx, *.md). Editing the engine from
a project breaks ALL projects at once - so we deny it here.

DENY (when the target is inside the workspace ENGINE_ROOT):
  - <root>\\scripts\\...                  (render/audio scripts - shared)
  - <root>\\.claude\\skills\\...          (skills - shared)
  - <root>\\.claude\\commands\\...        (slash commands - shared)
  - <root>\\_ASSETS\\kit\\...             (the engine components)
  - <root>\\_ASSETS\\node_modules\\...    (shared dep store)
  - ...\\src\\kit\\...                     (per-project junction -> _ASSETS\\kit)
  - ...\\node_modules\\...                 (per-project junction -> _ASSETS\\node_modules)
ALLOW: everything else (project files, docs) and anything outside ENGINE_ROOT.

Escape hatch: set env ENGINE_EDIT=1 for a session that deliberately maintains the engine.
Fail-OPEN: on any error / missing input we allow (a broken guard must never block real work).

Reads the hook JSON from stdin as UTF-8 (the workspace path has Cyrillic 'Про видео' -
locale-encoded stdin would mangle it and silently disable the guard).
"""
import sys, os, json

# The engine workspace root. Derived from this file's own location (scripts/hooks/engine_guard.py
# -> three levels up = workspace root), so the guard works on any clone. Override via $ENGINE_ROOT.
ENGINE_ROOT = os.environ.get("ENGINE_ROOT") or os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# These engine dirs live only at the workspace root -> match anchored at <root>.
ROOT_ANCHORED = ("\\scripts\\", "\\.claude\\skills\\", "\\.claude\\commands\\",
                 "\\_assets\\kit\\")  # _ASSETS\node_modules is covered by ANY_DEPTH's \node_modules\
# These are junctions that live inside EACH project -> match at any depth under <root>.
ANY_DEPTH = ("\\node_modules\\", "\\src\\kit\\")


def _norm(p):
    return os.path.normpath(p).replace("/", "\\").lower()


def _allow():
    sys.exit(0)  # no output + exit 0 == allow


def _deny(path):
    reason = (
        "Engine-guard: '%s' is the shared ENGINE (a tool), not a project file. "
        "Keep project work in src/scenes, src/utils, public, Root.tsx. "
        "To intentionally edit the engine, run the session with ENGINE_EDIT=1." % path
    )
    # ensure_ascii=True (default) -> Cyrillic-safe stdout on Windows; the UI un-escapes it.
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason,
    }}))
    sys.exit(0)


def main():
    if os.environ.get("ENGINE_EDIT") == "1":
        _allow()
    try:
        raw = sys.stdin.buffer.read().decode("utf-8", "ignore")
        data = json.loads(raw)
    except Exception:
        _allow()
        return
    ti = data.get("tool_input") or {}
    fp = ti.get("file_path") or ti.get("notebook_path")
    if not fp:
        _allow()
        return

    root = _norm(ENGINE_ROOT)
    cands = set()
    for fn in (os.path.abspath, os.path.realpath):  # realpath resolves junctions too
        try:
            cands.add(_norm(fn(fp)))
        except Exception:
            pass

    for c in cands:
        if c != root and not c.startswith(root + "\\"):
            continue  # outside the engine workspace -> not our concern
        rest = c[len(root):]
        if any(rest.startswith(p) for p in ROOT_ANCHORED) or any(p in c for p in ANY_DEPTH):
            _deny(c)
    _allow()


if __name__ == "__main__":
    main()
