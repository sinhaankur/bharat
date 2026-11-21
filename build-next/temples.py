import math
class Dw:
    def __init__(s,W,H,pad=(10,6,10,6)): s.W=W;s.H=H;s.o=[];s.pad=pad;s.fs=max(W,H)/52
    def f(s,y): return s.H-y
    def path(s,pts,cls='ln',close=False):
        s.o.append(f'<path class="{cls}" d="M'+'L'.join(f'{x:.2f} {s.f(y):.2f}' for x,y in pts)+('Z' if close else '')+'"/>')
    def raw(s,d,cls='ln'): s.o.append(f'<path class="{cls}" d="{d}"/>')
    def rect(s,x,y,w,h,cls='ln'): s.path([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],cls,True)
    def circ(s,x,y,r,cls='ln'): s.o.append(f'<circle class="{cls}" cx="{x:.2f}" cy="{s.f(y):.2f}" r="{r:.2f}"/>')
    def arc(s,cx,cy,rx,ry,cls='ln',n=28,a0=0,a1=math.pi): s.path([(cx+rx*math.cos(a0+(a1-a0)*i/n),cy+ry*math.sin(a0+(a1-a0)*i/n)) for i in range(n+1)],cls)
    def label(s,x,y,tx,ty,t,sub=''):
        a='start' if tx>=x else 'end';dx=s.fs*.4*(1 if tx>=x else -1)
        s.o.append(f'<path class="lead" d="M{x:.2f} {s.f(y):.2f}L{tx:.2f} {s.f(ty):.2f}"/><circle class="dot" cx="{x:.2f}" cy="{s.f(y):.2f}" r="{s.fs*.16:.2f}"/><text class="nm" x="{tx+dx:.2f}" y="{s.f(ty)+s.fs*.3:.2f}" text-anchor="{a}" font-size="{s.fs:.2f}">{t}</text>'+(f'<text x="{tx+dx:.2f}" y="{s.f(ty)+s.fs*1.5:.2f}" text-anchor="{a}" font-size="{s.fs*.8:.2f}">{sub}</text>' if sub else ''))
    def vdim(s,x,y0,y1,t):
        k=s.fs*.4;s.o.append(f'<path class="dim" d="M{x-k} {s.f(y0)}h{2*k}M{x-k} {s.f(y1)}h{2*k}M{x} {s.f(y0)}V{s.f(y1)}"/><text class="dm" x="{x-k*1.6:.2f}" y="{s.f((y0+y1)/2):.2f}" text-anchor="end" font-size="{s.fs*.9:.2f}">{t}</text>')
    def hdim(s,x0,x1,y,t):
        k=s.fs*.4;s.o.append(f'<path class="dim" d="M{x0} {s.f(y)-k}v{2*k}M{x1} {s.f(y)-k}v{2*k}M{x0} {s.f(y)}H{x1}"/><text class="dm" x="{(x0+x1)/2:.2f}" y="{s.f(y)+s.fs*1.4:.2f}" text-anchor="middle" font-size="{s.fs*.9:.2f}">{t}</text>')
    def ground(s,x0,x1,y=0): s.o.append(f'<path class="gnd" d="M{x0} {s.f(y)}H{x1}"/>')
    def man(s,x,y=0):
        s.raw(f'M{x} {s.f(y)}v-1.1m-.35 .3h.7','ln fine');s.circ(x,y+1.4,.28,'ln fine')
    def svg(s,aria):
        l,t,r,b=s.pad;return f'<svg class="pl" style="--u:{(s.W+l+r)/1000:.4f}px" viewBox="{-l} {-t} {s.W+l+r} {s.H+t+b}" role="img" aria-label="{aria}">'+''.join(s.o)+'</svg>'
def spire(d,xc,w,h,y0,cls='ln',ex=2.3,n=16):
    L=[(xc-w/2*(1-(i/n)**ex),y0+h*i/n) for i in range(n+1)];d.path(L+[(2*xc-x,y) for x,y in reversed(L)],cls)

