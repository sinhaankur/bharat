import json,re,html,os,sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from import_canvas import load_canvas, available as canvas_available
except Exception:
    load_canvas=None; canvas_available=lambda:[]
try:
    from render_discover import discover_body, tribes_india_body, kingdoms_body
except Exception:
    discover_body=None; tribes_india_body=None; kingdoms_body=None
try:
    from render_map import map_body, copy_map_deps, map_head_links
except Exception:
    map_body=None
OUT=os.environ.get('BHARAT_OUT','out')+'/';HERE=os.path.dirname(os.path.abspath(__file__))+'/';R=os.environ.get('BHARAT_REPO','..')+'/';LIVE='https://sinhaankur.github.io/bharat/'
j=lambda f:json.load(open(R+f))
A=json.load(open(HERE+'inputs/atlas.json'))
e=lambda s:html.escape(str(s if s is not None else ''),quote=True)
def clean(s): return re.sub(r'[\U0001F000-\U0001FFFF☀-➿️]\s?','',str(s or '')).strip()
def num(x,d=0): return f'{x:,.{d}f}'
def yr(y): return '' if y is None else (f'{abs(y):,} BCE' if y<0 else f'{y} CE')
def src(name,url=None,tier=None):
    chip=f' <span class="chip t">T{tier}</span>' if tier else ''
    name=re.sub(r';?\s*(—\s*)?https?://\S+','',str(name or 'source on file')).strip(' —;')
    if url and 'wiki' not in url: return f'<a href="{e(url)}" rel="noopener">{e(name)}</a>{chip}'
    return e(name)+chip
GAP='<span class="chip">gap</span>'

# L1 navigation — four doors, matching the landing (Story · Discover · Peoples · Today).
# About / sources / data live in the FOOTER only (not a top-nav door). Each door's first entry
# is its own hub page (d[3]); the list is the L2 drill-down shown in the dropdown + on-page.
DOORS=[
 ('Story','How did we get here?','i-lion','story.html',[('ancient-india.html','5,000 years, one timeline','the whole spine, era by era'),('ashoka.html',"Ashoka's empire",'one empire, read in its own edicts'),('heritage-atlas.html','Temples and sacred ground','who built them, and what happened to them'),('temple-forms.html','How temples are shaped','measured drawings, to real dimensions'),('cave-walk.html','Walk inside a temple','a first-person reconstruction'),('heritage-3d.html','Temples in 3D','scanned and modelled'),('deep-history.html','Who we are, in DNA','the ancient-DNA population shifts'),('atrocities.html',"History's deadliest events",'the 100 worst, counted'),('history.html','History race','states over time'),('terrain-3d.html','The land in 3D','real relief, river, plain and mountain'),('flood-3d.html','Raise the water','flooding, over real terrain'),('quake-tsunami.html','Earthquakes and tsunamis','the hazard record')]),
 ('Discover','Where does public money go, and who answers for it?','i-bull','discover.html',[('discover.html','Bharat, state by state','the people, kingdoms and heritage of each state'),('map.html','The interactive map','every district, tap for the ten-year story'),('money-map.html','The money map','every district, coloured by money'),('state-of-india.html','Which states carry the country','every state by what it gives and gets'),('explore.html','Ask your own question','filter and rank all 594 districts'),('command-chain.html',"Who's in charge",'the chain of command, tier by tier'),('officials.html','Officials to track','the sourced accountability register'),('mesh.html','How it all connects','money, cases, officials and districts'),('engines.html','The 7 engines','the lenses that read the whole atlas'),('encroachment-atlas.html','Built where water returns','homes on flood land'),('global.html','India vs the world','GDP, income and industry, compared'),('atlas-3d.html','India by constraint','states by development constraint'),('globe-map.html','Globe to flat map','watch the globe unroll')]),
 ('Peoples','Who we are — how we speak, make and belong.','i-lotus','words.html',[('tribes.html','The tribes that made it','Warli, Gond, Mithila and more'),('tribes-india.html','Every listed tribe','all 727, state by state, searchable'),('kingdoms.html','Kingdoms and their flags','the standards that outlasted empires'),('social-fabric.html','The social fabric',"the people of Ashoka's India"),('languages.html','Languages and scripts of Bharat','families, names and where they come from'),('journey.html','The journey of a word','one word through 4,000 years'),('scripts.html','The script family tree','one ancestor, many alphabets'),('vedas.html','One text, many tongues','the Hymn of Creation, compared'),('library.html','Reading room','the primary texts'),('indic-design-systems.html','Indic design systems','the colours and where they come from'),('design-systems.html','India by design systems','a skin per state, one chassis'),('design-system.html','Atomic reference','tokens to templates')]),
 ('Today','What is happening, and who is telling it?','i-edict','today.html',[('news-journey.html','The News Journey','a story as a dated rail, fact beside framing'),('feed.html',"Today's news",'who the outlets are, and where coverage falls'),('feed.html#bias','The spin check','coverage by published lean'),('timeline.html','How it built up','the record, event by event'),('articles.html','Analysis','written pieces')]),
]
# Footer-only pages (the old "Receipts" door): methodology, sources, data, policy.
FOOTER_PAGES=[('how-it-works.html','How it works'),('about.html','Methodology and honesty'),('knowledge.html','The data and sources'),('provenance.html','Every figure to its source'),('references.html','Sources'),('data.html','Get the data'),('for-organisations.html','For organisations'),('share.html','Share'),('privacy-policy.html','Privacy and policy'),('sitemap.html','Site map')]
ORIG={'money-map.html':'index.html','design-systems.html':'app/design-systems/','canvas.html':'app/canvas/'}
briefs=j('page-briefs.json')['briefs']
def brief(f): return briefs.get(ORIG.get(f,f),{})
TITLES={'news-journey.html':'From promise to *delivery*','feed.html':'Before the headline, the *outlet*','timeline.html':'How it *built up*','articles.html':'Written *analysis*','money-map.html':'The money *map*','state-of-india.html':'Which states *carry* the country','explore.html':'Ask your own *question*','command-chain.html':"Who's in *charge*",'officials.html':'Officials to *track*','mesh.html':'How it all *connects*','engines.html':'Seven *engines*','global.html':'India and the *world*','geopolitical-chess.html':'The geopolitical *board*','usa.html':'Compare with the *US*','hero.html':'The atlas on one *screen*','encroachment-atlas.html':'Built where water *returns*','terrain-3d.html':'The land in *3D*','flood-3d.html':'Raise the *water*','quake-tsunami.html':'Earthquakes and *tsunamis*','atlas-3d.html':'India by *constraint*','india-3d.html':'The *globe*','globe-map.html':'Globe to flat *map*','ancient-india.html':'Five thousand years, one *spine*','ashoka.html':"Ashoka, in his own *words*",'heritage-atlas.html':'Temples and sacred *ground*','temple-forms.html':'How temples are *shaped*','cave-walk.html':'Walk inside a *temple*','heritage-3d.html':'Temples in *3D*','deep-history.html':'Who we are, in *DNA*','social-fabric.html':'The social *fabric*','atrocities.html':"History's deadliest *events*",'history.html':'History *race*','languages.html':'Languages and scripts of *Bharat*','journey.html':'The journey of a *word*','scripts.html':'One ancestor, many *alphabets*','vedas.html':'One text, many *tongues*','library.html':'Reading *room*','tribes.html':'The tribes that *made it*','indic-design-systems.html':'Colour with a *place*','design-systems.html':'India by design *systems*','design-system.html':'Atomic *reference*','canvas.html':'The *canvas*','how-it-works.html':'How it *works*','about.html':'Methodology and *honesty*','knowledge.html':'Built, and *proven*','provenance.html':'Every figure to its *source*','references.html':'Every *citation*','data.html':'Get the *data*','for-organisations.html':'For *organisations*','share.html':'Share the *record*','privacy-policy.html':'Privacy and *policy*','sitemap.html':'Every page, one *list*'}
def h1(t): return re.sub(r'\*(.+?)\*',r'<em>\1</em>',e(t))

# ---------- block helpers
def sec(title,body,sub=None,p=None): return f'<section class="b"><div class="wrap">{f"<p class=sub data-r>{e(sub)}</p>" if sub else ""}{f"<h2 data-r>{h1(title)}</h2>" if title else ""}{f"<p class=p data-r>{p}</p>" if p else ""}{body}</div></section>'
def tiles(ts): return '<div class="tiles">'+''.join(f'<div class="tile{" gap" if g else ""}" data-r><b{f" data-n={n}" if isinstance(n,(int,float)) and n else ""}>{num(n,1 if isinstance(n,float) else 0) if isinstance(n,(int,float)) else n}</b><span>{l}</span></div>' for n,l,*g in [t if len(t)>2 else (*t,False) for t in ts])+'</div>'
def cards(cs,id=None): return f'<div class="cards"{f" id={id}" if id else ""}>'+''.join(cs)+'</div>'
ARROW='<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
def card(k,t,body='',foot='',href=None):
    tag='a' if href else 'article';h=f' href="{href}"' if href else ''
    return f'<{tag} class="card"{h} data-r>{ARROW if href else ""}<p class="k">{k}</p><h3>{e(t)}</h3>{body}{f"<p class=f>{foot}</p>" if foot else ""}</{tag}>'
_tid=[0]
def table(cols,rows,filt=True,hl=None):
    _tid[0]+=1;i=f't{_tid[0]}'
    th=''.join(f'<th class="{"n" if n else ""}">{e(c)}</th>' for c,n in cols)
    def cell(v,n):
        if isinstance(v,tuple): return f'<td class="{"n" if n else ""}" data-v="{v[1]}">{v[0]}</td>'
        return f'<td class="{"n" if n else ""}">{v}</td>'
    tr=''.join(f'<tr{" class=hl" if hl and hl(r) else ""}>'+''.join(cell(v,cols[k][1]) for k,v in enumerate(r))+'</tr>' for r in rows)
    f=f'<input class="filter" type="search" data-for="{i}" placeholder="Filter these {len(rows)} rows" aria-label="Filter rows">' if filt and len(rows)>12 else ''
    return f'<div data-r>{f}<div class="tblw" id="{i}" tabindex="0"><table class="sort"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div></div>'
