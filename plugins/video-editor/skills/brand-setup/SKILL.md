---
name: brand-setup
description: Set someone's video look once (caption font, colours, highlight colour, caption case) and save it as a brand.json file the video-editor skill uses for every video. Use when someone asks to use their brand colours or font in their videos, says "make the captions match my brand", or wants to change their default video look.
---

# Brand setup

Make one small file that sets how every edited video looks, so the person never has to explain it again.

**Done means:** a `brand.json` that the video-editor skill accepts, every text colour passing 4.5:1 contrast on its background, shown to the person on a sample still, and shared with them as a file they keep (with a note to attach it, or keep it in their connected folder, whenever they want an edit in their look).

## 1. Ask (one message)

1. Your main brand colour, and a second one if you have it (a hex code like #1F6E6A, or describe it, or share your logo or website and I'll pick them).
2. Your brand font, if you know it. (Google Fonts names work best. I can't use fonts you'd have to buy unless you send me the file and you're allowed to use it in videos.)
3. Captions in normal case, all lower case or ALL CAPS?

## 2. Build it

Start from `../video-editor/assets/brand-default.json` and change only what they asked:
- `colors.accent`: the highlight chip and the big hook bar. Their main colour.
- `colors.accent_text`: black (#111111) or white (#FFFFFF), whichever reads better on the accent.
- `colors.bar` / `colors.bar_text`: the small hook line. White with dark text, or their second colour with the text colour that reads on it.
- `caption.case`: `as-spoken`, `lower` or `upper`.
- Font: for a Google Font, download its file from `https://github.com/google/fonts/tree/main/ofl/<family-lowercase>` (check the folder holds an `OFL.txt`; skip any font that isn't under the Open Font License), save it next to `brand.json`, and set `font_file` to the file name and `font_family` to the family name. Prefer the variable file (`<Family>[wght].ttf`). Heavy weights read best in captions.

Check contrast for `accent_text` on `accent` and `bar_text` on `bar` (at least 4.5:1). If their colour fails with both black and white text, say so and suggest a darker or lighter shade of it.

## 3. Show it

Render a still so they see it on a real frame: run the video-editor's practice project or their last project with the new brand (`BRAND=<path to brand.json> bash ../video-editor/scripts/render.sh <project> brand-preview --draft`), then take a frame at about 1 second and show it. Ask "Happy with this look?" and adjust once if needed.

## 4. Hand it over

Share `brand.json` (and the font file) with them. Tell them: "Attach this file when you send a video to edit, or keep it in the folder you connect, and I'll use your look every time."
