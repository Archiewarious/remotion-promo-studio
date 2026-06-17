# 🎬 Remotion Templates & Effects — каталог

> Коллекция Remotion-шаблонов и эффектов. Источники: официальные примеры Remotion + reactvideoeditor (MIT).
> Шаблоны — чистые Remotion-хуки (`useCurrentFrame`, `interpolate`, `spring`), самодостаточные.
> ⚠️ Это **стартовые сниппеты под адаптацию**, не drop-in. Как адаптировать под бренд — `.claude/skills/video-pipeline/references/templates.md`.

## 📂 Структура
- `wow_effects/` — 🔥 12 сложных «вау»-эффектов (частицы, дисторсия, 3D, глитч…). См. `wow_effects/README.md`.
- `templates/` — 82 готовых сниппета (reactvideoeditor, MIT) + `scene-transitions` (TransitionSeries). Каждый = 1 `.tsx`.
- `official/` — официальные примеры Remotion (spring-loaded, morph-text).
- `code/` — официальные ассеты из `remotion-dev/skills` (typewriter, word-highlight, bar-chart).
- `rules/` — локально только `videos.md`. Остальные правила Remotion (36 шт) — в `.claude/skills/remotion/rules/`.

## 🔑 Как использовать
1. Посмотри сниппет: `/preview-template <name>` → PNG.
2. Скопируй `.tsx` в `src/scenes/`, подставь бренд (`C.*`/`FONT`) + свои ассеты (`staticFile`).
3. Вставь в `<Sequence>`/`<TransitionSeries.Sequence>` с нужным `from`/`durationInFrames`.
4. Проверь `/studio` или `/still`. Подробно — `references/templates.md`.

## ⭐ Шкала
⭐⭐⭐⭐⭐ премиум · ⭐⭐⭐⭐ отличный · ⭐⭐⭐ добротный рабочий приём.

---

## 🅰️ Анимация текста (kinetic typography)
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **stat-counter** | ⭐⭐⭐⭐⭐ | Счётчик count-up (0→N) + spring-вход + подпись. |
| **text-highlight** | ⭐⭐⭐⭐ | Слова по очереди, ключевое — фоном-маркером. |
| **typewriter-subtitle** | ⭐⭐⭐⭐ | Печатная машинка по буквам + курсор. |
| **glitch-text** | ⭐⭐⭐⭐⭐ | Глитч-искажение (RGB-сдвиг, дёрганье). |
| **bounce-text** | ⭐⭐⭐⭐ | Буквы впрыгивают с отскоком (spring). |
| **bubble-pop-text** | ⭐⭐⭐⭐ | Слова «лопаются» как пузыри. |
| **floating-bubble-text** | ⭐⭐⭐ | Текст плавает как в воде. |
| **slide-text** | ⭐⭐⭐ | Текст въезжает со сдвигом. |
| **popping-text** | ⭐⭐⭐⭐ | Слова «выскакивают» масштабом+spring. |
| **pulsing-text** | ⭐⭐⭐ | Пульсация (привлечение внимания). |
| **title-split** | ⭐⭐⭐⭐ | Заголовок разъезжается из центра. |
| **animated-text** | ⭐⭐⭐ | Базовое появление текста. |
| **chapter-title** | ⭐⭐⭐⭐ | Кинематографичная плашка раздела. |
| **write-on-clip-path** | ⭐⭐⭐⭐⭐ | «Написанный рукой» — clip-path reveal с диагональным фронтом (имитация пера) + tilt + settle. Лучше letter-by-letter (нет «вспышек» букв). Рукописные шрифты → правдоподобнее. |

