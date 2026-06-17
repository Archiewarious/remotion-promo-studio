# scripts/preview-template.ps1 - render ONE library snippet to a PNG so you can SEE it before adopting.
#   powershell -File <ROOT>\scripts\preview-template.ps1 ken-burns [-Frame 45]
# Output: _ASSETS\remotion_templates\_previews\<name>.png  (then Read it with the Read tool).
# Uses a tiny throwaway gallery project that re-exports the chosen template's default export.
# ASCII-only (PS 5.1). Best-effort: snippets needing required props/children may not render.
param([Parameter(Mandatory=$true)][string]$Name, [int]$Frame = 45)
. "$PSScriptRoot\_env.ps1"

$tpl    = Join-Path $WORKSPACE '_ASSETS\remotion_templates'
$gal    = Join-Path $WORKSPACE '_ASSETS\_gallery'
$store  = Join-Path $WORKSPACE '_ASSETS\node_modules'
$outDir = Join-Path $tpl '_previews'
New-Item -ItemType Directory -Force $outDir | Out-Null

# locate the snippet across subfolders
$rel = $null
foreach ($sub in 'templates', 'wow_effects', 'official', 'code') {
  if (Test-Path (Join-Path $tpl "$sub\$Name.tsx")) { $rel = "../../remotion_templates/$sub/$Name"; break }
}
if (-not $rel) { Write-Host "[preview] not found: $Name.tsx (in templates/wow_effects/official/code)"; exit 1 }

# scaffold the gallery project once
New-Item -ItemType Directory -Force (Join-Path $gal 'src') | Out-Null
if (-not (Test-Path (Join-Path $gal 'node_modules'))) {
  New-Item -ItemType Junction -Path (Join-Path $gal 'node_modules') -Target $store | Out-Null
}
if (-not (Test-Path (Join-Path $gal 'tsconfig.json'))) {
  '{ "compilerOptions": { "target": "ES2018", "module": "ESNext", "jsx": "react-jsx", "esModuleInterop": true, "skipLibCheck": true, "moduleResolution": "bundler", "strict": false } }' | Set-Content (Join-Path $gal 'tsconfig.json') -Encoding ASCII
}
if (-not (Test-Path (Join-Path $gal 'src\index.ts'))) {
  "import {registerRoot} from 'remotion';`r`nimport {Root} from './Root';`r`nregisterRoot(Root);" | Set-Content (Join-Path $gal 'src\index.ts') -Encoding ASCII
}
$root = "import React from 'react';`r`n" +
        "import {Composition, AbsoluteFill} from 'remotion';`r`n" +
        "import {Active} from './Active';`r`n" +
        "const Wrap: React.FC = () => (<AbsoluteFill style={{backgroundColor: '#101418'}}><Active /></AbsoluteFill>);`r`n" +
        "export const Root: React.FC = () => (<Composition id='Preview' component={Wrap} durationInFrames={90} fps={30} width={1920} height={1080} />);`r`n"
$root | Set-Content (Join-Path $gal 'src\Root.tsx') -Encoding ASCII

# point Active at the chosen snippet (re-export its default)
"export {default as Active} from '$rel';" | Set-Content (Join-Path $gal 'src\Active.tsx') -Encoding ASCII

$out = Join-Path $outDir "$Name.png"
Push-Location $gal
$prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& npx remotion still src/index.ts Preview "$out" --frame=$Frame --gl=angle-egl *>&1 | Select-Object -Last 4
$code = $LASTEXITCODE
$ErrorActionPreference = $prev
Pop-Location

if (Test-Path $out) { Write-Host "[preview] OK -> $out  (Read it)" }
else { Write-Host "[preview] FAILED (exit=$code) - snippet may need required props/children"; exit 1 }
