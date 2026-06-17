# scripts/preflight.ps1 - pre-delivery check: duration, black frames, freeze, loudness.
#   powershell -File <ROOT>\scripts\preflight.ps1 -File out\v1_final.mp4 [-LUFS -14] [-ExpectSec 30]
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [Parameter(Mandatory=$true)][string]$File,
  [double]$LUFS,
  [double]$ExpectSec = 0
)
. "$PSScriptRoot\_env.ps1"
if (-not $LUFS) { $LUFS = $PROGRAM_LUFS }
if (-not (Test-Path $File)) { Write-Host "[preflight] no such file: $File"; exit 1 }

$ok = $true
$dur = Get-MediaDuration $File
Write-Host ("[preflight] {0}" -f $File)
Write-Host ("  duration : {0:N2} s" -f $dur)
if ($ExpectSec -gt 0 -and [math]::Abs($dur - $ExpectSec) -gt 0.5) {
  Write-Host ("  [WARN] expected ~{0} s (diff {1:N2})" -f $ExpectSec, ($dur-$ExpectSec)); $ok = $false
}

# Black frames
$black = (& $FFMPEG -hide_banner -i "$File" -vf blackdetect=d=0.1:pic_th=0.98 -an -f null - 2>&1) | Select-String 'black_start'
if ($black) { Write-Host "  [WARN] black segments:"; $black | ForEach-Object { Write-Host "    $_" }; $ok = $false }
else { Write-Host "  black frames : none" }

# Frozen (static) segments > 2s
$freeze = (& $FFMPEG -hide_banner -i "$File" -vf freezedetect=n=0.003:d=2 -an -f null - 2>&1) | Select-String 'freeze_start'
if ($freeze) { Write-Host "  [WARN] freeze segments (>2s):"; $freeze | ForEach-Object { Write-Host "    $_" } }
else { Write-Host "  freeze       : none" }

# Integrated loudness (ebur128)
$ln = (& $FFMPEG -hide_banner -i "$File" -af ebur128=framelog=verbose -f null - 2>&1)
$pattern = 'I:\s+(-?\d+(\.\d+)?)\s+LUFS'
$im = $ln | Select-String $pattern | Select-Object -Last 1
if ($im) {
  $val = [double]$im.Matches[0].Groups[1].Value
  Write-Host ("  loudness     : {0} LUFS (target {1})" -f $val, $LUFS)
  if ([math]::Abs($val - $LUFS) -gt 1.0) { Write-Host "  [WARN] off by >1 LUFS - run scripts\mix.ps1"; $ok = $false }
} else { Write-Host "  [WARN] no audio track or loudness not measured"; $ok = $false }

if ($ok) { Write-Host "[preflight] PASS" } else { Write-Host "[preflight] has warnings (see [WARN])" }
