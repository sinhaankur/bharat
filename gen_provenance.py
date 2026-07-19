#!/usr/bin/env python3
"""
gen_provenance.py — build provenance.json: the auditable "every figure → its exact
citation, in one place" index that roadmap item #2 (more sourced hotspots +
PROVENANCE) calls for.

The project's iron rule is sourced-or-gap: a figure is cited or it's an explicit
gap, never fabricated. references.html is the hand-written *narrative* of what we
used; this is the *machine-walked ledger of every claim* — generated straight from
the data, so it can never drift from what actually ships. It answers three questions
an auditor asks:

  1. WHICH sources back this atlas?  (grouped by citation, with tier + fetch domain)
  2. WHAT exactly does each source back?  (every field, at which admin level, and
     whether the shown figure is real or a declared gap)
  3. HOW MUCH is genuinely pinned vs. still a gap?  (honest counts, not a score)

It walks THREE artifacts — the deep money-flow ledger, the eight district
dimensions, and the state-level safety/justice layer — because those are where the
source tags live. Nothing here invents a citation: a claim with no `source` and no
`figure_gap` marker is reported as UNATTRIBUTED so it shows up as work to do, not
hidden.

Stdlib only. Usage:  python3 gen_provenance.py
"""
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone
from urllib.parse import urlparse

LEDGER = "district-ledger.json"
SAFETY = "safety.json"
OUT = "provenance.json"

TIER_LABELS = {
    1: "Primary — government / statutory source (PDF or official portal)",
    2: "Secondary — official aggregate / statutory instrument (not per-unit)",
    3: "Tertiary — news / moderated feed (labelled as such)",
    4: "Provisional — needs a primary-source (PDF) upgrade",
}


def load_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def domain_of(url):
    """Best-effort registrable host for grouping/QA (not shown as the citation)."""
    if not url or not isinstance(url, str) or not url.startswith("http"):
        return None
    try:
        host = urlparse(url).netloc.lower()
        return host[4:] if host.startswith("www.") else host
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# A "claim" is one figure/fact we assert about one place, plus its provenance.
# We collect claims from every artifact, then invert to source → [claims].
# ─────────────────────────────────────────────────────────────────────────────
def make_claim(scope, place, field, value, source, tier, level, gap, note):
    return {
        "scope": scope,            # ledger | dimension:<name> | safety:<block>
        "place": place,            # "West Bengal · Kolkata" or "West Bengal"
        "field": field,            # human-readable field label
        "value": value,           # the shown value (None when a gap)
        "source": source or None,  # the citation URL/text as it appears in the data
        "tier": tier,             # 1..4 or None
        "level": level,           # district | state-proxy | state-official | …
        "gap": bool(gap),         # True → figure is a declared gap, not a number
    }


def collect_ledger_claims(ledger):
    claims = []
    for state, sd in ledger.get("states", {}).items():
        for dname, d in sd.get("districts", {}).items():
            place = f"{state} · {dname}"

            # departments-budget provenance (one per district, when present)
            if d.get("departments_source"):
                claims.append(make_claim(
                    "ledger", place, "Department budgets",
                    d.get("departments_fy") or "budget",
                    d["departments_source"], d.get("departments_source_tier"),
                    "district", False, None))

            # each money-flow row
            for e in d.get("ledger", []):
                scheme = e.get("scheme", "money-flow row")
                val = None if e.get("figure_gap") else e.get("money_in_cr")
                claims.append(make_claim(
                    "ledger", place,
                    f"{scheme} — ₹ in", val,
                    e.get("source"), e.get("source_tier"),
                    "district", e.get("figure_gap"),
                    "needs PDF upgrade" if e.get("needs_pdf_upgrade") else None))
    return claims


