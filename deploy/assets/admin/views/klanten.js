/* Beheer 2.0 · Klanten */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const U=window.admUtil;
  let q='', filt='all';

  function emailBad(c){ return !c.emailValid; }
  function phoneBad(c){ return !c.phoneValid; }

  window.ADMIN_VIEWS.klanten={ render(c){
    const A=window.HLA, d=A.get();
    const bar=window.h(`<div class="adm-toolbar">
      <label class="adm-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg><input placeholder="Zoek op naam, e-mail of telefoon…" value="${esc(q)}"></label>
    </div>`);
    const filters=window.h('<div class="adm-toolbar"></div>');
    [['all','Alle'],['marketing','Op marketinglijst'],['issues','Aandachtspunten'],['blocked','Geblokkeerd']].forEach(f=>{ const b=window.h(`<button class="chip-toggle ${filt===f[0]?'on':''}">${f[1]}</button>`); b.onclick=()=>{ filt=f[0]; window.ADMIN_VIEWS.klanten.render(c); }; filters.appendChild(b); });
    const sp=window.h('<div style="flex:1"></div>'); filters.appendChild(sp);
    const imp=window.h('<button class="btn btn-ghost btn-sm">Importeren</button>'); imp.onclick=importCsv; filters.appendChild(imp);
    const add=window.h('<button class="btn btn-gold btn-sm">+ Nieuwe klant</button>'); add.onclick=()=>profile(null); filters.appendChild(add);

    bar.querySelector('input').oninput=(e)=>{ q=e.target.value; renderRows(); };
    c.appendChild(bar); c.appendChild(filters);
    const count=window.h('<div class="muted" style="font-size:13px;margin-bottom:10px"></div>'); c.appendChild(count);
    const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Naam</th><th>E-mail</th><th>Telefoon</th><th>Laatste boeking</th><th>Boekingen</th><th>Marketing</th></tr></thead><tbody></tbody></table>');
    const tb=tbl.querySelector('tbody'); c.appendChild(tbl);

    function list(){
      let l=d.customers.slice();
      const qq=q.toLowerCase();
      if(qq) l=l.filter(c=>((c.firstName+' '+c.lastName+' '+c.email+' '+c.phone).toLowerCase().includes(qq)));
      if(filt==='marketing') l=l.filter(c=>c.marketing);
      if(filt==='issues') l=l.filter(c=>emailBad(c)||phoneBad(c));
      if(filt==='blocked') l=l.filter(c=>c.blocked);
      l.sort((a,b)=>(a.firstName+a.lastName).localeCompare(b.firstName+b.lastName));
      return l;
    }
    function renderRows(){
      const l=list(); tb.innerHTML='';
      count.textContent=l.length+' van '+d.customers.length+' klanten';
      l.slice(0,400).forEach(c=>{
        const tr=window.h(`<tr>
          <td data-label="Naam"><span class="nm">${esc((c.firstName+' '+c.lastName).trim())||'—'}</span> ${c.blocked?'<span class="badge warn">geblokkeerd</span>':''}</td>
          <td data-label="E-mail"><span class="mono ${emailBad(c)?'bad':''}">${esc(c.email)||'—'}</span></td>
          <td data-label="Telefoon"><span class="mono ${phoneBad(c)?'bad':''}">${esc(c.phone)||'—'}</span></td>
          <td data-label="Laatste boeking" class="muted">${esc(c.lastBooking)||'—'}</td>
          <td data-label="Boekingen">${c.totalBookings||0}</td>
          <td data-label="Marketing">${c.marketing?'<span class="badge ok">aangemeld</span>':'<span class="badge neutral">afgemeld</span>'}</td>
        </tr>`);
        tr.onclick=()=>profile(c.id); tb.appendChild(tr);
      });
    }
    renderRows();
  }};

  function profile(id){
    const A=window.HLA, d=A.get(), isNew=!id;
    const c=isNew?{id:A.uid('c'),firstName:'',lastName:'',email:'',phone:'',emailValid:true,phoneValid:true,lang:'nl',lastBooking:'',totalBookings:0,marketing:true,marketingSince:A.todayISO(),blocked:false,blockReason:'',notes:'',source:'handmatig',issues:[]}:JSON.parse(JSON.stringify(A.customerById(id)));
    const body=window.h('<div></div>');
    if(c.blocked) body.appendChild(window.h(`<div class="adm-card" style="border-color:var(--rood);background:#fbf2ee;margin-bottom:16px"><b class="bad">Geblokkeerd</b><div class="muted" style="font-size:13.5px">${esc(c.blockReason||'')}</div></div>`));
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>Voornaam</label><input id="c-vn" value="${esc(c.firstName)}"></div><div class="adm-field"><label>Achternaam</label><input id="c-an" value="${esc(c.lastName)}"></div></div>`));
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>E-mail</label><input id="c-mail" value="${esc(c.email)}"></div><div class="adm-field"><label>Telefoon</label><input id="c-tel" value="${esc(c.phone)}"></div></div>`));
    body.appendChild(window.h(`<div class="field-row"><div class="adm-field"><label>Taal</label><select id="c-lang"><option value="nl"${c.lang==='nl'?' selected':''}>Nederlands</option><option value="en"${c.lang==='en'?' selected':''}>English</option></select></div><div class="adm-field"><label>Marketing</label><div style="display:flex;align-items:center;gap:10px;height:44px"><span class="sw"><input type="checkbox" id="c-mk" ${c.marketing?'checked':''}><span class="tr"></span></span><span class="muted" id="c-mklbl">${c.marketing?'Aangemeld':'Afgemeld'}</span></div></div></div>`));
    body.querySelector('#c-mk').onchange=(e)=>body.querySelector('#c-mklbl').textContent=e.target.checked?'Aangemeld':'Afgemeld';
    body.appendChild(window.h(`<div class="adm-field"><label>Interne notitie</label><textarea id="c-notes" rows="2">${esc(c.notes||'')}</textarea></div>`));

    if(!isNew){
      // appointment history
      const hist=d.appointments.filter(a=>(a.email||'').toLowerCase()===(c.email||'').toLowerCase());
      body.appendChild(window.h('<div class="adm-section-title">Afsprakenhistorie</div>'));
      if(hist.length){ const list=window.h('<div></div>'); hist.forEach(a=>list.appendChild(window.h(`<div style="display:flex;gap:12px;padding:9px 0;border-top:1px solid var(--adm-line);font-size:13.5px"><span class="faint mono" style="width:120px">${esc(a.start)}</span><span style="flex:1">${esc(a.service)}</span><span class="muted">${esc(a.staff||'')}</span></div>`))); body.appendChild(list); }
      else body.appendChild(window.h('<div class="muted" style="font-size:13.5px">Nog geen geregistreerde afspraken in dit systeem.</div>'));
    }

    const save=window.h('<button class="btn btn-gold">Opslaan</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    const foot=window.HLA_UI.foot([cancel,save]);
    if(!isNew){
      const block=window.h(`<button class="btn btn-ghost" style="margin-right:auto;color:${c.blocked?'var(--green-soft)':'var(--rood)'}">${c.blocked?'Deblokkeren':'Blokkeren'}</button>`);
      block.onclick=()=>{
        if(c.blocked){ c.blocked=false; c.blockReason=''; const dd=A.get(); const i=dd.customers.findIndex(x=>x.id===c.id); dd.customers[i]=c; A.log('customer','Klant gedeblokkeerd: '+c.firstName); A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Gedeblokkeerd'); }
        else { const reason=prompt('Reden voor blokkeren (verplicht):'); if(!reason) return; c.blocked=true; c.blockReason=reason+' ('+A.todayISO()+')'; c.marketing=false; const dd=A.get(); const i=dd.customers.findIndex(x=>x.id===c.id); dd.customers[i]=c; A.log('customer','Klant geblokkeerd: '+c.firstName+' — '+reason); A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Geblokkeerd. Kan niet meer online boeken.'); }
      };
      foot.insertBefore(block,foot.firstChild);
    }
    save.onclick=()=>{
      c.firstName=body.querySelector('#c-vn').value.trim(); c.lastName=body.querySelector('#c-an').value.trim();
      c.email=body.querySelector('#c-mail').value.trim(); c.phone=body.querySelector('#c-tel').value.trim();
      c.lang=body.querySelector('#c-lang').value; const wasMk=c.marketing; c.marketing=body.querySelector('#c-mk').checked; if(c.marketing&&!wasMk) c.marketingSince=A.todayISO();
      c.notes=body.querySelector('#c-notes').value;
      c.emailValid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)&&!/\.copm$/.test(c.email);
      c.phoneValid=/^\+?\d[\d\s]{7,}$/.test(c.phone.replace(/[\s\-()]/g,''));
      if(!c.firstName&&!c.email){ window.HLA_UI.toast('Vul minimaal naam of e-mail in.'); return; }
      const dd=A.get(); if(isNew){ dd.customers.unshift(c); A.log('customer','Nieuwe klant: '+c.firstName); } else { const i=dd.customers.findIndex(x=>x.id===c.id); dd.customers[i]=c; A.log('customer','Klant bijgewerkt: '+c.firstName); }
      A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen');
    };
    window.HLA_UI.drawer(isNew?'Nieuwe klant':(c.firstName+' '+c.lastName).trim()||'Klant', body, foot);
  }

  function importCsv(){
    const A=window.HLA;
    const body=window.h('<div></div>');
    body.appendChild(window.h('<p class="muted" style="font-size:14px">Koppelt op e-mailadres. Bestaande klanten worden bijgewerkt (overschrijven) of met rust gelaten (overslaan); nieuwe komen erbij.</p>'));
    let mode='overwrite';
    const radios=window.h('<div style="display:flex;gap:10px;margin-bottom:14px"></div>');
    [['overwrite','Overschrijven'],['skip','Overslaan']].forEach(r=>{ const b=window.h(`<button class="chip-toggle ${mode===r[0]?'on':''}">${r[1]}</button>`); b.onclick=()=>{ mode=r[0]; radios.querySelectorAll('button').forEach((x,i)=>x.classList.toggle('on',['overwrite','skip'][i]===mode)); }; radios.appendChild(b); });
    body.appendChild(radios);
    const file=window.h('<input type="file" accept=".csv">'); body.appendChild(file);
    const prev=window.h('<div class="muted" style="margin-top:14px;font-size:14px"></div>'); body.appendChild(prev);
    file.onchange=(e)=>{ const f=e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ const rows=parseCSV(rd.result); const inc=rowsToCust(rows); const d=A.get(); const byEmail={}; d.customers.forEach(c=>byEmail[(c.email||'').toLowerCase()]=c); let add=0,upd=0,skip=0; inc.forEach(c=>{ const k=(c.email||'').toLowerCase(); if(k&&byEmail[k]){ mode==='overwrite'?upd++:skip++; } else add++; }); prev.innerHTML=`<b>${inc.length}</b> rijen gelezen, <b>${add}</b> nieuw, <b>${upd}</b> ${mode==='overwrite'?'bijgewerkt':'overgeslagen'}.`; prev.dataset.ready='1'; window._impInc=inc; }; rd.readAsText(f); };
    const save=window.h('<button class="btn btn-gold">Toepassen</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    save.onclick=()=>{ const inc=window._impInc; if(!inc){ window.HLA_UI.toast('Kies eerst een CSV.'); return; } const d=A.get(); const byEmail={}; d.customers.forEach(c=>byEmail[(c.email||'').toLowerCase()]=c); let add=0,upd=0; inc.forEach(c=>{ const k=(c.email||'').toLowerCase(); if(k&&byEmail[k]){ if(mode==='overwrite'){ Object.assign(byEmail[k],{firstName:c.firstName||byEmail[k].firstName,lastName:c.lastName||byEmail[k].lastName,phone:c.phone||byEmail[k].phone}); upd++; } } else { d.customers.unshift({id:A.uid('c'),firstName:c.firstName,lastName:c.lastName,email:c.email,phone:c.phone,emailValid:true,phoneValid:!!c.phone,lang:'nl',lastBooking:'',totalBookings:0,marketing:true,marketingSince:A.todayISO(),blocked:false,notes:'',source:'import',issues:[]}); add++; } }); A.log('import',`Import: ${add} nieuw, ${upd} bijgewerkt.`); A.save(); window.admCloseOverlay(); window.HLA_UI.toast(`${add} nieuw, ${upd} bijgewerkt`); };
    window.HLA_UI.drawer('Klanten importeren', body, window.HLA_UI.foot([cancel,save]));
  }
  function parseCSV(text){const rows=[];let i=0,f='',row=[],q=false;const pF=()=>{row.push(f);f='';};const pR=()=>{rows.push(row);row=[];};while(i<text.length){const ch=text[i];if(q){if(ch==='"'){if(text[i+1]==='"'){f+='"';i+=2;continue;}q=false;i++;continue;}f+=ch;i++;continue;}if(ch==='"'){q=true;i++;continue;}if(ch===','){pF();i++;continue;}if(ch==='\r'){i++;continue;}if(ch==='\n'){pF();pR();i++;continue;}f+=ch;i++;}if(f.length||row.length){pF();pR();}return rows.filter(r=>r.length>1);}
  function rowsToCust(rows){ const head=rows[0].map(h=>h.toLowerCase()); const idx=ns=>{for(const n of ns){const i=head.findIndex(h=>h.includes(n));if(i>=0)return i;}return -1;}; const iv=idx(['voornaam','first']),ia=idx(['achternaam','last']),ie=idx(['mail']),it=idx(['telefoon','phone']); return rows.slice(1).map(r=>({firstName:(r[iv]||'').trim(),lastName:(r[ia]||'').trim(),email:(r[ie]||'').trim(),phone:(r[it]||'').trim()})).filter(c=>c.email||c.firstName); }

  /* ---------- Boekingen ---------- */
  window.ADMIN_VIEWS.boekingen={ render(c){
    const A=window.HLA, d=A.get();
    let qq='', st='all';
    const bar=window.h(`<div class="adm-toolbar"><label class="adm-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg><input placeholder="Zoek op naam of dienst…"></label></div>`);
    const filt=window.h('<div class="adm-toolbar"></div>');
    [['all','Alle'],['Goedgekeurd','Bevestigd'],['Geannuleerd','Geannuleerd']].forEach(f=>{ const b=window.h(`<button class="chip-toggle ${st===f[0]?'on':''}">${f[1]}</button>`); b.onclick=()=>{ st=f[0]; draw(); filt.querySelectorAll('button').forEach((x,i)=>x.classList.toggle('on',['all','Goedgekeurd','Geannuleerd'][i]===st)); }; filt.appendChild(b); });
    c.appendChild(bar); c.appendChild(filt);
    const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Klant</th><th>Dienst</th><th>Medewerker</th><th>Start</th><th>Prijs</th><th>Status</th></tr></thead><tbody></tbody></table>'); const tb=tbl.querySelector('tbody'); c.appendChild(tbl);
    bar.querySelector('input').oninput=e=>{ qq=e.target.value.toLowerCase(); draw(); };
    function draw(){ tb.innerHTML=''; let l=d.appointments.map(a=>({...a,_d:U.parse(a.start)})).sort((a,b)=>(a._d&&b._d)?a._d-b._d:0);
      if(qq) l=l.filter(a=>((a.customerName+' '+a.service).toLowerCase().includes(qq)));
      if(st!=='all') l=l.filter(a=>(a.status||'').includes(st));
      l.forEach(a=>{ const cancel=/annul/i.test(a.status||''); const tr=window.h(`<tr>
        <td data-label="Klant"><span class="nm">${esc(a.customerName)}</span><br><span class="faint mono" style="font-size:11px">${esc(a.email)}</span></td>
        <td data-label="Dienst">${esc(a.service)}</td><td data-label="Medewerker" class="muted">${esc(a.staff||'')}</td>
        <td data-label="Start" class="muted">${esc(a.start)}</td><td data-label="Prijs">${esc(a.price)}</td>
        <td data-label="Status"><span class="badge ${cancel?'warn':'ok'}">${esc(a.status)}</span></td></tr>`);
        tr.onclick=()=>detail(a); tb.appendChild(tr);
      }); }
    draw();
    function detail(a){
      const body=window.h(`<div>
        <div class="adm-card" style="margin-bottom:14px"><b style="font-size:18px">${esc(a.service)}</b><div class="muted">${esc(a.start)} → ${esc(a.end||'')}</div></div>
        <div class="adm-field"><label>Klant</label><div>${esc(a.customerName)} · <span class="mono">${esc(a.email)}</span> · ${esc(a.phone||'')}</div></div>
        <div class="field-row"><div class="adm-field"><label>Medewerker</label><div>${esc(a.staff||'—')}</div></div><div class="adm-field"><label>Prijs</label><div>${esc(a.price)}</div></div></div>
        <div class="adm-field"><label>Status</label><div><span class="badge ${/annul/i.test(a.status||'')?'warn':'ok'}">${esc(a.status)}</span></div></div>
        <div class="adm-field"><label>Aangemaakt</label><div class="muted">${esc(a.createdAt||'')}</div></div>
        <p class="faint" style="font-size:12px">Wijzigen, annuleren, no-show markeren en mails opnieuw sturen worden in de agenda-fase volledig functioneel (vereisen de e-mail/agenda-koppeling).</p>
      </div>`);
      const close=window.h('<button class="btn btn-ghost">Sluiten</button>'); close.onclick=window.admCloseOverlay;
      window.HLA_UI.drawer('Boeking', body, window.HLA_UI.foot([close]));
    }
  }};
})();
