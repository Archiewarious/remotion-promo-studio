# scripts/render.ps1 - canonical Remotion render. Run with cwd = project folder.
#   powershell -File <ROOT>\scripts\render.ps1 preview
#   Profile: smoke | preview | final   [-Comp Main] [-Entry src/index.ts] [-Frames A-B]
# Flags live in scripts\_env.ps1. 'final' is auto-versioned (v1_/v2_) and auto-runs preflight.
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [Parameter(Mandatory=$true)][ValidateSet('smoke','preview','final')][string]$Profile,
  [string]$Comp  = 'Main',
  [string]$Entry = 'src/index.ts',
  [string]$Frames
)
. "$PSScriptRoot\_env.ps1"

if (-not (Test-Path $Entry)) { Write-Host "[render] no '$Entry' - run from a project folder."; exit 1 }
New-Item -ItemType Directory -Path 'out' -Force | Out-Null

$flags = Get-RenderFlags $Profile
if ($Frames) { $flags += "--frames=$Frames" }   # override frame range

switch ($Profile) {
  'smoke'   { $out = 'out/smoke.mp4' }
  'preview' { $out = 'out/preview.mp4' }
  'final'   { $out = Get-VersionedPath 'out' 'final_4k' '.mp4' }
}

$log = 'out/_render.log'
Write-Host "[render:$Profile] $Comp  ->  $out"
Write-Host "[render] flags: $($flags -join ' ')"

# Live console + UTF-8 log (so the background poller's grep works); returns native exit code.
$code = Invoke-Logged $log { & npx remotion render $Entry $Comp $out @flags }

if ($code -ne 0) { Write-Host "[render] FAILED (exit=$code) - see $log"; exit $code }
Write-Host "[render] OK -> $out"

if ($Profile -eq 'final') {
  Write-Host "[render] auto-preflight..."
  & "$PSScriptRoot\preflight.ps1" -File $out
}
