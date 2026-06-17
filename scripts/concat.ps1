# scripts/concat.ps1 - join / freeze approved scenes (do not re-render them).
#   powershell -File <ROOT>\scripts\concat.ps1 -Clips a.mp4,b.mp4,c.mp4 [-Target 3840x2160] [-Voice public\voice.mp3] [-Out out\joined.mp4]
# Without -Target: stream-copy (fast, identical resolution). With -Target: lanczos upscale + re-encode.
# ASCII-only on purpose (PS 5.1 parses .ps1 as ANSI without a BOM).
param(
  [Parameter(Mandatory=$true)][string[]]$Clips,
  [string]$Target,
  [string]$Voice,
  [string]$Out
)
. "$PSScriptRoot\_env.ps1"
foreach ($c in $Clips) { if (-not (Test-Path $c)) { Write-Host "[concat] no such clip: $c"; exit 1 } }
if (-not $Out) { $Out = Get-VersionedPath 'out' 'joined' '.mp4' }
$tmp = $null

if ($Target) {
  $wh = $Target -split 'x'; $W = [int]$wh[0]; $H = [int]$wh[1]
  $ins = @(); $labels = ''; $pre = ''
  for ($i=0; $i -lt $Clips.Count; $i++) { $ins += @('-i', $Clips[$i]) }
  for ($i=0; $i -lt $Clips.Count; $i++) { $pre += "[$i:v]scale=${W}:${H}:flags=lanczos,setsar=1[v$i];"; $labels += "[v$i]" }
  $fc = "$pre$labels" + "concat=n=$($Clips.Count):v=1:a=0[v]"
  $code = Invoke-FFmpeg (@('-y','-hide_banner') + $ins + @('-filter_complex',$fc,'-map','[v]','-c:v','libx264','-crf','14','-preset','slow','-pix_fmt','yuv420p',$Out))
} else {
  $tmp = [System.IO.Path]::GetFullPath((Join-Path (Split-Path $Out -Parent) '_concat_list.txt'))
  $lines = $Clips | ForEach-Object { "file '$((Resolve-Path $_).Path -replace '\\','/')'" }
  # UTF-8 without BOM: Cyrillic paths survive (ASCII would mangle them; BOM breaks the concat demuxer).
  [System.IO.File]::WriteAllLines($tmp, [string[]]@($lines), (New-Object System.Text.UTF8Encoding($false)))
  $code = Invoke-FFmpeg @('-y','-hide_banner','-f','concat','-safe','0','-i',$tmp,'-c','copy',$Out)
}

if ($code -ne 0 -or -not (Test-Path $Out)) { Write-Host "[concat] FAILED (exit=$code)"; exit 1 }

if ($Voice -and (Test-Path $Voice)) {
  $muxed = Get-VersionedPath (Split-Path $Out -Parent) 'joined_voiced' '.mp4'
  $mcode = Invoke-FFmpeg @('-y','-hide_banner','-i',$Out,'-i',$Voice,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',$muxed)
  if ($tmp -and (Test-Path $tmp)) { Remove-Item $tmp -Force }
  if ($mcode -eq 0 -and (Test-Path $muxed)) { Write-Host "[concat] OK -> $muxed (with voice)" }
  else { Write-Host "[concat] voice-mux FAILED (exit=$mcode) - silent video at $Out"; exit 1 }
} else {
  if ($tmp -and (Test-Path $tmp)) { Remove-Item $tmp -Force }
  Write-Host "[concat] OK -> $Out"
}
