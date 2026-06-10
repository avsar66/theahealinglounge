/* Beheer 2.0 · Instellingen, Logboek, Marketing */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};

  /* ---------- Instellingen ---------- */
  window.ADMIN_VIEWS.instellingen={ render(c){
    const A=window.HLA, d=A.get(), s=d.settings;
    const card=(title,inner)=>{ const el=window.h(`<div class="adm-card" style="margin-bottom:16px"><h3>${title}</h3><div style="margin-top:14px"></div></div>`); el.lastChild.appendChild(inner); return el; };

    const comp=window.h(`<div>
      <div class="field-row"><div class="adm-field"><label>Naam</label><input id="s-name" value="${esc(s.company.name)}"></div><div class="adm-field"><label>KVK</label><input id="s-kvk" value="${esc(s.company.kvk)}"></div></div>
      <div class="field-row"><div class="adm-field"><label>Adres</label><input id="s-street" value="${esc(s.company.street)}"></div><div class="adm-field"><label>Plaats</label><input id="s-city" value="${esc(s.company.zip+' '+s.company.city)}"></div></div>
      <div class="field-row"><div class="adm-field"><label>Telefoon</label><input id="s-phone" value="${esc(s.company.phone)}"></div><div class="adm-field"><label>E-mail</label><input id="s-mail" value="${esc(s.company.email)}"></div></div>
    </div>`);
    c.appendChild(card('Bedrijfsgegevens <span class="faint" style="font-weight:400;font-size:12px">· voeden footer, contact en JSON-LD</span>', comp));

    const hours=window.h('<div style="display:flex;flex-direction:column;gap:8px"></div>');
    [['1','Maandag'],['2','Dinsdag'],['3','Woensdag'],['4','Donderdag'],['5','Vrijdag'],['6','Zaterdag'],['0','Zondag']].forEach(([n,lbl])=>{ const r=(s.hours[n]||[]); const v=r.length?r[0].join('-'):''; hours.appendChild(window.h(`<div style="display:flex;align-items:center;gap:12px"><b style="width:100px">${lbl}</b><input data-day="${n}" value="${v}" placeholder="gesloten" style="flex:1;padding:9px 12px;border:1px solid var(--adm-line);border-radius:8px;font-family:ui-monospace,monospace;font-size:13px"></div>`)); });
    c.appendChild(card('Openingstijden', hours));

    const policy=window.h(`<div class="field-row">
      <div class="adm-field"><label>Wijzig-/annuleringstermijn (uren vooraf)</label><input id="s-cancel" type="number" value="${s.cancelHours}"></div>
      <div class="adm-field"><label>Standaard buffertijd (min)</label><input id="s-buffer" type="number" value="${s.defaultBuffer}"></div>
    </div>`);
    c.appendChild(card('Boekingsregels', policy));

    const mails=window.h(`<div>
      <div class="field-row"><div class="adm-field"><label>Ochtendmail tijdstip</label><input id="s-mmtime" value="${esc(s.morningMail.time)}"></div><div class="adm-field"><label>Ochtendmail ontvangers</label><input id="s-mmto" value="${esc(s.morningMail.recipients.join(', '))}"></div></div>
      <label style="display:flex;gap:12px;align-items:center;margin:6px 0"><span class="sw"><input type="checkbox" id="s-rem" ${s.reminder.enabled?'checked':''}><span class="tr"></span></span><span>Herinneringsmail 24 uur vooraf</span></label>
      <label style="display:flex;gap:12px;align-items:center"><span class="sw"><input type="checkbox" id="s-rev" ${s.review.enabled?'checked':''}><span class="tr"></span></span><span>Review-verzoek na afloop</span></label>
    </div>`);
    c.appendChild(card('E-mails', mails));

    const save=window.h('<button class="btn btn-gold">Instellingen opslaan</button>');
    save.onclick=()=>{ s.company.name=comp.querySelector('#s-name').value; s.company.kvk=comp.querySelector('#s-kvk').value; s.company.street=comp.querySelector('#s-street').value; const cityv=comp.querySelector('#s-city').value.trim(); s.company.city=cityv.replace(/^\S+\s\S+\s/,'')||cityv; s.company.phone=comp.querySelector('#s-phone').value; s.company.email=comp.querySelector('#s-mail').value;
      hours.querySelectorAll('[data-day]').forEach(i=>{ const v=i.value.trim(); s.hours[i.dataset.day]= v?[v.split('-').map(x=>x.trim())]:[]; });
      s.cancelHours=+policy.querySelector('#s-cancel').value||24; s.defaultBuffer=+policy.querySelector('#s-buffer').value||15;
      s.morningMail.time=mails.querySelector('#s-mmtime').value; s.morningMail.recipients=mails.querySelector('#s-mmto').value.split(',').map(x=>x.trim()).filter(Boolean);
      s.reminder.enabled=mails.querySelector('#s-rem').checked; s.review.enabled=mails.querySelector('#s-rev').checked;
      A.log('settings','Instellingen bijgewerkt.'); A.save(); window.HLA_UI.toast('Opgeslagen'); };
    c.appendChild(save);

    const danger=window.h('<div class="adm-card" style="margin-top:24px;border-color:var(--rood)"><h3 class="bad">Prototype-data</h3><p class="muted" style="font-size:13.5px;margin:8px 0 14px">Zet alle beheer-data terug naar de oorspronkelijke export en catalogus.</p></div>');
    const reset=window.h('<button class="btn btn-ghost btn-sm" style="color:var(--rood)">Alles resetten</button>'); reset.onclick=()=>window.HLA_UI.confirm('Alle wijzigingen ongedaan maken?',()=>{ A.reset(); window.HLA_UI.toast('Gereset'); location.hash='#/dashboard'; },'Resetten'); danger.appendChild(reset); c.appendChild(danger);
  }};

  /* ---------- Logboek ---------- */
  window.ADMIN_VIEWS.logboek={ render(c){
    const A=window.HLA, d=A.get(); let type='all';
    const types=[...new Set(d.log.map(l=>l.type))];
    const bar=window.h('<div class="adm-toolbar"></div>');
    const sel=window.h(`<select style="padding:9px 14px;border:1px solid var(--adm-line);border-radius:8px"><option value="all">Alle handelingen</option>${types.map(t=>`<option value="${t}">${t}</option>`).join('')}</select>`); bar.appendChild(sel); c.appendChild(bar);
    const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Wanneer</th><th>Type</th><th>Handeling</th><th>Door</th></tr></thead><tbody></tbody></table>'); const tb=tbl.querySelector('tbody'); c.appendChild(tbl);
    function draw(){ tb.innerHTML=''; d.log.filter(l=>type==='all'||l.type===type).forEach(l=>tb.appendChild(window.h(`<tr style="cursor:default"><td data-label="Wanneer" class="faint mono">${new Date(l.ts).toLocaleString('nl-NL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td><td data-label="Type"><span class="badge neutral">${esc(l.type)}</span></td><td data-label="Handeling">${esc(l.msg)}</td><td data-label="Door" class="muted">${esc(l.user)}</td></tr>`))); }
    sel.onchange=()=>{ type=sel.value; draw(); }; draw();
  }};

  /* ---------- Marketing ---------- */
  window.ADMIN_VIEWS.marketing={ render(c){
    const A=window.HLA, d=A.get();
    const on=d.customers.filter(c=>c.marketing&&!c.blocked);
    c.appendChild(window.h(`<div class="adm-cards cols-3" style="margin-bottom:16px">
      <div class="adm-card stat"><div class="n">${on.length}</div><div class="l">Op de marketinglijst</div></div>
      <div class="adm-card stat"><div class="n">${d.customers.filter(c=>!c.marketing).length}</div><div class="l">Afgemeld</div></div>
      <div class="adm-card stat"><div class="n">${d.campaigns?d.campaigns.length:0}</div><div class="l">Campagnes</div></div>
    </div>`));
    const info=window.h('<div class="adm-card" style="margin-bottom:16px"><h3>Grondslag</h3><p class="muted" style="font-size:13.5px;margin-top:8px">Soft opt-in voor bestaande klanten (eigen, vergelijkbare diensten). Elke mailing bevat een verplichte afmeldlink. Geblokkeerde klanten zijn automatisch uitgesloten.</p></div>');
    const exp=window.h('<button class="btn btn-ghost btn-sm" style="margin-top:6px">Exporteer lijst (CSV)</button>'); exp.onclick=()=>{ const head=['Voornaam','Achternaam','E-mail','Taal','Sinds']; const rows=on.map(c=>[c.firstName,c.lastName,c.email,c.lang,c.marketingSince].map(v=>/[",\n]/.test(v||'')?'"'+String(v).replace(/"/g,'""')+'"':(v||'')).join(',')); const blob=new Blob([head.join(',')+'\n'+rows.join('\n')],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='marketinglijst.csv'; a.click(); }; info.appendChild(exp);
    c.appendChild(info);
    const campaign=window.h('<button class="btn btn-gold btn-sm">+ Nieuwe campagne</button>'); campaign.onclick=()=>openCampaign(on.length); c.appendChild(campaign);

    c.appendChild(window.h('<div class="adm-section-title">Abonnees</div>'));
    const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Naam</th><th>E-mail</th><th>Taal</th><th>Sinds</th><th></th></tr></thead><tbody></tbody></table>'); const tb=tbl.querySelector('tbody');
    on.slice(0,300).sort((a,b)=>(a.firstName+a.lastName).localeCompare(b.firstName+b.lastName)).forEach(c2=>{ const tr=window.h(`<tr style="cursor:default"><td data-label="Naam" class="nm">${esc((c2.firstName+' '+c2.lastName).trim())}</td><td data-label="E-mail" class="mono ${c2.emailValid?'':'bad'}">${esc(c2.email)}</td><td data-label="Taal">${c2.lang.toUpperCase()}</td><td data-label="Sinds" class="muted">${esc(c2.marketingSince||'')}</td><td><button class="btn-mini btn btn-ghost">Afmelden</button></td></tr>`); tr.querySelector('button').onclick=()=>{ const dd=A.get(); const cc=dd.customers.find(x=>x.id===c2.id); cc.marketing=false; A.log('marketing','Afgemeld: '+cc.firstName); A.save(); window.HLA_UI.toast('Afgemeld'); }; tb.appendChild(tr); });
    c.appendChild(tbl);
  }};
  /* ---------- Campagne-editor ---------- */
  function openCampaign(total){
    const A=window.HLA, d=A.get();
    let audience='all';
    const tmpls=[['actie','Actie / aanbieding'],['nieuwsbrief','Nieuwsbrief'],['nieuw','Nieuwe behandeling'],['seizoen','Seizoensgroet'],['lastminute','Last-minute plekken']];
    const body=window.h('<div></div>');
    body.appendChild(window.h(`<div class="adm-field"><label>Soort campagne</label><select id="cp-type">${tmpls.map(t=>`<option value="${t[0]}">${t[1]}</option>`).join('')}</select></div>`));
    body.appendChild(window.h(`<div class="adm-field"><label>Onderwerp</label><input id="cp-subj" value="Een cadeautje voor jou ✨"></div>`));
    body.appendChild(window.h(`<div class="adm-field"><label>Tekst</label><textarea id="cp-body" rows="5">Lieve {voornaam},\n\nOmdat de lente eraan komt, verwennen we je graag. Deze maand 15% korting op al onze honingmassages.\n\nWarme groet,\nThe Healing Lounge</textarea></div>`));
    const aud=window.h('<div class="adm-field"><label>Doelgroep</label></div>');
    const audChips=window.h('<div style="display:flex;gap:8px;flex-wrap:wrap"></div>');
    const counts={all:total, nl:d.customers.filter(c=>c.marketing&&!c.blocked&&c.lang==='nl').length, en:d.customers.filter(c=>c.marketing&&!c.blocked&&c.lang==='en').length};
    [['all','Alle abonnees ('+counts.all+')'],['nl','Nederlandstalig ('+counts.nl+')'],['en','Engelstalig ('+counts.en+')']].forEach(o=>{ const b=window.h(`<button class="chip-toggle ${audience===o[0]?'on':''}">${o[1]}</button>`); b.onclick=()=>{ audience=o[0]; audChips.querySelectorAll('button').forEach((x,i)=>x.classList.toggle('on',['all','nl','en'][i]===audience)); }; audChips.appendChild(b); });
    aud.appendChild(audChips); body.appendChild(aud);
    const prev=window.h('<div style="margin-top:14px"></div>');
    function draw(){ const br=(window.admBranding?window.admBranding(window.HLA):{logoLight:'assets/brand/logo-light.png',emailLogoWidth:200}); const subj=body.querySelector('#cp-subj').value, txt=body.querySelector('#cp-body').value.replace(/\{voornaam\}/g,'Sandra'); prev.innerHTML=''; prev.appendChild(window.h(`<div style="border:1px solid var(--adm-line);border-radius:12px;overflow:hidden"><div style="background:var(--espresso);padding:18px;text-align:center"><img src="${esc(br.logoLight)}" style="width:${(br.emailLogoWidth||200)*0.8}px;max-width:70%;object-fit:contain"></div><div style="padding:20px;background:#fff"><div class="faint" style="font-size:12px;margin-bottom:8px">${esc(subj)}</div><div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${esc(txt)}</div><div style="margin-top:14px"><span style="background:var(--honey);color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600">Boek nu</span></div></div><div style="padding:12px 20px;border-top:1px solid var(--adm-line);font-size:11px;color:var(--ink-soft)">Je ontvangt dit omdat je klant bent. <u>Afmelden</u>.</div></div>`)); }
    body.addEventListener('input',draw); draw(); body.appendChild(prev);

    const send=window.h('<button class="btn btn-gold">Versturen</button>'); const test=window.h('<button class="btn btn-ghost">Testmail</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    test.onclick=()=>window.HLA_UI.toast('Testmail verstuurd.');
    send.onclick=()=>{ const n=counts[audience]; window.HLA_UI.confirm('Je staat op het punt '+n+' klanten te mailen. Doorgaan?',()=>{ const dd=A.get(); if(!dd.campaigns)dd.campaigns=[]; const opened=Math.round(n*0.52), clicked=Math.round(n*0.18), off=Math.round(n*0.01); dd.campaigns.unshift({id:A.uid('cmp'),subject:body.querySelector('#cp-subj').value,audience,sent:n,opened,clicked,off,date:A.todayISO()}); A.log('marketing','Campagne verstuurd naar '+n+' klanten.'); A.save(); window.admCloseOverlay(); resultScreen({sent:n,opened,clicked,off}); },'Versturen'); };
    window.HLA_UI.drawer('Nieuwe campagne', body, window.HLA_UI.foot([cancel,test,send]));
  }
  function resultScreen(r){
    const body=window.h(`<div style="text-align:center;padding:20px 0">
      <div style="font-size:40px">❀</div><h3 style="margin:10px 0">Campagne verstuurd</h3>
      <div class="adm-cards cols-2" style="margin-top:16px;text-align:left">
        <div class="adm-card stat"><div class="n">${r.sent}</div><div class="l">Verzonden</div></div>
        <div class="adm-card stat"><div class="n">${r.opened}</div><div class="l">Geopend</div></div>
        <div class="adm-card stat"><div class="n">${r.clicked}</div><div class="l">Geklikt</div></div>
        <div class="adm-card stat"><div class="n">${r.off}</div><div class="l">Afgemeld</div></div>
      </div>
      <p class="faint" style="font-size:12px;margin-top:14px">Open- en klikcijfers zijn een indicatie; echte meting volgt met de e-mailkoppeling.</p>
    </div>`);
    const close=window.h('<button class="btn btn-gold">Sluiten</button>'); close.onclick=window.admCloseOverlay;
    window.HLA_UI.drawer('Resultaat', body, window.HLA_UI.foot([close]));
  }
})();