# For dimensions we describe WHAT figure each dimension asserts, so the provenance
# row reads like a claim ("IMR = 22") rather than a raw blob.
def _dim_headline(name, dim):
    if name == "health":
        return ("Infant-mortality / health (NFHS-5)",
                None if dim.get("figure_gap") else f"IMR {dim.get('imr')}")
    if name == "economy":
        v = dim.get("percapita_nsdp_inr")
        return ("Per-capita income (NSDP)",
                None if dim.get("figure_gap") else (f"₹{v:,}" if isinstance(v, int) else v))
    if name == "language":
        return ("Official / mother-tongue language",
                ", ".join(dim.get("state_official") or []) or None)
    if name == "politics":
        return ("Ruling party / alignment", dim.get("state_ruling_party"))
    if name == "geography":
        return ("Terrain / flood / coast", dim.get("terrain"))
    if name == "vehicles":
        return ("RTO / registered vehicles", dim.get("rto_code") or dim.get("rto_office"))
    if name == "aviation":
        return ("Airport / air traffic", dim.get("airport") or dim.get("category"))
    if name == "housing":
        return ("House-price index", dim.get("index") or dim.get("city"))
    return (name.title(), None)


def collect_dimension_claims(ledger):
    claims = []
    for state, sd in ledger.get("states", {}).items():
        for dname, d in sd.get("districts", {}).items():
            place = f"{state} · {dname}"
            for name, dim in (d.get("dimensions") or {}).items():
                if not isinstance(dim, dict):
                    continue
                field, value = _dim_headline(name, dim)
                # a dimension is a gap if it flags figure_gap OR shows no value
                gap = bool(dim.get("figure_gap")) or value in (None, "", [])
                # some dimensions tier the STATE-level fact (e.g. language's
                # state_official_source_tier) even when the district figure is a
                # gap — fall back to it so the citation's tier is shown honestly.
                tier = dim.get("source_tier") or dim.get("state_official_source_tier")
                claims.append(make_claim(
                    f"dimension:{name}", place, field, value,
                    dim.get("source"), tier,
                    dim.get("level"), gap, dim.get("as_of")))
    return claims


def collect_safety_claims(safety):
    claims = []
    for state, v in (safety.get("states") or {}).items():
        cr = v.get("crime") or {}
        claims.append(make_claim(
            "safety:crime", state, "Cognizable crime rate / lakh",
            None if cr.get("gap") else cr.get("rate_per_lakh"),
            cr.get("source_pdf") or cr.get("source"), cr.get("source_tier"),
            "state", cr.get("gap"), cr.get("source_name")))

        pr = v.get("prisons") or {}
        claims.append(make_claim(
            "safety:prisons", state, "Prison occupancy band",
            pr.get("occupancy_band_label") or (None if pr.get("gap") else pr.get("occupancy_pct")),
            pr.get("source_pdf") or pr.get("source"), pr.get("source_tier"),
            "state", pr.get("gap"), pr.get("source_name")))

        de = v.get("density") or {}
        if de:
            gap = de.get("gap") if de.get("gap") is not None else de.get("per_km2") is None
            claims.append(make_claim(
                "safety:density", state, "Population density / km²",
                de.get("per_km2"), de.get("source"), de.get("source_tier"),
                "state", gap, de.get("source_name")))

        we = v.get("wealth") or {}
        if we:
            val = we.get("percapita_income_inr", we.get("percapita_nsdp_inr"))
            gap = we.get("gap") if we.get("gap") is not None else val is None
            claims.append(make_claim(
                "safety:wealth", state, "Per-capita income (NSDP)",
                val, we.get("source"), we.get("source_tier"),
                "state", gap, we.get("source_name")))
    return claims


