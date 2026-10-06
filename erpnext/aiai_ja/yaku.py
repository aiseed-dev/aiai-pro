# SPDX-License-Identifier: AGPL-3.0-or-later
"""List the strings of a Frappe bench that have no Japanese translation yet.

Reads the message catalogs (locale/main.pot) of frappe and erpnext in the
bench, and the ja.csv of every app in apps.txt, and writes the strings that
no app translates as JSON batches, with where each string is used, for a
person or an AI to translate. Also checks a ja.csv: placeholders such as {0}
and HTML tags must stay the same in the translation.

    python yaku.py list  ~/erpnext-bench/frappe-bench out/ --size 400
    python yaku.py check aiai_ja/translations/ja.csv

Needs babel, which is in the bench's env (frappe-bench/env/bin/python).
"""

import argparse
import csv
import json
import re
from pathlib import Path

PLACEHOLDER = re.compile(r"\{\d*\}|%\(\w+\)s|%s|<[^>]+>")


def read_csv(path):
	rows = {}
	with open(path, encoding="utf-8", newline="") as f:
		for r in csv.reader(f):
			if len(r) >= 2 and r[0]:
				rows[(r[0], r[2] if len(r) > 2 else "")] = r[1]
	return rows


def catalog(bench, app):
	from babel.messages.pofile import read_po

	with open(Path(bench) / "apps" / app / app / "locale" / "main.pot", "rb") as f:
		for m in read_po(f):
			if m.id and isinstance(m.id, str):
				yield m.id, m.context or "", [p for p, _ in m.locations][:3]


def list_missing(bench, out, size):
	have = set()
	for app in (Path(bench) / "sites" / "apps.txt").read_text().split():
		path = Path(bench) / "apps" / app / app / "translations" / "ja.csv"
		if path.exists():
			have |= {k[0] for k in read_csv(path)}
	missing, seen = [], set()
	for app in ("frappe", "erpnext"):
		for text, ctx, where in catalog(bench, app):
			if text not in have and (text, ctx) not in seen:
				seen.add((text, ctx))
				missing.append({"source": text, "context": ctx, "where": where})
	out = Path(out)
	out.mkdir(parents=True, exist_ok=True)
	for i in range(0, len(missing), size):
		(out / f"batch_{i // size:03d}.json").write_text(
			json.dumps(missing[i : i + size], ensure_ascii=False, indent=1), encoding="utf-8"
		)
	print(f"{len(missing)} strings without a translation, in {(len(missing) + size - 1) // size} batches")


def check(path):
	bad = 0
	for (src, _), dst in read_csv(path).items():
		if sorted(PLACEHOLDER.findall(src)) != sorted(PLACEHOLDER.findall(dst)):
			bad += 1
			print(f"placeholders differ: {src!r} -> {dst!r}")
	print(f"{bad} problems")
	return bad


if __name__ == "__main__":
	p = argparse.ArgumentParser()
	sub = p.add_subparsers(dest="cmd", required=True)
	a = sub.add_parser("list")
	a.add_argument("bench")
	a.add_argument("out")
	a.add_argument("--size", type=int, default=400)
	c = sub.add_parser("check")
	c.add_argument("csv")
	args = p.parse_args()
	if args.cmd == "list":
		list_missing(args.bench, args.out, args.size)
	else:
		raise SystemExit(1 if check(args.csv) else 0)
