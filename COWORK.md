# 📎 COWORK / Desktop Commander — режим работы НЕ через Claude Code

> Читать ТОЛЬКО если работаешь в **Cowork (Claude Desktop + Desktop Commander MCP)** или
> в **Cowork-песочнице (Linux, без GPU)**. В Claude Code НИЧЕГО отсюда не нужно — там прямой
> Bash + нативные tools (см. основной `CLAUDE.md`).
>
> Файл вынесен отдельно, чтобы НЕ засорять контекст Claude Code лишним. Подключай вручную,
> когда реально в Cowork.

---

## 1. ⚠️ ФИКС окружения DC — без него команды НЕ находятся
DC стартует shell с битым **`PATHEXT=.CPL`** → голые `node/npm/npx/remotion/robocopy/tasklist/cmd`
не работают (даже из System32). PATH при этом полный.
**Первой строкой каждого .bat:**
```
set PATHEXT=.COM;.EXE;.BAT;.CMD
```
После этого всё работает по имени. Исключение: **ffmpeg НЕ в PATH** → всегда абсолютный путь
`C:\Program Files\Shutter Encoder\Library\ffmpeg.exe`.

## 2. Правила работы через DC (проверено)
- **Запуск bat:** `cmd.exe /c C:\Users\<you>\Desktop\A310~1\<Проект>\X.bat` — именно `cmd.exe`
  (не `cmd`), путь short-name `A310~1` (= «Про видео», без пробелов/кириллицы).
- **Вывод процесса ловить редиректом ВНУТРИ bat** (`команда >> out\_log.txt 2>&1`).
  DC `read_process_output`=0; PowerShell-уровневый `cmd.exe /c bat > file` вывод ТЕРЯЕТ.
- **Проверять результат:** DC `read_file` (реальный диск, истина) или sandbox `cat`
  (CP866: `iconv -f CP866`). ⚠️ sandbox-маунт иногда отдаёт устаревший/обрезанный кэш —
  спорное перепроверять через DC.
- **Sandbox не видит сквозь Windows-junction** → node_modules проверять через DC / `dir` в bat.
- DC `list_directory` и `list_processes` отдают мусор → в bat `dir /b` и `tasklist`.
- **Кириллица** в путях ломает cmd-аргументы и относительные `..` → везде абсолютные short-name `A310~1`.
- **Большой файл** (.md/.tsx) писать через DC `write_file` чанками ≤30 строк
  (не harness-Edit — на кириллице может обрезать).
- **Vision:** в Cowork оценка кадра — отрендерить PNG → скопировать в `outputs` → прочитать Read-tool'ом.

## 3. Команды (рендер/звук/превью)
Канонические команды и флаги — в `scripts/` (единый источник, правишь раз в `scripts/_env.ps1`).
Зови их и из Cowork (с cwd = папка проекта):
`powershell -File ..\scripts\render.ps1 preview` (или `final`/`smoke`), `..\scripts\mix.ps1`, `..\scripts\preflight.ps1`, `..\scripts\contactsheet.ps1`.
- Если DC не находит голый `npx`/`node` (битый PATHEXT) — оберни вызов в .bat с первой строкой
  `set PATHEXT=.COM;.EXE;.BAT;.CMD`, либо вызывай через `cmd.exe /c`.
- Studio: `npx remotion studio src/index.ts --gl=angle-egl` → http://localhost:3000.
- Кадр: `npx remotion still src/index.ts Main out/f.png --frame=N --gl=angle-egl`.

## 4. Новый проект (через DC)
```
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\<you>\Desktop\Про видео\newproject.ps1" ProjectName
```
PowerShell кириллицу в пути держит → short-name `A310~1` не нужен. Создаёт lean-структуру + 2 junction
(node_modules + `src/kit`→движок). Подробно — основной `CLAUDE.md` «Новый проект».

## 5. ⭐ КРИТИЧНЫЙ ПАЙПЛАЙН РЕНДЕРА — ТОЛЬКО для Cowork-ПЕСОЧНИЦЫ (Linux, без GPU)
> (отработано в локальный архивный `WORKFLOW.md` (не входит в репо)). В Claude Code на ПК НЕ нужно — рендер локальный.
Реальные грабли песочницы; без них рендер из sandbox не заработает:
1. **Chrome:** встроенный Chrome Remotion на NTFS падает с SIGSEGV из Linux-песочницы.
   Скачать `chrome-headless-shell` в `/tmp`, рендерить с `--browser-executable=$CHROME`.
   `/tmp` чистится при перезапуске → качать заново каждую сессию.
2. **Webpack-кэш** (причина «правки не применяются»): кэш на NTFS блокируется Windows.
   Пропатчить `node_modules/@remotion/bundler/dist/webpack-cache.js` (cacheExists → 'does-not-exist'),
   один раз на проект. Старый кэш чистить переименованием (не delete — NTFS блокирует).
3. **Рендер ЧАНКАМИ ≤150 кадров** (bash-таймаут режет длинный):
   `node node_modules/.bin/remotion render --browser-executable=$CHROME --concurrency=1 [ID] /tmp/chunk.mp4 --frames=START-END`.
   Битый чанк («moov atom not found») — перерендерить только его.
4. **Null-байты в .tsx:** запись через Node на NTFS иногда добавляет `\x00` → esbuild падает. Чистить.
5. **Не перезаписывать MP4:** версионировать (v1_/v2_…), иначе EPERM (файл занят плеером).
6. **Склейка чанков:** `ffmpeg -f concat -safe 0 -i list.txt -c copy`. Проверять duration каждого.
7. **Видео для server-side рендера — ТОЛЬКО 30fps** (25/29.97/50fps не рендерятся корректно).
8. **Флаги рендера в песочнице:** `--gl=swangle --concurrency=1 --chrome-flags="--disable-dev-shm-usage --no-sandbox"`.
9. **Финальный микс (голос+музыка):** `loudnorm I=-16 voice volume 0.88` + `loudnorm I=-20 music volume 0.30`, amix.

## 6. Среда (определять автоматически)
| Если есть | Режим | Особенность |
|---|---|---|
| `mcp__Desktop_Commander__*` | ПК через DC | рендер целиком, локально |
| только `mcp__workspace__bash` | Cowork sandbox (Linux, CPU) | рендер чанками ≤150, swangle |
| ничего | дать пользователю инструкции запустить локально | — |

Подробный sandbox-воркфлоу — локальный архивный `WORKFLOW.md` (не входит в репо).
