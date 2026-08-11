/* feed-enrich.js — the engines that work ON TOP of the scraped RSS news.
   For each story we derive, from its headline + snippet only (sourced-or-gap; never
   invents), four reader signals to sit beside the outlet's Bias (media lean):
     · Sentiment   — lexicon tone (how the story reads)
     · Officials   — govt figures named (matched to officials.json, else a generic title)
     · Life impact — who/what it touches (scheme / topic → affected people)
     · Location     — the place it anchors to (from the item's geo)
   Everything is a best-effort read of public text; a blank is an honest gap, not a claim.
   Exposes window.FeedEnrich.  */
(function (global) {
  // ---- Sentiment: a small, transparent tone lexicon ----
  var POS = ["relief", "boost", "approved", "sanctioned", "launch", "inaugurat", "win", "wins", "gain", "record", "growth", "rescued", "restored", "cleared", "hope", "benefit", "aid", "support", "resolved", "surge", "revival", "recover", "settle", "patch-up", "patch‑up", "deal", "pact"];
  var NEG = ["death", "died", "killed", "dead", "crisis", "protest", "arrest", "arrested", "fraud", "scam", "corruption", "flood", "drought", "fire", "collapse", "attack", "clash", "riot", "ban", "freeze", "frozen", "cut", "loss", "row", "dispute", "delay", "stalled", "shortage", "encroach", "illegal", "violence", "assault", "toll", "warn", "threat", "seize", "raid", "probe", "fine", "penalty", "default", "deficit", "unrest", "eviction", "displaced"];
  function sentiment(text) {
    var t = " " + (text || "").toLowerCase() + " ", p = 0, n = 0;
    POS.forEach(function (w) { if (t.indexOf(w) >= 0) p++; });
    NEG.forEach(function (w) { if (t.indexOf(w) >= 0) n++; });
    if (p === 0 && n === 0) return { tone: "neutral", cls: "sent-neu", score: 0 };
    if (n > p) return { tone: "negative", cls: "sent-neg", score: -(n - p) };
    if (p > n) return { tone: "positive", cls: "sent-pos", score: p - n };
    return { tone: "mixed", cls: "sent-mix", score: 0 };
  }

  // ---- Officials: match named people from officials.json, else a generic office title.
  //     Sourced-only + careful: we say "named in the story", never accuse. If we match a
  //     tracked official we link to their record; otherwise we surface the office title.
  var OFFICIALS = [];      // populated by init()
  function setOfficials(list) { OFFICIALS = (list || []).filter(function (o) { return o && o.name; }); }
  var TITLE_RE = /\b(Chief Minister|CM|Prime Minister|PM|Minister|Governor|District Magistrate|DM|Collector|Commissioner|Mayor|MP|MLA|IAS|IPS|Secretary|Chief Justice|Judge)\b/;
  function officials(text) {
    var t = text || "", hits = [];
    OFFICIALS.forEach(function (o) {
      if (o.name && o.name.length > 3 && t.indexOf(o.name) >= 0) {
        hits.push({ name: o.name, post: (o.current_post && o.current_post.post) || o.service || "", id: o.id, tracked: true });
      }
    });
    if (!hits.length) {
      var m = t.match(TITLE_RE);
      if (m) hits.push({ name: null, post: m[1], tracked: false });
    }
    return hits.slice(0, 3);
  }

  // ---- Life impacted: topic / scheme → a plain who-it-touches line. ----
  var TOPICS = [
    { re: /\bMGNREG|NREGA|wage|job card|worker/i, who: "rural workers & their wages" },
    { re: /\bflood|inundat|rain|monsoon|cyclone|water logging/i, who: "residents in low-lying & flood-prone areas" },
    { re: /\bfarmer|crop|kisan|agri|MSP|mandi/i, who: "farmers & farm incomes" },
    { re: /\bhealth|hospital|NFHS|immunis|vaccine|disease|medical/i, who: "patients & public health" },
    { re: /\bschool|student|education|exam|teacher|scholarship/i, who: "students & schooling" },
    { re: /\bevict|demolition|encroach|slum|housing|resettle/i, who: "families facing eviction / housing loss" },
    { re: /\bpension|elderly|widow|disab|welfare|ration|PDS|food security/i, who: "welfare beneficiaries" },
    { re: /\bwater|drinking water|Jal|NMCG|river|sanitation|sewer/i, who: "households' water & sanitation" },
    { re: /\broad|metro|bridge|transport|railway|highway|airport/i, who: "commuters & connectivity" },
    { re: /\bpower|electricity|discom|tariff|outage/i, who: "electricity consumers" },
    { re: /\bcrime|police|arrest|assault|riot|law and order/i, who: "public safety" },
    { re: /\btax|GST|budget|fund|grant|devolution|deficit/i, who: "public money & taxpayers" }
  ];
  function lifeImpact(text) {
    var t = text || "";
    for (var i = 0; i < TOPICS.length; i++) if (TOPICS[i].re.test(t)) return TOPICS[i].who;
    return null;   // honest gap
  }

  // ---- one call: enrich a news item ----
  function enrich(it) {
    var text = (it.headline || "") + " . " + (it.snippet || "");
    return {
      sentiment: sentiment(text),
      officials: officials(text),
      life: lifeImpact(text),
      place: (it.geo && (it.geo.name || it.geo.district || it.geo.place)) || null,
    };
  }

  function init(officialsJson) {
    if (officialsJson) setOfficials(officialsJson.officials || officialsJson);
  }

  global.FeedEnrich = { init: init, enrich: enrich, sentiment: sentiment, officials: officials, lifeImpact: lifeImpact, setOfficials: setOfficials };
})(typeof window !== "undefined" ? window : this);
