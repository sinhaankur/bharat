(function(){
const HI={"Today": "आज", "Money and power": "धन और सत्ता", "Land and water": "भूमि और जल", "The long story": "लंबी कथा", "Words and craft": "शब्द और शिल्प", "Receipts": "प्रमाण", "What is happening, and who is telling it?": "क्या हो रहा है, और कौन बता रहा है?", "Where does public money go, and who answers for it?": "जनता का पैसा कहाँ जाता है, और जवाबदेह कौन है?", "What is the ground like, and where is it unsafe to build?": "ज़मीन कैसी है, और कहाँ बनाना असुरक्षित है?", "How did we get here?": "हम यहाँ तक कैसे पहुँचे?", "How do we speak, write and make?": "हम कैसे बोलते, लिखते और रचते हैं?", "How do you know?": "आप यह कैसे जानते हैं?", "The News Journey": "ख़बर की यात्रा", "Today's news": "आज की ख़बरें", "The spin check": "झुकाव की जाँच", "How it built up": "बात कैसे बढ़ी", "Analysis": "विश्लेषण", "The money map": "धन का नक्शा", "Which states carry the country": "कौन से राज्य देश का भार उठाते हैं", "Ask your own question": "अपना सवाल पूछें", "Who's in charge": "ज़िम्मेदार कौन", "Officials to track": "अधिकारी, जिन पर नज़र रहे", "How it all connects": "सब कैसे जुड़ा है", "The 7 engines": "सात इंजन", "India vs the world": "भारत और दुनिया", "The geopolitical board": "भू-राजनीति की बिसात", "Compare with the US": "अमेरिका से तुलना", "The whole atlas on one screen": "पूरा एटलस एक पर्दे पर", "Built where water returns": "जहाँ पानी लौटता है, वहाँ निर्माण", "The land in 3D": "भूमि, त्रि-आयाम में", "Raise the water": "पानी बढ़ाकर देखें", "Earthquakes and tsunamis": "भूकंप और सुनामी", "India by constraint": "बाधाओं के अनुसार भारत", "The globe": "ग्लोब", "Globe to flat map": "ग्लोब से समतल नक्शा", "5,000 years, one timeline": "पाँच हज़ार वर्ष, एक समयरेखा", "Ashoka's empire": "अशोक का साम्राज्य", "Temples and sacred ground": "मंदिर और पवित्र भूमि", "How temples are shaped": "मंदिरों की बनावट", "Walk inside a temple": "मंदिर के भीतर चलें", "Temples in 3D": "मंदिर, त्रि-आयाम में", "Who we are, in DNA": "हम कौन हैं, डीएनए में", "The social fabric": "समाज का ताना-बाना", "History's deadliest events": "इतिहास की सबसे घातक घटनाएँ", "History race": "इतिहास की दौड़", "Languages and scripts of Bharat": "भारत की भाषाएँ और लिपियाँ", "The journey of a word": "एक शब्द की यात्रा", "The script family tree": "लिपियों का वंश-वृक्ष", "One text, many tongues": "एक पाठ, अनेक भाषाएँ", "Reading room": "वाचनालय", "The tribes that made it": "जनजातियाँ, जिन्होंने इसे रचा", "Indic design systems": "भारतीय डिज़ाइन प्रणालियाँ", "India by design systems": "डिज़ाइन प्रणालियों में भारत", "Atomic reference": "मूल संदर्भ", "The canvas": "कैनवास", "How it works": "यह कैसे काम करता है", "Methodology and honesty": "पद्धति और ईमानदारी", "The data and sources": "आँकड़े और स्रोत", "Every figure to its source": "हर आँकड़ा, अपने स्रोत तक", "Sources": "स्रोत", "Get the data": "आँकड़े लें", "For organisations": "संस्थाओं के लिए", "Share": "साझा करें", "Privacy and policy": "निजता और नीति", "Site map": "साइट का नक्शा", "Search": "खोजें", "Close": "बंद करें", "Home": "मुखपृष्ठ", "Previous": "पिछला", "Next": "अगला", "Section": "खंड", "Back to": "वापस", "Watch the repo on GitHub": "GitHub पर रिपॉज़िटरी देखें", "Sourced, or it's a gap. Never fabricated.": "स्रोत सहित, वरना रिक्त। गढ़ा हुआ कभी नहीं।", "An independent, non-commercial research project. Not affiliated with any government body.": "एक स्वतंत्र, गैर-व्यावसायिक शोध परियोजना। किसी सरकारी संस्था से संबद्ध नहीं।", "How we know": "हम यह कैसे जानते हैं", "Search every view, for example flood or temple": "हर पृष्ठ में खोजें, जैसे बाढ़ या मंदिर", "Open the live view": "मूल पृष्ठ खोलें"};
let LANG='en';try{LANG=localStorage.getItem('bh_lang')||'en'}catch(e){}
/* the 9 Indic skins (class on <html>, remembered in localStorage) — the design system's
   signature. Matches ds-page.js's registry. Default = Mauryan · temple (dark). */
const SKINS=[['theme-mauryan theme-dark','Mauryan · temple'],['theme-mauryan theme-light','Mauryan · stone'],['theme-gupta theme-dark','Gupta · cave'],['theme-gupta theme-light','Gupta · plaster'],['theme-chola theme-dark','Chola · sanctum'],['theme-chola theme-light','Chola · granite'],['theme-rajput theme-dark','Rajput · sheesh'],['theme-rajput theme-light','Rajput · wasli'],
  ['theme-kashmir theme-light','Kashmir'],['theme-tamil theme-light','Tamil Nadu'],['theme-kerala theme-light','Kerala'],['theme-assam theme-light','Assam'],['theme-naga theme-light','Nagaland'],['theme-rajasthan theme-light','Rajasthan'],
  ['theme-light','House · gold']];
let SKIN='theme-mauryan theme-dark';try{SKIN=localStorage.getItem('bh_skin')||SKIN}catch(e){}
const T=s=>LANG==='hi'&&HI[s]||s;
const N=window.NAV,doc=document,root=doc.documentElement,body=doc.body;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const here=(location.pathname.split('/').pop()||'index.html');
const door=+body.dataset.door;
const SYM={};new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+window.SPRITE+'</svg>','image/svg+xml').querySelectorAll('symbol').forEach(y=>{let a='';for(const t of y.attributes)if(t.name!=='id')a+=' '+t.name+'="'+t.value+'"';SYM[y.id]={a:a,h:y.innerHTML}});
const ico=(id)=>{const y=SYM[id];return y?'<svg'+(/viewBox/.test(y.a)?'':' viewBox="0 0 32 32"')+y.a+' aria-hidden="true">'+y.h+'</svg>':''};
/* sprite */
const sp=doc.createElement('div');sp.style.cssText='position:absolute;width:0;height:0;overflow:hidden';sp.setAttribute('aria-hidden','true');sp.innerHTML='<svg><defs>'+window.SPRITE+'</defs></svg>';body.prepend(sp);
doc.querySelectorAll('svg>use').forEach(u=>{const id=(u.getAttribute('href')||'').slice(1),sv=u.parentNode;if(SYM[id]&&!sv.closest('[style*="position:absolute"]')){const t=doc.createElement('span');t.innerHTML=ico(id);const n=t.firstChild;if(sv.getAttribute('class'))n.setAttribute('class',sv.getAttribute('class'));sv.replaceWith(n)}});
/* header */
let rays='';for(let k=0;k<24;k++){const a=k/24*Math.PI*2,r1=k%2?48:49.5,c=Math.cos(a),s=Math.sin(a);rays+='M'+(50+46*c).toFixed(1)+' '+(50+46*s).toFixed(1)+'L'+(50+r1*c).toFixed(1)+' '+(50+r1*s).toFixed(1)}
const seal='<svg class="seal" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="#cc8900"><path class="rays" d="'+rays+'" stroke-width="1.4" stroke-linecap="round" opacity=".62"/><circle cx="50" cy="50" r="45" stroke-width="4"/><circle cx="50" cy="50" r="39" stroke-width="6" stroke-dasharray="2.5 7.7"/></g><circle cx="50" cy="22" r="3.2" fill="#cc8900"/><text data-bha x="50" y="62" text-anchor="middle">भ</text><path d="M34 72Q50 64 66 72M38 79Q50 72 62 79" stroke="#f4efe4" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>';
const lock='<a class="lockup" href="index.html" aria-label="Bharat, home">'+seal+'<span class="word">Bharat<i>.</i></span><span class="tag">INDIC DESIGNS</span></a>';
const hd=doc.createElement('header');hd.className='hd';
hd.innerHTML=lock+'<nav class="doorsnav" aria-label="Sections">'+N.map((d,i)=>'<div class="dn'+(i===door?' cur':'')+'"><a href="'+d.h+'">'+ico(d.i)+T(d.l)+'</a><div class="menu"><p class="q">'+T(d.q)+'</p>'+d.p.map(p=>'<a href="'+p[0]+'"'+(p[0]===here?' aria-current="page"':'')+'>'+T(p[1])+'</a>').join('')+'</div></div>').join('')+'</nav><label class="skin" aria-label="Indic skin"><span class="skin-ic" aria-hidden="true">◈</span><select id="skinsel">'+SKINS.map(s=>'<option value="'+s[0]+'"'+(SKIN===s[0]?' selected':'')+'>'+s[1]+'</option>').join('')+'</select></label><div class="lang" role="group" aria-label="Language"><button type="button" data-l="en" aria-pressed="'+(LANG==='en')+'">EN</button><button type="button" data-l="hi" lang="hi" aria-pressed="'+(LANG==='hi')+'">हिं</button></div><button class="hbtn" id="find" type="button" aria-label="Search every view"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4.5 4.5"/></svg><span>'+T('Search')+'</span></button><button class="hbtn" id="burger" type="button" aria-label="Open menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>';
body.prepend(hd);
const lamps=doc.createElement('canvas');lamps.id='lamps';lamps.setAttribute('aria-hidden','true');body.prepend(lamps);
const wipe=doc.createElement('div');wipe.className='wipe';body.append(wipe);
/* overlay: search and menu */
const ov=doc.createElement('div');ov.className='ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Every view');
ov.innerHTML='<button class="hbtn x" type="button">Close</button><input type="search" placeholder="Search every view, for example flood or temple" aria-label="Search every view"><div class="ovgrid">'+N.map(d=>'<div><h3><a href="'+d.h+'" style="color:inherit;padding:0;font:inherit">'+T(d.l)+'</a></h3>'+d.p.map(p=>'<a href="'+p[0]+'" data-k="'+(p[1]+' '+p[2]+' '+d.l).toLowerCase().replace(/"/g,'')+' '+T(p[1])+'">'+T(p[1])+'</a>').join('')+'</div>').join('')+'</div>';
body.append(ov);
const inp=ov.querySelector('input');let last=null;
const open=()=>{last=doc.activeElement;ov.classList.add('open');inp.value='';filt();inp.focus()},close=()=>{ov.classList.remove('open');last&&last.focus()};
function filt(){const q=inp.value.trim().toLowerCase();ov.querySelectorAll('.ovgrid>div').forEach(g=>{let n=0;g.querySelectorAll('a[data-k]').forEach(a=>{const ok=!q||a.dataset.k.includes(q);a.hidden=!ok;if(ok)n++});g.hidden=!n})}
inp.addEventListener('input',filt);
doc.getElementById('find').onclick=open;doc.getElementById('burger').onclick=open;ov.querySelector('.x').onclick=close;
addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='/'&&!/INPUT|TEXTAREA/.test(doc.activeElement.tagName)){e.preventDefault();open()}});
/* footer */
const ft=doc.createElement('footer');
ft.innerHTML='<div class="wrap"><div class="fcols"><div><p class="credo">'+T("Sourced, or it's a gap. Never fabricated.")+'</p><a href="sitemap.html">'+T('Site map')+'</a><a href="https://github.com/sinhaankur/bharat">'+T('Watch the repo on GitHub')+'</a></div>'+N.map(d=>'<div><h4>'+T(d.l)+'</h4>'+d.p.slice(0,5).map(p=>'<a href="'+p[0]+'">'+T(p[1])+'</a>').join('')+'<a href="'+d.h+'">All '+d.p.length+'</a></div>').join('')+'</div><div class="saw" aria-hidden="true"></div><div class="base"><span>Bharat · Indic Designs</span><span class="scr" aria-hidden="true">भ ভ ਭ ભ ଭ భ ಭ ഭ</span><span>SOURCED, OR IT\'S A GAP</span></div><p class="note">'+T('An independent, non-commercial research project. Not affiliated with any government body.')+'</p></div>';
body.append(ft);
/* skin switcher — swap the <html> theme class live + remember it */
const skinSel=doc.getElementById('skinsel');
if(skinSel)skinSel.onchange=()=>{const v=skinSel.value;root.className=v;try{localStorage.setItem('bh_skin',v)}catch(e){}};
/* language */
hd.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{try{localStorage.setItem('bh_lang',b.dataset.l)}catch(e){}location.reload()});
if(LANG==='hi'){root.lang='hi';const tx=el=>{[...el.childNodes].forEach(n=>{if(n.nodeType===3){const k=n.textContent.trim();if(HI[k])n.textContent=n.textContent.replace(k,HI[k])}})};
  doc.querySelectorAll('.crumb a,.nextprev span,.how b,.btn.solid,.card h3,.sm-cols a,.sm-cols h2 a,.sm-cols .q').forEach(tx);
  const k=doc.querySelector('.kick');if(k){[...k.childNodes].forEach(n=>{if(n.nodeType===3){n.textContent=n.textContent.split(' · ').map(x=>HI[x.trim()]||x).join(' · ')}})}
  const cr=doc.querySelector('.crumb');if(cr){const ln=cr.lastChild;if(ln&&ln.nodeType===3){ln.textContent=ln.textContent.split(' / ').map(x=>HI[x.trim()]||x).join(' / ')}}
  doc.querySelectorAll('.nextprev a').forEach(a=>{const n=a.lastChild;if(n&&n.nodeType===3&&HI[n.textContent.trim()])n.textContent=HI[n.textContent.trim()]});
  const h=doc.querySelector('.hero h1');if(h&&doc.querySelector('.doorpage')){}}
