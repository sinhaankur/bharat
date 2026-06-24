#!/usr/bin/env python3
"""
apply_protocol_all.py — extend the Kolkata-style STRUCTURE (not its figures)
to all 594 districts.

What this does, honestly:
  1. ALL districts: tag every scheme that already appears (departments[].schemes
     and ledger[].scheme) with its protocol metadata from _meta.scheme_registry
     (constitutional list, ministry, fiscal route, funding pattern, sanction
     protocol). Tag every roster post with its appointing authority from
     _meta.authority_map.
  2. BASELINE districts (the 581 skeletons): attach `applicable_schemes` — the
     central schemes that, by programme design, flow to EVERY district of that
     kind — each carrying its funding pattern and an EXPLICIT null amount.
     This is structural fact (the scheme applies), NOT a fabricated figure.

What this deliberately does NOT do:
  - It never invents a rupee amount, utilisation %, CAG para, or officer name.
    Those stay null and remain listed in _gaps. "Deep money ledger for all 594"
    is not honestly possible — the per-district PDFs don't exist uniformly —
    so amounts remain gaps until a real government PDF backs them.

Idempotent. Run: python3 apply_protocol_all.py
Depends on add_protocol_layers.py having populated _meta first.
"""
import json
import sys

LEDGER = "district-ledger.json"

# Central schemes that, by design, are universal to (virtually) every rural
# district. Keys must exist in _meta.scheme_registry. We attach these to
# baseline skeletons as "applicable" with null amounts (structural, not faked).
UNIVERSAL_RURAL_SCHEMES = ["MGNREGS", "PMAY-G", "NSAP", "MPLADS", "15th FC Health Grants"]


def resolve(name, registry, aliases):
    """Return (canonical_key, entry) for a scheme string, or (None, None)."""
    if name in registry:
        return name, registry[name]
    if name in aliases:
        k = aliases[name]
        return k, registry.get(k)
    return None, None


def scheme_protocol(entry):
    """Compact protocol badge derived from a registry entry."""
    if not entry:
        return None
    return {
        "const_list": entry.get("const_list"),
        "ministry": entry.get("ministry"),
        "fiscal_stream": entry.get("fiscal_stream"),
        "funding_pattern": entry.get("funding_pattern"),
        "fiscal_route": entry.get("fiscal_route"),
        "sanction_protocol": entry.get("sanction_protocol"),
        "source": entry.get("source"),
        "source_tier": entry.get("source_tier"),
    }


def authority_for(role_key, authority_map):
    """Match a roster role key to authority_map, allowing prefix variants
    like 'sdo_bolpur' -> 'sdo' is not a key, so fall through to family match."""
    if role_key in authority_map:
        return authority_map[role_key]
    # family fallbacks for compound/variant keys seen in the data
    fam = {
        "adm": "collector", "sdo": "collector", "sdm": "collector",
        "iac_administrator": "municipal_commissioner",
        "minister_in_charge": None,  # political, state cabinet — no district appointer row
    }
    for prefix, target in fam.items():
        if role_key.startswith(prefix):
            return authority_map.get(target) if target else None
    return None


