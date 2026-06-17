---
description: Рендер Remotion (smoke|preview|final) каноническими флагами
argument-hint: smoke|preview|final [-Comp Main] [-Frames A-B]
---
Запусти канонический рендер из ТЕКУЩЕЙ папки проекта (где лежит `src/index.ts`):
`powershell -File ../scripts/render.ps1 $ARGUMENTS`

Флаги и concurrency — в `scripts/_env.ps1` (один источник). Профиль `final` авто-версионируется (`v1_/v2_`) и сам прогоняет preflight. Длинный рендер пускай в фоне, лог — `out/_render.log`. Если ты не в папке проекта — сперва перейди в неё.
