---
description: Отрендерить сниппет из библиотеки в PNG (увидеть до адаптации)
argument-hint: <template-name> [-Frame 45]
---
Из корня воркспейса: `powershell -File scripts/preview-template.ps1 $ARGUMENTS`, затем прочитай `_ASSETS/remotion_templates/_previews/<name>.png` через Read и оцени, подходит ли сниппет. Имя — без `.tsx` (как в `index.json`, напр. `ken-burns`, `scene-transitions`). Дальше — адаптируй по `references/templates.md` (бренд + `staticFile` + verify).
