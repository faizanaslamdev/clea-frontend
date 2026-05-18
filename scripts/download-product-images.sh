#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/public/products"
mkdir -p "$DIR"
Q="?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop"

dl() {
  local file="$1" id="$2"
  curl -fsSL "https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg${Q}" -o "${DIR}/${file}"
  echo "ok ${file}"
}

# Fix duplicate / wrong images
dl handbag.jpg 1152077
dl sequin-top.jpg 6311656
dl crossbody.jpg 1926769
dl sweater.jpg 6311587
dl serum.jpg 3782149
dl face-cream.jpg 996329
dl palette.jpg 1124468
dl graphic-tee.jpg 767116
dl sheer-top.jpg 6311589
dl mini-skirt.jpg 6311391
dl sunglasses.jpg 1308881
dl linen-dress-white.jpg 985635
dl dress.jpg 6311392
dl poplin-dress.jpg 6311582
dl blazer.jpg 6311583
dl belt.jpg 6311584
dl mascara.jpg 6311585
dl body-lotion.jpg 6311586
dl cleanser.jpg 1036623
dl beanie.jpg 6311576

# New women's summer / cute fashion
dl bikini.jpg 8681840
dl short-shorts.jpg 6311655
dl ribbed-crop-top.jpg 6311575
dl linen-shorts.jpg 6311577
dl bikini-set.jpg 6311578
dl terry-shorts.jpg 6311579
dl ruffle-top.jpg 6311580
dl summer-romper.jpg 6311581

echo "done"
