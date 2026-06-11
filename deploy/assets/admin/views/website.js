/* Beheer 2.0 · Website (CMS) */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  function seed(A){ const d=A.get(); if(d.pages&&d.pages.home) return; d.pages={
    home:{titleNl:'Rust voor lichaam en geest.',titleEn:'Rest for body and mind.',introNl:'Een luxe zonnestudio en wellnesssalon in het hart van Leusden.',introEn:'A luxury tanning studio and wellness salon in the heart of Leusden.',seoTitle:'The Healing Lounge — Wellness & Zonnestudio · Leusden',seoDesc:'Luxe wellness & zonnestudio in Leusden.',sections:[{id:'hero',label:'Hero',on:true},{id:'manifesto',label:'Manifest',on:true},{id:'featured',label:'Uitgelichte behandelingen',on:true},{id:'rood',label:'Rood licht band',on:true},{id:'quiz',label:'Quiz-uitnodiging',on:true},{id:'pillars',label:'Pijlers',on:true},{id:'review',label:'Review',on:true}]},
    about:{titleNl:'Over ons',titleEn:'About us',introNl:'Maak kennis met Chantal en Maaike.',introEn:'Meet Chantal and Maaike.',seoTitle:'Over ons — The Healing Lounge · Leusden',seoDesc:'Maak kennis met The Healing Lounge in Leusden.',sections:[{id:'story',label:'Verhaal',on:true},{id:'team',label:'Team (uit Medewerkers)',on:true}]},
    contact:{titleNl:'Contact',titleEn:'Contact',introNl:'Bezoek ons aan De Brouwerij 4 in Leusden.',introEn:'Visit us at De Brouwerij 4 in Leusden.',seoTitle:'Contact — The Healing Lounge · Leusden',seoDesc:'Adres, openingstijden en contact.',sections:[{id:'info',label:'Contactgegevens',on:true},{id:'map',label:'Kaart',on:true},{id:'hours',label:'Openingstijden',on:true}]},
  }; A.save(); }
  let cur='home';

  window.ADMIN_VIEWS.website={ render(c){
    const A=window.HLA; seed(A); const d=A.get(); const p=d.pages[cur];
    const chips=window.h('<div class="adm-toolbar"></div>');
    [['home','Home'],['about','Over ons'],['contact','Contact']].forEach(x=>{ const b=window.h(`<button class="chip-toggle ${cur===x[0]?'on':''}">${x[1]}</button>`); b.onclick=()=>{ cur=x[0]; window.ADMIN_VIEWS.website.render(c); }; chips.appendChild(b); });
    const sp=window.h('<div style="flex:1"></div>'); chips.appendChild(sp);
    // missing EN counter
    let miss=0; Object.values(d.pages).forEach(pg=>{ if(!pg.titleEn)miss++; if(!pg.introEn)miss++; });
    chips.appendChild(window.h(`<span class="badge ${miss?'warn':'ok'}">${miss?miss+' EN-vertalingen ontbreken':'Vertalingen compleet'}</span>`));
    c.appendChild(chips);

    const ed=window.h(`<div class="adm-card">
      <div class="bilingual"><div class="adm-field"><label>Titel (NL)</label><input id="p-tnl" value="${esc(p.titleNl)}"></div><div class="adm-field"><label>Titel (EN)</label><input id="p-ten" value="${esc(p.titleEn)}"></div></div>
      <div class="bilingual"><div class="adm-field"><label>Intro (NL)</label><textarea id="p-inl" rows="3">${esc(p.introNl)}</textarea></div><div class="adm-field"><label>Intro (EN)</label><textarea id="p-ien" rows="3">${esc(p.introEn)}</textarea></div></div>
      <div class="adm-section-title">SEO</div>
      <div class="adm-field"><label>SEO-titel</label><input id="p-st" value="${esc(p.seoTitle)}"></div>
      <div class="adm-field"><label>Meta-omschrijving</label><textarea id="p-sd" rows="2">${esc(p.seoDesc)}</textarea></div>
    </div>`);
    c.appendChild(ed);

    c.appendChild(window.h('<div class="adm-section-title">Secties</div>'));
    const secWrap=window.h('<div></div>');
    p.sections.forEach((s,idx)=>{ const row=window.h(`<div class="svc-item"><label class="sw"><input type="checkbox" ${s.on?'checked':''}><span class="tr"></span></label><span class="nm">${esc(s.label)}</span><button class="btn-mini btn btn-ghost" data-up>↑</button></div>`); row.querySelector('input').onchange=(e)=>s.on=e.target.checked; row.querySelector('[data-up]').onclick=()=>{ if(idx>0){ const t=p.sections[idx-1]; p.sections[idx-1]=s; p.sections[idx]=t; window.ADMIN_VIEWS.website.render(c); } }; secWrap.appendChild(row); });
    c.appendChild(secWrap);

    const save=window.h('<button class="btn btn-gold btn-sm" style="margin-top:16px">Pagina opslaan</button>');
    save.onclick=()=>{ p.titleNl=ed.querySelector('#p-tnl').value; p.titleEn=ed.querySelector('#p-ten').value; p.introNl=ed.querySelector('#p-inl').value; p.introEn=ed.querySelector('#p-ien').value; p.seoTitle=ed.querySelector('#p-st').value; p.seoDesc=ed.querySelector('#p-sd').value; A.log('website','Pagina bijgewerkt: '+cur); A.save(); window.HLA_UI.toast('Opgeslagen'); window.ADMIN_VIEWS.website.render(c); };
    c.appendChild(save);
    c.appendChild(window.h('<p class="faint" style="font-size:12px;margin-top:12px">Behandelpagina\'s worden gevoed vanuit Behandelingen, het team-blok vanuit Medewerkers.</p>'));
  }};
})();
