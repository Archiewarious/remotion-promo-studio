# scripts/archive.ps1 - make a junction-based project STANDALONE (portable: other PC / archive / client).
#   powershell -File <ROOT>\scripts\archive.ps1 MyProject
# Replaces the two junctions (node_modules, src\kit) with real content: npm install + a copy of the engine.
# After this the folder can be zipped/moved off this machine. ASCII-only (PS 5.1).
param([Parameter(Mandatory=$true)][string]$Project)
. "$PSScriptRoot\_env.ps1"

$proj = if (Test-Path $Project) { (Resolve-Path $Project).Path } else { Join-Path $WORKSPACE $Project }
if (-not (Test-Path (Join-Path $proj 'src'))) { Write-Host "[archive] not a project (no src/): $proj"; exit 1 }
$kitSrc = Join-Path $WORKSPACE '_ASSETS\kit'
$nm  = Join-Path $proj 'node_modules'
$kit = Join-Path $proj 'src\kit'
New-Item -ItemType Directory -Force (Join-Path $proj 'out') | Out-Null

function Is-Junction($p) {
  if (-not (Test-Path $p)) { return $false }
  return (((Get-Item $p -Force).Attributes) -band [IO.FileAttributes]::ReparsePoint) -ne 0
}

# 1) engine: unlink junction (safe - leaves _ASSETS\kit intact), copy real files in
if (Is-Junction $kit) { cmd /c rmdir "$kit" | Out-Null }
New-Item -ItemType Directory -Force $kit | Out-Null
Copy-Item -Path (Join-Path $kitSrc '*') -Destination $kit -Recurse -Force
Write-Host "[archive] engine copied -> src\kit"

# 2) deps: unlink junction, real npm install from package.json
if (Is-Junction $nm) { cmd /c rmdir "$nm" | Out-Null }
Push-Location $proj
Write-Host "[archive] npm install (can take a few minutes)..."
$prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
$npmLog = & npm install *>&1 | ForEach-Object { "$_" }   # capture (string[]) so we can write a UTF-8 log
$ErrorActionPreference = $prev
# UTF-8 no BOM (Tee-Object writes UTF-16 -> log readers/grep choke).
[System.IO.File]::WriteAllLines((Join-Path $proj 'out\_npm_install.log'), [string[]]$npmLog, (New-Object System.Text.UTF8Encoding($false)))
$npmLog | Select-Object -Last 2 | ForEach-Object { Write-Host $_ }
Pop-Location

$ok = (Test-Path (Join-Path $proj 'node_modules\remotion')) -and (Test-Path (Join-Path $kit 'BrandBG.tsx')) -and -not (Is-Junction $nm) -and -not (Is-Junction $kit)
if ($ok) {
  Write-Host "[archive] DONE - '$Project' is standalone (both junctions replaced with real content)."
  Write-Host "[archive] Zip/move the folder freely. (You may delete out/ before archiving.)"
} else {
  Write-Host "[archive] CHECK - verify node_modules\remotion and src\kit copied correctly."; exit 1
}
