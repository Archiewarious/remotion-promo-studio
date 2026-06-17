# scripts/mix.ps1 - final audio: voice + music (sidechain ducking) -> program loudness.
#   powershell -File <ROOT>\scripts\mix.ps1 -Video out\v1_final.mp4 -Voice public\voice.mp3 -Music public\music.mp3 [-LUFS -14] [-MusicVol 0.30]
# Music auto-ducks under the voice. Without -Music: voice normalization only.
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [Parameter(Mandatory=$true)][string]$Video,
  [string]$Voice = 'public/voice.mp3',
  [string]$Music,
  [double]$LUFS,
  [double]$MusicVol = 0.30,
  [string]$Out
)
. "$PSScriptRoot\_env.ps1"
if (-not $LUFS) { $LUFS = $PROGRAM_LUFS }
foreach ($f in @($Video,$Voice)) { if (-not (Test-Path $f)) { Write-Host "[mix] no such file: $f"; exit 1 } }
if (-not $Out) { $Out = Get-VersionedPath (Split-Path $Video -Parent) 'mix' '.mp4' }

if ($Music -and (Test-Path $Music)) {
  $fc = "[1:a]loudnorm=I=-23:TP=-2[vn];" +
        "[2:a][vn]sidechaincompress=threshold=0.05:ratio=8:attack=200:release=1000[md];" +
        "[md]volume=$MusicVol[m];" +
        "[vn][m]amix=inputs=2:duration=first:dropout_transition=0[mx];" +
        "[mx]loudnorm=I=${LUFS}:TP=-1.5:LRA=11[a]"
  $code = Invoke-FFmpeg @('-y','-hide_banner','-i',$Video,'-i',$Voice,'-i',$Music,'-filter_complex',$fc,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k',$Out)
} else {
  $fc = "[1:a]loudnorm=I=${LUFS}:TP=-1.5:LRA=11[a]"
  $code = Invoke-FFmpeg @('-y','-hide_banner','-i',$Video,'-i',$Voice,'-filter_complex',$fc,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k',$Out)
}
if ($code -eq 0 -and (Test-Path $Out)) { Write-Host "[mix] OK -> $Out"; & "$PSScriptRoot\preflight.ps1" -File $Out -LUFS $LUFS }
else { Write-Host "[mix] FAILED (exit=$code)"; exit 1 }
