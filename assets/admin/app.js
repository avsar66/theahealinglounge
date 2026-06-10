/* ============================================================
   THE HEALING LOUNGE — Beheer 2.0 · app shell + router + UI kit
   ============================================================ */
(function(){
  const A=window.HLA;

  /* ---------- tiny DOM helper ---------- */
  function el(html){ const t=document.createElement('template'); t.innerHTML=String(html).trim(); return t.content.firstElementChild; }
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  window.h=el; window.esc=esc;

  /* ---------- icons (line SVG) ---------- */
  const I={
    dashboard:'M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z',
    agenda:'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
    boekingen:'M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    klanten:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87',
    behandelingen:'M12 2l2.4 7.4H22l-6 4.5 2.3 7.1L12 16.8 5.7 21l2.3-7.1-6-4.5h7.6z',
    medewerkers:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    ruimtes:'M3 21V8l9-5 9 5v13M3 21h18M9 21v-6h6v6',
    documenten:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6',
    emails:'M4 4h16v16H4zM4 6l8 6 8-6',
    marketing:'M3 11l18-8v18l-7-3M3 11v5a1 1 0 0 0 1 1h3l1 4',
    website:'M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18',
    media:'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6',
    statistieken:'M3 21h18M7 21V9M12 21V4M17 21v-8',
    instellingen:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.4-2.5H9.6L9.2 5a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.5h4.8l.4-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z',
    logboek:'M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  };
  function svg(name){ return `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${I[name]||''}"/></svg>`; }
  window.admIcon=svg;

  /* ---------- nav config ---------- */
  const NAV=[
    {k:'dashboard', label:'Dashboard'},
    {k:'agenda', label:'Agenda'},
    {k:'boekingen', label:'Boekingen'},
    {k:'klanten', label:'Klanten'},
    {sep:true},
    {k:'behandelingen', label:'Behandelingen'},
    {k:'medewerkers', label:'Medewerkers'},
    {k:'ruimtes', label:'Ruimtes'},
    {sep:true},
    {k:'documenten', label:'Documenten'},
    {k:'emails', label:'E-mails'},
    {k:'marketing', label:'Marketing'},
    {sep:true},
    {k:'website', label:'Website'},
    {k:'media', label:'Media'},
    {k:'statistieken', label:'Statistieken'},
    {sep:true},
    {k:'instellingen', label:'Instellingen'},
    {k:'logboek', label:'Logboek'},
  ];
  const BOTTOM=['dashboard','agenda','boekingen','klanten'];

  /* ---------- UI kit: drawer, modal, toast, confirm ---------- */
  const UI={
    drawer(title, bodyEl, footEl){
      closeOverlay();
      const ov=el(`<div class="adm-overlay" id="adm-ov"><div class="adm-drawer"><div class="dr-head"><h2></h2><button class="dr-close" aria-label="Sluiten">×</button></div><div class="dr-body"></div></div></div>`);
      ov.querySelector('h2').textContent=title;
      ov.querySelector('.dr-body').appendChild(bodyEl);
      if(footEl){ const dr=ov.querySelector('.adm-drawer'); dr.appendChild(footEl); footEl.classList.add('dr-foot'); }
      ov.querySelector('.dr-close').onclick=closeOverlay;
      ov.onclick=(e)=>{ if(e.target===ov) closeOverlay(); };
      document.body.appendChild(ov); requestAnimationFrame(()=>ov.classList.add('show'));
      return ov;
    },
    toast(msg){
      let t=el(`<div style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:120;background:var(--espresso);color:var(--cream);padding:13px 22px;border-radius:999px;box-shadow:var(--shadow-lg);font-size:14px;font-weight:600">${esc(msg)}</div>`);
      document.body.appendChild(t); setTimeout(()=>{ t.style.transition='opacity .4s'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, 1900);
    },
    confirm(msg, onYes, yesLabel){
      const ov=el(`<div class="adm-overlay show" style="justify-content:center;align-items:center"><div class="adm-card" style="max-width:400px;margin:20px"><p style="font-size:16px;margin:0 0 20px">${esc(msg)}</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="cf-no">Annuleren</button><button class="btn btn-gold btn-sm" id="cf-yes">${esc(yesLabel||'Bevestigen')}</button></div></div></div>`);
      ov.querySelector('#cf-no').onclick=()=>ov.remove();
      ov.querySelector('#cf-yes').onclick=()=>{ ov.remove(); onYes&&onYes(); };
      document.body.appendChild(ov);
    },
    foot(buttons){ const f=el('<div></div>'); buttons.forEach(b=>f.appendChild(b)); return f; }
  };
  function closeOverlay(){ const o=document.getElementById('adm-ov'); if(o){ o.classList.remove('show'); setTimeout(()=>o.remove(),300); } }
  window.HLA_UI=UI; window.admCloseOverlay=closeOverlay;

  /* ---------- auth ---------- */
  function showLogin(){
    document.getElementById('adm-app').hidden=true;
    const u=A.currentUser();
    const log=el(`<div class="adm-login"><form class="card">
      <img src="${(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png'}" alt="The Healing Lounge" style="width:56px;height:56px;object-fit:contain;display:block;margin:0 auto 14px">
      <h1>The Healing Lounge</h1><p>Beheer 2.0 · inloggen</p>
      <div class="adm-field"><label>E-mail</label><input type="email" value="info@thehealinglounge.nl" autocomplete="username"></div>
      <div class="adm-field"><label>Wachtwoord</label><input type="password" value="demo" autocomplete="current-password"></div>
      <button class="btn btn-gold btn-block" type="submit">Inloggen</button>
      <button class="forgot" type="button">Wachtwoord vergeten?</button>
      <p class="hint">Prototype: log direct in. In productie via beveiligde login met rollen.</p>
    </form></div>`);
    log.querySelector('form').onsubmit=(e)=>{ e.preventDefault(); log.remove(); A.log('login','Ingelogd.'); boot(); };
    log.querySelector('.forgot').onclick=()=>UI.toast('In productie ontvang je een herstel-link per e-mail.');
    document.body.appendChild(log);
  }

  /* ---------- shell ---------- */
  function boot(){
    const app=document.getElementById('adm-app'); app.hidden=false; app.innerHTML='';
    const u=A.currentUser();
    const navHtml=NAV.map(n=> n.sep?'<div class="sep"></div>':`<a data-route="${n.k}">${svg(n.k)}<span>${n.label}</span></a>`).join('');
    const shell=el(`<div class="adm-shell">
      <aside class="adm-side" id="adm-side">
        <div class="adm-brand"><img src="${(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png'}" alt="" style="width:30px;height:30px;object-fit:contain"><span><b>Healing Lounge</b><small>Beheer</small></span></div>
        <nav class="adm-nav">${navHtml}</nav>
        <div class="adm-user"><span class="av" style="background:${u.color}">${u.firstName[0]}</span><span class="who"><b>${esc(u.firstName)} ${esc(u.lastName||'')}</b><span>${u.role==='owner'?'Eigenaar':'Medewerker'}</span></span><button class="out" title="Uitloggen">⎋</button></div>
      </aside>
      <main class="adm-main">
        <header class="adm-top"><button class="btn btn-ghost btn-sm adm-burger" id="adm-burger">☰</button><h1 id="adm-title">Dashboard</h1></header>
        <div class="adm-content" id="adm-content"></div>
      </main>
      <nav class="adm-bottom">${BOTTOM.map(k=>`<a data-route="${k}">${svg(k)}<span>${NAV.find(n=>n.k===k).label}</span></a>`).join('')}</nav>
    </div>`);
    app.appendChild(shell);
    shell.querySelectorAll('[data-route]').forEach(a=>a.onclick=(e)=>{ e.preventDefault(); location.hash='#/'+a.dataset.route; closeSide(); });
    shell.querySelector('.out').onclick=()=>{ A.log('logout','Uitgelogd.'); app.hidden=true; showLogin(); };
    shell.querySelector('#adm-burger').onclick=()=>document.getElementById('adm-side').classList.toggle('open');
    window.addEventListener('hashchange', route);
    window.addEventListener('hla-change', ()=>{ /* re-render current */ route(); });
    if(!location.hash) location.hash='#/dashboard';
    route();
  }
  function closeSide(){ const s=document.getElementById('adm-side'); if(s) s.classList.remove('open'); }

  function route(){
    const key=(location.hash.replace('#/','')||'dashboard');
    const view=(window.ADMIN_VIEWS||{})[key];
    document.querySelectorAll('.adm-nav [data-route], .adm-bottom [data-route]').forEach(a=>a.classList.toggle('on', a.dataset.route===key));
    const navItem=NAV.find(n=>n.k===key);
    const title=document.getElementById('adm-title'); if(title) title.textContent=navItem?navItem.label:'Beheer';
    const c=document.getElementById('adm-content'); if(!c) return; c.innerHTML='';
    if(view){ try{ view.render(c); }catch(err){ c.appendChild(el(`<div class="empty"><span class="ic">⚠</span>Er ging iets mis bij het laden van dit scherm.<br><small class="faint">${esc(err.message)}</small></div>`)); console.error(err);} }
    else { c.appendChild(el(`<div class="empty"><span class="ic">◔</span><b>${navItem?navItem.label:''}</b><br>Dit onderdeel komt in een volgende fase.</div>`)); }
    document.getElementById('adm-content').scrollTop=0;
  }

  /* ---------- boot on load ---------- */
  window.ADMIN_BOOT=function(){ showLogin(); };
})();