def mapb(layers,note=''):
    data=json.dumps(layers,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    return f'<div class="mapgrid" data-map data-r><script type="application/json">{data}</script><div><div class="chips" role="group" aria-label="Map layers"></div><svg class="mapsvg" role="group" aria-label="Map of India with selectable points"></svg></div><div><div class="detail" aria-live="polite"><p class="k">Nothing selected</p><h3>Select a point</h3><p class="p">Each point opens its record, with the source the atlas holds for it.</p></div>{f"<p class=note>{note}</p>" if note else ""}</div></div>'
def live(f,label='Open the live view'):
    return f'<a class="btn solid" href="{LIVE}{ORIG.get(f,f)}" rel="noopener">{label}</a>'
def gateway(f,what):
    return sec('The interactive *view*',f'<div data-r>{live(f)}</div><p class="note" data-r>This page is the reworked entrance. The interactive itself ({what}) runs in the existing atlas and has not been rebuilt here yet.</p>',sub='Open it')
def kv(rows): return '<dl class="kv">'+''.join(f'<dt>{k}</dt><dd>{v}</dd>' for k,v in rows if v not in (None,''))+'</dl>'

def hpt(x):
    rows=[['Where',e(x['st'])],['Built by',e(x['b'])],['Built',yr(x['f'])+(' to '+yr(x['to']) if x['to'] and x['to']!=x['f'] else '')],['Today',e((x['s'] or '').replace('_',' '))]]
    if x['dy']: rows.append(['Recorded damage',yr(x['dy'])+(', '+e(x['da']) if x['da'] else '')])
    rows.append(['Source',src(x['ul'],x['u'],x['tier'])])
    return {'p':x['p'],'h':e(x['n']),'k':'Sacred site · '+e((x['t'] or '').replace('_',' ')),'rows':[r for r in rows if r[1]]}
def apt(x): return {'p':x['p'],'r':4.2,'h':e(x['n']),'k':'Edict find-spot · '+e(x['ty'] or ''),'rows':[['Today',e(x['m'])],['Scripts',e(', '.join(x['sc'] or []))],['Why it matters',e(x['note'])]]}
def wpt(x): return {'p':x['p'],'r':5,'h':e(x['n']),'k':'Ruled case · '+e(x['y'] or ''),'rows':[['Where',e(', '.join(filter(None,[x['di'],x['st']])))],['What',e(x['ty'])],['The record',e(x['det'])],['Source',src('case source',x['u'])]]}
def qpt(x): return {'p':x['p'],'r':round(2+(x['m']-6)*5,1),'h':'Magnitude '+str(x['m']),'k':'Earthquake · '+str(x['y']),'rows':[['Where',e(x['n'])],['Depth',f"{x['d']} km"],['Source','USGS earthquake catalogue <span class="chip t">T2</span>']]}
def npt(x): return {'p':x['p'],'r':round(3+x['c']**.5*1.6,1),'h':e(x['n']),'k':'News activity','rows':[['State',e(x['st'])],['Gathered items',x['c']],['Shown here','none: no item is approved yet '+GAP]]}

PAGES={}
def page(f): 
    def d(fn): PAGES[f]=fn;return fn
    return d
LEANS=[('left','Left'),('centre-left','Centre-left'),('centre','Centre'),('centre-right','Centre-right'),('right','Right'),('state_media','State media'),('unknown','No published assessment')]
F=A['feed'];NF=F['count']
def outlet_blocks():
    cnt=dict(F['by_outlet']);bl=dict(F['by_lean'])
    rows=[[l,(num(bl.get(k,0)),bl.get(k,0)),e(', '.join(o['name'] for o in A['outlets'] if o.get('lean')==k)) or 'none in the registry'] for k,l in LEANS]
    lean=table([('Published lean',0),('Items gathered',1),('Outlets',0)],rows,filt=False)
    cs=[card(e(dict(LEANS).get(o.get('lean'),'unknown')),o['name'],kv([('Owner',e(o.get('owner'))),('Controlled by',e(o.get('controlling_interest')) or GAP),('Funding',e(A['funding_types'].get(o.get('funding_type'),''))),('In the feed',num(cnt[o['name']])+' items' if cnt.get(o['name']) else GAP),('Record',src(o.get('source_name'),o.get('source'),o.get('source_tier')))])) for o in sorted(A['outlets'],key=lambda o:-cnt.get(o['name'],0))]
    return lean,cards(cs)
def news_tiles(): return tiles([(NF,f'items gathered, as of {F["generated"]}'),(len(F['by_outlet']),f'outlets in the feed, {len(A["outlets"])} with an ownership record'),(len(F['by_lang']),'languages'),('0','approved by a person so far '+GAP,True)])

@page('feed.html')
def _():
    lean,cs=outlet_blocks()
    return sec('The feed, *counted*',news_tiles()+'<p class="note" data-r>Items are gathered by link and short snippet only, and held until a person approves them. None is approved yet, so no headline is shown.</p>',sub='Where it stands')+f'<div id="bias"></div>'+sec('The spin *check*',lean+f'<p class="note" data-r>Lean records published third-party assessments. It is not this project\'s verdict. {F["by_lean"][0][1]/NF*100:.0f}% of items come from outlets with no published assessment and stay unlabelled.</p>',sub='Coverage by published lean')+sec('Who owns each *outlet*',cs,sub='Ownership and funding')+sec('Where the news *is*',mapb([{'n':'News activity','c':'#e8dcc0','ring':True,'pts':[npt(x) for x in A['news']]}],f'{F["geo_state"]/NF*100:.0f}% of items could be tied to a state and {F["geo_dist"]/NF*100:.0f}% to a district.'),sub='By place')
FE=j('fiscal-events.json')
@page('news-journey.html')
def _():
    cs=[card(e(', '.join(filter(None,[c['geo'].get('district'),c['geo'].get('state')])))+' · '+e(c['status']),c['title'],f'<p>{e(c["one_line"])}</p>'+kv([('Promise',e(c.get('promise'))),('Result',e(c.get('result'))),('Human impact',e(c.get('human_impact')))]),f'{e(c["started_at"])} to {e(c["last_event_at"])} · {len(c["event_ids"])} events') for c in FE['story_chains']]
    return sec('Thirteen stories, each a *chain*','<input class="filter" type="search" data-for="chains" placeholder="Filter by place or scheme" aria-label="Filter stories" data-r>'+cards(cs,'chains'),sub='From the fiscal events file',p='Each story follows public money from the promise to what was delivered, as the record shows it.')+gateway('news-journey.html','the dated rail with fact beside framing')
@page('timeline.html')
def _():
    ev=sorted(FE['fiscal_events'],key=lambda x:x['date'],reverse=True)
    rows=[[e(x['date']),e(x['stage']),e(x['title']),e(', '.join(filter(None,[x['geo'].get('district'),x['geo'].get('state')]))),(num(x['amount_cr']) if x.get('amount_cr') else GAP,x.get('amount_cr') or 0),src((x.get('primary_source') or {}).get('title'),(x.get('primary_source') or {}).get('url'),(x.get('primary_source') or {}).get('source_tier'))] for x in ev]
    return sec('The record, event by *event*',table([('Date',0),('Stage',0),('What happened',0),('Where',0),('₹ crore',1),('Source',0)],rows),sub=f'{len(ev)} fiscal events')+gateway('timeline.html','the scrubbing timeline with severity scores')
@page('articles.html')
def _():
    a=j('articles.json')['articles']
    return sec('Published *pieces*',cards([card(e(x['published'])+' · '+e(x['author']),x['title'],f'<p>{e(x["dek"])}</p>',e(', '.join(x['tags']))) for x in a]),sub=f'{len(a)} so far')+f'<section class="b"><div class="wrap" data-r>{live("articles.html","Read it in the atlas")}</div></section>'
FI=j('india-fiscal.json')
def fiscal_rows():
    rows=[]
    for n,s in FI['states'].items():
        back=s['devolution'][-1]+s['grants'][-1];con=s['contribution'][-1]
        rows.append([e(n),e(s.get('region','')),(num(s['gsdp'][-1]),s['gsdp'][-1]),(num(con),con),(num(back,1),back),(f'{back/con:.2f}',round(back/con,3))])
    return sorted(rows,key=lambda r:-r[3][1])
FNOTE=f'Units: {e(FI["_meta"]["units"])}, FY24. {e(FI["_meta"]["notes"])} Sources: {e("; ".join(FI["_meta"]["sources"]))}.'
@page('state-of-india.html')
def _():
    return sec('What each state pays in, and gets *back*',table([('State',0),('Region',0),('GSDP',1),('Pays in (est.)',1),('Gets back',1),('Back per ₹1 paid',1)],fiscal_rows())+f'<p class="note" data-r>"Gets back" is devolution plus grants. {FNOTE}</p>',sub=f'{len(FI["states"])} states, FY24')+gateway('state-of-india.html','the ranked state cards with ten years of history')
@page('money-map.html')
def _():
    c=j('coverage.json')['totals']
    return sec('The frame, and how deep it *goes*',tiles([(c['districts'],'districts in the frame'),(c['bands']['deep'],'proven deeply'),(c['bands']['partial'],'partly proven'),(c['bands']['baseline'],'baseline only, gaps marked',True)]),sub='Coverage today')+gateway('money-map.html','the district choropleth with layers and drill-down')
@page('explore.html')
def _(): return gateway('explore.html','the query engine over all 594 districts')
@page('command-chain.html')
def _():
    p=j('pay-scales.json');rows=[[e(k),e(v.get('service','')),(v.get('pay_level') or '',v.get('pay_level') or 0),(num(v['monthly_basic_min']),v['monthly_basic_min']),(num(v['monthly_basic_max']),v['monthly_basic_max']),e(v.get('note',''))] for k,v in p['posts'].items()]
    return sec('The posts, and what each *costs*',table([('Post',0),('Service',0),('Pay level',1),('Basic from, ₹/month',1),('Basic to, ₹/month',1),('Note',0)],rows)+f'<p class="note" data-r>{e(p["_meta"]["caveat"])}</p>',sub='7th Pay Commission matrix')+gateway('command-chain.html','the tier-by-tier chain')
@page('officials.html')
def _():
    o=j('officials.json');rows=[[e(x['name']),e(x.get('service','')),e(x['current_post']['post']),e(x['current_post']['place']+', '+x['current_post']['state']),e(x['current_post'].get('as_of','')),(len(x.get('issues',[])),len(x.get('issues',[]))),src('posting record',x['current_post'].get('source'),x['current_post'].get('source_tier'))] for x in o['officials']]
    return sec('The register of *offices*',table([('Office-holder',0),('Service',0),('Post',0),('Place',0),('As of',0),('Cited issues',1),('Source',0)],rows)+f'<p class="note" data-r>{e(o["_meta"]["disclaimer"])}</p>',sub=f'{len(rows)} entries')+f'<section class="b"><div class="wrap" data-r>{live("officials.html","Open the full register")}</div></section>'
@page('global.html')
def _():
    g=j('global-indicators.json');cs=sorted([c for c in g['countries'] if c.get('gdp_usd') and len(c['iso3'])==3 and c.get('population')],key=lambda c:-c['gdp_usd'])[:25]
    rows=[[e(c['name']),(num(c['gdp_usd']/1e12,2),c['gdp_usd']),(num(c['gni_per_capita']) if c.get('gni_per_capita') else GAP,c.get('gni_per_capita') or 0),(num(c['population']/1e6),c['population']),(f"{c['industry_pct']:.0f}%" if c.get('industry_pct') else GAP,c.get('industry_pct') or 0),(f"{c['services_pct']:.0f}%" if c.get('services_pct') else GAP,c.get('services_pct') or 0)] for c in cs]
    return sec('The 25 largest *economies*',table([('Country',0),('GDP, $ trillion',1),('Income per person, $',1),('People, million',1),('Industry',1),('Services',1)],rows,hl=lambda r:r[0]=='India')+f'<p class="note" data-r>Source: {e(g["_meta"]["source"])}. The list may include regional aggregates the World Bank publishes.</p>',sub='India highlighted')+gateway('global.html','the full comparison')
@page('geopolitical-chess.html')
def _():
    g=j('geopolitics.json')
    cs=[card(e(x['year'])+' · '+e(x['order_label']),clean(x['label']),f'<p>{e(clean(x["headline"]))}</p>',e(clean(x['holder']))) for x in g['eras']]
    rows=[[e(m['date']),e(m['title']),e(m['text']),'<span class="chip">framing</span>' if m.get('framing') else '<span class="chip ok">record</span>'] for m in g['moves']]
    return sec('Who held the board, era by *era*',cards(cs),sub='A framing, labelled as one',p='This page is an argument about the dollar as the board everyone plays on. It is commentary, kept apart from the record.')+sec('The *moves*',table([('When',0),('Move',0),('What it did',0),('Kind',0)],rows))+gateway('geopolitical-chess.html','the board itself')
for f,w in [('mesh.html','the graph of money, cases, officials and districts'),('engines.html','the seven lenses, each with its own page'),('usa.html','the US fiscal map'),('hero.html','the single-screen globe app'),('terrain-3d.html','the elevation surface with the sea-level slider'),('flood-3d.html','the flood simulation over district terrain'),('atlas-3d.html','the states extruded by development constraint'),('india-3d.html','the real-Earth globe with thirteen layers'),('globe-map.html','the globe unrolling into the flat map'),('cave-walk.html','the first-person walk through Ajanta, Ellora and a Nagara temple'),('heritage-3d.html','the photogrammetry viewer'),('social-fabric.html',"the roles of Ashoka's India"),('history.html','the bar-chart race of states'),('journey.html','the scroll through one word across 4,000 years'),('tribes.html','the six folk design systems'),('design-systems.html','the deck of state skins'),('design-system.html','the Mauryan token and component reference'),('canvas.html','the deck of every screen'),('for-organisations.html','the licensing page'),('share.html','the card maker'),('privacy-policy.html','the policy text')]:
    PAGES[f]=(lambda f,w:lambda:gateway(f,w))(f,w)
@page('encroachment-atlas.html')
def _():
    cs=j('encroachment-cases.json')['cases']
    cards_=[card(e(c['state'])+' · '+e(c['year']),c['water_body'] or c['district'],f'<p>{e(c["detail"])}</p>'+kv([('Type',e(c['type'])),('Order',e(c.get('order_ref'))),('Status',e(c.get('status'))),('Source',src('case source',c.get('source')))])) for c in cs]
    return sec('Sixteen cases, each *ruled on*',mapb([{'n':'Ruled cases','c':'#9fd08a','pts':[wpt(x) for x in A['water']]}],'Placement is the centre of the named water body or the district, never a survey point.'),sub='On the map')+sec('The *cases*','<input class="filter" type="search" data-for="cases" placeholder="Filter by state or water body" aria-label="Filter cases" data-r>'+cards(cards_,'cases'))
@page('quake-tsunami.html')
def _():
    t=j('tsunamis.json')['tsunamis'];rows=[[(x['year'],x['year']),e(x['name']),(x.get('source_quake_mw') or GAP,x.get('source_quake_mw') or 0),(num(x['deaths_total']) if x.get('deaths_total') else GAP,x.get('deaths_total') or 0),(num(x['deaths_india']) if x.get('deaths_india') else GAP,x.get('deaths_india') or 0),e(x.get('india_impact','')),src(x['source']['label'],x['source'].get('url'))] for x in sorted(t,key=lambda x:-x['year'])]
    return sec('Strong earthquakes, 2000 to *2025*',mapb([{'n':'Earthquakes, M6+','c':'#e0603f','ring':True,'pts':[qpt(x) for x in A['quakes']]}],e(A['quakes_meta'])+'; this view keeps magnitude 6 and above.'),sub=f'{len(A["quakes"])} events')+sec('Tsunamis that reached the *coast*',table([('Year',1),('Event',0),('Quake Mw',1),('Deaths, total',1),('Deaths, India',1),('Impact on India',0),('Source',0)],rows,filt=False)+'<p class="note" data-r>Death tolls vary widely by source. Each figure is a representative one, cited.</p>')+gateway('quake-tsunami.html','the live USGS tracker')
AN=j('ancient-india.json')
def facet(label,f):
    if not f: return ''
    ev=f.get('evidence') or {}
    chip=f' <span class="chip {"ok" if ev.get("confidence")=="established" else ""}">{e(ev["confidence"])}</span>' if ev.get('confidence') else ''
    more=''.join(f'<p><b style="color:var(--gilt)">{k}:</b> {e(v)}</p>' for k,v in [('Evidence',(ev.get('tier') or '').replace('-',' ')),('Recorded by',ev.get('recorded_by')),('Shaped by',ev.get('shaped_by')),('How we know',ev.get('how'))] if v)
    return f'<details><summary><b>{label}</b>{e(f["text"])}{chip}</summary><p>{e(f.get("detail",""))}</p>{more}</details>'
@page('ancient-india.html')
def _():
    out=''
    for x in AN['eras']:
        links=''.join(f'<a class="btn" href="{e(l["href"])}">{e(l["label"])}</a>' for l in x.get('links',[]) if l['href'].split('#')[0] in ALLF)
        con=x.get('contested');con=f'<p class="note"><span class="chip">contested</span> {e(con if isinstance(con,str) else "Parts of this era are debated; see each facet.")}</p>' if con else ''
        out+=f'<article class="era" data-r><p class="when">{e(x["when"])}</p><h2>{e(x["name"])}</h2><div class="facets">'+''.join(facet(l,x.get(k)) for l,k in [('Language','language'),('Script','script'),('People','people'),('Rulers','rulers'),('Heritage','heritage')])+'</div><ul class="ev">'+''.join(f'<li>{e(v)}</li>' for v in x.get('events',[]))+f'</ul>{con}<div>{links}</div></article>'
    return sec('',f'<div class="spine">{out}</div>')+sec('After 550 CE, the story *continues*','<div data-r><a class="btn solid" href="index.html">Bharat through time, thirteen eras</a><a class="btn" href="heritage-atlas.html">Temples and sacred ground</a></div>',p='This spine stops at the Gupta age. The scrolling history on the front page carries on through the temple-building centuries, the Cholas, the regional kingdoms, the sultanates and Mughals, colonial rule and the Republic.')
AS=j('ashoka-edicts.json')
@page('ashoka.html')
def _():
    k=AS['kalinga']
    rows=[[e(x['group']+' '+str(x['n'])),e(x['theme']),e(x['summary'])] for x in AS['edicts']]
    return sec('How far his writ *ran*',mapb([{'n':"Edict find-spots",'c':'#5f9fd6','pts':[apt(x) for x in A['ashoka']]}],'The find-spots of the edicts trace the reach of Mauryan authority.'),sub=f'{len(A["ashoka"])} find-spots')+sec('Kalinga, and the *remorse*',f'<blockquote data-r>{e(k["quote_conquest"])}<cite>{e(k["title"])}</cite></blockquote><blockquote data-r>{e(k["quote_remorse"])}<cite>{e(k["translator"])}</cite></blockquote><p class="p" data-r>{e(k["significance"])}</p>',sub=e(k['when']))+sec('What the edicts *say*',table([('Edict',0),('Theme',0),('Summary',0)],rows),sub=f'{len(rows)} edicts')+gateway('ashoka.html','the pillar model and script zones')
HS=j('heritage-sites.json')['sites']
@page('heritage-atlas.html')
def _():
    rows=[]
    for s in HS:
        d=(s.get('destruction') or {}).get('primary') or {};so=(s.get('source') or [{}])[0]
        rows.append([e(s['name']),e((s.get('tradition') or '').replace('_',' ')),e(s.get('state') or s.get('region') or ''),(yr(s.get('built_from')),s.get('built_from') or 0),e((s.get('status') or '').replace('_',' ')),(yr(d.get('year'))+(', '+e(d.get('actor')) if d.get('actor') else '') if d.get('year') else '',d.get('year') or 99999),src(so.get('label'),so.get('url'),so.get('tier'))])
    return sec('On the *ground*',mapb([{'n':'Sacred sites','c':'#f0b429','pts':[hpt(x) for x in A['heritage']]}],f'{len(A["heritage"])} of {len(HS)} sites fall inside this frame. The rest lie along the Silk Route and in Southeast and East Asia, and are in the table below.'),sub=f'{len(HS)} sites')+sec('Every *site*',table([('Site',0),('Tradition',0),('Where',0),('First built',1),('Today',0),('Recorded damage',1),('Source',0)],rows)+'<p class="note" data-r>Dates and medieval tolls are estimates with wide spread among historians. Damage by every actor on record is listed, not only one period.</p>')+gateway('heritage-atlas.html','the lifespans and series views')
TD=j('temple_dims.json')['forms']
def drawing():
    n,d,s=TD['nagara'],TD['dravidian'],TD['stupa'];H=72;base=H-4
    def Y(m): return base-m
    g=''.join(f'<line class="grid" x1="6" x2="158" y1="{Y(m)}" y2="{Y(m)}"/><text x="1" y="{Y(m)+.5}">{m} m</text>' for m in range(0,70,10))
    # stupa: dome 36.6 wide, 16.46 high, at x centre 30
    cx=28;r=s['dome_diameter_m']/2;hh=s['dome_height_m']
    st=f'M{cx-r-3} {Y(0)}H{cx+r+3}M{cx-r} {Y(0)}C{cx-r} {Y(hh*1.3)} {cx+r} {Y(hh*1.3)} {cx+r} {Y(0)}M{cx-2} {Y(hh)}h4v-2.2h-4zM{cx} {Y(hh+2.2)}V{Y(hh+7)}'
    stf=''.join(f'M{cx-w} {Y(hh+y)}h{2*w}' for w,y in [(2.6,3.4),(2,4.8),(1.4,6.2)])+''.join(f'M{cx+o-1.2} {Y(0)}v-5.2M{cx+o+1.2} {Y(0)}v-5.2M{cx+o-2.2} {Y(4)}h4.4M{cx+o-2.2} {Y(5)}h4.4' for o in (-r-1.5,r+1.5))
    # nagara: plinth 3, shikhara to 31 on plinth; length 30.5
    x0=62;L=n['length_m'];pl=n['plinth_height_m'];top=n['shikhara_height_m']
    def spire(xc,w,h,y0):
        pts=[];K=14
        for i in range(K+1):
            t=i/K;pts.append((xc-w/2*(1-t**2.3),Y(y0+h*t)))
        return 'M'+'L'.join(f'{a:.2f} {b:.2f}' for a,b in pts)+'L'+'L'.join(f'{2*xc-a:.2f} {b:.2f}' for a,b in reversed(pts))
    na=f'M{x0-2} {Y(0)}h{L+4}M{x0} {Y(0)}v-{pl}h{L}v{pl}'+spire(x0+L-7,11,top-pl,pl)+spire(x0+L-17,8,(top-pl)*.62,pl)+spire(x0+L-24.5,6,(top-pl)*.44,pl)+spire(x0+3.5,5,(top-pl)*.3,pl)
    naf=''.join(spire(x0+L-7+dx,2.2,6,pl+yy) for dx,yy in [(-4.2,3),(4.2,3),(-3.3,9),(3.3,9),(-2.4,15),(2.4,15)])+f'M{x0+L-7.6} {Y(top)}h1.2v-1.6h-1.2z'
    # dravida: 13 storeys to 66 m, base 25 wide
    xd=128;bw=25;sh=d['vimana_height_m'];stor=d['vimana_storeys'];body_h=sh-9
    dr=f'M{xd-bw/2-3} {Y(0)}h{bw+6}M{xd-bw/2} {Y(0)}v-12h{bw}v12'
    drf=''
    for i in range(stor):
        t0=i/stor;t1=(i+1)/stor;w0=bw*(1-.74*t0);y0=12+(body_h-12)*t0;y1=12+(body_h-12)*t1
        dr+=f'M{xd-w0/2} {Y(y0)}h{w0}v-{(y1-y0)*.8:.2f}h-{w0}z'
        drf+=''.join(f'M{xd-w0/2+w0*k/6:.2f} {Y(y0)}v-{(y1-y0)*.8:.2f}' for k in range(1,6))
    wt=bw*.26
    dr+=f'M{xd-wt/2} {Y(body_h)}v-2.5h{wt}v2.5M{xd-wt/2-.6} {Y(body_h+2.5)}c0 -6 {wt+1.2} -6 {wt+1.2} 0M{xd} {Y(sh-1.6)}v-1.6'
    man=f'M{108} {Y(0)}v-1.1m-.35 .3h.7m-.35 -.75a.25 .25 0 1 0 .01 0'
    caps=[(cx,'Great Stupa, Sanchi',f'dome {s["dome_diameter_m"]} m wide, {s["dome_height_m"]} m high'),(x0+L/2,'Kandariya Mahadeva, Khajuraho',f'{top} m high, {L} m long, {n["sub_spires"]} sub-spires'),(xd,'Brihadisvara, Thanjavur',f'vimana about {sh} m, {stor} storeys')]
    cap=''.join(f'<text class="cap" x="{x}" y="{H+.2}" text-anchor="middle">{e(a)}</text><text x="{x}" y="{H+2.6}" text-anchor="middle">{e(b)}</text>' for x,a,b in caps)
    return f'<svg class="draw" viewBox="0 -2 162 {H+6}" role="img" aria-label="Three temples drawn to one scale: the Great Stupa at Sanchi, Kandariya Mahadeva at Khajuraho and Brihadisvara at Thanjavur, with a person for scale" data-r>{g}<path class="ln" d="{st}"/><path class="ln fine" d="{stf}"/><path class="ln" d="{na}"/><path class="ln fine" d="{naf}"/><path class="ln" d="{dr}"/><path class="ln fine" d="{drf}"/><path class="ln" style="stroke:var(--ink)" d="{man}"/><text x="109" y="{Y(0)-1.6}">person, 1.7 m</text>{cap}</svg>'
@page('temple-forms.html')
def _():
    cs=[]
    for k,v in TD.items():
        dims=[(kk.replace('_m',' (m)').replace('_',' '),e(vv if not isinstance(vv,list) else ' × '.join(map(str,vv)))) for kk,vv in v.items() if kk not in('example','built','notes','source','real_scan','curve_exponent','taper') and vv is not None and not isinstance(vv,(dict,bool))]
        cs.append(card(e(k.replace('_',' '))+' · '+e(v.get('built','')),v['example'],f'<p>{e(v.get("notes",""))}</p>'+kv(dims+[('Source',src(v.get('source')))])))
    return sec('Three forms, one *scale*',drawing()+'<p class="note" data-r>Drawn from the documented measurements in the atlas, one unit to one metre. Outlines are schematic: overall heights, widths, storey and spire counts are measured; ornament and profile detail are indicative. The Brihadisvara height is given as 60 to 66 m across sources; the file value is used.</p>',sub='Measured elevation')+sec('Every form, with its *numbers*',cards(cs),sub=f'{len(TD)} forms')+gateway('temple-forms.html','the 3D models built to these proportions')
@page('deep-history.html')
def _():
    ev=sorted(j('dna-shifts.json')['events'],key=lambda x:x['sort_year'])
    cs=[card(e(x['year_label'])+' · '+e(x['region']),x['title'],f'<p>{e(x["finding"])}</p><p><b style="color:var(--gilt)">Interpretation, kept apart:</b> {e(x.get("interpretation",""))}</p>',f'<span class="chip {"ok" if x["consensus"]=="established" else ""}">{e(x["consensus"])}</span> '+src((x.get('source') or {}).get('label') if isinstance(x.get('source'),dict) else x.get('source'),(x.get('source') or {}).get('url') if isinstance(x.get('source'),dict) else None)) for x in ev]
    return sec('Eight shifts, in *order*',cards(cs),sub='Finding first, interpretation second')+gateway('deep-history.html','the ancestry map')
@page('atrocities.html')
def _():
    a=j('atrocities.json');rows=[[(x['rank'],x['rank']),e(x['name']),(yr(x['year_start'])+(' to '+yr(x['year_end']) if x.get('year_end') and x['year_end']!=x['year_start'] else ''),x['year_start']),(num(x['deaths_millions'],1),x['deaths_millions']),e(x['category'].replace('_',' ')),e(x['location'])] for x in sorted(a['events'],key=lambda x:x['rank'])]
    return sec('One hundred events, *counted*',table([('Rank',1),('Event',0),('When',1),('Deaths, million',1),('Kind',0),('Where',0)],rows)+f'<p class="note" data-r>{e(a["_meta"]["honesty"])}</p>',sub="From one catalogue: Matthew White, 2011")+gateway('atrocities.html','the map and timeline')
SC=j('scripts.json')
@page('languages.html')
def _():
    fam={f['id']:f for f in SC['families']}
    cs=[card(e(f.get('parent_family') or 'its own family'),f['label'],f'<p>{e(f["note"])}</p>',e(', '.join(l['name'] for l in SC['languages'] if l['family']==f['id']))) for f in SC['families'] if any(l['family']==f['id'] for l in SC['languages'])]
    et=j('etymologies.json')['places']
    ec=[card(e(x['kind']),x['name'],f'<p class="indic" style="font-size:26px;color:var(--gilt);margin:0 0 6px">{e(x["native"])}</p><p><b style="color:var(--ink)">{e(x["meaning"])}.</b> {e(x["origin"])}</p>',('<span class="chip">contested</span> ' if x.get('contested') else '')+src(x.get('source') if isinstance(x.get('source'),str) else (x.get('source') or {}).get('label'),None,x.get('tier'))) for x in et]
    rows=[[e(l['name']),e(fam.get(l['family'],{}).get('label',l['family'])),e(l['status'].replace('-',' ')),e(l['period']),e(l.get('note',''))] for l in SC['languages']]
    return sec('Unrelated families, shared *scripts*',cards(cs),sub='The families',p="India's languages come from unrelated families. Tamil is not from Sanskrit. Yet nearly all their scripts share one ancestor, Brahmi.")+sec('The *languages*',table([('Language',0),('Family',0),('Status',0),('Period',0),('Note',0)],rows))+sec('What the names *mean*',cards(ec),sub=f'{len(et)} place names')
@page('scripts.html')
def _():
    sp=SC['specimen'];by={s['id']:s['name'] for s in SC['scripts']}
    spec='<div class="spec">'+''.join(f'<div data-r><b>{e(r["text"])}</b><span>{e(r["script"])}</span></div>' for r in sp['renderings'])+'</div>'
    rows=[[e(s['name']),e(s['branch'].replace('-',' ')),e(by.get(s.get('parent'),(s.get('parent') or 'none').replace('?',', uncertain'))),e(s['status'].replace('-',' ')),e(s['period']),e(s.get('note',''))] for s in SC['scripts']]
    return sec('One word, many *letters*',spec+f'<p class="note" data-r>{e(sp["word_meaning"])}. A script may show boxes if your device lacks its font.</p>',sub='saṃskṛtam',p='The same sounds, written in scripts that look nothing alike. Language and script are separate trees.')+sec('The script *family*',table([('Script',0),('Branch',0),('Descends from',0),('Status',0),('Period',0),('Note',0)],rows),sub=f'{len(rows)} scripts')+gateway('scripts.html','the two trees drawn side by side')
VD=j('vedas.json')
@page('vedas.html')
def _():
    t=VD['text'];tr=VD['translators'].get('en-griffith',{})
    vs=''.join(f'<div class="verse" data-r><div><p class="dv">{e(v["devanagari"])}</p><p class="ia">{e(v["iast"])}</p></div><div><p class="sub">Verse {v["n"]}</p><p class="tr">{e((v.get("translations") or {}).get("en-griffith",""))}</p></div></div>' for v in VD['verses'])
    rows=[[e(l['label']),e(l.get('script','')),'<span class="chip ok">sourced</span>' if l['status']=='sourced' else ('<span class="chip t">partial</span>' if l['status']=='partial' else GAP)] for l in VD['languages_scope']]
    return sec(t['title'].split(' — ')[-1].replace('the ','The ',1),vs+f'<p class="note" data-r>English: {e(tr.get("name",""))}, {e(tr.get("work",""))} ({e(tr.get("year",""))}), public domain.</p>',sub=e(t['ref'])+' · '+e(t['date']),p=e(t.get('standfirst','')))+sec('Which tongues are *filled*',table([('Language',0),('Script',0),('Status',0)],rows,filt=False)+'<p class="note" data-r>A translation is shown only when it is by a named, real translator. The rest stay as gaps.</p>')+gateway('vedas.html','the word-by-word gloss')
@page('library.html')
def _():
    b=j('book-analysis.json')['books'];cs=[card('Analysed text',v['title'],kv([('Words',num(v['words'])),('Unique words',num(v['unique_words'])),('Most frequent',e(', '.join(n for n,_ in v['top_nouns'][:6])))])+f'<p>{e(v.get("verdict",""))}</p>') for v in b.values()]
    return sec('On the *shelf*',cards(cs),sub=f'{len(b)} text analysed so far')+gateway('library.html','the reader')
@page('indic-design-systems.html')
def _():
    c=j('colour-stories.json')['colours']
    cs=[card(e(', '.join(x.get('systems',[]))),x['name'],f'<div class="sw"><i style="background:{e(x["hex"])}"></i><p>{e(x["origin"])}</p></div>',e(x['hex'])+' · '+e(x.get('place') or '')) for x in c]
    return sec('Eight colours, each from *somewhere*',cards(cs),sub='The palette has a geography')+gateway('indic-design-systems.html','the Mauryan, Gupta, Chola and Rajput systems')
PV=j('provenance.json');CV=PV['_meta']['coverage']
@page('provenance.html')
def _():
    rows=[[e(s['domain']),(f'T{s["tier"]}',s['tier']),(num(s['claims']),s['claims']),(num(s['figures']),s['figures']),(num(s['gaps']),s['gaps']),e(', '.join(k.split(':')[-1] for k in s['scopes']))] for s in sorted(PV['sources'],key=lambda s:-s['claims'])]
    return sec('The ledger, *totalled*',tiles([(CV['claims_total'],'claims audited'),(CV['figures_pinned'],'figures pinned to a source'),(CV['declared_gaps'],'declared gaps',True),(str(CV['unattributed']),'unattributed')]),sub=f'Generated {e(PV["_meta"]["generated_at"][:10])}')+sec('Source by *source*',table([('Source',0),('Tier',1),('Claims',1),('Figures',1),('Gaps',1),('Covers',0)],rows))
@page('references.html')
def _():
    tl=PV['_meta']['tier_labels'];out=''
    for t in ['1','2','3','4']:
        ds=sorted({s['domain'] for s in PV['sources'] if str(s['tier'])==t})
        out+=card(f'Tier {t} · {num(CV["by_tier"].get(t,0))} claims',tl[t].split(' — ')[0],f'<p>{e(tl[t].split(" — ")[-1])}</p><p>{e(", ".join(ds)) or "none"}</p>')
    return sec('Four tiers of *trust*',cards([out]),sub='How a source is ranked')+f'<section class="b"><div class="wrap" data-r><a class="btn solid" href="provenance.html">Open the provenance ledger</a>{live("references.html","The full narrative of sources")}</div></section>'
@page('knowledge.html')
def _():
    c=j('coverage.json');rows=[[e(x['label']),(num(x['got']),x['got']),(num(x['possible']),x['possible']),(f'{x["pct"]}%',x['pct'])] for x in c['components']]
    top=[[e(x['place']),(f'{x["pct"]}%',x['pct']),e(x['band'])] for x in c['top']]
    return sec('The whole frame is built. Little of it is *proven*.',tiles([(c['totals']['districts'],'districts in the frame'),(c['totals']['avg_pct'],'average proof score, percent'),(c['totals']['bands']['deep'],'districts proven deeply'),(c['totals']['bands']['baseline'],'still baseline, gaps marked',True)]),sub='Coverage')+sec('By *layer*',table([('Layer',0),('Filled',1),('Possible',1),('Share',1)],rows,filt=False))+sec('Deepest *districts*',table([('District',0),('Score',1),('Band',0)],top,filt=False))
@page('how-it-works.html')
def _():
    u=sorted(j('updates.json')['updates'],key=lambda x:x['date'],reverse=True)[:9]
    rules=[('Rule one','Sourced, or it is a gap','Every figure cites a source or is shown as a declared gap. Nothing is estimated to fill a hole.'),('Rule two','Fact and framing stay apart','What the record shows sits beside commentary, each labelled, never blended.'),('Rule three','One nav, one name','Every page has one name and one home, drawn from a single list.'),('Rule four','Open, or keyed','Open data ships. Anything paid or live is opt-in with your own key, kept in your browser.')]
    return sec('Four rules that hold *everywhere*',cards([card(k,t,f'<p>{b}</p>') for k,t,b in rules]),sub='The method')+sec('What changed *lately*',cards([card(e(x['date'])+' · '+e(x['kind']),x['title'],f'<p>{e(x["detail"][:260])}{"…" if len(x["detail"])>260 else ""}</p>',e(x.get('scope',''))) for x in u]),sub='From the updates file')
@page('about.html')
def _():
    tl=PV['_meta']['tier_labels']
    return sec('What a source is *worth*',table([('Tier',0),('Meaning',0),('Claims resting on it',1)],[[f'T{t}',e(tl[t]),(num(CV['by_tier'].get(t,0)),CV['by_tier'].get(t,0))] for t in '1234'],filt=False),sub='Source tiers')+sec('What this project does not *claim*','<p class="p" data-r>It is independent and non-commercial, and is not affiliated with any government body. Records about office-holders describe the office and what cited documents say; they are not accusations. Lean labels for news outlets record published third-party assessments and are not this project\'s verdict. Encyclopedia entries are used to find facts, not to rest on them.</p>'+f'<div data-r>{live("about.html","Read the full methodology")}</div>',sub='Limits')
@page('data.html')
def _():
    fs=['district-ledger.json','india-fiscal.json','india-extras.json','heritage-sites.json','ancient-india.json','ashoka-edicts.json','scripts.json','vedas.json','outlets.json','feeds.json','news-feed.json','fiscal-events.json','encroachment-cases.json','india-earthquakes.json','tsunamis.json','india-aqi.json','sealevel-exposure.json','provenance.json','coverage.json','officials.json','india-states.geojson','india-rivers.geojson','temple_dims.json','global-indicators.json']
    rows=[]
    for f in fs:
        if os.path.exists(R+f):
            sz=os.path.getsize(R+f);m={}
            try:
                if sz<3e7: m=json.load(open(R+f)).get('_meta',{})
            except Exception: pass
            rows.append([f'<a href="https://github.com/sinhaankur/bharat/blob/main/{f}" rel="noopener">{f}</a>',(f'{sz/1e6:.1f} MB' if sz>1e6 else f'{sz/1e3:.0f} KB',sz),e((m.get('purpose') or m.get('title') or '')[:180]) if isinstance(m,dict) else ''])
    return sec('The files behind the *pages*',table([('File',0),('Size',1),('What it holds',0)],rows),sub=f'{len(rows)} of the main files',p='Everything here is read from files in the open repository.')+f'<section class="b"><div class="wrap" data-r>{live("data.html","Data and API notes")}</div></section>'


TR=json.load(open(HERE+'inputs/tribes.json'))
def lum(h): h=h.lstrip('#');r,g_,b=[int(h[i:i+2],16)/255 for i in (0,2,4)];return .2126*r+.7152*g_+.0722*b
@page('tribes.html')
def _():
    out=''
    for t in TR:
        cols=[c for c,_ in t['band']];by=sorted(cols,key=lum);pg=by[0] if lum(by[0])<.12 else '#17110c';pi=by[-1] if lum(by[-1])>.6 else '#f4efe4'
        mid=[c for c in cols if c not in(pg,pi)] or cols;pa=max(mid,key=lambda c:lum(c) if lum(c)<.75 else 0);p3=mid[-1]
        band=''.join(f'<span style="background:{c};color:{"#17110c" if lum(c)>.45 else "#f4efe4"}">{e(n)}</span>' for c,n in t['band'])
        tok=''.join(f'<div><i style="background:{c}"></i>{c}</div>' for c,n in t['band'])
        out+=f'<article class="plate" data-r style="--pg:{pg};--pi:{pi};--pa:{pa};--p3:{p3}"><div class="band">{band}</div><div class="a"><p class="reg">{e(t["region"])}</p><h2>{e(t["name"])}</h2><p class="tg">{e(t["tagline"])}</p><p>{t["history"]}</p><p>{t["ideas"]}</p></div><div class="bb"><p class="gl">{e(t["script"]["glyphs"])}</p><p class="rom">{e(t["script"]["rom"])} · {e(t["script"]["lang"])}</p><div class="tok">{tok}</div><p><b>Family:</b> {e(t["family"])}<br><b>Type:</b> {e(t["fonts"])}</p><div class="demo" aria-hidden="true"><span class="pb">Primary</span><span class="po">Outline</span><span class="pc">token chip</span></div></div></article>'
    return sec('',out+'<p class="note" data-r>Each plate is drawn in its own palette: the darkest pigment as ground, the lightest as ink, one mid pigment as accent. Pigment names and histories are from the atlas.</p>')+gateway('tribes.html','the full plates with hover detail')
def tree(items,pid,label,dead=lambda x:False,sub=lambda x:''):
    kids={}
    for x in items: kids.setdefault(pid(x),[]).append(x)
    ids={x['id'] for x in items}
    def rec(x): 
        k=kids.get(x['id'],[])
        return f'<li><span class="nd{" dead" if dead(x) else ""}">{e(label(x))}<small>{e(sub(x))}</small></span>'+(f'<ul>{"".join(rec(c) for c in k)}</ul>' if k else '')+'</li>'
    roots=[x for x in items if pid(x) not in ids]
    return ''.join(rec(x) for x in roots)
SCHED=[('Assamese','Indo-Aryan','Bengali–Assamese'),('Bengali','Indo-Aryan','Bengali–Assamese'),('Bodo','Tibeto-Burman','Devanagari'),('Dogri','Indo-Aryan','Devanagari'),('Gujarati','Indo-Aryan','Gujarati'),('Hindi','Indo-Aryan','Devanagari'),('Kannada','Dravidian','Kannada'),('Kashmiri','Indo-Aryan','Perso-Arabic, Devanagari, Sharada'),('Konkani','Indo-Aryan','Devanagari'),('Maithili','Indo-Aryan','Devanagari, Tirhuta'),('Malayalam','Dravidian','Malayalam'),('Manipuri (Meitei)','Tibeto-Burman','Meitei Mayek, Bengali'),('Marathi','Indo-Aryan','Devanagari'),('Nepali','Indo-Aryan','Devanagari'),('Odia','Indo-Aryan','Odia'),('Punjabi','Indo-Aryan','Gurmukhi'),('Sanskrit','Indo-Aryan','Devanagari and others'),('Santali','Austroasiatic','Ol Chiki'),('Sindhi','Indo-Aryan','Perso-Arabic, Devanagari'),('Tamil','Dravidian','Tamil'),('Telugu','Dravidian','Telugu'),('Urdu','Indo-Aryan','Perso-Arabic')]
_old_lang=PAGES['languages.html']
@page('languages.html')
def _():
    fam={f['id']:f for f in SC['families']};L=SC['languages']
    def famtree(fid):
        ls=[l for l in L if l['family']==fid]
        return f'<ul class="tree" data-r><li class="fam"><span class="nd">{e(fam.get(fid,{}).get("label","Unclassified"))}<small>{e(fam.get(fid,{}).get("parent_family") or "")}</small></span><ul>'+tree(ls,lambda x:x.get('descends_from'),lambda x:x['name'],lambda x:x['status'] not in('living',),lambda x:x['status'].replace('-',' '))+'</ul></li></ul>'
    fams=[f for f in dict.fromkeys(l['family'] for l in L)]
    lt='<div class="trees">'+''.join(famtree(f) for f in fams)+'</div>'
    st='<ul class="tree" data-r>'+tree(SC['scripts'],lambda x:(x.get('parent') or '').replace('?','').replace('aramaic','_'),lambda x:x['name'],lambda x:x['status']!='living',lambda x:x['status'].replace('-',' ')+' · '+x['period'])+'</ul>'
    by={}
    for s in SC['scripts']:
        for w in s.get('writes',[]): by.setdefault(w,[]).append(s['name'])
    rel=[[e(l['name']),e(fam.get(l['family'],{}).get('label',l['family'])),e(next((x['name'] for x in L if x['id']==l.get('descends_from')),'')),e(', '.join(by.get(l['id'],[])) or ', '.join(l.get('written_in',[]))),e(l['status'].replace('-',' '))] for l in L]
    sched=[[e(a),e(b),e(c)] for a,b,c in SCHED]
    return sec('Who descends from *whom*',lt+'<p class="note" data-r>Dashed boxes are languages that are reconstructed, historical or no longer spoken. Families are unrelated to each other: Tamil does not descend from Sanskrit.</p>',sub='The language tree',p="India's languages come from unrelated families.")+sec('One ancestor, many *alphabets*',st+'<p class="note" data-r>Nearly every script here descends from Brahmi. Where Brahmi itself came from is unresolved, and the atlas says so.</p>',sub='The script tree')+sec('Language to *script*',table([('Language',0),('Family',0),('Descends from',0),('Written in',0),('Status',0)],rel),sub='How the two trees cross')+sec('The 22 scheduled *languages*',table([('Language',0),('Family',0),('Usual script',0)],sched)+'<p class="note" data-r>Source: Eighth Schedule, Constitution of India. Family and script are added here from general reference and are not yet in the atlas data files; speaker counts are left as a gap until tied to the Census. '+GAP+'</p>',sub='Recognised by the Constitution')+_old_lang().split('<section class="b">')[-1].join(['<section class="b">',''])
@page('news-journey.html')
def _():
    ev={x['id']:x for x in FE['fiscal_events']};out=''
    for c in FE['story_chains']:
        es=sorted([ev[i] for i in c['event_ids'] if i in ev],key=lambda x:x['date'])
        li=''.join(f'<li><span class="d">{e(x["date"])} · {e(x["stage"])}</span><b>{e(x["title"])}</b><p>{e(x["summary"])}</p>'+src((x.get('primary_source') or {}).get('title'),(x.get('primary_source') or {}).get('url'),(x.get('primary_source') or {}).get('source_tier'))+f' <span class="chip {"ok" if x.get("confidence")=="documented" else ""}">{e(x.get("confidence",""))}</span>'+(f' <span class="chip t">{len(x["corroborating_news"])} news reports</span>' if x.get('corroborating_news') else ' <span class="chip">no matching news report found yet</span>')+'</li>' for x in es)
        def _t(v):
            if isinstance(v,dict):
                s_=v.get('source') or {}
                return e(v.get('stated') or v.get('amount_note') or '')+(' '+src(s_.get('title'),s_.get('url'),s_.get('source_tier')) if s_ else '')
            return e(v)
        two=''.join(f'<div><b>{k}</b>{_t(v)}</div>' for k,v in [('The promise',c.get('promise')),('The result',c.get('result')),('Actual cost',c.get('actual_cost')),('Human impact',c.get('human_impact'))] if v)
        out+=f'<article class="rail" data-r><p class="k">{e(", ".join(filter(None,[c["geo"].get("district"),c["geo"].get("state")])))} · {e(c["status"])}</p><h3>{e(c["title"])}</h3><p class="p">{e(c["one_line"])}</p><div class="two">{two}</div><ol>{li}</ol></article>'
    lean,cs=outlet_blocks()
    top=sec('','<div class="tiles"><a class="tile" data-r href="feed.html" style="text-decoration:none"><b>'+str(len(ST['stories']))+'</b><span>news stories with left, centre and right coverage compared. Open the coverage view.</span></a><a class="tile" data-r href="feed.html#bias" style="text-decoration:none"><b>'+str(len(A['outlets']))+'</b><span>outlets with ownership and published lean on record. Open the spin check.</span></a></div>')
    return top+sec('Thirteen stories, each a *chain*','<input class="filter" type="search" data-for="chains" placeholder="Filter by place or scheme" aria-label="Filter stories" data-r><div id="chains">'+out.replace('class="rail"','class="rail card" style="display:block"')+'</div>',sub='The record behind each story',p='Each story follows public money from the promise to what was delivered. Every step names its source, how firm it is, and whether any approved news coverage is attached.')+sec('Who would be telling *it*',lean+'<p class="note" data-r>Coverage of these stories by outlet is a gap until items are approved. This table shows where the gathered feed leans overall, by published third-party assessment.</p><div data-r><a class="btn" href="feed.html">Outlets and ownership</a></div>',sub='Bias, before the headline')
LG=j('district-ledger.json')['states']
@page('money-map.html')
def _():
    from collections import Counter
    M=[];notes={}
    back={n:round((s['devolution'][-1]+s['grants'][-1])/s['contribution'][-1],2) for n,s in FI['states'].items()}
    M.append({'n':'Back per ₹1 paid in','vals':back,'fmt':{k:f'₹{v:.2f}' for k,v in back.items()},'note':'devolution plus grants, per rupee of estimated contribution, FY24'})
    gs={n:s['gsdp'][-1] for n,s in FI['states'].items()};M.append({'n':'State output','vals':gs,'fmt':{k:f"₹{v:,} thousand crore" for k,v in gs.items()},'note':'GSDP, FY24'})
    fe=Counter(x['geo'].get('state') for x in FE['fiscal_events'] if x['stage'] in('delay','audit','flag','freeze','litigation') or True)
    fl=Counter();
    for x in FE['fiscal_events']:
        if x['stage'] not in('sanction','release','promise','announcement'): fl[x['geo'].get('state')]+=1
    M.append({'n':'Delays, audits and freezes on record','vals':dict(fl),'fmt':{k:f'{v} events' for k,v in fl.items()},'note':'fiscal events past the promise stage; a count of documents, not a score'})
    off=Counter()
    for o in j('officials.json')['officials']: off[o['current_post']['state']]+=len(o.get('issues',[]))
    off={k:v for k,v in off.items() if v};M.append({'n':'Cited issues attached to offices','vals':off,'fmt':{k:f'{v} cited' for k,v in off.items()},'note':'from the officials register; attached to the office, each cited'})
    sn=Counter()
    for s,v in LG.items():
        for dn,x in v.get('districts',{}).items():
            for n_ in x.get('system_notes') or []:
                sn[s]+=1;notes.setdefault(s,e(dn)+': '+e(n_['note'][:260])+'…')
    M.append({'n':'System notes in the ledger','vals':dict(sn),'fmt':{k:f'{v} notes' for k,v in sn.items()},'note':'structural and delivery notes in the district ledger'})
    en=Counter(c['state'] for c in j('encroachment-cases.json')['cases']);M.append({'n':'Built-on-water cases','vals':dict(en),'fmt':{k:f'{v} ruled cases' for k,v in en.items()},'note':'cases ruled on by a court, the NGT or the CAG'})
    nw=Counter()
    for x in A['news']: nw[x['st']]+=x['c']
    M.append({'n':'News items gathered','vals':dict(nw),'fmt':{k:f'{v} items' for k,v in nw.items()},'note':'gathered and awaiting approval'})
    data=json.dumps({'metrics':M,'notes':notes,'links':{n:stid(n) for n in STN}},ensure_ascii=False).replace('</','<\\/')
    c=j('coverage.json')['totals']
    ch=f'<div class="mapgrid" data-choro data-r><script type="application/json">{data}</script><div><div class="chips" role="group" aria-label="Colour the map by"></div><svg class="mapsvg" role="group" aria-label="Map of India by state, selectable"></svg><div class="legend"></div></div><div><div class="detail" aria-live="polite"><p class="k">Nothing selected</p><h3>Select a state</h3><p class="p">Each state opens every measure the atlas holds for it. A blank is a gap, not a zero.</p></div><p class="note">On "corruption": the atlas holds no corruption score and does not make one. What it holds are documents: delays, audits and freezes on record, issues cited against an office, and notes in the ledger. Those counts are deepest where research has gone deepest (West Bengal, Bihar), so a dark state may simply be an unresearched one. {FNOTE}</p></div></div>'
    return sec('Money, and the record beside *it*',ch,sub='State view')+sec('How deep the frame *goes*',tiles([(c['districts'],'districts in the frame'),(c['bands']['deep'],'proven deeply'),(c['bands']['partial'],'partly proven'),(c['bands']['baseline'],'baseline only, gaps marked',True)]),sub='District coverage')+gateway('money-map.html','the district-level map with drill-down')

sys.path.insert(0,HERE)
import temples as TP, math
def sid(s): return 'site-'+re.sub(r'[^a-z0-9]+','-',s['id'].lower()).strip('-')+'.html'
def stid(n): return 'state-'+re.sub(r'[^a-z0-9]+','-',n.lower()).strip('-')+'.html'
HID={s['name']:s for s in HS}
_hpt=hpt
def hpt(x):
    r=_hpt(x);s=HID.get(x['n'])
    if s: r['rows'].append(['Record',f'<a href="{sid(s)}">Open the full record</a>'])
    return r
def proj(lat,lon): return [round((lon-64)*math.cos(math.radians(22))*20,1),round((38.6-lat)*20,1)]
def inframe(s): return s.get('lat') is not None and 64<=s['lng']<=99 and 5.5<=s['lat']<=38.6
@page('temple-forms.html')
def _():
    out=''
    for key,fn,name,view,blurb in TP.PLATES:
        v=TD[key];sites=[s for s in HS if s.get('architecture_type')==key]
        links=''.join(f'<a href="{sid(s)}">{e(s["name"])}</a>' for s in sites[:14])+(f'<a href="heritage-atlas.html">and {len(sites)-14} more</a>' if len(sites)>14 else '')
        out+=f'<article class="tplate" data-r><header><div><p class="k">{e(view)} · {e(v.get("built",""))}</p><h2>{e(name)}: {e(v["example"])}</h2></div></header><div class="dw">{fn(v)}</div><div class="tx"><div><p>{e(blurb)}</p><p>{e(v.get("notes",""))}</p><p>Source: {src(v.get("source"))}</p></div><div><p class="sub">{len(sites)} sites in the atlas built this way</p><div class="links">{links or GAP}</div></div></div></article>'
    cs=[]
    for k,v in TD.items():
        if k in [p[0] for p in TP.PLATES]: continue
        dims=[(kk.replace('_m',' (m)').replace('_',' '),e(vv if not isinstance(vv,list) else ' × '.join(map(str,vv)))) for kk,vv in v.items() if kk not in('example','built','notes','source','real_scan','curve_exponent','taper') and vv is not None and not isinstance(vv,(dict,bool))]
        cs.append(card(e(k.replace('_',' '))+' · '+e(v.get('built','')),v['example'],f'<p>{e(v.get("notes",""))}</p>'+kv(dims+[('Source',src(v.get('source')))])))
    return sec('',out+'<p class="note" data-r>Blue figures are measurements from the atlas file. Everything else in a drawing is schematic: the order and names of the parts are standard, but profiles, ornament and any dimension marked indicative are not measured. Where the file gives no metres (Martand, Ranakpur), the drawing is a labelled plan with counts only. The Brihadisvara height is given as 60 to 66 m across sources; the file value is used. Konark\'s tower collapsed, so it is dashed and its height is an estimate.</p>')+sec('The same idea, *elsewhere*',cards(cs),sub=f'{len(cs)} forms from other lands, for comparison')+gateway('temple-forms.html','the 3D models built to these proportions')
_old_ha=PAGES['heritage-atlas.html']
@page('heritage-atlas.html')
def _():
    h=_old_ha()
    for s in HS: h=h.replace(f'<tr><td class="">{e(s["name"])}</td>',f'<tr><td class=""><a href="{sid(s)}">{e(s["name"])}</a></td>',1)
    return h
EXTRA=[]
def site_pages():
    for s in HS:
        d=s.get('destruction') or {};p=d.get('primary') or {}
        rows=[('Tradition',e((s.get('tradition') or '').replace('_',' '))),('Dedicated to',e(s.get('deity'))),('Where',e(', '.join(filter(None,[s.get('state'),s.get('region')])))),('Built by',e(s.get('builder'))),('Built',yr(s.get('built_from'))+(' to '+yr(s['built_to']) if s.get('built_to') and s['built_to']!=s.get('built_from') else '')),('Form',f'<a href="temple-forms.html">{e(s["architecture_type"].replace("_"," "))}</a>' if s.get('architecture_type') else ''),('Today',e((s.get('status') or '').replace('_',' '))),('Series',e(', '.join(s.get('series') or [])))]
        body=sec('The *record*',f'<div data-r>{kv(rows)}</div><p class="p" data-r style="margin-top:18px">{e(s.get("lifespan_note",""))}</p>',sub='What the atlas holds')
        if p:
            later=''.join(f'<li><span class="d">{yr(l.get("year"))}</span><b>{e(l.get("actor",""))}</b><p>{e(l.get("actor_role",""))}</p></li>' for l in d.get('later',[]))
            body+=sec('What happened to *it*',f'<article class="rail" data-r><ol><li><span class="d">{yr(p.get("year"))}</span><b>{e(p.get("actor",""))}</b><p>{e(p.get("actor_role",""))}. {e(p.get("account",""))}</p>{f"<p><span class=chip>estimate</span> {e(p.get(chr(116)+chr(111)+chr(108)+chr(108)+chr(95)+chr(110)+chr(111)+chr(116)+chr(101)))}</p>" if p.get("toll_note") else ""}</li>{later}</ol></article><p class="note" data-r>Accounts and tolls from medieval chronicles are estimates with wide spread among historians. The atlas records damage by every actor on record.</p>',sub='Recorded damage')
        if inframe(s):
            pt={'p':proj(s['lat'],s['lng']),'r':6,'h':e(s['name']),'k':'This site','rows':[['Where',e(s.get('state') or '')]]}
            near=sorted([o for o in HS if o is not s and inframe(o)],key=lambda o:(o['lat']-s['lat'])**2+(o['lng']-s['lng'])**2)[:8]
            body+=sec('On the *ground*',mapb([{'n':'This site','c':'#f0b429','pts':[pt]},{'n':'Nearest sites','c':'#6fb7c9','pts':[{'p':proj(o['lat'],o['lng']),'h':e(o['name']),'k':'Nearby','rows':[['Record',f'<a href="{sid(o)}">Open</a>']]} for o in near]}]),sub='Location')
            body+=sec('Keep *going*','<div data-r>'+''.join(f'<a class="btn" href="{sid(o)}">{e(o["name"])}</a>' for o in near)+(f'<a class="btn solid" href="{stid(s["state"])}">{e(s["state"])}, the state</a>' if s.get('state') in STN else '')+'</div>',sub='Nearest sites')
        body+=sec('',f'<p class="p" data-r>Sources: '+', '.join(src(x.get('label'),x.get('url'),x.get('tier')) for x in s.get('source',[]))+'</p>')
        EXTRA.append((sid(s),0,s['name'],'Story · Sacred site',e((s.get('lifespan_note') or '')[:200]),'',body,f'<a href="index.html">Home</a> / <a href="story.html">Story</a> / <a href="heritage-atlas.html">Temples and sacred ground</a> / {e(s["name"])}'))
STN=[s['n'] for s in A['states']]
def spark(series,cols):
    mx=max(max(v) for v in series.values());n=len(next(iter(series.values())))
    return '<svg class="spark" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+''.join(f'<path stroke="{cols[k]}" d="M'+'L'.join(f'{i*100/(n-1):.1f} {100-v/mx*96:.1f}' for i,v in enumerate(vs))+'"/>' for k,vs in series.items())+'</svg>'
def state_pages():
    offs=j('officials.json')['officials'];enc=j('encroachment-cases.json')['cases'];yl=FI['_meta']['yearLabels']
    for n in STN:
        s=FI['states'].get(n);body=(HELDSEC if ('Kashmir' in n or 'Ladakh' in n) else '');lede=f'Everything the atlas holds for {n}, in one place. A blank is a gap, not a zero.'
        if s:
            back=s['devolution'][-1]+s['grants'][-1]
            body+=sec('The *money*',tiles([(s['gsdp'][-1],'state output, ₹ thousand crore, FY24'),(s['contribution'][-1],'pays in, estimated'),(round(back,1),'gets back: devolution plus grants'),(round(back/s['contribution'][-1],2),'back per ₹1 paid in')])+'<div data-r style="margin-top:18px">'+spark({'c':s['contribution'],'b':[a+b for a,b in zip(s['devolution'],s['grants'])]},{'c':'#f0b429','b':'#6fb7c9'})+'<p class="note">Gold: paid in. Blue: received back. FY15 to FY24.</p></div>'+table([('Year',0),('GSDP',1),('Own tax',1),('Devolution',1),('Grants',1),('Pays in (est.)',1)],[[yl[i]]+[(num(s[k][i],1),s[k][i]) for k in('gsdp','ownTax','devolution','grants','contribution')] for i in range(len(yl))],filt=False)+f'<p class="note" data-r>{FNOTE}</p>',sub=f'{e(s.get("capital",""))} · {e(s.get("region",""))} · {s.get("pop_cr","")} crore people')
            body+=sec('Two sides of the *ledger*',f'<div class="pc" data-r><div class="card in"><p class="k">Strengths on record</p><ul>{"".join(f"<li>{e(x)}</li>" for x in s.get("pros",[]))}</ul></div><div class="card in"><p class="k">Strains on record</p><ul>{"".join(f"<li>{e(x)}</li>" for x in s.get("cons",[]))}</ul></div></div><p class="note" data-r>These summaries are the atlas\'s own analysis, kept apart from the sourced figures above.</p>',sub='Commentary, labelled')
        else: body+=sec('The *money*',f'<p class="p" data-r>No fiscal series for {e(n)} in the atlas yet. {GAP}</p>')
        ev=[x for x in FE['fiscal_events'] if x['geo'].get('state')==n]
        if ev: body+=sec('On the *record*',table([('Date',0),('Stage',0),('What happened',0),('Where',0),('Source',0)],[[e(x['date']),e(x['stage']),e(x['title']),e(x['geo'].get('district') or ''),src((x.get('primary_source') or {}).get('title'),(x.get('primary_source') or {}).get('url'),(x.get('primary_source') or {}).get('source_tier'))] for x in sorted(ev,key=lambda x:x['date'],reverse=True)],filt=False)+'<div data-r><a class="btn" href="news-journey.html">The stories behind these</a></div>',sub=f'{len(ev)} fiscal events')
        of=[o for o in offs if o['current_post']['state']==n]
        if of: body+=sec('Who *answers*',table([('Office-holder',0),('Post',0),('Place',0),('Cited issues',1)],[[e(o['name']),e(o['current_post']['post']),e(o['current_post']['place']),(len(o.get('issues',[])),len(o.get('issues',[])))] for o in of],filt=False),sub='From the officials register')
        notes=[(dn,x) for dn,v in (LG.get(n,{}).get('districts') or {}).items() for x in (v.get('system_notes') or [])]
        if notes: body+=sec('Notes in the *ledger*',cards([card(e(dn)+' · '+e((x.get('kind') or '').replace('_',' ')),dn,f'<p>{e(x["note"])}</p>',src('source',x.get('source'),x.get('source_tier'))) for dn,x in notes]),sub=f'{len(notes)} system notes')
        en=[c for c in enc if c['state']==n]
        if en: body+=sec('Built where water *returns*',cards([card(e(c['district'])+' · '+e(c['year']),c['water_body'] or c['district'],f'<p>{e(c["detail"])}</p>') for c in en]),sub=f'{len(en)} ruled cases')
        hs=[x for x in HS if x.get('state')==n]
        if hs: body+=sec('Sacred *ground*','<div data-r>'+''.join(f'<a class="btn" href="{sid(x)}">{e(x["name"])}</a>' for x in hs)+'</div>',sub=f'{len(hs)} sites')
        nw=sum(x['c'] for x in A['news'] if x['st']==n)
        body+=sec('In the *news*',f'<p class="p" data-r>{nw} gathered items are tied to places in {e(n)}. None is approved for display yet. {GAP}</p><div data-r><a class="btn" href="feed.html">Outlets and bias</a></div>')
        EXTRA.append((stid(n),1,n,'Discover · State',lede,'',body,f'<a href="index.html">Home</a> / <a href="discover.html">Discover</a> / <a href="money-map.html">The money map</a> / {e(n)}'))
_old_soi=PAGES['state-of-india.html']
@page('state-of-india.html')
def _():
    h=_old_soi()
    for n in FI['states']: h=h.replace(f'<tr><td class="">{e(n)}</td>',f'<tr><td class=""><a href="{stid(n)}">{e(n)}</a></td>',1)
    return h
_old_feed=PAGES['feed.html']
@page('feed.html')
def _():
    steps=[('Step 1 · feeds.json','A registry of sources','Each outlet is listed with its feed address, language, type and a lean taken from a published third-party assessment. Where none exists, the lean is "unknown".'),('Step 2 · ingest_news.py','Gather link and snippet','The script reads each RSS feed and stores the headline, link, date and a short snippet. It never stores article text. It tags a state and district where the text names one.'),('Step 3 · curate.html','A person approves','Every item waits as "pending". A curator confirms the place tag and approves or rejects it.'),('Step 4 · apply_curation.py','Publish the approved set','Approved items are written to approved-news.json, the only news file public pages read.'),('Step 5 · the pages','Read static files','Pages fetch small JSON files. There is no server: the "API" is the set of files in the repository, rebuilt on a schedule.')]
    gn=[('Cluster','Group items about the same event','Match headlines across outlets and languages into one story.'),('Count the lean','Show who covered it','For each story, a bar of outlets by published lean: left, centre, right, state, unassessed.'),('Blindspot','Flag one-sided coverage','A story carried almost only by one side is marked, so a reader sees what the other side did not run.'),('Anchor','Tie it to the record','Link the story to its fiscal event and source document, so framing sits beside fact.')]
    return _old_feed()+sec('How the news reaches a *page*',cards([card(k,t,f'<p>{b}</p>') for k,t,b in steps]),sub='The pipeline in the repository')+sec('The coverage view, story by *story*',cards([card(k,t,f'<p>{b}</p>') for k,t,b in gn])+f'<p class="note" data-r>This is the comparison view the News Journey is designed around. It needs two things the data does not have yet: approved items, and items grouped into stories. Until then it would be invented, so it is described here, not drawn. {GAP}</p>',sub='Not built yet')

def _dp(pts,tol):
    if len(pts)<3: return pts
    keep=[False]*len(pts);keep[0]=keep[-1]=True;st=[(0,len(pts)-1)]
    while st:
        a,b=st.pop();ax,ay=pts[a];bx,by=pts[b];dx,dy=bx-ax,by-ay;L=math.hypot(dx,dy) or 1e-9;m=0;mi=-1
        for i in range(a+1,b):
            dd=abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/L
            if dd>m:m=dd;mi=i
        if m>tol: keep[mi]=True;st+=[(a,mi),(mi,b)]
    return [p for p,k in zip(pts,keep) if k]
def held_areas():
    d=json.load(open(HERE+'inputs/disputed.geojson'));out=[]
    S1='Lok Sabha Unstarred Question 1740, Ministry of External Affairs, 27 July 2016';U1='https://eparlib.sansad.in/bitstream/123456789/684696/1/37339.pdf'
    S2='Lok Sabha Unstarred Question 2793, Ministry of External Affairs, 11 August 2010';U2='https://eparlib.nic.in/bitstream/123456789/587628/1/91572.pdf'
    info={'P':('Pakistan-administered Jammu and Kashmir','Pakistan','since 1947 to 1948','approximately 78,000 sq km in all (both shaded parts together)','Called Pakistan-occupied Kashmir by India; Pakistan calls its two parts Azad Jammu and Kashmir and Gilgit-Baltistan.',S1,U1),
          'C':('Aksai Chin','China','since the 1950s; held after the 1962 war','approximately 38,000 sq km','In the Union Territory of Ladakh on India\'s map; China administers it as part of Xinjiang and Tibet.',S2,U2),
          'S':('Shaksgam Valley','China','ceded by Pakistan to China in 1963','5,180 sq km','Handed over under the 1963 China-Pakistan boundary agreement, which India calls illegal and invalid.',S2,U2)}
    for f in d['features']:
        nb=f['properties'].get('NOTE_BRK') or ''
        k='S' if 'Ceded to China' in nb else 'P' if nb.startswith('Admin. by Pakistan; Claimed by India') else 'C' if nb.startswith('Admin. by China; Claimed by India') else None
        if not k: continue
        gm=f['geometry'];polys=gm['coordinates'] if gm['type']=='MultiPolygon' else [gm['coordinates']];dd=''
        for p in polys:
            pts=[tuple(proj(c[1],c[0])) for c in p[0]];m=max(range(len(pts)),key=lambda i:math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]));q=_dp(pts[:m+1],.25)+_dp(pts[m:],.25)[1:]
            if len(q)>3: dd+='M'+'L'.join(f'{a:.1f} {b:.1f}' for a,b in q)+'Z'
        n,by,since,area,note,sn,su=info[k]
        out.append({'n':n,'k':k,'d':dd,'rows':[['Administered by',by],['Since',since],['Area, as stated by India',area],["India's position",'The Government of India states that this is Indian territory under illegal occupation and does not recognise it.'],['Also known as',note],['Source for the figures and position',src(sn,su,1)],['Outline','Natural Earth, public domain; approximate lines of actual control']]})
    return out
