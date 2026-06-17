# _ASSETS/kit — ОБЩИЙ движок (один на все проекты)

Brand-agnostic компоненты/хелперы Remotion. Цвет/шрифт — через пропсы или нейтральные дефолты (графит + синий акцент).
Под-проекты цепляют junction `src/kit → _ASSETS/kit` (ставит `newproject.ps1`). Импорт в сценах: `from '../kit/<файл>'`.
⚠️ Чинишь баг здесь → меняется во ВСЕХ проектах. Бренд (`colors.ts`/`fonts.ts`) — НЕ здесь, он per-project в `<Project>/src/utils/`.

## Компоненты
| файл | что |
|---|---|
| `smooth.ts` | плавность: `smoothIn/smoothSettle/smoothLerp/motionBlur/fadeInLong/fadeOutLong/smoothCounter/drift` + анти-дёрг клампы |
| `anim.ts` | spring-хелперы (`springIn`, `kenBurnsScale`, `stagger`, `pulse`…) |
| `BrandBG.tsx` | `BrandBG` (тона, дефолт графит) · `BrollBG` (видео+tint) · `ParticleField` (dust/sparks/fireflies/snow) · бурсты `SmokeBurst/ConfettiBurst/StarBurst` · `LensFlare/GodRays/LeafFall/EnergyBeam/FoodCard` · `cameraShake` |
| `Shatter.tsx` | стеклянные осколки (сборка/распад), детерминированный сид |
| `WriteOnText.tsx` | write-on текст по clip-path |
| `CtaButton.tsx` | neon CTA — пропсы `accent`/`font` (передавай `C.accent`, `FONT`) |
| `Logo.tsx` | watermark (проп `src`, default `logo_watermark.png`) |
| `SceneBadge.tsx` | цифра-бейдж сцены (для фидбэка; на финал убрать) |
| `Captions.tsx` | субтитры из `captions.json` (TikTok-style, активное слово акцентом); пропсы `src/accent/font/bottom` |

## Брендирование (≈2 мин)
1. `src/utils/colors.ts` — `C.accent` (+ `bgA/B/C`) под клиента.
2. `src/utils/fonts.ts` — `FONT` (через `@remotion/google-fonts` или вшить TTF base64).
3. `public/logo_watermark.png` — лого клиента (source ≥1280px).
Логотип клиента кладёшь свой в `public/logo_watermark.png` — клиентских ассетов в общих шаблонах нет.

## Паттерны движка
- **MainComp**: массив `SCENES: [from, dur][]` + умный cross-fade `overlapFor()` + продление финала.
- **Заморозка** утверждённых сцен — через ffmpeg `concat` (`/concat`), НЕ перерендеривать.
- **2-фазная сцена** (анти-слайдшоу): фаза A → cross-element fade 12–16 кадров → фаза B на общем фоне.

⚠️ Запрещённые эффекты: expanding rings / pulsing circles / shockwave. `SmokeBurst` — мягкое смещённое облако с blur, НЕ shockwave-ring.

> Видео в сценах — `<OffthreadVideo>` (не старый `<Video>`). Тяжёлый статичный `BrandBG` → пре-рендер в PNG (`remotion still`).
> Процесс производства и команды — навык `video-pipeline`.
