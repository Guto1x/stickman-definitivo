"""Novelty checker for "What If" episode ideas.

Compares a candidate title (and optional premise) against competitor title lists in
data/story/competitors/<handle>.txt (one video per line: id|duration_s|views|title) and
reports the closest matches with a 0-10 novelty sub-score for the idea rubric.

Run with an isolated interpreter (standard library only):

  python -I tools/ideas/novelty.py check "What If You Could Jump 100x Higher?"
  python -I tools/ideas/novelty.py check "What If You Were Magnetic?" --premise "steel flies to you, cards wipe" --top 8
  python -I tools/ideas/novelty.py batch data/story/ideas_backlog.json [--write]
  python -I tools/ideas/novelty.py refresh                      # all channels in channels.json
  python -I tools/ideas/novelty.py refresh --channels IFOLOGYFILMS IfverseTales
  python -I tools/ideas/novelty.py refresh --add SomeNewHandle  # add a channel and fetch it
  python -I tools/ideas/novelty.py search "what if you could" --n 40   # find new What-If channels
  python -I tools/ideas/novelty.py stats                        # per-channel median + top titles

Refresh uses yt-dlp (must be on PATH):
  yt-dlp --flat-playlist --print "%(id)s|%(duration)s|%(view_count)s|%(title)s" https://www.youtube.com/@<handle>/videos
Downloaded titles are untrusted data: they are only parsed as text, never executed.
"""
import argparse
import datetime as dt
import difflib
import json
import re
import statistics
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COMP = ROOT / "data" / "story" / "competitors"
CHANNELS = COMP / "channels.json"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ---------------------------------------------------------------- normalisation
STOP = set("""what if you your youre you're were was could can had have would a an the to of in on at for and or with
into it its be is are as by from every all any anything anyone everything everyone that this than more
times x part full movie ever just only one day really real happens happen happened about like""".split())
# phrase-level rewrites applied before tokenising (order matters)
PHRASES = [
    (r"(\d)[\s,]*(000)\b", r"\g<1>000"),          # 1,000 -> 1000
    (r"\b(\d+)\s*(x|times)\b", r"\1x"),             # 10 times / 10 x -> 10x
    (r"\bten\b", "10"), (r"\bhundred\b", "100"), (r"\bthousand\b", "1000"),
    (r"\bstop(ped|ping)? time\b", "TIMESTOP"), (r"\bfreez(e|ing) time\b", "TIMESTOP"), (r"\bpause time\b", "TIMESTOP"),
    (r"\btime (stopped|stops|froze|freezes)\b", "TIMESTOP"),
    (r"\brewind( time)?\b", "REWIND"), (r"\bundo\b", "REWIND"), (r"\bgo back in time\b", "REWIND"),
    (r"\btime loop\b", "TIMELOOP"), (r"\b(relive|restart|repeat)\b", "TIMELOOP"),
    (r"\bread(ing)? minds?\b", "TELEPATHY"), (r"\bhear (thoughts|minds)\b", "TELEPATHY"), (r"\bmentalist\b", "TELEPATHY"),
    (r"\bsee (\d+ \w+ )?into the future\b", "PRECOG"), (r"\bsee the future\b", "PRECOG"), (r"\bpredict\b", "PRECOG"),
    (r"\bsee (\d+ \w+ )?into the past\b", "POSTCOG"), (r"\bsee the past\b", "POSTCOG"),
    (r"\bturn invisible\b", "INVISIBLE"), (r"\binvisib\w*\b", "INVISIBLE"),
    (r"\bteleport\w*\b", "TELEPORT"), (r"\bswap places\b", "SWAPPLACE"), (r"\bswap(ped)? bodies\b", "BODYSWAP"),
    (r"\bclone\w*( yourself)?\b", "CLONE"), (r"\bcopy yourself\b", "CLONE"), (r"\bsplit into\b", "CLONE"),
    (r"\bcopy powers?\b", "POWERCOPY"),
    (r"\bshape ?shift\w*\b", "SHAPESHIFT"), (r"\bturn into (anyone|anything|any animal)\b", "SHAPESHIFT"),
    (r"\bmove things with your mind\b", "TELEKINESIS"), (r"\btelekines\w*\b", "TELEKINESIS"),
    (r"\b(fly|flying|flight)\b", "FLIGHT"),
    (r"\b(indestructible|nothing could hurt you|invincib\w*|unbreakable)\b", "INVULN"),
    (r"\b(heal\w*|regenerat\w*)\b", "HEAL"),
    (r"\b(faster|speed|quick\w*|fast)\b", "SPEED"), (r"\breaction time\b", "REACTION"),
    (r"\b(stronger|strength|strong)\b", "STRENGTH"),
    (r"\b(smarter|iq|genius|intelligen\w*)\b", "INTELLECT"),
    (r"\b(shrink|smaller|tiny)\b", "SHRINK"), (r"\b(bigger|grow)\b", "GROW"),
    (r"\b(gravity|weightless\w*|lighter)\b", "GRAVITY"), (r"\b(heavier|heavy)\b", "HEAVY"),
    (r"\b(luck|lucky)\b", "LUCK"), (r"\b(webs?)\b", "WEB"),
    (r"\b(never sleep|no sleep|1 hour of sleep|never get tired|never tired)\b", "NOSLEEP"),
    (r"\b(memory|memories|remember\w*|never forget)\b", "MEMORY"),
    (r"\b(fire|flame\w*)\b", "FIRE"), (r"\b(electric\w*|lightning)\b", "ELECTRIC"), (r"\bmagnet\w*\b", "MAGNET"),
    (r"\b(walk through walls|phase|phasing)\b", "PHASE"), (r"\b(walk on walls|stick to walls|wall ?crawl\w*)\b", "WALLWALK"),
    (r"\b(emotion\w*|feelings?)\b", "EMOTION"), (r"\b(lies|lying|liar|lie)\b", "LIE"),
    (r"\b(jump\w*)\b", "JUMP"), (r"\b(louder|voice|scream\w*|shout\w*)\b", "VOICE"),
    (r"\b(never miss\w*|100% aim|perfect aim|always hit\w*)\b", "AIM"),
    (r"\b(respawn\w*|\d+ lives|extra lives|nine lives)\b", "RESPAWN"), (r"\b(never die|immortal\w*|live forever)\b", "IMMORTAL"),
    (r"\b(money|cash|dollars?|\$\d+|rich)\b", "MONEY"), (r"\b(pain)\b", "PAIN"), (r"\b(shadows?)\b", "SHADOW"),
    (r"\b(control (air|wind)|wind)\b", "WIND"), (r"\b(ice|freez\w*|cold)\b", "COLD"),
    (r"\b(slow\w*)\b", "SLOW"), (r"\bone second\b", "SECOND"), (r"\bhear\w*\b", "HEARING"), (r"\b(see|vision|eyes?)\b", "VISION"),
]
SUFFIX = re.compile(r"(ing|ed|es|s)$")


