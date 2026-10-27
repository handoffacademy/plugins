# Changelog

## 2.0.1

- The editor runs each step as a plain command with the full path, so choosing to always allow its steps stops the repeat permission prompts.
- The reviewer check on the finished video is a set step, not an optional one.
- Clean and Punchy captions stay readable with a dark brand colour: the key word gets a chip in that colour instead of dark text on dark video.
- Clean captions show the whole line on the plate and light each word as it's said, so the plate no longer shows empty space.

## 2.0.0

Runs on your own Mac or Windows computer in the Claude desktop app's Code tab, the way HyperFrames recommends, instead of Cowork's cloud computer: tools install once, edits start straight away and render about three times faster.
- The scripts are Node.js now (no Python), so they work the same on Windows.
- New Studio Setup skill: checks Node.js, installs HyperFrames 0.8.209 and FFmpeg from npm (no admin password, no git), HyperFrames' renderer and the Parakeet speech-to-text model, adds HyperFrames' core skills to the videos folder, makes the studio folders, and ends with a finished practice video.
- iPhone HDR footage is tone-mapped to normal colour, and the filming steps say to turn HDR off.
- Brand kits: colours, font, logo, caption style, transition style, sound and an end card, saved once in brand/ and used on every edit.
- Three caption styles (bold, clean, punchy), an accent transition (swipe or flash) at the story's turns, HyperFrames' sound library, and owned music.
- Craft rules from Handoff's own editing: frame-0 hook rules, hook versions for trial reels, the two-transition ceiling, sound budget and a second-reviewer check.

## 1.0.1

The hook bars stay out of the right-hand safe zone, QA counts the stills it actually wrote and checks the very last frame, and the cut step prints how long finishing will take.

## 1.0.0

Initial release: the Video Editor, Content Kit, Brand Setup and Video Help skills. Edits run in Claude Cowork's cloud computer with HyperFrames 0.8.209 and FFmpeg.
