---
name: video-pipeline
description: Производство промо-видео в воркспейсе «Про видео» на Remotion v4 — пайплайн от ТЗ до готового 4K-ролика: общий движок (kit), скрипты рендера/звука, slash-команды, дисциплина качества. Использовать при создании или правке видео, сцен Remotion, тайминге озвучки, рендере и постобработке.
---

# Видео-пайплайн (Remotion v4, воркспейс «Про видео»)

Делаем максимально качественное промо из ТЗ клиента. Тяжёлые знания подгружай ПО МЕРЕ надобности (ссылки в разделе «Куда смотреть») — не держи всё в контексте сразу.

## Пайплайн (спина)
1. **Новый проект** — `/newvid Name`: lean-скелет + 2 junction (`node_modules`, `src/kit`→движок).
2. **Бренд** — `src/utils/{colors,fonts}.ts` (палитра/шрифт под клиента) + свой `public/logo_watermark.png` (≥1280px). Логотип = ассет клиента, кладёшь в проект; в общих шаблонах клиентских ассетов нет.
3. **Сценарий** — hook → message → CTA. Тексты сверять с ТЗ/сайтом клиента, не выдумывать.
4. **Озвучка → тайминг** — `/timing public/voice.mp3 [--captions]`: `durationInFrames` (в `Root.tsx`) + опц. субтитры. **Тайминг сцен ВСЕГДА из озвучки, не на глаз.**
5. **Ассеты** — `/inventory` (что в проекте) + общая b-roll библиотека `_ASSETS/broll/` (каталог `_index.json`). Догрузка: `/broll "query"` (Pexels/Pixabay → `_ASSETS/broll/<категория>/`), затем копируй нужное в `public/` и приведи к 30fps. Сначала переиспользуй, потом качай.
6. **Сцены** — `src/scenes/*.tsx`: движок `from '../kit/...'`, бренд `from '../utils/...'`. **Перед сценами прочитай процесс-инструкцию (ниже).**
7. **Контроль** — `/render preview` → `/sheet` (весь ролик одной картинкой, оцени глазами) → правки.
8. **Финал + звук** — `/render final` (4K, авто-preflight) → `/mix` → `/preflight`.
9. **Сборка/заморозка** — утверждённые сцены через `/concat` (НЕ перерендеривать).

## Куда смотреть (progressive disclosure — грузи только нужное)
- **Процесс до идеала** (читаемость>насыщенность, дисциплина сцен, темп/анимация, финал, оценка ≥9.5, петли возврата) → **`UNIVERSAL_VIDEO_PROMPT.md`** в корне воркспейса. ⬅️ читать ПЕРЕД написанием сцен.
- **Движок (kit)** — что готово → **`_ASSETS/kit/README.md`**.
- **Рендер / ffmpeg / постобработка** (профили, 4K-уроки, заморозка, ducking, LUT, grain, preflight) → **`references/render.md`**.
- **API Remotion** (interpolate, transitions, captions, audio, fonts, lottie…) → навык **`remotion-best-practices`** + `.claude/skills/remotion/rules/*` по нужде.
- **Шаблоны + арсенал Remotion** (как адаптировать сниппет под бренд, три уровня kit/шаблон/`@remotion`, пакеты сверх анимаций: transitions/shapes/audio-viz/motion-blur/Zod-параметризация) → **`references/templates.md`**. Каталог сниппетов — `_ASSETS/remotion_templates/index.json` (82 + 12 wow). ⚠️ Это стартовые сниппеты под адаптацию, не drop-in.

## Доп. возможности (по желанию, НЕ обязательный шаг)
- **Кастомная графика для сцены** — если нужен нестандартный СТАТИЧНЫЙ элемент, которого нет в `kit`/стоке (фактура или паттерн фона, орнамент, тайтл-арт, бейдж, абстрактный градиент-арт): навык `canvas-design` рисует его в PNG/PDF → положи в `public/` → вставляй в сцену `<Img src={staticFile('name.png')}/>`. Это инструмент под конкретную задачу, не этап пайплайна. Прозрачность/вырез фона при нужде — Adobe MCP `image_remove_background` или ffmpeg.
- **Аудио/видео по ссылке** — кинь ссылку, скачаю в `public/` через `yt-dlp` (ffmpeg в PATH):
  - аудио (макс.): `yt-dlp -f bestaudio -o "public/%(title)s.%(ext)s" "URL"` — нативный opus/m4a и есть максимум; для mp3 добавь `-x --audio-format mp3 --audio-quality 0`.
  - видео b-roll (макс.): `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "public/%(title)s.%(ext)s" "URL"` (до 4K/8K если есть). Для server-side рендера приведи к 30fps (`ffmpeg -i in -r 30 out`).
  «Максимум» = лучший поток источника (YouTube всё равно сжат), не мастер. Если ffmpeg не находится (старая сессия до рестарта / Cowork) — добавь `--ffmpeg-location "C:\Program Files\Shutter Encoder\Library\ffmpeg.exe"`. Расширенно — навык `music-downloader`. CC0-сток — Pixabay.

- **Субтитры (соцсети — 80% смотрят без звука):** `/timing public/voice.mp3 --captions` → `public/captions.json` → в сцене `import {Captions} from '../kit/Captions'`, `<Captions accent={C.accent} font={FONT}/>`.

## Команды (не печатать руками — вызывать)
`/newvid` · `/timing` · `/inventory` · `/broll` · `/render smoke|preview|final` · `/studio` · `/still` · `/preview-template` · `/sheet` · `/preflight` · `/mix` · `/concat` · `/reframe` · `/benchmark` · `/archive`
Все флаги рендера/звука — в `scripts/_env.ps1` (правишь один раз). Скрипты ASCII-only (PS 5.1 без BOM ломается на кириллице).

## Твёрдые правила (всегда)
- **Читаемость > насыщенность**: 1–2 смысловых элемента на экране; зритель успевает прочитать.
- **Текст = правда**: каждое слово на экране произнесено в озвучке или проверено у клиента.
- **Запрещённые эффекты**: никаких expanding rings / pulsing circles / shockwave.
- **Видео**: `<OffthreadVideo>` (не старый `<Video>`); статичный тяжёлый `BrandBG` → пре-рендер в PNG (`remotion still`).
- **Медиа** в `public/`, обращение `staticFile('name.ext')`, имена латиницей; видео-входы 30fps.
- **MP4 не перезаписывать** — версии `v1_/v2_` (скрипты делают сами).
- **Финал**: элементы отстаиваются ≥1с, затем медленный fade; лого из source ≥1280px.

## Цикл качества
ДУМАЙ → СДЕЛАЙ → ПОСМОТРИ (`/sheet` + один кадр `remotion still`) → ОЦЕНИ → УЛУЧШИ. Порог — «дорого + спокойно + читаемо», ≥9.5.
