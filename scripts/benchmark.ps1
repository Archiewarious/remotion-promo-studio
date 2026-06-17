# scripts/benchmark.ps1 - empirically pick concurrency for THIS machine (instead of guessing).
#   powershell -File <ROOT>\scripts\benchmark.ps1 [-Comp Main] [-Entry src/index.ts]
# Run with cwd = project folder (needs src/index.ts). Prints a recommendation for _env.ps1.
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [string]$Comp  = 'Main',
  [string]$Entry = 'src/index.ts'
)
. "$PSScriptRoot\_env.ps1"
if (-not (Test-Path $Entry)) { Write-Host "[bench] no '$Entry' - run from a project folder."; exit 1 }
New-Item -ItemType Directory -Path 'out' -Force | Out-Null

Write-Host "=== remotion gpu ==="
$null = Invoke-Logged 'out/_gpu.log' { & npx remotion gpu }

Write-Host "`n=== benchmark preview (scale=1) ==="
$null = Invoke-Logged 'out/_bench_preview.log' { & npx remotion benchmark $Entry $Comp --scale=1 --x264-preset=ultrafast --crf=22 --gl=angle-egl --concurrencies=6,8,10,12 --frames=0-120 }

Write-Host "`n=== benchmark final (scale=2, 4K) ==="
$null = Invoke-Logged 'out/_bench_final.log' { & npx remotion benchmark $Entry $Comp --scale=2 --x264-preset=slow --crf=14 --gl=angle-egl --concurrencies=4,6,8 --frames=0-60 }

Write-Host "`n[bench] Take the fastest concurrency WITHOUT OOM from the logs above and set in scripts\_env.ps1:"
Write-Host "        CONCURRENCY_PREVIEW (scale=1) and CONCURRENCY_FINAL (scale=2)."
