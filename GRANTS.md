# India Fiscal Map — grant application kit

> Paste-ready text for grant / fellowship applications. Replace `[CONTACT EMAIL]`
> and `[YOUR NAME]` before sending. All figures below are current and verifiable
> against the live site + the open repo — do not inflate them.

**Live:** https://sinhaankur.github.io/india-fiscal-map/
**Code & data (open):** https://github.com/sinhaankur/india-fiscal-map
**Contact:** [YOUR NAME] · [CONTACT EMAIL]

---

## One-line
An open, source-cited atlas that traces public money to every Indian district —
what came in, through which department, who is accountable, and what the public
record shows actually happened — so citizens and journalists can see how fiscal
power really flows.

## The problem (why fund this)
India moves enormous sums from the Union to 594 districts through dozens of
schemes (MGNREGS, PMAY, AMRUT, Finance Commission grants, MPLADS…). The
information needed to follow that money — budgets, utilisation, audit findings,
who is responsible — is *technically public* but scattered across hundreds of
government PDFs and portals in a form no ordinary citizen, and few journalists,
can assemble. The accountability gap isn't secrecy; it's **fragmentation**.

## What we've built (verifiable today)
- A structured ledger for **594 districts across 35 states/UTs**: the
  administrative model, the schemes that apply, the constitutional basis of each,
  and the chain of command (who appoints each responsible officer).
- **13 deep, hand-authored, PDF-cited district exemplars** (e.g. Kolkata's KMC
  budget showing 52% grant-dependency; Birbhum's four-year MGNREGS fund freeze) —
  **9 carry real money figures** sourced to government documents.
- A **governance-protocol decoder** applied to all districts: every scheme tagged
  by constitutional list (Union/State/Concurrent/local-body), funding pattern,
  and the sanction→utilisation→audit gates money must clear.
- A **fund-lifecycle timeline** with story chains, and a **6-language news
  aggregation pipeline** (English, Hindi, Bengali, Tamil, Telugu, Marathi) with
  Ground-News-style source-coverage / blindspot analysis.
- Open **data download, a static JSON API, and embeddable widgets** for reuse by
  newsrooms and researchers.

## What makes it trustworthy (our core method)
**"PDF-cited or it's a gap."** Every figure carries a government source and a
source tier (1 = gov PDF, 2 = gov portal, 3–4 = flagged). **A number with no
authoritative source stays blank and is recorded as an explicit data gap — never
estimated, never guessed.** We would rather show an honest gap than a confident
fabrication. This discipline is the project's whole value proposition.

## What the grant would fund
1. **Deepen coverage** — convert baseline districts into full PDF-cited ledgers
   (the deep-dive work is hand-research; funding directly buys more districts).
2. **Multi-dimensional layers** — add district crime (NCRB), economy (MoSPI),
   language (Census), and electoral (ECI) data to reveal where money does and
   doesn't follow need.
3. **Sustain the news + data pipeline** and the public API/widgets for newsrooms.

## Impact / who uses it
Journalists (district data desks), researchers, civil-society organisations,
electoral analysts, and citizens. The open API + widgets mean the work
multiplies: any outlet can embed a source-cited fiscal card in a story.

## Budget shape (adapt to the funder)
- Researcher time for deep-district sourcing (the main cost; per-district unit).
- Data engineering / pipeline maintenance.
- Hosting is near-zero (static site) — funds go to *content*, not infrastructure.

## Suggested funders to target
Data-journalism programs (Google News Initiative; Pulitzer Center data
journalism), transparency/accountability funders, India civic-tech and
open-government programs, university/think-tank fellowships on fiscal federalism.

## Proof points to link in any application
- Live deep district: `/index.html?state=West%20Bengal&district=Kolkata`
- Methodology & disclaimer: `/about.html`
- How the system works (department-wise): `/how-it-works.html`
- Open data + API: `/data.html`
