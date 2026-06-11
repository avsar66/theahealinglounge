/* ============================================================
 THE HEALING LOUNGE — gedeelde "overrides" store
 Eén bron van waarheid voor wijzigingen die de SALON zelf maakt
 bovenop de statische catalogus: foto's per behandeling, de
 zonnebank-foto's, en tijdelijke acties/aanbiedingen per behandeling.
 Leeft in localStorage zodat de publieke site én het beheer
 dezelfde gegevens lezen en schrijven.
 ============================================================ */
(function(){
  const KEY = 'hl_overrides_v1';

  /* slug ⇄ id — vaste tabel zodat ook de losse behandelpagina's
     (die treatments.js niet laden) een behandeling kunnen herkennen.
     Waar HL_SLUG wél bestaat (beheer/overzicht) gebruiken we die,
     zodat toekomstige behandelingen vanzelf meedoen. */
  const FALLBACK_SLUG = {
    'royal-face':'holistic-royal-face','holi-facial':'holi-facial','anti-age':'anti-age',
    'buccal-facial':'buccal-facial','cupping-facial':'cupping-facial','golden-facial':'golden-facial',
    'honey-lift':'honey-lift-facial','full-body-reset':'full-body-reset','trans-cupping':'transformational-cupping',
    'honing-buik':'honing-bindweefselmassage-buik','honing-cellulite':'honing-bindweefselmassage-cellulite',
    'honing-rug':'honing-bindweefselmassage-rug','magnesium':'magnesiumpakking','artreum':'de-artreum',
    'kundalini':'kundalini-shakti-flow','honing-achterkant':'honingmassage-achterkant-lichaam',
    'honing-wellness':'honing-wellness-massage','oligo':'oligo-therapie','darm':'darm-therapie',
    'rood-licht':'rood-licht-therapie','breathwork':'breathwork','zonnestudio':'zonnestudio'
  };
  function slugForId(id){ if(window.HL_SLUG && window.HL_SLUG[id]) return window.HL_SLUG[id]; return FALLBACK_SLUG[id] || id; }
  function idForSlug(slug){
    if(window.HL_SLUG){ for(const id in window.HL_SLUG){ if(window.HL_SLUG[id]===slug) return id; } }
    for(const id in FALLBACK_SLUG){ if(FALLBACK_SLUG[id]===slug) return id; }
    return slug; // assume slug already == id
  }

  /* ---------------- store ---------------- */
  function blank(){ return { photos:{ byId:{}, beds:[] }, promos:{ byId:{} } }; }
  let data = load();
  function load(){
    try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.photos&&s.promos) return s; }catch(e){}
    return blank();
  }
  function save(){
    try{ localStorage.setItem(KEY, JSON.stringify(data)); }
    catch(e){ console.warn('Overrides niet opgeslagen (opslag vol?)', e); alert('De opslag zit vol. Verwijder een paar foto\u2019s of gebruik kleinere afbeeldingen.'); return false; }
    window.dispatchEvent(new CustomEvent('hl-overrides-change'));
    return true;
  }
  // cross-tab sync
  window.addEventListener('storage', e=>{ if(e.key===KEY){ data=load(); window.dispatchEvent(new CustomEvent('hl-overrides-change')); } });

  /* ---------------- photos ---------------- */
  const photos = {
    get(id){ return (data.photos.byId[id]||[]).slice(); },
    has(id){ return !!(data.photos.byId[id] && data.photos.byId[id].length); },
    set(id, arr){ data.photos.byId[id]=arr.slice(); return save(); },
    add(id, url){ const a=data.photos.byId[id]||(data.photos.byId[id]=[]); a.push(url); return save(); },
    removeAt(id, i){ const a=data.photos.byId[id]; if(!a) return; a.splice(i,1); if(!a.length) delete data.photos.byId[id]; return save(); },
    move(id, i, dir){ const a=data.photos.byId[id]; if(!a) return; const j=i+dir; if(j<0||j>=a.length) return; const t=a[i]; a[i]=a[j]; a[j]=t; return save(); },
    makeCover(id, i){ const a=data.photos.byId[id]; if(!a||i<=0) return; const [it]=a.splice(i,1); a.unshift(it); return save(); },
    cover(id){ const a=data.photos.byId[id]; return a&&a.length?a[0]:null; }
  };
  const beds = {
    get(){ return (data.photos.beds||[]).slice(); },
    at(i){ return (data.photos.beds||[])[i]||null; },
    set(i, url){ const b=data.photos.beds||(data.photos.beds=[]); b[i]=url; return save(); },
    removeAt(i){ const b=data.photos.beds; if(!b) return; b[i]=null; return save(); }
  };

  /* ---------------- promos ---------------- */
  // promo: { on, type:'percent'|'amount'|'none', value, labelNl, labelEn, startISO, endISO }
  const promos = {
    get(id){ return data.promos.byId[id] || null; },
    set(id, p){ if(!p){ delete data.promos.byId[id]; } else { data.promos.byId[id]=p; } return save(); },
    all(){ return Object.assign({}, data.promos.byId); },
    isLive(id, ref){
      const p=data.promos.byId[id]; if(!p||!p.on) return false;
      const today = (ref||new Date()).toISOString().slice(0,10);
      if(p.startISO && today < p.startISO) return false;
      if(p.endISO && today > p.endISO) return false;
      return true;
    },
    // future = aan, maar startdatum ligt nog voor ons
    isScheduled(id, ref){
      const p=data.promos.byId[id]; if(!p||!p.on||!p.startISO) return false;
      const today=(ref||new Date()).toISOString().slice(0,10);
      return today < p.startISO;
    },
    label(id, lang){ const p=data.promos.byId[id]; if(!p) return ''; const nl=p.labelNl||'Actie', en=p.labelEn||'Sale'; return (lang==='en')?en:nl; },
    // bereken nieuwe prijs op basis van een basisprijs
    compute(id, basePrice){
      const p=data.promos.byId[id];
      if(!p) return { hasPrice:false, oldPrice:basePrice, newPrice:basePrice, pct:0 };
      let np=basePrice;
      if(p.type==='percent'){ np = Math.round(basePrice*(1 - (p.value||0)/100)); }
      else if(p.type==='amount'){ np = Math.max(0, basePrice - (p.value||0)); }
      const hasPrice = (p.type==='percent'||p.type==='amount') && np<basePrice;
      const pct = basePrice>0 ? Math.round((1-np/basePrice)*100) : 0;
      return { hasPrice, oldPrice:basePrice, newPrice:np, pct };
    },
    liveIds(ref){ return Object.keys(data.promos.byId).filter(id=>promos.isLive(id, ref)); }
  };

  /* ---------------- image helper ---------------- */
  function downscaleImage(file, maxDim){
    maxDim = maxDim || 1500;
    return new Promise((resolve,reject)=>{
      const r=new FileReader();
      r.onerror=reject;
      r.onload=()=>{
        const img=new Image();
        img.onerror=reject;
        img.onload=()=>{
          let w=img.width, h=img.height;
          const scale=Math.min(1, maxDim/Math.max(w,h));
          w=Math.round(w*scale); h=Math.round(h*scale);
          const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
          cv.getContext('2d').drawImage(img,0,0,w,h);
          try{ resolve(cv.toDataURL('image/jpeg', 0.82)); }catch(e){ resolve(r.result); }
        };
        img.src=r.result;
      };
      r.readAsDataURL(file);
    });
  }

  window.HLOverrides = { KEY, photos, beds, promos, downscaleImage, slugForId, idForSlug,
    reset(){ data=blank(); save(); } };
})();
