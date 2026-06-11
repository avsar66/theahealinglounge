/* Beheer 2.0 · Documenten & ondertekeningen */
(function(){
  window.ADMIN_VIEWS=window.ADMIN_VIEWS||{};
  const U=window.admUtil;

  function seedDocs(A){ const d=A.get(); if(d.documents&&d.documents.length) return; const today=A.todayISO();
    d.documents=[
      {id:'doc-contra', nameNl:'Contra-indicaties', nameEn:'Contraindications', scope:'Cupping & honingmassages', versions:[{v:'1.2', date:'2025-10-16', nl:'Wij behandelen niet bij o.a. zwangerschap, borstvoeding, kanker, trombose, bloedstollingsproblemen, honingallergie en onder 18 jaar. Bij twijfel eerst overleg met je arts.', en:'We do not treat in case of pregnancy, breastfeeding, cancer, thrombosis, blood clotting disorders, honey allergy and under 18. When in doubt, consult your doctor first.'}]},
      {id:'doc-aandacht', nameNl:'Specifieke aandachtspunten', nameEn:'Specific guidelines', scope:'Per behandeling', versions:[{v:'1.0', date:'2025-10-16', nl:'Niet scheren of waxen 24 uur vooraf. Vermijd zon en zonnebank 24 uur na afloop. Drink voldoende water.', en:'Do not shave or wax 24 hours before. Avoid sun and sunbed for 24 hours after. Drink plenty of water.'}]},
      {id:'doc-voorwaarden', nameNl:'Algemene voorwaarden', nameEn:'Terms and conditions', scope:'Alle behandelingen', versions:[{v:'1.1', date:'2025-08-12', nl:'Betaling ter plekke. Annuleren tot 24 uur vooraf kosteloos, no-show wordt volledig in rekening gebracht.', en:'Payment on site. Free cancellation up to 24 hours before, no-show charged in full.'}]},
      {id:'doc-privacy', nameNl:'Privacyverklaring', nameEn:'Privacy policy', scope:'Website', versions:[{v:'1.0', date:'2025-08-12', nl:'Wij verwerken je gegevens uitsluitend voor behandelingen, contact, facturatie en wettelijke verplichtingen. Bewaartermijn maximaal 1 jaar.', en:'We process your data only for treatments, contact, invoicing and legal obligations. Retention max 1 year.'}]},
    ];
    A.save();
  }

  window.ADMIN_VIEWS.documenten={ render(c){
    const A=window.HLA; seedDocs(A); const d=A.get();
    c.appendChild(window.h('<div class="adm-section-title">Documenten</div>'));
    const grid=window.h('<div class="adm-cards cols-2"></div>');
    d.documents.forEach(doc=>{ const cur=doc.versions[0];
      const card=window.h(`<div class="adm-card" style="cursor:pointer"><div style="display:flex;align-items:center;gap:10px"><b style="flex:1;font-size:17px">${esc(doc.nameNl)}</b><span class="badge gold">v${cur.v}</span></div><div class="muted" style="font-size:13px;margin:6px 0">${esc(doc.scope)} · bijgewerkt ${esc(cur.date)}</div><div class="faint" style="font-size:13px">${doc.versions.length} versie(s)</div></div>`);
      card.onclick=()=>editDoc(doc.id); grid.appendChild(card);
    });
    c.appendChild(grid);

    c.appendChild(window.h('<div class="adm-section-title">Ondertekeningen-archief</div>'));
    const sigs=d.appointments.map(a=>({...a,_d:U.parse(a.start)})).filter(a=>/cupping|bindweefsel/i.test(a.service)).sort((a,b)=>(b._d||0)-(a._d||0));
    if(!sigs.length){ c.appendChild(window.h('<div class="empty"><span class="ic">✎</span>Nog geen ondertekeningen.</div>')); return; }
    const tbl=window.h('<table class="adm-table responsive"><thead><tr><th>Klant</th><th>Document</th><th>Behandeling</th><th>Datum</th><th></th></tr></thead><tbody></tbody></table>'); const tb=tbl.querySelector('tbody');
    sigs.forEach(a=>{ const tr=window.h(`<tr style="cursor:default"><td data-label="Klant" class="nm">${esc(a.customerName)}</td><td data-label="Document">Contra-indicaties v1.2 · NL</td><td data-label="Behandeling">${esc(a.service)}</td><td data-label="Datum" class="muted">${esc(a.start)}</td><td><button class="btn-mini btn btn-ghost">PDF</button></td></tr>`); tr.querySelector('button').onclick=()=>window.HLA_UI.toast('PDF-weergave wordt gegenereerd (vereist opslagkoppeling).'); tb.appendChild(tr); });
    c.appendChild(tbl);
  }};

  function editDoc(id){
    const A=window.HLA, d=A.get(); const doc=d.documents.find(x=>x.id===id); const cur=doc.versions[0];
    const body=window.h(`<div>
      <div class="adm-field"><label>Naam (NL / EN)</label><div class="bilingual"><input id="dn-nl" value="${esc(doc.nameNl)}"><input id="dn-en" value="${esc(doc.nameEn)}"></div></div>
      <div class="adm-field"><label>Van toepassing op</label><input id="dn-scope" value="${esc(doc.scope)}"></div>
      <div class="adm-section-title">Inhoud · v${cur.v}</div>
      <div class="bilingual"><div class="adm-field"><label>Nederlands</label><textarea id="dc-nl" rows="6">${esc(cur.nl)}</textarea></div><div class="adm-field"><label>English</label><textarea id="dc-en" rows="6">${esc(cur.en)}</textarea></div></div>
      <div class="adm-section-title">Versiehistorie</div>
      <div>${doc.versions.map(v=>`<div style="display:flex;gap:12px;padding:8px 0;border-top:1px solid var(--adm-line);font-size:13.5px"><b class="mono">v${v.v}</b><span class="faint">${esc(v.date)}</span></div>`).join('')}</div>
    </div>`);
    const save=window.h('<button class="btn btn-gold">Opslaan als nieuwe versie</button>'); const cancel=window.h('<button class="btn btn-ghost">Annuleren</button>'); cancel.onclick=window.admCloseOverlay;
    save.onclick=()=>{ doc.nameNl=body.querySelector('#dn-nl').value; doc.nameEn=body.querySelector('#dn-en').value; doc.scope=body.querySelector('#dn-scope').value;
      const nl=body.querySelector('#dc-nl').value, en=body.querySelector('#dc-en').value;
      if(nl!==cur.nl||en!==cur.en){ const nv=(parseFloat(cur.v)+0.1).toFixed(1); doc.versions.unshift({v:nv,date:A.todayISO(),nl,en}); A.log('document','Nieuwe versie '+doc.nameNl+' v'+nv); }
      else A.log('document','Document bijgewerkt: '+doc.nameNl);
      A.save(); window.admCloseOverlay(); window.HLA_UI.toast('Opgeslagen'); };
    window.HLA_UI.drawer(doc.nameNl, body, window.HLA_UI.foot([cancel,save]));
  }
})();
