---
description: Эмпирический подбор concurrency под эту машину
argument-hint: [-Comp Main]
---
Из папки проекта (с `src/index.ts`) запусти: `powershell -File ../scripts/benchmark.ps1 $ARGUMENTS`. Прогонит `remotion gpu` + benchmark на нескольких concurrency. Из логов выбери самую быструю БЕЗ OOM и впиши в `scripts/_env.ps1` (`CONCURRENCY_PREVIEW` для scale=1, `CONCURRENCY_FINAL` для 4K). Делается один раз на машину.