def main():
    with open(LEDGER, encoding="utf-8") as f:
        data = json.load(f)

    meta = data["_meta"]
    registry = meta.get("scheme_registry")
    aliases = meta.get("scheme_aliases", {})
    authority_map = meta.get("authority_map")
    if not registry or not authority_map:
        print("ERROR: run add_protocol_layers.py first (no scheme_registry/"
              "authority_map in _meta).", file=sys.stderr)
        return 2

    n_dist = 0
    n_sch_tagged = 0
    n_sch_unresolved = 0
    n_roster_tagged = 0
    n_roster_unmatched = 0
    n_baseline_enriched = 0
    unresolved_examples = set()
    unmatched_roles = set()

    for state in data["states"].values():
        for dname, dist in state.get("districts", {}).items():
            n_dist += 1

            # --- 1a. tag schemes inside departments[] -------------------
            for dep in dist.get("departments", []) or []:
                if not isinstance(dep, dict):
                    continue
                tagged = []
                for sc in dep.get("schemes", []) or []:
                    _, entry = resolve(sc, registry, aliases)
                    p = scheme_protocol(entry)
                    if p:
                        n_sch_tagged += 1
                        tagged.append({"scheme": sc, "protocol": p})
                    else:
                        n_sch_unresolved += 1
                        unresolved_examples.add(sc)
                        tagged.append({"scheme": sc, "protocol": None})
                if tagged:
                    dep["schemes_protocol"] = tagged

            # --- 1b. tag scheme inside each ledger row ------------------
            for L in dist.get("ledger", []) or []:
                if not isinstance(L, dict):
                    continue
                sc = L.get("scheme")
                if not sc:
                    continue
                _, entry = resolve(sc, registry, aliases)
                p = scheme_protocol(entry)
                if p:
                    n_sch_tagged += 1
                    L["protocol"] = p
                else:
                    n_sch_unresolved += 1
                    unresolved_examples.add(sc)

            # --- 1c. tag roster posts with appointing authority ---------
            roster = dist.get("roster") or {}
            if isinstance(roster, dict):
                for role_key, post in roster.items():
                    if not isinstance(post, dict):
                        continue
                    auth = authority_for(role_key, authority_map)
                    if auth:
                        post["authority"] = {
                            "appointed_by": auth["appointed_by"],
                            "accountable_to": auth["accountable_to"],
                            "cadre": auth["cadre"],
                            "layer": auth["layer"],
                            "tier": auth["tier"],
                            "const_basis": auth["const_basis"],
                        }
                        n_roster_tagged += 1
                    else:
                        n_roster_unmatched += 1
                        unmatched_roles.add(role_key)

            # --- 2. baseline skeletons: applicable schemes (null amounts)
            if dist.get("baseline") and not (dist.get("ledger")):
                applicable = []
                for key in UNIVERSAL_RURAL_SCHEMES:
                    entry = registry.get(key)
                    if not entry:
                        continue
                    applicable.append({
                        "scheme": key,
                        "full_name": entry.get("full_name"),
                        "const_list": entry.get("const_list"),
                        "funding_pattern": entry.get("funding_pattern"),
                        "fiscal_route": entry.get("fiscal_route"),
                        "money_in_cr": None,          # honest gap — no PDF
                        "utilisation_pct": None,      # honest gap
                        "figure_gap": True,
                        "source": entry.get("source"),
                        "source_tier": entry.get("source_tier"),
                        "note": "Scheme applies to this district by programme "
                                "design; district-level amount & utilisation "
                                "are not sourced (no PDF) — figure_gap.",
                    })
                if applicable:
                    dist["applicable_schemes"] = applicable
                    dist["applicable_schemes_note"] = (
                        "Structural: these central schemes reach every district "
                        "of this type. Amounts are intentionally null until a "
                        "government PDF is cited (project rule: PDF-cited or it's "
                        "a gap)."
                    )
                    # make sure the gap is recorded
                    gaps = dist.setdefault("_gaps", [])
                    note = ("applicable_schemes listed structurally; per-district "
                            "amounts/utilisation unsourced (figure_gap)")
                    if note not in gaps:
                        gaps.append(note)
                    n_baseline_enriched += 1

    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # --- report ------------------------------------------------------------
    print(f"applied protocol structure across {n_dist} districts")
    print(f"  schemes tagged with protocol     : {n_sch_tagged}")
    print(f"  schemes unresolved (no registry) : {n_sch_unresolved}",
          (sorted(unresolved_examples) if unresolved_examples else ""))
    print(f"  roster posts tagged w/ authority : {n_roster_tagged}")
    print(f"  roster roles unmatched           : {n_roster_unmatched}",
          (sorted(unmatched_roles) if unmatched_roles else ""))
    print(f"  baseline skeletons enriched      : {n_baseline_enriched}")
    print("  NOTE: zero monetary amounts invented — all amounts remain null/gap.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
