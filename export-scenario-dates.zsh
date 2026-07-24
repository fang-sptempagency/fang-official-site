#!/bin/zsh

python3 <<'PY'
from pathlib import Path
import csv
import re

ROOT = Path("./src/archive/scenario")
OUTPUT = Path("./scenario_metadata.csv")

CHARACTERS = [
    "延金英一",
    "葛城正親",
    "指宿楓",
    "風間竜也",
    "四方椿",
    "篠原堅",
    "戸次信長",
    "鳥本春樹",
    "四方優也",
    "本田千和",
    "横島透",
]

COLUMNS = [
    "Date",
    "タイトル",
    "年齢制限",
    "文字数",
    "シリーズ",
    "フェーズ",
    *CHARACTERS,
]


def split_front_matter(text: str):
    """
    index.njk を Front Matter と本文に分ける。
    """
    if not text.startswith("---"):
        return "", text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return "", text

    front_matter = parts[1]
    body = parts[2]
    return front_matter, body


def parse_scalar(front_matter: str, key: str) -> str:
    """
    title: 査定
    viewpoint: null
    phase: "NULL"
    みたいな1行スカラーを読む。
    """
    pattern = rf"^{re.escape(key)}:\s*(.*)$"
    match = re.search(pattern, front_matter, flags=re.MULTILINE)

    if not match:
        return ""

    value = match.group(1).strip()

    if value in ("", "null", "NULL", "~"):
        return ""

    # 前後の引用符を軽く外す
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        value = value[1:-1]

    return value


def parse_persons(front_matter: str):
    """
    persons:
      - 篠原堅
      - 戸次信長
    を読む。
    """
    persons = []

    match = re.search(
        r"^persons:\s*\n((?:\s+-\s+.*\n?)*)",
        front_matter,
        flags=re.MULTILINE,
    )

    if not match:
        return persons

    block = match.group(1)

    for line in block.splitlines():
        item = line.strip()
        if not item.startswith("- "):
            continue

        name = item[2:].strip()

        if (name.startswith('"') and name.endswith('"')) or (
            name.startswith("'") and name.endswith("'")
        ):
            name = name[1:-1]

        if name:
            persons.append(name)

    return persons


def date_from_folder_or_frontmatter(folder: Path, front_matter: str) -> str:
    """
    フォルダ名の先頭8桁をDateにする。
    例: 20260711_01 -> 2026-07-11

    取れなければ production_date を見る。
    """
    folder_name = folder.name
    match = re.match(r"^(\d{4})(\d{2})(\d{2})", folder_name)

    if match:
        year, month, day = match.groups()
        return f"{year}-{month}-{day}"

    return parse_scalar(front_matter, "production_date")


def count_body_chars(body: str) -> int:
    """
    本文のみ文字数カウント。
    - Front Matterは除外済み
    - HTMLタグは除外
    - 空白、改行、タブは除外
    - Markdownの ** は除外
    """
    body = re.sub(r"<[^>]+>", "", body)
    body = body.replace("**", "")
    body = body.replace("*", "")
    body = re.sub(r"\s+", "", body)

    return len(body)


rows = []

for index_file in sorted(ROOT.glob("*/index.njk")):
    folder = index_file.parent
    text = index_file.read_text(encoding="utf-8")

    front_matter, body = split_front_matter(text)

    date = date_from_folder_or_frontmatter(folder, front_matter)
    title = parse_scalar(front_matter, "title")
    rating = parse_scalar(front_matter, "rating")
    phase = parse_scalar(front_matter, "phase")
    viewpoint = parse_scalar(front_matter, "viewpoint")
    persons = set(parse_persons(front_matter))
    char_count = count_body_chars(body)

    row = {
        "Date": date,
        "タイトル": title,
        "年齢制限": rating,
        "文字数": char_count,
        "シリーズ": viewpoint,
        "フェーズ": phase,
    }

    for character in CHARACTERS:
        row[character] = "TRUE" if character in persons else "FALSE"

    rows.append(row)


with OUTPUT.open("w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(rows)

print(f"Exported: {OUTPUT}")
print(f"Rows: {len(rows)}")
PY