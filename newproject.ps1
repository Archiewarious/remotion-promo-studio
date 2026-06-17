# New video project creator. PowerShell (Cyrillic paths OK, native junctions).
# Run:  powershell -NoProfile -ExecutionPolicy Bypass -File newproject.ps1 ProjectName
# Makes lean structure + 2 junctions (node_modules + src\kit -> shared engine). No copies, no .bat.
param([Parameter(Mandatory=$true)][string]$Name)
$ErrorActionPreference = 'Stop'
$ROOT   = $PSScriptRoot
$TPL    = Join-Path $ROOT '_template'
$ASSETS = Join-Path $ROOT '_ASSETS'
$DST    = Join-Path $ROOT $Name

if (Test-Path $DST) { Write-Host "[X] '$Name' already exists"; exit 1 }

New-Item -ItemType Directory -Path (Join-Path $DST 'public') -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $DST 'out')    -Force | Out-Null
Copy-Item -Path (Join-Path $TPL 'src') -Destination (Join-Path $DST 'src') -Recurse

foreach ($f in 'package.json','tsconfig.json','CLAUDE.md','PROGRESS.md') {
  $srcF = Join-Path $TPL $f
  if (Test-Path $srcF) { Copy-Item -Path $srcF -Destination (Join-Path $DST $f) }
}

New-Item -ItemType Junction -Path (Join-Path $DST 'node_modules') -Target (Join-Path $ASSETS 'node_modules') | Out-Null
New-Item -ItemType Junction -Path (Join-Path $DST 'src\kit')      -Target (Join-Path $ASSETS 'kit')          | Out-Null

$ok = (Test-Path (Join-Path $DST 'node_modules\remotion')) -and (Test-Path (Join-Path $DST 'src\kit\BrandBG.tsx'))
if ($ok) { Write-Host "DONE: '$Name' ready (junctions OK)." } else { Write-Host "DONE: '$Name' created BUT junction broken - check." }
Write-Host "Next: brand in src/utils (colors,fonts) + public/logo; engine from ../kit; scenes in src/scenes."
