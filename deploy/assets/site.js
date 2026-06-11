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

 /* ---------------- boot ---------------- */
 function boot(){
 buildHeader();
 buildFooter();
 /* ontwerp-aannames verborgen op verzoek */
 buildCookie();
 initReveal();
 applyLang(getLang());
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
 else boot();
})();
