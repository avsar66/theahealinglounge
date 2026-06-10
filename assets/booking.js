/* ============================================================
 THE HEALING LOUNGE, booking flow engine
 Steps: behandeling → moment → gegevens → documenten(A/B) → bevestigen → ritueel
 Realistic availability from opening hours; state persists in localStorage.
 ============================================================ */
(function(){
 const L = ()=> (window.HL_getLang ? window.HL_getLang() : 'nl');
 const T = (nl,en)=> L()==='nl'?nl:en;

 // opening hours per weekday (0=Sun): [openHour, closeHour] in decimal, null=closed
 const HOURS = {0:null, 1:[12,20.5], 2:[10,20.5], 3:[10,20.5], 4:[10,20.5], 5:[10,20.5], 6:[10,15.5]};
 const BUFFER = 15; // min between behandel-room appointments

 const DAYS_NL=['zo','ma','di','wo','do','vr','za'], DAYS_EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const MON_NL=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
 const MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];

 // ---------- state ----------
 const KEY='hl_booking';
 let state = load() || {treatmentId:null, staff:null, dateISO:null, time:null, name:'', email:'', phone:'', note:'', marketing:false, docAgreed:false, signature:'', stepKey:'treatment'};
 function load(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
 function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

 // preselect from URL
 const pre = new URLSearchParams(location.search).get('treatment');
 if(pre && window.HL_treatment && window.HL_treatment(pre)){ state.treatmentId=pre; if(state.stepKey==='treatment') state.stepKey='moment'; }

 // ---------- helpers ----------
 function steps(){
 const t = state.treatmentId && HL_treatment(state.treatmentId);
 const arr=['treatment','moment','details'];
 if(t && t.doc!=='C') arr.push('docs');
 arr.push('confirm');
 return arr;
 }
 const STEP_LABEL={treatment:['Behandeling','Treatment'], moment:['Moment','Moment'], details:['Gegevens','Details'], docs:['Documenten','Documents'], confirm:['Bevestigen','Confirm']};
 function seeded(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return ()=>{ h+=0x6D2B79F5; let t=Math.imul(h^h>>>15,1|h); t^=t+Math.imul(t^t>>>7,61|t); return ((t^t>>>14)>>>0)/4294967296; }; }
 function fmtTime(dec){ const h=Math.floor(dec), m=Math.round((dec-h)*60); return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'); }
 function dateFromISO(iso){ const [y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
 function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
 function fmtDate(d){ return (L()==='nl'?DAYS_NL:DAYS_EN)[d.getDay()]+' '+d.getDate()+' '+(L()==='nl'?MON_NL:MON_EN)[d.getMonth()]; }

 // generate available start-times (decimal hours) for a treatment on a date
 function slotsFor(t, d){
 const hrs = HOURS[d.getDay()];
 if(!hrs) return [];
 const isRood = t.room==='rood';
 const step = isRood ? (20/60) : 0.5;
 const dur = (t.dur + (isRood?0:BUFFER))/60;
 const rnd = seeded(t.id+iso(d));
 const out=[];
 for(let s=hrs[0]; s+ dur <= hrs[1] + (isRood?0.001:0); s+=step){
 // rood licht: many parallel spots → mostly free; behandel room: single → more taken
 const taken = isRood ? (rnd() < 0.18) : (rnd() < 0.55);
 out.push({t:s, free:!taken});
 }
 return out;
 }
 function dayHasAvail(t,d){ return slotsFor(t,d).some(s=>s.free); }

 // ---------- DOM refs ----------
 let elStepper, elFlow, elSummary;
 function $(id){ return document.getElementById(id); }

 // ---------- render ----------
 function render(){
 save();
 renderStepper();
 renderSummary();
 const fn={treatment:stepTreatment, moment:stepMoment, details:stepDetails, docs:stepDocs, confirm:stepConfirm}[state.stepKey];
 elFlow.innerHTML='';
 elFlow.appendChild(fn());
 if(window.HL_setLang) window.HL_setLang(L());
 window.scrollTo({top:0,behavior:'smooth'});
 }

 function renderStepper(){
 const order=steps();
 const cur=order.indexOf(state.stepKey);
 elStepper.innerHTML = order.map((k,i)=>{
 const st = i<cur?'done':(i===cur?'active':'todo');
 return `<div class="stp ${st}">
 <span class="dot">${i<cur?'✓':(i+1)}</span>
 <span class="lbl" data-nl="${STEP_LABEL[k][0]}" data-en="${STEP_LABEL[k][1]}">${L()==='nl'?STEP_LABEL[k][0]:STEP_LABEL[k][1]}</span>
 </div>`;
 }).join('<span class="stp-line"></span>');
 }

 function renderSummary(){
 if(!state.treatmentId){ elSummary.innerHTML=''; elSummary.style.display='none'; return; }
 const t=HL_treatment(state.treatmentId);
 const parts=[];
 parts.push(`<span class="su-t">${L()==='nl'?t.nl.name:t.en.name}</span>`);
 parts.push(`<span class="su-d">${t.dur} min · € ${t.price}</span>`);
 if(state.staff){ const s=state.staff==='any'?T('Geen voorkeur','No preference'):(HL_STAFF[state.staff]?HL_STAFF[state.staff][L()]:''); parts.push(`<span class="su-d">· ${s}</span>`); }
 if(state.dateISO && state.time){ parts.push(`<span class="su-d">· ${fmtDate(dateFromISO(state.dateISO))}, ${state.time}</span>`); }
 elSummary.style.display='flex';
 elSummary.innerHTML=`<span class="su-dot">✦</span><div class="su-text">${parts.join(' ')}</div>`;
 }

 // wrapper helper
 function wrap(title_nl,title_en,sub_nl,sub_en,inner){
 const d=document.createElement('div');
 d.className='step-pane';
 d.innerHTML=`<div class="step-head"><h2 data-nl="${title_nl}" data-en="${title_en}">${title_nl}</h2>${sub_nl?`<p class="muted" data-nl="${sub_nl}" data-en="${sub_en}">${sub_nl}</p>`:''}</div>`;
 if(typeof inner==='string') d.insertAdjacentHTML('beforeend',inner); else d.appendChild(inner);
 return d;
 }

 // ============ STEP 1, TREATMENT ============
 function stepTreatment(){
 const d=wrap('Kies je behandeling','Choose your treatment','Selecteer wat bij je past, je kunt later altijd nog wisselen.','Select what suits you, you can always switch later.','');
 const chips=document.createElement('div'); chips.className='bk-filters';
 chips.innerHTML=HL_CATS.map(c=>`<button class="chip ${c.id==='all'?'is-active':''}" data-filter="${c.id}" data-nl="${c.nl}" data-en="${c.en}">${c.nl}</button>`).join('');
 d.appendChild(chips);
 const grid=document.createElement('div'); grid.className='bk-grid';
 grid.innerHTML=HL_TREATMENTS.map(t=>{
 const cat=HL_CATS.find(c=>c.id===t.cat);
 const sel = state.treatmentId===t.id?' selected':'';
 const badge = t.allDay?'<span class="bk-badge rood" data-nl="Hele dag" data-en="All day">Hele dag</span>':(t.walkin?'<span class="bk-badge" data-nl="Walk-in" data-en="Walk-in">Walk-in</span>':'');
 return `<button class="bk-card${sel}" data-cat="${t.cat}" data-id="${t.id}">
 <span class="bk-thumb"><img src="${t.photo}" alt="" loading="lazy" onerror="this.classList.add('img-failed')">${badge}</span>
 <span class="bk-info">
 <span class="bk-cat" data-nl="${cat.nl}" data-en="${cat.en}">${cat.nl}</span>
 <span class="bk-name" data-nl="${t.nl.name}" data-en="${t.en.name}">${t.nl.name}</span>
 <span class="bk-meta">${t.dur} min · € ${t.price}</span>
 </span>
 <span class="bk-check">✓</span>
 </button>`;
 }).join('');
 d.appendChild(grid);
 // interactions
 chips.querySelectorAll('.chip').forEach(ch=>ch.addEventListener('click',()=>{
 const f=ch.dataset.filter; chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('is-active',c===ch));
 grid.querySelectorAll('.bk-card').forEach(c=>{ c.style.display=(f==='all'||c.dataset.cat===f)?'':'none'; });
 }));
 grid.querySelectorAll('.bk-card').forEach(card=>card.addEventListener('click',()=>{
 state.treatmentId=card.dataset.id; state.staff=null; state.dateISO=null; state.time=null;
 grid.querySelectorAll('.bk-card').forEach(c=>c.classList.toggle('selected',c===card));
 save(); renderSummary(); footerNext(true);
 setTimeout(()=>go('moment'),360);
 }));
 d.appendChild(footer(null, state.treatmentId?'moment':null));
 return d;
 }

 // ============ STEP 2, MOMENT ============
 function stepMoment(){
 const t=HL_treatment(state.treatmentId);
 const needStaff = t.staff.length>1;
 const onlyChantal = t.staff.length===1;
 const d=wrap('Kies je moment','Choose your moment', needStaff?'Bij wie en wanneer komt jou het beste uit?':'Wanneer komt het jou het beste uit?', needStaff?'With whom and when suits you best?':'When suits you best?','');

 // staff
 if(needStaff){
 if(!state.staff) state.staff='any';
 const sw=document.createElement('div'); sw.className='staff-row';
 const opts=[...t.staff.map(id=>({id,...HL_STAFF[id]})),{id:'any',nl:'Geen voorkeur',en:'No preference',role_nl:'Wij kiezen de ruimste beschikbaarheid',role_en:'We pick the widest availability'}];
 sw.innerHTML=opts.map(o=>`<button class="staff-opt${state.staff===o.id?' on':''}" data-staff="${o.id}">
 <span class="staff-av" style="${o.id==='any'?'background:var(--linen-deep)':'background:'+(o.color||'#BC813A')+'22'}">${o.id==='any'?'∗':(o.nl[0])}</span>
 <span class="staff-name" data-nl="${o.nl}" data-en="${o.en}">${o.nl}</span>
 <span class="staff-role muted" data-nl="${o.role_nl||''}" data-en="${o.role_en||''}">${o.role_nl||''}</span>
 </button>`).join('');
 sw.querySelectorAll('.staff-opt').forEach(b=>b.addEventListener('click',()=>{ state.staff=b.dataset.staff; sw.querySelectorAll('.staff-opt').forEach(x=>x.classList.toggle('on',x===b)); save(); }));
 const sec=document.createElement('div'); sec.className='moment-sec';
 sec.innerHTML='<div class="moment-label" data-nl="Behandelaar" data-en="Therapist">Behandelaar</div>';
 sec.appendChild(sw); d.appendChild(sec);
 } else {
 state.staff = onlyChantal ? t.staff[0] : (t.staff[0]||null);
 if(t.staff.length){
 d.insertAdjacentHTML('beforeend',`<p class="note-line"><span class="note-dot"></span><span data-nl="Deze behandeling wordt verzorgd door ${HL_STAFF[t.staff[0]].nl}." data-en="This treatment is performed by ${HL_STAFF[t.staff[0]].en}.">Deze behandeling wordt verzorgd door ${HL_STAFF[t.staff[0]].nl}.</span></p>`);
 } else {
 d.insertAdjacentHTML('beforeend',`<p class="note-line rood"><span class="note-dot"></span><span data-nl="${t.room==='rood'?'Rode Licht Ruimte, de hele dag zelfstandig boekbaar, geen medewerker nodig.':'Zonnestudio, walk-in.'}" data-en="${t.room==='rood'?'Red Light Room, bookable independently all day, no staff needed.':'Tanning studio, walk-in.'}">${t.room==='rood'?'Rode Licht Ruimte, de hele dag zelfstandig boekbaar, geen medewerker nodig.':'Zonnestudio, walk-in.'}</span></p>`);
 }
 }

 // calendar + slots
 const cal=document.createElement('div'); cal.className='cal-wrap'; cal.id='cal-wrap';
 d.appendChild(cal);
 renderCalendar(cal, t);

 d.appendChild(footer('treatment', (state.dateISO&&state.time)?'details':null));
 return d;
 }

 let calMonth=null;
 function renderCalendar(host, t){
 const today=new Date(); today.setHours(0,0,0,0);
 if(!calMonth) calMonth = state.dateISO?dateFromISO(state.dateISO):new Date(today);
 const view=new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
 const monthName=(L()==='nl'?MON_NL:MON_EN)[view.getMonth()]+' '+view.getFullYear();
 const firstDow=(view.getDay()+6)%7; // Mon=0
 const dim=new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
 const dayhead=(L()==='nl'?['ma','di','wo','do','vr','za','zo']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
 const maxDate=new Date(today); maxDate.setDate(maxDate.getDate()+60);
 const prevDisabled = view<=new Date(today.getFullYear(),today.getMonth(),1);

 let cells='';
 for(let i=0;i<firstDow;i++) cells+='<span class="cal-cell empty"></span>';
 for(let dd=1; dd<=dim; dd++){
 const dt=new Date(view.getFullYear(),view.getMonth(),dd);
 const past = dt<today, far=dt>maxDate, closed=!HOURS[dt.getDay()];
 const avail = !past&&!far&&!closed&&dayHasAvail(t,dt);
 const sel = state.dateISO===iso(dt);
 let cls='cal-cell';
 if(past||far||closed) cls+=' off';
 else if(!avail) cls+=' full';
 else cls+=' open';
 if(sel) cls+=' sel';
 cells+=`<button class="${cls}" ${avail?'':'disabled'} data-iso="${iso(dt)}">${dd}${avail?'<span class="cal-d"></span>':''}</button>`;
 }
 host.innerHTML=`
 <div class="cal">
 <div class="cal-top">
 <button class="cal-nav" id="cal-prev" ${prevDisabled?'disabled':''} aria-label="prev">‹</button>
 <span class="cal-month">${monthName}</span>
 <button class="cal-nav" id="cal-next" aria-label="next">›</button>
 </div>
 <div class="cal-dows">${dayhead.map(d=>`<span>${d}</span>`).join('')}</div>
 <div class="cal-grid">${cells}</div>
 <div class="cal-legend">
 <span><i class="lg open"></i><span data-nl="Beschikbaar" data-en="Available">Beschikbaar</span></span>
 <span><i class="lg full"></i><span data-nl="Vol" data-en="Full">Vol</span></span>
 </div>
 </div>
 <div class="slots" id="slots"></div>`;
 host.querySelector('#cal-prev').addEventListener('click',()=>{ calMonth=new Date(view.getFullYear(),view.getMonth()-1,1); renderCalendar(host,t); if(window.HL_setLang)HL_setLang(L()); });
 host.querySelector('#cal-next').addEventListener('click',()=>{ calMonth=new Date(view.getFullYear(),view.getMonth()+1,1); renderCalendar(host,t); if(window.HL_setLang)HL_setLang(L()); });
 host.querySelectorAll('.cal-cell.open').forEach(c=>c.addEventListener('click',()=>{
 state.dateISO=c.dataset.iso; state.time=null;
 host.querySelectorAll('.cal-cell').forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
 save(); loadSlots(t); renderSummary(); footerNext(false);
 }));
 if(state.dateISO) loadSlots(t);
 }

 function loadSlots(t){
 const host=$('slots'); if(!host) return;
 host.innerHTML='<div class="slot-loading">'+Array(8).fill('<span class="sk"></span>').join('')+'</div>';
 setTimeout(()=>{
 const d=dateFromISO(state.dateISO);
 const slots=slotsFor(t,d);
 const free=slots.filter(s=>s.free);
 if(!free.length){
 host.innerHTML=`<div class="slots-empty"><span class="se-mark">☾</span><p data-nl="Geen vrije tijden op deze dag. Kies een andere dag, of bel ons, dan kijken we samen." data-en="No free times on this day. Pick another day, or call us and we'll look together.">Geen vrije tijden op deze dag.</p><a class="btn btn-ghost" href="tel:+31613761673" data-nl="Bel ons" data-en="Call us">Bel ons</a></div>`;
 if(window.HL_setLang)HL_setLang(L()); return;
 }
 host.innerHTML=`<div class="slots-label" data-nl="Beschikbare tijden" data-en="Available times">Beschikbare tijden</div><div class="slot-grid">`+
 slots.map(s=>`<button class="slot ${s.free?'':'taken'} ${state.time===fmtTime(s.t)?'on':''}" ${s.free?'':'disabled'} data-t="${fmtTime(s.t)}">${fmtTime(s.t)}</button>`).join('')+`</div>`;
 host.querySelectorAll('.slot:not(.taken)').forEach(b=>b.addEventListener('click',()=>{
 state.time=b.dataset.t; host.querySelectorAll('.slot').forEach(x=>x.classList.remove('on')); b.classList.add('on');
 save(); renderSummary(); footerNext(true); var nb=document.querySelector('.fn-next'); if(nb) nb.dataset.go='details';
 setTimeout(()=>go('details'),300);
 }));
 if(window.HL_setLang)HL_setLang(L());
 }, 520);
 }

 // ============ STEP 3, DETAILS ============
 function stepDetails(){
 const d=wrap('Jouw gegevens','Your details','We hebben alleen je contactgegevens nodig, geen account, geen wachtwoord.','We only need your contact details, no account, no password.','');
 const f=document.createElement('div'); f.className='det-form';
 f.innerHTML=`
 <div class="form-row">
 <div class="field"><label data-nl="Naam" data-en="Name">Naam</label><input id="f-name" type="text" value="${esc(state.name)}" data-nl-ph="Voor- en achternaam" data-en-ph="First and last name"></div>
 <div class="field"><label data-nl="Telefoon" data-en="Phone">Telefoon</label><input id="f-phone" type="tel" value="${esc(state.phone)}" data-nl-ph="06 ..." data-en-ph="+31 ..."></div>
 </div>
 <div class="field"><label data-nl="E-mail" data-en="Email">E-mail</label><input id="f-email" type="email" value="${esc(state.email)}" data-nl-ph="je@email.nl" data-en-ph="you@email.com"></div>
 <div class="field"><label data-nl="Opmerking (optioneel)" data-en="Note (optional)">Opmerking (optioneel)</label><textarea id="f-note" rows="3" data-nl-ph="Wensen, allergieën of iets dat we moeten weten?" data-en-ph="Wishes, allergies or anything we should know?">${esc(state.note)}</textarea></div>
 <label class="mk-optin">
 <input id="f-mk" type="checkbox" ${state.marketing?'checked':''}>
 <span>
 <span class="mk-title" data-nl="Houd mij op de hoogte van acties en nieuws van The Healing Lounge." data-en="Keep me informed about offers and news from The Healing Lounge.">Houd mij op de hoogte van acties en nieuws van The Healing Lounge.</span>
 <span class="mk-sub muted" data-nl="Af en toe een mooie actie of nieuwsbrief. Je kunt je altijd met één klik afmelden." data-en="An occasional lovely offer or newsletter. You can unsubscribe with one click anytime.">Af en toe een mooie actie of nieuwsbrief. Je kunt je altijd met één klik afmelden.</span>
 </span>
 </label>`;
 d.appendChild(f);
 const t=HL_treatment(state.treatmentId);
 const nextKey = t.doc!=='C' ? 'docs' : 'confirm';
 const ft=footer('moment', null);
 d.appendChild(ft);
 function sync(){
 state.name=$('f-name').value; state.email=$('f-email').value; state.phone=$('f-phone').value; state.note=$('f-note').value; state.marketing=$('f-mk').checked; save();
 const ok=state.name.trim() && /.+@.+\..+/.test(state.email) && state.phone.trim();
 footerNext(!!ok);
 ft.querySelector('.fn-next').dataset.go=nextKey;
 }
 f.addEventListener('input',sync); f.addEventListener('change',sync);
 setTimeout(sync,0);
 return d;
 }

 // ============ STEP 4, DOCS ============
 function stepDocs(){
 const t=HL_treatment(state.treatmentId);
 const isA=t.doc==='A';
 const d=wrap(isA?'Akkoord & ondertekenen':'Aandachtspunten', isA?'Agreement & signature':'Guidelines',
 isA?'Lees de verklaring rustig door en onderteken met je naam.':'Lees de aandachtspunten door en bevestig dat je ze begrepen hebt.',
 isA?'Read the statement and sign with your name.':'Read the guidelines and confirm you understood them.','');
 const docName = isA?['Contra-indicatieverklaring','Contra-indication statement']:['Specifieke aandachtspunten','Specific guidelines'];
 const body = isA?DOC_A:DOC_B;
 const v=document.createElement('div'); v.className='doc-viewer';
 v.innerHTML=`<div class="doc-bar"><span class="doc-file" data-nl="${docName[0]}" data-en="${docName[1]}">${docName[0]}</span><span class="doc-ver muted">v1.2 · ${L()==='nl'?'NL':'EN'}</span></div>
 <div class="doc-scroll" id="doc-scroll">${L()==='nl'?body.nl:body.en}</div>`;
 d.appendChild(v);

 const agree=document.createElement('label'); agree.className='checkbox doc-agree';
 agree.innerHTML=`<input id="f-agree" type="checkbox" ${state.docAgreed?'checked':''}><span data-nl="${isA?'Ik heb dit gelezen en ga akkoord.':'Ik heb dit gelezen en begrepen.'}" data-en="${isA?'I have read this and agree.':'I have read and understood this.'}">${isA?'Ik heb dit gelezen en ga akkoord.':'Ik heb dit gelezen en begrepen.'}</span>`;
 d.appendChild(agree);

 if(isA){
 const sig=document.createElement('div'); sig.className='sig-block';
 sig.innerHTML=`<label class="sig-label" data-nl="Typ je volledige naam als handtekening" data-en="Type your full name as signature">Typ je volledige naam als handtekening</label>
 <input id="f-sig" class="sig-input" type="text" value="${esc(state.signature||state.name)}" data-nl-ph="Volledige naam" data-en-ph="Full name">
 <div class="sig-render" id="sig-render">${esc(state.signature||state.name)||'&nbsp;'}</div>
 <div class="sig-meta muted" id="sig-meta"></div>`;
 d.appendChild(sig);
 }

 const ft=footer('details', 'confirm'); d.appendChild(ft);
 function sync(){
 state.docAgreed=$('f-agree').checked;
 let ok=state.docAgreed;
 if(isA){ state.signature=$('f-sig').value; $('sig-render').textContent=state.signature||' ';
 $('sig-meta').innerHTML = state.signature?`${esc(state.signature)} · ${new Date().toLocaleDateString(L()==='nl'?'nl-NL':'en-GB')} · ${docName[L()==='nl'?0:1]} v1.2`:'';
 ok = ok && state.signature.trim().length>2;
 }
 save(); footerNext(!!ok);
 }
 d.addEventListener('input',sync); d.addEventListener('change',sync);
 setTimeout(sync,0);
 return d;
 }

 // ============ STEP 5, CONFIRM ============
 function stepConfirm(){
 const t=HL_treatment(state.treatmentId);
 const d=wrap('Controleer & bevestig','Review & confirm','Klopt alles? Dan ronden we je afspraak af.','All correct? Then we finalise your appointment.','');
 const staff = state.staff==='any'?T('Geen voorkeur','No preference'):(state.staff&&HL_STAFF[state.staff]?HL_STAFF[state.staff][L()]:T('Zelfstandig','Independent'));
 const room = t.room==='rood'?T('Rode Licht Ruimte','Red Light Room'):t.room==='zon'?T('Zonnestudio','Tanning Studio'):T('Behandelruimte','Treatment Room');
 const rows=[
 ['Behandeling','Treatment', L()==='nl'?t.nl.name:t.en.name],
 ['Behandelaar','Therapist', staff],
 ['Ruimte','Room', room],
 ['Datum & tijd','Date & time', state.dateISO?fmtDate(dateFromISO(state.dateISO))+', '+state.time:', '],
 ['Duur','Duration', t.dur+' min'],
 ['Naam','Name', state.name||', '],
 ['E-mail','Email', state.email||', '],
 ];
 const sum=document.createElement('div'); sum.className='confirm-card';
 sum.innerHTML=`
 ${rows.map(r=>`<div class="cf-row"><span class="cf-k" data-nl="${r[0]}" data-en="${r[1]}">${r[0]}</span><span class="cf-v">${esc(r[2])}</span></div>`).join('')}
 <div class="cf-row total"><span class="cf-k" data-nl="Te voldoen in de salon" data-en="To pay at the salon">Te voldoen in de salon</span><span class="cf-v price">€ ${t.price}</span></div>
 <div class="cf-trust"><span style="color:var(--honey)">✦</span><span data-nl="We vragen nooit vooruitbetaling. Je rekent rustig af in de salon, ná je behandeling." data-en="We never ask for prepayment. You settle calmly at the salon, after your treatment.">We vragen nooit vooruitbetaling. Je rekent rustig af in de salon, ná je behandeling.</span></div>
 ${state.marketing?`<div class="cf-mk" data-nl="✓ Je ontvangt voortaan onze acties en nieuwsbrief." data-en="✓ You'll receive our offers and newsletter.">✓ Je ontvangt voortaan onze acties en nieuwsbrief.</div>`:''}`;
 d.appendChild(sum);

 // error state demo toggle (slot just taken)
 const err=document.createElement('div'); err.className='confirm-error'; err.id='cf-error'; err.style.display='none';
 err.innerHTML=`<span>⚠</span><span data-nl="Dit tijdslot is zojuist vergeven. Kies een ander moment." data-en="This time slot was just taken. Please choose another moment.">Dit tijdslot is zojuist vergeven. Kies een ander moment.</span>`;
 d.appendChild(err);

 const ft=document.createElement('div'); ft.className='flow-footer';
 ft.innerHTML=`<button class="btn btn-ghost fn-back" data-nl="Terug" data-en="Back">Terug</button>
 <button class="btn btn-gold btn-lg fn-confirm" data-nl="Bevestig afspraak" data-en="Confirm appointment">Bevestig afspraak</button>`;
 d.appendChild(ft);
 ft.querySelector('.fn-back').addEventListener('click',()=>go(steps()[steps().indexOf('confirm')-1]));
 ft.querySelector('.fn-confirm').addEventListener('click',(e)=>{
 const btn=e.currentTarget; btn.classList.add('loading'); btn.disabled=true;
 btn.innerHTML='<span class="spin"></span>'+T('Bevestigen…','Confirming…');
 setTimeout(()=>{ success(); }, 1400);
 });
 return d;
 }

 // ============ SUCCESS, RITUEEL ============
 function success(){
 state.stepKey='treatment'; // reset for next time but keep details until overlay closes
 const ov=document.createElement('div'); ov.className='ritueel-overlay';
 ov.innerHTML=`<canvas class="ro-canvas"></canvas>
 <div class="ro-inner">
 <div class="ro-mark">❀</div>
 <div class="ro-bloom"></div>
 <h2 class="ro-title" data-nl-html="Tot snel bij<br>The Healing Lounge" data-en-html="See you soon at<br>The Healing Lounge">Tot snel bij<br>The Healing Lounge</h2>
 <p class="ro-sub" data-nl="Je ontvangt een bevestiging per e-mail met een agenda-uitnodiging en een link om je afspraak te beheren." data-en="You'll receive a confirmation by email with a calendar invite and a link to manage your appointment.">Je ontvangt een bevestiging per e-mail met een agenda-uitnodiging.</p>
 <div class="ro-card" id="ro-card"></div>
 <div class="ro-actions">
 <a class="btn btn-gold" href="afspraak.html" data-nl="Bekijk je afspraak" data-en="View your appointment">Bekijk je afspraak</a>
 <a class="btn btn-ghost on-dark" href="index.html" data-nl="Terug naar home" data-en="Back to home">Terug naar home</a>
 </div>
 </div>`;
 document.body.appendChild(ov);
 const t=HL_treatment(state.treatmentId);
 $('ro-card').innerHTML=`<span class="su-dot">✦</span> <strong>${L()==='nl'?t.nl.name:t.en.name}</strong> · ${state.dateISO?fmtDate(dateFromISO(state.dateISO)):''}, ${state.time||''}`;
 requestAnimationFrame(()=>ov.classList.add('show'));
 if(window.HLMountShader) window.HLMountShader(ov.querySelector('.ro-canvas'),'honey',{speed:0.7,maxDpr:1.4});
 if(window.HL_setLang) HL_setLang(L());
 // store a "confirmed appointment" for the magic-link page
 try{ localStorage.setItem('hl_appointment', JSON.stringify({treatmentId:state.treatmentId, staff:state.staff, dateISO:state.dateISO, time:state.time, name:state.name, email:state.email, phone:state.phone, note:state.note, marketing:state.marketing, doc:t.doc, signature:state.signature})); }catch(e){}
 localStorage.removeItem(KEY);
 }

 // ---------- footer / nav ----------
 function footer(backKey, nextKey){
 const ft=document.createElement('div'); ft.className='flow-footer';
 ft.innerHTML=`${backKey?`<button class="btn btn-ghost fn-back" data-nl="Terug" data-en="Back">Terug</button>`:'<span></span>'}
 <button class="btn btn-gold btn-lg fn-next" data-go="${nextKey||''}" ${nextKey?'':'disabled'} data-nl="Verder" data-en="Continue">Verder</button>`;
 if(backKey) ft.querySelector('.fn-back').addEventListener('click',()=>go(backKey));
 ft.querySelector('.fn-next').addEventListener('click',(e)=>{ const g=e.currentTarget.dataset.go; if(g) go(g); });
 return ft;
 }
 function footerNext(enable){ const b=document.querySelector('.fn-next'); if(b){ b.disabled=!enable; if(enable&&!b.dataset.go){ /* keep */ } } }
 function go(key){ if(!key) return; state.stepKey=key; render(); }

 function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

 // ---------- documents ----------
 const DOC_A={
 nl:`<h4>Contra-indicaties</h4><p>Voor jouw veiligheid lees je dit aandachtig door. Cupping en honing(bindweefsel)massages voeren wij in een aantal situaties niet uit.</p>
 <p><strong>Wij behandelen niet bij:</strong> zwangerschap, borstvoeding, kanker, na chemotherapie (minimaal 6 maanden wachten), trombose en andere vaataandoeningen, bloedstollingsproblemen (hemofilie), ernstige lever-, nier- of hartaandoeningen, koorts of infectieziekten, een honingallergie, en onder 18 jaar. Ook niet binnen 6 weken na fillers of botox op de betreffende plek, of binnen 2 weken na een laser- of ontharingsbehandeling.</p>
 <p><strong>Eerst overleg met je arts bij:</strong> astma of luchtwegproblemen, hoge of lage bloeddruk, spataderen, botbreuken of kneuzingen, huidaandoeningen, hernia en psychische klachten.</p>
 <h4>Voor en na de behandeling</h4><p>Scheer of wax de zone 24 uur vooraf niet. Blauw-paarse cupping marks en lichte roodheid zijn normaal. Vermijd zon, zonnebank, sauna en heet bad 24 uur na afloop, en drink voldoende water.</p>
 <h4>Toestemming</h4><p>Door te ondertekenen verklaar je dit te hebben gelezen, naar waarheid te hebben gemeld of er contra-indicaties van toepassing zijn, en akkoord te gaan met de behandeling.</p>`,
 en:`<h4>Contraindications</h4><p>For your safety, please read this carefully. We do not perform cupping and honey (connective tissue) massages in a number of situations.</p>
 <p><strong>We do not treat in case of:</strong> pregnancy, breastfeeding, cancer, after chemotherapy (wait at least 6 months), thrombosis and other vascular conditions, blood clotting disorders (haemophilia), severe liver, kidney or heart conditions, fever or infectious diseases, a honey allergy, and being under 18. Also not within 6 weeks of fillers or botox on the relevant area, or within 2 weeks of a laser or hair removal treatment.</p>
 <p><strong>Consult your doctor first in case of:</strong> asthma or respiratory problems, high or low blood pressure, varicose veins, fractures or bruises, skin conditions, hernia and mental health complaints.</p>
 <h4>Before and after</h4><p>Do not shave or wax the area 24 hours beforehand. Blue-purple cupping marks and mild redness are normal. Avoid sun, sunbed, sauna and hot baths for 24 hours afterwards, and drink plenty of water.</p>
 <h4>Consent</h4><p>By signing you declare that you have read this, have truthfully reported whether any contraindications apply, and consent to the treatment.</p>`
 };
 const DOC_B={
 nl:`<h4>Specifieke aandachtspunten</h4><p>Om optimaal van je behandeling te genieten, houd je rekening met het volgende.</p>
 <p><strong>Vooraf:</strong> kom indien mogelijk zonder make-up, draag iets comfortabels en plan daarna wat rust in. Meld allergieën of huidgevoeligheden bij aankomst. Bij gezichtsbehandelingen: geen botox of fillers binnen 6 weken en geen peeling, microneedling of laser in het gelaat binnen 2 weken.</p>
 <p><strong>Achteraf:</strong> drink voldoende water, vermijd intensief sporten, zon en zonnebank gedurende 24 uur, en geef je huid de tijd om te herstellen.</p>
 <p>Twijfel of vragen? Bel ons gerust vooraf, we denken graag met je mee.</p>`,
 en:`<h4>Specific guidelines</h4><p>To enjoy your treatment to the fullest, please keep the following in mind.</p>
 <p><strong>Beforehand:</strong> come without make-up if possible, wear something comfortable and plan some rest afterwards. Report allergies or skin sensitivities on arrival. For facials: no botox or fillers within 6 weeks and no peel, microneedling or laser on the face within 2 weeks.</p>
 <p><strong>Afterwards:</strong> drink plenty of water, avoid intensive exercise, sun and sunbed for 24 hours, and give your skin time to recover.</p>
 <p>Any doubts or questions? Feel free to call us beforehand, we are happy to help.</p>`
 };

 // ---------- boot ----------
 window.HL_BOOKING_INIT=function(){
 elStepper=$('stepper'); elFlow=$('flow'); elSummary=$('summary');
 render();
 window.addEventListener('hl-lang', ()=>{ renderStepper(); renderSummary(); });
 };
})();