HELD=held_areas()
HELDSEC=sec("India's territory under other *control*",'<div class="tiles">'+''.join(f'<div class="tile" data-r><b>{a}</b><span>{l}</span></div>' for a,l in [('78,000','sq km, approximately, administered by Pakistan'),('38,000','sq km, approximately, administered by China in Aksai Chin'),('5,180','sq km in the Shaksgam Valley, ceded by Pakistan to China in 1963')])+'</div><p class="p" data-r style="margin-top:16px">India\'s official map includes the whole of Jammu and Kashmir and Ladakh. Parts of both are administered by Pakistan and by China. The Government of India has told Parliament repeatedly that these areas are Indian territory under illegal occupation, and that it has never recognised the 1963 China-Pakistan boundary agreement. Pakistan and China dispute this: Pakistan claims the former princely state, and China claims Aksai Chin. The hatched areas on every map in this atlas mark them; select one to read the record.</p><p class="note" data-r>Figures and position: '+src('Lok Sabha Unstarred Question 1740, 27 July 2016','https://eparlib.sansad.in/bitstream/123456789/684696/1/37339.pdf',1)+' and '+src('Lok Sabha Unstarred Question 2793, 11 August 2010','https://eparlib.nic.in/bitstream/123456789/587628/1/91572.pdf',1)+'. Outlines are from Natural Earth and are approximate; they are not survey lines.</p>',sub='Stated by the Government of India in Parliament')

