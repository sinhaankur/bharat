"""ledger_io.py — one place that controls how district-ledger.json is written.

The ledger is a SCRIPT-GENERATED artifact (not hand-edited), so it is stored
MINIFIED (no indentation) to cut ~29% of the file size — faster browser parse,
less memory, smaller repo. Regenerate via the add_*/gen_* scripts; don't hand-edit.

Usage in a generator:
    from ledger_io import load_ledger, save_ledger
    data = load_ledger()
    ...mutate...
    save_ledger(data)
"""
import json

LEDGER = "district-ledger.json"

# Compact separators = no spaces after ',' or ':'. ensure_ascii=False keeps ₹, é,
# Devanagari etc. as real UTF-8 (also smaller than \uXXXX escapes).
_COMPACT = (",", ":")


def load_ledger(path=LEDGER):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_ledger(data, path=LEDGER):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=_COMPACT)
