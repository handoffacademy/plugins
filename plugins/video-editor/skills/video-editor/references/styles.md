# Looks: captions, transitions, sound and the end card

Everything here is set once in the person's `brand/brand.json` and used by every edit. Offer the choices in plain words; the names in brackets are the values to write.

## Caption styles (`captions.style`)

| Say | Value | Looks like | Best for |
|---|---|---|---|
| "Bold" | `bold-chip` | Heavy white words with a dark glow; key words on a brand-colour chip with a white outline, a soft click when each one lands | Most talking-head reels (default) |
| "Clean" | `clean-plate` | White words on a rounded dark plate; key words in the brand colour | Busy or bright backgrounds, calm or premium brands |
| "Punchy" | `punchy` | Big ALL-CAPS words, two at a time, each popping in; key words in the brand colour | High-energy tips, hype, younger audiences |

Also: `captions.case` (`as-spoken`, `lower`, `upper`) and `captions.size` (px, default 78; 92 for punchy). Every style breaks lines at cuts and pauses, shows at most 16 letters, and lights each word as it's spoken.

## Transitions (`transition`)

Every cut gets a zoom (a "punch-in"), which hides the jump. On top of that, one accent transition marks the story's turns: the cut out of the opener and the cut into the payoff, at most twice per video. Two transition types per video is the ceiling; more reads as "try hard".

| Say | Value | What happens |
|---|---|---|
| "Simple" | `punch` | Zooms only (default) |
| "Swipe" | `wipe` | A slanted brand-colour panel sweeps across the cut in about 0.3 s, with a whoosh |
| "Flash" | `flash` | A quick white flash on the cut (2 frames in, 5 out), with a whoosh |

`plan.json` `transition_at` (cut numbers, 1 = first cut) picks the cuts by hand.

## Sound (`sound`)

- `pack`: `auto` uses HyperFrames' sound library when its plugin is installed (impact on the hook, short whooshes on zooms and turns, soft clicks on key words, a chime into the end), else the editor's own pop, whoosh and chime; `basic` always uses the editor's own; `off` is silent.
- `volume`: 0.12 to 0.3 under the voice (default 0.2). About one sound every 3 to 4 seconds at most; a run of the same sound counts once.
- `music`: a track the person owns, placed in `brand/` (for example `"music": "my-track.mp3"`), played low under the voice (`music_volume`, default 0.08). Never a track you found online. Talking-head tips usually work better without music.

Each sound starts early by the time its loudest moment takes, so the hit lands exactly on the picture change.

## End card (`end_card`, `logo`)

- `logo.file`: their logo in `brand/` (PNG with a transparent background works best; white or light logos read best on the dimmed last frame).
- `end_card.enabled` and `end_card.line` (one short line, such as "Follow for more tips" or the business name). It appears over the settled hold after the last word, with the picture dimmed; no "link in bio" card.
- Turn it off for one video with `"end_card": false` in `plan.json`.

## Hook bars (`hook`)

Two lines on solid bars from the very first frame: a small setup line (`setup_size`, default 56 px) on `colors.bar` and a big punch line (`punch_size`, default 96 px) on `colors.accent`, which slams in from 115%. Seven words or fewer in all. Colours must pass 4.5:1 contrast: the builder warns when they don't.
