# Remotion Promo Studio

**English · [Русский](README.ru.md) · [Українська](README.uk.md)**

A workspace template for making promo videos with [Remotion](https://www.remotion.dev) v4 + Claude Code.

## Quick start

On your machine you need **Node ≥ 20**, **FFmpeg**, and **Python 3** installed (links under [Requirements](#requirements)).

1. Download or clone this folder.
2. Open Claude Code in it.
3. Say: **"set up the workspace"** — Claude installs the dependencies and checks the environment.

Then just ask:
> "Make a video about **topic**. Brief: **text or link**"

Claude runs the **`video-pipeline`** skill — the whole flow from brief to a 4K final, using the shared engine, the Remotion rules, and the slash-commands below.

---

<details>
<summary><b>Manual setup (without Claude doing it for you)</b></summary>

```bash
git clone https://github.com/Archiewarious/remotion-promo-studio && cd remotion-promo-studio
setup.bat       # Windows  — checks Node/FFmpeg, downloads Remotion rules, creates .env
bash setup.sh   # Linux / macOS / VPS
_ASSETS\_install.bat        # one-time: npm install -> shared _ASSETS/node_modules (projects junction to it)
```
- API keys (optional, only for `/broll`) go in `.env` — template: `.env.example`.
- New project: `powershell -File newproject.ps1 MyProject` (or `/newvid MyProject` in Claude Code).
- FFmpeg is taken from PATH; for a custom path set env `FFMPEG` / `FFPROBE`.
</details>

## Commands (Claude Code)
Repeating operations go through `scripts/` and slash-commands. All flags live in one place (`scripts/_env.ps1`):

| Command | What |
|---|---|
| `/render smoke\|preview\|final` | render with canonical flags (final -> 4K + auto-preflight, auto-versioned) |
| `/sheet` | contact sheet of the whole clip as one PNG (review at a glance) |
| `/timing voice.mp3 [--captions]` | duration -> `durationInFrames` + subtitles (Whisper) |
| `/mix` · `/preflight` · `/concat` | audio (ducking) · pre-delivery check · join/freeze scenes |
| `/reframe` | 16:9 -> 9:16 / 1:1 for social (blur-fill or crop) |
| `/broll` | search + download b-roll into `_ASSETS/broll/` by category |
| `/inventory` · `/benchmark` | inventory `public/` · empirically pick concurrency |
| `/studio` · `/still` | live preview (hot-reload) · single frame -> PNG (vision) |
| `/preview-template` | render a library snippet -> PNG (see before adapting) |
| `/archive` | make a junction-based project standalone (move/archive) |

Live preview: `npx remotion studio src/index.ts --gl=angle-egl`.

## Structure
```
.
├── CLAUDE.md                  guide for Claude (thin; details behind links)
├── UNIVERSAL_VIDEO_PROMPT.md  the "polish a video to perfection" process
├── COWORK.md                  working outside Claude Code (Cowork/Desktop Commander)
├── newproject.ps1             new project (skeleton + junctions)
├── setup.bat / setup.sh       install
├── scripts/                   render·mix·concat·preflight·contactsheet·voicetiming·inventory·benchmark
├── .claude/
│   ├── commands/              slash-commands (/render, /sheet, /mix …)
│   └── skills/                video-pipeline (process) + remotion (API rules)
├── _template/                 lean project skeleton (src + CLAUDE.md + PROGRESS.md)
├── _ASSETS/
│   ├── node_modules/          SHARED store (junction target; update via _install.bat)
│   ├── kit/                   ⭐ SHARED engine (one for all) — see kit/README.md
│   ├── remotion_templates/    scene templates + wow-effects (index.json)
│   ├── broll/                 shared b-roll library by category (broll.py + _index.json)
│   └── fonts/ · music/        shared assets (filled as you go)
├── incoming/                  raw client material (gitignored — confidential)
└── <YourProject>/             project folder (junctions are Windows-only; move via /archive)
```

## Requirements
- **Node.js ≥ 20** — https://nodejs.org · **FFmpeg** — Win: https://www.gyan.dev/ffmpeg/builds/ · `apt install ffmpeg` · `brew install ffmpeg`
- **Python 3** (+ the `py` launcher on Windows) — for `broll`/`voicetiming`/`inventory`; **Whisper** (`pip install -U openai-whisper`) — for subtitles.
- **Claude Code** — the main environment. Cowork/Desktop Commander — optional (`COWORK.md`).
- **API keys** (optional, only for `/broll`): [Pexels](https://www.pexels.com/api/), [Pixabay](https://pixabay.com/api/docs/) — in `.env`.

## License
MIT (`LICENSE`) — covers this project's code and docs. Third-party material keeps its own license: Remotion (via npm; companies may need a license — remotion.dev/license), Pexels/Pixabay b-roll (NOT in the repo — fetched via `/broll`), `_ASSETS/remotion_templates/` (MIT).
