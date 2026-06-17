#!/usr/bin/env python3
"""inventory.py - list media in public/ (size + duration) -> ASSETS_INVENTORY.md.

Run from the project folder:  py ../scripts/inventory.py  [--dir public] [--out ASSETS_INVENTORY.md]
List the shared b-roll library:  py ../scripts/inventory.py --broll
Helps avoid inventing bare backgrounds: shows what already exists and which scene it fits.
"""
import argparse, json, os
from _lib import probe_duration, WORKSPACE  # shared ffprobe-duration helper

BROLL_INDEX = os.path.join(WORKSPACE, "_ASSETS", "broll", "_index.json")
AV = {".mp4", ".mov", ".webm", ".mkv", ".mp3", ".wav", ".m4a", ".aac", ".ogg"}
IMG = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return "%.0f%s" % (n, u)
        n /= 1024
    return "%.0fTB" % n


def list_broll():
    if not os.path.exists(BROLL_INDEX):
        print("[inventory] no b-roll library yet - run /broll. Expected: " + BROLL_INDEX); return
    data = json.load(open(BROLL_INDEX, encoding="utf-8"))
    by_cat = {}
    for e in data:
        by_cat.setdefault(e.get("category", "?"), []).append(e)
    print("# Shared b-roll library: %d clips, %d categories" % (len(data), len(by_cat)))
    for cat in sorted(by_cat):
        print("\n## %s (%d)" % (cat, len(by_cat[cat])))
        for e in by_cat[cat]:
            print("  - %s  [%sx%s, %ss, %s]  %s" % (
                e.get("description", ""), e.get("width"), e.get("height"),
                e.get("duration_s"), e.get("source"), e.get("file")))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="public")
    ap.add_argument("--out", default="ASSETS_INVENTORY.md")
    ap.add_argument("--broll", action="store_true", help="list the shared _ASSETS/broll library instead")
    args = ap.parse_args()

    if args.broll:
        list_broll(); return

    if not os.path.isdir(args.dir):
        print("[inventory] no such dir: " + args.dir); return

    rows = []
    for root, _, files in os.walk(args.dir):
        for fn in sorted(files):
            p = os.path.join(root, fn)
            ext = os.path.splitext(fn)[1].lower()
            kind = "av" if ext in AV else ("image" if ext in IMG else "-")
            size = human(os.path.getsize(p))
            dur = probe_duration(p) if ext in AV else None
            durs = ("%.1fs" % dur) if dur else ""
            rel = os.path.relpath(p, args.dir).replace("\\", "/")
            rows.append((rel, kind, size, durs))

    lines = ["# Asset inventory (`public/`)", "",
             "| File | Type | Size | Dur | Scene |",
             "|---|---|---|---|---|"]
    for rel, kind, size, durs in rows:
        lines.append("| `%s` | %s | %s | %s |  |" % (rel, kind, size, durs))
    lines += ["", "_Total: %d files. Fill the Scene column as you go._" % len(rows)]

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("[inventory] %d files -> %s" % (len(rows), args.out))


if __name__ == "__main__":
    main()
