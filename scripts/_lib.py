"""_lib.py - shared helpers for broll/voicetiming/inventory (stdlib only).
Importable because the script's own dir is on sys.path when you run `py scripts/<x>.py`.
"""
import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.request

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _tool(env_name, exe):
    """Resolve a tool: explicit env override -> PATH (bare name) -> common Windows install.
    Keeps Linux/macOS/VPS cloners working instead of hardcoding one Windows path."""
    override = os.environ.get(env_name)
    if override:
        return override
    if shutil.which(exe):
        return exe
    win = os.path.join(r"C:\Program Files\Shutter Encoder\Library", exe + ".exe")
    return win if os.path.exists(win) else exe


FFPROBE = _tool("FFPROBE", "ffprobe")
FFMPEG = _tool("FFMPEG", "ffmpeg")
FFMPEG_DIR = os.path.dirname(FFMPEG) if os.sep in FFMPEG else ""
ENV_PATH = os.path.join(WORKSPACE, ".env")
UA = "Mozilla/5.0 (broll fetcher)"


def load_env(path=ENV_PATH):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def probe_duration(path):
    """Duration in seconds, or None (handles missing file / non-numeric output)."""
    if not os.path.exists(path):
        return None
    out = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return None


def http_get_json(url, headers=None, retries=2):
    """GET JSON with retry on 429/5xx and a readable error (surfaces the HTTP body)."""
    last = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=headers or {})
            req.add_header("User-Agent", UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            body = ""
            try:
                body = e.read().decode("utf-8", "ignore")[:200]
            except Exception:
                pass
            last = "HTTP %s %s | %s" % (e.code, e.reason, body)
            if e.code in (429, 500, 502, 503) and attempt < retries:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(last)
        except Exception as e:  # network/timeout
            last = str(e)
            if attempt < retries:
                time.sleep(1.0)
                continue
            raise RuntimeError(last)
    raise RuntimeError(last or "request failed")


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
        total = 0
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
    return total