def district_block():
    norm=lambda s:re.sub(r'[^a-z]','',s.lower())
    pop={(norm(st),norm(dn)):v for st,ds in j('district-pop.json')['states'].items() for dn,v in ds.items()}
    from collections import Counter as _C
    _c=_C(k[1] for k in pop);byd={k[1]:v for k,v in pop.items() if _c[k[1]]==1}
    geo=[];M={k:{} for k in 'pop lit flood imr inc'.split()};F={k:{} for k in M};notes={}
    for fn in sorted(os.listdir(R+'districts')):
        for f in (json.load(open(R+'districts/'+fn)).get('features') or []):
            pr=f['properties'];stn,dn=pr['STATE'],pr['DISTRICT'];key=dn+', '+stn
            gm=f['geometry'];polys=gm['coordinates'] if gm['type']=='MultiPolygon' else [gm['coordinates']];d=''
            for p in polys:
                pts=[tuple(proj(c[1],c[0])) for c in p[0]]
                if len(pts)<8: continue
                m=max(range(len(pts)),key=lambda i:math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]))
                q=_dp(pts[:m+1],.5)+_dp(pts[m:],.5)[1:]
                if len(q)>=4: d+='M'+'L'.join(f'{a:.1f} {b:.1f}' for a,b in q)+'Z'
            if not d: continue
            geo.append({'n':key,'d':d})
            pv=pop.get((norm(stn),norm(dn))) or byd.get(norm(dn))
            if pv: M['pop'][key]=pv['population'];F['pop'][key]=f"{pv['population']:,} (Census 2011)";lr=round(pv['literate']/pv['population']*100,1);M['lit'][key]=lr;F['lit'][key]=f'{lr}% of all residents'
            dm=((LG.get(stn) or {}).get('districts') or {}).get(dn,{}).get('dimensions') or {}
            fl=(dm.get('geography') or {}).get('flood_level')
            if fl: M['flood'][key]={'district-chronic':2,'state-flood-prone':1}.get(fl,0);F['flood'][key]=fl.replace('-',' ')
            h=dm.get('health') or {}
            if h.get('imr') is not None: M['imr'][key]=h['imr'];F['imr'][key]=f"{h['imr']} per 1,000 births (state figure, NFHS-5)"
            ec=dm.get('economy') or {}
            if ec.get('percapita_nsdp_inr'): M['inc'][key]=ec['percapita_nsdp_inr'];F['inc'][key]=f"₹{ec['percapita_nsdp_inr']:,} a year (state figure, RBI)"
            sn=((LG.get(stn) or {}).get('districts') or {}).get(dn,{}).get('system_notes') or []
            if sn: notes[key]=e(sn[0]['note'][:300])+'…'
    open(OUT+'js/districts.js','w').write('window.DIST='+json.dumps(geo,ensure_ascii=False,separators=(',',':'))+';')
    names={'pop':('People','Census 2011, district level'),'lit':('Literate share','Census 2011; share of all residents, not the official 7+ literacy rate'),'flood':('Flood exposure','named as chronically flooded, state-level flag only, or not flagged'),'imr':('Infant mortality','state figure applied to each district; district figures are a gap'),'inc':('Income per person','state figure applied to each district; no official district series')}
    data=json.dumps({'geo':'DIST','kind':'District','metrics':[{'n':names[k][0],'vals':M[k],'fmt':F[k],'note':names[k][1]} for k in M],'notes':notes,'links':{}},ensure_ascii=False).replace('</','<\\/')
    return len(geo),f'<div class="mapgrid" data-choro data-r><script type="application/json">{data}</script><div><div class="chips" role="group" aria-label="Colour the map by"></div><svg class="mapsvg" role="group" aria-label="Map of India by district, selectable"></svg><div class="legend"></div></div><div><div class="detail" aria-live="polite"><p class="k">Nothing selected</p><h3>Select a district</h3><p class="p">Each district opens what the atlas holds for it. A blank is a gap, not a zero.</p></div><p class="note">Boundaries are simplified from the atlas district files. Two measures are true district figures (people, literate share). Health and income are state figures repeated across a state\'s districts, as the ledger records them, so those maps change only at state borders.</p></div></div>'
