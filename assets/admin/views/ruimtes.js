/* Beheer 2.0 · Ruimtes */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const PALETTE=['#BC813A','#B0543F','#D7B877','#5C6B4E','#3A6FB0','#52371F'];

  window.ADMIN_VIEWS.ruimtes={ render(c){
    const A=window.HLA, d=A.get();
    const bar=window.h('<div class="adm-toolbar"><div style="flex:1"></div></div>');
    const add=window.h('<button class="btn btn-gold btn-sm">+ Nieuwe ruimte</button>'); add.onclick=()=>edit(null); bar.appendChild(add); c.appendChild(bar);
    const grid=window.h('<div class="adm-cards cols-2"></div>');
    d.rooms.forEach(r=>{
      const cnt=d.treatments.filter(t=>t.roomId===r.id).length;
      const card=window.h(`<div class="adm-card" style="cursor:pointer">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><span class="dot-color" style="width:14px;height:14px;background:${r.color}"></span><b style="font-size:18px;flex:1">${esc(r.nl)}</b>${r.active?'<span class="badge ok">Actief</span>':'<span class="badge neutral">Uit</span>'}</div>
        <div class="muted" style="font-size:13.5px">${r.type==='self'?'Zelfboekbaar (geen medewerker)':'Met medewerker'} · capaciteit ${r.capacity} · buffer ${r.buffer}m</div>
        <div class="muted" style="font-size:13px;margin-top:6px">${cnt} behandelingen gekoppeld</div>
      </div>`);
      card.onclick=()=>edit(r.id); grid.appendChild(card);
    });
    c.appendChild(grid);
  }};

  function edit(id){
    const A=window.HLA, d=A.get(), isNew=!id;
    const r=isNew?{id:A.uid('r'),nl:'',en:'',type:'staff',capacity:1,buffer:15,color:'#BC813A',hours:'salon',slot:{duration:30,start:null},active:true}:JSON.parse(JSON.stringify(A.roomById(id)));
    const body=window.h('<div></div>');
    body.appendChild(window.h(`<div class="bilingual"><div class="adm-field"><label>Naam (NL)</label><input id="r-nl" value="${esc(r.nl)}"></div><div class="adm-field"><label>Naam (EN)</label><input id="r-en" value="${esc(r.en)}"></div></div>`));
    body.appendChild(window.h(`<div class="adm-field"><label>Type</label><select id="r-type"><option value="staff"${r.type==='staff'?' selected':''}>Met medewerker (afspraak vereist een medewerker)</option><option value="self"${r.type==='self'?' selected':''}>Zelfboekbaar (klant boekt zonder medewerker)</option></select></div>`));
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>Capaciteit (gelijktijdig)</label><input id="r-cap" type="number" min="1" value="${r.capacity}"></div><div class="adm-field"><label>Buffertijd (min)</label><input id="r-buf" type="number" min="0" value="${r.buffer}"></div></div>`));
    body.appendChild(window.h(`<div class="adm-field" id="r-slotwrap"><label>Slotraster voor zelfboeking (min)</label><input id="r-slot" type="number" min="5" value="${r.slot.duration}"></div>`));
    const colWrap=window.h('<div class="adm-field"><label>Agendakleur</label></div>'); const sw=window.h('<div style="display:flex;gap:8px"></div>');
    PALETTE.forEach(col=>{ const b=window.h(`<button type="button" style="width:30px;height:30px;border-radius:50%;background:${col};border:2px solid ${col===r.color?'var(--ink)':'transparent'}"></button>`); b.onclick=()=>{ r.color=col; sw.querySelectorAll('button').forEach(x=>x.style.border='2px solid transparent'); b.style.border='2px solid var(--ink)'; }; sw.appendChild(b); });
    colWrap.appendChild(sw); body.appendChild(colWrap);
    body.appendChild(window.h(`<label style="display:flex;gap:12px;align-items:center;margin-top:6px"><span class="sw"><input type="checkbox" id="r-active" ${r.active?'checked':''}><span class="tr"></span></span><span>Actief (boekbaar)</span></label>`));
    // coupled treatments
    const coupled=d.treatments.filter(t=>t.roomId===r.id);
    if(coupled.length){ body.appendChild(window.h('<div class="adm-section-title">Gekoppelde behandelingen</div>')); body.appendChild(window.h('<div class="muted" style="font-size:13.5px">'+coupled.map(t=>esc(t.nl.name)).join(' · ')+'</div>')); }

    const save=window.h('<button class="btn btn-gold">Opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    const foot=window.HLA_UI.foot([cancel,save]);
    save.onclick=()=>{
      r.nl=body.querySelector('#r-nl').value.trim(); r.en=body.querySelector('#r-en').value.trim();
      r.type=body.querySelector('#r-type').value; r.capacity=+body.querySelector('#r-cap').value||1;
      r.buffer=+body.querySelector('#r-buf').value||0; r.slot.duration=+body.querySelector('#r-slot').value||30;
      r.color=r.color; r.active=body.querySelector('#r-active').checked;
      if(!r.nl){ window.HLA_UI.toast('Vul een naam in.'); return; }
      const dd=A.get(); if(isNew){ dd.rooms.push(r); A.log('room','Nieuwe ruimte: '+r.nl); } else { const i=dd.rooms.findIndex(x=>x.id===r.id); dd.rooms[i]=r; A.log('room','Ruimte bijgewerkt: '+r.nl); }
      A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen');
    };
    window.HLA_UI.drawer(isNew?'Nieuwe ruimte':r.nl, body, foot);
  }
})();
