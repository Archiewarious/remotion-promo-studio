#!/bin/bash
# Video Workflow — setup script (Linux / macOS / VPS / Cowork sandbox)
set -e

echo "============================================"
echo " Video Workflow — installation"
echo "============================================"
echo

# 1. Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "[X] Node.js not found"
  echo "    Linux: sudo apt install nodejs npm  (or use nvm)"
  echo "    macOS: brew install node"
  exit 1
fi
echo "[1/4] Node.js: $(node --version) ✓"

# 2. FFmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "[!] FFmpeg not found"
  echo "    Linux: sudo apt install ffmpeg"
  echo "    macOS: brew install ffmpeg"
  echo "    (needed for final voice+music mix)"
else
  echo "[2/4] FFmpeg ✓"
fi

# 3. Remotion Agent Skills
if [ ! -d ".claude/skills/remotion" ]; then
  echo "[3/4] Downloading Remotion Agent Skills..."
  mkdir -p .claude/skills
  TMPDIR=$(mktemp -d)
  curl -sL https://github.com/remotion-dev/skills/archive/refs/heads/main.tar.gz \
    -o "$TMPDIR/skills.tar.gz"
  tar -xzf "$TMPDIR/skills.tar.gz" -C "$TMPDIR"
  cp -r "$TMPDIR/skills-main/skills/remotion" .claude/skills/
  rm -rf "$TMPDIR"
  RULES_COUNT=$(ls .claude/skills/remotion/rules | wc -l)
  echo "    $RULES_COUNT rules installed"
else
  RULES_COUNT=$(ls .claude/skills/remotion/rules 2>/dev/null | wc -l)
  echo "[3/4] Remotion Skills already installed ($RULES_COUNT rules)"
fi

# 4. .env
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "[4/4] .env created from .env.example — fill in API keys"
  else
    echo "[!] .env.example missing"
  fi
else
  echo "[4/4] .env exists"
fi

# Required directories (_ARCHIVE может быть симлинком на внешний диск — не трогаем если есть)
mkdir -p _ASSETS incoming
if [ ! -e "_ARCHIVE" ] && [ ! -L "_ARCHIVE" ]; then mkdir _ARCHIVE; fi

echo
echo "============================================"
echo " SETUP COMPLETE"
echo
echo " Next steps:"
echo "  1. Fill .env with Pexels / Pixabay API keys"
echo "  2. (Optional) Connect Desktop Commander MCP in Cowork"
echo "  3. New project on Windows PC: powershell -File newproject.ps1 MyProject"
echo "     (Linux/sandbox: mkdir MyProject, copy _template/*, then npm install)"
echo "  4. Open new chat with Claude and provide brief"
echo "============================================"
