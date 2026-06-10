/* Beheer 2.0 · Dashboard */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const U=window.admUtil;
  window.ADMIN_VIEWS.dashboard={ render(c){
    const A=window.HLA, d=A.get(), now=U.NOW;
    const appts=d.appointments.map(a=>({...a, _d:U.parse(a.start)})).filter(a=>a._d);
    const cancelled=a=>/annul/i.test(a.status||'');
    const today=appts.filter(a=>a._d&&U.iso(a._d)===U.iso(now)&&!cancelled(a)).sort((a,b)=>a._d-b._d);
    const upcoming=appts.filter(a=>a._d>=now&&!cancelled(a)).sort((a,b)=>a._d-b._d);
    const next=upcoming[0];
    const revenue=today.reduce((s,a)=>s+U.priceNum(a.price),0);

    // attention points
    const att=[];
    d.customers.filter(c=>!c.emailValid).forEach(c=>att.push({t:'E-mail klopt niet: '+(c.firstName+' '+c.lastName).trim(), r:'klanten'}));
    const noPhone=d.customers.filter(c=>!c.phoneValid).length; if(noPhone) att.push({t:noPhone+' klanten zonder geldig telefoonnummer', r:'klanten'});
    d.treatments.filter(t=>t.active&&!A.isBookable(t)).forEach(t=>att.push({t:'Onboekbaar (geen medewerker): '+t.nl.name, r:'behandelingen'}));
    appts.filter(a=>!cancelled(a)&&/cupping|bindweefsel/i.test(a.service)&&a._d>=now).slice(0,0); // signature check placeholder

    const next_in = next ? Math.round((next._d-now)/60000) : null;
    const nextTxt = next ? (next_in>120? Math.round(next_in/60)+' uur' : next_in+' min') : '—';

    c.appendChild(window.h(`<div class="adm-cards cols-4" style="margin-bottom:16px">
      <div class="adm-card stat"><div class="n">${today.length}</div><div class="l">Afspraken vandaag</div></div>
      <div class="adm-card stat"><div class="n">${U.eur(revenue).replace(' ','')}</div><div class="l">Omzetindicatie vandaag</div></div>
      <div class="adm-card stat"><div class="n">${nextTxt}</div><div class="l">${next?'Tot volgende afspraak':'Geen afspraken meer'}</div></div>
      <div class="adm-card stat ${att.length?'warn':''}"><div class="n">${att.length}</div><div class="l">Aandachtspunten</div></div>
    </div>`));

    const grid=window.h('<div class="adm-cards cols-2"></div>');
    // mini agenda
    const tl=window.h(`<div class="adm-card"><h3>Vandaag · ${U.fmtDate(now)}</h3><div class="sub" style="margin-bottom:14px">${today.length} afspraken</div></div>`);
    if(today.length){ today.forEach(a=>{ const st=A.staffForTreatment&&null; tl.appendChild(window.h(`<div style="display:flex;gap:14px;padding:10px 0;border-top:1px solid var(--adm-line)"><b class="mono" style="width:48px">${U.fmtTime(a._d)}</b><div style="flex:1"><b>${esc(a.service)}</b><div class="muted" style="font-size:13px">${esc(a.customerName)} · ${esc(a.staff||'')}</div></div></div>`)); }); }
    else tl.appendChild(window.h('<div class="empty" style="padding:24px"><span class="ic">☾</span>Geen afspraken vandaag.</div>'));
    const ta=window.h('<a class="btn btn-ghost btn-sm" href="#/agenda" style="margin-top:14px">Naar agenda →</a>'); tl.appendChild(ta);
    grid.appendChild(tl);

    // attention card
    const ac=window.h(`<div class="adm-card"><h3>Aandachtspunten</h3><div class="sub" style="margin-bottom:14px">Wat aandacht vraagt</div></div>`);
    if(att.length){ att.slice(0,7).forEach(x=>ac.appendChild(window.h(`<a href="#/${x.r}" style="display:flex;gap:10px;padding:10px 0;border-top:1px solid var(--adm-line);font-size:14px;color:var(--ink)"><span class="bad">●</span><span>${esc(x.t)}</span></a>`))); }
    else ac.appendChild(window.h('<div class="empty" style="padding:24px"><span class="ic">✓</span>Alles op orde.</div>'));
    grid.appendChild(ac);
    c.appendChild(grid);

    // quick actions
    c.appendChild(window.h('<div class="adm-section-title">Snelacties</div>'));
    const qa=window.h('<div class="adm-cards cols-4"></div>');
    [['Nieuwe afspraak','agenda'],['Nieuwe klant','klanten'],['Campagne starten','marketing'],['Behandelingen','behandelingen']].forEach(q=>{
      const b=window.h(`<a class="adm-card" href="#/${q[1]}" style="text-align:center;font-weight:600">${q[0]}</a>`); qa.appendChild(b);
    });
    c.appendChild(qa);

    // recent activity
    c.appendChild(window.h('<div class="adm-section-title">Recente activiteit</div>'));
    const rec=window.h('<div class="adm-card"></div>');
    d.log.slice(0,6).forEach(l=>rec.appendChild(window.h(`<div style="display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--adm-line);font-size:13.5px"><span class="faint mono" style="width:120px">${new Date(l.ts).toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span><span>${esc(l.msg)}</span><span class="faint" style="margin-left:auto">${esc(l.user)}</span></div>`)));
    c.appendChild(rec);
  }};
})();