_old_mm=PAGES['money-map.html']
@page('money-map.html')
def _():
    n,blk=district_block()
    return sec('Every *district*',blk,sub=f'{n} districts')+HELDSEC+_old_mm().replace('<script src','<script src')

import shutil
ORIGMAP={'design-system.html':'design-system.html','indic-design-systems.html':'indic-design-systems.html','tribes.html':'tribes.html','social-fabric.html':'social-fabric.html'}
DSORIG={'ds-chola.html':'ds-chola.html','ds-gupta.html':'ds-gupta.html','ds-rajput.html':'ds-rajput.html','ds-mauryan.html':'design-system.html'}
def embed(o,what='The reference, as *built*'):
    if not os.environ.get('EMBED'): return ''
    return sec(what,f'<iframe class="emb" data-r src="orig/{o}?embed=1" title="The original atlas page, embedded" loading="lazy"></iframe><div data-r><a class="btn" href="orig/{o}">Open it on its own</a></div>',sub='From the existing atlas',p='This is the page already built in the repository, running here unchanged.')
def copy_orig():
    os.makedirs(OUT+'orig/assets/fonts/noto',exist_ok=True);os.makedirs(OUT+'orig/vendor/fonts',exist_ok=True)
    fs=set(ORIGMAP.values())|set(DSORIG.values())|{'styles.css','ds-page.css','ds-motion.css','theme-mauryan.css','theme-gupta.css','theme-chola.css','theme-rajput.css','site-nav.js','nav-data.js','a11y.js','ds-page.js','motion.js','interactions.js','auto-reveal.js','ambient-sound.js','command-palette.js','mauryan-icons.svg','favicon.svg'}
    n=0
    for f in fs:
        if os.path.exists(R+f): shutil.copy(R+f,OUT+'orig/'+f);n+=1
    for d in ('assets/fonts','assets/fonts/noto','vendor/fonts'):
        for f in os.listdir(R+d):
            if os.path.isfile(R+d+'/'+f) and f.rsplit('.',1)[-1] in('woff2','css','json'): shutil.copy(R+d+'/'+f,OUT+'orig/'+d+'/'+f);n+=1
    return n

