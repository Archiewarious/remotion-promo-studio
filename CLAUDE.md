# CLAUDE.md — воркспейс «Про видео» (видеомонтаж на Remotion v4)
# Качество > всё. Затем — скорость правок/рендера. Минимум контекста, минимум ручных команд, минимум текста в ответах.

Рабочая папка фриланс-монтажёра: клиент даёт ТЗ → готовое промо на Remotion v4.
Среда — **Claude Code на Windows** (Bash через Git Bash; кириллица в пути `Про видео` — OK). 16 ГБ RAM.

## С чего начать
- **Знакомство (первое касание).** Если пользователь только пришёл и НЕ дал конкретную задачу
  (приветствие · «что это?» · «что умеешь?» · «/start» · «с чего начать»), кратко представь проект
  по `WELCOME.md` на языке пользователя: что это, что можно, опц. ключи Pexels/Pixabay + как добавить,
  как сформулировать запрос на видео. Задача уже дана — НЕ разворачивай онбординг, просто делай.
  Дальше окружение готовь сам, подстраиваясь под ОС пользователя (см. bootstrap ниже) — веди за руку,
  не вали команды; что нельзя поставить молча (node/ffmpeg) — подскажи как. Сборка видео = навык
  `video-pipeline` (процесс — `UNIVERSAL_VIDEO_PROMPT.md`).
- **Свежий клон** (нет `_ASSETS/node_modules`) или просьба «настрой воркспейс» → bootstrap:
  Windows — `_ASSETS\_install.bat`; Linux/macOS — `cd _ASSETS && npm install`. Затем проверь `ffmpeg`/`node`/`py`.
- **Делаем или правим видео** → навык **`video-pipeline`**: он ведёт весь пайплайн и сам подтягивает
  процесс/движок/правила Remotion по мере надобности. Не тащи эти знания в контекст заранее.
- **Новый проект** → `/newvid Name` (или `powershell -File newproject.ps1 Name`; имя — латиницей).

## Архитектура (инварианты — их не вывести из кода, помни)
- **Движок ОДИН на все проекты** — `_ASSETS/kit/` (brand-agnostic: BrandBG+FX, Shatter, WriteOnText,
  CtaButton, Logo, smooth/anim). В проект — junction `src/kit`, импорт `from '../kit/...'`.
  ⚠️ Правишь баг в `_ASSETS/kit` — меняется во ВСЕХ проектах.
- **`node_modules` — общий** junction → `_ASSETS/node_modules` (`newproject.ps1` ставит оба junction;
  обновить стор — `_ASSETS/_install.bat`).
- **Бренд — per-project**: `src/utils/{colors,fonts}.ts` + `public/logo_watermark.png`.
- **Движок = ИНСТРУМЕНТ, read-only из проекта.** Из проектного чата правь ТОЛЬКО своё: `src/scenes`, `src/utils`, `public/`, `Root.tsx`, `*.md`.
  `src/kit` · `node_modules` · `scripts/` · `.claude/skills|commands` — общий движок (junction!); правка ломает ВСЕ проекты. В этом воркспейсе её
  ловит опциональный хук-страж `scripts/hooks/engine_guard.py` (включается в `.claude/settings.local.json`). Осознанно правишь движок → сессия с `ENGINE_EDIT=1`.
- ⚠️ Проект с junction НЕ переносим на др. ПК: перед архивом сделать автономным
  (`rmdir` оба junction → `npm install` + скопировать `_ASSETS/kit` внутрь).

## Где что (открывай по нужде — progressive disclosure)
| Нужно | Где |
|---|---|
| Команды рендера/звука (единый источник флагов) | `scripts/` + slash: `/render /studio /still /sheet /preflight /mix /concat /reframe /timing /inventory /broll /benchmark /archive` |
| Процесс «довести видео до идеала» | `UNIVERSAL_VIDEO_PROMPT.md` |
| Движок: что готово | `_ASSETS/kit/README.md` |
| Правила Remotion (API) | навык `remotion-best-practices` + `.claude/skills/remotion/rules/` |
| Библиотека сцен (82 шаблона + 12 wow) | `_ASSETS/remotion_templates/index.json` |
| Дефолтный (нейтральный) бренд-скелет | `_template/src/utils/{colors,fonts}` |
| Работа НЕ в Claude Code (Cowork/DC) | `COWORK.md` |

## Твёрдые правила (всегда)
1. **ffmpeg** — добавлен в user PATH (`ffmpeg`/`ffprobe` зовутся напрямую в новых сессиях/терминалах). Скрипты всё равно используют абсолютный путь (`scripts/_env.ps1`) для переносимости (Cowork/др. ПК): `"C:/Program Files/Shutter Encoder/Library/ffmpeg.exe"`.
2. **MP4 не перезаписывать** — версии `v1_/v2_` (скрипты делают сами; плеер держит файл → EPERM).
3. **`scripts/*.ps1` — ASCII-only** (PS 5.1 без BOM ломает кириллицу в парсере). Русский — только в `.md`.
4. **Медиа** в `public/`, обращение `staticFile('name.ext')`, имена латиницей.
5. **Цифры/факты из ТЗ — проверять** (сайт клиента), не выдумывать.
6. Запрет-эффекты, тайминг, дисциплина сцен, финал — в навыке `video-pipeline` и `UNIVERSAL_VIDEO_PROMPT.md`.

## Память проекта
`<Project>/CLAUDE.md` (бриф/бренд/спека) + `<Project>/PROGRESS.md` (чеклист/лог) — обновлять по ходу.

## Стиль
Русский, кратко, без воды. Перед сложной работой — план (`AskUserQuestion`). Статус в чат — одной строкой.