/* embedded originals: size to content */
doc.querySelectorAll('iframe.emb').forEach(f=>{const fit=()=>{try{const d=f.contentDocument;if(d&&d.documentElement)f.style.height=Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight:0)+'px'}catch(e){}};f.addEventListener('load',()=>{fit();setTimeout(fit,800);setTimeout(fit,2500);try{new ResizeObserver(fit).observe(f.contentDocument.body)}catch(e){}})});
/* seal glyph cycle */
const G=['भ','ভ','ਭ','ભ','ଭ','భ','ಭ','ഭ'];let gi=0;
if(!reduce)setInterval(()=>{gi=(gi+1)%G.length;doc.querySelectorAll('[data-bha]').forEach(t=>{t.style.opacity=0;setTimeout(()=>{t.textContent=G[gi];t.style.opacity=1},350)})},1400);
/* title words */
const h1=doc.querySelector('h1');if(h1){let i=0;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=doc.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(w=>{if(!w.trim()){f.append(w);return}const s=doc.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=w;f.append(s)});c.replaceWith(f)}else walk(c)})};walk(h1)}
/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);e.target.querySelectorAll('[data-n]').forEach(count)}}),{rootMargin:'0px 0px -8% 0px'});
doc.querySelectorAll('[data-r]').forEach(el=>{const sib=el.parentElement.children;el.style.setProperty('--d',Math.min([...sib].indexOf(el),8));io.observe(el)});
function count(el){const n=+el.dataset.n;if(reduce||!n){return}const t0=performance.now(),dur=1300,dec=(el.dataset.n.split('.')[1]||'').length;(function f(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=(n*e).toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec});if(k<1)requestAnimationFrame(f)})(t0)}
/* line drawings: normalise path length */
doc.querySelectorAll('.draw .ln,.pl .ln,.mapsvg .rv').forEach(p=>p.setAttribute('pathLength','1'));
/* header shrink */
addEventListener('scroll',()=>hd.classList.toggle('sm',scrollY>30),{passive:true});
/* page wipe */
requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('ready')));
addEventListener('pageshow',()=>{root.classList.remove('leaving','go');root.classList.add('ready')});
if(!reduce)doc.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||a.target)return;const h=a.getAttribute('href');if(/^(https?:|#|mailto:)/.test(h)||h.split('#')[0]===here)return;e.preventDefault();root.classList.add('leaving');requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('go')));setTimeout(()=>location.href=h,180)});
/* tables: sort and filter */
doc.querySelectorAll('table.sort').forEach(t=>{const tb=t.tBodies[0];t.querySelectorAll('th').forEach((th,ci)=>{th.tabIndex=0;const go=()=>{const asc=th.getAttribute('aria-sort')!=='ascending';t.querySelectorAll('th').forEach(o=>o.removeAttribute('aria-sort'));th.setAttribute('aria-sort',asc?'ascending':'descending');const rows=[...tb.rows];const v=r=>{const c=r.cells[ci];return c.dataset.v!==undefined?+c.dataset.v:c.textContent.trim().toLowerCase()};rows.sort((a,b)=>{const x=v(a),y=v(b);return (x>y?1:x<y?-1:0)*(asc?1:-1)});rows.forEach(r=>tb.append(r))};th.onclick=go;th.onkeydown=e=>{if(e.key==='Enter')go()}})});
doc.querySelectorAll('input.filter').forEach(f=>{const rows=doc.querySelectorAll('#'+f.dataset.for+' tbody tr, #'+f.dataset.for+' .card');f.addEventListener('input',()=>{const q=f.value.trim().toLowerCase();rows.forEach(r=>r.style.display=!q||r.textContent.toLowerCase().includes(q)?'':'none')})});
/* maps */
const NS='http://www.w3.org/2000/svg',el=(n,a)=>{const e=doc.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e};
const heldDraw=(svg,det)=>{const B=window.BASE;if(!B.held)return;const id='hp'+Math.random().toString(36).slice(2,7);const df=el('defs',{});df.innerHTML='<pattern id="'+id+'" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="rgba(18,13,10,.55)"/><line x1="0" y1="0" x2="0" y2="5" stroke="#f4efe4" stroke-width="1.6" opacity=".8"/></pattern>';svg.append(df);
  B.held.forEach(h=>{const p=el('path',{d:h.d,class:'held',fill:'url(#'+id+')',tabindex:0,role:'button','aria-label':h.n+', claimed by India'});const show=()=>{det.style.setProperty('--c','#f4efe4');det.innerHTML='<p class="k">Claimed by India · administered by '+(h.k==='P'?'Pakistan':'China')+'</p><h3>'+h.n+'</h3><dl class="kv">'+h.rows.map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('')+'</dl>'};p.addEventListener('click',show);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});const t=el('title',{});t.textContent=h.n;p.append(t);svg.append(p)})};
