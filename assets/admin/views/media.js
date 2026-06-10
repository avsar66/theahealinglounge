/* Beheer 2.0 · Media & huisstijl (logo's) */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  function branding(A){ const d=A.get(); if(!d.settings.branding){ d.settings.branding={logo:(window.HL_LOGOS&&window.HL_LOGOS.logo)||'assets/brand/logo.png',logoLight:(window.HL_LOGOS&&window.HL_LOGOS.logoLight)||'assets/brand/logo-light.png',icon:(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png',emailLogoWidth:200}; A.save(); } return d.settings.branding; }
  window.admBranding=branding;
  function seedMedia(A){ const d=A.get(); if(d.media&&d.media.length) return; d.media=[
    {id:'m-logo',name:'Logo (volledig)',src:(window.HL_LOGOS&&window.HL_LOGOS.logo)||'assets/brand/logo.png',used:'Website, mails',w:528,h:188},
    {id:'m-logolight',name:'Logo (licht, voor donkere achtergrond)',src:(window.HL_LOGOS&&window.HL_LOGOS.logoLight)||'assets/brand/logo-light.png',used:'Mails, marketing',w:546,h:194},
    {id:'m-icon',name:'Beeldmerk',src:(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png',used:'Favicon, header',w:512,h:512},
  ]; A.save(); }

  function readFileAsDataURL(file, cb){ const r=new FileReader(); r.onload=()=>cb(r.result); r.readAsDataURL(file); }

  window.ADMIN_VIEWS.media={ render(c){
    const A=window.HLA, d=A.get(); const br=branding(A); seedMedia(A);

    /* ---- Huisstijl / logo ---- */
    c.appendChild(window.h('<div class="adm-section-title">Huisstijl &amp; logo</div>'));
    const wrap=window.h('<div class="adm-cards cols-2" style="align-items:start"></div>');

    // logo manager
    const man=window.h('<div class="adm-card"></div>');
    man.appendChild(window.h('<h3>Logo\'s</h3><p class="sub" style="margin-bottom:14px">Upload of vervang je logo. Wordt automatisch gebruikt in de website, mails en marketing.</p>'));
    function logoRow(key,label,dark){
      const row=window.h(`<div style="display:flex;align-items:center;gap:14px;padding:12px;border:1px solid var(--adm-line);border-radius:10px;margin-bottom:10px;background:${dark?'var(--espresso)':'var(--adm-bg)'}">
        <img src="${esc(br[key])}" style="height:42px;max-width:160px;object-fit:contain">
        <div style="flex:1"><b style="font-size:13.5px;color:${dark?'var(--cream)':'var(--ink)'}">${label}</b></div>
        <button class="btn btn-ghost btn-sm" style="${dark?'color:var(--cream);border-color:rgba(243,236,222,.4)':''}">Vervangen</button>
        <input type="file" accept="image/*" hidden>
      </div>`);
      const inp=row.querySelector('input'), btn=row.querySelector('button');
      btn.onclick=()=>inp.click();
      inp.onchange=(e)=>{ const f=e.target.files[0]; if(!f)return; readFileAsDataURL(f,(url)=>{ br[key]=url; A.log('branding','Logo bijgewerkt: '+label); A.save(); window.ADMIN_VIEWS.media.render(c); window.HLA_UI.toast('Logo bijgewerkt'); }); };
      return row;
    }
    man.appendChild(logoRow('logo','Hoofdlogo (donkere tekst)',false));
    man.appendChild(logoRow('logoLight','Logo voor donkere achtergrond',true));
    man.appendChild(logoRow('icon','Beeldmerk',false));
    wrap.appendChild(man);

    // email logo size + preview
    const sizeCard=window.h('<div class="adm-card"></div>');
    sizeCard.appendChild(window.h('<h3>Logo in e-mails &amp; marketing</h3><p class="sub" style="margin-bottom:14px">Stel de grootte in. Dit logo verschijnt bovenaan elke mail en mailing.</p>'));
    const slider=window.h(`<div class="adm-field"><label>Logobreedte: <b id="lw-val">${br.emailLogoWidth}px</b></label><input type="range" id="lw" min="120" max="320" value="${br.emailLogoWidth}" style="width:100%"></div>`);
    sizeCard.appendChild(slider);
    const mailprev=window.h('<div></div>'); sizeCard.appendChild(mailprev);
    function drawPrev(w){ mailprev.innerHTML=''; mailprev.appendChild(window.h(`<div style="border:1px solid var(--adm-line);border-radius:12px;overflow:hidden"><div style="background:var(--espresso);padding:22px;text-align:center"><img src="${esc(br.logoLight)}" style="width:${w}px;max-width:80%;object-fit:contain"></div><div style="padding:18px;background:#fff;font-size:13px;color:var(--ink)">Lieve Sandra, wat fijn dat je komt…</div></div>`)); }
    drawPrev(br.emailLogoWidth);
    slider.querySelector('#lw').oninput=(e)=>{ slider.querySelector('#lw-val').textContent=e.target.value+'px'; drawPrev(+e.target.value); };
    slider.querySelector('#lw').onchange=(e)=>{ br.emailLogoWidth=+e.target.value; A.log('branding','E-maillogo grootte: '+br.emailLogoWidth+'px'); A.save(); window.HLA_UI.toast('Opgeslagen'); };
    wrap.appendChild(sizeCard);
    c.appendChild(wrap);

    /* ---- Mediabibliotheek ---- */
    const head=window.h('<div class="adm-toolbar" style="margin-top:8px"><div class="adm-section-title" style="margin:0;flex:1">Mediabibliotheek</div></div>');
    const up=window.h('<button class="btn btn-gold btn-sm">+ Afbeelding uploaden</button>'); const upInp=window.h('<input type="file" accept="image/*" hidden>');
    up.onclick=()=>upInp.click(); upInp.onchange=(e)=>{ const f=e.target.files[0]; if(!f)return; readFileAsDataURL(f,(url)=>{ const img=new Image(); img.onload=()=>{ d.media.unshift({id:A.uid('m'),name:f.name,src:url,used:'—',w:img.width,h:img.height}); A.log('media','Afbeelding geüpload: '+f.name); A.save(); window.ADMIN_VIEWS.media.render(c); }; img.src=url; }); };
    head.appendChild(up); head.appendChild(upInp); c.appendChild(head);

    const grid=window.h('<div class="adm-cards cols-4"></div>');
    d.media.forEach(m=>{ const card=window.h(`<div class="adm-card" style="padding:0;overflow:hidden;cursor:pointer"><div style="height:120px;background:var(--adm-bg) repeating-linear-gradient(45deg,rgba(0,0,0,.02) 0 10px,transparent 10px 20px);display:grid;place-items:center"><img src="${esc(m.src)}" style="max-height:90px;max-width:85%;object-fit:contain"></div><div style="padding:12px 14px"><b style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</b><span class="faint" style="font-size:11px">${m.w}×${m.h} · ${esc(m.used)}</span></div></div>`);
      card.onclick=()=>enlarge(m); grid.appendChild(card); });
    c.appendChild(grid);
  }};

  function enlarge(m){
    const A=window.HLA;
    const body=window.h(`<div style="text-align:center"><div style="background:var(--adm-bg);border-radius:12px;padding:24px;margin-bottom:14px"><img src="${esc(m.src)}" style="max-width:100%;max-height:340px;object-fit:contain"></div><div class="adm-field"><label>Naam</label><input id="md-name" value="${esc(m.name)}"></div><div class="muted" style="font-size:13px">Origineel: ${m.w}×${m.h}px · gebruikt in: ${esc(m.used)}</div></div>`);
    const save=window.h('<button class="btn btn-gold">Opslaan</button>'); const close=window.h('<button class="btn btn-ghost">Sluiten</button>'); close.onclick=window.admCloseOverlay;
    const del=window.h('<button class="btn btn-ghost" style="margin-right:auto;color:var(--rood)">Verwijderen</button>');
    del.onclick=()=>window.HLA_UI.confirm('Afbeelding verwijderen?',()=>{ const d=A.get(); d.media=d.media.filter(x=>x.id!==m.id); A.save(); window.admCloseOverlay(); window.ADMIN_VIEWS.media.render(document.getElementById('adm-content')); },'Verwijderen');
    save.onclick=()=>{ const d=A.get(); const mm=d.media.find(x=>x.id===m.id); mm.name=body.querySelector('#md-name').value; A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen'); window.ADMIN_VIEWS.media.render(document.getElementById('adm-content')); };
    window.HLA_UI.drawer('Afbeelding', body, window.HLA_UI.foot([del,close,save]));
  }
})();
