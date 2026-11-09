# Fish Audio: thumbnail-mode first-connect checklist

Fish Audio is used only for `fish`-mode thumbnail image generation (GPT Image 2.5 via Fish's media API) — see docs/pipeline/EPISODE.md step 10. Voice no longer uses Fish; see `docs/ELEVENLABS_SETUP.md` for that.

The current thumbnail mode is `chatgpt` (`thumbnails/config.json`), which doesn't need Fish at all. Run this checklist only if the user switches `mode` to `fish`, or asks to set it up. Their tool names end in `get_media_model`, `list_media_models`, `create_media_upload`, `get_credit_balance`, `list_my_workspaces`. If they appear only as deferred tools, load them with ToolSearch first.

Run this checklist again whenever the Fish account changes: the thumbnail reference keys must be reachable from the connected team.

## Choices made at setup

- Thumbnails: `chatgpt` mode, chosen at setup: skip steps 1–2 unless the user switches to `fish`

## Steps

1. **Thumbnail model.**
   1. Call `get_media_model` with the `model_id` in `thumbnails/config.json` (`gpt-image-2.5-flare`).
   2. Check that it accepts the `parameters` there (16:9, 2K, medium) and `ref` image inputs, and keep its `parameter_schema`.
   3. If the model is gone or renamed, call `list_media_models`, propose the closest GPT Image model, and ask before you change `config.json`.

2. **Thumbnail references.** The `object_key`s in `thumbnails/refs/refs.json` belong to the Fish workspace the project was packed from, so upload the three images again, in order. Uploads are free.
   1. `list_my_workspaces` gives the `workspace_id`.
   2. For each `thumbnails/refs/<file>`, call `create_media_upload` with `file_name` (`ref1_paused.webp`, etc.), the exact byte size and `image/webp`.
   3. PUT the file to the returned `upload_url`: `curl.exe -X PUT -H "Content-Type: image/webp" --data-binary "@thumbnails/refs/<file>" "<upload_url>"`.
   4. Write each new `object_key` into `refs.json`, keeping the order, and set `uploaded` to today's date.

3. **Finish.**
   - Add "Last run: <date>, team <name>" under the title of this file and keep the file, for the next account change.
   - Tell the user what was checked, what changed, and what it cost.

## Costs to keep in mind

- Thumbnails (`fish` mode): 1,601 credits per 2K variant, so 3 variants are about 4.8k per episode.
- Fish AI video models are not used for episodes. A clip costs 1.4k–53k credits, and the procedural engine is free.