def nagara(v):
    d=Dw(64,40,(16,4,22,7));x0=14;L=v['length_m'];pl=v['plinth_height_m'];top=v['shikhara_height_m'];d.ground(2,62)
    d.path([(x0-4,0),(x0-4,pl),(x0+L+2,pl),(x0+L+2,0)]);  # jagati
    for i in range(5): d.path([(x0-4-i*.7-.7,pl-(i+1)*.6),(x0-4-i*.7,pl-(i+1)*.6),(x0-4-i*.7,pl-i*.6)],'ln fine')
    halls=[(x0+2.5,5,6.5,'ardhamandapa','entrance porch'),(x0+8,6.5,10,'mandapa','hall'),(x0+15,8.5,14.5,'mahamandapa','great hall')]
    for xc,w,h,nm,sb in halls:
        d.rect(xc-w/2,pl,w,h*.42,'ln');
        for k in range(5): 
            ww=w*(1-k*.19);d.rect(xc-ww/2,pl+h*.42+k*h*.1,ww,h*.1,'ln fine')
        d.raw(f'M{xc-.5} {d.f(pl+h*.92)}h1v-{h*.08}h-1z','ln fine')
    xs=x0+L-6.5;H=top-pl
    d.rect(xs-6,pl,12,5.5,'ln');spire(d,xs,12,H-5.5-2.2,pl+5.5)
    for dx,yy,hh in [(-4.6,0,7),(4.6,0,7),(-3.7,5,6.5),(3.7,5,6.5),(-2.7,10,6),(2.7,10,6),(-1.8,14.5,5),(1.8,14.5,5)]: spire(d,xs+dx,2.6,hh,pl+5.5+yy,'ln fine')
    spire(d,xs,7,H*.5,pl+5.5,'ln fine')
    d.arc(xs,top-2.1,2.1,.7,'ln',a0=0,a1=2*math.pi);d.raw(f'M{xs-.5} {d.f(top-1.4)}q.5 -1.6 1 0M{xs} {d.f(top-.4)}v-.5','ln')
    d.rect(xs-2.6,pl+.6,5.2,4,'gh')
    d.man(x0-9)
    d.vdim(4,0,top,f'{top} m');d.hdim(x0,x0+L,-2.6,f'{L} m long');d.vdim(x0+L+5.5,0,pl,'')
    d.label(xs,top-.3,xs+9,top+1,'kalasha','finial');d.label(xs+2,top-2.1,xs+10,top-4,'amalaka','ribbed stone disc');d.label(xs+3.4,pl+18,xs+10,pl+17,'shikhara','curvilinear tower');d.label(xs+4.8,pl+9,xs+10,pl+9.5,'urushringa',f'{v["sub_spires"]} sub-spires in all')
    d.label(xs+2.6,pl+2.6,xs+10,pl+3,'garbhagriha','sanctum, inside');d.label(x0+L+2,pl*.5,xs+10,-1.5,'jagati',f'platform, {pl} m')
    for xc,w,h,nm,sb in halls: d.label(xc,pl+h,xc-2,pl+h+6+ (halls.index((xc,w,h,nm,sb))*3.2),nm,sb)
    return d.svg('Side elevation of Kandariya Mahadeva temple with parts labelled')
