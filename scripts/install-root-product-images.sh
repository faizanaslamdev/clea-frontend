#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/products"
mkdir -p "$DEST"

install() {
  local src="$ROOT/$1"
  local dest="$DEST/$2"
  if [[ ! -f "$src" ]]; then
    echo "missing: $1" >&2
    return 1
  fi
  cp "$src" "$dest"
  echo "ok $2 <- $1"
}

# Fashion — matched to product type
install "melbin-jacob-6pfzQDJJpSI-unsplash.jpg" "girls-jeans.jpg"
install "jon-ly-Xn7GvimQrk8-unsplash.jpg" "jeans.jpg"
install "arun-sharma-frb_45xkKlM-unsplash.jpg" "short-shorts.jpg"
install "ben-weber-g1xu7JZg274-unsplash.jpg" "graphic-tee.jpg"
install "imana-xg6QdeINbUI-unsplash.jpg" "dress.jpg"
install "imana-CCTGbN7xOJU-unsplash.jpg" "poplin-dress.jpg"
install "imana-RHG7kdDLe84-unsplash.jpg" "linen-dress-white.jpg"
install "engin-akyurt-5raPrOhbKQo-unsplash.jpg" "linen-shorts.jpg"
install "claudia-love-wHROdQOzmec-unsplash.jpg" "mini-skirt.jpg"
install "luctheo-bra-362802_1920.jpg" "ribbed-crop-top.jpg"
install "shedrack-salami-6iWWBGR8ZJ0-unsplash.jpg" "ruffle-top.jpg"
install "amin-naderloei-wMdvARLejTw-unsplash.jpg" "sheer-top.jpg"
install "emmeline-t-SdR2wW-v4PE-unsplash.jpg" "summer-romper.jpg"
install "sanju-pandita-nWNL8CM94pQ-unsplash.jpg" "tshirt.jpg"
install "imana-0Co8788ZtOc-unsplash.jpg" "blazer.jpg"

# Swim / intimates-style listings
install "mathilde-langevin-MPbVLbwQzaU-unsplash.jpg" "bikini.jpg"
install "aleksei-ezhkov-_ppO1_1Gios-unsplash.jpg" "bikini-set.jpg"
install "timofey-urov-WU_y9Iz5x4o-unsplash.jpg" "sequin-top.jpg"

# Beauty accessories flat-lay
install "uliana-kopanytsia-slCC8-LEJ_E-unsplash.jpg" "lip-tint.jpg"
install "malta-gordos-VwyUF2xdBh0-unsplash.jpg" "mascara.jpg"

# Remove originals from project root
rm -f "$ROOT"/*-unsplash.jpg "$ROOT"/luctheo-bra-362802_1920.jpg

echo "done — 20 images installed to public/products/"
