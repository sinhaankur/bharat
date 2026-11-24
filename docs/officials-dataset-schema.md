# Officials accountability dataset — data model (`officials.json`)

**Goal (from user):** track known government officials & politicians as the
*accountability layer* over the money + districts — their **posting history
(transfers / movements across the country)**, the **money flagged under their
office**, linked **cases**, and citizen-facing failures (**delayed pensions /
salaries**). Framed as **"public accountability + how the system actually works"**
— not a gotcha list.

> This is the project's single biggest **defamation** surface. It is built to be
> defensible **by construction**. If a field can't be sourced, it's a gap — the
> dataset never fabricates a name, a posting, or a link to wrongdoing.

## The five iron rules (must hold for every record)

1. **Sourced-or-gap, per field.** Every `name`, `posting`, and `issue` carries a
   `source` (URL) + `source_tier` (1 gov_pdf · 2 gov_html · 3 wikipedia · 4 news).
   No source → the field stays `null` and is listed in `_gaps`. Never guessed.
2. **Facts, never accusations.** We record *what an authority documented*:
   "CAG flagged ₹X unspent under the office of the <post> [src]",
   "transferred from A to B on <date> per <gazette> [src]",
   "<court> issued notice in <case> [src]". We NEVER write "X is corrupt / X
   embezzled / X is responsible for the loss." Motive is never inferred.
3. **Confidence label** on every `issue`: `documented` (a government/court doc) ·
   `reported` (news only) · `alleged` (a claim in a proceeding, not a finding).
   News-only is never presented as `documented` fact.
4. **Office, not person, carries the money.** Money/utilisation is attached to the
   POST held at the time, not to the individual as blame. The person record links
   to it; it does not assert they caused it.
5. **Right of reply / correction** path = the project's standard (about.html). A
   named individual can request correction; errors are fixed, not litigated.

## Top-level shape

```jsonc
{
  "_meta": {
    "as_of": "2026-07",
    "purpose": "Officials accountability layer — sourced posting history + cited issues, per the five iron rules.",
    "rules_ref": "officials-dataset-schema.md",
    "source_tiers": {"1":"gov_pdf","2":"gov_html","3":"wikipedia","4":"news"},
    "confidence_vocab": ["documented","reported","alleged"],
    "disclaimer": "Factual, sourced record of public office-holders. Issues are quoted from and cited to the naming authority; nothing here asserts personal wrongdoing. Corrections: see about.html."
  },
  "officials": [
    {
      "id": "off_<slug>",
      "name": "<full name as in the source>",
      "service": "IAS | IPS | IFoS | State | Political | Judicial",
      "current_post": {"post": null, "place": null, "as_of": null, "source": null, "source_tier": null},
      // TRANSFERS / MOVEMENTS — the posting history, each a sourced fact
      "postings": [
        {"post": "District Magistrate", "place": "Birbhum", "state": "West Bengal",
         "from": "2021-08", "to": "2023-05", "order_ref": "<transfer order / gazette>",
         "source": "<url>", "source_tier": 2}
      ],
      // ISSUES flagged UNDER THE OFFICE they held — quoted + cited, never an accusation
      "issues": [
        {"kind": "audit_flag | court_case | delayed_pension | delayed_salary | fund_freeze",
         "office": "District Magistrate, Birbhum",   // the POST, not the person-as-blame
         "period": "FY2022-23",
         "statement": "CAG flagged ₹X cr MGNREGS funds unspent under this office [as documented].",
         "amount_cr": null, "figure_gap": true,
         "confidence": "documented|reported|alleged",
         "naming_authority": "CAG | High Court | PIB | state AG",
         "source": "<url>", "source_tier": 1}
      ],
      "district_refs": [{"state": "West Bengal", "district": "Birbhum"}],  // for cross-linking to the map
      "_gaps": ["current_post unsourced", "..."]
    }
  ]
}
```

## Field rules

- `postings[]` is the "movement across the country" — each posting is a sourced
  fact (a transfer order / gazette / a dated official listing). Undated or
  unsourced postings are omitted, not guessed.
- `issues[].office` is the **post**, so the record reads "under the office of X",
  keeping the money attached to the role, not asserting the person's culpability.
- `delayed_pension` / `delayed_salary` issues: cite the order/news that documents
  the delay; `amount_cr` and headcount only if sourced. These are citizen-facing
  non-delivery — high-value, defensible, sourced content.
- Cross-links: `district_refs` lets the map/knowledge base surface an official on
  the districts they served — read-only, factual.

## What this is NOT
- Not a "most corrupt officials" ranking. No composite score. No motive.
- Not a live roster (names rotate; snapshots are dated with `as_of`).
- Not a replacement for the per-district `roster` (role slots) — this is the
  *person-across-time* layer that cross-references it.

## Build order
1. This schema → 2. `officials.json` with ONE fully-sourced exemplar → 3. a render
   surface (panel section + knowledge-base section) → 4. grow with sourced records,
   starting from officials already named+sourced in the ledger roster (26 today).

Part of the project: see `officials-schema.md` (role roster), `news-timeline-schema.md`
(fiscal_events — delayed-pension/salary fit as events), `about.html` (disclaimer).