def dravida(v):
    Ht=v['vimana_height_m'];n=v['vimana_storeys'];d=Dw(84,74,(14,4,24,7));xc=46;bw=25;d.ground(2,82)
    d.rect(xc-bw/2-1,0,bw+2,2.2);d.rect(xc-bw/2,2.2,bw,7.4);d.rect(xc-bw/2,9.6,bw,7.4)
    for k in range(1,7): d.path([(xc-bw/2+bw*k/7,2.2),(xc-bw/2+bw*k/7,17)],'ln fine')
    d.path([(xc-bw/2-.6,9.6),(xc+bw/2+.6,9.6)],'ln fine')
    y0=17;body=Ht-y0-9.5;th=body/n
    for i in range(n):
        w=bw*(1-.7*i/n);d.rect(xc-w/2,y0+i*th,w,th*.74,'ln');d.path([(xc-w/2-.35,y0+i*th+th*.74),(xc+w/2+.35,y0+i*th+th*.74)],'ln fine')
        for k in range(1,6): d.path([(xc-w/2+w*k/6,y0+i*th),(xc-w/2+w*k/6,y0+i*th+th*.74)],'ln fine')
    yt=y0+body;gw=bw*.3
    d.rect(xc-gw/2,yt,gw,2.6);d.arc(xc,yt+2.6,gw/2+.9,5.2);d.path([(xc-gw/2-.9,yt+2.6),(xc+gw/2+.9,yt+2.6)]);d.raw(f'M{xc-.45} {d.f(yt+7.8)}q.45 -2.2 .9 0M{xc} {d.f(Ht-.6)}v-.6','ln')
    for i,(w,h) in enumerate([(16,8),(11,6.5)]):
        xx=xc-bw/2-sum([16,11][:i])-w;d.rect(xx,0,w,h,'ln');d.path([(xx,h*.8),(xx+w,h*.8)],'ln fine')
    d.man(8)
    d.vdim(4,0,Ht,f'about {Ht} m');d.hdim(xc-bw/2,xc+bw/2,-2.6,'base width indicative')
    d.label(xc,Ht-.4,xc+19,Ht,'stupi','finial');d.label(xc+gw/2,yt+5.5,xc+19,yt+4,'shikhara',f'capstone, about {v["capstone_tonnes"]} tonnes');d.label(xc+gw/2,yt+1.3,xc+19,yt-2.5,'griva','octagonal neck')
    d.label(xc+bw*.3,y0+body*.5,xc+19,y0+body*.5,'talas',f'{n} diminishing storeys');d.label(xc+bw/2,13,xc+19,13,'bhitti','two-storey sanctum wall');d.label(xc+bw/2+1,1.1,xc+19,2,'adhishthana','moulded base')
    d.label(xc-bw/2-8,8,xc-bw/2-14,16,'mandapa','halls on the axis')
    return d.svg('Elevation of the Brihadisvara vimana with parts labelled')
def stupa(v):
    D=v['dome_diameter_m'];h=v['dome_height_m'];d=Dw(78,34,(12,4,20,7));xc=38;r=D/2;d.ground(2,76)
    mh=4.2;d.rect(xc-r-2.6,0,D+5.2,mh);d.path([(xc-r-2.6,mh+1.1),(xc+r+2.6,mh+1.1)],'ln fine')
    for i in range(34): 
        x=xc-r-2.6+(D+5.2)*i/33;d.path([(x,mh),(x,mh+1.1)],'ln fine')
    d.arc(xc,mh,r,h,'ln',40)
    d.rect(xc-2.4,mh+h,4.8,2);d.path([(xc,mh+h+2),(xc,mh+h+7.4)])
    for k,(w,y) in enumerate([(3,3.4),(2.3,4.9),(1.6,6.4)]): d.arc(xc,mh+h+y,w,.5,'ln fine',12)
    for x in (xc-r-6.5,xc+r+6.5): 
        d.path([(x-1.5,0),(x-1.5,8.6)]);d.path([(x+1.5,0),(x+1.5,8.6)])
        for y in (5.2,6.6,8): d.path([(x-2.7,y),(x-1.3,y+.35),(x+1.3,y+.35),(x+2.7,y)],'ln fine')
    for i in range(40):
        x=xc-r-5+(D+10)*i/39
        if abs(x-(xc-r-6.5))>2 and abs(x-(xc+r+6.5))>2: d.path([(x,0),(x,3)],'ln fine')
    d.path([(xc-r-5,3),(xc+r+5,3)],'ln fine');d.path([(xc-r-5,2),(xc+r+5,2)],'ln fine')
    d.man(4)
    d.hdim(xc-r,xc+r,-2.4,f'dome {D} m across');d.vdim(xc-r-9.5,mh,mh+h,f'{h} m')
    d.label(xc,mh+h+6.4,xc+22,mh+h+7,'chhatra',f'{v["chhatra_tiers"]} parasols');d.label(xc+.2,mh+h+3,xc+22,mh+h+3,'yashti','mast');d.label(xc+2.4,mh+h+1,xc+22,mh+h-1,'harmika','square railing')
    d.label(xc+r*.75,mh+h*.66,xc+22,mh+h-5.5,'anda','solid dome');d.label(xc+r+2.6,mh*.6,xc+25,7,'medhi','drum and walkway');d.label(xc+r+6.5,8.4,xc+25,11.5,'torana',f'{v["toranas"]} gateways');d.label(xc+r+4,2.6,xc+25,2.6,'vedika','stone railing')
    return d.svg('Elevation of the Great Stupa at Sanchi with parts labelled')
