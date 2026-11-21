import math,random,re,html
e=lambda s:html.escape(str(s or ''),quote=True)
def lum(h):
    h=h.lstrip('#');c=[int(h[i:i+2],16)/255 for i in (0,2,4)];c=[x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4 for x in c];return .2126*c[0]+.7152*c[1]+.0722*c[2]
def ratio(a,b): 
    x,y=sorted([lum(a),lum(b)],reverse=True);return (x+.05)/(y+.05)
def roles(band,fixed=None):
    cols=[c for c,_ in band];by=sorted(cols,key=lum)
    pg=by[0] if lum(by[0])<.06 else '#17110c';pi=by[-1] if lum(by[-1])>.55 else '#f4efe4'
    mid=[c for c in cols if c not in(pg,pi)] or cols
    pa=max(mid,key=lambda c:ratio(c,pg));p3=[c for c in mid if c!=pa][0] if len(mid)>1 else pa
    if fixed: pg,pi,pa=[fixed.get(k,v) for k,v in zip(('g','i','a'),(pg,pi,pa))]
    return pg,pi,pa,p3
def motif(name,band,r):
    pg,pi,pa,p3=r;cols=[c for c,_ in band if c!=pg] or [pi];W,H=480,200;o=f'<rect width="{W}" height="{H}" fill="{pg if name!="Warli" else band[0][0]}"/>';rnd=random.Random(name)
    ink=pi
    def fig(x,y,s,c,arms=1):
        return f'<g stroke="{c}" stroke-width="{s*.09:.1f}" fill="{c}" stroke-linecap="round"><path d="M{x-s*.28} {y-s*.5}L{x+s*.28} {y-s*.5}L{x} {y-s*.15}Z"/><path d="M{x} {y-s*.15}L{x-s*.26} {y+s*.2}L{x+s*.26} {y+s*.2}Z"/><circle cx="{x}" cy="{y-s*.66}" r="{s*.11}"/><path fill="none" d="M{x-s*.14} {y+s*.2}L{x-s*.2} {y+s*.55}M{x+s*.14} {y+s*.2}L{x+s*.2} {y+s*.55}M{x-s*.28} {y-s*.5}L{x-s*.5} {y-s*.3*arms}M{x+s*.28} {y-s*.5}L{x+s*.5} {y-s*.3*arms}"/></g>'
    if name=='Warli':
        for i in range(14):
            a=i/14*math.tau;o+=f'<g transform="rotate({math.degrees(a)+90:.0f} {150+70*math.cos(a):.0f} {100+70*math.sin(a):.0f})">'+fig(150+70*math.cos(a),100+70*math.sin(a),34,ink)+'</g>'
        o+=f'<path d="M150 100'+''.join(f'L{150+t*.9*math.cos(t*.5):.1f} {100+t*.9*math.sin(t*.5):.1f}' for t in range(0,40))+f'" fill="none" stroke="{ink}" stroke-width="2.5"/>'
        for i in range(7): o+=fig(270+i*30,150-(i%2)*8,40,ink,-1 if i%2 else 1)
        o+=f'<path d="M250 40l20 -22l20 22zM255 40v30h30v-30" fill="none" stroke="{ink}" stroke-width="3"/><circle cx="420" cy="42" r="18" fill="none" stroke="{ink}" stroke-width="3"/>'+''.join(f'<path d="M{420+22*math.cos(k):.0f} {42+22*math.sin(k):.0f}L{420+30*math.cos(k):.0f} {42+30*math.sin(k):.0f}" stroke="{ink}" stroke-width="2.5"/>' for k in [i*math.tau/12 for i in range(12)])
    elif name=='Gond':
        o+=f'<defs><clipPath id="gc"><path d="M60 100C120 20 300 20 380 100C300 180 120 180 60 100ZM380 100L450 50L440 100L450 150Z"/></clipPath></defs><g clip-path="url(#gc)"><rect width="{W}" height="{H}" fill="{cols[0]}"/>'
        for i in range(26):
            c=cols[1+(i%max(1,len(cols)-1))] if len(cols)>1 else ink;x=40+i*17
            o+=f'<path d="M{x} 10C{x+26} 70 {x-26} 130 {x} 190" fill="none" stroke="{c}" stroke-width="5" stroke-dasharray="{2+i%3*5} 7" stroke-linecap="round"/>'
        o+=f'</g><path d="M60 100C120 20 300 20 380 100C300 180 120 180 60 100ZM380 100L450 50L440 100L450 150Z" fill="none" stroke="{ink if lum(ink)>.4 else cols[0]}" stroke-width="3"/><circle cx="118" cy="88" r="9" fill="{pg}" stroke="{cols[-1]}" stroke-width="3"/>'
    elif name=='Mithila':
        o=f'<rect width="{W}" height="{H}" fill="{band[-1][0]}"/>';k='#17110c'
        o+=''.join(f'<path d="M{x} 6l8 10l-8 10l-8 -10z" fill="{cols[i%len(cols)]}" stroke="{k}" stroke-width="1.5"/><path d="M{x} {H-26}l8 10l-8 10l-8 -10z" fill="{cols[(i+2)%len(cols)]}" stroke="{k}" stroke-width="1.5"/>' for i,x in enumerate(range(14,W,18)))
        for cx,c in [(130,cols[0]),(350,cols[3 if len(cols)>3 else 0])]:
            for a in range(8):
                o+=f'<g transform="rotate({a*45} {cx} 100)"><path d="M{cx} 100C{cx-16} 76 {cx-12} 52 {cx} 44C{cx+12} 52 {cx+16} 76 {cx} 100Z" fill="{c if a%2 else cols[1]}" stroke="{k}" stroke-width="4"/><path d="M{cx} 100C{cx-16} 76 {cx-12} 52 {cx} 44C{cx+12} 52 {cx+16} 76 {cx} 100Z" fill="none" stroke="{band[-1][0]}" stroke-width="1.4"/></g>'
            o+=f'<circle cx="{cx}" cy="100" r="13" fill="{cols[2]}" stroke="{k}" stroke-width="4"/><circle cx="{cx}" cy="100" r="13" fill="none" stroke="{band[-1][0]}" stroke-width="1.4"/>'
        o+=f'<path d="M205 100C225 70 262 70 280 100C262 130 225 130 205 100ZM205 100L188 84L192 100L188 116Z" fill="{cols[3 if len(cols)>3 else 1]}" stroke="{k}" stroke-width="4"/>'+''.join(f'<path d="M{222+i*9} 84v32" stroke="{k}" stroke-width="1.5"/>' for i in range(6))+f'<circle cx="266" cy="96" r="3" fill="{k}"/>'
    elif name=='Pattachitra':
        o=f'<rect width="{W}" height="{H}" fill="{band[-1][0]}"/>';k=band[3][0] if len(band)>3 else '#17110c'
        for y,c in [(0,cols[0]),(H-26,cols[0])]:
            o+=f'<rect y="{y}" width="{W}" height="26" fill="{c}"/>'+''.join(f'<path d="M{x} {y+22}a10 10 0 0 1 20 0" fill="{cols[1]}" stroke="{k}" stroke-width="1.5"/><circle cx="{x+10}" cy="{y+8}" r="2.5" fill="{band[-1][0]}"/>' for x in range(0,W,20))
        for i,cx in enumerate((90,240,390)):
            c=cols[i%3];o+=f'<circle cx="{cx}" cy="100" r="54" fill="{c}" stroke="{k}" stroke-width="4"/><circle cx="{cx}" cy="100" r="44" fill="none" stroke="{band[-1][0]}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>'
            o+=f'<path d="M{cx-26} 108a26 30 0 0 1 52 0v14h-52z" fill="{k}"/><circle cx="{cx-11}" cy="100" r="9" fill="{band[-1][0]}"/><circle cx="{cx+11}" cy="100" r="9" fill="{band[-1][0]}"/><circle cx="{cx-11}" cy="100" r="4" fill="{k}"/><circle cx="{cx+11}" cy="100" r="4" fill="{k}"/><path d="M{cx-9} 116q9 6 18 0" stroke="{cols[0]}" stroke-width="3" fill="none"/>'
    elif name=='Bhil':
        for cx,cy,rr,c in [(120,100,70,cols[0]),(300,90,60,cols[1%len(cols)]),(410,130,40,cols[2%len(cols)])]:
            o+=f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="{c}"/>'
            for ring in range(1,int(rr/9)):
                n=int(ring*6.5)
                for i in range(n):
                    a=i/n*math.tau+ring*.3;o+=f'<circle cx="{cx+ring*9*math.cos(a):.1f}" cy="{cy+ring*9*math.sin(a):.1f}" r="2.6" fill="{cols[(ring+2)%len(cols)] if cols[(ring+2)%len(cols)]!=c else ink}"/>'
        o+=f'<path d="M210 190V120M210 150l-22 -26M210 140l24 -30M210 128l-12 -30" stroke="{ink}" stroke-width="5" stroke-linecap="round" fill="none"/>'+''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="{cols[i%len(cols)]}"/>' for i,(x,y) in enumerate([(188,124),(234,110),(198,98),(180,112),(242,98),(206,86)]))
    else:
        o+=f'<rect x="16" y="16" width="{W-32}" height="{H-32}" fill="none" stroke="{ink}" stroke-width="3"/><rect x="26" y="26" width="{W-52}" height="{H-52}" fill="none" stroke="{pa}" stroke-width="1.5"/>'
        o+=''.join(f'<path d="M{x} 26l8 12l8 -12" fill="none" stroke="{ink}" stroke-width="2"/>' for x in range(30,W-40,16))
        for row,y in enumerate((84,146)):
            for i in range(11): o+=fig(52+i*38,y,36,ink if (i+row)%3 else pa,1 if i%2 else -1)
        o+=f'<path d="M36 112H{W-36}" stroke="{pa}" stroke-width="2" stroke-dasharray="10 6"/>'
    return f'<svg class="motif" viewBox="0 0 {W} {H}" role="img" aria-label="A pattern sketch in the {e(name)} manner">{o}</svg>'
