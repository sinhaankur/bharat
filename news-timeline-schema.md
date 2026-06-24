# News + Timeline + Story-Chain layer — data model

**Goal (from user):** the fiscal map should also carry **news on a timeline**
("based on what date/time, what happened"), presented **Ground News–style**
(one event, many outlets, coverage/bias framing) — and where events form a
**story chain**, report them as a chain.

**The differentiator:** Ground News aggregates *anyone's* news. This layer is
different because every event can be **anchored to the fiscal ledger** — a
specific `state → district → scheme → official → ledger row`. A story chain here
is not "related articles", it is the **lifecycle of a fund**:

```
 SANCTION → RELEASE → DELAY → AUDIT FLAG → CAG PARA → ACTION/OUTCOME
```

That chain is the atomic unit the user chose. The news-aggregation feed
*populates* and *corroborates* these chains.

> Map stays clean (same rule as the ledger): the timeline is a scrubber + a
> side panel, never clutter baked onto the choropleth.

---

## Two linked entity types

The user picked **aggregated feeds (RSS/API)** as the source *and*
**fund-lifecycle events** as the chain unit. Those need a bridge: feeds give
**articles**; chains need **events**. So we model both and link them.

```
news_item  (raw, aggregated, many)  ──links──►  fiscal_event (curated, anchored, fewer)
                                                      │
                                                      └─ belongs to ─► story_chain
```

- **`news_item`** — one article from one outlet. Auto-ingested. Cheap, high volume.
- **`fiscal_event`** — one thing that happened to a fund, on a date, in a place.
  Anchored to the ledger. A `fiscal_event` is *corroborated by* one or more
  `news_item`s and/or a government source.
- **`story_chain`** — an ordered set of `fiscal_event`s telling one fund's story.

---

## Entity 1 — `news_item` (aggregated article)

Ground News–style: the same story across outlets, with coverage framing.

```jsonc
{
  "id": "ni_2026_0612_anandabazar_kmc",
  "headline": "KMC water project funds unspent, audit finds",
  "outlet": "Anandabazar Patrika",
  "outlet_lean": "centre-left",        // for the Ground-News coverage bar; see lean vocab
  "outlet_type": "regional_daily",      // national | regional_daily | wire | tv | digital | gov_release
  "language": "bn",                     // ISO 639-1
  "url": "https://...",                 // LINK ONLY — we never republish full text
  "snippet": "First ~40 words / outlet's own summary only (fair-use excerpt).",
  "published_at": "2026-06-12T09:30:00+05:30",
  "ingested_at": "2026-06-12T11:02:00+05:30",
  "ingest_source": "rss:anandabazar_kolkata",  // which feed/API it came from
  // --- anchoring (may be auto-suggested, human-confirmed) ---
  "geo": { "state": "West Bengal", "district": "Kolkata", "lat": null, "lon": null },
  "scheme_ref": "AMRUT",               // resolves via _meta.scheme_registry / aliases
  "official_ref": "municipal_commissioner",   // resolves via roster role key
  "fiscal_event_ids": ["fe_kmc_amrut_audit_2026"],  // which event(s) this corroborates
  "anchor_confidence": "human_confirmed",  // auto_suggested | human_confirmed | unanchored
  // --- safety / quality ---
  "paywalled": false,
  "moderation": "approved"             // pending | approved | rejected
}
```

