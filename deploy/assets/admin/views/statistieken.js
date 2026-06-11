/* Beheer 2.0 · Statistieken */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const U=window.admUtil;
  let period='maand';

  function bars(items, color){ const max=Math.max(1,...items.map(i=>i.v)); const w=window.h('<div style="display:flex;flex-direction:column;gap:10px;margin-top:14px"></div>');
    items.forEach(i=>{ w.appendChild(window.h(`<div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${esc(i.l)}</span><b>${esc(i.d||i.v)}</b></div><div style="height:9px;background:var(--adm-line);border-radius:999px;overflow:hidden"><i style="display:block;height:100%;width:${Math.round(i.v/max*100)}%;background:${i.c||color||'var(--honey)'}"></i></div></div>`)); });
    return w; }

  window.ADMIN_VIEWS.statistieken={ render(c){
    const A=window.HLA, d=A.get();
    const bar=window.h('<div class="adm-toolbar"></div>');
    [['week','Week'],['maand','Maand'],['kwartaal','Kwartaal'],['jaar','Jaar']].forEach(p=>{ const b=window.h(`<button class="chip-toggle ${period===p[0]?'on':''}">${p[1]}</button>`); b.onclick=()=>{ period=p[0]; window.ADMIN_VIEWS.statistieken.render(c); }; bar.appendChild(b); });
    c.appendChild(bar);

    const appts=d.appointments.filter(a=>!/annul/i.test(a.status||''));
    const noshow=d.appointments.filter(a=>/no-?show/i.test(a.status||'')).length;
    const revenue=appts.reduce((s,a)=>s+U.priceNum(a.price),0);
    // top
    c.appendChild(window.h(`<div class="adm-cards cols-4" style="margin:6px 0 16px">
      <div class="adm-card stat"><div class="n">${appts.length}</div><div class="l">Afspraken</div></div>
      <div class="adm-card stat"><div class="n">${U.eur(revenue).replace(' ','')}</div><div class="l">Omzetindicatie</div></div>
      <div class="adm-card stat"><div class="n">${d.customers.length}</div><div class="l">Klanten</div></div>
      <div class="adm-card stat ${noshow?'warn':''}"><div class="n">${appts.length?Math.round(noshow/(appts.length+noshow)*100):0}%</div><div class="l">No-show</div></div>
    </div>`));

    const grid=window.h('<div class="adm-cards cols-2"></div>');

    // bookings per staff
    const perStaff=A.activeStaff().map(s=>({l:s.firstName, v:appts.filter(a=>a.staff&&a.staff.toLowerCase().includes(s.firstName.toLowerCase())).length, c:s.color}));
    const c1=window.h('<div class="adm-card"><h3>Afspraken per medewerker</h3></div>'); c1.appendChild(bars(perStaff)); grid.appendChild(c1);

    // popular treatments
    const counts={}; appts.forEach(a=>{ counts[a.service]=(counts[a.service]||0)+1; });
    const top=Object.entries(counts).map(([l,v])=>({l,v})).sort((a,b)=>b.v-a.v).slice(0,5);
    const c2=window.h('<div class="adm-card"><h3>Populairste behandelingen</h3></div>'); c2.appendChild(bars(top)); grid.appendChild(c2);

    // occupancy per room
    const perRoom=d.rooms.map(r=>{ const treatNames=d.treatments.filter(t=>t.roomId===r.id).map(t=>t.nl.name.toLowerCase()); const v=appts.filter(a=>treatNames.some(n=>a.service.toLowerCase().includes(n.split(' ')[0]))).length; return {l:r.nl, v, c:r.color}; });
    const c3=window.h('<div class="adm-card"><h3>Bezetting per ruimte</h3></div>'); c3.appendChild(bars(perRoom)); grid.appendChild(c3);

    // new vs returning
    const ret=d.customers.filter(c=>c.totalBookings>1).length, nw=d.customers.filter(c=>c.totalBookings<=1).length;
    const c4=window.h('<div class="adm-card"><h3>Nieuw vs. terugkerend</h3></div>'); c4.appendChild(bars([{l:'Terugkerend',v:ret,c:'var(--green-soft)'},{l:'Nieuw / eenmalig',v:nw,c:'var(--honey)'}])); grid.appendChild(c4);

    // quiz conversion (indicative)
    const c5=window.h('<div class="adm-card"><h3>Quiz-conversie <span class="faint" style="font-size:11px;font-weight:400">· indicatief</span></h3></div>'); c5.appendChild(bars([{l:'Gestart',v:240},{l:'Resultaat bekeken',v:188},{l:'Doorgeklikt naar boeken',v:96},{l:'Geboekt',v:41}])); grid.appendChild(c5);

    // marketing
    const subs=d.customers.filter(c=>c.marketing&&!c.blocked).length; const last=(d.campaigns&&d.campaigns[0]);
    const c6=window.h('<div class="adm-card"><h3>Marketing</h3></div>');
    c6.appendChild(bars([{l:'Abonnees',v:subs}, last?{l:'Laatste campagne geopend',v:last.opened,d:last.opened+' / '+last.sent}:{l:'Nog geen campagne',v:0}]));
    grid.appendChild(c6);

    c.appendChild(grid);
    const exp=window.h('<button class="btn btn-ghost btn-sm" style="margin-top:16px">Exporteer cijfers (CSV)</button>'); exp.onclick=()=>window.HLA_UI.toast('Export gestart.'); c.appendChild(exp);
    c.appendChild(window.h('<p class="faint" style="font-size:12px;margin-top:10px">Cijfers zijn gebaseerd op de huidige dataset. Met de live koppeling lopen ze realtime mee per gekozen periode.</p>'));
  }};
})();
