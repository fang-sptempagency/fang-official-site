#!/bin/zsh

ROOT="./src/fang/photos"

for dir in "$ROOT"/*(/); do
  main="$dir/main.webp"
  thumb="$dir/thumb.webp"

  if [[ -f "$main" ]]; then
    echo "Creating thumbnail: $thumb"

    magick "$main" \
      -resize 600x600^ \
      -gravity center \
      -extent 600x600 \
      "$thumb"
  fi
done