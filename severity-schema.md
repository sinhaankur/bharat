# Event severity — "scale of the problem" model

**Goal (from user):** let people *measure* breaking news by the **scale of the
problem**, not just its date. A ₹3,000 cr fund freeze affecting millions is not
the same "news" as a single delayed sanction — the timeline should show that.

**Design rule (same as the no-bias-score rule):** severity is **computed from
explicit, visible components**, never a black-box number. The reader always sees
*why* something scored high. We show the inputs; the score is a convenience.

---

## The three components (each 0–4, summed → 0–12, bucketed)

A `severity` object on each event:

```jsonc
"severity": {
  "money": 0-4,        // ₹ scale of funds affected
  "people": 0-4,       // breadth of population/beneficiaries hit
  "governance": 0-4,   // how serious the accountability breach is
  "score": 0-12,       // sum (computed)
  "band": "low|moderate|high|severe",  // bucket of score
  "basis": "one line naming what drove each component",
  "components_sourced": true|false     // are the inputs cited, or inferred?
}
```

### money (₹ funds affected)
| pts | threshold |
|----|-----------|
| 0 | none / not financial |
| 1 | < ₹10 cr |
| 2 | ₹10–100 cr |
| 3 | ₹100–1,000 cr |
| 4 | > ₹1,000 cr |
Derived from `amount_cr` where present; if `amount_cr` is a gap, money = null and
flagged `components_sourced:false`.

### people (breadth affected)
| pts | scope |
|----|-------|
| 0 | unknown / negligible |
| 1 | a few beneficiaries / one works site |
| 2 | a block / town |
| 3 | a whole district |
| 4 | multiple districts / a whole state |
Inferred from the event's geo scope + scheme reach; honest when it's an estimate.

### governance (breach seriousness) — maps from the fund-lifecycle `stage`
| pts | stages |
|----|--------|
| 0 | sanction, release, implementation, outcome (normal flow) |
| 1 | delay |
| 2 | shortfall |
| 3 | audit_flag, cag_para |
| 4 | investigation (FIR/vigilance) |
This one is fully derivable from `stage` — no judgement call.

### bands
- 0–3 **low** · 4–6 **moderate** · 7–9 **high** · 10–12 **severe**

---

## How it's used
1. **Timeline** — a severity badge + the component breakdown on each event; sort/
   filter by severity ("show only high+").
2. **News bubbles** — bubble size can reflect max severity in a district, not just
   raw event count, so the map shows *scale of problem*, not noise volume.
3. **Honesty** — if money is a gap, the badge says "severity partial (₹ unsourced)"
   rather than inventing a number. `components_sourced:false` is shown.

## What this is NOT
- Not a clickbait "outrage meter." Components are concrete (₹, people, breach
  stage), each visible.
- Not causal/political. It measures the *problem's scale*, not who's to blame.
- Not precise where inputs are gaps — partial scores are labelled partial.

Generator: `add_event_severity.py` computes money + governance from existing
fields; `people` is set per-event when authored (honest default 0 = unknown).
See `news-timeline-schema.md`, `fiscal-events.json`.
```
```