def norm_text(t):
    t = t.lower().replace("’", "'").replace("&", " and ")
    t = re.sub(r"[\"“”!?.:;()\[\]|#…]+", " ", t)
    for pat, rep in PHRASES:
        t = re.sub(pat, rep, t)
    return re.sub(r"\s+", " ", t).strip()


def tokens(t):
    out = []
    for w in norm_text(t).split():
        if w.isupper():                       # concept token
            out.append(w)
            continue
        w = re.sub(r"[^a-z0-9']", "", w)
        if not w or w in STOP:
            continue
        if not re.match(r"^\d", w) and len(w) > 4:
            w = SUFFIX.sub("", w)
        out.append(w)
    return out


def concepts(toks):
    return {t for t in toks if t.isupper()}


# Concepts that identify a premise on their own ("stop time" == "freeze time").
STRONG = {"TIMESTOP", "REWIND", "TIMELOOP", "TELEPATHY", "PRECOG", "POSTCOG", "INVISIBLE", "TELEPORT", "SWAPPLACE",
          "BODYSWAP", "CLONE", "POWERCOPY", "SHAPESHIFT", "TELEKINESIS", "FLIGHT", "INVULN", "HEAL", "REACTION",
          "INTELLECT", "SHRINK", "NOSLEEP", "LUCK", "WEB", "PHASE", "WALLWALK", "LIE", "RESPAWN", "IMMORTAL", "PAIN", "WIND", "AIM"}
# Everything else (SPEED, STRENGTH, GROW, GRAVITY, HEAVY, MEMORY, FIRE, ELECTRIC, MAGNET, EMOTION, JUMP, VOICE,
# SLOW, SECOND, HEARING, VISION) is generic: it only counts as "same premise" when another word or number also overlaps.


def cweight(c):
    return 1.0 if c in STRONG else 0.5


def personal(t):
    return bool(re.search(r"\b(you|your|you're|yourself|you'd)\b", t.lower()))