doc.querySelectorAll('[data-map]').forEach(m=>{const B=window.BASE;if(!B)return;const L=JSON.parse(m.querySelector('script').textContent);
  const svg=m.querySelector('svg'),det=m.querySelector('.detail'),chips=m.querySelector('.chips');svg.setAttribute('viewBox','0 0 '+B.dim[0]+' '+B.dim[1]);
  const g=el('g',{});B.states.forEach(s=>{const p=el('path',{d:s.d,class:'st'});const t=el('title',{});t.textContent=s.n;p.append(t);g.append(p)});svg.append(g);svg.append(el('path',{d:B.rivers,class:'rv',pathLength:1}));heldDraw(svg,det);
  let sel=null,i=0;
  L.forEach(l=>{l.g=el('g',{style:'--c:'+l.c});l.on=l.on!==false;
    l.pts.slice().sort((a,b)=>(b.r||0)-(a.r||0)).forEach(x=>{const c=el('circle',{cx:x.p[0],cy:x.p[1],r:x.r||3.6,class:'pt'+(l.ring?' ring':''),tabindex:0,role:'button','aria-label':l.n+': '+x.h,style:'--i:'+(i++%200)});
      const show=()=>{sel&&sel.classList.remove('sel');sel=c;c.classList.add('sel');det.style.setProperty('--c',l.c);det.innerHTML='<p class="k">'+x.k+'</p><h3>'+x.h+'</h3><dl class="kv">'+x.rows.map(r=>'<dt>'+r[0]+'</dt><dd>'+r[1]+'</dd>').join('')+'</dl>'};
      c.addEventListener('click',show);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}});l.g.append(c)});
    svg.append(l.g);
    if(L.length>1){const b=doc.createElement('button');b.type='button';b.style.setProperty('--c',l.c);b.innerHTML='<i></i>'+l.n+' · '+l.pts.length;b.setAttribute('aria-pressed',l.on);b.onclick=()=>{l.on=!l.on;b.setAttribute('aria-pressed',l.on);l.g.style.display=l.on?'':'none'};chips.append(b)}
    l.g.style.display=l.on?'':'none'})});
