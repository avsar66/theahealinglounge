/* Beheer 2.0 · E-mailtemplates met live preview */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const VARS=['voornaam','behandeling','datum','tijd','medewerker','prijs','ruimte','magic_link','document_naam'];
  const SAMPLE={voornaam:'Sandra', behandeling:'Transformational Cupping', datum:'woensdag 18 juni', tijd:'14:30', medewerker:'Chantal', prijs:'€ 89', ruimte:'Behandelruimte', magic_link:'#', document_naam:'Contra-indicaties'};

  function seed(A){ const d=A.get(); if(d.templates&&d.templates.length) return;
    const T=(id,name,snl,sen,bnl,ben,btn)=>({id,name,subjectNl:snl,subjectEn:sen,bodyNl:bnl,bodyEn:ben,enabled:true,btnNl:btn?btn[0]:'',btnEn:btn?btn[1]:''});
    d.templates=[
      T('confirm-klant','Bevestiging klant','Je afspraak bij The Healing Lounge','Your appointment at The Healing Lounge','Lieve {voornaam},\n\nWat fijn dat je komt. Je afspraak voor {behandeling} staat genoteerd op {datum} om {tijd} bij {medewerker} in onze {ruimte}.\n\nJe rekent rustig af in de salon ({prijs}). Wijzigen of annuleren kan tot 24 uur van tevoren via de knop hieronder.\n\nTot snel,\nThe Healing Lounge','Dear {voornaam},\n\nLovely that you are coming. Your appointment for {behandeling} is booked on {datum} at {tijd} with {medewerker} in our {ruimte}.\n\nYou settle calmly at the salon ({prijs}). You can change or cancel up to 24 hours before via the button below.\n\nSee you soon,\nThe Healing Lounge',['Bekijk je afspraak','View your appointment']),
      T('confirm-salon','Bevestiging salon','Nieuwe boeking: {behandeling}','New booking: {behandeling}','Nieuwe afspraak: {voornaam} voor {behandeling} op {datum} om {tijd} bij {medewerker}. Getekende verklaring: {document_naam}.','New appointment: {voornaam} for {behandeling} on {datum} at {tijd} with {medewerker}. Signed statement: {document_naam}.',null),
      T('ochtend','Dagelijkse ochtendagenda','Jullie dag bij The Healing Lounge','Your day at The Healing Lounge','Goedemorgen,\n\nHier is de planning van vandaag, per medewerker chronologisch.','Good morning,\n\nHere is today\u2019s schedule, per staff member chronologically.',null),
      T('herinnering','Herinnering 24 uur','Tot morgen, {voornaam}','See you tomorrow, {voornaam}','Lieve {voornaam},\n\nEen kleine herinnering aan je afspraak voor {behandeling} morgen om {tijd}. We kijken ernaar uit.','Dear {voornaam},\n\nA gentle reminder of your appointment for {behandeling} tomorrow at {tijd}. We look forward to it.',['Bekijk je afspraak','View your appointment']),
      T('wijziging','Wijziging','Je afspraak is gewijzigd','Your appointment has changed','Lieve {voornaam},\n\nJe afspraak voor {behandeling} staat nu op {datum} om {tijd}.','Dear {voornaam},\n\nYour appointment for {behandeling} is now on {datum} at {tijd}.',null),
      T('annulering','Annulering','Je afspraak is geannuleerd','Your appointment has been cancelled','Lieve {voornaam},\n\nJe afspraak voor {behandeling} op {datum} is geannuleerd. Tot een volgende keer.','Dear {voornaam},\n\nYour appointment for {behandeling} on {datum} has been cancelled. Until next time.',['Opnieuw boeken','Book again']),
      T('review','Review-verzoek','Hoe was je bezoek, {voornaam}?','How was your visit, {voornaam}?','Lieve {voornaam},\n\nWe hopen dat je nog nageniet van je {behandeling}. Zou je ons willen helpen met een korte review?','Dear {voornaam},\n\nWe hope you are still enjoying the afterglow of your {behandeling}. Would you help us with a short review?',['Laat een review achter','Leave a review']),
    ];
    A.save();
  }
  function fill(txt,lang){ return (txt||'').replace(/\{(\w+)\}/g,(m,k)=>SAMPLE[k]!=null?SAMPLE[k]:m); }

  let curId=null, prevDevice='desktop', prevLang='nl';

  window.ADMIN_VIEWS.emails={ render(c){
    const A=window.HLA; seed(A); const d=A.get(); if(!curId) curId=d.templates[0].id;
    // template picker
    const chips=window.h('<div class="adm-toolbar" style="overflow:auto"></div>');
    d.templates.forEach(t=>{ const b=window.h(`<button class="chip-toggle ${curId===t.id?'on':''}">${esc(t.name)}${t.enabled?'':' <span class="faint">(uit)</span>'}</button>`); b.onclick=()=>{ curId=t.id; window.ADMIN_VIEWS.emails.render(c); }; chips.appendChild(b); });
    c.appendChild(chips);

    const t=d.templates.find(x=>x.id===curId);
    const grid=window.h('<div class="adm-cards cols-2" style="align-items:start"></div>');

    // editor
    const ed=window.h(`<div class="adm-card">
      <label style="display:flex;gap:12px;align-items:center;margin-bottom:14px"><span class="sw"><input type="checkbox" id="t-en" ${t.enabled?'checked':''}><span class="tr"></span></span><span>Template actief</span></label>
      <div class="adm-field"><label>Onderwerp (NL)</label><input id="t-snl" value="${esc(t.subjectNl)}"></div>
      <div class="adm-field"><label>Onderwerp (EN)</label><input id="t-sen" value="${esc(t.subjectEn)}"></div>
      <div class="adm-field"><label>Tekst (NL)</label><textarea id="t-bnl" rows="8">${esc(t.bodyNl)}</textarea></div>
      <div class="adm-field"><label>Tekst (EN)</label><textarea id="t-ben" rows="8">${esc(t.bodyEn)}</textarea></div>
    </div>`);
    // variable inserter
    const vbar=window.h('<div style="display:flex;gap:6px;flex-wrap:wrap;margin:-6px 0 14px"></div>');
    VARS.forEach(v=>{ const b=window.h(`<button class="btn-mini btn btn-ghost mono">{${v}}</button>`); b.onclick=()=>{ const ta=ed.querySelector('#t-bnl'); const s=ta.selectionStart||ta.value.length; ta.value=ta.value.slice(0,s)+'{'+v+'}'+ta.value.slice(s); ta.dispatchEvent(new Event('input')); }; vbar.appendChild(b); });
    ed.querySelector('#t-bnl').insertAdjacentElement('beforebegin', vbar);

    // preview
    const prev=window.h('<div class="adm-card"></div>');
    const ctrls=window.h('<div style="display:flex;gap:8px;margin-bottom:14px;align-items:center"><b style="flex:1;font-size:13px;color:var(--ink-soft)">Live preview</b></div>');
    const dev=window.h(`<div class="ag-views" style="transform:scale(.85)"><button class="${prevDevice==='desktop'?'on':''}">Desktop</button><button class="${prevDevice==='mobile'?'on':''}">Mobiel</button></div>`);
    const lng=window.h(`<div class="ag-views" style="transform:scale(.85)"><button class="${prevLang==='nl'?'on':''}">NL</button><button class="${prevLang==='en'?'on':''}">EN</button></div>`);
    ctrls.appendChild(dev); ctrls.appendChild(lng); prev.appendChild(ctrls);
    const mail=window.h('<div></div>'); prev.appendChild(mail);

    function draw(){
      const A2=window.HLA; const br=(window.admBranding?window.admBranding(A2):(A2.get().settings.branding||{logoLight:'assets/brand/logo-light.png',emailLogoWidth:200}));
      const subj=prevLang==='nl'?ed.querySelector('#t-snl').value:ed.querySelector('#t-sen').value;
      const bdy=prevLang==='nl'?ed.querySelector('#t-bnl').value:ed.querySelector('#t-ben').value;
      const btn=prevLang==='nl'?t.btnNl:t.btnEn;
      const w=prevDevice==='mobile'?340:'100%';
      mail.innerHTML='';
      mail.appendChild(window.h(`<div style="margin:0 auto;width:${prevDevice==='mobile'?w+'px':'100%'};max-width:100%;border:1px solid var(--adm-line);border-radius:12px;overflow:hidden;background:#fff">
        <div style="background:var(--espresso);padding:22px;text-align:center"><img src="${esc(br.logoLight)}" style="width:${br.emailLogoWidth||200}px;max-width:70%;object-fit:contain"></div>
        <div style="padding:24px"><div class="faint" style="font-size:12px;margin-bottom:10px">Onderwerp: ${esc(fill(subj))}</div>
        <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:var(--ink)">${esc(fill(bdy))}</div>
        ${btn?`<div style="margin-top:18px"><span style="display:inline-block;background:var(--honey);color:#fff;padding:11px 22px;border-radius:999px;font-weight:600;font-size:13px">${esc(fill(btn))}</span></div>`:''}
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--adm-line);font-size:11px;color:var(--ink-soft)">De Brouwerij 4, Leusden · info@thehealinglounge.nl${t.id.indexOf('confirm-salon')<0&&t.id!=='ochtend'?' · <u>afmelden</u>':''}</div>
      </div>`));
    }
    dev.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{ prevDevice=i?'mobile':'desktop'; dev.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('on',j===i)); draw(); });
    lng.querySelectorAll('button').forEach((b,i)=>b.onclick=()=>{ prevLang=i?'en':'nl'; lng.querySelectorAll('button').forEach((x,j)=>x.classList.toggle('on',j===i)); draw(); });
    ed.addEventListener('input',draw);
    grid.appendChild(ed); grid.appendChild(prev); c.appendChild(grid);
    draw();

    // actions
    const acts=window.h('<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"></div>');
    const save=window.h('<button class="btn btn-gold btn-sm">Opslaan</button>'); save.onclick=()=>{ t.subjectNl=ed.querySelector('#t-snl').value; t.subjectEn=ed.querySelector('#t-sen').value; t.bodyNl=ed.querySelector('#t-bnl').value; t.bodyEn=ed.querySelector('#t-ben').value; t.enabled=ed.querySelector('#t-en').checked; A.log('email','Template opgeslagen: '+t.name); A.save(); window.HLA_UI.toast('Opgeslagen'); };
    const test=window.h('<button class="btn btn-ghost btn-sm">Testmail naar mezelf</button>'); test.onclick=()=>window.HLA_UI.toast('Testmail verstuurd naar info@thehealinglounge.nl (vereist e-mailkoppeling).');
    acts.appendChild(save); acts.appendChild(test); c.appendChild(acts);
  }};
})();
