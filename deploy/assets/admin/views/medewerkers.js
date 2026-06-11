/* Beheer 2.0 · Medewerkers */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const PALETTE=['#BC813A','#5C6B4E','#B0543F','#3A6FB0','#D7B877','#52371F','#7A6A57'];
  const DAYS=[['1','ma'],['2','di'],['3','wo'],['4','do'],['5','vr'],['6','za'],['0','zo']];

  function statusBadge(s){ return s==='active'?'<span class="badge ok">Actief</span>':s==='inactive'?'<span class="badge neutral">Inactief</span>':'<span class="badge warn">Uit dienst</span>'; }

  window.ADMIN_VIEWS.medewerkers={ render(c){
    const A=window.HLA, d=A.get();
    const bar=window.h('<div class="adm-toolbar"></div>');
    bar.appendChild(window.h('<div style="flex:1"></div>'));
    const add=window.h('<button class="btn btn-gold btn-sm">+ Nieuwe medewerker</button>');
    add.onclick=()=>edit(null); bar.appendChild(add); c.appendChild(bar);

    const grid=window.h('<div class="adm-cards cols-3"></div>');
    d.staff.forEach(s=>{
      const svcCount=Object.values(s.services).filter(x=>x.enabled).length;
      const card=window.h(`<div class="adm-card" style="cursor:pointer">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">
          <span class="av" style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;font-size:17px;background:${s.color}">${esc(s.firstName[0])}</span>
          <div style="flex:1"><b style="font-size:17px">${esc(s.firstName)} ${esc(s.lastName||'')}</b><div class="muted" style="font-size:13px">${esc(s.role==='owner'?'Eigenaar':(s.titleNl||'Behandelaar'))}</div></div>
          <span class="dot-color" style="background:${s.color}" title="Agendakleur"></span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px" class="muted">
          <span>${svcCount} behandelingen</span>${statusBadge(s.status)}
        </div>
      </div>`);
      card.onclick=()=>edit(s.id); grid.appendChild(card);
    });
    c.appendChild(grid);
  }};

  function edit(id){
    const A=window.HLA, d=A.get();
    const isNew=!id;
    const s=isNew?{id:A.uid('s'),firstName:'',lastName:'',titleNl:'Behandelaar',titleEn:'Therapist',bioNl:'',bioEn:'',email:'',phone:'',color:'#5C6B4E',role:'staff',status:'active',services:{},schedule:{weekly:{1:[],2:[],3:[],4:[],5:[],6:[],0:[]},exceptions:[],holidays:[]}}:JSON.parse(JSON.stringify(A.staffById(id)));
    d.treatments.forEach(t=>{ if(!s.services[t.id]) s.services[t.id]={enabled:false,durationOverride:null}; });

    const body=window.h('<div></div>');
    body.appendChild(window.h(`<div class="field-row">
      <div class="adm-field"><label>Voornaam</label><input id="f-vn" value="${esc(s.firstName)}"></div>
      <div class="adm-field"><label>Achternaam</label><input id="f-an" value="${esc(s.lastName||'')}"></div>
    </div>`));
    body.appendChild(window.h(`<div class="field-row">
      <div class="adm-field"><label>Functietitel (NL)</label><input id="f-tnl" value="${esc(s.titleNl||'')}"></div>
      <div class="adm-field"><label>Functietitel (EN)</label><input id="f-ten" value="${esc(s.titleEn||'')}"></div>
    </div>`));
    body.appendChild(window.h(`<div class="field-row">
      <div class="adm-field"><label>E-mail</label><input id="f-mail" value="${esc(s.email||'')}"></div>
      <div class="adm-field"><label>Telefoon</label><input id="f-tel" value="${esc(s.phone||'')}"></div>
    </div>`));
    body.appendChild(window.h(`<div class="bilingual"><div class="adm-field"><label>Bio (NL) · zichtbaar in boekingsflow</label><textarea id="f-bnl" rows="2">${esc(s.bioNl||'')}</textarea></div><div class="adm-field"><label>Bio (EN)</label><textarea id="f-ben" rows="2">${esc(s.bioEn||'')}</textarea></div></div>`));

    // color + role
    const cr=window.h('<div class="field-row"></div>');
    const colWrap=window.h('<div class="adm-field"><label>Agendakleur</label></div>');
    const swatches=window.h('<div style="display:flex;gap:8px;flex-wrap:wrap"></div>');
    PALETTE.forEach(col=>{ const b=window.h(`<button type="button" title="${col}" style="width:30px;height:30px;border-radius:50%;background:${col};border:2px solid ${col===s.color?'var(--ink)':'transparent'}"></button>`); b.onclick=()=>{ s.color=col; swatches.querySelectorAll('button').forEach(x=>x.style.border='2px solid transparent'); b.style.border='2px solid var(--ink)'; }; swatches.appendChild(b); });
    colWrap.appendChild(swatches); cr.appendChild(colWrap);
    cr.appendChild(window.h(`<div class="adm-field"><label>Rol</label><select id="f-role"><option value="staff"${s.role==='staff'?' selected':''}>Medewerker</option><option value="owner"${s.role==='owner'?' selected':''}>Eigenaar</option></select></div>`));
    body.appendChild(cr);

    // status
    body.appendChild(window.h(`<div class="adm-field"><label>Status</label><select id="f-status"><option value="active"${s.status==='active'?' selected':''}>Actief (boekbaar)</option><option value="inactive"${s.status==='inactive'?' selected':''}>Inactief (tijdelijk niet boekbaar)</option><option value="left"${s.status==='left'?' selected':''}>Uit dienst</option></select></div>`));

    // services coupling
    body.appendChild(window.h('<div class="adm-section-title">Behandelingen die deze medewerker doet</div>'));
    const svc=window.h('<div class="svc-pick"></div>');
    d.categories.sort((a,b)=>a.order-b.order).forEach(cat=>{
      const treats=d.treatments.filter(t=>t.cat===cat.id);
      if(!treats.length) return;
      const head=window.h(`<div class="svc-cat"><span>${esc(cat.nl)}</span><button type="button">alles aan/uit</button></div>`);
      head.querySelector('button').onclick=()=>{ const allOn=treats.every(t=>s.services[t.id].enabled); treats.forEach(t=>{ s.services[t.id].enabled=!allOn; const cb=svc.querySelector(`[data-svc="${t.id}"] input[type=checkbox]`); if(cb)cb.checked=!allOn; }); };
      svc.appendChild(head);
      treats.forEach(t=>{
        const row=window.h(`<div class="svc-item" data-svc="${t.id}"><label class="sw"><input type="checkbox" ${s.services[t.id].enabled?'checked':''}><span class="tr"></span></label><span class="nm">${esc(t.nl.name)}</span><span class="faint" style="font-size:12px">${t.dur}m</span><input type="number" placeholder="${t.dur}" value="${s.services[t.id].durationOverride||''}" title="Afwijkende duur (min)"></div>`);
        row.querySelector('input[type=checkbox]').onchange=(e)=>s.services[t.id].enabled=e.target.checked;
        row.querySelector('input[type=number]').onchange=(e)=>s.services[t.id].durationOverride=e.target.value?+e.target.value:null;
        svc.appendChild(row);
      });
    });
    body.appendChild(svc);

    // weekly schedule
    body.appendChild(window.h('<div class="adm-section-title">Standaard weekrooster</div>'));
    const sched=window.h('<div style="display:flex;flex-direction:column;gap:8px"></div>');
    DAYS.forEach(([num,lbl])=>{
      const ranges=(s.schedule.weekly[num]||[]);
      const val=ranges.length?ranges[0].join('-'):'';
      const row=window.h(`<div style="display:flex;align-items:center;gap:12px"><b style="width:32px;text-transform:capitalize">${lbl}</b><input data-day="${num}" placeholder="vrij" value="${val}" style="flex:1;padding:9px 12px;border:1px solid var(--adm-line);border-radius:8px;font-family:ui-monospace,monospace;font-size:13px"></div>`);
      sched.appendChild(row);
    });
    body.appendChild(sched);
    body.appendChild(window.h('<p class="faint" style="font-size:12px;margin-top:8px">Bijv. <b>10:00-20:30</b>. Leeg = vrij die dag. Buiten de salonopeningstijden roosteren kan niet.</p>'));

    // iCal feed
    body.appendChild(window.h('<div class="adm-section-title">Privé-agenda (iCal)</div>'));
    const ical=window.h(`<div style="display:flex;gap:10px;align-items:center"><input readonly value="https://www.thehealinglounge.nl/ical/${s.id}.ics" class="mono" style="flex:1;padding:9px 12px;border:1px solid var(--adm-line);border-radius:8px;font-size:12px"><button class="btn btn-ghost btn-sm" type="button">Kopieer</button></div>`);
    ical.querySelector('button').onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(ical.querySelector('input').value); window.HLA_UI.toast('Link gekopieerd'); };
    body.appendChild(ical);

    // footer
    const save=window.h('<button class="btn btn-gold">Opslaan</button>');
    const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>');
    cancel.onclick=window.admCloseOverlay;
    const foot=window.HLA_UI.foot([cancel,save]);
    if(!isNew){ const del=window.h('<button class="btn btn-ghost" style="margin-right:auto;color:var(--rood)">Verwijderen</button>'); del.onclick=()=>window.HLA_UI.confirm('Deze medewerker verwijderen? Historische afspraken behouden de naam.',()=>{ const dd=A.get(); dd.staff=dd.staff.filter(x=>x.id!==s.id); A.log('staff','Medewerker verwijderd: '+s.firstName); A.save(); window.admCloseOverlay(); },'Verwijderen'); foot.insertBefore(del,foot.firstChild); }

    save.onclick=()=>{
      s.firstName=body.querySelector('#f-vn').value.trim();
      s.lastName=body.querySelector('#f-an').value.trim();
      s.titleNl=body.querySelector('#f-tnl').value; s.titleEn=body.querySelector('#f-ten').value;
      s.email=body.querySelector('#f-mail').value; s.phone=body.querySelector('#f-tel').value;
      s.bioNl=body.querySelector('#f-bnl').value; s.bioEn=body.querySelector('#f-ben').value;
      s.role=body.querySelector('#f-role').value;
      const newStatus=body.querySelector('#f-status').value;
      sched.querySelectorAll('[data-day]').forEach(inp=>{ const v=inp.value.trim(); s.schedule.weekly[inp.dataset.day]= v?[v.split('-').map(x=>x.trim())]:[]; });
      if(!s.firstName){ window.HLA_UI.toast('Vul een voornaam in.'); return; }
      const dd=A.get();
      const futureCount=dd.appointments.filter(a=>{ const dt=window.admUtil.parse(a.start); return dt&&dt>=window.admUtil.NOW && new RegExp(s.firstName,'i').test(a.staff||''); }).length;
      function commit(){
        s.status=newStatus;
        if(isNew){ dd.staff.push(s); A.log('staff','Nieuwe medewerker: '+s.firstName); }
        else { const i=dd.staff.findIndex(x=>x.id===s.id); dd.staff[i]=s; A.log('staff','Medewerker bijgewerkt: '+s.firstName); }
        A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen');
      }
      if(newStatus==='left' && futureCount>0){ window.HLA_UI.confirm(`${s.firstName} gaat uit dienst en heeft nog ${futureCount} toekomstige afspraak/afspraken. In productie verplaats je die naar een collega of annuleer je ze met bericht. Nu vastleggen?`, commit, 'Uit dienst'); }
      else commit();
    };
    window.HLA_UI.drawer(isNew?'Nieuwe medewerker':(s.firstName+' '+(s.lastName||'')).trim(), body, foot);
  }
})();