/* news stories */
doc.querySelectorAll('[data-stories]').forEach(m=>{const D=JSON.parse(m.querySelector('script').textContent),S=D.stories,by={};S.forEach(s=>by[s.id]=s);
  const list=m.querySelector('.stories'),q=m.querySelector('input'),fb=m.querySelector('[name=bias]'),fm=m.querySelector('[name=month]'),fs=m.querySelector('[name=sort]'),cnt=m.querySelector('.count');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const LN={L:'Left-leaning',C:'Centre',R:'Right-leaning',S:'State media',U:'Not assessed'},K=['L','C','R','S','U'];
  const fmt=d=>new Date(d+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  [...new Set(S.map(s=>s.b.slice(0,7)))].sort().reverse().forEach(mo=>{const o=doc.createElement('option');o.value=mo;o.textContent=new Date(mo+'-01T00:00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'});fm.append(o)});
  const bar=s=>{const t=s.L.reduce((a,b)=>a+b,0);return '<div class="bias" role="img" aria-label="'+K.map((k,i)=>s.L[i]+' '+LN[k]).join(', ')+'">'+K.map((k,i)=>s.L[i]?'<i class="b'+k+'" style="width:'+(s.L[i]/t*100)+'%"></i>':'').join('')+'</div><div class="bleg"><span>Left '+s.L[0]+'</span><span>Centre '+s.L[1]+'</span><span>Right '+s.L[2]+'</span></div>'};
  const lk=id=>{const o=by[id];return o?'<button class="lk" type="button" data-go="'+id+'"><span>'+fmt(o.a)+'</span>'+esc(o.t)+'</button>':''};
  const body=s=>{const mx=Math.max(...s.d.map(x=>x[1]));return '<div class="in2"><div><h4>Who reported it</h4><ul class="cov">'+s.i.map(x=>'<li><i class="b'+x[1]+'" title="'+LN[x[1]]+'"></i><b>'+esc(D.outlets[x[0]])+'</b><span><a href="'+esc(x[3])+'" rel="noopener nofollow" target="_blank">'+esc(x[2])+'</a><small>'+x[4].slice(5)+'</small></span></li>').join('')+'</ul></div><div><h4>Day by day</h4><div class="daybars">'+s.d.map(x=>'<i style="height:'+(x[1]/mx*100)+'%" title="'+x[0]+': '+x[1]+'"></i>').join('')+'</div><p class="meta">'+fmt(s.a)+(s.a!==s.b?' to '+fmt(s.b):'')+' · '+s.n+' reports</p>'+(s.bl?'<h4>Blindspot</h4><p class="meta">Among outlets with a published lean, almost all coverage came from the '+(s.bl==='L'?'right and centre; none from left-leaning outlets':'left and centre; none from right-leaning outlets')+' in this feed.</p>':'')+(s.ch.length?'<h4>The same story, at other times</h4>'+s.ch.map(lk).join(''):'')+(s.rl.length?'<h4>Related, same days</h4>'+s.rl.map(lk).join(''):'')+'</div></div>'};
  function draw(){const t=q.value.trim().toLowerCase(),b=fb.value,mo=fm.value;let r=S.filter(s=>(!t||(s.t+' '+s.k.join(' ')+' '+s.st+' '+s.i.map(x=>D.outlets[x[0]]).join(' ')).toLowerCase().includes(t))&&(!mo||s.a.slice(0,7)<=mo&&s.b.slice(0,7)>=mo)&&(!b||(b==='bl'?s.bl:b==='all3'?s.L[0]&&s.L[1]&&s.L[2]:b==='chain'?s.ch.length:s.bl===b)));
    r.sort(fs.value==='big'?(a,b)=>b.g-a.g||b.n-a.n:(a,b)=>a.b<b.b?1:-1);cnt.textContent=r.length+' of '+S.length+' stories';
    list.innerHTML=r.slice(0,80).map(s=>'<details class="story" id="s'+s.id+'"><summary><div><p class="dt">'+fmt(s.b)+(s.st?' · '+esc(s.st):'')+(s.bl?' · <span class="chip">blindspot: '+(s.bl==='L'?'left':'right')+'</span>':'')+(s.ch.length?' · <span class="chip t">ongoing</span>':'')+'</p><h3>'+esc(s.t)+'</h3><p class="meta">'+s.g+' independent outlets · '+s.n+' reports</p></div><div>'+bar(s)+'</div></summary></details>').join('')+(r.length>80?'<p class="note">Showing the first 80. Narrow the search to see the rest.</p>':'')}
  list.addEventListener('toggle',e=>{const d=e.target;if(d.open&&!d.dataset.f){d.dataset.f=1;d.insertAdjacentHTML('beforeend',body(by[d.id.slice(1)]))}},true);
  list.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(!g)return;q.value='';fb.value='';fm.value='';draw();const d=doc.getElementById('s'+g.dataset.go);if(d){d.open=true;d.scrollIntoView({block:'start'})}});
  [q,fb,fm,fs].forEach(x=>x.addEventListener('input',draw));draw()});
