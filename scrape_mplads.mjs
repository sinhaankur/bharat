/**
 * MPLADS tier-1 scraper — RUN ON YOUR OWN MACHINE (not in the agent sandbox).
 *
 * Why standalone: the official MPLADS portal is an interactive JS dashboard.
 * Static fetch (WebFetch / curl) returns an empty shell. This uses puppeteer to
 * render it. NOTE: the agent build environment blocks outbound browser network
 * (headless Chromium gets ERR_CONNECTION_REFUSED even on example.com), so this
 * was authored but could NOT be executed here. It is expected to work on a
 * normal machine with internet access.
 *
 * Setup:
 *   npm install puppeteer
 *   node scrape_mplads.mjs
 *
 * Output: prints constituency rows; copy the verified figures into
 * district-ledger.json, upgrading those MPLADS rows to source_tier 1 and
 * clearing needs_pdf_upgrade. Per project rule: only ship a figure you can cite.
 */
import puppeteer from 'puppeteer';

const PORTAL = 'https://mplads.gov.in/MPLADS/Dashboard/DashBoard.aspx';
// Constituencies we currently have in the ledger (extend as districts are added).
const WANT = ['KOLKATA UTTAR', 'KOLKATA DAKSHIN', 'BOLPUR'];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.setDefaultNavigationTimeout(120000);

try {
  await page.goto(PORTAL, { waitUntil: 'networkidle2' });

  // The dashboard typically filters by State then Constituency. Selectors below
  // are best-effort and may need adjusting after inspecting the live DOM
  // (right-click → Inspect on the State dropdown). Kept defensive on purpose.
  const stateSelected = await page.evaluate(() => {
    const sel = [...document.querySelectorAll('select')].find(s =>
      [...s.options].some(o => /west bengal/i.test(o.textContent)));
    if (!sel) return false;
    const opt = [...sel.options].find(o => /west bengal/i.test(o.textContent));
    sel.value = opt.value;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  });
  if (!stateSelected) console.error('⚠ Could not find a State dropdown — inspect the live DOM and update selectors.');
  await new Promise(r => setTimeout(r, 4000));

  // Scrape any table rows; match the constituencies we want.
  const rows = await page.evaluate((WANT) => {
    const out = [];
    for (const tr of document.querySelectorAll('table tr')) {
      const cells = [...tr.querySelectorAll('td,th')].map(c => c.textContent.trim());
      const joined = cells.join(' | ').toUpperCase();
      if (WANT.some(w => joined.includes(w))) out.push(cells);
    }
    return out;
  }, WANT);

  if (!rows.length) {
    console.error('No matching rows. The portal layout likely differs — open it in a real browser,');
    console.error('inspect the data table, and update the selectors / state-filter step above.');
  } else {
    console.log('Matched MPLADS rows (verify column meaning against the live header):');
    rows.forEach(r => console.log(' ', r.join(' | ')));
    console.log('\nExpected columns usually include: Constituency | MP | Released (cr) | Expended (cr) | Unspent (cr) | Works Recommended | Works Completed.');
  }
} catch (e) {
  console.error('FAILED to load/scrape portal:', e.message);
  console.error('If this is a network/timeout error, the portal is slow or blocking — retry, or use the');
  console.error('dataful.in open-data mirror (collection 589) as an alternative source.');
} finally {
  await browser.close();
}