import dsys as DS
def slugn(n): return re.sub(r'[^a-z0-9]+','-',n.lower()).strip('-')
HER=[('Mauryan','theme-mauryan.css','stone and sky','c. 322 to 185 BCE'),('Gupta','theme-gupta.css','sandstone and fresco','c. 320 to 550 CE'),('Chola','theme-chola.css','bronze, granite and ash','9th to 13th century'),('Rajput','theme-rajput.css','sandstone, mirror and miniature','8th to 18th century')]
def her_band(fn):
    s=open(R+fn).read();seen={};
    for n,c in re.findall(r'--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b',s):
        if n in('background','foreground','card','surface','surface-2','muted','muted-foreground','accent-ink','accent-tint','info','border','input','ring') or n in seen or c.lower() in [v.lower() for v in seen.values()]: continue
        seen[n]=c
    hd=s[s.find('/*')+2:s.find('REVERSIBLE')];hd=re.sub(r'Sources?:.*','',hd,flags=re.S);hd=re.sub(r'^\s*theme-\w+\.css\s*—\s*','',hd.strip());hd=re.sub(r'Author:\s*\w+\.\s*','',hd)
    return [(c,n.replace('-',' ')) for n,c in list(seen.items())[:8]],' '.join(hd.split())
DSCARDS=[]
def ds_pages():
    for t in TR:
        h,r=DS.system(t['name'],t['region'],t['tagline'],t['band'],f'<p>{t["history"]}</p><p>{t["ideas"]}</p>',t['script'],t['family'],t['fonts'],DS.motif(t['name'].split(' /')[0],t['band'],DS.roles(t['band'])))
        f='ds-'+slugn(t['name'])+'.html';DSCARDS.append(('tribe',f,t['name'],t['tagline'],t['region'],t['band'],r))
        EXTRA.append((f,2,t['name'],'Peoples · Folk design system',e(t['tagline'][0].upper()+t['tagline'][1:])+'. Palette, script, type, pattern and components, read as one system.','',sec('',h)+sec('',f'<div data-r><a class="btn" href="tribes.html">All folk systems</a><a class="btn" href="languages.html">The language families</a></div>'),f'<a href="index.html">Home</a> / <a href="words.html">Peoples</a> / <a href="tribes.html">The tribes that made it</a> / {e(t["name"])}'))
    for n,fn,tag,when in HER:
        band,hd=her_band(fn);h,r=DS.system(n,when,tag,band,f'<p>{e(hd)}</p>',None,'','Fraunces display, Instrument Serif accent, Inter text, JetBrains Mono labels')
        f='ds-'+slugn(n)+'.html';DSCARDS.append(('heritage',f,n,tag,when,band,r))
        EXTRA.append((f,2,n,'Peoples · Heritage design system',e(tag[0].upper()+tag[1:])+'. The palette and tokens of the '+e(n)+' register, from the atlas theme file.','',sec('',h)+embed(DSORIG[f],'The full reference, as *built*')+sec('',f'<div data-r><a class="btn" href="design-systems.html">All heritage systems</a></div>'),f'<a href="index.html">Home</a> / <a href="words.html">Peoples</a> / <a href="design-systems.html">India by design systems</a> / {e(n)}'))
