"""Extract small fields from yt-dlp info.json. Usage: python -I info_fields.py <info.json> <out.json>"""
import json, sys
sys.stdout.reconfigure(encoding="utf-8")
d = json.load(open(sys.argv[1], encoding="utf-8"))
keep = {k: d.get(k) for k in ["id", "title", "duration", "view_count", "like_count", "comment_count", "upload_date", "description", "tags", "chapters", "categories"]}
json.dump(keep, open(sys.argv[2], "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(json.dumps(keep, indent=1, ensure_ascii=False))
