# scripts/_env.ps1 - SINGLE source of truth: tool paths + render/audio flags.
# Dot-sourced by the other scripts:  . "$PSScriptRoot\_env.ps1"
# Edit a value ONCE here -> it applies in every script and slash command.
# NOTE: keep this file ASCII-only. PowerShell 5.1 parses .ps1 as ANSI without a BOM,
#       so Cyrillic here breaks the parser. Russian belongs in the .md docs, not scripts.

# --- Tool paths: $env:FFMPEG/$env:FFPROBE override -> PATH -> common Windows default ---
# Portable: works on a fresh clone where ffmpeg is on PATH; override via env for custom installs.
function Resolve-Tool([string]$EnvName, [string]$Exe, [string]$Fallback) {
  $ov = [Environment]::GetEnvironmentVariable($EnvName)
  if ($ov) { return $ov }
  $cmd = Get-Command $Exe -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  if (Test-Path $Fallback) { return $Fallback }
  return $Exe   # POSIX/clone with no install: bare name -> clean "not found", matches _lib.py _tool()
}
$script:FFMPEG  = Resolve-Tool 'FFMPEG'  'ffmpeg'  'C:\Program Files\Shutter Encoder\Library\ffmpeg.exe'
$script:FFPROBE = Resolve-Tool 'FFPROBE' 'ffprobe' 'C:\Program Files\Shutter Encoder\Library\ffprobe.exe'

# --- Roots ---
$script:SCRIPTS_DIR = $PSScriptRoot
$script:WORKSPACE   = Split-Path $PSScriptRoot -Parent

# --- Concurrency (benchmarked on a REAL cat comp, 16GB machine; re-run scripts\benchmark.ps1 if HW/comp changes) ---
#     4K scale=2 (OffthreadVideo+transitions): conc 4..10 all stable, flat ~12.1-13.2s/60f (IO/encode-bound)
#     -> 8 = sweet spot (fast + memory headroom on long/60fps renders). 12 crashed a worker on a 300f preview.
$script:CONCURRENCY_PREVIEW = 8
$script:CONCURRENCY_FINAL   = 8

# --- Default program loudness (YouTube -14 LUFS, Instagram -16) ---
$script:PROGRAM_LUFS = -14

# Render flags for a profile (ALL flags live in one place).
function Get-RenderFlags([string]$Profile) {
  switch ($Profile) {
    'smoke'   { @('--frames=0-30','--scale=0.4','--crf=28','--x264-preset=ultrafast','--gl=angle-egl','--concurrency=4') }
    'preview' { @('--scale=1.0','--crf=22','--x264-preset=ultrafast','--image-format=png','--pixel-format=yuv420p','--gl=angle-egl',"--concurrency=$CONCURRENCY_PREVIEW") }
    'final'   { @('--scale=2.0','--crf=14','--x264-preset=slow','--image-format=png','--pixel-format=yuv420p','--color-space=bt709','--gl=angle-egl',"--concurrency=$CONCURRENCY_FINAL") }
    default   { throw "Unknown profile '$Profile' (smoke|preview|final)" }
  }
}

# out/name.mp4 -> out/v1_name.mp4, v2_... (never overwrite - player locks file -> EPERM).
function Get-VersionedPath([string]$Dir, [string]$BaseName, [string]$Ext) {
  $i = 1
  do { $p = Join-Path $Dir ('v{0}_{1}{2}' -f $i, $BaseName, $Ext); $i++ } while (Test-Path $p)
  return $p
}

# Media duration in seconds (ffprobe).
function Get-MediaDuration([string]$File) {
  if (-not (Test-Path $File)) { throw "No such file: $File" }
  return [double](& $FFPROBE -v error -show_entries format=duration -of csv=p=0 "$File")
}

# Run ffmpeg, suppress its noise, RETURN exit code (0=ok). Check the code, not just Test-Path (stale file != success).
function Invoke-FFmpeg([string[]]$FfArgs) {
  $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  $global:LASTEXITCODE = 0
  try {
    & $FFMPEG @FfArgs 2>&1 | Out-Null
    $code = $LASTEXITCODE
  } catch {
    $code = 127   # ffmpeg not found / failed to start -> real failure, not a phantom 0
  }
  $ErrorActionPreference = $prev
  return $code
}

# Run a scriptblock (e.g. npx render), echo live to console AND write a UTF-8 log.
# PS 5.1 Tee-Object writes UTF-16 -> grep/pollers on the log fail. This writes UTF-8 (no BOM). Returns exit code.
# Usage: $code = Invoke-Logged 'out/_render.log' { & npx remotion render ... }
function Invoke-Logged([string]$LogPath, [scriptblock]$Block) {
  $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  & $Block *>&1 | Tee-Object -Variable _ilOut | Out-Host
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  $dir = Split-Path $LogPath -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  [System.IO.File]::WriteAllLines($LogPath, [string[]]($_ilOut | ForEach-Object { "$_" }), (New-Object System.Text.UTF8Encoding($false)))
  return $code
}
