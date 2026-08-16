#!/usr/bin/env python3
"""gen_ds_pages.py — generate one Atomic-Design reference page per Indic design
system from the flagship design-system.html (the Mauryan page) as the template.

Author: Sinhaankur.

Every system's page is the SAME atomic scaffold (tiers 0-4, the WHY panels, the
live demo + copy-code specimens) — only the theme skin, the masthead heritage
story, the token swatch names, and the register notes change. That is the whole
argument of the family: one spine, many heritages.

Run:  python3 gen_ds_pages.py
Emits: ds-gupta.html, ds-chola.html, ds-rajput.html
The Mauryan flagship stays hand-authored at design-system.html (it owns the
icon sprite gallery, which the others don't have yet).
"""
import re, pathlib

ROOT = pathlib.Path(__file__).parent
TEMPLATE = (ROOT / "design-system.html").read_text(encoding="utf-8")

# ---- per-system configuration -------------------------------------------------
# swatches: [display name, css var]. Vars must be defined in the system's theme
# css (or be house tokens). Renders live from computed styles, so an undefined
# var simply shows transparent — safe.
SYSTEMS = {
    "gupta": {
        "theme_css": "theme-gupta.css",
        "html_class": "theme-gupta theme-light",
        "title": "Gupta design system · Atomic reference | Bharat",
        "kicker": "Indic design systems · atomic reference",
        "h1": 'Gupta — <em>plaster, fresco &amp; the ornate halo</em>',
        "lead": (
            "The <b>Gupta</b> register of Bharat — the classical, devotional "
            "counterpart to Mauryan. Where Mauryan is stone-and-sky (the "
            "skeleton), Gupta is <b>warm red sandstone and Ajanta fresco "
            "jewel-tones</b> — the soul: long-form reading, heritage, ornament. "
            "Same five Atomic Design tiers, same live specimens; a different "
            "heritage on the same spine."),
        "heritage": (
            "Mathura red / pink sandstone (the Gupta Buddha &amp; Vishnu "
            "figures), Ajanta fresco ochre / red / terre-verte / lapis on a "
            "lime-plaster ground, and the ornate radiating halo (prabhāvali). "
            "Sourced in <code>ASHOKA_DESIGN.md §2b</code>."),
        "by_line": (
            "System &amp; authorship · <b>Sinhaankur</b> — the classical Gupta "
            "register, drawn from Mathura sculpture &amp; Ajanta painting. "
            "™ / © Sinhaankur."),
        "swatches": [
            ["Paper · plaster", "--background"], ["Card", "--card"], ["Surface", "--surface"],
            ["Ink · fresco-brown", "--foreground"], ["Muted", "--muted"], ["Muted text", "--muted-foreground"],
            ["Border", "--border"], ["Border strong", "--border-strong"],
            ["Accent · halo-gold", "--accent"], ["Accent ink", "--accent-ink"], ["Accent tint", "--accent-tint"],
            ["Gupta stone", "--gupta-stone"], ["Gupta rose", "--gupta-rose"], ["Ajanta lapis", "--ajanta-lapis"],
            ["Success · terre-verte", "--success"], ["Warning · ochre", "--warning"], ["Danger · fresco-red", "--danger"], ["Info · lapis", "--info"],
        ],
        "tier0_why": (
            "The Gupta values are drawn from real artefacts — Mathura sandstone "
            "and the Ajanta palette (ASHOKA_DESIGN.md §2b). The action colour is "
            "the <b>halo-gold</b>, the ground is lime-plaster, and the corner "
            "softens from Mauryan's incised 2px to a warmer 6px — Gupta ornament "
            "is foliate and rounded, not austere."),
        "colour_desc": (
            "Warm plaster &amp; fresco. <span class=\"heritage\">Lime-plaster "
            "paper, Mathura-sandstone accents, Ajanta jewel-tones for status.</span>"),
        "register_desc": (
            "<span class=\"heritage\">Gupta itself carries two moods: the "
            "<b>lime-plaster</b> light register for reading, and the dark "
            "<b>cave-shrine</b> register (Ajanta interior — lamp-lit rock, ivory "
            "ink, gold halo) for immersive heritage pages.</span> Same atoms, "
            "different tokens. Use the <b>skin switcher</b> at the top to watch "
            "every specimen reskin."),
        "story": {
            "inspired": (
                "The Gupta register is drawn from the <b>classical age (c. 320–550 CE)</b> — the era when the "
                "free-standing Hindu temple, refined floral ornament, and the Brahmi→Nāgarī script line "
                "crystallised. Its touchstones are the <b>Mathura red-sandstone</b> Buddha and Vishnu figures and "
                "the <b>Ajanta murals</b> — serene faces, diaphanous drapery, the ornate radiating halo "
                "(prabhāvali). We took its warmth and ornament where Mauryan took austerity."),
            "origins": (
                "The Guptas presided over a period later called a 'golden age' for its sculpture, painting, "
                "mathematics and literature (Kālidāsa; the concept of zero). Much of what we know of its colour "
                "survives on the walls of <b>Ajanta</b>, whose pigments have been analysed directly — the deepest "
                "blue is lapis lazuli traded from <b>Badakhshan in Afghanistan</b>, confirmed by Raman "
                "spectroscopy. Where the record is a reconstruction we mark it as such."),
            "decisions": [
                "<b>Plaster as paper.</b> The ground is Ajanta lime-plaster (<code>--background</code>) — the fresco surface itself.",
                "<b>Halo-gold as action.</b> The single action colour is the prabhāvali gold, not the house gold — the register's warmth leads.",
                "<b>Fresco jewel-tones for status.</b> Success is Ajanta terre-verte, danger the fresco iron-oxide red, info the rare lapis blue.",
                "<b>Softer corner.</b> Radius warms from Mauryan's 2px to 6px — Gupta ornament is foliate and rounded, not incised.",
                "<b>A warm top-edge.</b> Cards carry a foliate gold-to-rose hairline instead of Mauryan's cool polish.",
            ],
        },
    },
    "chola": {
        "theme_css": "theme-chola.css",
        "html_class": "theme-chola theme-light",
        "title": "Chola design system · Atomic reference | Bharat",
        "kicker": "Indic design systems · atomic reference",
        "h1": 'Chola — <em>bronze, granite &amp; the sacred red</em>',
        "lead": (
            "The <b>Chola</b> register — Tamil, monumental, devotional (9th–13th "
            "century). Cast <b>bronze aged to patina</b>, the golden granite of "
            "Thanjavur, and <b>kumkum vermilion</b> as the sacred action colour. "
            "A southern system on the same Atomic Design spine."),
        "heritage": (
            "The Chola bronzes (Nataraja — lost-wax cast, green-brown patina), "
            "the Brihadisvara temple at Thanjavur (golden granite, towering "
            "vimana), Tamil monumental inscription, sacred-ash white and kumkum "
            "vermilion. Sources: Wikipedia — Chola art &amp; architecture; "
            "Brihadisvara Temple; Chola bronzes."),
        "by_line": (
            "System &amp; authorship · <b>Sinhaankur</b> — the Tamil Chola "
            "register, drawn from the bronzes &amp; the Great Living Chola "
            "Temples. ™ / © Sinhaankur."),
        "swatches": [
            ["Paper · sacred ash", "--background"], ["Card", "--card"], ["Surface", "--surface"],
            ["Ink · bronze-brown", "--foreground"], ["Muted · granite", "--muted"], ["Muted text", "--muted-foreground"],
            ["Border", "--border"], ["Border strong", "--border-strong"],
            ["Accent · kumkum", "--accent"], ["Accent ink", "--accent-ink"], ["Accent tint", "--accent-tint"],
            ["Bronze", "--bronze"], ["Patina", "--patina"], ["Gopuram gold", "--gopuram-gold"],
            ["Success · patina", "--success"], ["Warning · gold", "--warning"], ["Danger · kumkum", "--danger"], ["Info · Kaveri teal", "--info"],
        ],
        "tier0_why": (
            "Chola values come from real heritage: bronze and its verdigris "
            "patina, Thanjavur's golden granite, and the temple's kumkum red. "
            "The ground is sacred-ash (vibhuti) white; the action colour is "
            "<b>kumkum vermilion</b>; corners stay a monumental 3px — granite "
            "blocks, not soft plastic."),
        "colour_desc": (
            "Granite &amp; bronze. <span class=\"heritage\">Ash-white paper, "
            "bronze-brown ink, kumkum vermilion for action, patina green for "
            "success.</span>"),
        "register_desc": (
            "<span class=\"heritage\">The light <b>granite</b> register is the "
            "daylit temple exterior; the dark <b>sanctum</b> register is the "
            "lamp-lit inner shrine (black granite, bronze glow).</span> Same "
            "atoms, different tokens — try the <b>skin switcher</b> above."),
        "story": {
            "inspired": (
                "The Chola register is drawn from the <b>Tamil imperial age (9th–13th c. CE)</b> — the era of the "
                "great bronze <b>Nataraja</b> and the towering <b>Brihadisvara temple</b> at Thanjavur. Its "
                "touchstones are cast metal and monumental granite: the lost-wax <b>bronzes</b> aged to green "
                "patina, the golden <b>vimana</b>, Tamil inscription, and the <b>kumkum</b> red of active worship."),
            "origins": (
                "The Cholas built a maritime empire reaching Southeast Asia, and a bronze-casting tradition held "
                "among the finest metal sculpture ever made. The Great Living Chola Temples are a UNESCO World "
                "Heritage site — 'living' because worship never stopped, so the palette is not archaeology but "
                "current practice: ash-white, granite, bronze, and vermilion, observed as much as excavated."),
            "decisions": [
                "<b>Sacred ash as paper.</b> The ground is vibhuti white (<code>--background</code>) — the temple's own surface.",
                "<b>Kumkum as action.</b> The one action colour is temple vermilion, because in the culture it already means 'here, now, sacred'.",
                "<b>Bronze as ink; patina as success.</b> Text is bronze-brown; the success hue is the verdigris of aged metal.",
                "<b>Monumental corner.</b> Radius stays a squared 3px — granite blocks, not soft plastic.",
                "<b>Kaveri teal as the quiet second voice.</b> A river-water blue-green carries secondary data.",
            ],
        },
    },
    "rajput": {
        "theme_css": "theme-rajput.css",
        "html_class": "theme-rajput theme-light",
        "title": "Rajput design system · Atomic reference | Bharat",
        "kicker": "Indic design systems · atomic reference",
        "h1": 'Rajput — <em>sandstone, mirror-work &amp; miniature colour</em>',
        "lead": (
            "The <b>Rajput</b> register — the medieval desert courts of "
            "Rajasthan. <b>Golden fort sandstone</b>, the mirror-inlay of the "
            "sheesh mahal, and the vivid <b>indigo / vermilion / gold-leaf</b> "
            "palette of Rajput miniature painting. A courtly system on the same "
            "atomic spine."),
        "heritage": (
            "Jaisalmer's golden-sandstone fort &amp; havelis, Sheesh Mahal "
            "mirror-work on indigo grounds, and Rajput / Mewar miniature "
            "painting — indigo, vermilion, malachite green, gold leaf on cream "
            "wasli paper. Sources: Wikipedia — Rajput painting; Rajput "
            "architecture; Jaisalmer Fort."),
        "by_line": (
            "System &amp; authorship · <b>Sinhaankur</b> — the Rajput court "
            "register, drawn from desert forts &amp; miniature painting. "
            "™ / © Sinhaankur."),
        "swatches": [
            ["Paper · wasli", "--background"], ["Card", "--card"], ["Surface", "--surface"],
            ["Ink · court sepia", "--foreground"], ["Muted", "--muted"], ["Muted text", "--muted-foreground"],
            ["Border", "--border"], ["Border strong", "--border-strong"],
            ["Accent · vermilion", "--accent"], ["Accent ink", "--accent-ink"], ["Accent tint", "--accent-tint"],
            ["Haveli sandstone", "--haveli"], ["Miniature indigo", "--indigo-mss"], ["Gold leaf", "--gold-leaf-r"],
            ["Success · malachite", "--success"], ["Warning · gold", "--warning"], ["Danger · vermilion", "--danger"], ["Info · indigo", "--info"],
        ],
        "tier0_why": (
            "Rajput values are drawn from miniature painting and fort "
            "architecture: cream wasli paper, Jaisalmer sandstone, court indigo, "
            "and vermilion. The action colour is <b>miniature vermilion</b>; "
            "corners take a 5px jharokha-arch softness — ornamented but crisp."),
        "colour_desc": (
            "Wasli &amp; miniature pigment. <span class=\"heritage\">Cream paper, "
            "sepia ink, vermilion action, indigo as the secondary hue, gold-leaf "
            "highlights.</span>"),
        "register_desc": (
            "<span class=\"heritage\">The light <b>wasli</b> register is the "
            "miniature page in daylight; the dark <b>sheesh-mahal</b> register is "
            "the mirror hall at night — deep indigo with gold &amp; mirror "
            "glints.</span> Same atoms, different tokens — try the <b>skin "
            "switcher</b> above."),
        "story": {
            "inspired": (
                "The Rajput register is drawn from the <b>desert courts of Rajasthan (c. 8th–18th c.)</b> — the "
                "golden-sandstone forts of Jaisalmer and Jodhpur, the mirror-inlaid <b>sheesh mahal</b>, and above "
                "all <b>Rajput and Mewar miniature painting</b>: vivid indigo, vermilion, malachite green and gold "
                "leaf on cream wasli paper, framed by the arched <b>jharokha</b> window."),
            "origins": (
                "Rajput kingdoms held the arid northwest through fort-cities and a courtly painting tradition that "
                "recorded epics, ragas and royal life in jewel-like pages. The blue of those pages is <b>indigo — "
                "nīla</b>, India's 'blue gold', cultivated here from antiquity and later the cause of the Champaran "
                "revolt; the gold is often the very <b>Indian Yellow</b> made downriver in Munger. The palette is "
                "read from surviving folios and haveli walls."),
            "decisions": [
                "<b>Wasli as paper.</b> The ground is cream miniature paper (<code>--background</code>) — the page you paint on.",
                "<b>Vermilion as action; indigo as the second voice.</b> The two dominant miniature pigments become the two loudest UI roles.",
                "<b>Gold-leaf hairline.</b> Cards carry a gold-leaf-to-indigo edge — the illuminated border of a folio.",
                "<b>Arched, crisp corner.</b> Radius is a 5px jharokha softness — ornamented but sharp, never plush.",
                "<b>Sheesh-mahal at night.</b> The dark register is deep indigo with gold and mirror glints — the mirror hall by lamplight.",
            ],
        },
    },
}

