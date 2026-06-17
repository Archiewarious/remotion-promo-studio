#!/usr/bin/env python3
"""voicetiming.py - voiceover -> durationInFrames + (optional) captions via Whisper.

Run from the project folder:
  py ../scripts/voicetiming.py public/voice.mp3            # duration -> frames + segment timings
  py ../scripts/voicetiming.py public/voice.mp3 --captions # + word-level Whisper -> public/captions.json

captions.json uses the @remotion/captions shape: [{text,startMs,endMs,timestampMs,confidence}].
"""
import argparse, json, math, os, subprocess, sys, tempfile
from _lib import probe_duration, FFMPEG_DIR  # shared ffprobe-duration + ffmpeg dir (for Whisper's bare-ffmpeg PATH)


def run_whisper(path, model, language, out_dir):
    cmd = ["whisper", path, "--model", model, "--word_timestamps", "True",
           "--output_format", "json", "--output_dir", out_dir, "--verbose", "False"]
    if language:
        cmd += ["--language", language]
    print("[whisper] " + " ".join(cmd))
    # whisper calls bare 'ffmpeg' to decode audio -> make sure it is found even if not on PATH
    env = dict(os.environ)
    env["PATH"] = FFMPEG_DIR + os.pathsep + env.get("PATH", "")
    subprocess.run(cmd, check=True, env=env)
    base = os.path.splitext(os.path.basename(path))[0]
    with open(os.path.join(out_dir, base + ".json"), encoding="utf-8") as f:
        return json.load(f)


def to_captions(whisper_json):
    caps = []
    for seg in whisper_json.get("segments", []):
        words = seg.get("words")
        if words:
            for w in words:
                txt = w.get("word", "").strip()
                if not txt:
                    continue
                caps.append({
                    "text": txt,
                    "startMs": round(w["start"] * 1000),
                    "endMs": round(w["end"] * 1000),
                    "timestampMs": round(w["start"] * 1000),
                    "confidence": round(w.get("probability", 1.0), 3),
                })
        else:  # no word-level -> emit per-segment
            caps.append({
                "text": seg["text"].strip(),
                "startMs": round(seg["start"] * 1000),
                "endMs": round(seg["end"] * 1000),
                "timestampMs": round(seg["start"] * 1000),
                "confidence": None,
            })
    return caps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--captions", action="store_true", help="run Whisper -> captions.json")
    ap.add_argument("--model", default="base", help="Whisper model (tiny|base|small|medium|large)")
    ap.add_argument("--language", default=None, help="language code (ru, en, ...) or auto")
    ap.add_argument("--out", default="public/captions.json")
    args = ap.parse_args()

    if not os.path.exists(args.audio):
        print("[voicetiming] no such file: " + args.audio); sys.exit(1)

    dur = probe_duration(args.audio)
    if dur is None:
        print("[voicetiming] ffprobe could not read duration: " + args.audio); sys.exit(1)
    frames = math.ceil(dur * args.fps)
    print("[voicetiming] " + args.audio)
    print("  duration : %.2f s" % dur)
    print("  fps      : %d" % args.fps)
    print("  durationInFrames = %d   <- put this in Root.tsx" % frames)

    if args.captions:
        with tempfile.TemporaryDirectory() as td:
            wj = run_whisper(args.audio, args.model, args.language, td)
        caps = to_captions(wj)
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(caps, f, ensure_ascii=False, indent=2)
        print("  captions : %d -> %s" % (len(caps), args.out))
        print("  segments (for scene timing):")
        for seg in wj.get("segments", []):
            print("    %6.2f-%6.2f  %s" % (seg["start"], seg["end"], seg["text"].strip()))


if __name__ == "__main__":
    main()
