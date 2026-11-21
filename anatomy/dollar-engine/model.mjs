// model.mjs — the math the Dollar Engine figure depends on.
// TRUTH FIRST: every moving part reads from a formula here, so the drawing never
// shows a motion that isn't backed by a documented relationship. These are STYLISED
// models (framing, not forecasts) but each maps to a real, sourced mechanism; the
// coefficients are labelled and kept in one place so they can be argued with.
//
// The single input is `stress` ∈ [0,1]: 0 = calm system, confidence high, dollars
// recycle smoothly; 1 = acute stress, de-dollarisation pressure, dollar scarce.

export const PARAMS = {
  // Triffin gauge: needle position t ∈ [-1,+1] (SUPPLY ↔ TRUST).
  // Higher stress pushes the system toward the "confidence/TRUST" risk edge.
  triffin: { k: 2, b: -1 },                 // t = k·stress + b

  // Pump (dollar recycling) angular speed, rad/s. A HEALTHY loop (low stress)
  // spins fast; stress chokes recycling. base + gain·(1-stress).
  pump: { base: 0.6, gain: 2.4 },

  // Per-economy "load" dials, each ∈ [0,1] as a function of stress.
  //   load = a + b·stress   (clamped)
  // CA — commodity price-taker: mild slope, mostly tracks global risk.
  // IN — oil importer with USD debt: steep slope (strong dollar + dear oil, and
  //      a weak rupee can't fix it — Marshall–Lerner fails on inelastic oil).
  // CN — diverts flow (petroyuan): load RISES with stress as it captures diversion.
  loads: {
    CA: { a: 0.35, b: 0.30 },
    IN: { a: 0.30, b: 0.62 },
    CN: { a: 0.25, b: 0.70 },
  },

  // --- sourced real-world sensitivities the dials stand in for (as-of 2026) ---
  // India oil-import bill: ~$14.5B per sustained +$10/bbl; ~0.35pp of GDP on the CAD.
  indiaOil: { perTenDollar_bnUSD: 14.5, perRupee_bnUSD: 1.58, cadGdpPP_perTenDollar: 0.35 },
  // Interest-rate parity (covered): F/S = (1+r_d)/(1+r_f). Used to explain, not animated.
  // Dollar reserve share trend: ~56-57% (multi-decade low) — context for stress→1.
};

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Triffin needle target, t ∈ [-1, +1].
export const triffinNeedle = (stress) => PARAMS.triffin.k * clamp01(stress) + PARAMS.triffin.b;

// Pump angular speed (rad/s) at a given stress.
export const pumpSpeed = (stress) => PARAMS.pump.base + PARAMS.pump.gain * (1 - clamp01(stress));

// The three economy loads, each clamped to [0,1], in dial order [CA, IN, CN].
export const economyLoads = (stress) => {
  const s = clamp01(stress);
  const { CA, IN, CN } = PARAMS.loads;
  return [clamp01(CA.a + CA.b * s), clamp01(IN.a + IN.b * s), clamp01(CN.a + CN.b * s)];
};

// Covered interest-rate parity forward rate: F = S·(1+r_d)/(1+r_f).
// (Explains why rising US yields pull the dollar up; shown in the page, not animated.)
export const forwardRate = (spot, rDomestic, rForeign) => spot * (1 + rDomestic) / (1 + rForeign);

// India's extra annual oil-import bill (USD bn) for a sustained oil move and FX move.
export const indiaOilBill = (dOilPerBbl, dRupeePerUSD = 0) =>
  (dOilPerBbl / 10) * PARAMS.indiaOil.perTenDollar_bnUSD + dRupeePerUSD * PARAMS.indiaOil.perRupee_bnUSD;

// A short human label for the current regime, used by the readout.
export const regimeLabel = (stress) =>
  stress < 0.4 ? "confidence high · dollars recycle"
  : stress < 0.7 ? "pressure building · loop strains"
  : "de-dollarisation bleed · IN squeezed, CN diverts";

// ---------------------------------------------------------------------------
// LIVE DATA — open, keyless, CORS-open sources, each tagged with how far to
// trust it (the project rule: sourced, or it's a gap; never fabricated).
//   HIGH   = primary official source (US Treasury, ECB via Frankfurter)
//   MEDIUM = third-party dashboard (indicative, not authoritative)
// If a fetch fails, we fall back to the labelled static baseline and SAY so.
// ---------------------------------------------------------------------------
export const SOURCES = {
  treasuryYield: {
    trust: "HIGH",
    label: "US Treasury FiscalData (official, keyless)",
    // avg interest rate on marketable Treasury securities — a clean keyless proxy
    url: "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates?sort=-record_date&page[size]=1&fields=record_date,avg_interest_rate_amt,security_desc&filter=security_type_desc:eq:Marketable",
    pick: (j) => Number(j?.data?.[0]?.avg_interest_rate_amt),
  },
  fxUsdInr: {
    trust: "HIGH",
    label: "Frankfurter / ECB reference (daily fixing)",
    url: "https://api.frankfurter.dev/v1/latest?from=USD&to=INR,CAD,CNY",
    pick: (j) => ({ inr: j?.rates?.INR, cad: j?.rates?.CAD, cny: j?.rates?.CNY, date: j?.date }),
  },
};

// Fetch one source; resolve to { ok, value, trust, label } and never throw.
export async function fetchSource(key, fetchImpl = fetch) {
  const s = SOURCES[key];
  try {
    const r = await fetchImpl(s.url, { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const v = s.pick(await r.json());
    const ok = v != null && (typeof v !== "number" || Number.isFinite(v));
    return { ok, value: ok ? v : null, trust: s.trust, label: s.label };
  } catch (e) {
    return { ok: false, value: null, trust: s.trust, label: s.label, error: String(e) };
  }
}

// Map a live US yield (%) onto the model's stress input. Higher yields = tighter
// global dollar = more stress on importers. Anchored: ~2% → calm, ~6% → high.
export const yieldToStress = (yieldPct) => clamp01((yieldPct - 2) / 4);

// Pull everything, fold into a stress estimate + a provenance record. Degrades
// gracefully: any missing source leaves stress null and is reported as a GAP.
export async function liveStress(fetchImpl = fetch) {
  const y = await fetchSource("treasuryYield", fetchImpl);
  const fx = await fetchSource("fxUsdInr", fetchImpl);
  const stress = y.ok ? yieldToStress(y.value) : null;
  return {
    stress,
    inputs: {
      usYield: y.ok ? { value: y.value, trust: y.trust, label: y.label } : { gap: true, label: y.label },
      fx: fx.ok ? { value: fx.value, trust: fx.trust, label: fx.label } : { gap: true, label: fx.label },
    },
  };
}
