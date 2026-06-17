# Рендер, ffmpeg и постобработка (детали)

> Команды печатать не нужно — всё в `scripts/` и slash-командах. Здесь — что под капотом и когда что применять.

## Профили рендера (`/render`; флаги в `scripts/_env.ps1`)
| Профиль | Когда | Суть |
|---|---|---|
| `smoke` | проверить что компилится (секунды) | 30 кадров, scale 0.4, ultrafast |
| `preview` | итерации правок (минуты) | 1080p, scale 1.0, crf 22, ultrafast, png, yuv420p |
| `final` | по утверждению превью | 4K (scale 2.0), crf 14, slow, bt709; авто-версия `v1_/v2_` + авто-preflight |

- **concurrency**: подбери `/benchmark` (эмпирически под машину), впиши в `_env.ps1`. 4K@16GB: 12 → OOM «memory allocation failed», начинай с 8 (~1.3 ГБ/worker).
- **Честно про 4K**: текст/SVG/градиенты при scale=2 — реально 4K-чёткие; b-roll/фото из 1080p-источника — upscaled (детали не появятся). «Mostly real 4K».
- **Длинный рендер** — в фоне, лог `out/_render.log`. Поллер ждёт маркер конца:
  `until grep -qE "MB$|kB$" out/_render.log 2>/dev/null && [ -s out/v1_final_4k.mp4 ]; do sleep 60; done`
- **Один кадр (vision)**: `npx remotion still src/index.ts Main out/f.png --frame=N --gl=angle-egl` → Read PNG.
- **Studio (живой превью)**: `npx remotion studio src/index.ts --gl=angle-egl` (http://localhost:3000).
- **blur ≤20px**: большой blur + scale + Ken Burns одновременно → freeze-кадры на слабой GPU.

## Заморозка утверждённых сцен (НЕ перерендеривать)
Утверждённую сцену держи мастер-копией; в финал — через `/concat` (ffmpeg concat + опц. lanczos-upscale до целевого разрешения + домешать голос AAC 192k). Перерендер утверждённого = риск регресса и потеря часов. Нарезка финала на сцены (frame-accurate): `ffmpeg -ss from/fps -t dur/fps … -crf 14`.

## Звук (`/mix`)
Голос + музыка с авто-ducking (музыка приглушается под голос через `sidechaincompress`), затем программная громкость `loudnorm` (−14 LUFS YouTube / −16 Instagram). Только голос → нормализация. После микса автоматически прогоняется preflight.
- Одно-проходный `loudnorm` точен до ±1 LUFS; на простом тоне preflight может ругаться, на реальной речи обычно ок — при необходимости прогони `/mix` ещё раз.

## Доп. постобработка (вручную, если стиль требует)
- **LUT** (киноцвет): `-vf lut3d=file=name.cube`.
- **Film grain** (киношность): overlay зерна `blend=screen`.
- **Light leaks** (тёплые сцены): overlay `screen`.
Добавляй к выходу `/mix` отдельным ffmpeg-проходом; путь ffmpeg — в `scripts/_env.ps1` (`$FFMPEG`).

## Pre-flight (`/preflight`) — что проверяет
Длительность (vs ТЗ) · чёрные кадры (`blackdetect`) · фриз-сегменты (`freezedetect`) · интегральную громкость (`ebur128` vs цель). Ручное перед отдачей: посмотри с выключенным звуком (80% соцсетей смотрят без звука → нужны субтитры, см. `/timing --captions`), послушай на телефоне.

## Сервер-сайд рендер: видео-входы
ТОЛЬКО 30fps (Pexels часто 25 → `ffmpeg -i in -r 30 out`). Тяжёлый `<Video>`-фон → `<Img>` со still-кадром либо `<OffthreadVideo>`.

### ⚠️ `<OffthreadVideo>`, не `<Video>` (урок прошлого проекта C2, 2026-05-23)
Старый `<Video>` из `remotion` при `--concurrency>1` РАНДОМНО отдаёт пустые кадры (воркеры не успевают декодировать через Chrome) → **моргание** «есть BG → нет BG». Перекодирование в intra-only (`-g 1 -keyint_min 1`) НЕ помогает — корень не в кейфреймах. Решение: `import {OffthreadVideo} from 'remotion'` (декод через ffmpeg вне Chrome, API идентичный). Память велит OffthreadVideo, пока тест не докажет обратное — новый `<Video>` из `@remotion/media` НЕ проверен на этой связке.

Диагностика моргания:
```bash
ffmpeg -i out.mp4 -vf "tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -an -f null - 2>&1 | grep YAVG | head -20
```
YAVG скачет ~1 → ~24+ между соседними кадрами = баг `<Video>`. После `<OffthreadVideo>` все YAVG плавные (0.2–3.0).

## Форматы вывода и спец-возможности (сверх обычного mp4)
- **Прозрачное видео (alpha)** — для оверлеев/lower-thirds поверх другого монтажа: WebM (`--codec=vp9 --pixel-format=yuva420p`) или ProRes 4444 (`--codec=prores --prores-profile=4444`), плюс `--image-format=png`.
- **ProRes-мастер** для монтажёров/клиента: `--codec=prores` (профили proxy…4444-xq).
- **Только аудио**: `--codec=mp3|wav|aac`. **GIF**: `--codec=gif` (без звука).
- **Premount/prefetch** тяжёлых ассетов — старт сцены без подвисаний (`premountFor` у `<Sequence>`, `prefetch()`).
- **Data-driven / Zod** — длительность и пропсы из данных (`calculateMetadata`); Zod-схема даёт форму правки в Studio (брендируемые шаблоны).
- Новый `<Video>` из `@remotion/media` — экспериментальный (WebCodecs), будущий дефолт; пока держим `<OffthreadVideo>`.

## Cowork / песочница
Работаешь НЕ в Claude Code (Cowork/Desktop Commander/Linux-песочница)? Все квирки (PATHEXT, cmd.exe, short-name, рендер чанками, swangle) — в `COWORK.md` корня.
