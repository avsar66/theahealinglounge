/* ============================================================
 THE HEALING LOUNGE, quiz engine
 Intro → 6 questions → calculating → result (top match + 2 alts)
 Routes directly into the booking flow with the treatment chosen.
 State persists in localStorage; bilingual via site.js.
 ============================================================ */
(function(){
 const L = ()=> (window.HL_getLang ? window.HL_getLang() : 'nl');
 const T = (nl,en)=> L()==='nl'?nl:en;
 const QS = window.HL_QUIZ_QUESTIONS || [];
 const SCORE_QS = QS.filter(q=>q.weight>0);

 const SHARE_URL = 'https://www.thehealinglounge.nl/quizz/';

 // ---------- state ----------
 const KEY='hl_quiz';
 let state = load() || { view:'intro', answers:{} }; // view: 'intro' | number | 'result'
 function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
 function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }

 let host;

 // ---------- scoring ----------
 function compute(){
 const tags = window.HL_QUIZ_TAGS, info = window.HL_QUIZ_INFO;
 const cats = (window.HL_CATS||[]);
 // collect exclusions
 const excl = new Set();
 const contra = QS.find(q=>q.id==='contra');
 if(contra){
 (state.answers.contra||[]).forEach(oid=>{
 const o = contra.options.find(x=>x.id===oid);
 if(o && o.exclude) excl.add(o.exclude);
 });
 }
 // score every treatment
 const scores = [];
 Object.keys(tags).forEach(id=>{
 const ttags = tags[id];
 if([...excl].some(x=>ttags.includes(x))) return; // hard-excluded
 let s=0;
 SCORE_QS.forEach(q=>{
 (state.answers[q.id]||[]).forEach(oid=>{
 const o=q.options.find(x=>x.id===oid);
 if(!o||!o.boost) return;
 o.boost.forEach(b=>{ if(ttags.includes(b)) s+=q.weight; });
 });
 });
 scores.push({id, s});
 });
 scores.sort((a,b)=> b.s - a.s || Math.random()-0.5);
 const top = scores.slice(0,3);
 // believable match percentage for the main pick
 const gap = top.length>1 ? (top[0].s - top[1].s) : 3;
 const pct = Math.max(90, Math.min(98, 90 + gap*2));
 return { main:top[0], alts:top.slice(1,3), pct, excluded:excl.size>0 };
 }

 // personalised "why" sentence from the answers
 function whySentence(){
 const get=(qid)=>{ const q=QS.find(x=>x.id===qid); const oid=(state.answers[qid]||[])[0]; return q&&oid?q.options.find(o=>o.id===oid):null; };
 const g=get('goal'), z=get('zone'), i=get('intensity');
 const frag=(o)=> o ? (L()==='nl'?o.fragNl:o.fragEn) : '';
 const parts=[frag(g),frag(z),frag(i)].filter(Boolean);
 if(L()==='nl'){
 return `Op basis van je antwoorden, ${parts.join(', ')}, <em>past dit als gegoten</em>.`;
 }
 return `Based on your answers, ${parts.join(', ')}, <em>this fits you perfectly</em>.`;
 }

 // ---------- helpers ----------
 function catName(catId){ const c=(window.HL_CATS||[]).find(x=>x.id===catId); return c?(L()==='nl'?c.nl:c.en):''; }
 function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstElementChild; }

 // ---------- render ----------
 function render(){
 save();
 host.innerHTML='';
 if(state.view==='intro') host.appendChild(renderIntro());
 else if(state.view==='result') host.appendChild(renderResult());
 else host.appendChild(renderQuestion(state.view));
 if(window.HL_setLang) window.HL_setLang(L());
 window.scrollTo({top:0, behavior:'smooth'});
 }

 function progress(n){
 return `<div class="qz-progress">
 <span class="qz-count">${T('Vraag','Question')} ${n} / ${QS.length}</span>
 <div class="qz-bar"><i style="width:${(n/QS.length)*100}%"></i></div>
 </div>`;
 }

 // ---------- intro ----------
 function renderIntro(){
 const p=el(`<div class="qz-pane qz-intro">
 <span class="eyebrow" data-nl="Persoonlijk advies" data-en="Personal advice">Persoonlijk advies</span>
 <h1 data-nl-html="Welke behandeling<br>past bij jou?" data-en-html="Which treatment<br>suits you?">Welke behandeling past bij jou?</h1>
 <p class="lead" data-nl="Zes korte vragen, ongeveer \u00e9\u00e9n minuut. We luisteren naar wat je lichaam nu nodig heeft en wijzen je de behandeling die het beste past, daarna boek je direct." data-en="Six short questions, about one minute. We listen to what your body needs now and point you to the treatment that fits best, then you book right away.">Zes korte vragen, ongeveer \u00e9\u00e9n minuut.</p>
 <div class="qz-badges">
 <span class="qz-badge2"><span class="d"></span><span data-nl="6 vragen" data-en="6 questions">6 vragen</span></span>
 <span class="qz-badge2"><span class="d"></span><span data-nl="\u00b1 1 minuut" data-en="\u00b1 1 minute">\u00b1 1 minuut</span></span>
 <span class="qz-badge2"><span class="d"></span><span data-nl="Direct boekbaar" data-en="Book instantly">Direct boekbaar</span></span>
 </div>
 <button class="btn btn-gold btn-lg" id="qz-start" data-nl="Start de quiz" data-en="Start the quiz">Start de quiz</button>
 </div>`);
 p.querySelector('#qz-start').addEventListener('click',()=>{ state.view=0; render(); });
 return p;
 }

 // ---------- question ----------
 function renderQuestion(i){
 const q=QS[i];
 const sel=state.answers[q.id]||[];
 const p=el(`<div class="qz-pane">${progress(i+1)}
 <div class="qz-q">
 <h2 data-nl="${esc(q.nl.q)}" data-en="${esc(q.en.q)}">${esc(q.nl.q)}</h2>
 <p class="q-sub" data-nl="${esc(q.nl.sub)}" data-en="${esc(q.en.sub)}">${esc(q.nl.sub)}</p>
 ${q.multi?`<span class="qz-multi-note"><span class="d" style="width:6px;height:6px;border-radius:50%;background:var(--honey);display:inline-block"></span><span data-nl="Meerdere antwoorden mogelijk" data-en="Multiple answers allowed">Meerdere antwoorden mogelijk</span></span>`:''}
 </div>
 <div class="qz-options${q.multi?' single-col':''}"></div>
 <div class="qz-nav">
 <button class="qz-back" ${i===0?'hidden':''} data-nl="\u2190 Terug" data-en="\u2190 Back">\u2190 Terug</button>
 ${q.multi?`<button class="btn btn-gold qz-continue" data-nl="Bekijk mijn match" data-en="See my match">Bekijk mijn match</button>`:'<span></span>'}
 </div>
 </div>`);
 const optWrap=p.querySelector('.qz-options');
 q.options.forEach(o=>{
 const on=sel.includes(o.id);
 const b=el(`<button class="qz-opt${on?' on':''}" data-multi="${!!q.multi}" data-id="${o.id}">
 <span class="ring"></span>
 <span class="lbl" data-nl="${esc(o.nl)}" data-en="${esc(o.en)}">${esc(o.nl)}</span>
 </button>`);
 b.addEventListener('click',()=>onPick(q,o,i,optWrap));
 optWrap.appendChild(b);
 });
 const back=p.querySelector('.qz-back');
 if(back) back.addEventListener('click',()=>{ if(i===0){ state.view='intro'; } else { state.view=i-1; } render(); });
 const cont=p.querySelector('.qz-continue');
 if(cont){ cont.disabled=sel.length===0; cont.addEventListener('click',()=>advance(i)); }
 return p;
 }

 function onPick(q,o,i,wrap){
 let sel=state.answers[q.id]||[];
 if(q.multi){
 if(o.none){ sel=['none']; }
 else { sel=sel.filter(x=>x!=='none'); sel = sel.includes(o.id) ? sel.filter(x=>x!==o.id) : sel.concat(o.id); }
 state.answers[q.id]=sel; save();
 // reflect selection
 wrap.querySelectorAll('.qz-opt').forEach(btn=> btn.classList.toggle('on', sel.includes(btn.dataset.id)) );
 const cont=wrap.parentElement.querySelector('.qz-continue'); if(cont) cont.disabled=sel.length===0;
 } else {
 state.answers[q.id]=[o.id]; save();
 wrap.querySelectorAll('.qz-opt').forEach(btn=> btn.classList.toggle('on', btn.dataset.id===o.id) );
 setTimeout(()=>advance(i), 380);
 }
 }

 function advance(i){
 if(i < QS.length-1){ state.view=i+1; render(); }
 else { showCalc(); }
 }

 // ---------- calculating splash → result ----------
 function showCalc(){
 state.view='result'; save();
 host.innerHTML='';
 const c=el(`<div class="qz-pane qz-calc">
 <div class="bloom"></div>
 <p data-nl="Je persoonlijke advies wordt samengesteld\u2026" data-en="Composing your personal advice\u2026">Je persoonlijke advies wordt samengesteld\u2026</p>
 </div>`);
 host.appendChild(c);
 if(window.HL_setLang) window.HL_setLang(L());
 setTimeout(()=>render(), 1500);
 }

 // ---------- result ----------
 function renderResult(){
 const res=compute();
 if(!res.main){ // safety fallback
 const p=el(`<div class="qz-pane qz-intro"><h1 data-nl="Even iets misgegaan" data-en="Something went wrong">Even iets misgegaan</h1><button class="btn btn-gold" id="qz-restart2" data-nl="Opnieuw" data-en="Restart">Opnieuw</button></div>`);
 p.querySelector('#qz-restart2').addEventListener('click',restart); return p;
 }
 const t=window.HL_treatment(res.main.id);
 const info=(window.HL_QUIZ_INFO||{})[res.main.id];
 const name=L()==='nl'?t.nl.name:t.en.name;
 const why=info?(L()==='nl'?info.why.nl:info.why.en):'';
 const benefits=info?(L()==='nl'?info.benefits.nl:info.benefits.en):[];
 const expect=info?(L()==='nl'?info.expect.nl:info.expect.en):'';

 const p=el(`<div class="qz-pane qz-result">
 <div class="res-eyebrow eyebrow" data-nl="Jouw persoonlijke match" data-en="Your personal match">Jouw persoonlijke match</div>
 <h2 class="res-title">${esc(name)}</h2>
 <p class="res-why">${whySentence()}</p>

 <div class="match-card">
 <div class="match-photo">
 <img src="${t.photo}" alt="${esc(name)}" onerror="this.classList.add('img-failed')">
 <div class="scrim"></div>
 <span class="ribbon" data-nl="Beste match" data-en="Best match">Beste match</span>
 <span class="pct">${res.pct}% <span data-nl="match" data-en="match">match</span></span>
 </div>
 <div class="match-body">
 <div class="match-cat">${esc(catName(t.cat))}</div>
 <h3>${esc(name)}</h3>
 <div class="match-meta"><span class="price">\u20ac ${t.price}</span><span class="dur">${t.dur} ${T('min','min')}</span></div>
 <p class="match-lead">${esc(why)}</p>

 <div class="match-section">
 <h4 data-nl="Wat het voor je doet" data-en="What it does for you">Wat het voor je doet</h4>
 <ul class="benefits">${benefits.map(b=>`<li><span class="bk">\u2713</span><span>${esc(b)}</span></li>`).join('')}</ul>
 </div>

 <div class="match-section">
 <h4 data-nl="Wat je kunt verwachten" data-en="What to expect">Wat je kunt verwachten</h4>
 <div class="expect-line"><span class="ic">\u2736</span><span>${esc(expect)}</span></div>
 </div>

 <div class="match-trust">
 <span class="stars">\u2605\u2605\u2605\u2605\u2605</span>
 <span data-nl="Google \u00b7 4,9 \u00b7 gewaardeerd door klanten in Leusden" data-en="Google \u00b7 4.9 \u00b7 loved by clients in Leusden">Google \u00b7 4,9 \u00b7 gewaardeerd door klanten in Leusden</span>
 </div>

 <div class="match-cta">
 <a class="btn btn-gold btn-lg btn-block" href="boeken.html?treatment=${t.id}" data-nl="Boek deze behandeling" data-en="Book this treatment">Boek deze behandeling</a>
 <span class="micro" data-nl="Geen vooruitbetaling \u2014 je rekent rustig af in de salon." data-en="No prepayment \u2014 you settle calmly at the salon.">Geen vooruitbetaling \u2014 je rekent rustig af in de salon.</span>
 </div>
 </div>
 </div>

 ${res.alts.length?`<div class="alts">
 <div class="alts-head">
 <span class="eyebrow" data-nl="Ook mooi voor jou" data-en="Also lovely for you">Ook mooi voor jou</span>
 <p data-nl="Deze passen ook bij je antwoorden." data-en="These also match your answers.">Deze passen ook bij je antwoorden.</p>
 </div>
 <div class="alt-grid"></div>
 </div>`:''}

 <div class="qz-share">
 <span class="eyebrow" data-nl="Deel jouw match" data-en="Share your match">Deel jouw match</span>
 <p data-nl="Tag ons \u2014 we zien je graag stralen." data-en="Tag us \u2014 we love to see you glow.">Tag ons \u2014 we zien je graag stralen.</p>
 <div class="share-row">
 <button class="share-btn" id="sh-native"><svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg><span data-nl="Delen" data-en="Share">Delen</span></button>
 <button class="share-btn" id="sh-wa"><svg class="si" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.2.5.3.5.4.1.2.1.6 0 .9Z"/></svg><span>WhatsApp</span></button>
 <button class="share-btn" id="sh-copy"><svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg><span class="cl" data-nl="Kopieer link" data-en="Copy link">Kopieer link</span></button>
 <button class="share-btn" id="sh-img"><svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span data-nl="Bewaar kaart" data-en="Save card">Bewaar kaart</span></button>
 </div>
 </div>

 <button class="qz-restart" id="qz-restart" data-nl="\u21ba Opnieuw doen" data-en="\u21ba Start over">\u21ba Opnieuw doen</button>
 </div>`);

 // alternatives
 const ag=p.querySelector('.alt-grid');
 if(ag){
 res.alts.forEach(a=>{
 const tt=window.HL_treatment(a.id); if(!tt) return;
 const nm=L()==='nl'?tt.nl.name:tt.en.name;
 const card=el(`<a class="alt-card" href="boeken.html?treatment=${tt.id}">
 <span class="alt-thumb"><img src="${tt.photo}" alt="" loading="lazy" onerror="this.classList.add('img-failed')"></span>
 <span class="alt-info">
 <span class="alt-cat">${esc(catName(tt.cat))}</span>
 <h4>${esc(nm)}</h4>
 <span class="alt-meta">${tt.dur} min \u00b7 \u20ac ${tt.price}</span>
 </span>
 <span class="alt-go">\u2192</span>
 </a>`);
 ag.appendChild(card);
 });
 }

 // share wiring
 const shareText = T(`Mijn match bij The Healing Lounge: ${name}. Ontdek welke behandeling bij jou past \u2192`,
 `My match at The Healing Lounge: ${name}. Find out which treatment suits you \u2192`);
 p.querySelector('#sh-native').addEventListener('click',async()=>{
 if(navigator.share){ try{ await navigator.share({title:'The Healing Lounge', text:shareText, url:SHARE_URL}); }catch(e){} }
 else { copyLink(p); }
 });
 p.querySelector('#sh-wa').addEventListener('click',()=>{
 window.open('https://wa.me/?text='+encodeURIComponent(shareText+' '+SHARE_URL),'_blank');
 });
 p.querySelector('#sh-copy').addEventListener('click',()=>copyLink(p));
 p.querySelector('#sh-img').addEventListener('click',()=>downloadCard(name, why, expect, benefits));

 p.querySelector('#qz-restart').addEventListener('click',restart);
 return p;
 }

 function copyLink(p){
 const txt=SHARE_URL;
 const done=()=>{ const b=p.querySelector('#sh-copy'); const lbl=b.querySelector('.cl'); b.classList.add('copied'); const old=lbl.textContent; lbl.textContent=T('Gekopieerd!','Copied!'); setTimeout(()=>{ b.classList.remove('copied'); lbl.textContent=old; },1800); };
 if(navigator.clipboard){ navigator.clipboard.writeText(txt).then(done,done); } else { done(); }
 }

 // ---------- shareable image (canvas, no external assets → never tainted) ----------
 function downloadCard(name, why, expect, benefits){
 benefits = benefits || [];
 const W=1080, H=1350, PAD=92, CW=W-PAD*2;
 const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
 const ctx=cv.getContext('2d');

 function drawWrapped(text, x, y, maxW, lh, max){
 const lines=wrapText(ctx, text, maxW);
 const use = max?lines.slice(0,max):lines;
 use.forEach(line=>{ ctx.fillText(line, x, y); y+=lh; });
 return y;
 }
 function drawBackground(){
 const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'#241910'); g.addColorStop(1,'#180F08');
 ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
 const rg=ctx.createRadialGradient(W*0.82,H*0.14,40,W*0.82,H*0.14,620);
 rg.addColorStop(0,'rgba(188,129,58,0.40)'); rg.addColorStop(1,'rgba(188,129,58,0)');
 ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
 ctx.textBaseline='alphabetic'; ctx.textAlign='left';
 }
 function drawContent(y){
 // eyebrow
 ctx.fillStyle='#D7B877'; ctx.font='600 25px "Mulish", sans-serif';
 ctx.fillText((L()==='nl'?'JOUW PERSOONLIJKE MATCH':'YOUR PERSONAL MATCH'), PAD, y); y+=84;
 // name
 ctx.fillStyle='#F3ECDE'; ctx.font='500 80px "Cormorant Garamond", Georgia, serif';
 y = drawWrapped(name, PAD, y, CW, 82, 2);
 // why
 y+=18;
 ctx.fillStyle='rgba(243,236,222,0.82)'; ctx.font='400 33px "Mulish", sans-serif';
 y = drawWrapped(why, PAD, y, CW, 46, 3);
 // divider
 y+=30; ctx.strokeStyle='rgba(215,184,119,0.45)'; ctx.lineWidth=2;
 ctx.beginPath(); ctx.moveTo(PAD,y); ctx.lineTo(PAD+96,y); ctx.stroke(); y+=44;
 // what it is
 ctx.fillStyle='#D7B877'; ctx.font='600 23px "Mulish", sans-serif';
 ctx.fillText((L()==='nl'?'WAT HET IS':'WHAT IT IS'), PAD, y); y+=42;
 ctx.fillStyle='rgba(243,236,222,0.92)'; ctx.font='400 31px "Mulish", sans-serif';
 y = drawWrapped(expect||'', PAD, y, CW, 44, 3);
 // what it does for you
 y+=40;
 ctx.fillStyle='#D7B877'; ctx.font='600 23px "Mulish", sans-serif';
 ctx.fillText((L()==='nl'?'WAT HET VOOR JE DOET':'WHAT IT DOES FOR YOU'), PAD, y); y+=46;
 benefits.slice(0,3).forEach(b=>{
 ctx.fillStyle='#D7B877'; ctx.font='600 30px "Mulish", sans-serif';
 ctx.fillText('\u2713', PAD, y);
 ctx.fillStyle='rgba(243,236,222,0.92)'; ctx.font='400 31px "Mulish", sans-serif';
 const ny = drawWrapped(b, PAD+46, y, CW-46, 40, 2);
 y = ny + 16;
 });
 // footer
 ctx.fillStyle='#D7B877'; ctx.font='600 26px "Mulish", sans-serif';
 ctx.fillText(T('Doe de quiz \u00b7 thehealinglounge.nl', 'Take the quiz \u00b7 thehealinglounge.nl'), PAD, H-PAD);
 }
 function exportCard(){
 cv.toBlob(blob=>{
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download='healing-lounge-match.png';
 document.body.appendChild(a); a.click(); a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 },'image/png');
 }
 function start(){
 // echte huisstijl-logo (lichte versie, transparant) — zelfde origin dus geen taint
 const logo=new Image();
 logo.onload=()=>{
 drawBackground();
 const lw=360, lh=lw*((logo.naturalHeight/logo.naturalWidth)||0.355);
 ctx.drawImage(logo, PAD, PAD-4, lw, lh);
 drawContent(PAD - 4 + lh + 64);
 exportCard();
 };
 logo.onerror=()=>{
 drawBackground();
 ctx.fillStyle='#F3ECDE'; ctx.font='500 52px "Cormorant Garamond", Georgia, serif';
 ctx.fillText('The Healing Lounge', PAD, PAD+56);
 ctx.fillStyle='#C9B89E'; ctx.font='600 18px "Mulish", sans-serif';
 ctx.fillText('W E L L - B E I N G   H O U S E', PAD, PAD+92);
 drawContent(PAD+150);
 exportCard();
 };
 logo.src='assets/brand/logo-white.png';
 }
 (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(start, start);
 }
 function wrapText(ctx, text, maxW){
 const words=(text||'').split(' '); const lines=[]; let line='';
 words.forEach(w=>{ const test=line?line+' '+w:w; if(ctx.measureText(test).width>maxW && line){ lines.push(line); line=w; } else line=test; });
 if(line) lines.push(line); return lines;
 }

 // ---------- restart ----------
 function restart(){ state={view:'intro', answers:{}}; save(); render(); }

 function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

 // ---------- boot ----------
 window.HL_QUIZ_INIT=function(){
 host=document.getElementById('qz-host');
 if(!host) return;
 render();
 window.addEventListener('hl-lang', render);
 };
})();
