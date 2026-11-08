"""Join hand-annotated beats with transcript sentences + shot cuts; write data/story/beats/<id>.json.
Usage: python -I beat_stats.py <beats_src.json> <sents.json> <meta.json> <report.json> <out.json>
"""
import json, re, statistics as st, sys
from collections import defaultdict

sys.stdout.reconfigure(encoding="utf-8")
src = json.load(open(sys.argv[1], encoding="utf-8"))
sents = json.load(open(sys.argv[2], encoding="utf-8"))
meta = json.load(open(sys.argv[3], encoding="utf-8"))
rep = json.load(open(sys.argv[4], encoding="utf-8"))[src["id"]]
cuts = rep["cut_times"]
dur = float(meta["duration"])


def sec(x):
    if isinstance(x, (int, float)):
        return float(x)
    if not re.match(r"^\d+:\d\d$", x):
        return None
    m, s = x.split(":")
    return int(m) * 60 + int(s)


def fmt(t):
    return f"{int(t // 60)}:{int(round(t % 60)):02d}" if t is not None else None


WORD = re.compile(r"[A-Za-z0-9][\w'’.,$-]*")
NUM = re.compile(r"(?<![A-Za-z])(\d[\d,.]*)|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|fifty|hundred|thousand|million|half|fifth|tenth|hundredth)\b", re.I)
for s in sents:
    s["w"] = len(WORD.findall(s["text"]))
    s["nums"] = len([m for m in NUM.finditer(s["text"]) if m.group(1)])

beats = src["beats"]
for b in beats:
    b["start"], b["end"] = sec(b["start"]), sec(b["end"])
for i, b in enumerate(beats):
    a, e = b["start"], b["end"]
    inb = [s for s in sents if a <= s["t"] < e]
    words = sum(s["w"] for s in inb)
    dlg = [s for s in inb if s.get("speaker")]
    # dialogue lines = runs of consecutive dialogue sentences with the same speaker
    lines, prev = 0, None
    for s in inb:
        k = s.get("speaker")
        if k and k != prev:
            lines += 1
        prev = k
    c = [t for t in cuts if a <= t < e]
    d = e - a
    b.update({
        "dur": round(d, 1),
        "words": words,
        "wpm": round(words / d * 60) if d > 0 else 0,
        "dialogue_words": sum(s["w"] for s in dlg),
        "dialogue_lines": lines,
        "cuts": len(c),
        "cuts_per_min": round(len(c) / d * 60, 1) if d > 0 else 0,
        "t": f"{fmt(a)}-{fmt(e)}",
        "pct": [round(100 * a / dur, 1), round(100 * e / dur, 1)],
    })

# --- video-level stats
words = sum(s["w"] for s in sents)
dlg_words = sum(s["w"] for s in sents if s.get("speaker"))
lines, prev = 0, None
for s in sents:
    k = s.get("speaker")
    if k and k != prev:
        lines += 1
    prev = k
by_type = defaultdict(lambda: {"count": 0, "total_s": 0.0})
for b in beats:
    by_type[b["beat"]]["count"] += 1
    by_type[b["beat"]]["total_s"] += b["dur"]
for k, v in by_type.items():
    v["total_s"] = round(v["total_s"], 1)
    v["pct_runtime"] = round(100 * v["total_s"] / dur, 1)


def intervals(ts):
    ts = sorted(ts)
    gaps = [b - a for a, b in zip(ts, ts[1:])]
    return {"count": len(ts), "mean_gap_s": round(st.mean(gaps), 1) if gaps else None,
            "median_gap_s": round(st.median(gaps), 1) if gaps else None,
            "max_gap_s": round(max(gaps), 1) if gaps else None}


acts = []
for a in src["acts"]:
    s0, e0 = sec(a["start"]), sec(a["end"])
    ab = [b for b in beats if b["act"] == a["act"]]
    c = [t for t in cuts if s0 <= t < e0]
    acts.append({"act": a["act"], "name": a["name"], "t": f"{fmt(s0)}-{fmt(e0)}",
                 "start_pct": round(100 * s0 / dur, 1), "end_pct": round(100 * e0 / dur, 1),
                 "dur_s": round(e0 - s0, 1), "beats": len(ab),
                 "words": sum(b["words"] for b in ab),
                 "cuts_per_min": round(len(c) / (e0 - s0) * 60, 1)})


def first(pred):
    for s in sents:
        if pred(s):
            return round(s["t"], 1)
    return None


