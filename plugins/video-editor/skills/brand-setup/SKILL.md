---
name: brand-setup
description: Set someone's video look once and save it as their brand kit, so every edit comes out in their brand. Collects their colours, font, logo, caption style, transition style, sound and end card (from their website, a logo file or a few questions), saves brand/brand.json with the files beside it, and shows the look on a real frame before they keep it. Use when someone asks to put their brand, colours, font or logo in their videos, says "make the captions match my brand", wants a different caption style, or is setting up the Handoff video studio.
---

# Brand setup

Make the person's brand kit, once: `brand/brand.json` plus their logo and font files in the same folder. Every edit reads it.

**Done means:** `brand/brand.json` exists and follows the schema below, every text colour passes 4.5:1 contrast on its background, the person saw their look on a real frame (the practice clip or their last video) and said yes.

Run scripts as plain `node "<full path>"` commands, as the video-editor skill says. `SKILL` is the video-editor skill's folder (`../video-editor` from this file); `references/styles.md` there explains every choice.

## 1. Gather (one message, then follow up only on gaps)

Ask:
1. "Do you have a website? I'll pick your colours and logo from it." (Read the page: theme colour, buttons and headings for colours; the logo image, or the social share image if it's the logo.)
2. "Drop your logo file into the **brand** folder (a PNG with a transparent background is best), or tell me to use the one from your website."
3. "Your main brand colour, and a second one if you have it (a colour name like 'dark green' or a code like #1F6E6A)."
4. "Your brand font, if you know it." Google Fonts names work best. Never use a font they'd have to buy unless they give you the file and say they're allowed to use it in videos.
5. "Which caption style feels like you: **Bold** (big words, highlighted chips), **Clean** (words on a soft dark plate) or **Punchy** (all caps, two words at a time)?"
6. "Transitions: **Simple** (zooms only), **Swipe** (a slanted colour panel at the big moments) or **Flash** (a quick white flash)?"
7. "Sound effects on or off? And should your videos end on your logo with a short line, like 'Follow for more tips'?"

## 2. Build it

Start from `SKILL/assets/brand-default.json` and write `brand/brand.json`:

```json
{
  "name": "Their business",
  "colors": { "accent": "#1F6E6A", "accent_text": "#FFFFFF", "bar": "#FFFFFF", "bar_text": "#111111", "caption": "#FFFFFF" },
  "font": { "family": "DM Sans", "file": "fonts/DMSans[opsz,wght].ttf" },
  "captions": { "style": "bold-chip", "case": "as-spoken" },
  "transition": "wipe",
  "sound": { "pack": "auto", "volume": 0.2 },
  "logo": { "file": "logo.png" },
  "end_card": { "enabled": true, "line": "Follow for more tips" }
}
```

- `accent`: their main colour (highlight chips, the big hook bar, the swipe). `accent_text`: black (#111111) or white (#FFFFFF), whichever reads on it.
- `bar` / `bar_text`: the small hook line; white with dark text, or their second colour with the text colour that reads on it.
- Caption style values: `bold-chip`, `clean-plate`, `punchy`. Transition values: `punch`, `wipe`, `flash`. Sound `pack`: `auto` or `off`.
- **Font:** find the family in Google Fonts' open-source repository: `node "SKILL/scripts/fetch.mjs" https://api.github.com/repos/google/fonts/contents/ofl/<family-lowercase-no-spaces> brand/fonts/listing.json`, read it, check it has an `OFL.txt` (skip any font without one), then download the `.ttf` (prefer the variable one with `[wght]` in the name) and `OFL.txt` with `fetch.mjs` into `brand/fonts/`. Set `font.file` to the path relative to `brand/`.
- **Logo:** save it as `brand/logo.png` (or keep its own name and set `logo.file`). A dark logo on the dimmed end card can disappear: if it's dark, ask for a white or light version, or turn the end card line on without the logo.
- Check contrast for `accent_text` on `accent` and `bar_text` on `bar` (at least 4.5:1). If their colour fails with both black and white text, say so and suggest a darker or lighter shade of it.

## 3. Show it

Rebuild the practice video (or their last project) in the new look as a quick draft: `node "SKILL/scripts/render.mjs" projects/practice brand-preview --draft`, then `node "SKILL/scripts/qa.mjs" projects/practice projects/practice/final/brand-preview.mp4 --no-words` and show them `projects/practice/final/qa/sheet.jpg` (the hook, a highlighted word and the end card). Ask "Keep this look?" and adjust once if needed.

## 4. Hand over

Tell them: "Your brand kit is saved in the **brand** folder. Every video I edit here uses it. Say 'change my brand' any time to adjust it."
