#!/usr/bin/env python3
"""broll.py - search, curate & download b-roll into a shared library by category.

Typical flow:
  py scripts/broll.py "city night aerial" --count 8 --preview    # 1) posters only -> curate
  py scripts/broll.py "city night aerial" --only 12345,67890     # 2) fetch the chosen clips
Quick / filtered:
  py scripts/broll.py "sunset" "food" "cars"                     # 5 best each, Pexels, 1080p
  py scripts/broll.py "cat" --min-fps 60 --size large            # ONLY clips with a >=60fps file, prefer 4K
  py scripts/broll.py "coffee pour" --orientation portrait --min-duration 5 --max-height 2160

Library: <workspace>/_ASSETS/broll/<category>/  filenames: <desc>__<WxH>__<fps>__<source><id>.mp4
Metadata -> _index.json ; attribution -> _CREDITS.txt ; posters (--preview) -> <cat>/_preview/*.jpg

Filters: --min-fps (Pexels API has NO fps param -> we over-fetch and filter on video_files.fps),
         --size (Pexels server filter: large=4K / medium=FullHD / small=HD), --orientation, --min-duration, --max-height.
Tip: search in ENGLISH. Keys from <workspace>/.env (PEXELS_API_KEY, PIXABAY_API_KEY). stdlib only.
"""
import argparse, json, os, re, urllib.parse
from _lib import load_env, http_get_json, download, WORKSPACE, ENV_PATH  # shared stdlib helpers (retry, env, dl)

DEFAULT_LIB = os.path.join(WORKSPACE, "_ASSETS", "broll")


def slug(s, maxlen=50):
    s = (s or "").lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:maxlen].strip("-") or "clip"


def pick_file_pexels(vfiles, max_h, prefer_fps=30, min_fps=0):
    mp4 = [v for v in vfiles if v.get("file_type") == "video/mp4" and v.get("link")]
    if min_fps:
        mp4 = [v for v in mp4 if round(v.get("fps") or 0) >= min_fps]  # FILTER: must offer >= min_fps
    if not mp4:
        return None
    under = [v for v in mp4 if (v.get("height") or 0) <= max_h]
    pool = under if under else mp4
    # largest resolution; tie-break: fps closest to prefer_fps
    best = max(pool, key=lambda v: (v.get("width", 0) * v.get("height", 0), -abs(round(v.get("fps") or prefer_fps) - prefer_fps)))
    return {"url": best["link"], "w": best.get("width"), "h": best.get("height"), "fps": best.get("fps")}


def pick_file_pixabay(videos, max_h):
    cand = [v for v in videos.values() if v.get("url")]
    if not cand:
        return None
    under = [v for v in cand if (v.get("height") or 0) <= max_h]
    pool = under if under else cand
    best = max(pool, key=lambda v: (v.get("width", 0) * v.get("height", 0)))
    return {"url": best["url"], "w": best.get("width"), "h": best.get("height"), "fps": None}


def search_pexels(key, query, n, orientation, locale, size=None, page=1):
    params = {"query": query, "per_page": n, "orientation": orientation, "page": page}
    if locale:
        params["locale"] = locale
    if size:
        params["size"] = size
    data = http_get_json("https://api.pexels.com/videos/search?" + urllib.parse.urlencode(params), {"Authorization": key})
    out = []
    for v in data.get("videos", []):
        seg = (v.get("url") or "").rstrip("/").split("/")[-1]
        desc = re.sub(r"-?\d+$", "", seg) or query
        out.append({"source": "pexels", "id": v["id"], "desc": desc, "tags": desc.replace("-", ", "),
                    "url": v.get("url"), "author": (v.get("user") or {}).get("name", ""),
                    "duration": v.get("duration"), "poster": v.get("image"),
                    "files": v.get("video_files", []), "_kind": "pexels"})
    return out


