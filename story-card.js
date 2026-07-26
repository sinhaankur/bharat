/* story-card.js — the shared "story" spine for journeys AND news.
   One pattern, used by the reading-room journey (history) and the bias feed (today):

     STORY  ·  WHO FEELS WHAT (sentiment by section of people)  ·  THE RECORD (sourced)

   The core idea the user set: **bias is mostly the sentiment of a major section of people**,
   not just media lean. So a story shows how different SECTIONS of people feel/remember an
   event — bars that sum the mood — anchored to the spin-proof record. Media lean, where it
   exists, is just one more section, not the headline.

   Usage:
     StoryCard.render({
       title, when, summary,
       sentiment: [ { section, mood, weight(0..1), tone } ... ],   // tone: 'hot'|'warm'|'cool'|'cold'
       record:   [ { k, v } ... ],   // sourced facts; v null => an honest gap
       source, link
     }) -> HTML string

   No dependencies; safe to include on any page. Escapes all text. */
(function (global) {
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // tone → colour for the sentiment bar (hot=intense/raw … cold=distant/abstract)
  const TONE = {
    hot:  "oklch(0.62 0.20 25)",   // raw, painful, angry
    warm: "oklch(0.72 0.15 60)",   // felt, proud, engaged
    cool: "oklch(0.66 0.10 230)",  // detached, informational
    cold: "oklch(0.55 0.02 250)",  // distant, abstract, forgotten
  };
  const toneLabel = { hot: "raw / intense", warm: "felt / engaged", cool: "detached", cold: "distant / faded" };

  function sentimentBlock(sentiment) {
    if (!sentiment || !sentiment.length) return "";
    const rows = sentiment.map(s => {
      const pct = Math.round(Math.max(0, Math.min(1, s.weight || 0)) * 100);
      const col = TONE[s.tone] || TONE.cool;
      return `<div class="sc-sent-row">
        <span class="sc-sent-sec">${esc(s.section)}</span>
        <span class="sc-sent-track"><i style="width:${pct}%;background:${col}"></i></span>
        <span class="sc-sent-mood" style="color:${col}">${esc(s.mood)}</span>
      </div>`;
    }).join("");
    return `<div class="sc-sent">
      <div class="sc-h">Who feels what — sentiment by section of people</div>
      ${rows}
      <div class="sc-sent-foot">Bias here = how a major section of people <em>feels or remembers</em> this —
      not a single "truth". Weights are an honest editorial read of documented reaction, not a poll.</div>
    </div>`;
  }

  function recordBlock(record, source) {
    if (!record || !record.length) return "";
    const rows = record.map(r => r.v == null
      ? `<div class="sc-rec-row"><span class="k">${esc(r.k)}</span><span class="v gap">— gap</span></div>`
      : `<div class="sc-rec-row"><span class="k">${esc(r.k)}</span><span class="v">${esc(r.v)}</span></div>`).join("");
    return `<div class="sc-rec">
      <div class="sc-h green">◆ The record — the spin-proof facts</div>
      ${rows}
      ${source ? `<div class="sc-rec-foot">Source: ${esc(source)}. A gap is an honest "no published figure", not a zero.</div>` : ""}
    </div>`;
  }

  function render(story) {
    if (!story) return "";
    const link = story.link
      ? `<a class="sc-link" href="${esc(story.link)}"${/^https?:/.test(story.link) ? ' target="_blank" rel="noopener"' : ""}>${esc(story.linkText || "read the record →")}</a>`
      : "";
    return `<article class="story-card">
      <header class="sc-head">
        ${story.when ? `<span class="sc-when">${esc(story.when)}</span>` : ""}
        <h3 class="sc-title">${esc(story.title)}</h3>
      </header>
      ${story.summary ? `<p class="sc-summary">${esc(story.summary)}</p>` : ""}
      ${sentimentBlock(story.sentiment)}
      ${recordBlock(story.record, story.source)}
      ${link}
    </article>`;
  }

  // inject the shared stylesheet once (so any page using StoryCard looks consistent)
  function injectCSS() {
    if (document.getElementById("story-card-css")) return;
    const css = `
    .story-card { border: 1px solid var(--border-strong); border-radius: var(--radius); background: oklch(0.15 0.005 250); padding: 1rem 1.1rem; }
    .story-card .sc-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; }
    .story-card .sc-when { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: oklch(0.82 0.13 78); }
    .story-card .sc-title { font-size: 1.1rem; margin: 0.1rem 0 0.3rem; line-height: 1.2; }
    .story-card .sc-summary { color: var(--muted-foreground); font-size: 0.9rem; line-height: 1.6; margin: 0 0 0.8rem; }
    .story-card .sc-h { font-family: var(--font-mono); font-size: 8.5px; letter-spacing: 0.1em; text-transform: uppercase; color: oklch(0.72 0.06 250); margin-bottom: 0.5rem; }
    .story-card .sc-h.green { color: oklch(0.74 0.14 145); }
    .story-card .sc-sent { margin: 0.2rem 0 0.9rem; }
    .story-card .sc-sent-row { display: grid; grid-template-columns: 40% 1fr auto; align-items: center; gap: 0.5rem; margin: 0.28rem 0; }
    .story-card .sc-sent-sec { font-size: 0.82rem; color: var(--foreground); }
    .story-card .sc-sent-track { height: 8px; background: var(--muted, oklch(0.25 0 0)); border-radius: 999px; overflow: hidden; }
    .story-card .sc-sent-track i { display: block; height: 100%; border-radius: 999px; }
    .story-card .sc-sent-mood { font-family: var(--font-mono); font-size: 10px; white-space: nowrap; }
    .story-card .sc-sent-foot, .story-card .sc-rec-foot { font-size: 0.72rem; color: var(--muted-foreground); line-height: 1.5; margin-top: 0.5rem; }
    .story-card .sc-sent-foot em, .story-card .sc-rec-foot em { font-style: italic; }
    .story-card .sc-rec { background: oklch(0.12 0 0); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.6rem 0.7rem; margin-top: 0.3rem; }
    .story-card .sc-rec-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.22rem 0; border-bottom: 1px dashed oklch(0.985 0 0 / 0.07); font-size: 0.85rem; }
    .story-card .sc-rec-row:last-of-type { border-bottom: 0; }
    .story-card .sc-rec-row .k { color: var(--muted-foreground); }
    .story-card .sc-rec-row .v { color: var(--foreground); font-family: var(--font-mono); }
    .story-card .sc-rec-row .v.gap { color: oklch(0.7 0.15 60); }
    .story-card .sc-link { display: inline-block; margin-top: 0.7rem; font-family: var(--font-mono); font-size: 11px; color: oklch(0.78 0.16 72); }
    .story-card .sc-link:hover { text-decoration: underline; }`;
    const el = document.createElement("style");
    el.id = "story-card-css"; el.textContent = css;
    document.head.appendChild(el);
  }
  if (typeof document !== "undefined") injectCSS();

  global.StoryCard = { render, TONE, toneLabel };
})(typeof window !== "undefined" ? window : this);