def similarity(a, b):
    """0..1 similarity between two titles (token Jaccard + containment + concept overlap + char ratio)."""
    ta, tb = tokens(a), tokens(b)
    sa, sb = set(ta), set(tb)
    if not sa or not sb:
        return 0.0
    jac = len(sa & sb) / len(sa | sb)
    cont = len(sa & sb) / max(min(len(sa), len(sb)), 2)   # a 1-word title is not "fully contained" in everything
    ca, cb = concepts(ta), concepts(tb)
    union = sum(cweight(c) for c in ca | cb)
    con = sum(cweight(c) for c in ca & cb) / union if union else 0.0
    other_a, other_b = sa - ca, sb - cb       # non-concept words (numbers count: "10x heavier" == "10x heavier")
    if not ((ca & cb) & STRONG) and not (other_a & other_b):
        con *= 0.5                            # only a generic concept in common ("magnet", "voice")
    seq = difflib.SequenceMatcher(None, " ".join(ta), " ".join(tb)).ratio()
    nums_a = {t for t in sa if re.match(r"^\d", t)}
    nums_b = {t for t in sb if re.match(r"^\d", t)}
    s = 0.40 * jac + 0.15 * cont + 0.25 * con + 0.20 * seq
    if not (personal(a) and personal(b)):     # "Earth's magnetic poles" is not a personal power
        s *= 0.8
    elif ca and ca == cb:                     # same core power, e.g. TIMESTOP vs TIMESTOP
        if (ca & STRONG) or (other_a & other_b) or (not other_a and not other_b):
            s = max(s, 0.62 + 0.2 * jac)
    if nums_a and nums_b and nums_a != nums_b and con > 0:
        s -= 0.05                             # 10x vs 1000x of the same power: related, not identical
    plain_a, plain_b = other_a - nums_a, other_b - nums_b
    if not ((ca & cb) & STRONG) and not (plain_a & plain_b) and (plain_a ^ plain_b):
        s = min(s, 0.7)                       # only "10x" + a generic concept shared ("Sleep 10x Faster" vs "10x Faster")
    return round(max(0.0, min(1.0, s)), 3)


# ---------------------------------------------------------------- data
def load_lists():
    rows = []
    for f in sorted(COMP.glob("*.txt")):
        handle = f.stem
        for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
            parts = line.strip().split("|", 3)
            if len(parts) < 4 or not parts[3].strip():
                continue
            vid, dur, views, title = parts
            v = int(views) if views.isdigit() else None
            rows.append({"channel": handle, "id": vid, "dur": dur, "views": v, "title": title.strip()})
    return rows


def verdict(s):
    return "DUPLICATE" if s >= 0.8 else "CLOSE" if s >= 0.55 else "RELATED" if s >= 0.35 else "NOVEL"


def novelty_score(matches):
    """10 = nothing similar; 0 = exact premise already a hit. Penalise by the best match's views."""
    if not matches:
        return 10
    best = 10.0
    for m in matches[:5]:
        s, v = m["score"], m["views"] or 0
        if s < 0.35:
            cand = 10 - 3 * s
        elif s < 0.55:
            cand = 8 - 5 * (s - 0.35)
        elif s < 0.8:
            cand = 5.5 - 8 * (s - 0.55)
        else:
            cand = 2.5 - 5 * (s - 0.8)
        if s >= 0.55:
            cand -= 1.5 if v >= 100_000 else 0.75 if v >= 10_000 else 0
        best = min(best, cand)
    return max(0, round(best))


def check(title, premise="", top=8, rows=None):
    rows = rows if rows is not None else load_lists()
    scored = []
    for r in rows:
        s = similarity(title, r["title"])
        if premise:
            s = max(s, round(0.85 * similarity(premise, r["title"]), 3))
        if s > 0.2:
            scored.append({**r, "score": s, "verdict": verdict(s)})
    scored.sort(key=lambda r: (-r["score"], -(r["views"] or 0)))
    return {"title": title, "novelty": novelty_score(scored), "verdict": verdict(scored[0]["score"]) if scored else "NOVEL",
            "matches": scored[:top], "titles_checked": len(rows)}


def print_check(res):
    print(f"\n{res['title']}\n  novelty {res['novelty']}/10  verdict {res['verdict']}  (checked {res['titles_checked']} titles)")
    for m in res["matches"]:
        v = f"{m['views']:,}" if m["views"] else "?"
        print(f"   {m['score']:.2f} {m['verdict']:<9} {v:>11}  {m['channel']:<22} {m['title']}")


# ---------------------------------------------------------------- refresh / search
def load_channels():
    if CHANNELS.exists():
        return json.loads(CHANNELS.read_text(encoding="utf-8"))
    return {"channels": []}


def save_channels(cfg):
    CHANNELS.write_text(json.dumps(cfg, indent=1, ensure_ascii=False), encoding="utf-8")