def konark(v):
    Hd=v['deul_height_m'];jh=v['jagamohana_height_m'];jw=v['jagamohana_m'][0];wd=v['wheel_diameter_m'];d=Dw(96,76,(14,4,24,7));d.ground(2,94)
    x0=18;ph=4.2;d.rect(x0-3,0,jw+34,ph)
    for i in range(12):
        cx=x0-1+(jw+30)*i/11;d.circ(cx,ph/2+.1,wd/2,'ln')
        for a in range(v['wheel_spokes']): d.path([(cx,ph/2+.1),(cx+wd/2*math.cos(a*math.pi/4),ph/2+.1+wd/2*math.sin(a*math.pi/4))],'ln fine')
    xj=x0+jw/2;wall=jh*.42;d.rect(x0,ph,jw,wall);d.rect(xj-2.2,ph,4.4,6,'ln fine')
    y=ph+wall
    for tier,(n,sh) in enumerate([(6,1),(6,.74),(5,.5)]):
        for k in range(n):
            w=jw*sh*(1-k*.09);d.rect(xj-w/2,y,w,.75,'ln fine');y+=.75
        y+=1.1;d.rect(xj-jw*sh*.3,y-1.1,jw*sh*.6,1.1,'ln fine')
    d.arc(xj,y,3,1,'ln',16,0,2*math.pi);d.raw(f'M{xj-.6} {d.f(y+1)}q.6 -2 1.2 0','ln')
    xd=x0+jw+13;d.rect(xd-9,ph,18,9,'gh');L=[(xd-9*(1-(i/18)**2.2),ph+9+(Hd-ph-9-4)*i/18) for i in range(19)];d.path(L+[(2*xd-a,b) for a,b in reversed(L)],'gh');d.arc(xd,Hd-3.2,3,1,'gh',16,0,2*math.pi)
    for i in range(3): d.raw(f'M{x0-6-i*3.2} {d.f(0)}v-2.2l1 -1.6l1.2 .5l-.4 1.2l-.6 0v2.1','ln fine')
    d.man(6)
    d.vdim(xd+13,0,Hd,'');d.vdim(8,0,jh+ph,f'about {jh} m');d.hdim(x0,x0+jw,-2.6,f'{jw} m square')
    d.label(xd+4,Hd-14,xd+16,Hd-8,'deul',f'collapsed; about {Hd} m, an estimate');d.label(xj+jw*.3,ph+wall+6,xd+16,jh+10,'pidha roof','stepped tiers');d.label(xj+jw/2,ph+wall*.5,xd+16,24,'jagamohana','assembly hall, standing')
    d.label(x0+jw+30,ph/2,xd+16,9,'wheels',f'{v["wheels"]} in all, {wd} m, {v["wheel_spokes"]} spokes');d.label(x0-8,1.6,x0-10,12,'horses',f'{v["horses"]} draw the chariot')
    return d.svg('Elevation of the Konark Sun Temple with the collapsed tower shown dashed')