# ---- the sprite specimen is Mauryan-only; strip it from generated pages -------
SPRITE_BLOCK_RE = re.compile(
    r'\n      <div class="ds-spec">\n'
    r'        <div class="ds-spec-head"><h4>Iconography.*?</div>\n'
    r'      </div>(?=\n    </section>)', re.S)

# the inline <script> that paints the sprite gallery — remove for non-Mauryan
SPRITE_SCRIPT_RE = re.compile(
    r'\n  <script>\n  // paint the Mauryan sprite gallery.*?</script>', re.S)


def swatches_attr(pairs):
    inner = ",\n          ".join(
        '["{}","{}"]'.format(n.replace('"', '\\"'), v) for n, v in pairs)
    return "data-colors='[\n          " + inner + "\n        ]'"


def story_html(st):
    """Build the two-column story block from a system's `story` config."""
    decisions = "".join(
        "\n            <li>{}</li>".format(d) for d in st["decisions"])
    return (
        '<div class="ds-story">\n'
        '        <div class="ds-story-col">\n'
        '          <h3>What it\'s inspired from</h3>\n'
        '          <p>{inspired}</p>\n'
        '          <h3>What we know of its origins</h3>\n'
        '          <p>{origins}</p>\n'
        '        </div>\n'
        '        <div class="ds-story-col">\n'
        '          <h3>The design decisions that followed</h3>\n'
        '          <p>From that heritage we made concrete choices, each traceable to a source:</p>\n'
        '          <ul class="ds-story-list">{decisions}</ul>\n'
        '          <p class="ds-story-colour">Every colour below carries its own origin story — '
        '<b>click any swatch marked “story”</b> to see where the pigment came from and the reference '
        'behind it. A colour here is a place with a history, not a decoration.</p>\n'
        '        </div>\n'
        '      </div>'
    ).format(inspired=st["inspired"], origins=st["origins"], decisions=decisions)