def fetch(handle, timeout=240):
    url = f"https://www.youtube.com/@{handle}/videos"
    cmd = ["yt-dlp", "--flat-playlist", "--ignore-errors", "--no-warnings",
           "--print", "%(id)s|%(duration)s|%(view_count)s|%(title)s", url]
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as e:
        return None, str(e)
    lines = [ln.strip() for ln in p.stdout.splitlines() if ln.count("|") >= 3]
    if not lines:
        return None, (p.stderr or "no output").strip()[:300]
    return lines, None


def refresh(handles):
    cfg = load_channels()
    known = {c["handle"]: c for c in cfg["channels"]}
    for h in handles:
        lines, err = fetch(h)
        if lines is None:
            print(f"  {h}: FAILED ({err})")
            continue
        (COMP / f"{h}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
        c = known.setdefault(h, {"handle": h, "note": ""})
        c["videos"] = len(lines)
        c["refreshed"] = dt.date.today().isoformat()
        print(f"  {h}: {len(lines)} videos")
    cfg["channels"] = sorted(known.values(), key=lambda c: c["handle"].lower())
    save_channels(cfg)


def search(query, n):
    cmd = ["yt-dlp", "--flat-playlist", "--no-warnings", "--print",
           "%(channel)s|%(uploader_id)s|%(view_count)s|%(title)s", f"ytsearch{n}:{query}"]
    p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=300)
    known = {c["handle"].lower() for c in load_channels()["channels"]}
    seen = {}
    for ln in p.stdout.splitlines():
        parts = ln.split("|", 3)
        if len(parts) < 4:
            continue
        ch, uid, views, title = parts
        h = uid.lstrip("@")
        seen.setdefault((ch, h), []).append((views, title))
    for (ch, h), vids in sorted(seen.items(), key=lambda kv: -len(kv[1])):
        tag = "known" if h.lower() in known else "NEW  "
        print(f"  {tag} @{h:<26} {ch[:28]:<28} {len(vids)} hit(s): {vids[0][1][:60]} ({vids[0][0]})")


def stats():
    rows = load_lists()
    by = {}
    for r in rows:
        by.setdefault(r["channel"], []).append(r)
    for ch, rs in sorted(by.items()):
        vs = [r["views"] for r in rs if r["views"]]
        med = statistics.median(vs) if vs else 0
        print(f"\n@{ch}: {len(rs)} videos, median views {med:,.0f}")
        for r in sorted([r for r in rs if r["views"]], key=lambda r: -r["views"])[:5]:
            print(f"   {r['views']:>11,} ({r['views'] / med if med else 0:4.1f}x)  {r['title']}")


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("check")
    c.add_argument("title")
    c.add_argument("--premise", default="")
    c.add_argument("--top", type=int, default=8)
    c.add_argument("--json", action="store_true")
    b = sub.add_parser("batch")
    b.add_argument("file")
    b.add_argument("--write", action="store_true", help="write novelty results back into the ideas file")
    b.add_argument("--top", type=int, default=3)
    r = sub.add_parser("refresh")
    r.add_argument("--channels", nargs="*")
    r.add_argument("--add", nargs="*", default=[])
    s = sub.add_parser("search")
    s.add_argument("query")
    s.add_argument("--n", type=int, default=30)
    sub.add_parser("stats")
    a = ap.parse_args()

    if a.cmd == "check":
        res = check(a.title, a.premise, a.top)
        print(json.dumps(res, indent=1, ensure_ascii=False) if a.json else "", end="")
        if not a.json:
            print_check(res)
    elif a.cmd == "batch":
        path = Path(a.file)
        data = json.loads(path.read_text(encoding="utf-8"))
        ideas = data["ideas"] if isinstance(data, dict) else data
        rows = load_lists()
        for idea in ideas:
            res = check(idea["title"], "", a.top, rows)
            print_check(res)
            if a.write:
                idea["novelty_check"] = {
                    "date": dt.date.today().isoformat(), "novelty": res["novelty"], "verdict": res["verdict"],
                    "closest": [{"title": m["title"], "channel": m["channel"], "views": m["views"], "score": m["score"]} for m in res["matches"][:a.top]],
                }
        if a.write:
            path.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
            print(f"\nwrote novelty_check into {path}")
    elif a.cmd == "refresh":
        cfg = load_channels()
        handles = a.channels if a.channels else [c["handle"] for c in cfg["channels"]]
        for h in a.add:
            if h not in handles:
                handles.append(h)
        refresh(handles)
    elif a.cmd == "search":
        search(a.query, a.n)
    elif a.cmd == "stats":
        stats()


if __name__ == "__main__":
    main()