def martand(v):
    d=Dw(88,50,(8,4,22,7));W,Hh=66,44;x0,y0=4,3;d.rect(x0,y0,W,Hh)
    nl,ns=25,17
    for i in range(nl):
        x=x0+2+(W-4)*i/(nl-1);d.circ(x,y0+2,.55,'ln fine');d.circ(x,y0+Hh-2,.55,'ln fine')
    for i in range(ns):
        y=y0+2+(Hh-4)*(i+1)/(ns+1);d.circ(x0+2,y,.55,'ln fine');d.circ(x0+W-2,y,.55,'ln fine')
    d.rect(x0+4,y0+4,W-8,Hh-8,'ln fine')
    cx,cy=x0+W*.56,y0+Hh/2;d.rect(cx-9,cy-5,18,10);d.rect(cx-5,cy-3,7,6,'ln fine');d.rect(cx-14,cy-3.5,5,7,'ln fine');d.rect(cx-9,cy-8.4,5,3.4,'ln fine');d.rect(cx-9,cy+5,5,3.4,'ln fine')
    d.rect(x0-2,cy-3,2,6);
    # shrine elevation inset
    ex,ey=x0+W+8,6;d.rect(ex-5,ey,10,2);d.rect(ex-4,ey+2,8,7);d.path([(ex-5,ey+9),(ex,ey+15),(ex+5,ey+9)]);d.path([(ex-3.4,ey+13.2),(ex+3.4,ey+13.2)],'ln fine');d.path([(ex-3.6,ey+13.2),(ex,ey+19.5),(ex+3.6,ey+13.2)])
    d.raw(f'M{ex-1.6} {d.f(ey+2)}v-3.2a.8 .8 0 0 1 .8 -.8a.8 1 0 0 1 1.6 0a.8 .8 0 0 1 .8 .8v3.2','ln fine')
    d.label(ex+3,ey+16,ex+6,ey+22,'peaked roof','two tiers');d.label(ex+.8,ey+5.6,ex+6,ey+1,'trefoil arch','');
    d.label(x0+W-2,y0+Hh-10,x0+W+3,y0+Hh-2,'peristyle',f'{v["colonnade_columns"]} fluted columns');d.label(cx+9,cy+2,x0+W+3,y0+Hh-12,'shrine','on a high plinth');d.label(x0-1,cy,x0+2,y0-4,'gateway','west')
    return d.svg('Plan of the Martand Sun Temple courtyard with a small elevation of the shrine')
def ranakpur(v):
    S=round(math.sqrt(v['area_sqft']*.092903),1);d=Dw(S+26,S+4,(8,4,10,7));x0,y0=2,2;d.rect(x0,y0,S,S);c=(x0+S/2,y0+S/2)
    d.rect(c[0]-5,c[1]-5,10,10);d.path([(c[0]-5,c[1]),(c[0]+5,c[1])],'ln fine');d.path([(c[0],c[1]-5),(c[0],c[1]+5)],'ln fine');d.circ(c[0],c[1],2.2,'ln fine')
    for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
        d.rect(c[0]+dx*12-5+ (0),c[1]+dy*12-5,10,10,'ln fine');d.circ(c[0]+dx*12,c[1]+dy*12,3.6,'ln fine')
        d.rect(c[0]+dx*(S/2)-1.5-(1.5*dx),c[1]+dy*(S/2)-1.5-(1.5*dy),3,3,'ln')
    for dx,dy in [(1,1),(-1,1),(1,-1),(-1,-1)]:
        d.rect(c[0]+dx*24-5,c[1]+dy*24-5,10,10);d.circ(c[0]+dx*24,c[1]+dy*24,2.6,'ln fine');d.circ(c[0]+dx*12,c[1]+dy*12,2.6,'ln fine')
    n=22
    for i in range(n):
        for k in range(n):
            x=x0+2+(S-4)*i/(n-1);y=y0+2+(S-4)*k/(n-1)
            if abs(x-c[0])>5.5 or abs(y-c[1])>5.5: d.circ(x,y,.28,'dot')
    d.hdim(x0,x0+S,-1.2,f'about {S} m if square ({v["area_sqft"]:,} sq ft)')
    d.label(c[0]+2,c[1]+2,x0+S+3,c[1]+10,'chaumukha','four-faced Adinatha');d.label(c[0]+S/2,c[1],x0+S+3,c[1],'doorway','one of four');d.label(c[0]+24,c[1]+24,x0+S+3,c[1]+24,'corner shrine','');d.label(c[0]+12,c[1]-12,x0+S+3,c[1]-12,'dome',f'{v["domes"]} in all');d.label(x0+S-2,y0+6,x0+S+3,y0+4,'pillars',f'{v["pillars"]:,}; grid indicative')
    return d.svg('Plan of the Ranakpur Jain temple showing the four-faced sanctum and four doorways')
