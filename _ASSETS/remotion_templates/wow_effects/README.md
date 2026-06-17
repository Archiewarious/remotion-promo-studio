# 🔥 WOW EFFECTS — сложные «вау» графические эффекты для Remotion

> Реальные рабочие компоненты сложной графики (написаны под Remotion, детерминированы по `frame`,
> рендерятся покадрово). ✅ Все 12 прошли компиляцию esbuild (TS/JSX OK).
>
> Техники: Canvas-системы частиц, SVG feTurbulence/feDisplacement (дисторсия), CSS 3D-перспектива,
> хроматическая аберрация, flow-field (векторное поле-ветер), морфинг частиц, неон-свечение.
> GLSL-noise (`snoise.glsl`, `cnoise.glsl`) — референс-шейдеры для three.js-версий (если понадобится WebGL).

## Почему написаны заново, а не взяты готовыми
Топовые «вау»-эффекты в мире (Codrops/Tympanus, three.js GPGPU, dissolve) работают на WebGL/симуляциях
по реальному времени. Remotion рендерит **покадрово и детерминированно** — симуляция по времени даёт
рассинхрон. Поэтому эффекты переписаны на **frame-based математику**: позиция каждой частицы — функция
от номера кадра. Это гарантирует идентичный результат при рендере.

---

## Каталог (12 эффектов)

| # | Файл | Эффект | ⭐ | Техника | Когда применять |
|---|------|--------|----|---------|-----------------|
| 1 | `01-sand-disintegration.tsx` | **Рассыпание в песок** — текст/лого распадается в песчинки | ⭐⭐⭐⭐⭐ | Canvas + чтение пикселей + noise-разлёт + гравитация | уход слова/лого, драматичный переход |
| 2 | `02-particle-assemble.tsx` | **Сборка из частиц** — текст собирается из летящих частиц | ⭐⭐⭐⭐⭐ | Canvas + ease-out лёт к целевым пикселям | появление цифр/лого/CTA «из ниоткуда» |
| 3 | `03-flow-field-wind.tsx` | **Поток-ветер** — 1200+ частиц текут по векторному полю | ⭐⭐⭐⭐⭐ | Canvas + flow-field (value-noise углы) | атмосферный живой фон, дым, поток энергии |
| 4 | `04-liquid-text-distortion.tsx` | **Жидкий текст** — текст течёт/плавится | ⭐⭐⭐⭐⭐ | SVG feTurbulence + feDisplacementMap | органичный «живой» заголовок |
| 5 | `05-glitch-chromatic.tsx` | **Глитч + RGB-аберрация** — троение каналов, срезы | ⭐⭐⭐⭐⭐ | CSS слои mix-blend screen + slice clip | резкий удар, кибер-акцент |
| 6 | `06-3d-text-flythrough.tsx` | **Пролёт сквозь слова** — камера летит в глубину | ⭐⭐⭐⭐⭐ | CSS 3D perspective + translateZ | кинематографичное интро/переход |
| 7 | `07-shockwave-impact.tsx` | **Ударная волна** — кольца + вспышка + shake | ⭐⭐⭐⭐ | SVG кольца + spring + flash | ⚠️ **ЗАПРЕЩЁН** (shockwave/expanding rings) — НЕ использовать |
| 8 | `08-neon-handwriting.tsx` | **Неон-прорисовка** — текст пишется от руки + свечение | ⭐⭐⭐⭐⭐ | SVG stroke-dashoffset + drop-shadow glow | рукописные подписи, неон-вывеска |
| 9 | `09-particle-morph.tsx` | **Морфинг частиц** — форма A → форма B | ⭐⭐⭐⭐⭐ | Canvas + интерполяция точек + турбулентность | цифра→цифра, цифра→лого |
| 10 | `10-golden-bokeh-confetti.tsx` | **Золотое боке + конфетти** | ⭐⭐⭐⭐ | Canvas radial-gradient боке + конфетти-физика | финал, празднование, премиум-фон |
| 11 | `11-god-rays-light.tsx` | **Объёмные лучи света** — вращаются, пульсируют | ⭐⭐⭐⭐ | conic-gradient лучи + radial блик, screen | overlay на лого/B-roll, премиум-свет |
| 12 | `12-image-displacement-reveal.tsx` | **Появление фото через жидкое искажение** | ⭐⭐⭐⭐⭐ | SVG displacement (scale→0) + ken-burns зум | эффектный вход фото (awwwards-стиль) |

## Параметры
Каждый компонент принимает props (`text`/`color`/`startFrame`/`durationFrames` + спец-параметры).
Дефолты нейтральные — цвет/шрифт/тексты задаёшь под бренд проекта (`C.accent`, `FONT`).

## Как использовать
```tsx
import SandDisintegration from "./wow_effects/01-sand-disintegration";
<Sequence from={start} durationInFrames={dur}>
  <SandDisintegration text="YOUR TEXT" color="#fff" durationFrames={40} />
</Sequence>
```
- Эффекты с Canvas/SVG-фильтрами рендерятся в Remotion корректно (Chromium headless).
- Рукописный шрифт — подключи через `@remotion/google-fonts` (см. `.claude/skills/remotion/rules/google-fonts.md`).
- Тяжёлые (1,2,3,9 — Canvas с тысячами частиц) — следить за временем рендера; при нужде снизить плотность (`step`/`count`).

## Источники идей (мировой топ)
- Codrops/Tympanus: text→dust, Dissolve, GPGPU particles, Liquid distortion.
- three.js: GPGPU flow-field, particles morphing; dissolve.
- awwwards: liquid displacement reveals, RGB-split kinetic.
- Все адаптированы под frame-based рендер Remotion.
