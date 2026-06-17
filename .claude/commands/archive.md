---
description: Сделать junction-проект автономным (для переноса/архива/клиента)
argument-hint: ProjectName
---
Из корня воркспейса: `powershell -File scripts/archive.ps1 $ARGUMENTS`. Заменяет 2 junction (`node_modules`, `src\kit`) реальным содержимым (`npm install` + копия движка из `_ASSETS/kit`) → папку можно зиповать и переносить на другой ПК. ⚠️ Меняет проект на месте; делать, когда проект готов к архиву. Общий `_ASSETS/kit` при этом не трогается (junction отвязывается безопасно).
