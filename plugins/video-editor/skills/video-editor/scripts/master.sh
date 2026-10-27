#!/usr/bin/env bash
# master.sh: two-pass EBU R128 loudness master for social video.
# Copies the video stream untouched; only the audio is re-encoded.
#
# Usage: master.sh <in.mp4> <out.mp4> [target_LUFS=-14] [true_peak_dBTP=-1.5]
# The -1.5 target leaves headroom: linear loudnorm plus AAC encoding can land
# about 0.7 dB above a -1 target, and the delivery limit is -1 dBTP.
set -euo pipefail

IN="$1"
OUT="$2"
I="${3:--14}"
TP="${4:--1.5}"
LRA=11

# Pass 1: measure.
stats=$(ffmpeg -hide_banner -nostats -i "$IN" \
  -af "loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json" -f null - 2>&1 |
  awk '/^\{/,/^\}/')
get() { printf '%s' "$stats" | python3 -I -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }

# Pass 2: apply with the measured values (linear normalisation where possible),
# plus a 30 ms fade-in and 100 ms fade-out so a looping reel never clicks. The sound is trimmed to the
# picture's length, since a render can leave the audio a few frames longer.
DUR=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 "$IN")
FADE_OUT_AT=$(python3 -I -c "print(max(0.0, $DUR - 0.1))")
ffmpeg -hide_banner -v error -y -i "$IN" -c:v copy \
  -af "loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,atrim=0:${DUR},afade=t=in:st=0:d=0.03,afade=t=out:st=${FADE_OUT_AT}:d=0.1" \
  -ar 48000 -c:a aac -b:a 320k -movflags +faststart "$OUT"

# Report what was delivered.
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 |
  awk '/Summary:/ {s = 1} s && /(I:|LRA:|Peak:)/ {gsub(/^ +/, ""); print "master: " $0}'