## 🅱️ Лого / интро / финал
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **logo-stroke-draw** | ⭐⭐⭐⭐⭐ | Лого прорисовывается по контуру (stroke-dashoffset). |
| **logo-blur-reveal** | ⭐⭐⭐⭐ | Лого проявляется из размытия. |
| **logo-glitch-reveal** | ⭐⭐⭐⭐⭐ | Лого собирается через глитч. |
| **logo-bounce-drop** | ⭐⭐⭐⭐ | Лого падает с отскоком. |
| **logo-scale-rotate** | ⭐⭐⭐⭐ | Лого вкручивается (масштаб+поворот). |
| **logo-spin-reveal** | ⭐⭐⭐ | Лого с вращением. |
| **logo-split-reveal** | ⭐⭐⭐⭐ | Лого собирается из двух половин. |
| **logo-fade-reveal** | ⭐⭐⭐ | Плавное появление. |
| **logo-typewriter** | ⭐⭐⭐ | Лого «печатается». |
| **cinematic-title-intro** | ⭐⭐⭐⭐⭐ | Кино-интро: буквы, блики, движение камеры. |
| **end-card** | ⭐⭐⭐⭐ | Финальная карточка с CTA/контактами. |
| **subscribe-reminder** | ⭐⭐⭐ | Напоминание подписаться/кнопка. |
| **quote-card** | ⭐⭐⭐⭐ | Карточка цитаты. |
| **lower-third** | ⭐⭐⭐⭐⭐ | Нижняя плашка (имя/титул), ТВ-стиль. |
| **notification-pop** | ⭐⭐⭐⭐ | Всплывающее уведомление/CTA. |

## 🖼️ Картинки / фото / видео
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **ken-burns** | ⭐⭐⭐⭐⭐ | Медленный пан+зум по фото (документальный). |
| **image-zoom-reveal** | ⭐⭐⭐⭐ | Фото открывается с зумом. |
| **parallax-pan** | ⭐⭐⭐⭐⭐ | Параллакс-пан (глубина из плоского фото). |
| **photo-stack** | ⭐⭐⭐⭐ | Фото складываются стопкой. |
| **gallery-grid** | ⭐⭐⭐⭐ | Сетка фото с анимацией. |
| **masonry-gallery** | ⭐⭐⭐⭐ | Кладка-галерея (Pinterest-стиль). |
| **image-carousel** | ⭐⭐⭐ | Карусель изображений. |
| **rotating-carousel** | ⭐⭐⭐⭐ | 3D-карусель по кругу. |
| **image-comparison-slider** | ⭐⭐⭐ | До/после слайдером. |
| **picture-in-picture** | ⭐⭐⭐ | Картинка в картинке. |
| **polaroid-frame** | ⭐⭐⭐⭐ | Фото в рамке полароида. |
| **spotlight-reveal** | ⭐⭐⭐⭐ | Свет-прожектор открывает контент. |
| **letterbox-reveal** | ⭐⭐⭐⭐ | Кино-полосы открывают кадр. |
| **split-screen** | ⭐⭐⭐⭐ | Экран делится на части. |

## 🔀 Переходы между сценами
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **scene-transitions** | ⭐⭐⭐⭐⭐ | Готовый `TransitionSeries` (fade→slide→wipe) — основа переходов. |
| **whip-pan** | ⭐⭐⭐⭐⭐ | Резкий смаз-проводка (поворот камеры). |
| **clock-wipe** | ⭐⭐⭐⭐ | Круговое открытие (стрелка часов). |
| **iris-transition** | ⭐⭐⭐⭐ | Открытие/закрытие «диафрагмой». |
| **zoom-through** | ⭐⭐⭐⭐⭐ | Пролёт сквозь объект в новую сцену. |
| **morph-transition** | ⭐⭐⭐⭐⭐ | Перетекание форм. |
| **pixel-transition** | ⭐⭐⭐⭐ | Пиксельный распад. |
| **blinds-transition** | ⭐⭐⭐ | Жалюзи. |
| **push-transition** | ⭐⭐⭐ | Выталкивание сценой. |
| **slide-wipe** | ⭐⭐⭐ | Слайд-вытеснение. |
| **cross-dissolve** | ⭐⭐⭐ | Плавное растворение. |
| **fade-through-black** | ⭐⭐⭐⭐ | Затемнение через чёрный (между блоками). |
| **liquid-wave** | ⭐⭐⭐⭐⭐ | Жидкая волна-переход. |

