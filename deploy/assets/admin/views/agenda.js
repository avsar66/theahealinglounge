/* Beheer 2.0 · Agenda */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const U=window.admUtil;
  let S={view:'dag', date:new Date(U.NOW), filter:'all'};

  function hoursFor(date){ const A=window.HLA, d=A.get(); const r=(d.settings.hours[date.getDay()]||[]); if(!r.length) return null; const [o,c]=r[0]; return [toMin(o), toMin(c)]; }
  function toMin(hhmm){ const [h,m]=String(hhmm).split(':').map(Number); return h*60+(m||0); }
  function mm(min){ return String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0'); }
  function cancelled(a){ return /annul/i.test(a.status||''); }
  function staffColorByName(name){ const A=window.HLA; const s=A.get().staff.find(x=>name&&name.toLowerCase().includes(x.firstName.toLowerCase())); return s?s.color:'#7A6A57'; }

  function apptsOn(iso){ const A=window.HLA; return A.get().appointments.map(a=>({...a,_s:U.parse(a.start),_e:U.parse(a.end)})).filter(a=>a._s&&U.iso(a._s)===iso); }

  // ----- availability (incl. opruimtijd / buffer per dienst) -----
  function apMin(a){ const s=U.parse(a.start), e=U.parse(a.end); const sm=s?s.getHours()*60+s.getMinutes():0; let em=e?e.getHours()*60+e.getMinutes():sm+60; if(em<=sm)em=sm+45; return [sm,em]; }
  function minOverlap(s1,e1,s2,e2){ return s1<e2 && s2<e1; }
  function treatByService(name){ return window.HLA.get().treatments.find(x=>x.nl.name===name); }
  function bufOf(t){ return (t && t.bufferOn!==false) ? (t.buffer||15) : 0; }
  function slotsFor(t, staffName, dateISO, excludeId){
    const A=window.HLA, d=A.get(); if(!dateISO||!t) return [];
    const day=new Date(dateISO+'T00:00'); const r=(d.settings.hours[day.getDay()]||[]); if(!r.length) return [];
    const open=toMin(r[0][0]), close=toMin(r[0][1]);
    const room=A.roomById(t.roomId); const isSelf=room&&room.type==='self';
    const buf=bufOf(t); const step=isSelf?(room.slot.duration||20):15;
    const ex=d.appointments.filter(a=>a.id!==excludeId && !/annul/i.test(a.status||'') && U.iso(U.parse(a.start)||new Date(0))===dateISO);
    const blocks=(d.blocks||[]).filter(b=>b.date===dateISO);
    const sid=(A.activeStaff().find(x=>x.firstName===staffName)||{}).id;
    const out=[];
    for(let s=open; s+t.dur<=close; s+=step){ const e=s+t.dur; let ok=true;
      if(isSelf){ const cap=room.capacity||1; const cc=ex.filter(a=>{ const rt=treatByService(a.service); return rt&&rt.roomId===room.id; }).filter(a=>{ const [as,ae]=apMin(a); const ab=bufOf(treatByService(a.service)); return minOverlap(as,ae+ab,s,e+buf); }).length; if(cc>=cap) ok=false; }
      else if(staffName){ if(ex.some(a=>a.staff&&a.staff.toLowerCase().includes(staffName.toLowerCase()) && (function(){ const [as,ae]=apMin(a); const ab=bufOf(treatByService(a.service)); return minOverlap(as,ae+ab,s,e+buf); })())) ok=false; }
      if(ok && blocks.some(b=>(!b.staffId||b.staffId===sid)&&minOverlap(toMin(b.start),toMin(b.end),s,e+buf))) ok=false;
      if(ok) out.push(mm(s));
    }
    return out;
  }

  window.ADMIN_VIEWS.agenda={ render(c){
    const A=window.HLA, d=A.get();
    if(!d.blocks) d.blocks=[];
    // header
    const head=window.h('<div class="ag-head"></div>');
    const views=window.h('<div class="ag-views"></div>');
    [['dag','Dag'],['week','Week'],['maand','Maand']].forEach(v=>{ const b=window.h(`<button class="${S.view===v[0]?'on':''}">${v[1]}</button>`); b.onclick=()=>{ S.view=v[0]; window.ADMIN_VIEWS.agenda.render(c); }; views.appendChild(b); });
    head.appendChild(views);
    const nav=window.h('<div class="ag-nav"><button data-p>‹</button><button data-t>Vandaag</button><button data-n>›</button></div>');
    nav.querySelector('[data-p]').onclick=()=>{ shift(-1); window.ADMIN_VIEWS.agenda.render(c); };
    nav.querySelector('[data-n]').onclick=()=>{ shift(1); window.ADMIN_VIEWS.agenda.render(c); };
    nav.querySelector('[data-t]').onclick=()=>{ S.date=new Date(U.NOW); window.ADMIN_VIEWS.agenda.render(c); };
    nav.querySelector('[data-t]').className='btn btn-ghost btn-sm';
    head.appendChild(nav);
    head.appendChild(window.h(`<div class="ag-date">${dateLabel()}</div>`));
    head.appendChild(window.h('<div style="flex:1"></div>'));
    const addB=window.h('<button class="btn btn-gold btn-sm">+ Afspraak</button>'); addB.onclick=()=>createAppt(null); head.appendChild(addB);
    const blkB=window.h('<button class="btn btn-ghost btn-sm">Blokkade</button>'); blkB.onclick=()=>createBlock(); head.appendChild(blkB);
    c.appendChild(head);

    // filter chips (staff + self rooms)
    const chips=window.h('<div class="ag-chips" style="margin-bottom:12px"></div>');
    const opts=[['all','Alles','']].concat(A.activeStaff().map(s=>[s.id,s.firstName,s.color])).concat(d.rooms.filter(r=>r.type==='self'&&r.active).map(r=>['room:'+r.id,r.nl,r.color]));
    opts.forEach(o=>{ const b=window.h(`<button class="chip-toggle ${S.filter===o[0]?'on':''}">${o[2]?`<span class="dot-color" style="background:${o[2]}"></span>`:''}${esc(o[1])}</button>`); b.onclick=()=>{ S.filter=o[0]; window.ADMIN_VIEWS.agenda.render(c); }; chips.appendChild(b); });
    c.appendChild(chips);

    if(S.view==='dag') renderDay(c);
    else if(S.view==='week') renderWeek(c);
    else renderMonth(c);
  }};

  function shift(dir){ const dd=new Date(S.date); if(S.view==='dag') dd.setDate(dd.getDate()+dir); else if(S.view==='week') dd.setDate(dd.getDate()+7*dir); else dd.setMonth(dd.getMonth()+dir); S.date=dd; }
  function dateLabel(){ const d=S.date; if(S.view==='maand') return U.MON_NL[d.getMonth()]+' '+d.getFullYear(); if(S.view==='week'){ const mon=weekStart(d); const sun=new Date(mon); sun.setDate(sun.getDate()+6); return 'Week · '+mon.getDate()+' '+U.MON_NL[mon.getMonth()].slice(0,3)+' – '+sun.getDate()+' '+U.MON_NL[sun.getMonth()].slice(0,3); } return U.fmtDate(d); }
  function weekStart(d){ const x=new Date(d); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); x.setHours(0,0,0,0); return x; }

  /* ---------- DAY ---------- */
  function renderDay(c){
    const A=window.HLA, d=A.get();
    if(window.innerWidth<760){ return renderDayMobile(c); }
    const hrs=hoursFor(S.date);
    if(!hrs){ c.appendChild(window.h('<div class="adm-card ag-closed">Gesloten op deze dag.</div>')); return; }
    const [open,close]=hrs; const span=close-open; const PXH=72;
    let cols=A.activeStaff().map(s=>({type:'staff',id:s.id,label:s.firstName,color:s.color,match:n=>n&&n.toLowerCase().includes(s.firstName.toLowerCase())}));
    d.rooms.filter(r=>r.type==='self'&&r.active).forEach(r=>cols.push({type:'room',id:r.id,label:r.nl,color:r.color,match:()=>false}));
    if(S.filter!=='all') cols=cols.filter(co=> (S.filter==='room:'+co.id)|| co.id===S.filter );
    if(!cols.length) cols=A.activeStaff().map(s=>({type:'staff',id:s.id,label:s.firstName,color:s.color,match:n=>n&&n.toLowerCase().includes(s.firstName.toLowerCase())}));

    const wrap=window.h('<div class="ag-day"></div>');
    const axis=window.h('<div class="ag-axis"><div class="ag-colhead">&nbsp;</div></div>');
    for(let m=open;m<close;m+=60) axis.appendChild(window.h(`<div class="h">${mm(m)}</div>`));
    wrap.appendChild(axis);
    const colsWrap=window.h(`<div class="ag-cols" style="grid-template-columns:repeat(${cols.length},1fr)"></div>`);
    const iso=U.iso(S.date); const appts=apptsOn(iso);
    cols.forEach(co=>{
      const col=window.h(`<div class="ag-col"></div>`);
      col.appendChild(window.h(`<div class="ag-colhead">${co.color?`<span class="dot-color" style="background:${co.color}"></span>`:''}${esc(co.label)}</div>`));
      const bg=window.h('<div class="ag-grid-bg"></div>'); for(let m=open;m<close;m+=60) bg.appendChild(window.h('<div class="ag-hour"></div>')); col.appendChild(bg);
      // click to create
      col.onclick=(e)=>{ if(e.target.closest('.ag-appt'))return; const rect=bg.getBoundingClientRect(); const y=e.clientY-rect.top; let min=open+Math.floor(y/PXH*60/15)*15; if(min<open)min=open; createAppt({date:iso, time:mm(min), staffId:co.type==='staff'?co.id:null, roomId:co.type==='room'?co.id:null}); };
      // appointments
      appts.filter(a=>!cancelled(a)?true:true).forEach(a=>{
        const inCol = co.type==='staff'? co.match(a.staff) : false;
        if(!inCol) return;
        placeAppt(col,a,open,PXH,co.color);
      });
      // blocks
      (d.blocks||[]).filter(b=>b.date===iso && (!b.staffId||b.staffId===co.id)).forEach(b=>{
        const top=(toMin(b.start)-open)/60*PXH+40; const h=(toMin(b.end)-toMin(b.start))/60*PXH;
        col.appendChild(window.h(`<div class="ag-block" style="top:${top}px;height:${Math.max(h,18)}px">${esc(b.reason||'Blokkade')}<br>${b.start}–${b.end}</div>`));
      });
      colsWrap.appendChild(col);
    });
    wrap.appendChild(colsWrap); c.appendChild(wrap);
    c.appendChild(window.h(`<div class="ag-legend"><span>Klik op een leeg vlak voor een nieuwe afspraak.</span></div>`));
  }
  function placeAppt(col,a,open,PXH,fallback){
    const sMin=a._s.getHours()*60+a._s.getMinutes();
    let eMin=a._e?(a._e.getHours()*60+a._e.getMinutes()):sMin+60; if(eMin<=sMin) eMin=sMin+45;
    const top=(sMin-open)/60*PXH+40; const h=Math.max((eMin-sMin)/60*PXH-3,26);
    const col2=staffColorByName(a.staff)||fallback;
    const mini=h<48;
    const card=window.h(`<div class="ag-appt ${cancelled(a)?'cancel':''} ${mini?'mini':''}" title="${esc(a.customerName)} · ${esc(a.service)} · ${U.fmtTime(a._s)}" style="top:${top}px;height:${h}px;background:${col2}">${mini?`<span class="one">${U.fmtTime(a._s)} ${esc(a.customerName)}</span>`:`<b>${esc(a.customerName)}</b><span class="t">${U.fmtTime(a._s)} · ${esc(a.service)}</span>`}</div>`);
    card.onclick=(e)=>{ e.stopPropagation(); detail(a); };
    col.appendChild(card);
  }
  function renderDayMobile(c){
    const A=window.HLA, d=A.get(); const iso=U.iso(S.date);
    let list=apptsOn(iso).sort((a,b)=>a._s-b._s);
    if(S.filter!=='all'&&!S.filter.startsWith('room:')){ const sName=(A.staffById(S.filter)||{}).firstName; list=list.filter(a=>a.staff&&sName&&a.staff.toLowerCase().includes(sName.toLowerCase())); }
    if(!list.length){ c.appendChild(window.h('<div class="empty"><span class="ic">☾</span>Geen afspraken op deze dag.</div>')); return; }
    const wrap=window.h('<div style="display:flex;flex-direction:column;gap:10px"></div>');
    list.forEach(a=>{ const col=staffColorByName(a.staff); const card=window.h(`<div class="adm-card" style="border-left:4px solid ${col};padding:13px 15px;${cancelled(a)?'opacity:.6':''}"><div style="display:flex;gap:12px;align-items:flex-start"><b class="mono" style="font-size:15px;min-width:46px">${U.fmtTime(a._s)}</b><div style="flex:1;min-width:0"><b style="font-size:15px;${cancelled(a)?'text-decoration:line-through':''}">${esc(a.customerName)}</b><div class="muted" style="font-size:13px">${esc(a.service)}</div><div class="faint" style="font-size:12px">${esc(a.staff||'')}</div></div></div></div>`); card.onclick=()=>detail(a); wrap.appendChild(card); });
    c.appendChild(wrap);
  }

  /* ---------- WEEK ---------- */
  function renderWeek(c){
    const mon=weekStart(S.date); const wrap=window.h('<div class="ag-week"></div>');
    const names=['ma','di','wo','do','vr','za','zo'];
    for(let i=0;i<7;i++){ const day=new Date(mon); day.setDate(day.getDate()+i); const iso=U.iso(day); const isToday=iso===U.iso(U.NOW);
      const col=window.h(`<div class="ag-wday ${isToday?'today':''}"><h4>${names[i]} ${day.getDate()}</h4></div>`);
      let list=apptsOn(iso).filter(a=>!cancelled(a)).sort((a,b)=>a._s-b._s);
      if(S.filter!=='all'&&!S.filter.startsWith('room:')){ const sName=(window.HLA.staffById(S.filter)||{}).firstName; list=list.filter(a=>a.staff&&sName&&a.staff.toLowerCase().includes(sName.toLowerCase())); }
      list.slice(0,6).forEach(a=>{ const b=window.h(`<div class="ag-wappt" style="background:${staffColorByName(a.staff)}">${U.fmtTime(a._s)} ${esc(a.service)}</div>`); b.onclick=()=>detail(a); col.appendChild(b); });
      if(list.length>6) col.appendChild(window.h(`<div class="ag-wmore">+${list.length-6} meer</div>`));
      if(!list.length) col.appendChild(window.h('<div class="ag-wmore faint">—</div>'));
      const day2=new Date(day); col.querySelector('h4').style.cursor='pointer'; col.querySelector('h4').onclick=()=>{ S.view='dag'; S.date=day2; window.ADMIN_VIEWS.agenda.render(document.getElementById('adm-content')); };
      wrap.appendChild(col);
    }
    c.appendChild(wrap);
  }

  /* ---------- MONTH ---------- */
  function renderMonth(c){
    const A=window.HLA; const first=new Date(S.date.getFullYear(),S.date.getMonth(),1);
    const head=window.h('<div class="ag-month"></div>');
    ['ma','di','wo','do','vr','za','zo'].forEach(n=>head.appendChild(window.h(`<div class="ag-mhead">${n}</div>`)));
    const startPad=(first.getDay()+6)%7; const dim=new Date(S.date.getFullYear(),S.date.getMonth()+1,0).getDate();
    for(let i=0;i<startPad;i++) head.appendChild(window.h('<div></div>'));
    for(let dd=1;dd<=dim;dd++){ const day=new Date(S.date.getFullYear(),S.date.getMonth(),dd); const iso=U.iso(day); const list=apptsOn(iso).filter(a=>!cancelled(a)); const isToday=iso===U.iso(U.NOW);
      const cell=window.h(`<div class="ag-mcell ${isToday?'today':''}"><div class="d">${dd}</div></div>`);
      if(list.length){ const dots=window.h('<div class="ag-mdots"></div>'); list.slice(0,6).forEach(a=>dots.appendChild(window.h(`<i style="background:${staffColorByName(a.staff)}"></i>`))); cell.appendChild(dots); cell.appendChild(window.h(`<div class="ag-mcount">${list.length} afspr.</div>`)); }
      cell.onclick=()=>{ S.view='dag'; S.date=day; window.ADMIN_VIEWS.agenda.render(document.getElementById('adm-content')); };
      head.appendChild(cell);
    }
    c.appendChild(head);
  }

  /* ---------- DETAIL ---------- */
  function detail(a){
    const A=window.HLA;
    const body=window.h(`<div>
      <div class="adm-card" style="margin-bottom:14px;border-left:4px solid ${staffColorByName(a.staff)}"><b style="font-size:18px">${esc(a.service)}</b><div class="muted">${esc(a.start)} → ${esc(a.end||'')}</div></div>
      <div class="adm-field"><label>Klant</label><div>${esc(a.customerName)}</div></div>
      <div class="field-row"><div class="adm-field"><label>E-mail</label><div class="mono" style="font-size:13px">${esc(a.email||'—')}</div></div><div class="adm-field"><label>Telefoon</label><div class="mono" style="font-size:13px">${esc(a.phone||'—')}</div></div></div>
      <div class="field-row"><div class="adm-field"><label>Medewerker</label><div>${esc(a.staff||'—')}</div></div><div class="adm-field"><label>Prijs</label><div>${esc(a.price||'—')}</div></div></div>
      <div class="adm-field"><label>Status</label><div><span class="badge ${cancelled(a)?'warn':'ok'}">${esc(a.status)}</span></div></div>
    </div>`);
    const acts=window.h('<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"></div>');
    const call=window.h(`<a class="btn btn-ghost btn-sm" href="tel:${esc((a.phone||'').replace(/\s/g,''))}">Bellen</a>`);
    const mail=window.h(`<a class="btn btn-ghost btn-sm" href="mailto:${esc(a.email||'')}">Mailen</a>`);
    acts.appendChild(call); acts.appendChild(mail);
    const reb=window.h('<button class="btn btn-ghost btn-sm">Bevestiging opnieuw</button>'); reb.onclick=()=>window.HLA_UI.toast('Bevestigingsmail opnieuw verstuurd (vereist e-mailkoppeling).'); acts.appendChild(reb);
    body.appendChild(acts);

    const annul=window.h('<button class="btn btn-ghost" style="margin-right:auto;color:var(--rood)">Annuleren</button>');
    annul.onclick=()=>window.HLA_UI.confirm('Deze afspraak annuleren? De klant krijgt (in productie) een annuleringsmail.',()=>{ setStatus(a,'Geannuleerd'); window.admCloseOverlay(); },'Annuleren');
    const noshow=window.h('<button class="btn btn-ghost btn-sm">No-show</button>'); noshow.onclick=()=>{ setStatus(a,'No-show'); window.admCloseOverlay(); };
    const edit=window.h('<button class="btn btn-gold">Wijzigen</button>'); edit.onclick=()=>{ window.admCloseOverlay(); createAppt(null, a); };
    const close=window.h('<button class="btn btn-ghost">Sluiten</button>'); close.onclick=window.admCloseOverlay;
    window.HLA_UI.drawer('Afspraak', body, window.HLA_UI.foot([annul,noshow,close,edit]));
  }
  function setStatus(a,status){ const A=window.HLA, d=A.get(); const ap=d.appointments.find(x=>x.id===a.id); if(ap){ ap.status=status; A.log('booking',status+': '+ap.customerName+' ('+ap.service+')'); A.save(); window.HLA_UI.toast(status); } }

  /* ---------- CREATE ---------- */
  function createAppt(prefill, editing){
    const A=window.HLA, d=A.get(); prefill=prefill||{};
    const bookable=d.treatments.filter(t=>A.isBookable(t));
    const body=window.h('<div></div>');
    body.appendChild(window.h(`<div class="adm-field"><label>Behandeling</label><select id="na-treat">${bookable.map(t=>`<option value="${t.id}">${esc(t.nl.name)} · ${t.dur}m · €${t.price}</option>`).join('')}</select></div>`));
    const staffWrap=window.h('<div class="adm-field"><label>Medewerker</label><select id="na-staff"></select></div>');
    body.appendChild(staffWrap);
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>Datum</label><input id="na-date" type="date" min="${U.iso(U.NOW)}" value="${prefill.date||U.iso(S.date)}"></div><div class="adm-field"><label>Beschikbare tijd</label><select id="na-time"></select></div></div>`));
    body.appendChild(window.h('<p class="faint" style="font-size:12px;margin:-6px 0 8px">Alleen vrije tijden worden getoond, op basis van duur, opruimtijd, agenda en blokkades.</p>'));
    // customer
    body.appendChild(window.h('<div class="adm-section-title">Klant</div>'));
    const cust=window.h(`<div class="adm-field"><input id="na-cust" placeholder="Zoek bestaande klant of typ een nieuwe naam…" autocomplete="off"></div>`);
    const results=window.h('<div style="max-height:150px;overflow:auto;margin-top:-8px"></div>');
    body.appendChild(cust); body.appendChild(results);
    const extra=window.h(`<div class="field-row"><div class="adm-field"><label>E-mail (nieuw)</label><input id="na-mail"></div><div class="adm-field"><label>Telefoon (nieuw)</label><input id="na-tel"></div></div>`);
    body.appendChild(extra);
    let chosen=null;
    function refTreat(){ const t=A.treatmentById(body.querySelector('#na-treat').value); const sList=A.staffForTreatment(t.id); const room=A.roomById(t.roomId); const sel=staffWrap.querySelector('#na-staff'); if(room&&room.type==='self'){ sel.innerHTML='<option value="">Zelfboekbaar (geen medewerker)</option>'; sel.disabled=true; } else { sel.disabled=false; sel.innerHTML=sList.map(s=>`<option value="${s.firstName}">${esc(s.firstName)}</option>`).join('')||'<option value="">—</option>'; if(prefill.staffId){ const ps=A.staffById(prefill.staffId); if(ps) sel.value=ps.firstName; } } }
    function refSlots(){ const t=A.treatmentById(body.querySelector('#na-treat').value); const staff=staffWrap.querySelector('#na-staff').value; const date=body.querySelector('#na-date').value; const sel=body.querySelector('#na-time'); const slots=slotsFor(t,staff,date,editing?editing.id:null); sel.innerHTML = slots.length? slots.map(x=>`<option>${x}</option>`).join('') : '<option value="">Geen vrije tijden, kies een andere dag</option>'; if(prefill.time&&slots.includes(prefill.time)) sel.value=prefill.time; if(editing){ const et=U.fmtTime(U.parse(editing.start)); if(et){ if(!slots.includes(et)) sel.insertAdjacentHTML('afterbegin',`<option>${et}</option>`); sel.value=et; } } }
    body.querySelector('#na-treat').onchange=()=>{ refTreat(); refSlots(); };
    body.querySelector('#na-date').onchange=refSlots;
    staffWrap.querySelector('#na-staff').onchange=refSlots;
    if(editing){ const t=d.treatments.find(x=>x.nl.name===editing.service)||bookable[0]; if(t) body.querySelector('#na-treat').value=t.id; }
    refTreat(); refSlots();
    if(editing){ cust.querySelector('input').value=editing.customerName; chosen={name:editing.customerName,email:editing.email,phone:editing.phone}; staffWrap.querySelector('#na-staff').value=editing.staff||''; refSlots(); }
    cust.querySelector('input').oninput=(e)=>{ const q=e.target.value.toLowerCase(); chosen=null; results.innerHTML=''; if(q.length<2) return; d.customers.filter(c=>((c.firstName+' '+c.lastName+' '+c.email).toLowerCase().includes(q))).slice(0,6).forEach(c=>{ const r=window.h(`<div class="svc-item" style="cursor:pointer"><span class="nm">${esc((c.firstName+' '+c.lastName).trim())}</span><span class="faint mono" style="font-size:11px">${esc(c.email)}</span></div>`); r.onclick=()=>{ chosen={name:(c.firstName+' '+c.lastName).trim(),email:c.email,phone:c.phone}; cust.querySelector('input').value=chosen.name; results.innerHTML=''; }; results.appendChild(r); }); };

    const save=window.h('<button class="btn btn-gold">Afspraak opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    save.onclick=()=>{
      const t=A.treatmentById(body.querySelector('#na-treat').value);
      const staff=staffWrap.querySelector('#na-staff').value;
      const date=body.querySelector('#na-date').value, time=body.querySelector('#na-time').value;
      let name=cust.querySelector('input').value.trim(); if(!name){ window.HLA_UI.toast('Kies of typ een klant.'); return; }
      if(!time){ window.HLA_UI.toast('Kies een beschikbare tijd.'); return; }
      const email=(chosen&&chosen.email)||body.querySelector('#na-mail').value.trim();
      const phone=(chosen&&chosen.phone)||body.querySelector('#na-tel').value.trim();
      const sMin=toMin(time), eMin=sMin+t.dur;
      const dObj=new Date(date+'T00:00'); const startStr=dObj.getDate()+' '+U.MON_NL[dObj.getMonth()].replace(/^./,x=>x.toUpperCase())+' '+dObj.getFullYear()+' '+time;
      const endStr=dObj.getDate()+' '+U.MON_NL[dObj.getMonth()].replace(/^./,x=>x.toUpperCase())+' '+dObj.getFullYear()+' '+mm(eMin);
      // conflict check
      const clash=A.get().appointments.find(x=>!cancelled(x)&&x.staff===staff&&staff&&U.iso(U.parse(x.start))===date && overlaps(U.parse(x.start),U.parse(x.end),sMin,eMin));
      function commit(){ const dd=A.get();
        if(editing){ const ap=dd.appointments.find(x=>x.id===editing.id); Object.assign(ap,{service:t.nl.name,staff,start:startStr,end:endStr,price:'€'+t.price.toFixed?t.price:('€'+t.price),customerName:name,email,phone}); A.log('booking','Afspraak gewijzigd: '+name); }
        else { dd.appointments.push({id:A.uid('a'),customerName:name,email,phone,emailValid:true,phoneValid:!!phone,staff,service:t.nl.name,start:startStr,end:endStr,duration:t.dur+'min',price:'€'+t.price,paymentStatus:'In afwachting',method:'Ter plekke',status:'Goedgekeurd',createdAt:U.iso(U.NOW)}); A.log('booking','Nieuwe afspraak: '+name+' ('+t.nl.name+')'); }
        A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Afspraak opgeslagen'); }
      if(clash){ window.HLA_UI.confirm('Let op: '+staff+' heeft op dit tijdstip al een afspraak. Toch opslaan?', commit, 'Toch opslaan'); } else commit();
    };
    window.HLA_UI.drawer(editing?'Afspraak wijzigen':'Nieuwe afspraak', body, window.HLA_UI.foot([cancel,save]));
  }
  function overlaps(s1,e1,s2,e2){ if(!s1)return false; const a1=s1.getHours()*60+s1.getMinutes(), b1=e1?e1.getHours()*60+e1.getMinutes():a1+60; return a1<e2 && s2<b1; }

  /* ---------- BLOCK ---------- */
  function createBlock(){
    const A=window.HLA, d=A.get(); if(!d.blocks) d.blocks=[];
    const body=window.h(`<div>
      <div class="adm-field"><label>Reden</label><select id="bl-reason"><option>Pauze</option><option>Vakantie</option><option>Onderhoud</option><option>Privé</option></select></div>
      <div class="adm-field"><label>Medewerker (optioneel)</label><select id="bl-staff"><option value="">Hele salon</option>${A.activeStaff().map(s=>`<option value="${s.id}">${esc(s.firstName)}</option>`).join('')}</select></div>
      <div class="field-row"><div class="adm-field"><label>Datum</label><input id="bl-date" type="date" value="${U.iso(S.date)}"></div></div>
      <div class="field-row"><div class="adm-field"><label>Van</label><input id="bl-from" type="time" value="12:00"></div><div class="adm-field"><label>Tot</label><input id="bl-to" type="time" value="13:00"></div></div>
    </div>`);
    const save=window.h('<button class="btn btn-gold">Blokkade opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    save.onclick=()=>{ const dd=A.get(); dd.blocks.push({id:A.uid('b'),reason:body.querySelector('#bl-reason').value,staffId:body.querySelector('#bl-staff').value||null,date:body.querySelector('#bl-date').value,start:body.querySelector('#bl-from').value,end:body.querySelector('#bl-to').value}); A.log('block','Blokkade toegevoegd.'); A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Blokkade opgeslagen'); };
    window.HLA_UI.drawer('Tijd blokkeren', body, window.HLA_UI.foot([cancel,save]));
  }
})();
