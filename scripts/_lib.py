"""_lib.py - shared helpers for broll/voicetiming/inventory (stdlib only).
Importable because the script's own dir is on sys.path when you run `py scripts/<x>.py`.
"""
import ipaddress
import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAX_DOWNLOAD_BYTES = 600 * 1024 * 1024  # 600 MB cap (a 4K clip is ~90 MB) - guards disk-fill


def _safe_url(url):
    """Allow only http(s) to a public host. Blocks file://, ftp://, data:, and
    SSRF to loopback/private/link-local addresses. Third-party API JSON is untrusted."""
    u = urllib.parse.urlparse(url)
    if u.scheme not in ("http", "https"):
        raise ValueError("blocked URL scheme '%s' (only http/https)" % (u.scheme or "none"))
    host = u.hostname or ""
    if not host:
        raise ValueError("URL has no host")
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        ip = None  # a hostname, not a literal IP -> allowed
    if ip is not None and (ip.is_loopback or ip.is_private or ip.is_link_local
                           or ip.is_reserved or ip.is_multicast or ip.is_unspecified):
        raise ValueError("blocked internal address: %s" % host)
    return url


class _SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _safe_url(newurl)  # re-validate every redirect hop (no file:// / internal pivot)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


# Opener whose redirects are re-checked; http_get_json/download go through it.
_OPENER = urllib.request.build_opener(_SafeRedirect)


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
            _safe_url(url)
            req = urllib.request.Request(url, headers=headers or {})
            req.add_header("User-Agent", UA)
            with _OPENER.open(req, timeout=60) as r:
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
    _safe_url(url)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with _OPENER.open(req, timeout=300) as r, open(dest, "wb") as f:
        total = 0
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
            if total > MAX_DOWNLOAD_BYTES:
                raise ValueError("download exceeds %d bytes - aborted" % MAX_DOWNLOAD_BYTES)
    return total
