#!/usr/bin/env python3
"""Generate the public property search catalog from a property CSV export."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="UTF-8 CSV containing 物件No and 物件名")
    parser.add_argument("output", type=Path, help="JavaScript catalog output path")
    return parser.parse_args()


def sort_key(record: dict[str, str]) -> tuple[int, int | str]:
    number = record["number"]
    return (0, int(number)) if number.isdecimal() else (1, number)


def main() -> None:
    args = parse_args()
    with args.source.open(encoding="utf-8-sig", newline="") as source_file:
        reader = csv.DictReader(source_file)
        required_headers = {"物件No", "物件名"}
        if not required_headers.issubset(reader.fieldnames or []):
            missing = "、".join(sorted(required_headers - set(reader.fieldnames or [])))
            raise SystemExit(f"CSVに必要な列がありません: {missing}")

        records = []
        seen_numbers = set()
        for row in reader:
            number = (row.get("物件No") or "").strip()
            name = (row.get("物件名") or "").strip()
            if not number or not name:
                continue
            if number in seen_numbers:
                raise SystemExit(f"物件Noが重複しています: {number}")
            seen_numbers.add(number)
            records.append({"number": number, "name": name})

    records.sort(key=sort_key)
    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    output_text = (
        "// 物件基本情報CSVの「物件No」「物件名」から生成した検索用データです。\n"
        f"window.PROPERTY_CATALOG={payload};\n"
    )
    args.output.write_text(output_text, encoding="utf-8")
    print(f"{len(records)} properties written to {args.output}")


if __name__ == "__main__":
    main()
