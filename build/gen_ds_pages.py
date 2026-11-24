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
        "kicker": "Indic design systems · gallery no. II",
        "plate": [
            ("Era", "c. 320–550 CE · Gupta classical"),
            ("Medium", "Mathura red sandstone · Ajanta fresco"),
            ("Provenance", "Ajanta murals &amp; Gupta sculpture"),
            ("Curated by", "Sinhaankur ™ / ©"),
        ],
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
        "legacy": {
            "lede": ("Long before the phrase existed, the Guptas ran a <b>design system</b> — a canon written down "
                     "and taught, so an image made in one workshop matched one made in another. A legacy is not an "
                     "accident; it is a <i>standard, maintained</i>. Here is how the classical age held the line."),
            "cards": [
                {"title": "A measured canon",
                 "body": "Gupta sculpture followed <b>iconometry</b> — the <i>śilpaśāstra</i> rules of proportion "
                         "(<b>tālamāna</b>): the body measured in face-lengths, on a scale from one to ten <i>tala</i>, "
                         "each divided into <i>angulas</i>. A written spec for making a figure.",
                 "mapto": "our <b>spacing scale &amp; type ramp</b>: fixed proportional steps, not ad-hoc pixels."},
                {"title": "Serenity as a rule",
                 "body": "The downcast eyes, the <b>halo</b>, the diaphanous drapery, the tribhanga stance — a "
                         "repeatable set of forms that made a Gupta image recognisable anywhere as <i>Gupta</i>.",
                 "mapto": "our <b>component contracts</b>: the same parts, composed the same way, every page."},
                {"title": "Written down &amp; taught",
                 "body": "Because the canon lived in <b>texts</b> and workshops, the style outlasted the dynasty and "
                         "set the template for classical Indian art for centuries.",
                 "mapto": "our <b>documented tokens &amp; this page</b>: a system survives because it is written down."},
            ],
            "note": ("Sourced: the <i>śilpaśāstra</i> / <i>tālamāna</i> iconometric tradition (T. A. Gopinatha Rao, "
                     "<i>Talamana, or Iconometry</i>, ASI Memoir no. 3, 1920). Honestly: study of surviving sculpture "
                     "suggests the canon was often a guiding ideal rather than a strict rule — "),
            "cite": '<a href="https://en.wikipedia.org/wiki/Talamana" target="_blank" rel="noopener">Talamana ↗</a> · <a href="heritage-atlas.html">Ajanta &amp; Gupta sites</a>',
        },
        # each specimen tells the GUPTA story — plaster, fresco, the ornate halo, iconometry
        "specimen_stories": {
            "Type scale": (
                "Gupta sculpture followed <b>tālamāna</b> — the body measured in face-lengths, on a fixed "
                "scale from one to ten. This type ramp is that iconometry: proportion by the rule, never by eye."),
            "Spacing · radius · elevation": (
                "The corner softens to a foliate 6px — Gupta ornament is <em>modelled in plaster</em>, not incised "
                "in stone, so its edges are rounded and rolled, never chiselled sharp."),
            "Buttons": (
                "The action colour is the <b>halo-gold</b> of the prabhāvali — the radiant disc behind every Gupta "
                "figure. A button, like the halo, is where the eye is meant to land."),
            "Text input · textarea · select": (
                "An empty field is a wall freshly limed for fresco — the ground before the first ochre line. The focus "
                "ring is the master's brush touching down; the invalid state, the iron-oxide red of a reworked passage."),
            "Checkbox · radio · switch": (
                "A mark set on the plaster — the confident single stroke of the Ajanta painter, who could not erase. "
                "Checked is committed; the switch is a shrine-lamp lit or left dark."),
            "Tags · badges · dots": (
                "The Gupta gold <b>dinara</b> carried the king and his Garuda in a fine struck rim. These tags are that "
                "coin's legend: a small, exact mark that says whose authority this is."),
            "Chip · icon-button · kbd · spinner · rule": (
                "The spinner turns like the prabhāvali's rays around a seated figure; the rule is the fresco's "
                "register-line, ruled in red to divide one painted scene from the next."),
            "Field (label + control + help/error)": (
                "Label, field and gloss bound as one — like a mural panel: the scene, the border that holds it, and the "
                "cartouche naming the story below. The group is the meaning."),
            "Segmented control · tabs · pagination": (
                "The Ajanta wall runs as bays, each a complete jātaka, read one at a time as you move along the veranda. "
                "The segmented control is that colonnade — many scenes, one lit to the front."),
            "Alert · stat · breadcrumb": (
                "The breadcrumb is the pradakṣiṇā path — the circumambulation around the sanctum, stage by stage, "
                "that always returns you to where you entered."),
            "Card &amp; card grid": (
                "A card is a fresco bay under its painted arch — a framed scene that invites you in to read it, not a "
                "wall of text. Tag, heading and hint are its cartouche."),
            "Data table": (
                "The Gupta mints and guilds kept meticulous accounts in ruled registers; the astronomers of the age tabled "
                "the heavens. This table is that discipline — every figure aligned in its column, ready to be read."),
            "Toolbar": (
                "The lintel of the Gupta shrine carried the auspicious marks above the doorway — everything invoked before "
                "you crossed in. The toolbar sits over the view the same way: the instruments, ranged along the top."),
            "Dialog": (
                "The dialog is the <b>garbhagriha</b> — the small dark image-chamber the whole temple exists to hold. The "
                "world dims to plaster shadow; one lit figure remains, and asks for a single act of attention."),
            "Template starters": (
                "A finished shrine — sanctum, porch, halo and fresco brought together to one canon. The templates are the "
                "consecrated temple: proof the parts, composed, hold as a whole."),
        },
    },
    "chola": {
        "theme_css": "theme-chola.css",
        "html_class": "theme-chola theme-light",
        "title": "Chola design system · Atomic reference | Bharat",
        "kicker": "Indic design systems · gallery no. III",
        "plate": [
            ("Era", "9th–13th century CE · Chola imperial"),
            ("Medium", "Cast bronze · Thanjavur granite · kumkum"),
            ("Provenance", "Chola bronzes &amp; the Great Living Temples"),
            ("Curated by", "Sinhaankur ™ / ©"),
        ],
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
        "legacy": {
            "lede": ("The Cholas ran an empire on <b>records</b> — and their canon is literally carved into the walls. "
                     "A legacy is not an accident; it is a <i>standard, maintained</i>, and audited. Here is how the "
                     "Tamil imperium held the line."),
            "cards": [
                {"title": "The temple as a module",
                 "body": "The great temples were built to <b>proportion</b> — the <i>vimana</i> rising in measured, "
                         "self-similar tiers. Brihadisvara at Thanjavur is a single coherent module scaled to "
                         "monumental size — order you can measure.",
                 "mapto": "our <b>layout scale &amp; elevation ladder</b>: one modular system, scaled up cleanly."},
                {"title": "Inscribed &amp; audited",
                 "body": "Chola temple walls carry thousands of <b>inscriptions</b> — endowments, land grants, wages, "
                         "audits — a public ledger in stone that held officials to a recorded standard.",
                 "mapto": "our <b>sourced-or-gap ledger</b>: every figure traceable, nothing unattributed."},
                {"title": "A canon in bronze",
                 "body": "The <b>lost-wax bronzes</b> repeated an iconographic canon so consistently that a Chola "
                         "Nataraja is unmistakable — a house style enforced across generations of workshops.",
                 "mapto": "our <b>atoms &amp; finish tokens</b>: one recognisable house form, cast the same each time."},
            ],
            "note": ("Sourced: the Great Living Chola Temples (UNESCO) and the vast corpus of Chola temple "
                     "inscriptions studied since the ASI's early epigraphy; Chola bronze iconography. Read from "
                     "surviving stone and metal — "),
            "cite": '<a href="https://en.wikipedia.org/wiki/Chola_art_and_architecture" target="_blank" rel="noopener">Chola art ↗</a> · <a href="heritage-atlas.html">the temples</a>',
        },
        # each specimen tells the CHOLA story — bronze, granite, kumkum, the great temple
        "specimen_stories": {
            "Type scale": (
                "The Brihadisvara vimana rises in <b>thirteen measured tiers</b> to 216 feet, each storey a fixed step of "
                "the last. This type ramp climbs the same way — proportion by the tier, never an ad-hoc pixel."),
            "Spacing · radius · elevation": (
                "The corner stays a monumental <b>3px</b> — Chola form is dry-stacked <em>granite</em>, block on block "
                "without mortar. Soft radii would betray the stone; the edge holds because the stone does."),
            "Buttons": (
                "The action colour is <b>kumkum</b> vermilion — the sacred red of active worship, dabbed on the deity and "
                "the devotee. In the culture it already means <em>here, now, do this</em>; so it means it here too."),
            "Text input · textarea · select": (
                "An empty field is a wax blank before the lost-wax pour — the form waiting for the metal. The focus ring is "
                "the first heat; the invalid state, the kumkum stroke that marks a flaw in the cast."),
            "Checkbox · radio · switch": (
                "A mark made and kept — struck into the temple wall like the mason's guild-sign. The switch is the sanctum "
                "lamp lit or dark; the checkbox, the chisel-tick that certifies a course complete."),
            "Tags · badges · dots": (
                "The Chola bronze bears its <b>iconographic marks</b> — the flame-ring, the drum, the raised foot — so a "
                "Nataraja is unmistakable anywhere. These tags are that iconography: a small mark that certifies what a thing is."),
            "Chip · icon-button · kbd · spinner · rule": (
                "The spinner is the flame-wheel around the dancing Shiva, forever turning; the rule is the temple's "
                "plinth-line, the cut course that runs level around the whole granite mass."),
            "Field (label + control + help/error)": (
                "Label, control and helper bound as one — like a Chola endowment carved in stone: the grant, the land it "
                "governs, and the terms beneath. No clause stands alone; the record is the whole."),
            "Segmented control · tabs · pagination": (
                "The gopuram's tiers each carry their own ranked figures, yet rise as one tower. The segmented control is "
                "that vimana — distinct storeys, a single mount, one brought to the front at a time."),
            "Alert · stat · breadcrumb": (
                "The breadcrumb is the maritime line the Chola navy sailed — Nagapattinam to Srivijaya, port by port — "
                "each stage a place you can name on the way back to the harbour you left."),
            "Card &amp; card grid": (
                "A card is a niche in the temple wall — the framed <em>devakoshta</em> that holds one deity and draws the "
                "eye to it. A doorway to one figure, not a wall of them."),
            "Data table": (
                "Chola temple walls ARE the ledger — thousands of inscriptions record endowments, wages and audits in ruled "
                "lines of stone, a public account book. This table is that wall: every figure in its cell, aligned to be read."),
            "Toolbar": (
                "The gopuram gateway carried the guardians and the standards above the threshold — everything ranged over "
                "the entrance. The toolbar sits over the view the same way: the instruments, along the top."),
            "Dialog": (
                "The dialog is the <b>garbhagriha</b> beneath the great vimana — the small dark sanctum the whole mountain "
                "of granite exists to shelter. All else falls to shadow; one bronze remains, lit, and asks for one act."),
            "Template starters": (
                "A finished temple — plinth, vimana, gopuram and bronze raised to one plan and consecrated. The templates are "
                "the Great Living Temple: proof the parts, composed, stand for a thousand years."),
        },
    },
    "rajput": {
        "theme_css": "theme-rajput.css",
        "html_class": "theme-rajput theme-light",
        "title": "Rajput design system · Atomic reference | Bharat",
        "kicker": "Indic design systems · gallery no. IV",
        "plate": [
            ("Era", "8th–18th century · Rajput courts"),
            ("Medium", "Jaisalmer sandstone · miniature pigment · mirror"),
            ("Provenance", "Mewar miniatures &amp; desert forts"),
            ("Curated by", "Sinhaankur ™ / ©"),
        ],
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
        "legacy": {
            "lede": ("The Rajput courts kept their standard through the <b>atelier</b> — the royal <i>karkhana</i> where "
                     "master painters trained pupils to a house hand. A legacy is not an accident; it is a "
                     "<i>standard, maintained</i>, workshop to workshop. Here is how the courts held the line."),
            "cards": [
                {"title": "The gharana / atelier",
                 "body": "A court's paintings share a recognisable hand because they came from one <b>atelier</b> — a "
                         "lineage (<i>gharānā</i>) of masters and pupils. Mewar, Kishangarh, Bundi each held a "
                         "distinct, teachable style.",
                 "mapto": "our <b>one shared stylesheet</b>: a single source every page is trained on."},
                {"title": "A fixed making-order",
                 "body": "Miniatures followed a set <b>process</b> — wasli paper, under-drawing, burnished ground, "
                         "mineral pigment in order, gold last — so results were consistent across many hands.",
                 "mapto": "our <b>atomic tiers</b>: tokens → atoms → molecules, a fixed order of composition."},
                {"title": "A canon of forms",
                 "body": "Ragamala and epic sets repeated an agreed <b>iconographic vocabulary</b> — postures, colour "
                         "codes, framing (the <i>jharokha</i>) — a visual grammar every painter knew.",
                 "mapto": "our <b>component library</b>: an agreed vocabulary of reusable parts."},
            ],
            "note": ("Sourced: the Rajput / Rajasthani painting tradition and its court ateliers (Mewar, Kishangarh, "
                     "Bundi–Kota); miniature technique on wasli. Read from surviving folios and workshop practice — "),
            "cite": '<a href="https://en.wikipedia.org/wiki/Rajput_painting" target="_blank" rel="noopener">Rajput painting ↗</a> · <a href="heritage-atlas.html">forts &amp; courts</a>',
        },
        # each specimen tells the RAJPUT story — wasli, miniature pigment, jharokha, fort
        "specimen_stories": {
            "Type scale": (
                "The miniature was built in a <b>fixed making-order</b> — wasli, under-drawing, burnished ground, mineral "
                "pigment, gold last. This type ramp is that discipline: measured steps in sequence, never ad-hoc."),
            "Spacing · radius · elevation": (
                "The corner takes a <b>5px jharokha</b> arch — the cusped curve of the fort's oriel window. Ornamented but "
                "crisp: a Rajput line is <em>painted with a squirrel-hair brush</em>, sharp, never plush."),
            "Buttons": (
                "The action colour is miniature <b>vermilion</b> — cinnabar, the loudest pigment on the wasli page, saved "
                "for the turban, the flag, the one thing the eye must go to first. A button is that vermilion."),
            "Text input · textarea · select": (
                "An empty field is a sheet of burnished wasli awaiting the brush; the focus ring is the under-drawing's "
                "first charcoal line. The invalid state borrows the vermilion of a correction laid over the fault."),
            "Checkbox · radio · switch": (
                "A choice set down in mineral pigment — the miniaturist's committed stroke, made once on paper that will not "
                "forgive. The switch is a haveli lamp lit or dark; the checkbox, the gold dot that says <em>done</em>."),
            "Tags · badges · dots": (
                "Every court's folios carry its <b>atelier hand</b> — Mewar, Kishangarh, Bundi, each recognisable at a "
                "glance. These tags are that signature: a small mark naming which workshop, and what, a thing is."),
            "Chip · icon-button · kbd · spinner · rule": (
                "The spinner turns like the chakra in a Ragamala sky; the rule is the folio's <b>hashiya</b> — the ruled "
                "gold-and-indigo border that frames every miniature page."),
            "Field (label + control + help/error)": (
                "Label, field and gloss bound as one — like a miniature: the painted scene, the illuminated border that "
                "holds it, and the Devanagari couplet inscribed above. The page is the whole."),
            "Segmented control · tabs · pagination": (
                "A Ragamala set is thirty-six moods, each its own folio, turned one at a time. The segmented control is that "
                "album — distinct pages, one binding, one lifted to view at a time."),
            "Alert · stat · breadcrumb": (
                "The breadcrumb is the climb to the fort — Amber's ramp through gate after gate (Suraj Pol, Ganesh Pol) to "
                "the palace at the top, each threshold a stage on the way you can retrace."),
            "Card &amp; card grid": (
                "A card is a <b>jharokha</b> — the cusped balcony window that frames the durbar below and invites the eye "
                "through. A carved opening onto one scene, not a wall of them."),
            "Data table": (
                "The Rajput court ran on the <b>bahi-khata</b> — the red cloth-bound ledger of the munshi, revenue and "
                "grant entered in ruled columns. This table is that account book: every figure in its cell, aligned to be read."),
            "Toolbar": (
                "The fort's gateway carried its arms and standards over the arch — everything ranged above the threshold "
                "before you rode in. The toolbar sits over the view the same way: the instruments, along the top."),
            "Dialog": (
                "The dialog is the <b>sheesh mahal</b> — the mirror-hall lit by a single lamp, where a thousand reflections "
                "fall dark but one flame holds. The world dims; one lit chamber remains, and asks for a single choice."),
            "Template starters": (
                "A finished folio — wasli, painting, border and gold brought together to the atelier's canon; a fort raised "
                "to one plan. The templates are that completed page: proof the parts, composed, hold as a whole."),
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


def legacy_html(lg):
    """Build the Standards & Legacy chapter: a lede, three 'how they held the
    line -> our canon' cards, and a sourced note."""
    cards = "".join(
        '\n          <article class="ds-legacy-card">\n'
        '            <h3>{title}</h3>\n'
        '            <p>{body}</p>\n'
        '            <p class="ds-legacy-map"><span class="ds-arrow">→</span> {mapto}</p>\n'
        '          </article>'.format(title=c["title"], body=c["body"], mapto=c["mapto"])
        for c in lg["cards"])
    return (
        '<div class="ds-legacy">\n'
        '        <p class="ds-legacy-lede">{lede}</p>\n'
        '        <div class="ds-legacy-grid">{cards}</div>\n'
        '        <p class="ds-legacy-note">{note}<span class="ds-legacy-cite">{cite}</span></p>\n'
        '      </div>'
    ).format(lede=lg["lede"], cards=cards, note=lg["note"], cite=lg["cite"])


def swap_specimen_stories(html, stories):
    """Replace the <span class="heritage">…</span> line inside each specimen block with
    the system's OWN heritage story for that specimen — so every system speaks its own
    tale through the whole page, not Mauryan's. `stories` is keyed by the specimen's
    <h4> title (use &amp; as it appears in the markup). Specimens not in the dict keep
    the template line (safe fallback)."""
    if not stories:
        return html
    # walk each ds-spec block; within it, find the h4 title and swap its heritage span
    spec_re = re.compile(r'(<div class="ds-spec">.*?</div>\s*</div>)', re.S)

    def repl(m):
        block = m.group(1)
        tm = re.search(r'<h4>(.*?)</h4>', block, re.S)
        if not tm:
            return block
        title = tm.group(1).strip()
        story = stories.get(title)
        if not story:
            return block
        # replace the FIRST heritage span in this block (the desc line)
        new_block, n = re.subn(
            r'<span class="heritage">.*?</span>',
            lambda _m: '<span class="heritage">{}</span>'.format(story),
            block, count=1, flags=re.S)
        return new_block if n else block

    return spec_re.sub(repl, html)


# tiers that get a faint room-number watermark
ROOMS = {"tokens": "0", "atoms": "1", "molecules": "2", "organisms": "3", "templates": "4"}


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

    # 3) masthead: kicker, h1, lead, curatorial plate, by-line
    html = html.replace(
        '<h1>Mauryan — <em>stone, sky &amp; the incised line</em></h1>',
        "<h1>{}</h1>".format(cfg["h1"]), 1)

    # kicker ("gallery no. …")
    html = re.sub(r'<div class="ds-kicker">.*?</div>',
                  lambda m: '<div class="ds-kicker">{}</div>'.format(cfg["kicker"]),
                  html, count=1, flags=re.S)

    # replace the <p class="sub">…</p> lead (first occurrence)
    html = re.sub(r'<p class="sub">.*?</p>',
                  lambda m: '<p class="sub">{}</p>'.format(cfg["lead"]), html, count=1, flags=re.S)

    # curatorial plate (era · medium · provenance · curated-by)
    if cfg.get("plate"):
        rows = "\n".join(
            '        <div><dt>{}</dt><dd>{}</dd></div>'.format(dt, dd) for dt, dd in cfg["plate"])
        plate = '<dl class="ds-plate">\n' + rows + '\n      </dl>'
        html = re.sub(r'<dl class="ds-plate">.*?</dl>', lambda m: plate, html, count=1, flags=re.S)

    # by-line (template: "One of the Indic… See the whole gallery →")
    _by = '<p class="by">{} See <a href="indic-design-systems.html">the whole gallery →</a></p>'.format(cfg["by_line"])
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

    # 6c) the STANDARDS & LEGACY chapter — per system (how the empire held its canon)
    if cfg.get("legacy"):
        html = re.sub(r'<div class="ds-legacy">.*?</div>\s*</section>',
                      lambda m: legacy_html(cfg["legacy"]) + "\n    </section>",
                      html, count=1, flags=re.S)

    # 6d) per-specimen heritage STORY — each system tells its OWN tale through every
    # specimen (Gupta via fresco/halo, Chola via bronze/temple, Rajput via miniature/fort)
    html = swap_specimen_stories(html, cfg.get("specimen_stories"))

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
