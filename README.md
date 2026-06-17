# Video Workflow

Шаблон для создания промо-видео через [Remotion](https://www.remotion.dev) v4 + Claude Code.

## Установка
```bash
git clone <repo> video-workflow && cd video-workflow
setup.bat       # Windows
bash setup.sh   # Linux / macOS / VPS
```
`setup` проверит Node ≥ 20 и FFmpeg, скачает [правила Remotion](https://github.com/remotion-dev/skills) в `.claude/skills/remotion/`, создаст `.env`.

Дальше **один раз** наполни общий стор зависимостей и впиши ключи:
```bash
_ASSETS\_install.bat        # npm install -> общий _ASSETS/node_modules (на него ссылаются junction'ы проектов)
```
Ключи API — в `.env` (шаблон `.env.example`). FFmpeg берётся из PATH; нестандартный путь — env `FFMPEG` / `FFPROBE`.

## Новый проект
```bash
powershell -File newproject.ps1 MyProject   # скелет + 2 junction (node_modules + src/kit → движок)
```
Или из Claude Code: `/newvid MyProject`. Затем открой Claude Code в корне рабочей папки и скажи:
> «Делаем видео про **тема**. ТЗ: **текст или ссылка**»

Claude задействует навык **`video-pipeline`** (весь процесс от ТЗ до 4K-финала), общий движок `_ASSETS/kit`, правила Remotion и slash-команды ниже.

## Команды (Claude Code)
Повторяющиеся операции — через `scripts/` и slash-команды. Все флаги — в одном месте (`scripts/_env.ps1`):

| Команда | Что |
|---|---|
| `/render smoke\|preview\|final` | рендер каноническими флагами (final → 4K + авто-preflight, авто-версии) |
| `/sheet` | контакт-лист всего ролика одной PNG (обзор за один просмотр) |
| `/timing voice.mp3 [--captions]` | длительность → `durationInFrames` + субтитры (Whisper) |
| `/mix` · `/preflight` · `/concat` | звук (ducking) · проверка перед отдачей · склейка/заморозка сцен |
| `/reframe` | 16:9 → 9:16 / 1:1 для соцсетей (blur-fill или кроп) |
| `/broll` | поиск+скачивание b-roll в `_ASSETS/broll/` по категориям |
| `/inventory` · `/benchmark` | опись `public/` · эмпирический подбор concurrency |
| `/studio` · `/still` | живой превью (hot-reload) · один кадр → PNG (vision) |
| `/preview-template` | сниппет из библиотеки → PNG (увидеть до адаптации) |
| `/archive` | сделать junction-проект автономным (перенос/архив) |

Живой превью: `npx remotion studio src/index.ts --gl=angle-egl`.

## Структура
```
.
├── CLAUDE.md                  ориентир для Claude (тонкий; детали — по ссылкам)
├── UNIVERSAL_VIDEO_PROMPT.md  процесс «как довести видео до идеала»
├── COWORK.md                  работа НЕ в Claude Code (Cowork/Desktop Commander)
├── newproject.ps1             новый проект (скелет + junctions)
├── setup.bat / setup.sh       установка
├── scripts/                   render·mix·concat·preflight·contactsheet·voicetiming·inventory·benchmark
├── .claude/
│   ├── commands/              slash-команды (/render, /sheet, /mix …)
│   └── skills/                video-pipeline (процесс) + remotion (правила API)
├── _template/                 lean-скелет проекта (src + CLAUDE.md + PROGRESS.md)
├── _ASSETS/
│   ├── node_modules/          ОБЩИЙ стор (цель junction; обновить — _install.bat)
│   ├── kit/                   ⭐ ОБЩИЙ движок (один на все) — см. kit/README.md
│   ├── remotion_templates/    82 шаблона + 12 wow-эффектов (index.json)
│   ├── broll/                 общая b-roll библиотека по категориям (broll.py + _index.json)
│   └── fonts/ · music/        общие ассеты (по мере наполнения)
├── incoming/                  сырьё от клиента (gitignored — конфиденциально)
└── <YourProject>/             проект-папка (junctions — только Windows; перенос — /archive)
```

## Требования
- **Node.js ≥ 20** — https://nodejs.org · **FFmpeg** — Win: https://www.gyan.dev/ffmpeg/builds/ · `apt install ffmpeg` · `brew install ffmpeg`
- **Python 3** (+ `py` launcher на Windows) — для `broll`/`voicetiming`/`inventory`; **Whisper** (`pip install -U openai-whisper`) — для субтитров.
- **Claude Code** — основная среда. Cowork/Desktop Commander — опционально (`COWORK.md`).
- **API ключи** (опционально, только для `/broll`): [Pexels](https://www.pexels.com/api/), [Pixabay](https://pixabay.com/api/docs/) — в `.env`.
- **ffmpeg**: по умолчанию из PATH; переопределить — env `FFMPEG` / `FFPROBE`.

## Лицензия
MIT (`LICENSE`) — на код и документацию проекта. Стороннее — под своими лицензиями: Remotion (через npm; компаниям может требоваться лицензия — remotion.dev/license), b-roll Pexels/Pixabay (в репо НЕ входит — качается `/broll`), `_ASSETS/remotion_templates/` (MIT).