def elephanta(v):
    S=v['hall_m'][0];d=Dw(S+30,S+6,(8,4,10,7));x0,y0=3,3
    d.path([(x0,y0),(x0+S,y0),(x0+S,y0+S*.36)]);d.path([(x0+S,y0+S*.64),(x0+S,y0+S),(x0+S*.64,y0+S)]);d.path([(x0+S*.36,y0+S),(x0,y0+S),(x0,y0+S*.64)]);d.path([(x0,y0+S*.36),(x0,y0)])
    for i in range(1,6):
        for k in range(1,6):
            x=x0+S*i/6;y=y0+S*k/6
            if not (S*.58<x-x0<S*.86 and S*.36<y-y0<S*.64): d.rect(x-.9,y-.9,1.8,1.8,'ln fine')
    lx,ly=x0+S*.72,y0+S*.5;d.rect(lx-4.6,ly-4.6,9.2,9.2);d.circ(lx,ly,1.3,'ln fine')
    for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]: d.path([(lx+dx*4.6-dy*1.2,ly+dy*4.6-dx*1.2),(lx+dx*4.6+dy*1.2,ly+dy*4.6+dx*1.2)],'gnd')
    d.raw(f'M{x0+S/2-4} {d.f(y0)}v2.6h8v-2.6','ln');d.arc(x0+S/2-2.4,y0+.3,1.1,1.6,'ln fine',10);d.arc(x0+S/2,y0+.3,1.3,2,'ln fine',10);d.arc(x0+S/2+2.4,y0+.3,1.1,1.6,'ln fine',10)
    d.hdim(x0,x0+S,y0-3.4+1,f'about {S} m across')
    d.label(x0+S/2+3,y0+1.6,x0+S+4,y0+2,'Trimurti',f'{v["trimurti_height_m"]} m, three-headed Shiva');d.label(lx+4.6,ly+2,x0+S+4,ly+6,'linga shrine','four doors');d.label(x0+S*5/6,y0+S*5/6,x0+S+4,y0+S*5/6+2,'pillars','left standing in the rock; grid indicative');d.label(x0+S/2,y0+S,x0+S+4,y0+S+1,'north entrance','main axis');d.label(x0+S,y0+S/2,x0+S+4,y0+S*.36,'east court','')
    return d.svg('Plan of the Great Cave at Elephanta with the Trimurti and linga shrine')
PLATES=[('nagara',nagara,'Nagara','Side elevation','The northern form. The tower over the sanctum curves inward as it rises, and the halls step up toward it like foothills to a peak.'),('dravidian',dravida,'Dravida','Front elevation','The southern form. A square sanctum wall carries a pyramid of diminishing storeys, closed by a neck and a single capstone.'),('sun_temple',konark,'Kalinga','Side elevation','The Odishan form, here built as the chariot of the Sun: a platform on wheels, a hall with a stepped roof, and a tower that has fallen.'),('stupa',stupa,'Stupa','Elevation','A solid dome over a relic, circled on foot. The railing and gateways came after the dome.'),('kashmiri',martand,'Kashmiri','Plan and shrine elevation','A shrine set in a colonnaded court, with the steep peaked roof and trefoil arch that mark the Kashmiri style.'),('jain',ranakpur,'Chaumukha','Plan','A four-faced image at the centre, open to four doorways, in a forest of pillars and domes.'),('elephanta',elephanta,'Rock-cut','Plan','Not built but excavated. The hall, its pillars and its sculpture are one piece of basalt.')]
