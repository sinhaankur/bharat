/* ads.js — AdSense scaffolding, DISABLED by default.
 *
 * Honest note: do NOT enable until the site has (a) AdSense approval, which needs
 * substantial ORIGINAL content + real traffic, and (b) a published privacy policy
 * (privacy-policy.html — done). Turning ads on before approval earns nothing and
 * risks rejection. This file is the one place to flip it on later.
 *
 * To enable when ready:
 *   1. Get an AdSense account + publisher id (ca-pub-XXXXXXXXXXXXXXXX).
 *   2. Set ADS_ENABLED = true and ADS_CLIENT below.
 *   3. Add <script src="ads.js"></script> to pages, and drop an
 *      <ins class="adsbygoogle" ...> slot where you want an ad (see renderSlots).
 */
(function () {
  const ADS_ENABLED = false;                       // ← flip to true after approval
  const ADS_CLIENT  = "ca-pub-XXXXXXXXXXXXXXXX";    // ← your AdSense publisher id

  if (!ADS_ENABLED) {
    // leave any .ad-slot placeholders visibly inert (no network calls, no clutter)
    document.querySelectorAll(".ad-slot").forEach(el => {
      el.setAttribute("data-ads", "disabled");
    });
    return;
  }

  // load the AdSense library once
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADS_CLIENT;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);

  // turn each .ad-slot into a real responsive ad unit
  document.querySelectorAll(".ad-slot").forEach(el => {
    el.innerHTML = `<ins class="adsbygoogle" style="display:block"
      data-ad-client="${ADS_CLIENT}" data-ad-slot="${el.dataset.adSlot || ""}"
      data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });
})();
