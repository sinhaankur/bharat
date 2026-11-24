#!/usr/bin/env python3
"""
gen_officials.py — build officials.json from the officials ALREADY named + sourced
in the district-ledger roster, under the five iron rules (officials-dataset-schema.md).

What it does (honestly):
  * Reads every roster slot in district-ledger.json that has a NAME + a source.
  * Emits one official record each: a sourced `current_post` + a single `postings`
    entry (the post they hold, at that place, as of the roster date), each cited to
    the SAME source the roster used. That's a sourced FACT — nothing inferred.
  * Adds NO `issues` automatically. Issues are the legally-sensitive part and are
    only ever added by hand, quoted + cited to a naming authority. Hand-authored
    records in CURATED (below) are preserved verbatim and take precedence.
  * Everything unsourced (batch year, earlier postings) is an explicit _gap.

So the dataset grows only with real, sourced people; it never fabricates a
posting history or links anyone to wrongdoing.

Idempotent. Run: python3 gen_officials.py
"""
import json
import re
import sys

LEDGER = "district-ledger.json"
OUT = "officials.json"


def slug(name, district):
    s = (name + "_" + district).lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    return "off_" + s


# ---------------------------------------------------------------------------
# CURATED records — hand-authored, fully-sourced, with legally-reviewed `issues`.
# These take precedence over the auto-generated posting-only record for the same id.
# Keep the issue framing defensible: office-attached, quoted, cited, non-accusatory.
# ---------------------------------------------------------------------------
CURATED = {
    "off_dhaval_jain_birbhum": {
        "id": "off_dhaval_jain_birbhum",
        "name": "Dhaval Jain",
        "service": "IAS",
        "current_post": {"post": "District Magistrate & Collector", "place": "Birbhum",
                         "state": "West Bengal", "as_of": "2026-05",
                         "source": "https://birbhum.gov.in/whos-who/", "source_tier": 2},
        "postings": [
            {"post": "District Magistrate & Collector", "place": "Birbhum", "state": "West Bengal",
             "from": "2023", "to": None, "order_ref": "West Bengal district administration listing",
             "source": "https://birbhum.gov.in/whos-who/", "source_tier": 2,
             "note": "Posting as listed on the district administration portal. Earlier postings are a gap."}
        ],
        "issues": [
            {"kind": "fund_freeze", "office": "District Magistrate & Collector, Birbhum",
             "period": "2022-2026",
             "statement": "During this office's tenure the Union's MGNREGS fund release to West Bengal remained frozen under Section 27 (from 9 Mar 2022), so wage funds did not flow to Birbhum until a June 2026 resumption. The freeze was imposed UPSTREAM by the Union, not by the district office — the office administered a district cut off at source.",
             "amount_cr": 3038,
             "amount_note": "₹3,038 cr is the Centre-stated pending MGNREGS dues to West Bengal (state-wide, Rajya Sabha 2025) — not a Birbhum-specific or office-attributable figure.",
             "figure_gap": False, "confidence": "reported",
             "naming_authority": "Union Ministry of Rural Development (Sec 27 order) / Rajya Sabha statement",
             "links_chain": "sc_birbhum_mgnregs_freeze",
             "source": "https://www.business-standard.com/india-news/centre-owes-3-000-crore-mgnrega-dues-to-bengal-govt-in-rajya-sabha-125080101525_1.html",
             "source_tier": 4}
        ],
        "district_refs": [{"state": "West Bengal", "district": "Birbhum"}],
        "_gaps": ["postings before 2023 (transfer orders) unsourced",
                  "cadre / batch year unsourced",
                  "office-specific (Birbhum) MGNREGS unspent figure — only state-wide dues are sourced"],
    }
}

META = {
    "as_of": "2026-07",
    "purpose": "Officials accountability layer — sourced posting history + cited issues attached to the OFFICE, per the five iron rules in officials-dataset-schema.md.",
    "rules_ref": "officials-dataset-schema.md",
    "source_tiers": {"1": "gov_pdf", "2": "gov_html", "3": "wikipedia", "4": "news"},
    "confidence_vocab": ["documented", "reported", "alleged"],
    "disclaimer": "A factual, sourced record of public office-holders and their postings. 'Issues' are quoted from and cited to the naming authority (CAG / court / PIB / government order) and are attached to the OFFICE held, not asserted as personal wrongdoing. Nothing here states that a named individual is corrupt or caused a loss. Corrections and right of reply: see about.html.",
}


def main():
    with open(LEDGER, encoding="utf-8") as f:
        d = json.load(f)

    by_id = {}
    for sn, s in d["states"].items():
        for dn, dist in s.get("districts", {}).items():
            for role, r in (dist.get("roster") or {}).items():
                if not (isinstance(r, dict) and r.get("name") and r.get("source")):
                    continue
                oid = slug(r["name"], dn)
                if oid in CURATED:
                    continue  # curated record wins; don't overwrite
                # merge multiple roster slots for the same person+district into one record
                rec = by_id.get(oid)
                posting = {
                    "post": r.get("post"), "place": dn, "state": sn,
                    "from": r.get("as_of"), "to": None,
                    "order_ref": "district administration / roster listing",
                    "source": r.get("source"), "source_tier": r.get("source_tier"),
                }
                if rec is None:
                    by_id[oid] = {
                        "id": oid, "name": r["name"], "service": r.get("service"),
                        "current_post": {"post": r.get("post"), "place": dn, "state": sn,
                                         "as_of": r.get("as_of"), "source": r.get("source"),
                                         "source_tier": r.get("source_tier")},
                        "postings": [posting],
                        "issues": [],
                        "district_refs": [{"state": sn, "district": dn}],
                        "_gaps": ["earlier postings (transfer history) unsourced",
                                  "cadre / batch year unsourced",
                                  "no issue pinned — office-level accountability data is a gap"],
                    }
                else:
                    rec["postings"].append(posting)

    officials = list(CURATED.values()) + sorted(by_id.values(), key=lambda o: o["name"])
    out = {"_meta": dict(META, coverage=f"{len(officials)} officials (1 curated w/ sourced issue + {len(by_id)} posting-only from the ledger roster). Grows as more roster names are sourced."),
           "officials": officials}

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"officials.json written: {len(officials)} officials "
          f"({len(CURATED)} curated + {len(by_id)} from roster)")
    print("  issues added automatically: 0 (issues are hand-authored + cited only)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
