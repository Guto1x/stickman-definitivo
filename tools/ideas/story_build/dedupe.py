"""Rolling ASR SRT -> deduped segments [{start,end,text}] (text keeps '>>' speaker-change marks).
Usage: python -I dedupe.py <in.srt> <out.json> [<out.txt>]"""
import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")
TS = r"(\d+):(\d\d):(\d\d)[.,](\d{3})"
def t2s(h, m, s, ms): return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000
raw = open(sys.argv[1], encoding="utf-8", errors="replace").read().replace("\r", "")
lines = raw.split("\n")
tsi = [(i, re.match(TS + r"\s*-->\s*" + TS, ln)) for i, ln in enumerate(lines)]
tsi = [(i, m) for i, m in tsi if m]
segs, prev = [], None
for k, (i, m) in enumerate(tsi):
    nxt = tsi[k+1][0] if k+1 < len(tsi) else len(lines)
    body = lines[i+1:nxt]
    if k+1 < len(tsi) and body and re.fullmatch(r"\d+", body[-1].strip()):
        body = body[:-1]
    g = m.groups(); st, en = t2s(*g[:4]), t2s(*g[4:])
    if en - st < 0.05: continue
    body = [l for l in body if l.strip()]
    if not body: continue
    last = body[-1].strip()
    if last == prev: continue
    prev = last
    segs.append(dict(start=round(st, 2), end=round(en, 2), text=last))
json.dump(segs, open(sys.argv[2], "w", encoding="utf-8"), indent=0, ensure_ascii=False)
if len(sys.argv) > 3:
    with open(sys.argv[3], "w", encoding="utf-8") as fh:
        for s in segs:
            fh.write(f"{int(s['start']//60)}:{int(s['start']%60):02d} {s['text']}\n")
print(len(segs), "segments")
