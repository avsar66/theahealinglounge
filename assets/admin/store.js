/* ============================================================
   THE HEALING LOUNGE — Beheer 2.0 · datastore
   Eén bron van waarheid. Alles is data: medewerkers, ruimtes,
   categorieën en behandelingen zijn beheerbare lijsten. Agenda,
   filters, boekingsflow en e-mails worden hieruit opgebouwd.
   Draait nu op localStorage (prototype). Seed uit de bestaande
   catalogus (treatments.js) en dataset (data/seed.js).
   ============================================================ */
(function(){
  const KEY='hl_admin_v1';

  function uid(p){ return (p||'id')+'-'+Math.random().toString(36).slice(2,8); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  // ---------- seed ----------
  function seed(){
    const CATS=(window.HL_CATS||[]).filter(c=>c.id!=='all').map((c,i)=>({id:c.id, nl:c.nl, en:c.en, order:i}));
    const roomMap={behandel:'r-behandel', rood:'r-rood', zon:'r-zon'};
    const rooms=[
      {id:'r-behandel', nl:'Behandelruimte', en:'Treatment Room', type:'staff', capacity:1, buffer:15, color:'#BC813A', hours:'salon', slot:{duration:30,start:null}, active:true},
      {id:'r-rood', nl:'Rode Licht Ruimte', en:'Red Light Room', type:'self', capacity:1, buffer:0, color:'#B0543F', hours:'salon', slot:{duration:20,start:null}, active:true},
      {id:'r-zon', nl:'Zonnestudio', en:'Tanning Studio', type:'self', capacity:5, buffer:0, color:'#D7B877', hours:'salon', slot:{duration:12,start:null}, active:true},
    ];
    const STAFFSRC=window.HL_STAFF||{};
    const allTreatIds=(window.HL_TREATMENTS||[]).map(t=>t.id);
    function svcMap(ids){ const m={}; allTreatIds.forEach(tid=>{ m[tid]={enabled:ids.includes(tid), durationOverride:null}; }); return m; }
    const weekly={1:[['12:00','20:30']],2:[['10:00','20:30']],3:[['10:00','20:30']],4:[['10:00','20:30']],5:[['10:00','20:30']],6:[['10:00','15:30']],0:[]};
    const chantalIds=allTreatIds.filter(tid=>(window.HL_treatment(tid).staff||[]).includes('chantal'));
    const maaikeIds=allTreatIds.filter(tid=>(window.HL_treatment(tid).staff||[]).includes('maaike'));
    const staff=[
      {id:'chantal', firstName:'Chantal', lastName:'', photo:'', titleNl:'Eigenaar', titleEn:'Owner', bioNl:'Oprichter van The Healing Lounge. Werkt holistisch, met warmte en aandacht.', bioEn:'Founder of The Healing Lounge. Works holistically, with warmth and attention.', email:'info@thehealinglounge.nl', phone:'+31613761673', color:'#BC813A', role:'owner', status:'active', services:svcMap(chantalIds), schedule:{weekly:JSON.parse(JSON.stringify(weekly)), exceptions:[], holidays:[]}},
      {id:'maaike', firstName:'Maaike', lastName:'', photo:'', titleNl:'Behandelaar', titleEn:'Therapist', bioNl:'Behandelaar bij The Healing Lounge, gespecialiseerd in gezicht en massage.', bioEn:'Therapist at The Healing Lounge, specialised in facials and massage.', email:'', phone:'', color:'#5C6B4E', role:'staff', status:'active', services:svcMap(maaikeIds), schedule:{weekly:{1:[],2:[['10:00','15:00']],3:[['10:00','15:00']],4:[['10:00','15:00']],5:[['10:00','15:00']],6:[],0:[]}, exceptions:[], holidays:[]}},
      {id:'demo-sofie', firstName:'Sofie', lastName:'(voorbeeld)', photo:'', titleNl:'Behandelaar', titleEn:'Therapist', bioNl:'Voorbeeldmedewerker, laat zien hoe het team kan groeien.', bioEn:'Example team member, shows how the team can grow.', email:'', phone:'', color:'#3A6FB0', role:'staff', status:'inactive', services:svcMap([]), schedule:{weekly:{1:[],2:[],3:[],4:[],5:[],6:[],0:[]}, exceptions:[], holidays:[]}},
    ];
    const treatments=(window.HL_TREATMENTS||[]).map(t=>({
      id:t.id, cat:t.cat, nl:{name:t.nl.name, desc:t.nl.desc}, en:{name:t.en.name, desc:t.en.desc},
      price:t.price, dur:t.dur, roomId:roomMap[t.room]||'r-behandel', doc:t.doc,
      staffIds:(t.staff||[]).slice(), active:true, photo:t.photo, slug:(window.HL_SLUG||{})[t.id]||'',
      buffer:15, bufferOn:true
    }));
    const customers=(window.HL_SEED_CUSTOMERS||[]).map(c=>({
      id:uid('c'), firstName:c.firstName, lastName:c.lastName, email:c.email, phone:c.phone,
      emailValid:c.emailValid, phoneValid:c.phoneValid, lang:'nl', lastBooking:c.lastBooking,
      totalBookings:c.totalBookings||0, marketing:!!c.marketing, marketingSince:c.marketingSince||'',
      blocked:false, blockReason:'', notes:'', source:c.source||'customers.csv', issues:c.issues||[]
    }));
    const appointments=(window.HL_SEED_APPOINTMENTS||[]).map(a=>({ id:uid('a'), ...a }));
    const settings={
      company:{name:'The Healing Lounge', street:'De Brouwerij 4', zip:'3831 ND', city:'Leusden', phone:'+31 6 13 76 16 73', email:'info@thehealinglounge.nl', kvk:'83541306', instagram:'https://www.instagram.com/thehealinglounge_/', tiktok:'https://www.tiktok.com/@thehealinglounge_'},
      hours:weekly, holidays:[], cancelHours:24, defaultBuffer:15,
      morningMail:{time:'08:00', recipients:['info@thehealinglounge.nl']}, reminder:{enabled:true, hoursBefore:24}, review:{enabled:true, delayHours:24},
      marketing:{fromName:'The Healing Lounge', replyTo:'info@thehealinglounge.nl'},
      branding:{ logo:(window.HL_LOGOS&&window.HL_LOGOS.logo)||'assets/brand/logo.png', logoLight:(window.HL_LOGOS&&window.HL_LOGOS.logoLight)||'assets/brand/logo-light.png', icon:(window.HL_LOGOS&&window.HL_LOGOS.icon)||'assets/brand/icon.png', emailLogoWidth:200 }
    };
    return { v:1, staff, rooms, categories:CATS, treatments, customers, appointments,
      documents:[], templates:[], campaigns:[], pages:{}, media:[], settings,
      log:[{ts:new Date().toISOString(), user:'Systeem', type:'seed', msg:'Dataset geïnitialiseerd uit export en catalogus.'}],
      session:{userId:'chantal'} };
  }

  // ---------- load / save ----------
  let data;
  function load(){
    try{ const s=JSON.parse(localStorage.getItem(KEY)); if(s&&s.v===1) return s; }catch(e){}
    const s=seed(); try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} return s;
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch(e){} window.dispatchEvent(new CustomEvent('hla-change')); }
  function reset(){ localStorage.removeItem(KEY); data=load(); save(); }

  data=load();

  // ---------- API ----------
  const HLA={
    get:()=>data, save, reset, uid, todayISO,
    log(type,msg){ data.log.unshift({ts:new Date().toISOString(), user:HLA.currentUser()?HLA.currentUser().firstName:'—', type, msg}); if(data.log.length>500)data.log.length=500; save(); },
    currentUser(){ return data.staff.find(s=>s.id===data.session.userId)||data.staff[0]; },
    setUser(id){ data.session.userId=id; save(); },
    // lookups
    staffById:(id)=>data.staff.find(s=>s.id===id),
    roomById:(id)=>data.rooms.find(r=>r.id===id),
    catById:(id)=>data.categories.find(c=>c.id===id),
    treatmentById:(id)=>data.treatments.find(t=>t.id===id),
    customerById:(id)=>data.customers.find(c=>c.id===id),
    activeStaff:()=>data.staff.filter(s=>s.status==='active'),
    // which staff can do a treatment
    staffForTreatment:(tid)=>data.staff.filter(s=>s.status==='active' && s.services[tid] && s.services[tid].enabled),
    treatmentsForStaff:(sid)=>{ const s=HLA.staffById(sid); return data.treatments.filter(t=>s.services[t.id]&&s.services[t.id].enabled); },
    // a treatment is bookable if active and (self-serve room OR has >=1 active staff)
    isBookable(t){ const room=HLA.roomById(t.roomId); if(!t.active) return false; if(room&&room.type==='self') return true; return HLA.staffForTreatment(t.id).length>0; },
    nameOf(obj,lang){ lang=lang||'nl'; if(obj.nl&&obj.nl.name) return lang==='nl'?obj.nl.name:obj.en.name; return lang==='nl'?(obj.nl||obj.firstName):(obj.en||obj.firstName); },
  };
  window.HLA=HLA;
})();
