"""Deduped segments -> sentence list with timestamps + turn info + paragraphs markdown.
Usage: python -I build_transcript.py <segs.json> <meta.json> <overrides.json|-> <out_sent.json> <out.md>
overrides.json: {"dialogue": {"<sentence-prefix>": "Speaker"}, "narration": ["<sentence-prefix>", ...],
                 "fix": {"wrong text": "right text"}}
"""
import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")
segs = json.load(open(sys.argv[1], encoding="utf-8"))
meta = json.load(open(sys.argv[2], encoding="utf-8"))
ov = json.load(open(sys.argv[3], encoding="utf-8")) if sys.argv[3] != "-" else {}
fix = ov.get("fix", {})
TAGS = re.compile(r"\[(music|applause|laughter|Music|Applause|Laughter)\]")
# 1. word stream with interpolated times + turn markers
words = []  # (t, word, newturn)
for s in segs:
    txt = s["text"]
    newturn = txt.startswith(">>")
    txt = txt.replace(">>", " ")
    txt = TAGS.sub(" ", txt)
    toks = txt.split()
    if not toks:
        continue
    dur = max(s["end"] - s["start"], 0.3)
    for i, w in enumerate(toks):
        words.append([s["start"] + dur * i / len(toks), w, newturn and i == 0])
# 2. turns
turns, cur = [], []
for t, w, nt in words:
    if nt and cur:
        turns.append(cur); cur = []
    cur.append((t, w))
if cur: turns.append(cur)
# 3. sentences per turn
END = re.compile(r"[.?!]+[\"”']?$")
sents = []
for ti, turn in enumerate(turns):
    buf = []
    for j, (t, w) in enumerate(turn):
        buf.append((t, w))
        nxt = turn[j+1][1] if j+1 < len(turn) else None
        if END.search(w) and (nxt is None or nxt[0].isupper() or nxt[0].isdigit() or nxt[0] in "\"“"):
            # avoid splitting on decimals like 9.58 (handled since END requires terminal punct at token end)
            sents.append(dict(t=buf[0][0], text=" ".join(x[1] for x in buf), turn=ti, turn_words=len(turn)))
            buf = []
    if buf:
        sents.append(dict(t=buf[0][0], text=" ".join(x[1] for x in buf), turn=ti, turn_words=len(turn)))
for s in sents:
    for a, b in fix.items():
        s["text"] = s["text"].replace(a, b)
# 4. classify
dmap = ov.get("dialogue", {})
nlist = ov.get("narration", [])
for s in sents:
    spk = None
    def hit(key):
        pre, _, at = key.partition("@")
        return s["text"].startswith(pre) and (not at or abs(s["t"] - float(at)) < 10)
    for key, who in dmap.items():
        if hit(key):
            spk = who; break
    if spk is None and not any(hit(k) for k in nlist):
        if s["turn_words"] <= 14 and s["turn"] > 0:
            spk = "Character"
    s["speaker"] = spk
def fmt(t): return f"{int(t//60):02d}:{int(t%60):02d}"
# 5. paragraphs
TRANS = re.compile(r"^(So,|So |But |And then|Now,|Then |That night|The (first|second|third|fourth|fifth) (problem|rule)|Rule|Problem|For a while|Here's|And here's|One (day|morning|night|Saturday)|Years? later|Meanwhile|Months? later|Weeks? later|Next|Inside|Outside|By |At first)")
paras, curp = [], None
for s in sents:
    if s["speaker"]:
        if curp: paras.append(curp); curp = None
        paras.append(dict(t=s["t"], speaker=s["speaker"], text=s["text"]))
        continue
    if curp is None:
        curp = dict(t=s["t"], speaker=None, text=s["text"])
        continue
    age = s["t"] - curp["t"]
    if (age > 18 and TRANS.match(s["text"])) or age > 32:
        paras.append(curp); curp = dict(t=s["t"], speaker=None, text=s["text"])
    else:
        curp["text"] += " " + s["text"]
if curp: paras.append(curp)
# merge consecutive same-speaker dialogue lines
merged = []
for p in paras:
    if merged and p["speaker"] and merged[-1]["speaker"] == p["speaker"] and p["t"] - merged[-1]["t"] < 6:
        merged[-1]["text"] += " " + p["text"]
    else:
        merged.append(dict(p))
json.dump(sents, open(sys.argv[4], "w", encoding="utf-8"), indent=0, ensure_ascii=False)
nw = sum(len(re.findall(r"[A-Za-z0-9][\w'’.,-]*", s["text"])) for s in sents)
dw = sum(len(re.findall(r"[A-Za-z0-9][\w'’.,-]*", s["text"])) for s in sents if s["speaker"])
chap = meta.get("chapters") or []
ci = 0
with open(sys.argv[5], "w", encoding="utf-8") as fh:
    fh.write(f"# {meta['title']} ({meta['id']})\n\n")
    fh.write(f"IFOLOGY FILMS. Duration {fmt(meta['duration'])}, {meta['view_count']:,} views at download. "
             f"Source: YouTube auto-captions (ASR), deduplicated and merged into sentences; [music] tags removed; "
             f"ASR misspellings kept unless obvious. ~{nw} spoken words, ~{dw} in character dialogue ({100*dw/max(nw,1):.0f}%).\n\n")
    fh.write("**Private local training data for pattern analysis only. Do not reuse lines in scripts.**\n\n")
    fh.write("Format: `[mm:ss]` paragraph start. Narrator (2nd person) is unmarked; character lines are `> **Speaker:** line`. "
             "Speaker attribution is inferred from ASR speaker-change marks and context, so treat it as approximate. "
             "`## ` headings are the creator's YouTube chapters.\n\n")
    for p in merged:
        while ci < len(chap) and chap[ci]["start_time"] <= p["t"] + 0.5:
            fh.write(f"\n## [{fmt(chap[ci]['start_time'])}] {chap[ci]['title']}\n\n"); ci += 1
        if p["speaker"]:
            fh.write(f"> **{p['speaker']}:** {p['text']}  \n\n")
        else:
            fh.write(f"[{fmt(p['t'])}] {p['text']}\n\n")
print(meta["id"], "sentences", len(sents), "words", nw, "dialogue words", dw, "paras", len(merged))
