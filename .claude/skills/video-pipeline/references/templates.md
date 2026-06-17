# Шаблоны и арсенал Remotion (подбор · адаптация · из чего строить)

## Три уровня — не путать
1. **Движок `_ASSETS/kit/`** — НАШ переиспользуемый брендируемый слой (smooth/anim/BrandBG/Captions/CtaButton/Logo/…). Используем в каждом проекте. **Растёт**: переиспользовал анимацию в 2+ проектах → вынеси её сюда (brand-agnostic, цвет/шрифт пропсами).
2. **Библиотека `_ASSETS/remotion_templates/`** — 82 сниппета (reactvideoeditor, MIT) + 12 wow. Это **стартовые примеры под адаптацию**, не drop-in модули. Каталог — `index.json`.
3. **Пакеты `@remotion/*`** — строительные блоки (см. «Арсенал»). Сложную анимацию правильнее собрать из них, чем писать с нуля.

## Будет ли шаблон работать в проекте?
- **96/99 — настоящий frame-based Remotion** (`useCurrentFrame`), импортируют только core `remotion` → копируешь в `src/scenes/` и **рендерится корректно** (наш fps 30 совпадает с их допущением).
- НО они **самодостаточные**: хардкод цветов/шрифтов/размеров. «Рендерится» ≠ «в бренде» → **адаптируй** (ниже).
- `"use client"` в начале файла — безвредный Next-артефакт, Remotion его игнорирует.
- ⚠️ **В Remotion НЕ работают** (рендерятся неверно): CSS-анимации (`@keyframes`, `animation:`, `<style jsx>`), Next.js (`next/image`). Были 3 таких — `ken-burns / parallax-pan / zoom-pulse` — **переписаны на frame-based**. Если берёшь чужой сниппет с `@keyframes` — переведи на `useCurrentFrame`+`interpolate`.

## Адаптация шаблона (procedure)
0. **Посмотри глазами** до адаптации: `/preview-template <name>` → PNG в `_ASSETS/remotion_templates/_previews/`.
1. Скопируй `.tsx` в `<Project>/src/scenes/`.
2. Цвета/шрифт → бренд: hex → `C.*` (`from '../utils/colors'`), шрифт → `FONT` (`from '../utils/fonts'`).
3. Медиа → в `public/`, ссылка `staticFile('name')` (не внешние URL; `next/image`→`<Img>`, видео→`<OffthreadVideo>`).
4. Длительность задаёт `<Sequence>`/комп, не CSS-`duration`. Тайминг — из озвучки.
5. Проверь глазами: `/studio` (живой) или `/still <frame>`. Переиспользуешь в 2+ проектах → вынеси в `kit`.

## Арсенал Remotion сверх анимаций (`npx remotion add <x>`)
Уже в сторе: `captions`, `lottie`, `media-utils`, `player`, `zod-types`.
Стоит доставить (⭐ — под промо): ⭐`transitions` (`TransitionSeries` — переходы сцен) · ⭐`animation-utils` (`interpolateStyles`/`makeTransform`) · ⭐`google-fonts` (типобезопасные шрифты; нужно 2 шаблонам в `code/`) · ⭐`shapes` (SVG-фигуры) · `paths` (морф/draw-on SVG) · ⭐`motion-blur` (`Trail`/`CameraMotionBlur`) · ⭐`layout-utils` (`measureText`/`fillTextBox` — авто-вписывание текста/титров) · ⭐`gif` (`<Gif>` по таймлайну) · `three` (3D) · `skia` (GPU-канвас) · `rive`.

Возможности (не «сниппеты»):
- **Audio-viz** — `visualizeAudio` + `getAudioData` (из `media-utils`) → бары/волны под реальный звук.
- **Параметризация (Zod)** — `schema` + `defaultProps` → Studio строит форму (правка текста/цветов вживую). Основа брендируемых шаблонов.
- **Data-driven** — `calculateMetadata`: длительность/пропсы из данных или озвучки до рендера.
- **Recorder** — запись экрана+камеры → программный монтаж (для talking-head промо).
- **Player** — встроить интерактивное превью в веб. **Lambda/CloudRun** — облачный рендер (нужен AWS/GCP, платно).

## Где взять ещё реальных шаблонов (проверено, MIT)
- ⭐ **remocn** — https://github.com/kapishdima/remocn (380★, shadcn-стиль): глитч-текст, matrix-decode, mesh-gradient, хром-аберрация, glass code, product-трейлеры. Тащить пер-проект: `npx shadcn@latest add @remocn/<name>`.
- **remotion-bits** (0.2.0) — ⚠️ НЕ адаптирован: не собирается из коробки (нет dep `culori`; барель `export *` тянет three/Scene3D). Если нужен — ставь пер-проект и чини deps (`npm i remotion-bits culori`), проверь рендером. Репо: https://github.com/av/remotion-bits.
- **remotion-animated** — декларативный `<Animated/>`: https://github.com/stefanwittwer/remotion-animated.
- **Офиц. шаблоны-проекты** `npx create-video@latest`: ⭐tiktok (субтитры), ⭐audiogram, ⭐music-visualization, code-hike (аним. код), three (3D), skia (GPU), still, overlay (lower-thirds). Полные примеры под изучение/копирование.
- **Эффекты точечно** (MIT): GL-переходы `remotion-dev/remotion-gl-transitions` + `degueba/onda` (18 шт); глитч `storybynumbers/remotion-glitch-effect`; морф текста `remotion-dev/morph-text`; bar-race `hylarucoder/remotion-bar-race-chart`; 3D-частицы `JonnyBurger/three-particles`.
- Канонический индекс источников: https://www.remotion.dev/docs/resources.
- ⚠️ Лицензия Remotion: компании 4+ чел. — платная Company License (remotion.dev/license). Перечисленный код — MIT.
