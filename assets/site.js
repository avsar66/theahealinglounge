/* ============================================================
 THE HEALING LOUNGE, site chrome, i18n, interactions
 Bilingual via data-nl / data-en (and -html / -ph variants).
 ============================================================ */
(function(){
 const MEDIA = 'https://www-static.thehealinglounge.nl/wp-content/uploads/';
 window.HL_MEDIA = MEDIA;

 /* ---------------- language ---------------- */
 const LANG_KEY = 'hl_lang';
 function getLang(){ return localStorage.getItem(LANG_KEY) || 'nl'; }
 function applyLang(lang){
 document.documentElement.lang = lang;
 document.querySelectorAll('[data-nl]').forEach(el=>{
 const v = el.getAttribute('data-'+lang); if(v!=null) el.textContent = v;
 });
 document.querySelectorAll('[data-nl-html]').forEach(el=>{
 const v = el.getAttribute('data-'+lang+'-html'); if(v!=null) el.innerHTML = v;
 });
 document.querySelectorAll('[data-nl-ph]').forEach(el=>{
 const v = el.getAttribute('data-'+lang+'-ph'); if(v!=null) el.setAttribute('placeholder', v);
 });
 document.querySelectorAll('.lang button').forEach(b=>{
 b.classList.toggle('on', b.dataset.lang===lang);
 });
 localStorage.setItem(LANG_KEY, lang);
 window.dispatchEvent(new CustomEvent('hl-lang', {detail:lang}));
 }
 window.HL_setLang = applyLang;
 window.HL_getLang = getLang;

 /* ---------------- header ---------------- */
 const NAV = [
 {href:'index.html', nl:'Home', en:'Home', page:'home'},
 {href:'behandelingen.html', nl:'Behandelingen', en:'Treatments', page:'treatments'},
 {href:'over-ons.html', nl:'Over ons', en:'About', page:'about'},
 {href:'contact.html', nl:'Contact', en:'Contact', page:'contact'},
 ];
 function buildHeader(){
 const host = document.querySelector('[data-site-header]');
 if(!host) return;
 const page = document.body.dataset.page;
 const onDark = host.hasAttribute('data-on-dark');
 const navHtml = NAV.map(n=>`<a href="${n.href}" class="${n.page===page?'active':''}" data-nl="${n.nl}" data-en="${n.en}">${n.nl}</a>`).join('');
 host.className = 'site-header ' + (onDark ? 'transparent on-dark' : 'solid');
 host.innerHTML = `
 <a class="brand" href="index.html" aria-label="The Healing Lounge home">
 <img class="mark" src="${(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png'}" alt="" style="border:0;padding:0;object-fit:contain">
 <span>The Healing Lounge<small>Leusden</small></span>
 </a>
 <nav class="nav">${navHtml}</nav>
 <div class="header-right">
 <div class="lang" role="group" aria-label="Taal / Language">
 <button data-lang="nl" aria-label="Nederlands"><span>NL</span></button>
 <button data-lang="en" aria-label="English"><span>EN</span></button>
 </div>
 <a class="btn btn-gold" href="boeken.html" data-nl="Boek nu" data-en="Book now">Boek nu</a>
 <button class="burger" aria-label="Menu"><span></span><span></span><span></span></button>
 </div>`;
 host.querySelectorAll('.lang button').forEach(b=> b.addEventListener('click', ()=>applyLang(b.dataset.lang)) );
 host.querySelector('.burger').addEventListener('click', openMobile);

 // mobile drawer
 const drawer = document.createElement('div');
 drawer.className = 'mobile-nav';
 drawer.innerHTML = `
 <div class="mn-top">
 <span class="brand" style="color:var(--cream)"><img class="mark" src="${(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png'}" alt="" style="border:0;padding:0;object-fit:contain"><span class="serif">The Healing Lounge</span></span>
 <button class="mn-close" aria-label="Sluiten">×</button>
 </div>
 <nav>${NAV.map(n=>`<a href="${n.href}" data-nl="${n.nl}" data-en="${n.en}">${n.nl}</a>`).join('')}</nav>
 <div class="mn-foot">
 <div class="lang" style="align-self:flex-start">
 <button data-lang="nl"><span>NL</span></button><button data-lang="en"><span>EN</span></button>
 </div>
 <a class="btn btn-gold btn-block" href="boeken.html" data-nl="Boek een behandeling" data-en="Book a treatment">Boek een behandeling</a>
 </div>`;
 document.body.appendChild(drawer);
 drawer.querySelector('.mn-close').addEventListener('click', closeMobile);
 drawer.querySelectorAll('.lang button').forEach(b=> b.addEventListener('click', ()=>applyLang(b.dataset.lang)) );

 // header scroll state (only when starts transparent over a hero)
 if(onDark){
 const onScroll = ()=>{
 if(window.scrollY > 40){ host.classList.remove('transparent','on-dark'); host.classList.add('solid'); }
 else { host.classList.add('transparent','on-dark'); host.classList.remove('solid'); }
 };
 window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
 }
 }
 function openMobile(){ document.querySelector('.mobile-nav').classList.add('open'); document.body.style.overflow='hidden'; }
 function closeMobile(){ document.querySelector('.mobile-nav').classList.remove('open'); document.body.style.overflow=''; }

 /* ---------------- footer ---------------- */
 function buildFooter(){
 const host = document.querySelector('[data-site-footer]');
 if(!host) return;
 host.className = 'site-footer';
 host.innerHTML = `
 <div class="container">
 <div class="foot-grid">
 <div class="foot-brand">
 <img src="${(window.HL_LOGOS&&window.HL_LOGOS.logo)||'assets/brand/logo.png'}" alt="The Healing Lounge" style="height:54px;width:auto;max-width:80%;object-fit:contain;margin-bottom:16px">
 <p style="max-width:30ch" data-nl="Een luxe zonnestudio en wellnesssalon in Leusden, rust voor lichaam en geest, met boeddhistische zachtheid." data-en="A luxury tanning studio and wellness salon in Leusden, rest for body and mind, with Buddhist softness.">Een luxe zonnestudio en wellnesssalon in Leusden, rust voor lichaam en geest, met boeddhistische zachtheid.</p>
 </div>
 <div>
 <h4 data-nl="Ontdek" data-en="Discover">Ontdek</h4>
 <ul>
 <li><a href="behandelingen.html" data-nl="Behandelingen" data-en="Treatments">Behandelingen</a></li>
 <li><a href="quiz.html" data-nl="Welke behandeling past bij jou?" data-en="Which treatment suits you?">Welke behandeling past bij jou?</a></li>
 <li><a href="contra-indicaties.html" data-nl="Contra-indicaties &amp; nazorg" data-en="Contraindications &amp; aftercare">Contra-indicaties &amp; nazorg</a></li>
 <li><a href="over-ons.html" data-nl="Over ons" data-en="About us">Over ons</a></li>
 <li><a href="behandelingen.html#rood-licht" data-nl="Rood licht therapie" data-en="Red light therapy">Rood licht therapie</a></li>
 <li><a href="boeken.html" data-nl="Online boeken" data-en="Book online">Online boeken</a></li>
 </ul>
 </div>
 <div>
 <h4 data-nl="Openingstijden" data-en="Opening hours">Openingstijden</h4>
 <ul>
 <li><span data-nl="Maandag" data-en="Monday">Maandag</span> · 12:00–20:30</li>
 <li><span data-nl="Di–Vrij" data-en="Tue–Fri">Di–Vrij</span> · 10:00–20:30</li>
 <li><span data-nl="Zaterdag" data-en="Saturday">Zaterdag</span> · 10:00–15:30</li>
 <li><span data-nl="Zondag" data-en="Sunday">Zondag</span> · <span data-nl="gesloten" data-en="closed">gesloten</span></li>
 </ul>
 </div>
 <div>
 <h4 data-nl="Contact" data-en="Contact">Contact</h4>
 <ul>
 <li>De Brouwerij 4<br>3831 ND Leusden</li>
 <li><a href="tel:+31613761673">+31 6 13 76 16 73</a></li>
 <li><a href="mailto:info@thehealinglounge.nl">info@thehealinglounge.nl</a></li>
 </ul>
 </div>
 </div>
 <div class="foot-bottom">
 <span>© ${new Date().getFullYear()} The Healing Lounge · KVK 83541306</span>
 <span style="display:flex;gap:22px;flex-wrap:wrap">
 <a href="privacy.html" data-nl="Privacyverklaring" data-en="Privacy">Privacyverklaring</a>
 <a href="voorwaarden.html" data-nl="Algemene voorwaarden" data-en="Terms">Algemene voorwaarden</a>
 <button class="foot-cookie" type="button" onclick="window.HL_openCookiePrefs&&window.HL_openCookiePrefs()" data-nl="Cookie-instellingen" data-en="Cookie settings">Cookie-instellingen</button>
 </span>
 </div>
 </div>`;
 }

 /* ---------------- assumptions marker ---------------- */
 const ASSUMPTIONS = [
 'Prijzen & duur per behandeling zijn realistische placeholders (§6, [INVULLEN]).',
 'Document-flow per behandeling volgt de aanname uit §9: cupping & bindweefsel → handtekening, pakkingen & rood licht → inzien.',
 "Foto's worden gehotlinkt van de huidige mediaserver (§4); behandelingen zonder eigen foto tonen een sfeerfoto.",
 'Rood licht: voorbeeld-raster van 20-min slots, hele dag boekbaar (§2.4).',
 'Buffertijd tussen behandelingen: 15 min (§2.7). Annuleren: zelfde 24-uursgrens als wijzigen.',
 'Maaike doet een deel van de behandelingen; verdeling nog [INVULLEN] (§2.2).',
 ];
 function buildAssumptions(){
 if(document.querySelector('.assume-btn')) return;
 const btn = document.createElement('button');
 btn.className = 'assume-btn';
 btn.innerHTML = '◷ <span data-nl="Ontwerp-aannames" data-en="Design assumptions">Ontwerp-aannames</span>';
 btn.addEventListener('click', ()=>{
 let p = document.querySelector('.assume-panel');
 if(p){ p.remove(); return; }
 p = document.createElement('div');
 p.className = 'assume-panel';
 p.style.cssText = 'position:fixed;right:18px;bottom:62px;z-index:71;max-width:360px;background:var(--paper);color:var(--ink);border:1px solid var(--linen-deep);border-radius:16px;box-shadow:var(--shadow-lg);padding:20px 22px;font-size:13.5px;line-height:1.55';
 p.innerHTML = '<strong style="font-family:var(--serif);font-size:18px;font-weight:600;display:block;margin-bottom:10px">Ontwerp-aannames</strong>'+
 '<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:9px">'+ASSUMPTIONS.map(a=>`<li>${a}</li>`).join('')+'</ul>';
 document.body.appendChild(p);
 });
 document.body.appendChild(btn);
 }

 /* ---------------- scroll reveal ---------------- */
 function initReveal(){
 const els = document.querySelectorAll('.reveal');
 if(!els.length) return;
 const io = new IntersectionObserver((ents)=>{
 ents.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
 }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
 els.forEach(el=>io.observe(el));
 }

 /* ---------------- shader background ---------------- */
 // Mounts a Healing Lounge shader as a calm, dimmed background on a <canvas>.
 window.HLMountShader = function(canvas, fragId, opts){
 opts = opts || {};
 const gl = canvas.getContext('webgl', {antialias:true, premultipliedAlpha:false});
 if(!gl || !window.HL_WALLPAPERS) return;
 const wp = window.HL_WALLPAPERS.find(w=>w.id===fragId) || window.HL_WALLPAPERS[0];
 const VERT='attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}';
 function comp(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
 const p=gl.createProgram();
 gl.attachShader(p,comp(gl.VERTEX_SHADER,VERT));
 gl.attachShader(p,comp(gl.FRAGMENT_SHADER,window.HL_PRELUDE+wp.frag));
 gl.linkProgram(p); gl.useProgram(p);
 const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(p,'a_pos'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const U={}; ['u_resolution','u_time','u_mouse','u_mouseActive','u_clickCount'].forEach(n=>U[n]=gl.getUniformLocation(p,n));
 U.clicks=gl.getUniformLocation(p,'u_clicks[0]');
 const speed = opts.speed!=null?opts.speed:1;
 const dpr=Math.min(window.devicePixelRatio||1, opts.maxDpr||1.6);
 function resize(){ const r=canvas.getBoundingClientRect(); canvas.width=Math.max(2,Math.floor(r.width*dpr)); canvas.height=Math.max(2,Math.floor(r.height*dpr)); }
 new ResizeObserver(resize).observe(canvas); resize();
 const target={x:0,y:0}, eased={x:0,y:0}; let active=0, lastMove=-10;
 const clicks=[]; const cbuf=new Float32Array(40);
 window.addEventListener('pointermove',e=>{ const h=innerHeight; target.x=(e.clientX-innerWidth/2)/h; target.y=(innerHeight/2-e.clientY)/h; lastMove=performance.now()/1000; });
 window.addEventListener('pointerdown',e=>{ if(e.target.closest('a,button,input,label.site-header')) return; const h=innerHeight; clicks.push({x:(e.clientX-innerWidth/2)/h,y:(innerHeight/2-e.clientY)/h,t:performance.now()/1000}); while(clicks.length>10)clicks.shift(); });
 const t0=performance.now(); let raf;
 function frame(){
 const time=(performance.now()-t0)/1000*speed;
 eased.x+=(target.x-eased.x)*0.06; eased.y+=(target.y-eased.y)*0.06;
 const since=performance.now()/1000-lastMove; active+=((Math.max(0,1-since*0.7))-active)*0.05;
 for(let i=clicks.length-1;i>=0;i--){ if(performance.now()/1000-clicks[i].t>7) clicks.splice(i,1); }
 cbuf.fill(0); const n=Math.min(clicks.length,10);
 for(let i=0;i<n;i++){ const c=clicks[i]; cbuf[i*4]=c.x; cbuf[i*4+1]=c.y; cbuf[i*4+2]=performance.now()/1000*speed-c.t*speed; cbuf[i*4+3]=1; }
 gl.viewport(0,0,canvas.width,canvas.height);
 gl.uniform2f(U.u_resolution,canvas.width,canvas.height);
 gl.uniform1f(U.u_time,time);
 gl.uniform2f(U.u_mouse,eased.x,eased.y);
 gl.uniform1f(U.u_mouseActive,active*(opts.interactive===false?0:1));
 gl.uniform1i(U.u_clickCount,n);
 gl.uniform4fv(U.clicks,cbuf);
 gl.drawArrays(gl.TRIANGLES,0,3);
 raf=requestAnimationFrame(frame);
 }
 frame();
 };

 /* ---------------- cookie consent (AVG / Telecomwet) ---------------- */
 const CK_KEY='hl_cookie_consent', CK_VER=1;
 function ckGet(){ try{ const c=JSON.parse(localStorage.getItem(CK_KEY)); return (c&&c.v===CK_VER)?c:null; }catch(e){ return null; } }
 function ckSave(analytics, marketing){
 const c={v:CK_VER, ts:new Date().toISOString(), necessary:true, analytics:!!analytics, marketing:!!marketing};
 try{ localStorage.setItem(CK_KEY, JSON.stringify(c)); }catch(e){}
 window.HL_consent=c; window.dispatchEvent(new CustomEvent('hl-cookie-consent',{detail:c}));
 applyConsent(c);
 }
 function applyConsent(c){
 // Hook points: only load non-essential scripts after consent.
 if(c.analytics && typeof window.HL_loadAnalytics==='function') window.HL_loadAnalytics();
 if(c.marketing && typeof window.HL_loadMarketing==='function') window.HL_loadMarketing();
 }
 function buildCookie(){
 const existing=ckGet();
 window.HL_consent = existing || {v:CK_VER, necessary:true, analytics:false, marketing:false};
 if(existing) applyConsent(existing);
 if(document.querySelector('.hl-cookie')) return;
 const bar=document.createElement('div');
 bar.className='hl-cookie'; bar.setAttribute('role','dialog'); bar.setAttribute('aria-label','Cookie');
 bar.innerHTML=`
 <div class="ck-intro">
 <h4 data-nl="Cookies, met aandacht" data-en="Cookies, with care">Cookies, met aandacht</h4>
 <p data-nl="Wij gebruiken noodzakelijke cookies om de site te laten werken. Analytische en marketingcookies plaatsen we alleen met jouw toestemming. Lees meer in onze privacyverklaring." data-en="We use necessary cookies to make the site work. We only place analytical and marketing cookies with your consent. Read more in our privacy policy.">Wij gebruiken noodzakelijke cookies om de site te laten werken. Analytische en marketingcookies plaatsen we alleen met jouw toestemming. Lees meer in onze <a href="privacy.html" data-nl="privacyverklaring" data-en="privacy policy">privacyverklaring</a>.</p>
 <div class="ck-actions">
 <button class="btn btn-gold ck-accept" data-nl="Alles accepteren" data-en="Accept all">Alles accepteren</button>
 <button class="btn btn-ghost ck-necessary" data-nl="Alleen noodzakelijk" data-en="Only necessary">Alleen noodzakelijk</button>
 </div>
 <div style="margin-top:12px;text-align:center"><button class="ck-link ck-tweak" data-nl="Voorkeuren aanpassen" data-en="Adjust preferences">Voorkeuren aanpassen</button></div>
 </div>
 <div class="ck-detail" hidden>
 <h4 data-nl="Cookievoorkeuren" data-en="Cookie preferences">Cookievoorkeuren</h4>
 <div class="ck-prefs">
 <div class="ck-row">
 <div class="ck-text"><strong data-nl="Noodzakelijk" data-en="Necessary">Noodzakelijk</strong><span data-nl="Nodig om de site en je voorkeuren (zoals taal) te laten werken. Altijd aan." data-en="Needed for the site and your preferences (such as language) to work. Always on.">Nodig om de site en je voorkeuren (zoals taal) te laten werken. Altijd aan.</span></div>
 <label class="ck-switch"><input type="checkbox" checked disabled><span class="ck-track"></span></label>
 </div>
 <div class="ck-row">
 <div class="ck-text"><strong data-nl="Analytisch" data-en="Analytics">Analytisch</strong><span data-nl="Anonieme statistieken om de site te verbeteren." data-en="Anonymous statistics to improve the site.">Anonieme statistieken om de site te verbeteren.</span></div>
 <label class="ck-switch"><input type="checkbox" id="ck-an"><span class="ck-track"></span></label>
 </div>
 <div class="ck-row">
 <div class="ck-text"><strong data-nl="Marketing" data-en="Marketing">Marketing</strong><span data-nl="Voor relevante aanbiedingen en het meten van campagnes." data-en="For relevant offers and measuring campaigns.">Voor relevante aanbiedingen en het meten van campagnes.</span></div>
 <label class="ck-switch"><input type="checkbox" id="ck-mk"><span class="ck-track"></span></label>
 </div>
 </div>
 <div class="ck-foot-actions">
 <button class="btn btn-gold ck-save" data-nl="Voorkeuren opslaan" data-en="Save preferences">Voorkeuren opslaan</button>
 <button class="btn btn-ghost ck-accept2" data-nl="Alles accepteren" data-en="Accept all">Alles accepteren</button>
 </div>
 </div>`;
 document.body.appendChild(bar);
 const intro=bar.querySelector('.ck-intro'), detail=bar.querySelector('.ck-detail');
 const anIn=bar.querySelector('#ck-an'), mkIn=bar.querySelector('#ck-mk');
 function close(){ bar.classList.remove('show'); setTimeout(()=>{ /* keep in DOM for reopen */ }, 600); }
 function openIntro(){ intro.hidden=false; detail.hidden=true; bar.classList.add('show'); }
 function openDetail(){ const c=ckGet(); anIn.checked=c?c.analytics:false; mkIn.checked=c?c.marketing:false; intro.hidden=true; detail.hidden=false; bar.classList.add('show'); }
 bar.querySelector('.ck-accept').addEventListener('click',()=>{ ckSave(true,true); close(); });
 bar.querySelector('.ck-accept2').addEventListener('click',()=>{ ckSave(true,true); close(); });
 bar.querySelector('.ck-necessary').addEventListener('click',()=>{ ckSave(false,false); close(); });
 bar.querySelector('.ck-tweak').addEventListener('click',openDetail);
 bar.querySelector('.ck-save').addEventListener('click',()=>{ ckSave(anIn.checked, mkIn.checked); close(); });
 window.HL_openCookiePrefs=function(){ openDetail(); };
 if(!existing){ setTimeout(openIntro, 700); }
 if(window.HL_setLang) window.HL_setLang(getLang());
 }

 /* ============================================================
  Foto's & acties — publieke weergave + inline fotobeheer
  Leest/schrijft window.HLOverrides (assets/overrides.js)
  ============================================================ */
 function OV(){ return window.HLOverrides; }
 function escA(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
 function pageSlug(){ const f=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/i,''); return f||'index'; }
 function parsePrice(txt){ const m=String(txt||'').match(/€\s*([0-9]+)/); return m?parseInt(m[1],10):null; }
 function localizeTree(root){ if(!root) return; const lang=getLang(); root.querySelectorAll('[data-nl]').forEach(el=>{ const v=el.getAttribute('data-'+lang); if(v!=null) el.textContent=v; }); }

 function injectPhotoCSS(){
 if(document.getElementById('hl-photos-css')) return;
 const st=document.createElement('style'); st.id='hl-photos-css';
 st.textContent=`
 .hl-card-promo{ position:absolute; top:12px; left:12px; z-index:2; background:var(--honey); color:var(--paper); font-size:11px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; padding:5px 11px; border-radius:var(--r-pill); box-shadow:var(--shadow-sm); }
 .hl-oldp{ text-decoration:line-through; opacity:.55; margin-right:8px; font-weight:500; }
 .hl-newp{ color:var(--rood); font-weight:700; }
 .hl-hero-promo{ display:flex; width:max-content; max-width:100%; align-items:center; gap:8px; background:var(--honey); color:var(--paper); font-weight:700; font-size:12.5px; letter-spacing:.08em; text-transform:uppercase; padding:7px 15px; border-radius:var(--r-pill); margin:0 0 18px; box-shadow:var(--shadow-sm); }
 .hl-gallery-head h2{ margin-bottom:24px; }
 .hl-gallery-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
 .hl-shot{ position:relative; aspect-ratio:4/3; border-radius:var(--r-md); overflow:hidden; background:var(--linen); margin:0; }
 .hl-shot img{ width:100%; height:100%; object-fit:cover; display:block; }
 body:not(.hl-edit) .hl-shot img{ cursor:zoom-in; }
 .hl-shot-btns{ position:absolute; top:8px; right:8px; display:flex; gap:6px; }
 .hl-shot-btns button{ width:30px; height:30px; border:0; border-radius:50%; background:rgba(24,15,8,.72); color:var(--cream); font-size:14px; cursor:pointer; display:grid; place-items:center; }
 .hl-shot-btns button:hover{ background:var(--rood); }
 .hl-cover-tag{ position:absolute; bottom:8px; left:8px; background:var(--honey); color:var(--paper); font-size:10px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; padding:4px 9px; border-radius:var(--r-pill); }
 .hl-mkcover{ position:absolute; bottom:8px; left:8px; border:0; background:rgba(251,246,236,.93); color:var(--ink); font-size:11px; font-weight:600; padding:5px 10px; border-radius:var(--r-pill); cursor:pointer; }
 .hl-add{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; aspect-ratio:4/3; border:1.5px dashed var(--honey); border-radius:var(--r-md); color:var(--honey); font-size:13px; font-weight:600; cursor:pointer; background:rgba(188,129,58,.05); text-align:center; padding:10px; }
 .hl-add:hover{ background:rgba(188,129,58,.12); }
 .hl-add-plus{ font-size:30px; line-height:1; }
 .hl-manage{ position:fixed; right:18px; bottom:18px; z-index:95; display:inline-flex; align-items:center; gap:9px; background:var(--honey); color:var(--paper); border:0; border-radius:var(--r-pill); padding:13px 20px; font-weight:700; font-size:14px; cursor:pointer; box-shadow:var(--shadow-lg); }
 .hl-manage .ic{ font-size:15px; }
 .hl-manage.on{ background:var(--ink); }
 @media(max-width:560px){ .hl-manage{ right:12px; bottom:12px; padding:11px 15px; font-size:13px; } }
 .bed .ph{ position:relative; background:var(--linen); overflow:hidden; }
 .bed .ph:not(.hl-has)::after{ content:attr(data-ph); position:absolute; inset:0; display:flex; align-items:center; justify-content:center; text-align:center; padding:14px; font-family:ui-monospace,monospace; font-size:11px; letter-spacing:.04em; color:var(--ink-soft); opacity:.7; }
 .hl-bed-img{ width:100%; height:100%; object-fit:cover; display:block; }
 .hl-bed-edit{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; gap:8px; background:rgba(24,15,8,.45); color:var(--cream); font-weight:700; font-size:14px; cursor:pointer; }
 .hl-bed-del{ position:absolute; top:8px; right:8px; width:30px; height:30px; border:0; border-radius:50%; background:rgba(24,15,8,.72); color:var(--cream); cursor:pointer; }
 .hl-lightbox{ position:fixed; inset:0; z-index:200; background:rgba(20,12,6,.93); display:flex; align-items:center; justify-content:center; }
 .hl-lightbox img{ max-width:90vw; max-height:86vh; border-radius:var(--r-md); box-shadow:var(--shadow-lg); }
 .hl-lb-btn{ position:absolute; top:50%; transform:translateY(-50%); width:52px; height:52px; border:0; border-radius:50%; background:rgba(243,236,222,.14); color:var(--cream); font-size:26px; cursor:pointer; }
 .hl-lb-prev{ left:18px; } .hl-lb-next{ right:18px; }
 .hl-lb-close{ position:absolute; top:18px; right:18px; width:46px; height:46px; border:0; border-radius:50%; background:rgba(243,236,222,.14); color:var(--cream); font-size:24px; cursor:pointer; }
 .hl-acties .hl-acties-head{ margin-bottom:30px; }
 .hl-acties-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:clamp(18px,2vw,26px); }
 `;
 document.head.appendChild(st);
 }

 function openLightbox(list, index){
 list=(list||[]).filter(Boolean); if(!list.length) return;
 let i=Math.max(0,Math.min(index||0, list.length-1));
 const lb=document.createElement('div'); lb.className='hl-lightbox';
 const img=document.createElement('img'); img.src=list[i]; lb.appendChild(img);
 const prev=document.createElement('button'); prev.className='hl-lb-btn hl-lb-prev'; prev.innerHTML='‹';
 const next=document.createElement('button'); next.className='hl-lb-btn hl-lb-next'; next.innerHTML='›';
 const close=document.createElement('button'); close.className='hl-lb-close'; close.innerHTML='×';
 if(list.length>1){ lb.appendChild(prev); lb.appendChild(next); }
 lb.appendChild(close);
 const upd=()=>{ img.src=list[i]; };
 prev.onclick=(e)=>{ e.stopPropagation(); i=(i-1+list.length)%list.length; upd(); };
 next.onclick=(e)=>{ e.stopPropagation(); i=(i+1)%list.length; upd(); };
 const done=()=>{ document.removeEventListener('keydown', key); lb.remove(); };
 close.onclick=done; lb.addEventListener('click',(e)=>{ if(e.target===lb) done(); });
 function key(e){ if(e.key==='Escape') done(); else if(e.key==='ArrowLeft'&&list.length>1){ i=(i-1+list.length)%list.length; upd(); } else if(e.key==='ArrowRight'&&list.length>1){ i=(i+1)%list.length; upd(); } }
 document.addEventListener('keydown', key);
 document.body.appendChild(lb);
 }

 function hydrateCards(){
 const ov=OV(); if(!ov) return; const L=getLang();
 document.querySelectorAll('a.treat-card[href]').forEach(card=>{
 const m=(card.getAttribute('href')||'').match(/([a-z0-9\-]+)\.html/i); if(!m) return;
 const id=ov.idForSlug(m[1]);
 const img=card.querySelector('.photo img');
 if(img){ if(!img.dataset.origSrc) img.dataset.origSrc=img.getAttribute('src')||''; const cover=ov.photos.cover(id); img.src=cover||img.dataset.origSrc; }
 const photo=card.querySelector('.photo'); const ex=photo&&photo.querySelector('.hl-card-promo'); if(ex) ex.remove();
 const priceEl=card.querySelector('.price');
 if(priceEl && !priceEl.dataset.base){ const b=parsePrice(priceEl.textContent); if(b!=null) priceEl.dataset.base=b; }
 const live=ov.promos.isLive(id);
 if(live){
 const base=priceEl?+priceEl.dataset.base:null; const comp=base!=null?ov.promos.compute(id,base):{hasPrice:false};
 if(photo){ const chip=document.createElement('span'); chip.className='hl-card-promo'; chip.textContent=ov.promos.label(id,L)+(comp.hasPrice&&comp.pct>0?' · -'+comp.pct+'%':''); photo.appendChild(chip); }
 if(priceEl && comp.hasPrice) priceEl.innerHTML='<span class="hl-oldp">€ '+base+'</span><span class="hl-newp">€ '+comp.newPrice+'</span>';
 } else if(priceEl && priceEl.dataset.base && priceEl.querySelector('.hl-newp')){ priceEl.textContent='€ '+priceEl.dataset.base; }
 });
 }

 function galleryHost(){
 let sec=document.querySelector('.hl-gallery');
 if(sec) return sec;
 const anchor=document.querySelector('.svc-body')||document.querySelector('.detail-body')||document.querySelector('article > section.section');
 const sectionEl=anchor?(anchor.closest('section')||anchor):null; if(!sectionEl) return null;
 sec=document.createElement('section'); sec.className='section hl-gallery'; sec.style.paddingTop='0';
 sec.innerHTML='<div class="container"><div class="hl-gallery-head"><h2 data-nl="Galerij" data-en="Gallery">Galerij</h2></div><div class="hl-gallery-grid"></div></div>';
 sectionEl.insertAdjacentElement('afterend', sec);
 return sec;
 }
 function renderGallery(id, photos){
 const edit=document.body.classList.contains('hl-edit');
 const extra=photos.slice(1);
 const show = edit || extra.length>0;
 const existing=document.querySelector('.hl-gallery');
 if(!show){ if(existing) existing.style.display='none'; return; }
 const sec=galleryHost(); if(!sec) return; sec.style.display='';
 const grid=sec.querySelector('.hl-gallery-grid'); grid.innerHTML='';
 const tiles = edit?photos:extra;
 tiles.forEach((url, k)=>{
 const realIndex = edit?k:(k+1);
 const fig=document.createElement('figure'); fig.className='hl-shot';
 const im=document.createElement('img'); im.src=url; im.loading='lazy';
 im.addEventListener('click',()=>{ if(!document.body.classList.contains('hl-edit')) openLightbox(photos, realIndex); });
 fig.appendChild(im);
 if(edit){
 const tools=document.createElement('div');
 tools.innerHTML='<div class="hl-shot-btns"><button type="button" data-act="left" title="Naar links">←</button><button type="button" data-act="right" title="Naar rechts">→</button><button type="button" data-act="del" title="Verwijderen">✕</button></div>'+(realIndex===0?'<span class="hl-cover-tag" data-nl="Cover" data-en="Cover">Cover</span>':'<button type="button" class="hl-mkcover" data-act="cover" data-nl="Maak cover" data-en="Make cover">Maak cover</button>');
 tools.querySelector('[data-act="left"]').onclick=()=>OV().photos.move(id, realIndex, -1);
 tools.querySelector('[data-act="right"]').onclick=()=>OV().photos.move(id, realIndex, +1);
 tools.querySelector('[data-act="del"]').onclick=()=>OV().photos.removeAt(id, realIndex);
 const mk=tools.querySelector('[data-act="cover"]'); if(mk) mk.onclick=()=>OV().photos.makeCover(id, realIndex);
 while(tools.firstChild) fig.appendChild(tools.firstChild);
 }
 grid.appendChild(fig);
 });
 if(edit){
 const add=document.createElement('label'); add.className='hl-add';
 add.innerHTML='<span class="hl-add-plus">+</span><span data-nl="Foto toevoegen" data-en="Add photo">Foto toevoegen</span><input type="file" accept="image/*" multiple hidden>';
 add.querySelector('input').onchange=async(e)=>{ const files=[...e.target.files]; for(const f of files){ try{ const url=await OV().downscaleImage(f); OV().photos.add(id, url); }catch(err){ console.warn(err); } } };
 grid.appendChild(add);
 }
 localizeTree(sec);
 }

 function renderBeds(){
 const ov=OV(); const edit=document.body.classList.contains('hl-edit');
 const beds=document.querySelectorAll('.beds .bed'); if(!beds.length) return;
 beds.forEach((bed, i)=>{
 const ph=bed.querySelector('.ph'); if(!ph) return;
 const url=ov.beds.at(i);
 ph.innerHTML=''; ph.classList.toggle('hl-has', !!url);
 if(url){ const im=document.createElement('img'); im.className='hl-bed-img'; im.src=url; if(!edit){ im.style.cursor='zoom-in'; im.onclick=()=>{ const all=ov.beds.get(); const shown=all.map((u,idx)=>({u,idx})).filter(x=>x.u); const pos=shown.findIndex(x=>x.idx===i); openLightbox(shown.map(x=>x.u), pos<0?0:pos); }; } ph.appendChild(im); }
 if(edit){
 const lab=document.createElement('label'); lab.className='hl-bed-edit';
 lab.innerHTML='<span>'+(url?(getLang()==='nl'?'Vervangen':'Replace'):(getLang()==='nl'?'+ Foto':'+ Photo'))+'</span><input type="file" accept="image/*" hidden>'+(url?'<button type="button" class="hl-bed-del" title="Verwijderen">✕</button>':'');
 lab.querySelector('input').onchange=async(e)=>{ const f=e.target.files[0]; if(!f) return; try{ const u=await ov.downscaleImage(f); ov.beds.set(i,u); }catch(err){ console.warn(err); } };
 const del=lab.querySelector('.hl-bed-del'); if(del) del.onclick=(e)=>{ e.preventDefault(); e.stopPropagation(); ov.beds.removeAt(i); };
 ph.appendChild(lab);
 }
 });
 }

 function setManageLabel(){
 const b=document.querySelector('.hl-manage'); if(!b) return;
 const editing=document.body.classList.contains('hl-edit'); const L=getLang();
 b.querySelector('.lbl').textContent = editing?(L==='nl'?'Klaar':'Done'):(L==='nl'?"Foto's beheren":'Manage photos');
 b.classList.toggle('on', editing);
 }
 function ensureManageButton(){
 if(!document.querySelector('.svc-hero')) return;
 if(document.querySelector('.hl-manage')) return;
 const b=document.createElement('button'); b.type='button'; b.className='hl-manage';
 b.innerHTML='<span class="ic">❀</span><span class="lbl"></span>';
 b.onclick=toggleEdit; document.body.appendChild(b); setManageLabel();
 }
 function toggleEdit(){
 const on=!document.body.classList.contains('hl-edit');
 document.body.classList.toggle('hl-edit', on);
 if(on){ const ov=OV(); const id=ov.idForSlug(pageSlug()); const heroImg=document.querySelector('.svc-hero .photo img'); if(heroImg && !ov.photos.has(id) && heroImg.dataset.origSrc){ ov.photos.set(id,[heroImg.dataset.origSrc]); return; } }
 setManageLabel(); rerenderAll();
 }

 function hydrateDetail(){
 const ov=OV(); if(!ov) return;
 const hero=document.querySelector('.svc-hero'); if(!hero) return;
 const id=ov.idForSlug(pageSlug()); const L=getLang();
 const heroImg=hero.querySelector('.photo img');
 if(heroImg && !heroImg.dataset.origSrc) heroImg.dataset.origSrc=heroImg.getAttribute('src')||'';
 const photos=ov.photos.get(id);
 if(heroImg) heroImg.src = photos[0] || heroImg.dataset.origSrc;
 const inner=hero.querySelector('.inner'); const exb=inner&&inner.querySelector('.hl-hero-promo'); if(exb) exb.remove();
 const priceEl=document.querySelector('.svc-book .price, .book-card .price');
 if(priceEl && !priceEl.dataset.base){ const b=parsePrice(priceEl.textContent); if(b!=null){ priceEl.dataset.base=b; const sm=priceEl.querySelector('small'); priceEl.dataset.tail=sm?sm.outerHTML:''; } }
 const live=ov.promos.isLive(id);
 if(live){
 const base=priceEl?+priceEl.dataset.base:null; const comp=base!=null?ov.promos.compute(id,base):{hasPrice:false};
 if(inner){ const chip=document.createElement('span'); chip.className='hl-hero-promo'; chip.textContent='✦ '+ov.promos.label(id,L)+(comp.hasPrice&&comp.pct>0?' · -'+comp.pct+'%':''); const eb=inner.querySelector('.eyebrow'); if(eb) eb.parentNode.insertBefore(chip, eb); else inner.insertBefore(chip, inner.firstChild); }
 if(priceEl && comp.hasPrice) priceEl.innerHTML='<span class="hl-oldp">€ '+base+'</span><span class="hl-newp">€ '+comp.newPrice+'</span> '+(priceEl.dataset.tail||'');
 } else if(priceEl && priceEl.dataset.base && priceEl.querySelector('.hl-newp')){ priceEl.innerHTML='€ '+priceEl.dataset.base+' '+(priceEl.dataset.tail||''); }
 renderGallery(id, photos);
 if(pageSlug()==='zonnestudio') renderBeds();
 ensureManageButton();
 }

 function buildHomePromos(){
 if(document.body.dataset.page!=='home') return;
 const ov=OV(); if(!ov || !window.HL_TREATMENTS) return; const L=getLang();
 const live=ov.promos.liveIds();
 const items=live.map(id=>window.HL_treatment?window.HL_treatment(id):null).filter(Boolean);
 let sec=document.querySelector('.hl-acties');
 if(!items.length){ if(sec) sec.remove(); return; }
 if(!sec){
 const hero=document.querySelector('.hero'); if(!hero) return;
 sec=document.createElement('section'); sec.className='section hl-acties'; sec.style.background='var(--linen)';
 sec.innerHTML='<div class="container"><div class="hl-acties-head"><span class="eyebrow" data-nl="Tijdelijke acties" data-en="Limited-time offers">Tijdelijke acties</span><h2 data-nl="Nu extra voordelig" data-en="Now extra favourable">Nu extra voordelig</h2></div><div class="hl-acties-grid"></div></div>';
 hero.insertAdjacentElement('afterend', sec);
 }
 const grid=sec.querySelector('.hl-acties-grid'); grid.innerHTML='';
 items.forEach(t=>{
 const slug=ov.slugForId(t.id); const cover=ov.photos.cover(t.id)||t.photo;
 const cat=(window.HL_CATS||[]).find(c=>c.id===t.cat); const catNl=cat?cat.nl:'', catEn=cat?cat.en:'';
 const a=document.createElement('a'); a.className='treat-card'; a.href=slug+'.html';
 a.innerHTML='<div class="photo" style="aspect-ratio:4/3.1"><img src="'+escA(cover)+'" alt="" loading="lazy" onerror="this.classList.add(\'img-failed\')"></div><div class="body"><span class="tag"><span class="dot"></span><span data-nl="'+escA(catNl)+'" data-en="'+escA(catEn)+'">'+escA(catNl)+'</span></span><h3 data-nl="'+escA(t.nl.name)+'" data-en="'+escA(t.en.name)+'">'+escA(L==='nl'?t.nl.name:t.en.name)+'</h3><div class="meta-row"><span class="price">€ '+t.price+'</span><span class="dur">'+t.dur+' min</span></div></div>';
 grid.appendChild(a);
 });
 localizeTree(sec);
 }

 function rerenderAll(){ buildHomePromos(); hydrateDetail(); hydrateCards(); setManageLabel(); }

 function initOverridesUI(){
 if(!OV()) return;
 injectPhotoCSS();
 rerenderAll();
 window.addEventListener('hl-overrides-change', rerenderAll);
 window.addEventListener('hl-lang', rerenderAll);
 window.addEventListener('load', ()=>{ buildHomePromos(); hydrateCards(); });
 setTimeout(()=>{ buildHomePromos(); hydrateCards(); }, 90);
 }

 /* ---------------- boot ---------------- */
 function boot(){
 buildHeader();
 buildFooter();
 /* ontwerp-aannames verborgen op verzoek */
 buildCookie();
 initReveal();
 initOverridesUI();
 applyLang(getLang());
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
 else boot();
})();