### Coverage / bias framing (the Ground News bit)
For a given `fiscal_event`, render a **coverage bar** computed from its linked
`news_item`s:
- count by `outlet_lean` → left / centre / right distribution
- count by `language` → e.g. "covered in Bengali + English, not Hindi"
- count by `outlet_type` → wire vs regional vs TV
- **"blindspot"** = an event covered by only one side / one language (Ground
  News's signature feature). Computed, not stored.

`outlet_lean` vocab (kept deliberately coarse + sourced):
`left | centre-left | centre | centre-right | right | state_media | unknown`.
Lean must come from a **published, citable media-bias assessment**, not our own
guess — store `lean_source`. If none exists, `unknown`. (Bias labels are the
most legally/editorially sensitive field; keep them defensible.)

---

## Entity 2 — `fiscal_event` (the anchored, dated thing that happened)

This is the timeline's atom and the chain's link.

```jsonc
{
  "id": "fe_kmc_amrut_audit_2026",
  "date": "2026-06-10",                 // when it HAPPENED (not when reported)
  "date_precision": "day",             // day | month | quarter | year
  "stage": "audit_flag",               // see fund-lifecycle stages below
  "title": "CAG flags ₹X cr AMRUT water funds unspent in KMC",
  "summary": "One-paragraph neutral description. Facts only.",
  // --- ledger anchor ---
  "geo": { "state": "West Bengal", "district": "Kolkata" },
  "scheme_ref": "AMRUT",
  "official_ref": "municipal_commissioner",
  "ledger_row_ref": null,              // optional: link to a ledger[] entry id
  "amount_cr": null,                   // figure ONLY if PDF-cited; else null + gap
  // --- story chain ---
  "chain_id": "sc_kmc_amrut_water",
  "chain_seq": 4,                      // position in the chain
  // --- sourcing (SAME tier rule as the ledger) ---
  "primary_source": {                  // the authoritative doc, if any
    "type": "gov_pdf", "title": "CAG Report ...", "url": "...", "source_tier": 1
  },
  "corroborating_news": ["ni_2026_0612_anandabazar_kmc", "ni_..."],
  "confidence": "reported",            // documented (gov source) | reported (news only) | alleged
  "figure_gap": true
}
```

### Fund-lifecycle stages (`stage` enum) — the chain's grammar
Ordered; a chain advances through them (skips allowed):

| stage          | meaning                                              |
|----------------|------------------------------------------------------|
| `sanction`     | funds sanctioned / scheme approved                   |
| `release`      | money released (PFMS / instalment)                   |
| `delay`        | release withheld / frozen / late                     |
| `implementation` | work started / ongoing                            |
| `shortfall`    | low utilisation / unspent / lapsed                   |
| `audit_flag`   | flagged by AG / internal audit                       |
| `cag_para`     | appears in a CAG report / PAC                         |
| `investigation`| vigilance / FIR / probe                              |
| `action`       | recovery / suspension / prosecution / correction     |
| `outcome`      | resolved / asset delivered / closed                  |

---

## Entity 3 — `story_chain` (the thread)

```jsonc
{
  "id": "sc_kmc_amrut_water",
  "title": "Kolkata's AMRUT water money: sanctioned, stalled, flagged",
  "geo": { "state": "West Bengal", "district": "Kolkata" },
  "scheme_ref": "AMRUT",
  "status": "open",                    // open | resolved | dormant
  "event_ids": ["fe_...sanction", "fe_...release", "fe_...delay", "fe_kmc_amrut_audit_2026"],
  "started_at": "2023-04-01",
  "last_event_at": "2026-06-10",
  "one_line": "₹X cr sanctioned 2023; release stalled; CAG flagged unspent 2026."
}
```

The chain is what makes this *not just a news feed*: the user can watch one
fund's money go from promise to (non-)delivery, with each step dated, anchored
to the responsible office, and corroborated by both government docs and the
spread of news outlets that did (or didn't) cover it.

---

## File layout (proposed)

Keep separate from the (already large) ledger:
- `news-feed.json` — `{ "_meta": {...}, "news_items": [...] }`
- `fiscal-events.json` — `{ "_meta": {...}, "fiscal_events": [...], "story_chains": [...] }`
- `feeds.json` — registry of RSS/API sources being ingested (name, url, outlet, lean, lean_source, language, cadence).

Cross-reference by `id`. `scheme_ref` / `official_ref` resolve against the
ledger's `_meta.scheme_registry`, `scheme_aliases`, and `authority_map` already
built — so the news layer reuses the protocol decoding, not a parallel taxonomy.

---

## Aggregation safety (the "is this a news publisher?" risk, from earlier)

Bake these into ingestion so the legal posture is defensible:
1. **Link, don't republish.** Store `url` + a short `snippet` (the outlet's own
   summary / first ~40 words), never full article text. Headlines + facts are
   not copyrightable; full reproduction is.
2. **Always attribute** outlet + link + timestamp on every card.
3. **Bias labels must be sourced** (`lean_source`), coarse, and marked our
   *aggregation* of third-party assessments — never our editorial verdict.
4. **Facts vs. allegations:** `confidence` field. News-only items are
   `reported`/`alleged`, never stated as `documented` fact. Mirrors the ledger's
   fact-vs-commentary separation (see `about.html`).
5. **Corrections/takedown** path = same as the project (about.html §05).
6. **robots/ToS:** only ingest feeds that permit it (RSS/official APIs);
   record `ingest_source` for auditability.

---

## Build order (when repo is unarchived)
1. This schema → 2. `feeds.json` with a handful of permitted RSS sources →
3. ingestion script (`ingest_news.py`, idempotent, dedup by URL) →
4. human-anchor step (link news_item → fiscal_event) →
5. timeline UI: date scrubber over the map + per-event card with coverage bar +
   story-chain rail. Map stays clean; timeline lives in panel/scrubber.

Part of the broader project: see `officials-schema.md` (ledger),
`_meta.protocol_layers` (governance decode), `about.html` (disclaimer/methodology).
```
```