ds_pages()
def syscards(kind): return '<div class="sysgrid">'+''.join(f'<a class="sysc" data-r href="{f}" style="--pg:{r[0]};--pi:{r[1]};--pa:{r[2]}"><div class="band">{"".join(f"<i style=background:{c}></i>" for c,_ in band)}</div><div class="t"><h3>{e(n)}</h3><p>{e(tag)}</p><small>{e(reg)}</small></div></a>' for k,f,n,tag,reg,band,r in DSCARDS if k==kind)+'</div>'
OTHERS=['Pithora (Rathwa)','Sohrai and Khovar','Santhal jadupatua','Toda embroidery','Kurumba','Cheriyal scrolls','Phad','Kalighat','Kalamkari','Chittara','Aipan','Lanjia Saura idital','Naga textiles','Mata ni Pachedi','Rogan','Tholu Bommalata']
@page('tribes.html')
def _():
    return sec('Six systems, each its *own*',syscards('tribe'),sub='Open a tribe',p='Each tradition is read the way a design system is read: pigments as tokens, repeating marks as atoms, and the way they fill a wall as grammar.')+sec('Known, not yet *researched*','<div class="chips" data-r>'+''.join(f'<span class="chip">{e(o)}</span> ' for o in OTHERS)+'</div><p class="note" data-r>These living traditions are not in the atlas yet. Each needs its pigments, script and history sourced before it gets a plate; until then it is a named gap, not an invented palette.</p>',sub=f'{len(OTHERS)} more traditions')+gateway('tribes.html','the original plates')
@page('design-systems.html')
def _():
    return sec('Four heritages, one *chassis*',syscards('heritage'),sub='Open a system',p='The same token contract with different values: each dynasty\'s materials become a skin for the whole atlas.')+sec('And six from the *people*',syscards('tribe'),sub='Folk systems')+gateway('design-systems.html','the deck of state skins')

