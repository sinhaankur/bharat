import json,re,math
from collections import Counter,defaultdict
import os
R=os.environ.get('BHARAT_REPO','..')+'/'
D=json.load(open(R+'news-feed.json'))['news_items']
STOP=set('the and for with from that this have has are was were will after over into amid says said india indian new not his her its their who what why how out all more than amid against across about ahead says say today live updates news watch video photos here know check latest big top first set get gets may can could would should two three year years day days week time back just now also govt government state minister says amid'.split())
def toks(h):
    h=h.lower();w=re.findall(r"[^\W\d_]{2,}",h,re.U)
    return {x for x in w if x not in STOP and (len(x)>2 or ord(x[0])>255)}
items=[]
for x in D:
    if not x.get('headline') or not x.get('url'): continue
    items.append((x['ingested_at'],x,toks(x['headline'])))
items.sort(key=lambda t:t[0])
N=len(items);df=Counter(t for _,_,ts in items for t in ts)
idf={t:math.log(N/c) for t,c in df.items()}
def day(s): return s[:10]
def dnum(s): 
    y,m,d=map(int,s[:10].split('-'));return (y*12+m)*31+d
clusters=[];index=defaultdict(list)
for ts_,x,tk in items:
    if len(tk)<3: continue
    rare=[t for t in tk if df[t]<N*.01]
    tot=sum(idf[t] for t in tk);best=None;bs=0;dn=dnum(ts_);seen=set()
    for t in rare:
        for ci in index[t][-40:]:
            if ci in seen: continue
            seen.add(ci);c=clusters[ci]
            if dn-c['last']>3 or c['lang']!=x['language']: continue
            sh=tk&c['tok']
            if len(sh)<3: continue
            sc=sum(idf[t] for t in sh)/tot
            if sc>bs: bs=sc;best=ci
    if best is not None and bs>=.5:
        c=clusters[best];c['items'].append(x);c['last']=dn;c['cnt'].update(tk)
    else:
        clusters.append({'items':[x],'tok':set(tk),'cnt':Counter(tk),'last':dn,'lang':x['language']});ci=len(clusters)-1
        for t in rare: index[t].append(ci)
OWN={'NDTV Khabar':'NDTV','NDTV':'NDTV','The Hindu':'Hindu','The Hindu · BusinessLine':'Hindu'}
def bucket(l): return {'left':'L','centre-left':'L','centre':'C','centre-right':'R','right':'R','state_media':'S'}.get(l,'U')
out=[]
for c in clusters:
    outs={x['outlet'] for x in c['items']};groups={OWN.get(o,o.split(' (')[0].split(' ')[0] if o.startswith('ABP') else o) for o in outs}
    if len(groups)<3: continue
    n=len(c['items']);top=[t for t,k in sorted(c['cnt'].items(),key=lambda kv:-kv[1]*idf[kv[0]]) if k>=max(2,n*.4)][:7]
    if len(top)<3: continue
    c['top']=set(top);c['outs']=outs;c['groups']=groups;out.append(c)
print(len(clusters),'clusters ->',len(out),'stories with 3+ independent outlets')
out.sort(key=lambda c:(len(c['groups']),len(c['items'])),reverse=True)
recent=sorted(out,key=lambda c:c['items'][-1]['ingested_at'],reverse=True)
sel=[];ids=set()
for c in recent[:160]+out[:160]:
    if id(c) not in ids: ids.add(id(c));sel.append(c)
sel.sort(key=lambda c:c['items'][-1]['ingested_at'],reverse=True)
for i,c in enumerate(sel): c['id']=i
# chains (same story returning later) and relations (overlapping in time)
for c in sel: c['chain']=[];c['rel']=[]
for i,a in enumerate(sel):
    for b in sel[i+1:]:
        sh=len(a['top']&b['top'])
        if sh<3: continue
        gap=abs(dnum(a['items'][0]['ingested_at'])-dnum(b['items'][0]['ingested_at']))
        (a['chain'] if gap>3 else a['rel']).append(b['id']);(b['chain'] if gap>3 else b['rel']).append(a['id'])
OUTL=sorted({x['outlet'] for c in sel for x in c['items']})
S=[]
for c in sel:
    its=c['items'];lean=Counter(bucket(x['outlet_lean']) for x in its)
    cen=[x for x in its if bucket(x['outlet_lean'])=='C'];head=(cen or its)[0]['headline']
    L,Rr=lean['L'],lean['R'];ass=L+Rr+lean['C'];blind=''
    if ass>=4:
        if L==0 and Rr/ass>=.5: blind='L'
        elif Rr==0 and L/ass>=.5: blind='R'
    days=Counter(day(x['ingested_at']) for x in its)
    st=Counter(x['geo']['state'] for x in its if (x.get('geo') or {}).get('state')).most_common(1)
    seen=set();pick=[]
    for x in its:
        if x['outlet'] not in seen: seen.add(x['outlet']);pick.append(x)
    for x in its:
        if len(pick)>=14: break
        if x not in pick: pick.append(x)
    S.append({'id':c['id'],'t':head,'a':day(its[0]['ingested_at']),'b':day(its[-1]['ingested_at']),'n':len(its),'g':len(c['groups']),'lg':c['lang'],'st':st[0][0] if st else '','L':[lean['L'],lean['C'],lean['R'],lean['S'],lean['U']],'bl':blind,'d':sorted(days.items()),'ch':sorted(set(c['chain']))[:8],'rl':sorted(set(c['rel']))[:6],'k':sorted(c['top']),'i':[[OUTL.index(x['outlet']),bucket(x['outlet_lean']),x['headline'][:180],x['url'],day(x['ingested_at'])] for x in pick]})
json.dump({'outlets':OUTL,'stories':S,'gen':D and max(x['ingested_at'] for x in D)[:10],'total':N,'clusters':len(out)},open(os.path.dirname(os.path.abspath(__file__))+'/inputs/stories.json','w'),ensure_ascii=False,separators=(',',':'))
import os;print(len(S),'stories',0//1024,'KB',Counter(s['bl'] for s in S),Counter(s['lg'] for s in S),sum(1 for s in S if s['ch']),'chained')
for s in S[:6]: print(s['a'],s['b'],s['n'],s['g'],s['L'],s['bl'],s['t'][:90])