def build():
    ledger = load_json(LEDGER)
    safety = load_json(SAFETY, {})
    if not ledger:
        print("ERROR: district-ledger.json not found", file=sys.stderr)
        sys.exit(1)

    claims = (collect_ledger_claims(ledger)
              + collect_dimension_claims(ledger)
              + collect_safety_claims(safety))

    # ── Invert claims → source index. Unattributed claims (no source, not a
    #    declared gap) are their OWN bucket so they can't hide. ────────────────
    UNATTRIBUTED = "(unattributed — no citation on record)"
    by_source = defaultdict(lambda: {
        "source": None, "domain": None, "tiers": set(),
        "claims_total": 0, "figures": 0, "gaps": 0,
        "levels": defaultdict(int), "scopes": defaultdict(int),
        "samples": [],
    })

    totals = {"claims": 0, "figures": 0, "gaps": 0, "unattributed": 0}
    tier_counts = defaultdict(int)
    scope_counts = defaultdict(lambda: {"figures": 0, "gaps": 0})

    for c in claims:
        totals["claims"] += 1
        key = c["source"] or (UNATTRIBUTED if not c["gap"] else None)
        # a declared gap with no source is legitimate (nothing to cite yet) — count
        # it against its scope but don't pollute the source index with a null key.
        if key is None:
            totals["gaps"] += 1
            scope_counts[c["scope"]]["gaps"] += 1
            continue
        if key == UNATTRIBUTED:
            totals["unattributed"] += 1

        b = by_source[key]
        b["source"] = key
        b["domain"] = domain_of(key)
        b["claims_total"] += 1
        if c["tier"]:
            b["tiers"].add(c["tier"])
            tier_counts[c["tier"]] += 1
        if c["gap"]:
            b["gaps"] += 1
            totals["gaps"] += 1
            scope_counts[c["scope"]]["gaps"] += 1
        else:
            b["figures"] += 1
            totals["figures"] += 1
            scope_counts[c["scope"]]["figures"] += 1
        if c["level"]:
            b["levels"][c["level"]] += 1
        b["scopes"][c["scope"]] += 1
        if len(b["samples"]) < 6:
            b["samples"].append({
                "place": c["place"], "field": c["field"],
                "value": c["value"], "gap": c["gap"], "scope": c["scope"],
            })

    # ── Serialise: sort sources by how much they back (figures desc). ─────────
    sources = []
    for key, b in by_source.items():
        tiers = sorted(b["tiers"])
        sources.append({
            "source": b["source"],
            "domain": b["domain"],
            "tier": tiers[0] if tiers else None,
            "tiers": tiers,
            "tier_label": TIER_LABELS.get(tiers[0]) if tiers else None,
            "unattributed": key == UNATTRIBUTED,
            "claims": b["claims_total"],
            "figures": b["figures"],
            "gaps": b["gaps"],
            "levels": dict(b["levels"]),
            "scopes": dict(b["scopes"]),
            "samples": b["samples"],
        })
    sources.sort(key=lambda s: (s["unattributed"], -s["figures"], -s["claims"]))

    out = {
        "_meta": {
            "purpose": "Auditable index of every sourced figure in the atlas and the "
                       "citation that backs it — generated from the data, so it can "
                       "never drift from what ships. Companion to references.html "
                       "(the human narrative of sources).",
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "honesty": "sourced-or-gap: a figure is cited or it is a declared gap, "
                       "never fabricated. Claims with no citation and no gap marker "
                       "are reported as UNATTRIBUTED, not hidden.",
            "how_built": "gen_provenance.py walks district-ledger.json (deep money "
                         "rows + 8 dimensions) and safety.json (state crime/prisons/"
                         "density/wealth).",
            "artifacts": [LEDGER, SAFETY],
            "tier_labels": TIER_LABELS,
            "coverage": {
                "distinct_sources": len([s for s in sources if not s["unattributed"]]),
                "claims_total": totals["claims"],
                "figures_pinned": totals["figures"],
                "declared_gaps": totals["gaps"],
                "unattributed": totals["unattributed"],
                "pinned_pct": round(100 * totals["figures"] / totals["claims"], 1)
                if totals["claims"] else 0,
                "by_tier": {str(k): tier_counts[k] for k in sorted(tier_counts)},
                "by_scope": {k: dict(v) for k, v in sorted(scope_counts.items())},
            },
        },
        "sources": sources,
    }
    return out


def main():
    out = build()
    # provenance.json is a generated artifact → store minified (build-optimization
    # rule: don't re-bloat; the page fetches + renders it client-side).
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

    cov = out["_meta"]["coverage"]
    print(f"✓ wrote {OUT}")
    print(f"  distinct sources : {cov['distinct_sources']}")
    print(f"  claims total     : {cov['claims_total']}")
    print(f"  figures pinned   : {cov['figures_pinned']}  ({cov['pinned_pct']}%)")
    print(f"  declared gaps    : {cov['declared_gaps']}")
    print(f"  unattributed     : {cov['unattributed']}")
    print(f"  by tier          : {cov['by_tier']}")
    if cov["unattributed"]:
        print(f"  ⚠ {cov['unattributed']} unattributed claim(s) — surface as work to do.")


if __name__ == "__main__":
    main()