## ✨ Фоны / частицы / атмосфера
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **particle-explosion** | ⭐⭐⭐⭐⭐ | Взрыв частиц (акцент). |
| **bokeh-circles** | ⭐⭐⭐⭐ | Боке-круги (мягкое размытие огней). |
| **starfield** | ⭐⭐⭐⭐ | Звёздное поле/пролёт. |
| **matrix-rain** | ⭐⭐⭐⭐ | Матрица-дождь. |
| **gradient-shift** | ⭐⭐⭐⭐ | Плавно меняющийся градиент-фон. |
| **geometric-patterns** | ⭐⭐⭐⭐ | Геометрические паттерны. |
| **grid-pulse** | ⭐⭐⭐ | Пульсирующая сетка (техно). |
| **liquid-wave** | ⭐⭐⭐⭐ | Волны жидкости. |
| **noise-grain** | ⭐⭐⭐⭐ | Плёночное зерно (overlay). |
| **film-burn** | ⭐⭐⭐⭐⭐ | Засветка/прожог плёнки. |
| **vignette-pulse** | ⭐⭐⭐ | Пульсирующая виньетка (фокус в центр). |
| **camera-shake** | ⭐⭐⭐⭐ | Тряска камеры (энергия/удар). |
| **zoom-pulse** | ⭐⭐⭐⭐ | Пульс-зум (под бит). |
| **sound-wave** | ⭐⭐⭐ | Звуковая волна-визуализатор. |

## 📊 Графики / цифры / прогресс
| Шаблон | ⭐ | Что делает |
|--------|----|-----------|
| **stat-counter** | ⭐⭐⭐⭐⭐ | Счётчик чисел (count-up). |
| **circular-progress** | ⭐⭐⭐⭐⭐ | Круговой прогресс-индикатор %. |
| **progress-bars** | ⭐⭐⭐⭐ | Анимированные полосы прогресса. |
| **progress-steps** | ⭐⭐⭐⭐ | Шаги-этапы с заполнением. |
| **line-chart / area-chart** | ⭐⭐⭐⭐ | Линейный / площадной график. |
| **donut-chart / pie-chart** | ⭐⭐⭐⭐ | Кольцевая / круговая диаграмма. |
| **comparison-chart** | ⭐⭐⭐⭐ | Сравнительный график. |
| **chart-animation** | ⭐⭐⭐⭐ | Общая анимация графика. |
| **countdown-timer / countdown-intro** | ⭐⭐⭐⭐ | Таймер обратного отсчёта / 3-2-1. |
| **animated-list** | ⭐⭐⭐ | Список с появлением пунктов. |
| **credits-roll** | ⭐⭐⭐ | Бегущие титры. |

## ✨ Официальные примеры (official/ + code/)
| Файл | ⭐ | Что делает |
|------|----|-----------|
| **official/spring-loaded-Logo.tsx** | ⭐⭐⭐⭐⭐ | Apple-style spring-loaded анимация лого (Jonny Burger). Эталон пружинной физики. |
| **official/morph-text.tsx** | ⭐⭐⭐⭐⭐ | Морфинг текста (слова перетекают). |
| **code/text-animations-typewriter.tsx** | ⭐⭐⭐⭐ | Офиц. typewriter (string slicing — правильный способ). |
| **code/text-animations-word-highlight.tsx** | ⭐⭐⭐⭐ | Офиц. подсветка слова «маркером». |
| **code/charts-bar-chart.tsx** | ⭐⭐⭐⭐ | Офиц. растущий бар-чарт. |

## 📜 Правила Remotion — что важно (в `.claude/skills/remotion/rules/`; локально только `videos.md`)
- **transitions.md** — TransitionSeries, fade/slide/wipe/flip/clockWipe. ⭐обязательно.
- **timing.md** — interpolate/spring/easing. ⭐обязательно.
- **text-animations.md** — паттерны текста (string slicing, не per-char opacity).
- **light-leaks.md** — световые засветки-переходы.
- **images.md / videos.md** — работа с `<Img>` / `<OffthreadVideo>`.
- **sequencing.md** — Sequence/Series. **audio-visualization.md** — визуализация звука.
- **google-fonts.md** — подключение шрифтов. **3d.md** — Three.js. **tailwind.md**.

## Источники
- Ресурсы Remotion: https://www.remotion.dev/docs/resources · правила: https://github.com/remotion-dev/skills
- 82 шаблона (MIT): https://github.com/reactvideoeditor/remotion-templates
- spring-loaded: https://github.com/JonnyBurger/spring-loaded · morph-text: https://github.com/remotion-dev/morph-text
- Доп. библиотеки сообщества: remocn, remotion-animated (см. resources).
