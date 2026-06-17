# Remotion Promo Studio

**[English](README.md) · Русский · [Українська](README.uk.md)**

Шаблон-воркспейс для создания промо-видео через [Remotion](https://www.remotion.dev) v4 + Claude Code.

## Быстрый старт (самый простой путь)

1. **Получи проект** — любым способом:
   - клонируй: `git clone https://github.com/Archiewarious/remotion-promo-studio`
   - или скачай ZIP (зелёная кнопка **Code** -> **Download ZIP**) и распакуй
   - или просто скажи Claude Code: *«склонируй https://github.com/Archiewarious/remotion-promo-studio и открой»*
2. **Открой Claude Code** в папке.
3. **Поздоровайся** — напиши `привет` (или *«что это?»*). Claude расскажет, что это и что можно делать.
4. **Скажи, что хочешь** — например *«сделай видео про мою кофейню»*. Claude проверит твою машину, настроит что нужно и соберёт видео вместе с тобой.

Команды установки руками вводить не надо: Claude читает `CLAUDE.md`, подстраивается под твою ОС и сам подскажет, что доустановить, если чего-то не хватает. Создание видео идёт по навыку **`video-pipeline`** (процесс — `UNIVERSAL_VIDEO_PROMPT.md`): от ТЗ до 4K-финала.

> Нужен авто-поиск стокового b-roll? Добавь бесплатные ключи **Pexels/Pixabay** в `.env` (опционально) — Claude покажет как.

---

<details>
<summary><b>Установка вручную (если не доверять это Claude)</b></summary>

```bash
git clone https://github.com/Archiewarious/remotion-promo-studio && cd remotion-promo-studio
setup.bat       # Windows  — проверит Node/FFmpeg, скачает правила Remotion, создаст .env
bash setup.sh   # Linux / macOS / VPS
_ASSETS\_install.bat        # один раз: npm install -> общий _ASSETS/node_modules (на него ссылаются junction'ы проектов)
```
- Ключи API (опционально, только для `/broll`) — в `.env` (шаблон `.env.example`).
- Новый проект: `powershell -File newproject.ps1 MyProject` (или `/newvid MyProject` в Claude Code).
- FFmpeg берётся из PATH; нестандартный путь — env `FFMPEG` / `FFPROBE`.
</details>

## Команды (Claude Code)
Повторяющиеся операции — через `scripts/` и slash-команды. Все флаги — в одном месте (`scripts/_env.ps1`):

| Команда | Что |
|---|---|
| `/render smoke\|preview\|final` | рендер каноническими флагами (final -> 4K + авто-preflight, авто-версии) |
| `/sheet` | контакт-лист всего ролика одной PNG (обзор за один просмотр) |
| `/timing voice.mp3 [--captions]` | длительность -> `durationInFrames` + субтитры (Whisper) |
| `/mix` · `/preflight` · `/concat` | звук (ducking) · проверка перед отдачей · склейка/заморозка сцен |
| `/reframe` | 16:9 -> 9:16 / 1:1 для соцсетей (blur-fill или кроп) |
| `/broll` | поиск+скачивание b-roll в `_ASSETS/broll/` по категориям |
| `/inventory` · `/benchmark` | опись `public/` · эмпирический подбор concurrency |
| `/studio` · `/still` | живой превью (hot-reload) · один кадр -> PNG (vision) |
| `/preview-template` | сниппет из библиотеки -> PNG (увидеть до адаптации) |
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
│   ├── remotion_templates/    шаблоны сцен + wow-эффекты (index.json)
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

## Лицензия
MIT (`LICENSE`) — на код и документацию проекта. Стороннее — под своими лицензиями: Remotion (через npm; компаниям может требоваться лицензия — remotion.dev/license), b-roll Pexels/Pixabay (в репо НЕ входит — качается `/broll`), `_ASSETS/remotion_templates/` (MIT).
