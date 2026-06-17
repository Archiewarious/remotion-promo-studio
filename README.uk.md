# Remotion Promo Studio

**[English](README.md) · [Русский](README.ru.md) · Українська**

Шаблон-воркспейс для створення промо-відео через [Remotion](https://www.remotion.dev) v4 + Claude Code.

## Швидкий старт

На ПК мають бути встановлені **Node ≥ 20**, **FFmpeg** і **Python 3** (посилання — у [Вимогах](#вимоги)).

1. Завантаж або клонуй цю папку.
2. Відкрий у ній Claude Code.
3. Напиши: **«налаштуй воркспейс»** — Claude поставить залежності й перевірить оточення.

Далі просто скажи:
> «Робимо відео про **тема**. ТЗ: **текст або посилання**»

Claude задіє навичку **`video-pipeline`** — увесь процес від ТЗ до 4K-фіналу: спільний рушій, правила Remotion і slash-команди нижче.

---

<details>
<summary><b>Встановлення вручну (якщо не довіряти це Claude)</b></summary>

```bash
git clone https://github.com/Archiewarious/remotion-promo-studio && cd remotion-promo-studio
setup.bat       # Windows  — перевірить Node/FFmpeg, завантажить правила Remotion, створить .env
bash setup.sh   # Linux / macOS / VPS
_ASSETS\_install.bat        # один раз: npm install -> спільний _ASSETS/node_modules (на нього посилаються junction'и проєктів)
```
- Ключі API (опціонально, лише для `/broll`) — у `.env` (шаблон `.env.example`).
- Новий проєкт: `powershell -File newproject.ps1 MyProject` (або `/newvid MyProject` у Claude Code).
- FFmpeg береться з PATH; нестандартний шлях — env `FFMPEG` / `FFPROBE`.
</details>

## Команди (Claude Code)
Повторювані операції — через `scripts/` і slash-команди. Усі прапорці — в одному місці (`scripts/_env.ps1`):

| Команда | Що |
|---|---|
| `/render smoke\|preview\|final` | рендер канонічними прапорцями (final -> 4K + авто-preflight, авто-версії) |
| `/sheet` | контакт-аркуш усього ролика однією PNG (огляд за один погляд) |
| `/timing voice.mp3 [--captions]` | тривалість -> `durationInFrames` + субтитри (Whisper) |
| `/mix` · `/preflight` · `/concat` | звук (ducking) · перевірка перед здачею · склейка/заморозка сцен |
| `/reframe` | 16:9 -> 9:16 / 1:1 для соцмереж (blur-fill або кроп) |
| `/broll` | пошук+завантаження b-roll у `_ASSETS/broll/` за категоріями |
| `/inventory` · `/benchmark` | опис `public/` · емпіричний підбір concurrency |
| `/studio` · `/still` | живий прев'ю (hot-reload) · один кадр -> PNG (vision) |
| `/preview-template` | сніпет із бібліотеки -> PNG (побачити до адаптації) |
| `/archive` | зробити junction-проєкт автономним (перенесення/архів) |

Живий прев'ю: `npx remotion studio src/index.ts --gl=angle-egl`.

## Структура
```
.
├── CLAUDE.md                  орієнтир для Claude (тонкий; деталі — за посиланнями)
├── UNIVERSAL_VIDEO_PROMPT.md  процес «як довести відео до ідеалу»
├── COWORK.md                  робота НЕ в Claude Code (Cowork/Desktop Commander)
├── newproject.ps1             новий проєкт (скелет + junctions)
├── setup.bat / setup.sh       встановлення
├── scripts/                   render·mix·concat·preflight·contactsheet·voicetiming·inventory·benchmark
├── .claude/
│   ├── commands/              slash-команди (/render, /sheet, /mix …)
│   └── skills/                video-pipeline (процес) + remotion (правила API)
├── _template/                 lean-скелет проєкту (src + CLAUDE.md + PROGRESS.md)
├── _ASSETS/
│   ├── node_modules/          СПІЛЬНИЙ стор (ціль junction; оновити — _install.bat)
│   ├── kit/                   ⭐ СПІЛЬНИЙ рушій (один на всіх) — див. kit/README.md
│   ├── remotion_templates/    шаблони сцен + wow-ефекти (index.json)
│   ├── broll/                 спільна b-roll бібліотека за категоріями (broll.py + _index.json)
│   └── fonts/ · music/        спільні ассети (у міру наповнення)
├── incoming/                  сировина від клієнта (gitignored — конфіденційно)
└── <YourProject>/             папка проєкту (junctions — лише Windows; перенесення — /archive)
```

## Вимоги
- **Node.js ≥ 20** — https://nodejs.org · **FFmpeg** — Win: https://www.gyan.dev/ffmpeg/builds/ · `apt install ffmpeg` · `brew install ffmpeg`
- **Python 3** (+ `py` launcher на Windows) — для `broll`/`voicetiming`/`inventory`; **Whisper** (`pip install -U openai-whisper`) — для субтитрів.
- **Claude Code** — основне середовище. Cowork/Desktop Commander — опціонально (`COWORK.md`).
- **API ключі** (опціонально, лише для `/broll`): [Pexels](https://www.pexels.com/api/), [Pixabay](https://pixabay.com/api/docs/) — у `.env`.

## Ліцензія
MIT (`LICENSE`) — на код і документацію проєкту. Стороннє — під своїми ліцензіями: Remotion (через npm; компаніям може знадобитися ліцензія — remotion.dev/license), b-roll Pexels/Pixabay (у репо НЕ входить — завантажується `/broll`), `_ASSETS/remotion_templates/` (MIT).
