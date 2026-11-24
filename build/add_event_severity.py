#!/usr/bin/env python3
"""
add_event_severity.py — compute a transparent 'scale of the problem' severity for
each fiscal event, per severity-schema.md.

Severity = money (0-4, from amount_cr) + people (0-4, authored/inferred) +
governance (0-4, derived from the fund-lifecycle stage). Sum 0-12 → band.
Components are explicit and visible — never a black-box number. If amount_cr is a
gap, money=null and components_sourced=false (honest partial score).

Idempotent. Run: python3 add_event_severity.py
"""
import json

EVENTS = "fiscal-events.json"

# governance points by stage (fully derivable, no judgement)
GOV = {
    "sanction": 0, "release": 0, "implementation": 0, "outcome": 0,
    "delay": 1, "shortfall": 2,
    "audit_flag": 3, "cag_para": 3,
    "investigation": 4, "action": 1,   # action = a corrective step (mild), not the breach itself
}

# people scope → points. Authored per event via 'people_scope'; default unknown=0.
PEOPLE = {"unknown": 0, "site": 1, "block": 2, "town": 2, "district": 3, "multi_district": 4, "state": 4}


def money_pts(amount_cr):
    if amount_cr is None:
        return None
    if amount_cr < 10: return 1
    if amount_cr < 100: return 2
    if amount_cr < 1000: return 3
    return 4


def band(score):
    if score is None: return "unknown"
    if score <= 3: return "low"
    if score <= 6: return "moderate"
    if score <= 9: return "high"
    return "severe"


def main():
    with open(EVENTS, encoding="utf-8") as f:
        doc = json.load(f)

    n = 0
    for e in doc.get("fiscal_events", []):
        mp = money_pts(e.get("amount_cr"))
        gp = GOV.get(e.get("stage"), 0)
        # people: use authored 'people_scope' if present, else infer 'state' for
        # state-wide schemes (e.g. the WB MGNREGS freeze), else 'district'.
        scope = e.get("people_scope")
        if not scope:
            # honest inference from the event's own text/geo, defaulting low
            txt = (e.get("title", "") + " " + e.get("summary", "")).lower()
            if "west bengal" in txt or "state" in txt or "every" in txt:
                scope = "state"
            elif e.get("geo", {}).get("district"):
                scope = "district"
            else:
                scope = "unknown"
        pp = PEOPLE.get(scope, 0)

        sourced = mp is not None
        # score: sum of available components; if money is a gap, sum the rest but mark partial
        parts = [p for p in (mp, pp, gp) if p is not None]
        score = sum(parts) if parts else None

        basis = []
        if mp is not None: basis.append(f"₹{e.get('amount_cr')} cr → money {mp}/4")
        else: basis.append("₹ unsourced → money n/a")
        basis.append(f"{scope} → people {pp}/4")
        basis.append(f"stage '{e.get('stage')}' → governance {gp}/4")

        e["severity"] = {
            "money": mp,
            "people": pp,
            "people_scope": scope,
            "governance": gp,
            "score": score,
            "band": band(score),
            "basis": "; ".join(basis),
            "components_sourced": sourced,
        }
        n += 1

    with open(EVENTS, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)

    print(f"severity computed for {n} events")
    for e in doc.get("fiscal_events", []):
        s = e["severity"]
        print(f"  [{s['band']:8} {str(s['score']):>4}] {e['title'][:54]}  ({s['basis']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
