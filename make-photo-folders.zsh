#!/bin/zsh

python3 <<'PY'
from pathlib import Path
import re
import subprocess
import shutil
import sys

INPUT = Path("./input")
OUTPUT = Path("./output")

SUPPORTED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".tif",
    ".tiff",
}

DEFAULT_LAYOUT = "layouts/photo.njk"
DEFAULT_CATEGORY = "photos"
DEFAULT_PHASE = "FANG"
THUMB_SIZE = 600


def check_magick():
    if shutil.which("magick") is None:
        print("ERROR: ImageMagick が見つかりません。")
        print("Install: brew install imagemagick")
        sys.exit(1)


def parse_date_from_filename(name: str):
    """
    対応例:
      20220514_title.png
      2022-05-14_title.png
      2022.05.14_title.png
      2022_05_14_title.png
      2022年5月14日_title.png
    """
    patterns = [
        r"(?P<year>\d{4})(?P<month>\d{2})(?P<day>\d{2})",
        r"(?P<year>\d{4})[-_.](?P<month>\d{1,2})[-_.](?P<day>\d{1,2})",
        r"(?P<year>\d{4})年(?P<month>\d{1,2})月(?P<day>\d{1,2})日",
    ]

    for pattern in patterns:
        match = re.search(pattern, name)
        if match:
            year = int(match.group("year"))
            month = int(match.group("month"))
            day = int(match.group("day"))

            ymd = f"{year:04d}{month:02d}{day:02d}"
            iso = f"{year:04d}-{month:02d}-{day:02d}"

            return {
                "year": year,
                "month": month,
                "day": day,
                "ymd": ymd,
                "iso": iso,
                "match_text": match.group(0),
            }

    return None


def make_title(file_stem: str, date_match_text: str):
    """
    ファイル名から日付部分を抜いてタイトルっぽくする。
    """
    title = file_stem.replace(date_match_text, "")
    title = re.sub(r"^[\s_\-.　]+", "", title)
    title = re.sub(r"[\s_\-.　]+$", "", title)
    title = title.replace("_", " ")

    if not title:
        title = "Untitled"

    return title


def next_output_dir(ymd: str):
    """
    output/20220514_01 があれば 02, 03... と増やす。
    """
    number = 1

    while True:
        folder_name = f"{ymd}_{number:02d}"
        folder = OUTPUT / folder_name

        if not folder.exists():
            return folder

        number += 1


def write_index(folder: Path, title: str, date_info):
    index_path = folder / "index.njk"

    content = f"""---
layout: {DEFAULT_LAYOUT}
production_date: {date_info["iso"]}
category: {DEFAULT_CATEGORY}
phase: {DEFAULT_PHASE}
viewpoint: null
persons:
title: {title}
fictional_year: {date_info["year"]}
fictional_month: {date_info["month"]}
fictional_date: {date_info["day"]}
image: main.webp
thumbnail: thumb.webp
---
"""

    index_path.write_text(content, encoding="utf-8")


def convert_images(src: Path, folder: Path):
    main = folder / "main.webp"
    thumb = folder / "thumb.webp"

    subprocess.run(
        [
            "magick",
            str(src),
            "-auto-orient",
            "-resize",
            "1800x1800>",
            "-quality",
            "86",
            str(main),
        ],
        check=True,
    )

    subprocess.run(
        [
            "magick",
            str(src),
            "-auto-orient",
            "-resize",
            f"{THUMB_SIZE}x{THUMB_SIZE}^",
            "-gravity",
            "center",
            "-extent",
            f"{THUMB_SIZE}x{THUMB_SIZE}",
            "-quality",
            "82",
            str(thumb),
        ],
        check=True,
    )


def main():
    check_magick()

    if not INPUT.exists():
        print("ERROR: input フォルダがありません。")
        print("Create: mkdir input")
        sys.exit(1)

    OUTPUT.mkdir(exist_ok=True)

    files = [
        path
        for path in sorted(INPUT.iterdir())
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ]

    if not files:
        print("input フォルダに対象画像がありません。")
        return

    created = 0
    skipped = 0

    for src in files:
        date_info = parse_date_from_filename(src.name)

        if not date_info:
            print(f"SKIP: 日付を読めませんでした -> {src.name}")
            skipped += 1
            continue

        title = make_title(src.stem, date_info["match_text"])
        folder = next_output_dir(date_info["ymd"])
        folder.mkdir(parents=True, exist_ok=False)

        print(f"CREATE: {folder}")
        print(f"  title: {title}")
        print(f"  date : {date_info['iso']}")

        try:
            convert_images(src, folder)
            write_index(folder, title, date_info)
            created += 1
        except Exception as error:
            print(f"ERROR: {src.name}")
            print(error)
            skipped += 1

    print("")
    print(f"Done. created={created}, skipped={skipped}")
    print(f"Output: {OUTPUT}")


if __name__ == "__main__":
    main()
PY