/* choropleth */
doc.querySelectorAll('[data-choro]').forEach(m=>{const B=window.BASE;if(!B)return;const C=JSON.parse(m.querySelector('script').textContent);
  const svg=m.querySelector('svg'),det=m.querySelector('.detail'),chips=m.querySelector('.chips'),leg=m.querySelector('.legend');svg.setAttribute('viewBox','0 0 '+B.dim[0]+' '+B.dim[1]);
  let cur=C.metrics[0],sel=null;const paths=[];const GEO=C.geo?window[C.geo]:B.states;
  const mix=t=>{const a=[42,29,21],b=[240,180,41];return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(',')+')'};
  const show=(s,p)=>{sel&&sel.classList.remove('sel');sel=p;p.classList.add('sel');det.innerHTML='<p class="k">'+(C.kind||'State')+'</p><h3>'+s.n+'</h3><dl class="kv">'+C.metrics.map(M=>'<dt>'+M.n+'</dt><dd>'+(M.vals[s.n]!==undefined?M.fmt[s.n]:'<span class="chip">gap</span>')+'</dd>').join('')+'</dl>'+(C.notes[s.n]?'<p class="note">'+C.notes[s.n]+'</p>':'')+(C.links&&C.links[s.n]?'<a class="btn" href="'+C.links[s.n]+'">Open '+s.n+'</a>':'')};
  GEO.forEach(s=>{const p=el('path',{d:s.d,class:'st ch',tabindex:0,role:'button','aria-label':s.n});p.addEventListener('click',()=>show(s,p));p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(s,p)}});svg.append(p);paths.push([s,p])});
  const paint=()=>{const vs=Object.values(cur.vals),mx=Math.max(...vs),mn=Math.min(...vs);paths.forEach(([s,p])=>{const v=cur.vals[s.n];p.style.fill=v===undefined?'#1a1310':mix(mx===mn?1:Math.pow((v-mn)/(mx-mn),.6))});leg.innerHTML='<span>low</span><i></i><span>high</span><span>'+cur.note+'</span>'};
  heldDraw(svg,det);C.metrics.forEach(M=>{const b=doc.createElement('button');b.type='button';b.style.setProperty('--c','#f0b429');b.innerHTML='<i></i>'+M.n;b.setAttribute('aria-pressed',M===cur);b.onclick=()=>{cur=M;chips.querySelectorAll('button').forEach(o=>o.setAttribute('aria-pressed',o===b));paint()};chips.append(b)});paint()});
