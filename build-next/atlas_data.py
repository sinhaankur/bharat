import json,math,sys,re
from collections import Counter
R=sys.argv[1]
def j(f): return json.load(open(R+'/'+f))
LON0,LON1,LAT0,LAT1=64.0,99.0,5.5,38.6
K=20;C=math.cos(math.radians(22))
def P(lon,lat): return ((lon-LON0)*C*K,(LAT1-lat)*K)
def inb(lon,lat): return LON0<=lon<=LON1 and LAT0<=lat<=LAT1
def dp(pts,tol):
    if len(pts)<3: return pts
    keep=[False]*len(pts);keep[0]=keep[-1]=True;st=[(0,len(pts)-1)]
    while st:
        a,b=st.pop();ax,ay=pts[a];bx,by=pts[b];dx,dy=bx-ax,by-ay;L=math.hypot(dx,dy) or 1e-9;m=0;mi=-1
        for i in range(a+1,b):
            d=abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/L
            if d>m:m=d;mi=i
        if m>tol: keep[mi]=True;st+= [(a,mi),(mi,b)]
    return [p for p,k in zip(pts,keep) if k]
def ring(r,tol,close=True):
    pts=[P(*c[:2]) for c in r]
    if close and len(pts)>8:
        m=max(range(len(pts)),key=lambda i:math.hypot(pts[i][0]-pts[0][0],pts[i][1]-pts[0][1]))
        q=dp(pts[:m+1],tol)+dp(pts[m:],tol)[1:]
    else: q=dp(pts,tol)
    if close and len(q)<4: return ''
    s='M'+'L'.join('%.1f %.1f'%p for p in q)
    return s+('Z' if close else '')
def area(r):
    return abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1)))/2
out={}
g=j('india-states.geojson');states=[]
for f in g['features']:
    geo=f['geometry'];polys=geo['coordinates'] if geo['type']=='MultiPolygon' else [geo['coordinates']]
    d=''
    for p in polys:
        if area(p[0])<0.004: continue
        d+=ring(p[0],0.35)
    pr=f['properties'];name=pr.get('NAME_1') or pr.get('name') or pr.get('ST_NM') or pr.get('state') or str(pr)
    states.append({'n':name,'d':d})
out['states']=states
print('props',g['features'][0]['properties'],file=sys.stderr)
rv=j('india-rivers.geojson');rd=''
print('river props',rv['features'][0]['properties'],len(rv['features']),file=sys.stderr)
for f in rv['features']:
    geo=f['geometry'];lines=geo['coordinates'] if geo['type']=='MultiLineString' else [geo['coordinates']]
    for l in lines:
        l=[c for c in l if inb(c[0],c[1])]
        if len(l)>1: rd+=ring(l,0.5,False)
out['rivers']=rd
def xy(lat,lon): 
    x,y=P(lon,lat);return [round(x,1),round(y,1)]
# heritage
h=j('heritage-sites.json');hs=[];skipped=0
for s in h['sites']:
    if s.get('lat') is None or not inb(s['lng'],s['lat']): skipped+=1;continue
    src=(s.get('source') or [{}])[0]
    d=(s.get('destruction') or {}).get('primary') or {}
    hs.append({'n':s['name'],'p':xy(s['lat'],s['lng']),'t':s.get('tradition'),'st':s.get('state'),'b':s.get('builder'),'f':s.get('built_from'),'to':s.get('built_to'),'s':s.get('status'),'dy':d.get('year'),'da':d.get('actor'),'u':src.get('url'),'ul':src.get('label'),'tier':src.get('tier'),'ax':bool(s.get('approx_coords'))})
out['heritage']=hs;out['heritage_total']=len(h['sites'])
a=j('ashoka-edicts.json')
out['ashoka']=[{'n':s['name'],'p':xy(s['lat'],s['lng']),'m':s.get('modern'),'ty':s.get('type'),'sc':s.get('scripts'),'note':s.get('note')} for s in a['sites'] if inb(s['lng'],s['lat'])]
out['ashoka_total']=len(a['sites']);print('ashoka meta',json.dumps(a['_meta'],ensure_ascii=False)[:600],file=sys.stderr)
e=j('encroachment-cases.json');print(json.dumps(e['cases'][0],ensure_ascii=False),file=sys.stderr)
out['water']=[]
for c in e['cases']:
    ll=c.get('latlng') or [c.get('lat'),c.get('lng')]
    src=c.get('source') or c.get('sources') or {}
    if isinstance(src,list): src=src[0] if src else {}
    out['water'].append({'n':c.get('water_body') or c.get('district'),'p':xy(ll[0],ll[1]),'st':c.get('state'),'di':c.get('district'),'ty':c.get('type'),'y':c.get('year'),'det':c.get('detail'),'u':src.get('url') if isinstance(src,dict) else src,'ul':src.get('label') if isinstance(src,dict) else None})