ST=json.load(open(HERE+'inputs/stories.json'))
_feed2=PAGES['feed.html']
@page('feed.html')
def _():
    data=json.dumps(ST,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    blk=f'<div data-stories data-r><script type="application/json">{data}</script><p class="banner"><b style="color:#e6a35a">Gathered automatically, not yet reviewed by a person.</b> Stories are grouped by matching headlines, so a few groupings will be wrong. Each line links to the outlet\'s own page; no article text is stored. Lean is the outlet\'s published third-party rating, not a judgement on the story.</p><div class="nbar"><input type="search" placeholder="Search stories, places or outlets" aria-label="Search stories"><select name="bias" aria-label="Filter by coverage"><option value="">All coverage</option><option value="bl">Any blindspot</option><option value="L">Blindspot for the left</option><option value="R">Blindspot for the right</option><option value="all3">Covered left, centre and right</option><option value="chain">Ongoing stories</option></select><select name="month" aria-label="Filter by month"><option value="">Any month</option></select><select name="sort" aria-label="Sort"><option value="new">Newest first</option><option value="big">Most outlets first</option></select></div><p class="count"></p><div class="stories" style="margin-top:12px"></div></div>'
    rest=_feed2()
    return sec('The same story, from every *side*',blk+f'<p class="note" data-r>{ST["clusters"]} stories were carried by three or more independent outlets among {ST["total"]:,} gathered items, up to {ST["gen"]}; the {len(ST["stories"])} newest and widest are here. Outlets under one owner count once. Only English items are grouped so far; Hindi, Marathi, Telugu, Tamil and Bengali grouping is a gap. Left counts left and centre-left; right counts centre-right and right.</p>',sub='Coverage, story by story')+rest.split('<div id="bias"></div>')[1].split('<section class="b"><div class="wrap"><p class=sub data-r>Not built yet')[0].replace('<section class="b"><div class="wrap"><p class=sub data-r>Coverage by published lean','<div id="bias"></div><section class="b"><div class="wrap"><p class=sub data-r>Coverage by published lean',1)

for _f,_o in (ORIGMAP.items() if os.environ.get('EMBED') else []):
    PAGES[_f]=(lambda fn,o:lambda:re.sub(r'<section class="b"><div class="wrap"><p class=sub data-r>Open it</p>.*?</section>','',fn(),flags=re.S)+embed(o))(PAGES[_f],_o)

ALLF={p[0].split('#')[0] for d in DOORS for p in d[4]}|{d[3] for d in DOORS}|{'index.html'}
NAVJS=json.dumps([{'l':l,'q':q,'i':i,'h':h,'p':[[a,b,c] for a,b,c in ps]} for l,q,i,h,ps in DOORS],ensure_ascii=False)
idx=open(HERE+'inputs/index.source.html').read()
SPRITE=re.search(r'<svg class="sprite"[^>]*><defs>(.*?)</defs></svg>',idx,re.S).group(1).replace('\n','')
os.makedirs(OUT+'js',exist_ok=True);os.makedirs(OUT+'css',exist_ok=True)
open(OUT+'js/nav.js','w').write('window.NAV='+NAVJS+';window.SPRITE='+json.dumps(SPRITE)+';')
open(OUT+'js/base.js','w').write('window.BASE='+json.dumps({'states':A['states'],'rivers':A['rivers'],'dim':A['dim'],'held':HELD},ensure_ascii=False,separators=(',',':'))+';')
open(OUT+'js/site.js','w').write(open(HERE+'js/site.js').read());open(OUT+'css/site.css','w').write(open(HERE+'css/site.css').read())
if os.path.exists(HERE+'js/webgl.js'): open(OUT+'js/webgl.js','w').write(open(HERE+'js/webgl.js').read())
# our Indic skin stylesheets (the 9-skin theme system) — copied from the repo root so the
# skin switcher can reskin every generated page. site.css bridges --bg/--ink/… → --background/
# --foreground/… which these set, so one component set reskins across all skins.
for _t in ('theme-mauryan.css','theme-gupta.css','theme-chola.css','theme-rajput.css'):
    if os.path.exists(R+_t): shutil.copy(R+_t, OUT+'css/'+_t)
# the 6 NEW state skins (Kashmir/Tamil/Kerala/Assam/Naga/Rajasthan) — generated from the
# canvas Skin pages' palettes into theme-<state>.css so the switcher becomes 15 skins.
try:
    from gen_state_skins import write_state_skins
    STATE_SKIN_SLUGS = write_state_skins(OUT+'css')
except Exception as _e:
    STATE_SKIN_SLUGS = []
_THEME_LINKS = ''.join(f'<link rel="stylesheet" href="css/theme-{s}.css">' for s in ('mauryan','gupta','chola','rajput')+tuple(STATE_SKIN_SLUGS))
FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+Devanagari&family=Noto+Sans+Bengali&family=Noto+Sans+Gurmukhi&family=Noto+Sans+Gujarati&family=Noto+Sans+Oriya&family=Noto+Sans+Tamil&family=Noto+Sans+Telugu&family=Noto+Sans+Kannada&family=Noto+Sans+Malayalam&family=Noto+Sans+Sinhala&family=Noto+Sans+Brahmi&family=Noto+Sans+Grantha&display=swap" rel="stylesheet">'
def shell(f,di,title,kick,lede,how,body,crumb,nextprev=''):
    plain=re.sub(r'\*','',title)
    hasmap='data-map' in body or 'data-choro' in body
    return f'''<!DOCTYPE html>
<html lang="en" class="theme-mauryan theme-dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script>/* apply the remembered Indic skin before paint (no flash) */(function(){{try{{var s=localStorage.getItem('bh_skin');if(s)document.documentElement.className=s;}}catch(e){{}}}})();</script>
<title>{e(plain)} · Bharat</title><meta name="description" content="{e(re.sub("<[^>]+>","",lede)[:155])}">
<link rel="canonical" href="{LIVE}{f}"><meta property="og:title" content="{e(plain)} · Bharat"><meta property="og:description" content="{e(re.sub('<[^>]+>','',lede)[:155])}"><meta property="og:type" content="article"><meta property="og:site_name" content="Bharat"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@type':'WebPage','name':plain,'isPartOf':{'@type':'WebSite','name':'Bharat','url':LIVE},'breadcrumb':{'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':n} for i,n in enumerate(re.sub('<[^>]+>','',crumb).split(' / '))]}})}</script>
{FONTS}<link rel="stylesheet" href="css/site.css">{_THEME_LINKS}</head>
<body data-door="{di}">
<main><div class="wrap"><p class="crumb">{crumb}</p>
<div class="hero"><div><p class="kick"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#{DOORS[di][2]}"/></svg>{e(kick)}</p><h1>{h1(title)}</h1><p class="lede">{lede}</p></div>{f'<div class="how" data-r><b>How we know</b>{how}</div>' if how else '<div></div>'}</div><div class="rule"></div></div>
{body}
<div class="wrap">{nextprev}</div></main>
<script src="js/nav.js"></script>{'<script src="js/base.js"></script>' if hasmap else ''}{'<script src="js/districts.js"></script>' if 'DIST' in body else ''}<script src="js/site.js"></script><script defer src="js/webgl.js"></script>
</body></html>'''

# ---- CANVAS IMPORT: wrap an imported .dc.html fragment (which supplies its OWN hero) in our
# chrome WITHOUT the generated hero, so there's no double hero. Same head/skins/WebGL as shell().
def canvas_body(slug):
    """Return an imported canvas fragment, link-rewritten to our site + de-chromed."""
    frag = load_canvas(slug)
    # rewrite the canvas's internal links to our real pages
    frag = frag.replace('Main.dc.html', 'index.html')
    frag = re.sub(r'([A-Za-z][A-Za-z0-9-]*)\.dc\.html', lambda m: _canvas_route(m.group(1)), frag)
    return frag

# map a canvas filename (sans .dc.html) → the site page we emit it as
_CANVAS_ROUTE = {'States':'discover.html','Tribes':'tribes.html','Tribes-India':'tribes-india.html',
                 'Kingdoms':'kingdoms.html','DesignSystem':'design-system.html'}
def _canvas_route(name):
    if name in _CANVAS_ROUTE: return _CANVAS_ROUTE[name]
    if name.startswith('Tribe-'): return 'tribe-'+name[6:].lower()+'.html'
    if name.startswith('Region-'): return 'region-'+name[7:].lower()+'.html'
    if name.startswith('Skin-'): return 'skin-'+name[5:].lower()+'.html'
    if name.startswith('Door-'): return {'Today':'today.html','Money':'discover.html','Land':'story.html','Story':'story.html','Words':'words.html','Receipts':'about.html','Discover':'discover.html','Peoples':'words.html'}.get(name[5:], name.lower()+'.html')
    return name.lower()+'.html'

def shellbare(f,di,title,lede,body,crumb):
    """Like shell() but NO generated hero — for canvas pages that bring their own."""
    plain=re.sub(r'\*','',title)
    hasmap='data-map' in body or 'data-choro' in body
    return f'''<!DOCTYPE html>
<html lang="en" class="theme-mauryan theme-dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script>/* apply the remembered Indic skin before paint */(function(){{try{{var s=localStorage.getItem('bh_skin');if(s)document.documentElement.className=s;}}catch(e){{}}}})();</script>
<title>{e(plain)} · Bharat</title><meta name="description" content="{e(re.sub("<[^>]+>","",lede)[:155])}">
<link rel="canonical" href="{LIVE}{f}"><meta property="og:title" content="{e(plain)} · Bharat"><meta property="og:site_name" content="Bharat"><meta name="twitter:card" content="summary_large_image">
{FONTS}<link rel="stylesheet" href="css/site.css">{_THEME_LINKS}</head>
<body data-door="{di}">
<main><div class="wrap"><p class="crumb">{crumb}</p></div>
{body}
</main>
<script src="js/nav.js"></script>{'<script src="js/base.js"></script>' if hasmap else ''}<script src="js/site.js"></script><script defer src="js/webgl.js"></script>
</body></html>'''

def shellmap(f,di,title,lede,hero,body,crumb,headcss,endjs):
    """The map page: our chrome + the classic India fiscal map engine (Leaflet + app.js),
    with its vendor CSS in <head> and its scripts before </body>. Rebuilt 'inside the new
    design' — dark bronze/gold, 15-skins, WebGL, the tile-free Plain base."""
    plain=re.sub(r'\*','',title)
    return f'''<!DOCTYPE html>
<html lang="en" class="theme-mauryan theme-dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script>(function(){{try{{var s=localStorage.getItem('bh_skin');if(s)document.documentElement.className=s;}}catch(e){{}}}})();</script>
<title>{e(plain)} · Bharat</title><meta name="description" content="{e(re.sub("<[^>]+>","",lede)[:155])}">
<link rel="canonical" href="{LIVE}{f}"><meta property="og:site_name" content="Bharat">
{FONTS}<link rel="stylesheet" href="css/site.css">{_THEME_LINKS}{headcss}</head>
<body data-door="{di}">
<main><div class="wrap"><p class="crumb">{crumb}</p>{hero}</div>
{body}
</main>
<script src="js/nav.js"></script><script src="js/site.js"></script><script defer src="js/webgl.js"></script>
{endjs}
</body></html>'''
made=[]
# pages handled by the canvas importer (skipped in the normal door loop; emitted separately).
# Declared up front so the door loop skips them before the canvas block runs.
CANVAS_PAGES={'discover.html','tribes.html','tribes-india.html','kingdoms.html','map.html'}
if load_canvas:
    CANVAS_PAGES |= {'tribe-'+s[6:].lower()+'.html' for s in canvas_available() if s.startswith('Tribe-')}
    CANVAS_PAGES |= {'region-'+s[7:].lower()+'.html' for s in canvas_available() if s.startswith('Region-')}
# one lede per door, new 4-door order: Story · Discover · Peoples · Today
DOORLEDE=["Most of this story happens long before Delhi's sultans or the British. Begin at the beginning — and at the land the story is written on.",'Public money from the Union to the district, the states that carry the country, and every one of 594 districts on one map.','Who we are: unrelated language families, one family of scripts, 727 tribes, the kingdoms, and the crafts and colours that carry them.','The atlas gathers the news but shows none of it until a person has approved it. Start with who is telling the story.']
def feature(di):
    # one signature panel per door (0 Story, 1 Discover, 2 Peoples, 3 Today)
    if di==0: return sec('Where the story is *written*',mapb([{'n':'Sacred sites','c':'#f0b429','pts':[hpt(x) for x in A['heritage']]},{'n':"Ashoka's edicts",'c':'#5f9fd6','pts':[apt(x) for x in A['ashoka']]}]),sub='Sacred sites and edicts')
    if di==1: return sec('Who pays in most, *FY24*',table([('State',0),('Region',0),('GSDP',1),('Pays in (est.)',1),('Gets back',1),('Back per ₹1 paid',1)],fiscal_rows()[:8],filt=False)+f'<p class="note" data-r>{FNOTE}</p><div data-r><a class="btn" href="state-of-india.html">All {len(FI["states"])} states</a></div>',sub='From the fiscal file')
    if di==2: return sec('One word, many *letters*','<div class="spec">'+''.join(f'<div data-r><b>{e(r["text"])}</b><span>{e(r["script"])}</span></div>' for r in SC['specimen']['renderings'][:8])+'</div>',sub='saṃskṛtam')
    return sec('The feed, *counted*',news_tiles(),sub='Where it stands')
for di,(l,q,ic,h,ps) in enumerate(DOORS):
    cs=cards([card(f'{k+1:02d}',t,f'<p>{e(hint[0].upper()+hint[1:])}.</p>',href=f) for k,(f,t,hint) in enumerate(ps)])
    body=feature(di)+sec('',cs,sub=f'{len(ps)} views')
    open(OUT+''+h,'w').write(shell(h,di,re.sub(r'(\S+)\?$',r'*\1*?',q) if '?' in q else q,l,DOORLEDE[di],'',body,'<a href="index.html">Home</a> / '+e(l)));made.append(h)
    uniq=[p for p in ps if '#' not in p[0]]
    for k,(f,t,hint) in enumerate(uniq):
        if f=='sitemap.html': continue
        if f in CANVAS_PAGES: continue   # emitted separately from the imported design package
        b=brief(f);lede=e(b.get('explainer') or (hint[0].upper()+hint[1:]+'.'));how=e(b.get('research','')) if b.get('research') else ''
        pv=uniq[k-1] if k>0 else None;nx=uniq[k+1] if k+1<len(uniq) else None
        np_='<nav class="nextprev" aria-label="More in this section" data-r>'+(f'<a href="{pv[0]}"><span>Previous</span>{e(pv[1])}</a>' if pv else f'<a href="{h}"><span>Section</span>{e(l)}</a>')+(f'<a href="{nx[0]}"><span>Next</span>{e(nx[1])}</a>' if nx else f'<a href="{h}"><span>Back to</span>{e(l)}</a>')+'</nav>'
        fn=PAGES.get(f);assert fn,f
        open(OUT+''+f,'w').write(shell(f,di,TITLES[f],l+' · '+t,lede,how,fn(),f'<a href="index.html">Home</a> / <a href="{h}">{e(l)}</a> / {e(t)}',np_));made.append(f)
site_pages();state_pages()
for f,di,title,kick,lede,how,body,crumb in EXTRA:
    open(OUT+''+f,'w').write(shell(f,di,title,kick,lede,how,body,crumb));made.append(f)

# FOOTER pages (the old Receipts door) — no longer a top-nav door, but still real pages
# reachable from the footer. Generate each with its builder, filed under About in the crumb.
for f,t in FOOTER_PAGES:
    if f=='sitemap.html' or f in made: continue
    fn=PAGES.get(f)
    if not fn: continue
    b=brief(f);lede=e(b.get('explainer') or (t+'.'));how=e(b.get('research','')) if b.get('research') else ''
    open(OUT+''+f,'w').write(shell(f,3,TITLES.get(f,t),'About · '+t,lede,how,fn(),f'<a href="index.html">Home</a> / <a href="about.html">About</a> / {e(t)}'));made.append(f)

# ---- CANVAS PAGES (the imported design package) ----
# Phase 2: Discover Bharat, one state at a time. Imported from the canvas States.dc.html,
# wrapped in our chrome (bare — it brings its own hero), under the Long-story door.
if discover_body:
    # pre-rendered static (no React) from canvas/States.dc.html's DATA — see render_discover.py
    _dhero=('<div class="hero" style="padding:26px 0 30px"><div><p class="kick"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-lion"/></svg>The long story · Discover</p>'
            '<h1>Discover Bharat, one <em>state</em> at a time</h1>'
            '<p class="lede">Pick a state. Its story reads in order: the people who were here first, where they pray, the kingdoms that rose, what still stands, and how it joined India. Whatever we have not yet sourced is listed, not filled in.</p></div><div></div></div><div class="rule"></div>')
    open(OUT+'discover.html','w').write(shellbare(
        'discover.html', 3, 'Discover Bharat, one *state* at a time',
        'Pick a state: the people who were here first, the kingdoms that rose, and what still stands.',
        '<div class="wrap">'+_dhero+'</div>'+discover_body(),
        '<a href="index.html">Home</a> / <a href="story.html">The long story</a> / Discover Bharat'))
    made.append('discover.html')

# the interactive India fiscal MAP (classic.html engine) rebuilt inside the new design.
if map_body:
    CANVAS_PAGES.add('map.html')
    _mheadcss,_mendjs=map_head_links()
    _mhero=('<div class="hero" style="padding:26px 0 24px"><div><p class="kick"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-bull"/></svg>Discover · The map</p>'
            '<h1>Every district, on <em>one map</em></h1>'
            '<p class="lede">India by public money — tap a state for its ten-year story, its governance footprint, and who answers for it. Drag the year. The ground is a clean, tile-free base; the data is sourced, or shown as a gap.</p></div><div></div></div><div class="rule"></div>')
    open(OUT+'map.html','w').write(shellmap(
        'map.html', 1, 'Every district, on *one map*',
        'India by public money — every district on one interactive map, sourced.',
        _mhero, map_body(),
        '<a href="index.html">Home</a> / <a href="discover.html">Discover</a> / The map',
        _mheadcss, _mendjs))
    made.append('map.html')
    copy_map_deps(OUT.rstrip('/'), R.rstrip('/'))

# Phase 3: the tribe design-system pages (static canvas content) — wrapped in our chrome under
# Words-and-craft. These are fully static (no {{ }}), so a straight import + shellbare wrap.
if load_canvas:
    _cv=set(canvas_available())
    _tribe_slugs=sorted(s[6:] for s in _cv if s.startswith('Tribe-'))
    _tribe_name={ 'Bhil':'Bhil','Bodo':'Bodo Aronai','Gond':'Gond','Jadupatua':'Jadupatua','Khovar':'Khovar','Kurumba':'Kurumba','Mithila':'Mithila','Mizo':'Mizo Puan','Naga':'Chakhesang Naga','Pattachitra':'Pattachitra','Pithora':'Pithora','Saura':'Saura / Santal','Sohrai':'Sohrai','Toda':'Toda','Warli':'Warli' }
    for _slug in _tribe_slugs:
        _nm=_tribe_name.get(_slug,_slug); _out='tribe-'+_slug.lower()+'.html'
        CANVAS_PAGES.add(_out)
        open(OUT+_out,'w').write(shellbare(
            _out, 4, _nm,
            'A folk design system: palette, native script, pattern and components, read as one system.',
            canvas_body('Tribe-'+_slug),
            f'<a href="index.html">Home</a> / <a href="words.html">Words and craft</a> / <a href="tribes.html">The tribes that made it</a> / {e(_nm)}'))
        made.append(_out)
    # the Tribes overview (static) replaces our generated tribes.html
    if 'Tribes' in _cv:
        CANVAS_PAGES.add('tribes.html')
        open(OUT+'tribes.html','w').write(shellbare(
            'tribes.html', 4, 'The tribes that *made it*',
            'Folk design systems drawn from India\'s living tribal art — palette, script, pattern, read as systems.',
            canvas_body('Tribes'),
            '<a href="index.html">Home</a> / <a href="words.html">Words and craft</a> / The tribes that made it'))
        made.append('tribes.html')
    # Phase 4: the Region "before & after" pages (static canvas content) under the long story.
    _region_name={'Bengal':'Bengal, both sides','Bihar':'Bihar, before and after','Goa':'Goa, before and after 1510','Haryana':'Haryana, before and after','Rajasthan':'Rajasthan'}
    for _rs in sorted(s[7:] for s in _cv if s.startswith('Region-')):
        _rn=_region_name.get(_rs,_rs); _ro='region-'+_rs.lower()+'.html'
        CANVAS_PAGES.add(_ro)
        open(OUT+_ro,'w').write(shellbare(
            _ro, 3, _rn,
            'A region read before and after a turning point — what changed, and what the record shows.',
            canvas_body('Region-'+_rs),
            f'<a href="index.html">Home</a> / <a href="story.html">The long story</a> / <a href="discover.html">Discover Bharat</a> / {e(_rn)}'))
        made.append(_ro)
    # Kingdoms & flags — pre-rendered static (no React) from the canvas component's rows.
    if kingdoms_body:
        CANVAS_PAGES.add('kingdoms.html')
        _khero=('<div class="hero" style="padding:26px 0 30px"><div><p class="kick"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-lion"/></svg>The long story · Kingdoms</p>'
                '<h1>The standards that outlasted <em>empires</em></h1>'
                '<p class="lede">The princely states kept their own flags through the Mughal centuries and under British paramountcy, until they joined India in 1947–1950. Each standard is drawn from a written description; where the source names the colours but not their shade, the shade is representative.</p></div><div></div></div><div class="rule"></div>')
        open(OUT+'kingdoms.html','w').write(shellbare(
            'kingdoms.html', 3, 'The standards that outlasted *empires*',
            'Princely-state flags, drawn from written description, and how long each one lasted.',
            '<div class="wrap">'+_khero+'</div>'+kingdoms_body(),
            '<a href="index.html">Home</a> / <a href="story.html">The long story</a> / Kingdoms and flags'))
        made.append('kingdoms.html')
    # the 727-entry index — pre-rendered static (no React) with a vanilla search filter.
    if tribes_india_body:
        CANVAS_PAGES.add('tribes-india.html')
        _tihero=('<div class="hero" style="padding:26px 0 30px"><div><p class="kick"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-lotus"/></svg>Words and craft · The full list</p>'
                 '<h1>Every listed tribe of <em>Bharat</em></h1>'
                 '<p class="lede">All 727 Scheduled-Tribe entries, state by state, searchable. A palette is built for only a few so far; the rest are named, not filled in — a gap, shown as a gap.</p></div><div></div></div><div class="rule"></div>')
        open(OUT+'tribes-india.html','w').write(shellbare(
            'tribes-india.html', 4, 'Every listed tribe of *Bharat*',
            'All 727 Scheduled-Tribe entries, state by state, searchable.',
            '<div class="wrap">'+_tihero+'</div>'+tribes_india_body(),
            '<a href="index.html">Home</a> / <a href="words.html">Words and craft</a> / <a href="tribes.html">The tribes that made it</a> / Every listed tribe'))
        made.append('tribes-india.html')
sm='<div class="sm-cols">'+''.join(f'<section data-r><p class="sub">{len(ps)} views</p><h2><a href="{h}" style="border:0;font:inherit;display:inline">{e(l)}</a></h2><p class="q">{e(q)}</p>'+''.join(f'<a href="{f}">{e(t)}<span>{e(hint)}</span></a>' for f,t,hint in ps)+'</section>' for l,q,ic,h,ps in DOORS)+'</div>'
open(OUT+'sitemap.html','w').write(shell('sitemap.html',3,TITLES['sitemap.html'],'Site map',f'Four doors, {sum(len(d[4]) for d in DOORS)} views. Each page has one name and one home.','',sec('',sm)+'<section class="b"><div class="wrap" data-r><a class="btn solid" href="index.html">Front page: Bharat through time</a></div></section>','<a href="index.html">Home</a> / Site map'));made.append('sitemap.html')
# front page: point everything at local pages
loc={f:f for f in sorted(ALLF)};loc.update({o:f for f,o in ORIG.items()})
def sub(m):
    h=m.group(1);b=h.split('#')[0];fr='#'+h.split('#')[1] if '#' in h else ''
    return 'href="'+loc[b]+fr+'"' if b in loc else ('href="index.html"' if b=='home.html' else m.group(0))
idx=re.sub(r'href="'+re.escape(LIVE)+r'([^"]*)"',sub,idx)
idx=re.sub(r'<nav aria-label="Sections">.*?</nav>','<nav aria-label="Sections">'+''.join(f'<a href="{d[3]}">{e(d[0])}</a>' for d in DOORS)+'<a class="cta" href="sitemap.html">Site map</a></nav>',idx,flags=re.S)
k=AS['kalinga'];v1=VD['verses'][0]
focus=f"""<section class="sec" id="focus"><div class="wrap"><p class="when">In focus</p><h2>Vedic and Mauryan <em>India</em></h2><div class="doors">
<article class="door"><p class="when">Vedic age · c. 1500 to 500 BCE</p><h3 style="font:400 30px/1.6 var(--indic);color:var(--gilt)">{e(v1['devanagari'].splitlines()[0])}</h3><p class="lede">{e(v1['translations']['en-griffith'].split(':')[0])}. The Hymn of Creation, Rigveda 10.129, in its own script with a named translation.</p><a class="btn" href="vedas.html">One text, many tongues</a><a class="btn" href="languages.html">The language families</a></article>
<article class="door"><p class="when">Maurya · c. 322 to 185 BCE</p><h3>A conqueror publishes his regret.</h3><p class="lede">{e(k['quote_remorse'][:230])}…</p><a class="btn" href="ashoka.html">Ashoka, in his own words</a><a class="btn" href="ancient-india.html">Five thousand years, one spine</a></article>
</div></div></section>"""
idx=idx.replace('<section class="sec" id="map">',focus+'<section class="sec" id="map">',1)
idx=idx.replace('<a class="cue" href="#indus"><i></i>Begin the journey</a>','<a class="cue" href="#indus"><i></i>Begin the journey</a><p style="margin:14px 0 0"><a class="btn" href="#vedic">In focus: the Vedic age</a><a class="btn" href="#maurya">In focus: Ashoka\'s empire</a></p>',1)
# The Claude-design bundle is the real landing page (index.html) — the designed 7-page
# L1/L2 experience with its own WebGL. Keep this generated scrollytelling front page as
# through-time.html so the generator never clobbers the hand-placed landing.
open(OUT+'through-time.html','w').write(idx.replace('href="index.html"','href="through-time.html"'));made.append('through-time.html')
open(OUT+'sitemap.xml','w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>{LIVE}{f}</loc></url>' for f in sorted(set(made)))+'</urlset>');open(OUT+'robots.txt','w').write('User-agent: *\nAllow: /\nSitemap: '+LIVE+'sitemap.xml\n')
print('orig files',copy_orig() if os.environ.get('EMBED') else 0)
print(len(made),'pages',sum(os.path.getsize(OUT+''+f) for f in made)//1024,'KB');print('left live links in index:',len(re.findall(re.escape(LIVE),idx)))
# link check
bad=set()
for f in made:
    for h in re.findall(r'href="([^"#:]+\.html)(?:#[^"]*)?"',open(OUT+''+f).read()):
        if not os.path.exists(OUT+''+h): bad.add((f,h))
print('broken',sorted(bad)[:20]);print('wiki hrefs',sum(len(re.findall(r'href="[^"]*wiki',open(OUT+''+f).read())) for f in made))
