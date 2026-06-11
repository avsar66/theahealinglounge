/* ============================================================
 THE HEALING LOUNGE, beheer engine
 Klanten & boekingen bekijken, aandachtspunten, marketinglijst,
 en CSV opnieuw importeren (overschrijven op e-mail / overslaan).
 Werkdata leeft in localStorage zodat wijzigingen behouden blijven.
 ============================================================ */
(function(){
 const L=()=> (window.HL_getLang?window.HL_getLang():'nl');
 const T=(nl,en)=> L()==='nl'?nl:en;
 const LS='hl_beheer_v1';

 // ---------- validators ----------
 const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 function validEmail(e){ e=(e||'').trim();
 if(!e) return {ok:false,reason:T('ontbreekt','missing')};
 if(/\s/.test(e)) return {ok:false,reason:T('bevat spatie','contains space')};
 if(!EMAIL_RE.test(e)) return {ok:false,reason:T('ongeldig formaat','invalid format')};
 const tld=e.split('.').pop().toLowerCase();
 const bad={copm:'com',con:'com',cmo:'com',comm:'com',c0m:'com',ne:'net',nk:'nl'};
 if(bad[tld]) return {ok:false,reason:T('typefout: .','typo: .')+tld+' → .'+bad[tld], suggest:e.slice(0,-tld.length)+bad[tld]};
 return {ok:true};
 }
 function normPhone(p){ let s=(p||'').replace(/[\s\-().]/g,'');
 if(!s) return {norm:'',ok:false,reason:T('ontbreekt','missing')};
 if(s.startsWith('0031')) s='+31'+s.slice(4);
 else if(s.startsWith('00')) s='+'+s.slice(2);
 else if(s.startsWith('06')) s='+31'+s.slice(1);
 else if(s.startsWith('31')&&!s.startsWith('+')) s='+'+s;
 if(/^\+31\d{9}$/.test(s)) return {norm:s,ok:true};
 return {norm:s,ok:false,reason:T('onvolledig / onverwacht','incomplete / unexpected')};
 }

 // ---------- working data ----------
 let data=load();
 function load(){
 try{ const s=JSON.parse(localStorage.getItem(LS)); if(s&&s.customers) return s; }catch(e){}
 return { customers:clone(window.HL_SEED_CUSTOMERS||[]), appointments:clone(window.HL_SEED_APPOINTMENTS||[]) };
 }
 function clone(x){ return JSON.parse(JSON.stringify(x)); }
 function persist(){ try{ localStorage.setItem(LS, JSON.stringify(data)); }catch(e){} }
 function resetData(){ localStorage.removeItem(LS); data=load(); render(); }

 // ---------- state ----------
 let state={ tab:'klanten', q:'', onlyIssues:false, importMode:'overwrite', pending:null };
 let root;

 // ---------- helpers ----------
 function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
 function custName(c){ return (c.firstName+' '+c.lastName).trim(); }
 function emailBad(c){ return !validEmail(c.email).ok; }
 function phoneBad(c){ return !normPhone(c.phone).ok; }

 // ---------- issues report ----------
 function buildIssues(){
 const cs=data.customers;
 const emailErr=cs.filter(c=>emailBad(c)).map(c=>{ const v=validEmail(c.email); return {who:custName(c),val:c.email,reason:v.reason,suggest:v.suggest}; });
 const phoneErr=cs.filter(c=>phoneBad(c)).map(c=>{ const v=normPhone(c.phone); return {who:custName(c),val:c.phone||', ',reason:v.reason}; });
 // shared email, different names (vs appointments)
 const byEmail={}; cs.forEach(c=>{ if(c.email) byEmail[c.email.toLowerCase()]=c; });
 const shareMap={};
 (data.appointments||[]).forEach(a=>{
 const c=byEmail[(a.email||'').toLowerCase()]; if(!c||!a.customerName) return;
 const ln=(c.lastName||'').toLowerCase().replace(/[^a-z]/g,'');
 const an=(a.customerName||'').toLowerCase().replace(/[^a-z]/g,'');
 if(an && ln && !an.includes(ln) && !an.includes((c.firstName||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,4))){
 (shareMap[c.email]=shareMap[c.email]||{cust:custName(c),names:new Set()}).names.add(a.customerName);
 }
 });
 const shared=Object.keys(shareMap).map(k=>({email:k,cust:shareMap[k].cust,names:[...shareMap[k].names]}));
 return {emailErr,phoneErr,shared};
 }

 // ---------- render ----------
 function render(){
 persist();
 root.innerHTML='';
 root.appendChild(renderHead());
 root.appendChild(renderTabs());
 const body=document.createElement('div');
 if(state.tab==='klanten') body.appendChild(renderKlanten());
 else if(state.tab==='boekingen') body.appendChild(renderBoekingen());
 else if(state.tab==='marketing') body.appendChild(renderMarketing());
 else body.appendChild(renderImport());
 root.appendChild(body);
 if(window.HL_setLang) window.HL_setLang(L());
 }

 function renderHead(){
 const iss=buildIssues();
 const issueCount=iss.emailErr.length+iss.phoneErr.length+iss.shared.length;
 const onList=data.customers.filter(c=>c.marketing).length;
 const meta=window.HL_SEED_META||{};
 const d=document.createElement('div');
 d.innerHTML=`
 <div class="bh-head">
 <h1 data-nl="Klanten &amp; boekingen" data-en="Customers &amp; bookings">Klanten &amp; boekingen</h1>
 <p class="sub" data-nl-html="Gesynchroniseerd uit je export. Nieuwe upload? <b>Bestaand e-mailadres wordt overschreven, onbekende toegevoegd.</b>" data-en-html="Synced from your export. New upload? <b>Existing email is overwritten, unknown ones added.</b>">Gesynchroniseerd uit je export.</p>
 </div>
 <div class="bh-stats">
 <div class="bh-stat"><div class="n">${data.customers.length}</div><div class="l" data-nl="Klanten" data-en="Customers">Klanten</div></div>
 <div class="bh-stat"><div class="n">${onList}</div><div class="l" data-nl="Op de marketinglijst" data-en="On the marketing list">Op de marketinglijst</div></div>
 <div class="bh-stat ${issueCount?'warn':''}"><div class="n">${issueCount}</div><div class="l" data-nl="Aandachtspunten" data-en="Items to check">Aandachtspunten</div></div>
 </div>`;
 if(issueCount){
 const box=document.createElement('div'); box.className='bh-issues';
 box.innerHTML=`<h3>⚠ <span data-nl="Aandachtspunten in de data" data-en="Items to check in the data">Aandachtspunten in de data</span> <span class="bh-chip-count">${issueCount}</span></h3>`;
 if(iss.emailErr.length){
 box.appendChild(group(T('Foutieve e-mailadressen','Invalid email addresses'), iss.emailErr.map(e=>
 `<li><span class="who">${esc(e.who)}</span> <span class="mono bh-bad">${esc(e.val)}</span>, ${esc(e.reason)}${e.suggest?` <span class="fix">→ ${esc(e.suggest)}?</span>`:''}</li>`)));
 }
 if(iss.phoneErr.length){
 box.appendChild(group(T('Ontbrekende of foutieve telefoonnummers','Missing or invalid phone numbers'), iss.phoneErr.map(e=>
 `<li><span class="who">${esc(e.who)}</span> <span class="mono ${e.val===', '?'bh-muted':'bh-bad'}">${esc(e.val)}</span>, ${esc(e.reason)}</li>`)));
 }
 if(iss.shared.length){
 box.appendChild(group(T('Zelfde e-mailadres, andere naam bij boeking','Same email, different name on booking'), iss.shared.map(s=>
 `<li><span class="mono">${esc(s.email)}</span>, ${T('klant','customer')}: <span class="who">${esc(s.cust)}</span>; ${T('geboekt als','booked as')}: ${esc(s.names.join(', '))}</li>`)));
 }
 d.appendChild(box);
 }
 return d;
 }
 function group(title, lis){
 const g=document.createElement('div'); g.className='bh-issue-group';
 g.innerHTML=`<div class="gt">${esc(title)} <span class="bh-muted">(${lis.length})</span></div><ul>${lis.join('')}</ul>`;
 return g;
 }

 function renderTabs(){
 const tabs=[['klanten','Klanten','Customers'],['boekingen','Boekingen','Bookings'],['marketing','Marketinglijst','Marketing list'],['import','Importeren','Import']];
 const d=document.createElement('div'); d.className='bh-tabs';
 tabs.forEach(t=>{ const b=document.createElement('button'); b.className='bh-tab'+(state.tab===t[0]?' on':''); b.setAttribute('data-nl',t[1]); b.setAttribute('data-en',t[2]); b.textContent=t[1];
 b.addEventListener('click',()=>{ state.tab=t[0]; render(); }); d.appendChild(b); });
 return d;
 }

 // ---------- KLANTEN ----------
 function renderKlanten(){
 const d=document.createElement('div');
 const q=state.q.toLowerCase();
 let list=data.customers.slice();
 if(q) list=list.filter(c=>(custName(c)+' '+c.email+' '+c.phone).toLowerCase().includes(q));
 if(state.onlyIssues) list=list.filter(c=>emailBad(c)||phoneBad(c));
 list.sort((a,b)=>custName(a).localeCompare(custName(b)));

 const bar=document.createElement('div'); bar.className='bh-toolbar';
 bar.innerHTML=`
 <label class="bh-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
 <input type="text" value="${esc(state.q)}" data-nl-ph="Zoek op naam, e-mail of telefoon…" data-en-ph="Search name, email or phone…"></label>
 <button class="bh-filter-toggle ${state.onlyIssues?'on':''}" id="bh-only">⚠ <span data-nl="Alleen aandachtspunten" data-en="Only issues">Alleen aandachtspunten</span></button>`;
 bar.querySelector('input').addEventListener('input',e=>{ state.q=e.target.value; const f=root.querySelector('#bh-cust-body'); if(f) refreshKlanten(); });
 bar.querySelector('#bh-only').addEventListener('click',()=>{ state.onlyIssues=!state.onlyIssues; render(); });
 d.appendChild(bar);

 const cnt=document.createElement('div'); cnt.className='bh-count-line'; cnt.id='bh-cust-count';
 cnt.textContent=T(list.length+' van '+data.customers.length+' klanten', list.length+' of '+data.customers.length+' customers');
 d.appendChild(cnt);

 const wrap=document.createElement('div'); wrap.className='bh-table-wrap';
 wrap.innerHTML=`<table class="bh-table"><thead><tr>
 <th data-nl="Naam" data-en="Name">Naam</th>
 <th data-nl="E-mail" data-en="Email">E-mail</th>
 <th data-nl="Telefoon" data-en="Phone">Telefoon</th>
 <th class="hide-sm" data-nl="Laatste boeking" data-en="Last booking">Laatste boeking</th>
 <th class="hide-sm" data-nl="Boekingen" data-en="Bookings">Boekingen</th>
 <th data-nl="Marketing" data-en="Marketing">Marketing</th>
 </tr></thead><tbody id="bh-cust-body"></tbody></table>`;
 d.appendChild(wrap);
 fillCustRows(wrap.querySelector('#bh-cust-body'), list);
 return d;
 }
 function refreshKlanten(){
 const q=state.q.toLowerCase();
 let list=data.customers.slice();
 if(q) list=list.filter(c=>(custName(c)+' '+c.email+' '+c.phone).toLowerCase().includes(q));
 if(state.onlyIssues) list=list.filter(c=>emailBad(c)||phoneBad(c));
 list.sort((a,b)=>custName(a).localeCompare(custName(b)));
 fillCustRows(root.querySelector('#bh-cust-body'), list);
 const c=root.querySelector('#bh-cust-count'); if(c) c.textContent=T(list.length+' van '+data.customers.length+' klanten', list.length+' of '+data.customers.length+' customers');
 }
 function fillCustRows(tb, list){
 if(!tb) return;
 tb.innerHTML=list.map(c=>{
 const eb=emailBad(c), pb=phoneBad(c);
 const src=c.source==='appointments.csv';
 return `<tr>
 <td><span class="nm">${esc(custName(c))||'<span class="bh-muted">, </span>'}</span>${src?` <span class="bh-tag-src" data-nl="uit boeking" data-en="from booking">uit boeking</span>`:''}</td>
 <td><span class="mono ${eb?'bh-bad':''}">${esc(c.email)||', '}</span>${eb?` <span class="bh-flag">⚠</span>`:''}</td>
 <td><span class="mono ${pb?'bh-bad':''}">${esc(c.phone)||'<span class="bh-muted">, </span>'}</span></td>
 <td class="hide-sm bh-muted">${esc(c.lastBooking)||', '}</td>
 <td class="hide-sm">${c.totalBookings||0}</td>
 <td><button class="bh-pill ${c.marketing?'ok':'cancel'}" data-mk="${esc(c.email)}">${c.marketing?T('Aangemeld','Subscribed'):T('Afgemeld','Unsubscribed')}</button></td>
 </tr>`;
 }).join('');
 tb.querySelectorAll('[data-mk]').forEach(b=>b.addEventListener('click',()=>{
 const c=data.customers.find(x=>x.email===b.getAttribute('data-mk')); if(!c) return;
 c.marketing=!c.marketing; if(!c.marketing) c.unsubscribedAt=new Date().toISOString().slice(0,10);
 persist(); render();
 }));
 }

 // ---------- BOEKINGEN ----------
 function renderBoekingen(){
 const d=document.createElement('div');
 const list=(data.appointments||[]).slice().sort((a,b)=>new Date(parseDate(a.start))-new Date(parseDate(b.start)));
 const wrap=document.createElement('div'); wrap.className='bh-table-wrap';
 wrap.innerHTML=`<table class="bh-table"><thead><tr>
 <th data-nl="Klant" data-en="Customer">Klant</th>
 <th data-nl="Dienst" data-en="Service">Dienst</th>
 <th class="hide-sm" data-nl="Medewerker" data-en="Staff">Medewerker</th>
 <th data-nl="Start" data-en="Start">Start</th>
 <th class="hide-sm" data-nl="Prijs" data-en="Price">Prijs</th>
 <th data-nl="Status" data-en="Status">Status</th>
 </tr></thead><tbody>${list.map(a=>{
 const cancel=/annul/i.test(a.status||'');
 return `<tr>
 <td><span class="nm">${esc(a.customerName)}</span><br><span class="mono bh-muted" style="font-size:12px">${esc(a.email)}</span></td>
 <td>${esc(a.service)}</td>
 <td class="hide-sm bh-muted">${esc(a.staff)}</td>
 <td class="bh-muted">${esc(a.start)}</td>
 <td class="hide-sm">${esc(a.price)}</td>
 <td><span class="bh-pill ${cancel?'cancel':'ok'}">${esc(a.status)}</span></td>
 </tr>`;
 }).join('')}</tbody></table>`;
 d.appendChild(wrap);
 return d;
 }
 function parseDate(s){ return (s||'').replace(/(\d+) (\w+) (\d+)/, '$2 $1 $3'); }

 // ---------- MARKETING ----------
 function renderMarketing(){
 const d=document.createElement('div');
 const on=data.customers.filter(c=>c.marketing);
 const off=data.customers.filter(c=>!c.marketing);
 const meta=(window.HL_SEED_META||{}).marketing||{};
 const info=document.createElement('div'); info.className='bh-card'; info.style.marginBottom='22px';
 info.innerHTML=`<h3 data-nl="Marketinglijst" data-en="Marketing list">Marketinglijst</h3>
 <p><b>${on.length}</b> ${T('van','of')} <b>${data.customers.length}</b> ${T('klanten staan op de lijst.','customers are on the list.')} ${off.length?`<b>${off.length}</b> ${T('afgemeld.','unsubscribed.')}`:''}</p>
 <div class="bh-rule"><span class="ic">✦</span><span data-nl="Grondslag: soft opt-in voor bestaande klanten (eigen, vergelijkbare diensten). Voorwaarde: elke mailing bevat een duidelijke afmeldlink. Afmeldingen worden hier vastgelegd." data-en="Basis: soft opt-in for existing customers (own, similar services). Condition: every mailing contains a clear unsubscribe link. Unsubscribes are recorded here.">Grondslag: soft opt-in voor bestaande klanten.</span></div>
 <div class="bh-actions">
 <button class="btn btn-ghost" id="mk-export" data-nl="Exporteer lijst (CSV)" data-en="Export list (CSV)">Exporteer lijst (CSV)</button>
 </div>`;
 d.appendChild(info);
 info.querySelector('#mk-export').addEventListener('click',exportMarketingCSV);

 // table of opted-in
 const wrap=document.createElement('div'); wrap.className='bh-table-wrap';
 const list=on.slice().sort((a,b)=>custName(a).localeCompare(custName(b)));
 wrap.innerHTML=`<table class="bh-table"><thead><tr>
 <th data-nl="Naam" data-en="Name">Naam</th><th data-nl="E-mail" data-en="Email">E-mail</th>
 <th class="hide-sm" data-nl="Sinds" data-en="Since">Sinds</th><th></th>
 </tr></thead><tbody>${list.map(c=>`<tr>
 <td class="nm">${esc(custName(c))}</td>
 <td class="mono ${emailBad(c)?'bh-bad':''}">${esc(c.email)}</td>
 <td class="hide-sm bh-muted">${esc(c.marketingSince||'')}</td>
 <td style="text-align:right"><button class="bh-pill cancel" data-off="${esc(c.email)}" data-nl="Afmelden" data-en="Unsubscribe">Afmelden</button></td>
 </tr>`).join('')}</tbody></table>`;
 d.appendChild(wrap);
 wrap.querySelectorAll('[data-off]').forEach(b=>b.addEventListener('click',()=>{
 const c=data.customers.find(x=>x.email===b.getAttribute('data-off')); if(c){ c.marketing=false; c.unsubscribedAt=new Date().toISOString().slice(0,10); persist(); render(); }
 }));
 return d;
 }

 // ---------- IMPORT ----------
 function renderImport(){
 const d=document.createElement('div'); d.className='bh-import';
 const card=document.createElement('div'); card.className='bh-card';
 card.innerHTML=`
 <h3 data-nl="Nieuwe export importeren" data-en="Import a new export">Nieuwe export importeren</h3>
 <p data-nl="Sleep je nieuwste klanten-CSV hierin. We koppelen op e-mailadres." data-en="Drop your latest customers CSV here. We match on email address.">Sleep je nieuwste klanten-CSV hierin. We koppelen op e-mailadres.</p>
 <div class="bh-radios">
 <label class="bh-radio ${state.importMode==='overwrite'?'on':''}"><input type="radio" name="imp" value="overwrite" ${state.importMode==='overwrite'?'checked':''}><span><span class="rt" data-nl="Overschrijven" data-en="Overwrite">Overschrijven</span><span class="rd" data-nl="Bestaand e-mailadres bijwerken met de nieuwe gegevens." data-en="Update existing email with the new details.">Bestaand e-mailadres bijwerken met de nieuwe gegevens.</span></span></label>
 <label class="bh-radio ${state.importMode==='skip'?'on':''}"><input type="radio" name="imp" value="skip" ${state.importMode==='skip'?'checked':''}><span><span class="rt" data-nl="Overslaan" data-en="Skip">Overslaan</span><span class="rd" data-nl="Bestaande klanten ongemoeid laten, alleen nieuwe toevoegen." data-en="Leave existing customers untouched, only add new ones.">Bestaande klanten ongemoeid laten, alleen nieuwe toevoegen.</span></span></label>
 </div>
 <div class="bh-drop" id="bh-drop"><span data-nl="📄 Sleep een CSV hierheen of klik om te kiezen" data-en="📄 Drop a CSV here or click to choose">Sleep een CSV hierheen of klik om te kiezen</span><input type="file" id="bh-file" accept=".csv,text/csv" hidden></div>
 <div class="bh-preview" id="bh-prev"></div>
 <div class="bh-actions" id="bh-imp-actions"></div>
 <p class="bh-note" data-nl="Tip: marketingvoorkeur van bestaande klanten blijft behouden, wie zich afmeldde, blijft afgemeld." data-en="Tip: existing customers keep their marketing preference, anyone who unsubscribed stays unsubscribed.">Tip: marketingvoorkeur blijft behouden.</p>`;
 d.appendChild(card);
 card.querySelectorAll('input[name="imp"]').forEach(r=>r.addEventListener('change',e=>{ state.importMode=e.target.value; card.querySelectorAll('.bh-radio').forEach(x=>x.classList.toggle('on', x.querySelector('input').checked)); }));
 const drop=card.querySelector('#bh-drop'), file=card.querySelector('#bh-file');
 drop.addEventListener('click',()=>file.click());
 drop.addEventListener('dragover',e=>{ e.preventDefault(); drop.classList.add('hot'); });
 drop.addEventListener('dragleave',()=>drop.classList.remove('hot'));
 drop.addEventListener('drop',e=>{ e.preventDefault(); drop.classList.remove('hot'); if(e.dataTransfer.files[0]) readImport(e.dataTransfer.files[0]); });
 file.addEventListener('change',e=>{ if(e.target.files[0]) readImport(e.target.files[0]); });

 // data tools
 const tools=document.createElement('div'); tools.className='bh-card';
 tools.innerHTML=`<h3 data-nl="Data" data-en="Data">Data</h3>
 <p data-nl="Exporteer de huidige, opgeschoonde lijst of zet alles terug naar de oorspronkelijke export." data-en="Export the current, cleaned list or reset everything to the original export.">Exporteer of reset.</p>
 <div class="bh-actions">
 <button class="btn btn-ghost" id="bh-exp-json" data-nl="Exporteer klanten (JSON)" data-en="Export customers (JSON)">Exporteer klanten (JSON)</button>
 <button class="btn btn-ghost" id="bh-exp-csv" data-nl="Exporteer klanten (CSV)" data-en="Export customers (CSV)">Exporteer klanten (CSV)</button>
 <button class="btn btn-ghost" id="bh-reset" data-nl="Reset naar oorspronkelijk" data-en="Reset to original">Reset naar oorspronkelijk</button>
 </div>`;
 d.appendChild(tools);
 tools.querySelector('#bh-exp-json').addEventListener('click',()=>download('klanten.json', JSON.stringify(data.customers,null,2),'application/json'));
 tools.querySelector('#bh-exp-csv').addEventListener('click',()=>exportCustomersCSV());
 tools.querySelector('#bh-reset').addEventListener('click',()=>{ if(confirm(T('Alle wijzigingen ongedaan maken en terug naar de oorspronkelijke export?','Undo all changes and return to the original export?'))) resetData(); });
 return d;
 }

 function readImport(f){
 const r=new FileReader();
 r.onload=()=>{ try{ previewImport(parseCSV(r.result)); }catch(e){ alert(T('Kon dit bestand niet lezen.','Could not read this file.')); } };
 r.readAsText(f);
 }
 function parseCSV(text){const rows=[];let i=0,field='',row=[],inQ=false;const pF=()=>{row.push(field);field='';};const pR=()=>{rows.push(row);row=[];};while(i<text.length){const c=text[i];if(inQ){if(c==='"'){if(text[i+1]==='"'){field+='"';i+=2;continue;}inQ=false;i++;continue;}field+=c;i++;continue;}if(c==='"'){inQ=true;i++;continue;}if(c===','){pF();i++;continue;}if(c==='\r'){i++;continue;}if(c==='\n'){pF();pR();i++;continue;}field+=c;i++;}if(field.length||row.length){pF();pR();}return rows.filter(r=>r.length>1||(r.length===1&&r[0].trim()!==''));}
 function rowsToCustomers(rows){
 const head=rows[0].map(h=>h.toLowerCase());
 const idx=(names)=>{ for(const n of names){ const i=head.findIndex(h=>h.includes(n)); if(i>=0) return i; } return -1; };
 const iV=idx(['voornaam','first']), iA=idx(['achternaam','last']), iE=idx(['mail']), iT=idx(['telefoon','phone']), iL=idx(['laatste','last booking']), iTot=idx(['totaal','total']);
 return rows.slice(1).map(r=>({ firstName:(r[iV]||'').trim(), lastName:(r[iA]||'').trim(), email:(r[iE]||'').trim(), phone:(()=>{const p=normPhone(r[iT]); return p.ok?p.norm:(r[iT]||'').trim();})(), phoneValid:normPhone(r[iT]).ok, emailValid:validEmail(r[iE]).ok, lastBooking:(r[iL]||'').trim(), totalBookings:Number(r[iTot])||0 })).filter(c=>c.email||c.firstName||c.lastName);
 }
 function previewImport(rows){
 let incoming; try{ incoming=rowsToCustomers(rows); }catch(e){ alert(T('Kolommen niet herkend (verwacht o.a. Voornaam, Achternaam, E-mail, Telefoon).','Columns not recognised (expects Voornaam, Achternaam, E-mail, Telefoon).')); return; }
 const byEmail={}; data.customers.forEach(c=>byEmail[(c.email||'').toLowerCase()]=c);
 let add=0, upd=0, skip=0, bad=0;
 incoming.forEach(c=>{ const k=(c.email||'').toLowerCase(); if(!validEmail(c.email).ok) bad++; if(k&&byEmail[k]){ if(state.importMode==='overwrite') upd++; else skip++; } else add++; });
 state.pending=incoming;
 const prev=root.querySelector('#bh-prev'); prev.classList.add('show');
 prev.innerHTML=`<b>${incoming.length}</b> ${T('rijen gelezen','rows read')}, <b>${add}</b> ${T('nieuw','new')}, <b>${upd}</b> ${state.importMode==='overwrite'?T('bijgewerkt','updated'):T('overgeslagen','skipped')+' '} ${state.importMode==='skip'?'':''}${state.importMode==='skip'&&skip?`, <b>${skip}</b> ${T('overgeslagen','skipped')}`:''}${bad?`, <span class="bh-bad"><b>${bad}</b> ${T('met foutief e-mailadres','with invalid email')}</span>`:''}.`;
 const act=root.querySelector('#bh-imp-actions');
 act.innerHTML=`<button class="btn btn-gold" id="bh-apply" data-nl="Toepassen" data-en="Apply">Toepassen</button><button class="btn btn-ghost" id="bh-cancel" data-nl="Annuleren" data-en="Cancel">Annuleren</button>`;
 act.querySelector('#bh-apply').addEventListener('click',applyImport);
 act.querySelector('#bh-cancel').addEventListener('click',()=>{ state.pending=null; render(); });
 if(window.HL_setLang) window.HL_setLang(L());
 }
 function applyImport(){
 if(!state.pending) return;
 const byEmail={}; data.customers.forEach(c=>byEmail[(c.email||'').toLowerCase()]=c);
 state.pending.forEach(inc=>{
 const k=(inc.email||'').toLowerCase();
 if(k&&byEmail[k]){
 if(state.importMode==='overwrite'){ const ex=byEmail[k];
 ex.firstName=inc.firstName||ex.firstName; ex.lastName=inc.lastName||ex.lastName;
 ex.phone=inc.phone||ex.phone; ex.phoneValid=inc.phoneValid; ex.emailValid=inc.emailValid;
 ex.lastBooking=inc.lastBooking||ex.lastBooking; ex.totalBookings=inc.totalBookings||ex.totalBookings;
 /* marketingvoorkeur behouden */ }
 } else {
 data.customers.push({ ...inc, gender:'', pending:0, source:'import', marketing:true, marketingConsent:'soft opt-in (bestaande klant)', marketingSince:new Date().toISOString().slice(0,10), issues:[] });
 byEmail[k]=data.customers[data.customers.length-1];
 }
 });
 state.pending=null; state.tab='klanten'; persist(); render();
 }

 // ---------- exports ----------
 function csvCell(s){ s=(s==null?'':String(s)); return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }
 function exportCustomersCSV(){
 const head=['Voornaam','Achternaam','E-mail','Telefoon','Laatste boeking','Totaal boekingen','Marketing','Bron'];
 const rows=data.customers.map(c=>[c.firstName,c.lastName,c.email,c.phone,c.lastBooking,c.totalBookings,c.marketing?'ja':'nee',c.source||''].map(csvCell).join(','));
 download('klanten.csv', head.join(',')+'\n'+rows.join('\n'),'text/csv');
 }
 function exportMarketingCSV(){
 const head=['Voornaam','Achternaam','E-mail','Sinds'];
 const rows=data.customers.filter(c=>c.marketing).map(c=>[c.firstName,c.lastName,c.email,c.marketingSince||''].map(csvCell).join(','));
 download('marketinglijst.csv', head.join(',')+'\n'+rows.join('\n'),'text/csv');
 }
 function download(name, content, type){
 const blob=new Blob([content],{type}); const a=document.createElement('a');
 a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),2000);
 }

 // ---------- boot ----------
 window.HL_BEHEER_INIT=function(){ root=document.getElementById('bh-app'); if(!root) return; render(); window.addEventListener('hl-lang', render); };
})();