/* micro and deep motion */
if(!reduce){
  const pr=doc.createElement('div');pr.className='prog';body.append(pr);
  const hero=doc.querySelector('.hero');
  if(hero&&N[door]){const sg=doc.createElement('div');sg.className='sigil';sg.setAttribute('aria-hidden','true');const sym=SYM[N[door].i];if(sym){sg.innerHTML=ico(N[door].i);sg.querySelectorAll('path,circle,rect,line').forEach(p=>p.setAttribute('pathLength','1'));doc.querySelector('main').prepend(sg)}}
  doc.querySelectorAll('.dn .menu').forEach(m=>[...m.querySelectorAll('a')].forEach((a,i)=>a.style.setProperty('--k',i)));
  ov.querySelectorAll('.ovgrid>div').forEach((d,i)=>d.style.setProperty('--k',i));
  doc.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.card,.tile,.story>summary');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  doc.querySelectorAll('.detail').forEach(d=>new MutationObserver(()=>{d.classList.remove('flash');void d.offsetWidth;d.classList.add('flash')}).observe(d,{childList:true}));
  doc.querySelectorAll('.stories').forEach(l=>new MutationObserver(()=>l.querySelectorAll('.daybars').forEach(b=>[...b.children].forEach((i,k)=>i.style.setProperty('--k',k)))).observe(l,{childList:true,subtree:true}));
  doc.querySelectorAll('.mapsvg').forEach(svg=>{const ps=svg.querySelectorAll('.st');ps.forEach(p=>{try{const b=p.getBBox();p.style.setProperty('--w',Math.round((b.y+b.height/2)*1.1))}catch(e){}})});
  const fills=[...doc.querySelectorAll('.spine,.rail ol')];let tick=false;
  const upd=()=>{tick=false;const y=scrollY,max=doc.documentElement.scrollHeight-innerHeight;root.style.setProperty('--sp',max>0?(y/max).toFixed(4):0);root.style.setProperty('--sy',Math.round(y));root.style.setProperty('--hy',Math.min(y,700));
    const mid=innerHeight*.62;fills.forEach(f=>{const r=f.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const k=Math.max(0,Math.min(1,(mid-r.top)/r.height));f.style.setProperty('--fill',k.toFixed(3));if(f.tagName==='OL')[...f.children].forEach(li=>li.classList.toggle('on',li.getBoundingClientRect().top<mid))})};
  addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});addEventListener('resize',upd);upd();
}
/* river of lamps */
if(!reduce){const c=lamps,x=c.getContext('2d');let W,H,D=Math.min(devicePixelRatio||1,2);const P=[];const tint=getComputedStyle(body).getPropertyValue('--era').trim()||'#f0b429';
  const size=()=>{W=c.width=innerWidth*D;H=c.height=innerHeight*D};size();addEventListener('resize',size);
  for(let i=0;i<34;i++){const z=Math.random();P.push({u:Math.random(),lane:Math.random(),s:.2+z*.9,r:.5+z*2,z:z,ph:Math.random()*6.28})}let mx=0,my=0,tx=0,ty=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)},{passive:true});
  let run=true;doc.addEventListener('visibilitychange',()=>{run=!doc.hidden;if(run)requestAnimationFrame(tick)});
  function tick(t){if(!run)return;x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';const sc=scrollY*.00025;mx+=(tx-mx)*.04;my+=(ty-my)*.04;
    for(const p of P){const u=(p.u+t*.000012*p.s+sc*p.s)%1;const px=u*W*1.2-W*.1-mx*40*D*p.z;const py=H*(.16+p.lane*.3)+Math.sin(u*7+p.ph)*H*.06+Math.sin(t*.0006+p.ph)*6*D-scrollY*.12*p.z*D-my*26*D*p.z;const a=(.18+.3*Math.sin(t*.0016+p.ph)**2)*Math.sin(u*Math.PI)*(.45+p.z*.55);
      const R=p.r*D*5;const gr=x.createRadialGradient(px,py,0,px,py,R);gr.addColorStop(0,'rgba(255,214,120,'+a+')');gr.addColorStop(1,'rgba(240,180,41,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,R,0,6.28);x.fill()}
    requestAnimationFrame(tick)}
  requestAnimationFrame(tick)}
})();