def build(name, cfg):
    html = TEMPLATE

    # 1) <html> class + theme css link
    html = html.replace(
        'class="theme-mauryan theme-light">',
        'class="{}">'.format(cfg["html_class"]), 1)
    html = html.replace(
        '<link rel="stylesheet" href="theme-mauryan.css" />',
        '<link rel="stylesheet" href="{}" />'.format(cfg["theme_css"]), 1)

    # 2) <title> + meta description (keep it simple: just the title)
    html = re.sub(r"<title>.*?</title>",
                  "<title>{}</title>".format(cfg["title"]), html, count=1, flags=re.S)

    # 3) masthead: kicker, h1, lead, heritage note (tier0), by-line
    html = html.replace(
        '<h1>Mauryan — <em>stone, sky &amp; the incised line</em></h1>',
        "<h1>{}</h1>".format(cfg["h1"]), 1)

    # replace the <p class="sub">…</p> lead (first occurrence)
    html = re.sub(r'<p class="sub">.*?</p>',
                  '<p class="sub">{}</p>'.format(cfg["lead"]), html, count=1, flags=re.S)

    # by-line
    _by = '<p class="by">{} See <a href="indic-design-systems.html">all systems →</a></p>'.format(cfg["by_line"])
    html = re.sub(r'<p class="by">.*?</p>', lambda m: _by, html, count=1, flags=re.S)

    # 4) tier-0 WHY paragraph (the sourcing note) + colour desc.
    # Whitespace-tolerant: the template wraps these across indented lines.
    html = re.sub(
        r"The Mauryan\s+values are photo-sampled from Chunar sandstone.*?"
        r"sources in <code>ASHOKA_DESIGN\.md</code>\.",
        lambda m: cfg["tier0_why"], html, count=1, flags=re.S)

    html = re.sub(
        r"Role colours carry meaning, never decoration\. <span class=\"heritage\">Stone &amp; ink for\s+"
        r"structure;.*?once here\.</span>",
        lambda m: cfg["colour_desc"], html, count=1, flags=re.S)

    # 5) swatches
    html = re.sub(r"data-colors='\[.*?\]'",
                  lambda m: swatches_attr(cfg["swatches"]),
                  html, count=1, flags=re.S)

    # 6) register description in the Templates tier
    html = re.sub(
        r"<span class=\"heritage\">Mauryan \(stone \+ sky\) is the skeleton.*?"
        r"live proof <i>is</i> the reusability of the system\.",
        lambda m: cfg["register_desc"], html, count=1, flags=re.S)

    # 6b) the STORY section (inspired-from / origins / decisions) — per system
    if cfg.get("story"):
        html = re.sub(r'<div class="ds-story">.*?</div>\s*</section>',
                      lambda m: story_html(cfg["story"]) + "\n    </section>",
                      html, count=1, flags=re.S)

    # 7) sprite specimen + its script are Mauryan-only
    html = SPRITE_BLOCK_RE.sub("", html)
    html = SPRITE_SCRIPT_RE.sub("", html)

    # 8) heritage-sources note in the Atoms iconography meta is gone with the block

    out = ROOT / "ds-{}.html".format(name)
    out.write_text(html, encoding="utf-8")
    return out


def main():
    for name, cfg in SYSTEMS.items():
        p = build(name, cfg)
        print("wrote", p.name)


if __name__ == "__main__":
    main()