txt_all = " ".join(s["text"] for s in sents)
quip_beats = [b for b in beats if b["quip"]]
comic = [b for b in beats if "comic_beat" in b["devices"] or "comic_callback" in b["devices"] or "comic_list" in b["devices"]]
turn_beats = ("but_turn", "real_problem", "reversal", "inciting_crisis", "dilemma", "reveal", "cliffhanger", "misuse", "tone_shift")
stats = {
    "duration_s": dur, "duration": fmt(dur),
    "views": meta.get("view_count"),
    "words": words, "wpm_runtime": round(words / dur * 60, 1),
    "dialogue_words": dlg_words, "dialogue_pct": round(100 * dlg_words / words, 1),
    "dialogue_lines": lines, "dialogue_lines_per_min": round(lines / dur * 60, 2),
    "seconds_per_dialogue_line": round(dur / max(lines, 1), 1),
    "sentences": len(sents), "avg_sentence_words": round(words / len(sents), 1),
    "questions": txt_all.count("?"), "questions_per_min": round(txt_all.count("?") / dur * 60, 2),
    "number_tokens": sum(s["nums"] for s in sents), "number_tokens_per_min": round(sum(s["nums"] for s in sents) / dur * 60, 2),
    "remember_count": len(re.findall(r"\bremember\b", txt_all, re.I)),
    "but_sentences": sum(1 for s in sents if re.match(r"^(But|but)\b", s["text"])),
    "title_question_s": first(lambda s: s["text"].lower().startswith("so, what if")),
    "first_number_s": first(lambda s: s["nums"] > 0),
    "first_but_turn_s": next((b["start"] for b in beats if b["beat"] == "but_turn" or (b["beat"] == "cost")), None),
    "beats": len(beats),
    "beat_mean_s": round(st.mean(b["dur"] for b in beats), 1),
    "beat_median_s": round(st.median(b["dur"] for b in beats), 1),
    "beat_types": dict(sorted(by_type.items(), key=lambda kv: -kv[1]["total_s"])),
    "acts": acts,
    "new_info_cadence": intervals([b["start"] for b in beats if b["new_info"]]),
    "escalation_cadence": intervals([b["start"] for b in beats if b["escalation"]]),
    "turn_cadence": intervals([b["start"] for b in beats if b["beat"] in turn_beats]),
    "quip_beats": len(quip_beats), "quip_beats_per_min": round(len(quip_beats) / dur * 60, 2),
    "comic_beats": len(comic), "comic_beat_every_s": round(dur / max(len(comic), 1), 1),
    "cuts_total": len(cuts), "cuts_per_min": round(len(cuts) / dur * 60, 1), "avg_shot_s": round(dur / (len(cuts) + 1), 2),
    "words_per_shot": round(words / (len(cuts) + 1), 1),
    "top_cut_density_beats": [{"t": b["t"], "beat": b["beat"], "cuts_per_min": b["cuts_per_min"], "summary": b["summary"][:90]} for b in sorted([b for b in beats if b["dur"] >= 8], key=lambda b: -b["cuts_per_min"])[:6]],
    "top_spectacle_beats": [{"t": b["t"], "beat": b["beat"], "spectacle": b["spectacle"], "cuts_per_min": b["cuts_per_min"], "visual": b["visual"]} for b in sorted(beats, key=lambda b: (-b["spectacle"], -b["cuts_per_min"]))[:6]],
    "stakes_curve": [[b["t"], b["stakes"]] for b in beats],
    "open_loops": src.get("loops", []),
}
out = {
    "id": src["id"], "title": meta["title"], "channel": "IFOLOGY FILMS",
    "note": "Hand-annotated beats (summaries are paraphrases, not quotes). words/wpm/dialogue from deduplicated ASR sentences (data/story/transcripts); cuts from shot detection (research/sheets/report.json). spectacle = 1-5 judged from the 24-frame contact sheets + cut density + what the narration stages. Acts are analytic, not the creator's.",
    "fields": {"stakes": "1 comic/inconvenient .. 5 life/death or identity", "quip": "beat contains a short character line or punchline", "new_info": "beat introduces a new fact, rule, problem or plot information", "escalation": "beat raises scale or stakes vs the previous one"},
    "stats": stats,
    "beats": beats,
}
json.dump(out, open(sys.argv[5], "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(src["id"], "words", words, "wpm", stats["wpm_runtime"], "lines", lines, "beats", len(beats), "cuts/min", stats["cuts_per_min"])
print("  acts", [(a["act"], a["t"], a["start_pct"]) for a in acts])
print("  new_info", stats["new_info_cadence"], "esc", stats["escalation_cadence"], "turns", stats["turn_cadence"])
print("  quip beats/min", stats["quip_beats_per_min"], "comic every", stats["comic_beat_every_s"], "dlg lines/min", stats["dialogue_lines_per_min"], "nums/min", stats["number_tokens_per_min"], "q/min", stats["questions_per_min"])
print("  top cuts", [(x["t"], x["beat"], x["cuts_per_min"]) for x in stats["top_cut_density_beats"]])
print("  title q", stats["title_question_s"], "first num", stats["first_number_s"])
print("  types", {k: (v["count"], v["total_s"]) for k, v in stats["beat_types"].items()})
