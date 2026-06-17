# scripts/contactsheet.ps1 - whole clip as ONE tiled PNG (review in a single vision read).
#   powershell -File <ROOT>\scripts\contactsheet.ps1 -File out\preview.mp4 [-Cols 6] [-Rows 5] [-Cell 480]
# Takes ~Cols*Rows evenly spaced frames -> one PNG. Read it with the Read tool.
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [Parameter(Mandatory=$true)][string]$File,
  [int]$Cols = 6,
  [int]$Rows = 5,
  [int]$Cell = 480,
  [string]$Out
)
. "$PSScriptRoot\_env.ps1"
if (-not (Test-Path $File)) { Write-Host "[sheet] no such file: $File"; exit 1 }

$n = $Cols * $Rows
$dur = Get-MediaDuration $File
$fps = $n / $dur                     # ~n frames across the whole duration = evenly spaced
if (-not $Out) { $Out = [IO.Path]::Combine((Split-Path $File -Parent), ([IO.Path]::GetFileNameWithoutExtension($File) + '_sheet.png')) }

# Burn a timecode on each frame, then tile.
$vf = "fps=$fps,scale=${Cell}:-1,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5,tile=${Cols}x${Rows}"
$code = Invoke-FFmpeg @('-y','-hide_banner','-i',$File,'-vf',$vf,'-frames:v','1',$Out)
if ($code -eq 0 -and (Test-Path $Out)) { Write-Host "[sheet] OK -> $Out  ($Cols x $Rows = $n frames)" }
else { Write-Host "[sheet] FAILED (exit=$code)"; exit 1 }
