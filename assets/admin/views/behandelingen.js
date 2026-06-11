/* Beheer 2.0 · Behandelingen & categorieën */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};

  window.ADMIN_VIEWS.behandelingen={ render(c){
    const A=window.HLA, d=A.get();
    const bar=window.h('<div class="adm-toolbar"><div style="flex:1"></div></div>');
    const cat=window.h('<button class="btn btn-ghost btn-sm">Categorieën beheren</button>'); cat.onclick=editCats; bar.appendChild(cat);
    const add=window.h('<button class="btn btn-gold btn-sm">+ Nieuwe behandeling</button>'); add.onclick=()=>edit(null); bar.appendChild(add);
    c.appendChild(bar);

    d.categories.sort((a,b)=>a.order-b.order).forEach(ct=>{
      const treats=d.treatments.filter(t=>t.cat===ct.id);
      c.appendChild(window.h(`<div class="adm-section-title">${esc(ct.nl)} <span class="faint">· ${treats.length}</span></div>`));
      const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Behandeling</th><th>Prijs</th><th>Duur</th><th>Ruimte</th><th>Medewerkers</th><th>Boekbaar</th></tr></thead><tbody></tbody></table>');
      const tb=tbl.querySelector('tbody');
      treats.forEach(t=>{
        const room=A.roomById(t.roomId), staff=A.staffForTreatment(t.id);
        const bookable=A.isBookable(t);
        const tr=window.h(`<tr>
          <td data-label="Behandeling"><span class="nm">${esc(t.nl.name)}</span> ${t.active?'':'<span class="badge neutral">inactief</span>'}</td>
          <td data-label="Prijs">€ ${t.price}</td>
          <td data-label="Duur">${t.dur} min</td>
          <td data-label="Ruimte">${room?esc(room.nl):'—'}</td>
          <td data-label="Medewerkers">${room&&room.type==='self'?'<span class="faint">zelfboekbaar</span>':(staff.length?staff.map(s=>esc(s.firstName)).join(', '):'<span class="bad">geen</span>')}</td>
          <td data-label="Boekbaar">${bookable?'<span class="badge ok">ja</span>':'<span class="badge warn">nee</span>'}</td>
        </tr>`);
        tr.onclick=()=>edit(t.id); tb.appendChild(tr);
      });
      c.appendChild(tbl);
    });
  }};

  function edit(id){
    const A=window.HLA, d=A.get(), isNew=!id;
    const t=isNew?{id:A.uid('t'),cat:d.categories[0]?d.categories[0].id:'',nl:{name:'',desc:''},en:{name:'',desc:''},price:0,dur:60,roomId:d.rooms[0]?d.rooms[0].id:'',doc:'C',staffIds:[],active:true,photo:'',slug:'',buffer:15,bufferOn:true}:JSON.parse(JSON.stringify(A.treatmentById(id)));
    if(t.buffer==null)t.buffer=15; if(t.bufferOn==null)t.bufferOn=true;
    const body=window.h('<div></div>');
    body.appendChild(window.h(`<div class="bilingual"><div class="adm-field"><label>Naam (NL)</label><input id="t-nnl" value="${esc(t.nl.name)}"></div><div class="adm-field"><label>Naam (EN)</label><input id="t-nen" value="${esc(t.en.name)}"></div></div>`));
    body.appendChild(window.h(`<div class="bilingual"><div class="adm-field"><label>Omschrijving (NL)</label><textarea id="t-dnl" rows="2">${esc(t.nl.desc)}</textarea></div><div class="adm-field"><label>Omschrijving (EN)</label><textarea id="t-den" rows="2">${esc(t.en.desc)}</textarea></div></div>`));
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>Prijs (€)</label><input id="t-price" type="number" value="${t.price}"></div><div class="adm-field"><label>Duur (min)</label><input id="t-dur" type="number" value="${t.dur}"></div></div>`));
    body.appendChild(window.h(`<div class="field-row">
      <div class="adm-field"><label>Categorie</label><select id="t-cat">${d.categories.map(c=>`<option value="${c.id}"${c.id===t.cat?' selected':''}>${esc(c.nl)}</option>`).join('')}</select></div>
      <div class="adm-field"><label>Ruimte</label><select id="t-room">${d.rooms.map(r=>`<option value="${r.id}"${r.id===t.roomId?' selected':''}>${esc(r.nl)}</option>`).join('')}</select></div>
    </div>`));
    body.appendChild(window.h(`<div class="adm-field"><label>Document bij boeking</label><select id="t-doc"><option value="A"${t.doc==='A'?' selected':''}>Ondertekening vereist</option><option value="B"${t.doc==='B'?' selected':''}>Alleen aandachtspunten inzien</option><option value="C"${t.doc==='C'?' selected':''}>Geen document</option></select></div>`));
    body.appendChild(window.h(`<label style="display:flex;gap:12px;align-items:center"><span class="sw"><input type="checkbox" id="t-active" ${t.active?'checked':''}><span class="tr"></span></span><span>Actief (boekbaar én zichtbaar op de site)</span></label>`));
    const bufRow=window.h(`<div class="adm-card" style="padding:16px 18px;margin-top:6px;background:var(--adm-bg)"><label style="display:flex;gap:12px;align-items:center"><span class="sw"><input type="checkbox" id="t-bufon" ${t.bufferOn!==false?'checked':''}><span class="tr"></span></span><span><b>Opruimtijd na de behandeling</b><div class="muted" style="font-size:13px">Tijd om de plek klaar te maken (schoonmaken, schone dekentjes). Wordt geblokkeerd in de agenda en beschikbaarheid.</div></span></label><div class="adm-field" id="t-bufwrap" style="margin:12px 0 0;max-width:160px"><label>Minuten</label><input id="t-buf" type="number" min="0" step="5" value="${t.buffer||15}"></div></div>`);
    body.appendChild(bufRow);
    function syncBuf(){ bufRow.querySelector('#t-bufwrap').style.opacity = bufRow.querySelector('#t-bufon').checked?'1':'.4'; }
    bufRow.querySelector('#t-bufon').onchange=syncBuf; syncBuf();

    /* ---- Actie / tijdelijke aanbieding (gedeeld met de publieke site via HLOverrides) ---- */
    const OVp = window.HLOverrides;
    const promo = Object.assign({on:false,type:'percent',value:10,labelNl:'Actie',labelEn:'Sale',startISO:'',endISO:''}, (OVp&&OVp.promos.get(t.id))||{});
    body.appendChild(window.h('<div class="adm-section-title">Actie / aanbieding</div>'));
    const promoCard=window.h(`<div class="adm-card" style="padding:18px 20px">
      <label style="display:flex;gap:12px;align-items:center"><span class="sw"><input type="checkbox" id="pr-on" ${promo.on?'checked':''}><span class="tr"></span></span><span><b>Deze behandeling in de actie zetten</b><div class="muted" style="font-size:13px">Toont automatisch een actie-label op de homepage én op de behandelpagina, alleen binnen de periode die je kiest. Werkt voor elke behandeling.</div></span></label>
      <div id="pr-body" style="margin-top:14px">
        <div class="field-row">
          <div class="adm-field"><label>Soort actie</label><select id="pr-type">
            <option value="percent"${promo.type==='percent'?' selected':''}>Korting in % </option>
            <option value="amount"${promo.type==='amount'?' selected':''}>Korting in €</option>
            <option value="none"${promo.type==='none'?' selected':''}>Alleen label (geen korting)</option>
          </select></div>
          <div class="adm-field" id="pr-valwrap"><label id="pr-vallbl">Korting (%)</label><input id="pr-val" type="number" min="0" step="1" value="${promo.value}"></div>
        </div>
        <div class="bilingual"><div class="adm-field"><label>Label (NL)</label><input id="pr-lnl" value="${esc(promo.labelNl)}" placeholder="Actie"></div><div class="adm-field"><label>Label (EN)</label><input id="pr-len" value="${esc(promo.labelEn)}" placeholder="Sale"></div></div>
        <div class="field-row">
          <div class="adm-field"><label>Startdatum (leeg = direct)</label><input id="pr-start" type="date" value="${promo.startISO||''}"></div>
          <div class="adm-field"><label>Einddatum (leeg = doorlopend)</label><input id="pr-end" type="date" value="${promo.endISO||''}"></div>
        </div>
        <div class="muted" id="pr-prev" style="font-size:13.5px;padding:11px 13px;background:var(--adm-bg);border-radius:9px"></div>
      </div>
    </div>`);
    body.appendChild(promoCard);
    function prRead(){ promo.on=promoCard.querySelector('#pr-on').checked; promo.type=promoCard.querySelector('#pr-type').value; promo.value=+promoCard.querySelector('#pr-val').value||0; promo.labelNl=promoCard.querySelector('#pr-lnl').value.trim()||'Actie'; promo.labelEn=promoCard.querySelector('#pr-len').value.trim()||'Sale'; promo.startISO=promoCard.querySelector('#pr-start').value; promo.endISO=promoCard.querySelector('#pr-end').value; }
    function prSync(){
      prRead();
      promoCard.querySelector('#pr-body').style.opacity=promo.on?'1':'.45';
      promoCard.querySelector('#pr-valwrap').style.display=promo.type==='none'?'none':'';
      promoCard.querySelector('#pr-vallbl').textContent=promo.type==='amount'?'Korting (€)':'Korting (%)';
      const base=+body.querySelector('#t-price').value||t.price; let line;
      if(!promo.on){ line='Geen actie actief voor deze behandeling.'; }
      else {
        let pl;
        if(promo.type==='percent'){ const np=Math.round(base*(1-(promo.value||0)/100)); pl='€ '+base+' → € '+np+'  (−'+(promo.value||0)+'%)'; }
        else if(promo.type==='amount'){ const np=Math.max(0,base-(promo.value||0)); pl='€ '+base+' → € '+np+'  (−€ '+(promo.value||0)+')'; }
        else pl='Alleen label · prijs blijft € '+base;
        const today=new Date().toISOString().slice(0,10); let st='● Loopt nu';
        if(promo.startISO && today<promo.startISO) st='◷ Gepland vanaf '+promo.startISO;
        else if(promo.endISO && today>promo.endISO) st='○ Periode afgelopen ('+promo.endISO+')';
        else if(promo.endISO) st='● Loopt t/m '+promo.endISO;
        line='“'+promo.labelNl+'” · '+pl+' · '+st;
      }
      promoCard.querySelector('#pr-prev').textContent=line;
    }
    promoCard.querySelectorAll('#pr-on,#pr-type,#pr-val,#pr-lnl,#pr-len,#pr-start,#pr-end').forEach(elp=>{ elp.oninput=prSync; elp.onchange=prSync; });
    prSync();

    // staff coupling (mirror of medewerkers)
    body.appendChild(window.h('<div class="adm-section-title">Toegestane medewerkers</div>'));
    const staffWrap=window.h('<div class="svc-pick"></div>');
    const note=window.h('<p class="faint" style="font-size:12px">Bij een zelfboekbare ruimte is geen medewerker nodig.</p>');
    d.staff.filter(s=>s.status!=='left').forEach(s=>{
      const on=t.staffIds.includes(s.id);
      const row=window.h(`<div class="svc-item"><label class="sw"><input type="checkbox" data-staff="${s.id}" ${on?'checked':''}><span class="tr"></span></label><span class="nm"><span class="dot-color" style="background:${s.color};margin-right:8px"></span>${esc(s.firstName)} ${esc(s.lastName||'')}</span><span class="faint" style="font-size:12px">${s.role==='owner'?'eigenaar':''}</span></div>`);
      staffWrap.appendChild(row);
    });
    body.appendChild(staffWrap); body.appendChild(note);

    const save=window.h('<button class="btn btn-gold">Opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    const foot=window.HLA_UI.foot([cancel,save]);
    if(!isNew){ const del=window.h('<button class="btn btn-ghost" style="margin-right:auto;color:var(--rood)">Verwijderen</button>'); del.onclick=()=>window.HLA_UI.confirm('Deze behandeling verwijderen?',()=>{ const dd=A.get(); dd.treatments=dd.treatments.filter(x=>x.id!==t.id); A.log('treatment','Behandeling verwijderd: '+t.nl.name); A.save(); window.admCloseOverlay(); },'Verwijderen'); foot.insertBefore(del,foot.firstChild); }
    save.onclick=()=>{
      t.nl.name=body.querySelector('#t-nnl').value.trim(); t.en.name=body.querySelector('#t-nen').value.trim();
      t.nl.desc=body.querySelector('#t-dnl').value; t.en.desc=body.querySelector('#t-den').value;
      t.price=+body.querySelector('#t-price').value||0; t.dur=+body.querySelector('#t-dur').value||60;
      t.cat=body.querySelector('#t-cat').value; t.roomId=body.querySelector('#t-room').value; t.doc=body.querySelector('#t-doc').value;
      t.active=body.querySelector('#t-active').checked;
      t.bufferOn=body.querySelector('#t-bufon').checked; t.buffer=+body.querySelector('#t-buf').value||0;
      t.staffIds=[...staffWrap.querySelectorAll('input[data-staff]:checked')].map(x=>x.dataset.staff);
      if(!t.nl.name){ window.HLA_UI.toast('Vul een naam in.'); return; }
      const dd=A.get();
      // mirror coupling into staff.services
      dd.staff.forEach(s=>{ if(!s.services[t.id]) s.services[t.id]={enabled:false,durationOverride:null}; s.services[t.id].enabled=t.staffIds.includes(s.id); });
      if(isNew){ dd.treatments.push(t); dd.staff.forEach(s=>{ if(!s.services[t.id]) s.services[t.id]={enabled:t.staffIds.includes(s.id),durationOverride:null}; }); A.log('treatment','Nieuwe behandeling: '+t.nl.name); }
      else { const i=dd.treatments.findIndex(x=>x.id===t.id); dd.treatments[i]=t; A.log('treatment','Behandeling bijgewerkt: '+t.nl.name); }
      if(window.HLOverrides){ prRead(); window.HLOverrides.promos.set(t.id, promo.on?{on:true,type:promo.type,value:promo.value,labelNl:promo.labelNl,labelEn:promo.labelEn,startISO:promo.startISO,endISO:promo.endISO}:null); A.log('treatment', (promo.on?'Actie ingesteld':'Actie verwijderd')+': '+t.nl.name); }
      A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen');
    };
    window.HLA_UI.drawer(isNew?'Nieuwe behandeling':t.nl.name, body, foot);
  }

  function editCats(){
    const A=window.HLA, d=A.get();
    const body=window.h('<div></div>');
    body.appendChild(window.h('<p class="muted" style="font-size:14px">Categorieën bepalen de indeling op de site en in de boekingsflow.</p>'));
    const list=window.h('<div style="display:flex;flex-direction:column;gap:8px"></div>');
    function draw(){ list.innerHTML=''; d.categories.sort((a,b)=>a.order-b.order).forEach((cat,idx)=>{
      const row=window.h(`<div class="svc-item"><input value="${esc(cat.nl)}" data-nl style="flex:1;border:0;background:none;font-size:14px"><input value="${esc(cat.en)}" data-en style="flex:1;border:0;background:none;font-size:13px;color:var(--ink-soft)"><button class="btn-mini btn btn-ghost" data-up>↑</button><button class="btn-mini btn btn-ghost" data-del style="color:var(--rood)">✕</button></div>`);
      row.querySelector('[data-nl]').onchange=e=>cat.nl=e.target.value; row.querySelector('[data-en]').onchange=e=>cat.en=e.target.value;
      row.querySelector('[data-up]').onclick=()=>{ if(idx>0){ const p=d.categories[idx-1]; const o=cat.order; cat.order=p.order; p.order=o; draw(); } };
      row.querySelector('[data-del]').onclick=()=>{ if(d.treatments.some(t=>t.cat===cat.id)){ window.HLA_UI.toast('Categorie bevat nog behandelingen.'); return; } d.categories=d.categories.filter(x=>x.id!==cat.id); draw(); };
      list.appendChild(row);
    }); }
    draw(); body.appendChild(list);
    const addc=window.h('<button class="btn btn-ghost btn-sm" style="margin-top:12px">+ Categorie toevoegen</button>');
    addc.onclick=()=>{ d.categories.push({id:A.uid('cat'),nl:'Nieuw',en:'New',order:d.categories.length}); draw(); };
    body.appendChild(addc);
    const save=window.h('<button class="btn btn-gold">Opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Sluiten</button>'); cancel.onclick=window.admCloseOverlay;
    save.onclick=()=>{ A.log('category','Categorieën bijgewerkt.'); A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen'); };
    window.HLA_UI.drawer('Categorieën', body, window.HLA_UI.foot([cancel,save]));
  }
})();