q=j('india-earthquakes.json')
out['quakes']=[{'n':x.get('p'),'p':xy(x['ll'][0],x['ll'][1]),'m':x['m'],'y':x['y'],'d':x['d']} for x in q['quakes'] if x['m']>=6.0 and inb(x['ll'][1],x['ll'][0])]
out['quakes_meta']=q['_meta']['query']
t=j('tsunamis.json');print(json.dumps(t['tsunamis'][0],ensure_ascii=False),file=sys.stderr)
b=j('news-bubbles.json')
out['news']=[{'n':(x.get('district') or x['state']),'st':x['state'],'p':xy(x['lat'],x['lon']),'c':x['news'],'ev':x['events'],'lv':x['level']} for x in b['bubbles'] if inb(x['lon'],x['lat'])]
o=j('outlets.json');out['outlets']=[dict(name=k,**v) for k,v in o['outlets'].items()];out['funding_types']=o['_meta']['funding_types']
print('outlets note',o['_meta'].get('note'),file=sys.stderr)
nf=j('news-feed.json');items=nf['news_items']
out['feed']={'count':len(items),'generated':nf['_meta']['generated_at'][:10],'by_outlet':Counter(i.get('outlet') for i in items).most_common(),'by_lang':Counter(i.get('language') for i in items).most_common(),'by_mod':Counter(i.get('moderation') for i in items).most_common(),'by_lean':Counter(i.get('outlet_lean') for i in items).most_common(),'geo_state':sum(1 for i in items if (i.get('geo') or {}).get('state')),'geo_dist':sum(1 for i in items if (i.get('geo') or {}).get('district'))}
out['approved']=len(j('approved-news.json')['news_items'])
print(json.dumps(out['feed'],ensure_ascii=False)[:1500],file=sys.stderr)
import re as _re
nav=open(R+'/nav-data.js').read();i=nav.find('g.ATLAS_SECTIONS = [');sec=nav[i:]
secs=[]
for ch in _re.split(r'\n\s*\{ label: "',sec)[1:]:
    lab=ch.split('"')[0];hm=_re.match(r'[^\n]*?href: "([^"]+)"',ch);tm=_re.search(r'tagline: "([^"]+)"',ch.split('items:')[0])
    its=[];seen=set()
    for m in _re.finditer(r'href: "([^"]+)", text: "([^"]+)"(?:, hint: "([^"]*)")?',ch.split('items:',1)[1] if 'items:' in ch else ''):
        if m.group(1) in seen: continue
        seen.add(m.group(1));its.append([m.group(1),m.group(2),m.group(3) or ''])
    secs.append({'l':lab,'h':hm.group(1) if hm else '','t':tm.group(1) if tm else '','i':its})
out['sections']=secs
allnav=nav[:i];full={}
for m in _re.finditer(r'href: "([^"]+)", text: "([^"]+)"(?:, hint: "([^"]*)")?',allnav): full.setdefault(m.group(1),[m.group(2),m.group(3) or ''])
insec={x[0] for s_ in secs for x in s_['i']}
out['orphans']=[[k]+v for k,v in full.items() if k not in insec and not k.startswith('http')]
names={}
for m in _re.finditer(r'href: "([^"]+)", text: "([^"]+)"',nav): names.setdefault(m.group(1).split('#')[0],set()).add(m.group(2))
out['ia']={'entries':len(_re.findall(r'href: "',nav)),'pages':len(names),'multi':sorted([[k,sorted(v)] for k,v in names.items() if len(v)>1],key=lambda x:-len(x[1]))}
print('IA',out['ia']['entries'],out['ia']['pages'],len(out['ia']['multi']),[ (s_['l'],len(s_['i'])) for s_ in secs],len(out['orphans']),file=sys.stderr)
print(out['ia']['multi'][:6],file=sys.stderr)
out['dim']=[round((LON1-LON0)*C*K),round((LAT1-LAT0)*K)]
json.dump(out,open('atlas.json','w'),ensure_ascii=False,separators=(',',':'))
for k,v in out.items(): print(k,len(json.dumps(v,ensure_ascii=False)),file=sys.stderr)
print('skipped heritage outside frame',skipped,file=sys.stderr)