def system(name,region,tagline,band,body_html,script=None,family='',fonts='',motif_svg='',fixed=None):
    r=roles(band,fixed);pg,pi,pa,p3=r
    bandh=''.join(f'<span style="background:{c};color:{"#17110c" if lum(c)>.3 else "#f4efe4"}">{e(n)}<b>{c}</b></span>' for c,n in band)
    slug=lambda n:re.sub(r'[^a-z0-9]+','-',n.lower()).strip('-')
    toks='\n'.join(f'  --{slug(n)}: {c};' for c,n in band)+f'\n\n  --ground: {pg};\n  --ink: {pi};\n  --accent: {pa};'
    cr=''.join(f'<tr><td><i class="sw" style="background:{a}"></i>{a} on <i class="sw" style="background:{b}"></i>{b}</td><td class="n">{ratio(a,b):.1f} : 1</td><td>{"passes for text" if ratio(a,b)>=4.5 else ("large text only" if ratio(a,b)>=3 else "decoration only")}</td></tr>' for a,b in [(pi,pg),(pa,pg),(pg,pa)]+[(c,pg) for c,_ in band if c not in(pg,pi,pa)][:3])
    sc=f'<div><h3>Script</h3><p class="big">{e(script["glyphs"])}</p><p style="font:500 13px var(--mono);opacity:.8">{e(script["rom"])} · {e(script["lang"])}</p></div>' if script else ''
    return f'''<div class="dsp" data-r style="--pg:{pg};--pi:{pi};--pa:{pa};--p3:{p3}"><div class="band">{bandh}</div><div class="g">
<div><h3>{e(region)}</h3><p class="dh">{e(name)}</p><p class="it">{e(tagline)}</p>{body_html}</div>
{sc or f'<div><h3>Type</h3><p class="dh">Aa</p><p>{e(fonts)}</p></div>'}
{f'<div class="full"><h3>Pattern grammar</h3>{motif_svg}<p style="font-size:13.5px;opacity:.75;margin-top:10px">An original sketch using the marks described above, in this palette. It is not a reproduction of any artist\'s work.</p></div>' if motif_svg else ''}
<div><h3>Tokens</h3><pre>:root {{\n{e(toks)}\n}}</pre></div>
<div><h3>Components</h3><div class="cmp"><span class="pb">Primary action</span><span class="po">Secondary</span><span class="pc">status chip</span></div><div class="crd"><b>{e(name)}</b>{e(tagline)}</div>{f'<p style="margin-top:16px"><b>Family:</b> {e(family)}<br><b>Type:</b> {e(fonts)}</p>' if script else ''}</div>
<div class="full"><h3>Contrast, measured</h3><table><thead><tr><th>Pair</th><th class="n">Ratio</th><th>Use</th></tr></thead><tbody>{cr}</tbody></table></div>
</div></div>''',r