def search_pixabay(key, query, count, lang):
    params = {"key": key, "q": query, "per_page": max(3, count), "video_type": "film"}
    if lang:
        params["lang"] = lang
    data = http_get_json("https://pixabay.com/api/videos/?" + urllib.parse.urlencode(params))
    out = []
    for v in data.get("hits", [])[:count]:
        tags = v.get("tags", query)
        vids = v.get("videos", {})
        poster = next((vv.get("thumbnail") for vv in vids.values() if vv.get("thumbnail")), "")
        out.append({"source": "pixabay", "id": v["id"], "desc": tags, "tags": tags,
                    "url": v.get("pageURL", ""), "author": v.get("user", ""),
                    "duration": v.get("duration"), "poster": poster,
                    "files": vids, "_kind": "pixabay"})
    return out


def load_index(lib):
    p = os.path.join(lib, "_index.json")
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            return []
    return []


def save_index(lib, idx):
    json.dump(idx, open(os.path.join(lib, "_index.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


def append_credit(lib, rel, author, url, source):
    with open(os.path.join(lib, "_CREDITS.txt"), "a", encoding="utf-8") as f:
        f.write("%s  -  %s (%s) via %s\n" % (rel, author or "unknown", url or "", source))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("queries", nargs="+", help="search terms (also become category folders); use English")
    ap.add_argument("--count", type=int, default=5)
    ap.add_argument("--source", choices=["pexels", "pixabay", "both"], default="pexels")
    ap.add_argument("--orientation", choices=["landscape", "portrait", "square"], default="landscape")
    ap.add_argument("--max-height", type=int, default=1080, help="cap download resolution (2160 for 4K)")
    ap.add_argument("--prefer-fps", type=int, default=30, help="prefer clips near this fps (tie-break only)")
    ap.add_argument("--min-fps", type=int, default=0, help="FILTER: only clips that have a file >= this fps (Pexels)")
    ap.add_argument("--size", choices=["large", "medium", "small"], default=None, help="Pexels min size: large=4K, medium=FullHD, small=HD")
    ap.add_argument("--max-pages", type=int, default=5, help="with --min-fps: max Pexels pages (80/page) to scan for qualifying clips")
    ap.add_argument("--min-duration", type=int, default=0, help="skip clips shorter than N seconds")
    ap.add_argument("--preview", action="store_true", help="download only poster thumbnails (to curate)")
    ap.add_argument("--only", default=None, help="comma-separated source ids to fetch (after --preview)")
    ap.add_argument("--lib", default=DEFAULT_LIB)
    ap.add_argument("--locale", default=None, help="Pexels locale, e.g. ru-RU")
    ap.add_argument("--lang", default=None, help="Pixabay lang, e.g. ru")
    ap.add_argument("--dry-run", action="store_true", help="only list results, do not download")
    args = ap.parse_args()

    env = load_env(ENV_PATH)
    pexels_key, pixabay_key = env.get("PEXELS_API_KEY"), env.get("PIXABAY_API_KEY")
    only_ids = {int(x) for x in args.only.split(",") if x.strip().isdigit()} if args.only else set()
    full = not (args.dry_run or args.preview)
    idx = load_index(args.lib) if full else []
    seen = {(e["source"], e["source_id"]) for e in idx}
    grand = 0

    for query in args.queries:
        cat = slug(query)
        cat_dir = os.path.join(args.lib, cat)
        results = []
        # Pexels has no server-side fps param. With --min-fps we paginate (80/page) and filter on
        # video_files.fps, stopping once enough clips offer a >= min_fps file (or pages run out).
        try:
            if args.source in ("pexels", "both"):
                if pexels_key:
                    # Paginate (80/page) when filtering by fps OR fetching curated --only ids,
                    # since either may need clips deeper than one page of `count` results.
                    if args.min_fps or only_ids:
                        for pg in range(1, max(1, args.max_pages) + 1):
                            batch = search_pexels(pexels_key, query, 80, args.orientation, args.locale, args.size, pg)
                            results += batch
                            if only_ids:
                                if only_ids <= {r["id"] for r in results}:
                                    break  # every requested id is now in hand
                            elif sum(1 for r in results
                                     if pick_file_pexels(r["files"], args.max_height, args.prefer_fps, args.min_fps)) >= args.count:
                                break  # enough >=min_fps clips found
                            if len(batch) < 80:
                                break  # last page
                    else:
                        results += search_pexels(pexels_key, query, args.count, args.orientation, args.locale, args.size)
                else:
                    print("[broll] PEXELS_API_KEY missing in .env")
            if args.source in ("pixabay", "both"):
                if pixabay_key:
                    if args.min_fps:
                        print("[broll] note: Pixabay API has no fps -> --min-fps applies to Pexels only")
                    results += search_pixabay(pixabay_key, query, args.count, args.lang)
                else:
                    print("[broll] PIXABAY_API_KEY missing in .env")
        except Exception as e:
            print("[broll] search failed for '%s': %s" % (query, e)); continue

        flt = (", filter >=%dfps" % args.min_fps) if args.min_fps else ""
        print("\n=== %s -> %s (%d found%s) ===" % (query, cat_dir, len(results), flt))
        taken = 0
        for r in results:
            if taken >= args.count and not args.preview and not only_ids:
                break
            if only_ids and r["id"] not in only_ids:
                continue
            if args.min_duration and (r.get("duration") or 0) < args.min_duration:
                continue
            tag = "%s/%s" % (r["source"], r["id"])

            if args.preview:
                if not r.get("poster"):
                    print("  [no-poster] %s" % tag); continue
                pdir = os.path.join(cat_dir, "_preview"); os.makedirs(pdir, exist_ok=True)
                pfile = "%s__%s%s.jpg" % (slug(r["desc"]), r["source"], r["id"])
                try:
                    download(r["poster"], os.path.join(pdir, pfile))
                    print("  [preview] id=%s  %s" % (r["id"], r["desc"][:55]))
                except Exception as e:
                    print("  [fail] poster %s -> %s" % (tag, e))
                continue

            best = pick_file_pexels(r["files"], args.max_height, args.prefer_fps, args.min_fps) if r["_kind"] == "pexels" else pick_file_pixabay(r["files"], args.max_height)
            if not best:
                continue  # no qualifying file (e.g. no >= min_fps version) -> skip within the over-fetched pool
            wh = "%sx%s" % (best.get("w") or "?", best.get("h") or "?")
            fps = round(best.get("fps")) if best.get("fps") else None
            fname = "%s__%s%s__%s%s.mp4" % (slug(r["desc"]), wh, ("_%dfps" % fps) if fps else "", r["source"], r["id"])
            dest = os.path.join(cat_dir, fname)

            if args.dry_run:
                print("  [%s%s] %s  (%s)" % (wh, (" %dfps" % fps) if fps else "", r["desc"][:48], tag)); taken += 1; continue
            if (r["source"], r["id"]) in seen or os.path.exists(dest):
                print("  [have] %s" % fname); taken += 1; continue
            os.makedirs(cat_dir, exist_ok=True)
            try:
                size = download(best["url"], dest)
                rel = os.path.join(cat, fname).replace("\\", "/")
                print("  [ok] %s  (%.1f MB)" % (fname, size / 1e6))
                idx.append({"file": rel, "category": cat, "query": query,
                            "description": r["desc"], "tags": r["tags"], "source": r["source"],
                            "source_id": r["id"], "url": r["url"], "author": r["author"],
                            "width": best.get("w"), "height": best.get("h"),
                            "fps": best.get("fps"), "duration_s": r.get("duration")})
                append_credit(args.lib, rel, r["author"], r["url"], r["source"])
                seen.add((r["source"], r["id"])); grand += 1; taken += 1
            except Exception as e:
                print("  [fail] %s -> %s" % (fname, e))

    if args.preview:
        print("\n[broll] posters saved. Fetch chosen:  --only <id,id>")
    elif full:
        save_index(args.lib, idx)
        print("\n[broll] downloaded %d new clip(s). Library: %s" % (grand, args.lib))
        print("[broll] note: server-side render wants 30fps - normalize when copying into a project's public/.")


if __name__ == "__main__":
    main()
