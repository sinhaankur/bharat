#!/usr/bin/env python3
"""Build district-globe.json — the 594-district layer for the 3D globe (india-3d.html).

Joins, once and offline:
  - district-centroids.json  (594 [lat,lng] centroids, Census-2011 boundaries)
  - district-pop.json        (Census-2011 population / literacy / households)
  - district-ledger.json     (which districts have a DEEP sourced ledger — 13 today)

Emits, per district: [lat, lon, population, literacyPct, deep] plus a state index, so
the browser only draws — no fuzzy-matching at load time. Every figure is real Census
data or an honest gap (population = null when we can't confidently join). Keeps the
project rule: sourced-or-a-gap, never faked. See [[no-faked-deep-ledgers]].
"""
import json

def norm(s):
    return (s.strip().lower().replace('&', 'and').replace('.', '')
            .replace('-', ' ').replace('  ', ' '))

# centroid-name -> pop-name for known Census spelling / rename variants.
ALIAS = {
    'cuddapah': 'ysr', 'nellore': 'sri potti sriramulu nellore', 'rangareddi': 'rangareddy',
    'vishakhapatnam': 'visakhapatnam', 'dhuburi': 'dhubri', 'marigaon': 'morigaon',
    'north cachar hills': 'dima hasao', 'sibsagar': 'sivasagar', 'bhabua': 'kaimur (bhabua)',
    'janjgir champa': 'janjgir - champa', 'raj nandgaon': 'rajnandgaon', 'kawardha': 'kabeerdham',
    'dahod': 'dohad', 'sonepat': 'sonipat', 'yamuna nagar': 'yamunanagar',
    'anantnag (kashmir south)': 'anantnag', 'bagdam': 'badgam',
    'baramula (kashmir north)': 'baramula', 'kupwara (muzaffarabad)': 'kupwara',
    'ladakh (leh)': 'leh(ladakh)', 'hazaribag': 'hazaribagh', 'koderma': 'kodarma',
    'pashchim singhbhum': 'pashchimi singhbhum', 'purba singhbhum': 'purbi singhbhum',
    'bangalore urban': 'bangalore', 'chamrajnagar': 'chamarajanagar',
    'dakshin kannad': 'dakshina kannada', 'uttar kannand': 'uttara kannada',
    'pattanamtitta': 'pathanamthitta', 'east nimar': 'khandwa (east nimar)',
    'west nimar': 'khargone (west nimar)', 'narsinghpur': 'narsimhapur',
    'ahmednagar': 'ahmadnagar', 'garhchiroli': 'gadchiroli', 'greater bombay': 'mumbai',
    'east imphal': 'imphal east', 'west imphal': 'imphal west', 'ri-bhoi': 'ri bhoi',
    'baragarh': 'bargarh', 'bolangir': 'balangir', 'dantewada': 'dakshin bastar dantewada',
    'kanker': 'uttar bastar kanker',
}

def build():
    cent = json.load(open('district-centroids.json'))['centroids']
    pop = json.load(open('district-pop.json'))['states']
    ledger = json.load(open('district-ledger.json'))['states']

    # (state, district) -> pop record, plus a district-only bucket for rename fallbacks
    poplk, by_dist = {}, {}
    for s, dd in pop.items():
        items = dd.get('districts', dd).items() if (isinstance(dd, dict) and 'districts' in dd) else dd.items()
        for dk, v in items:
            if not isinstance(v, dict):
                continue
            poplk[(norm(s), norm(dk))] = v
            by_dist.setdefault(norm(dk), []).append(v)

    def find_pop(st, ds):
        nst, nds = norm(st), norm(ds)
        r = poplk.get((nst, nds))
        if r:
            return r
        if nds in ALIAS:
            r = poplk.get((nst, norm(ALIAS[nds]))) or None
            if r:
                return r
            cand = by_dist.get(norm(ALIAS[nds]), [])
            if len(cand) == 1:
                return cand[0]
        cand = by_dist.get(nds, [])
        if len(cand) == 1:
            return cand[0]
        return None

    # which districts have a DEEP sourced ledger (Kolkata-depth) — mark them, don't fake the rest
    deep = set()
    for sk, stv in ledger.items():
        for dk, dv in stv.get('districts', {}).items():
            if isinstance(dv, dict) and dv.get('ledger'):
                deep.add((norm(sk), norm(dk)))

    states = sorted({k.split('|', 1)[0] for k in cent})
    st_index = {s: i for i, s in enumerate(states)}
    rows, matched, deep_hit = [], 0, 0
    for key, ll in cent.items():
        st, ds = key.split('|', 1)
        lat, lon = ll[0], ll[1]
        rec = find_pop(st, ds)
        if rec:
            matched += 1
            population = int(rec.get('population') or 0) or None
            lit = rec.get('literate')
            litpct = round(100 * lit / rec['population'], 1) if (lit and rec.get('population')) else None
        else:
            population, litpct = None, None
        is_deep = (norm(st), norm(ds)) in deep
        if is_deep:
            deep_hit += 1
        # compact row: name, state-index, lat, lon, pop(or null), litPct(or null), deep(0/1)
        rows.append([ds, st_index[st], round(lat, 4), round(lon, 4),
                     population, litpct, 1 if is_deep else 0])

    out = {
        '_meta': {
            'title': 'District globe layer — 594 districts on the 3D Earth',
            'built_by': 'gen_district_globe.py',
            'sources': 'centroids: Datameet/Census-2011 · population+literacy: Census-2011 '
                       '(district-pop.json) · deep-ledger flag: district-ledger.json',
            'count': len(rows),
            'population_matched': matched,
            'deep_ledger': deep_hit,
            'note': 'population/literacy is real Census-2011 or null (a gap) — never faked. '
                    '"deep"=1 marks the districts with a full sourced money-ledger; the rest '
                    'are placed and named, not fabricated to Kolkata depth.',
            'row_schema': ['district', 'stateIdx', 'lat', 'lon', 'population', 'literacyPct', 'deep'],
        },
        'states': states,
        'districts': rows,
    }
    with open('district-globe.json', 'w') as f:
        json.dump(out, f, separators=(',', ':'))  # compact — don't re-bloat the build
    print(f'district-globe.json: {len(rows)} districts · population matched '
          f'{matched}/{len(rows)} ({100*matched//len(rows)}%) · {deep_hit} deep ledgers')

if __name__ == '__main__':
    build()
