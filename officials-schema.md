# District Money-Flow Accountability Ledger — data model

**Goal (from user):** understand the *flow of money to each district over time*,
what it was meant to do, what actually happened ("money wasn't spent right"),
and **who is responsible** — department by department.

The roster of officials is not the point; it is the *accountability column*
next to the *money column*. The unit of the dataset is a **district-year ledger
entry**, not a person.

> Map stays clean: this all lives in the **drill-down panel**, never on the choropleth.

## The four columns of every ledger row

```
 MONEY IN  →  THROUGH (dept)  →  INTENDED  →  WHAT HAPPENED  →  WHO RESPONSIBLE
```

| Money stream            | Flows through dept        | Accountable district officer        | Source (PDF-first)            |
|-------------------------|---------------------------|-------------------------------------|-------------------------------|
| MGNREGS                 | Rural Development         | DM + Zilla Parishad CEO             | PFMS / nrega.nic.in           |
| PMAY-G / -U             | Rural Dev / Housing       | DM + ZP CEO / Municipal Comm.       | pmayg.nic.in                  |
| PMGSY (roads)           | Rural Dev / PWD           | PWD Exec. Engineer + DM            | omms.nic.in                   |
| Jal Jeevan Mission      | PHED / Water              | PHED Exec. Engineer + DM           | ejalshakti.gov.in             |
| Health/Education mission| Health / Education        | CMO / DEO + DM                      | scheme dashboards             |
| MPLADS (₹5 cr/MP/yr)    | released via DM           | **Lok Sabha MP** (named)            | mplads.gov.in                 |
| MLA-LAD                 | released via DM           | **MLA** (named)                     | state portals                 |
| FC grants to local body | Panchayati Raj / Urban    | ZP CEO / Municipal Commissioner     | FC report PDF + state budget  |
| Establishment / treasury| District admin            | DM + District Treasury Officer      | AG / state treasury           |

## "What happened" — the accountability dimension (hardest data, be honest)

Per row: `utilisation_pct`, `unspent_cr`, `lapsed`, `audit_flag`,
`cag_para` (CAG report reference), `vendor` (company paid), `notes`.
Most of this lives in **CAG audit PDFs** and PFMS — uneven coverage. A null
here means "not yet sourced", recorded in `_gaps`, never guessed.

## Sources are PDF-first (per user: "Sources is Important PDF mostly")

Each fact carries `source` + `source_tier`:
`1 gov_pdf` (Pay Commission, gazette, CAG, FC report) >
`2 gov_html` (*.nic.in / *.gov.in) > `3 wikipedia` (discovery only) > `4 news`.

## Top-level shape: `district-ledger.json`

```jsonc
{
  "_meta": {
    "as_of": "2026-06",
    "goal": "money flow to each district over time + who is responsible",
    "source_tiers": {"1":"gov_pdf","2":"gov_html","3":"wikipedia","4":"news"},
    "caveat": "Utilisation/audit data is sparse and PDF-bound; names rotate; salary joined per-post from pay-scales.json. Gaps recorded, never faked.",
    "coverage": {}
  },
  "states": {
    "West Bengal": {
      "entity_type": "state",                 // state | ut_legislature | ut_no_legislature
      "heads": {                              // shared across the state's districts
        "governor":        {"name": null, "post": "Governor", "as_of": null, "source": null, "source_tier": null},
        "chief_minister":  {"name": null, "post": "Chief Minister", "as_of": null, "source": null, "source_tier": null},
        "chief_secretary": {"name": null, "post": "Chief Secretary", "as_of": null, "source": null, "source_tier": null},
        "dgp":             {"name": null, "post": "Director General of Police", "as_of": null, "source": null, "source_tier": null},
        "high_court":      {"name": "Calcutta High Court", "chief_justice": null, "source": null}
      },
      "rajya_sabha": [{"name": null, "party": null, "term_end": null, "source": null}],
      "districts": {
        "Kolkata": {
          "admin_model": "split",              // standard | split | corporation_led — NOT every district has one DM. Kolkata splits power across Police Commissioner + KMC + stub Collector. Drives how "who is responsible" renders.
          "system_notes": [                     // how the system functions / DYSFUNCTIONS — each footnoted to public record
            {"note": "Kolkata has no conventional District Magistrate; magisterial powers vest in the Police Commissioner, revenue functions in a limited Collector post, service delivery in Kolkata Municipal Corporation.",
             "kind": "structural", "source": null, "source_tier": null}
          ],
          "roster": {                          // the "who" — full chain, kept per user
            "collector":          {"name": null, "post": "District Magistrate", "service": "IAS", "as_of": null, "source": null, "source_tier": null},
            "sp":                 {"name": null, "post": "Commissioner of Police", "service": "IPS", "as_of": null, "source": null, "source_tier": null},
            "zp_ceo":             {"name": null, "post": "Zilla Parishad CEO / Municipal Commissioner", "service": "IAS", "as_of": null, "source": null, "source_tier": null},
            "treasury_officer":   {"name": null, "post": "District Treasury Officer", "service": "State", "as_of": null, "source": null, "source_tier": null},
            "district_judge":     {"name": null, "post": "District & Sessions Judge", "service": "Judicial", "as_of": null, "source": null, "source_tier": null},
            "minister_in_charge": {"name": null, "post": "District-in-charge Minister", "service": "Political", "as_of": null, "source": null, "source_tier": null}
          },
          "legislature": {
            "lok_sabha": [{"constituency": null, "name": null, "party": null, "source": null, "source_tier": null}],
            "assembly":  [{"constituency": null, "name": null, "party": null, "source": null, "source_tier": null}]
          },
          "departments": [                     // money flows THROUGH these
            {"dept": "Rural Development", "type": "public_facing",
             "officer": {"name": null, "post": "Project Director DRDA", "source": null},
             "schemes": ["MGNREGS", "PMAY-G"]}
          ],
          "ledger": [                          // the timeline — one row per scheme per FY
            {
              "fy": "2022-23",
              "scheme": "MGNREGS",
              "stream": "central_scheme",
              "through_dept": "Rural Development",
              "money_in_cr": null,
              "intended": null,                // person-days / assets planned
              "what_happened": {
                "utilisation_pct": null, "unspent_cr": null, "lapsed": false,
                "audit_flag": null, "cag_para": null, "vendor": null, "notes": null
              },
              "responsible": {                 // refs into roster/legislature
                "primary": "collector", "secondary": ["zp_ceo"]
              },
              "source": null, "source_tier": null
            }
          ],
          "_gaps": []
        }
      }
    }
  }
}
```

## Field rules

- One ledger row = one scheme × one FY × one district. The timeline is the array.
- `null` = source checked, nothing found → add to `_gaps`. Never fabricate.
- `money_in_cr` from PFMS/scheme portal; `what_happened.*` from CAG/PFMS; both sparse.
- `responsible.primary` is a key into `roster` (or `legislature`) so the UI can
  render "₹X came, Y% spent, **DM <name>** accountable" without duplicating names.
- Salary/cost-to-govt joined from `pay-scales.json` by `post` at render time.

## Out of scope (separate datasets, parked)

- **Companies in districts over 500 years** — historical economic research, own page.
- Live "best-effort current names" beyond the snapshot — staleness is accepted.
