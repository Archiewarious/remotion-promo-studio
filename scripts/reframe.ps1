# scripts/reframe.ps1 - reframe a 16:9 master into social formats (9:16 / 1:1).
#   powershell -File <ROOT>\scripts\reframe.ps1 -File out\v1_final_4k.mp4 [-To 9x16|1x1|both] [-Mode blur|crop]
# blur = blurred cover background + fitted video (no crop). crop = center-crop to fill.
# Output: 1080-wide social res, versioned, next to input. ASCII-only (PS 5.1).
param(
  [Parameter(Mandatory=$true)][string]$File,
  [ValidateSet('9x16','1x1','both')][string]$To = '9x16',
  [ValidateSet('blur','crop')][string]$Mode = 'blur',
  [int]$Crf = 18
)
. "$PSScriptRoot\_env.ps1"
if (-not (Test-Path $File)) { Write-Host "[reframe] no such file: $File"; exit 1 }
$dir = Split-Path $File -Parent; if (-not $dir) { $dir = '.' }
$base = [IO.Path]::GetFileNameWithoutExtension($File)

function Reframe-One([int]$W, [int]$H, [string]$tag) {
  $out = Get-VersionedPath $dir ('{0}_{1}' -f $base, $tag) '.mp4'
  Write-Host "[reframe] $tag ($W x $H, $Mode) -> $out"
  if ($Mode -eq 'crop') {
    $vf = "scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1"
    $code = Invoke-FFmpeg @('-y','-hide_banner','-i',$File,'-vf',$vf,'-c:v','libx264','-crf',"$Crf",'-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k',$out)
  } else {
    $fc = "[0:v]split=2[a][b];" +
          "[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=20[bg];" +
          "[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];" +
          "[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]"
    $code = Invoke-FFmpeg @('-y','-hide_banner','-i',$File,'-filter_complex',$fc,'-map','[v]','-map','0:a?','-c:v','libx264','-crf',"$Crf",'-preset','medium','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k',$out)
  }
  if ($code -eq 0 -and (Test-Path $out)) { Write-Host "[reframe] OK -> $out" } else { Write-Host "[reframe] FAILED ($tag, exit=$code)" }
}

if ($To -eq '9x16' -or $To -eq 'both') { Reframe-One 1080 1920 '9x16' }
if ($To -eq '1x1'  -or $To -eq 'both') { Reframe-One 1080 1080 '1x1' }
