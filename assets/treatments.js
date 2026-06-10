/* ============================================================
 THE HEALING LOUNGE, treatment catalogue (single source)
 Feeds: behandelingen.html, behandeling.html, boeken.html, admin.
 Prices & durations are realistic placeholders (§6 [INVULLEN]).
 doc: 'A' handtekening · 'B' inzien · 'C' geen (assumption §9)
 room: 'behandel' (1 tegelijk, medewerker) · 'rood' (zelfstandig)
 staff: who may perform it (Maaike's set is an assumption §2.2)
 ============================================================ */
(function(){
 const M = (window.HL_MEDIA) || 'https://www-static.thehealinglounge.nl/wp-content/uploads/';
 const G = n => M+'2025/08/Untitled-'+n+'.jpg'; // gallery placeholder
 const P = f => M+'2025/10/'+f; // own photography

 window.HL_CATS = [
 {id:'all', nl:'Alles', en:'All'},
 {id:'gezicht', nl:'Gezicht', en:'Facials'},
 {id:'lichaam', nl:'Lichaam', en:'Body'},
 {id:'massage', nl:'Massage', en:'Massage'},
 {id:'therapie',nl:'Therapie', en:'Therapy'},
 {id:'overig', nl:'Overig', en:'Other'},
 ];

 window.HL_TREATMENTS = [
 // ---- Gezichtsbehandelingen ----
 {id:'royal-face', cat:'gezicht', dur:75, price:95, doc:'B', room:'behandel', staff:['chantal','maaike'], featured:true,
 photo:P('Royal-Facial.png'),
 nl:{name:'Holistic Royal Face', desc:'Verfijnde, holistische gezichtsbehandeling die huid én zenuwstelsel diep tot rust brengt.'},
 en:{name:'Holistic Royal Face', desc:'A refined, holistic facial that deeply calms both skin and nervous system.'}},
 {id:'holi-facial', cat:'gezicht', dur:60, price:79, doc:'B', room:'behandel', staff:['chantal','maaike'], featured:true,
 photo:P('Holi-facial-banner.png'),
 nl:{name:'Holi Facial', desc:'Stralende gezichtsbehandeling die de huid herstelt en laat oplichten.'},
 en:{name:'Holi Facial', desc:'A radiant facial that restores and brightens the skin.'}},
 {id:'anti-age', cat:'gezicht', dur:60, price:85, doc:'B', room:'behandel', staff:['chantal','maaike'], newPhoto:true, photo:G(1),
 nl:{name:'Anti Age', desc:'Verstevigende behandeling die fijne lijntjes verzacht en de huid voedt.'},
 en:{name:'Anti Age', desc:'A firming treatment that softens fine lines and nourishes the skin.'}},
 {id:'buccal-facial', cat:'gezicht', dur:60, price:89, doc:'B', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(2),
 nl:{name:'Buccal Facial', desc:'Lifting van binnenuit: een sculpterende massage van het gezicht.'},
 en:{name:'Buccal Facial', desc:'Lifting from within: a sculpting massage of the face.'}},
 {id:'cupping-facial', cat:'gezicht', dur:60, price:85, doc:'A', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(4),
 nl:{name:'Cupping Facial', desc:'Zachte gezichtscupping die doorbloeding en huidstructuur stimuleert.'},
 en:{name:'Cupping Facial', desc:'Gentle facial cupping that boosts circulation and skin texture.'}},
 {id:'golden-facial', cat:'gezicht', dur:75, price:99, doc:'B', room:'behandel', staff:['chantal','maaike'], newPhoto:true, photo:G(5),
 nl:{name:'Golden Facial', desc:'Luxe behandeling met een gouden glow voor een speciale gelegenheid.'},
 en:{name:'Golden Facial', desc:'A luxurious treatment with a golden glow for a special occasion.'}},
 {id:'honey-lift', cat:'gezicht', dur:60, price:85, doc:'B', room:'behandel', staff:['chantal','maaike'], newPhoto:true, photo:G(6),
 nl:{name:'Honey Lift Facial', desc:'Liftende honingbehandeling die de huid voedt en verstevigt.'},
 en:{name:'Honey Lift Facial', desc:'A lifting honey treatment that nourishes and firms the skin.'}},

 // ---- Lichaamsbehandelingen ----
 {id:'full-body-reset', cat:'lichaam', dur:90, price:120, doc:'B', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(7),
 nl:{name:'Full Body Reset', desc:'Volledige reset voor het lichaam, ontspanning van top tot teen.'},
 en:{name:'Full Body Reset', desc:'A full-body reset, relaxation from head to toe.'}},
 {id:'trans-cupping', cat:'lichaam', dur:60, price:89, doc:'A', room:'behandel', staff:['chantal'], featured:true,
 photo:P('Transformational-cupping-banner.png'),
 nl:{name:'Transformational Cupping', desc:'Cupping die spanning loslaat en de doorbloeding diep stimuleert.'},
 en:{name:'Transformational Cupping', desc:'Cupping that releases tension and deeply stimulates circulation.'}},
 {id:'honing-buik', cat:'lichaam', dur:60, price:85, doc:'A', room:'behandel', staff:['chantal'],
 photo:P('Honingbindweefselmassage-buik.png'),
 nl:{name:'Honing Bindweefselmassage · Buik', desc:'Ontgiftende honingmassage die het bindweefsel van de buik losmaakt.'},
 en:{name:'Honey Connective Tissue · Belly', desc:'A detoxifying honey massage releasing the belly\u2019s connective tissue.'}},
 {id:'honing-cellulite', cat:'lichaam', dur:60, price:85, doc:'A', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(8),
 nl:{name:'Honing Bindweefselmassage · Cellulite', desc:'Gerichte honingmassage die cellulite zichtbaar verzacht.'},
 en:{name:'Honey Connective Tissue · Cellulite', desc:'Targeted honey massage that visibly softens cellulite.'}},
 {id:'honing-rug', cat:'lichaam', dur:60, price:85, doc:'A', room:'behandel', staff:['chantal'], featured:true,
 photo:P('Honing-rug-massage-banner.png'),
 nl:{name:'Honing Bindweefselmassage · Rug', desc:'Diepe, ontgiftende honingmassage die de rug volledig losmaakt.'},
 en:{name:'Honey Connective Tissue · Back', desc:'A deep, detoxifying honey massage that fully releases the back.'}},
 {id:'magnesium', cat:'lichaam', dur:45, price:65, doc:'B', room:'behandel', staff:['chantal','maaike'], newPhoto:true, photo:G(3),
 nl:{name:'Magnesiumpakking', desc:'Rustgevende pakking die spieren ontspant en magnesium aanvult.'},
 en:{name:'Magnesium Wrap', desc:'A calming wrap that relaxes muscles and replenishes magnesium.'}},

 // ---- Lichaamsmassage ----
 {id:'artreum', cat:'massage', dur:75, price:95, doc:'B', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(1),
 nl:{name:'De Artreum', desc:'Holistische signatuurmassage die lichaam en geest in balans brengt.'},
 en:{name:'De Artreum', desc:'A holistic signature massage that balances body and mind.'}},
 {id:'kundalini', cat:'massage', dur:75, price:90, doc:'B', room:'behandel', staff:['chantal','maaike'], featured:true,
 photo:P('Kundalini-banner.png'),
 nl:{name:'Kundalini Shakti Flow', desc:'Holistische flow-massage die energie laat stromen van top tot teen.'},
 en:{name:'Kundalini Shakti Flow', desc:'A holistic flow massage that lets energy move from head to toe.'}},
 {id:'honing-achterkant', cat:'massage', dur:60, price:85, doc:'B', room:'behandel', staff:['chantal'],
 photo:P('Honing-achterkant-massage.png'),
 nl:{name:'Honingmassage · Achterkant lichaam', desc:'Warme honingmassage van de gehele achterkant van het lichaam.'},
 en:{name:'Honey Massage · Back of body', desc:'A warm honey massage of the entire back of the body.'}},
 {id:'honing-wellness', cat:'massage', dur:75, price:95, doc:'B', room:'behandel', staff:['chantal','maaike'],
 photo:P('Honing-wellness-massage.png'),
 nl:{name:'Honing Wellness Massage', desc:'Heerlijke, ontspannende wellnessmassage met warme honing.'},
 en:{name:'Honey Wellness Massage', desc:'A delightful, relaxing wellness massage with warm honey.'}},

 // ---- Therapie ----
 {id:'oligo', cat:'therapie', dur:60, price:79, doc:'B', room:'behandel', staff:['chantal'],
 photo:P('Oligo-Banner.png'),
 nl:{name:'Oligo Therapie', desc:'Verstevigende therapie die vocht afvoert en de huid herstelt.'},
 en:{name:'Oligo Therapy', desc:'A firming therapy that drains fluid and restores the skin.'}},
 {id:'darm', cat:'therapie', dur:60, price:79, doc:'B', room:'behandel', staff:['chantal'], newPhoto:true, photo:G(2),
 nl:{name:'Darm Therapie', desc:'Zachte buikbehandeling die de spijsvertering ondersteunt.'},
 en:{name:'Gut Therapy', desc:'A gentle abdominal treatment supporting digestion.'}},
 {id:'rood-licht', cat:'therapie', dur:20, price:25, doc:'B', room:'rood', staff:[], featured:true, newPhoto:true, photo:G(3),
 allDay:true,
 nl:{name:'Rood Licht Therapie', desc:'Herstel met rood licht, de hele dag zelfstandig boekbaar, geen medewerker nodig.'},
 en:{name:'Red Light Therapy', desc:'Recover with red light, bookable independently all day, no staff needed.'}},

 // ---- Overig ----
 {id:'breathwork', cat:'overig', dur:60, price:65, doc:'C', room:'behandel', staff:['chantal','maaike'], newPhoto:true, photo:G(4),
 nl:{name:'Breathwork', desc:'Begeleide ademsessie die stress loslaat en de geest opent.'},
 en:{name:'Breathwork', desc:'A guided breathing session that releases stress and opens the mind.'}},
 {id:'zonnestudio', cat:'overig', dur:12, price:14, doc:'C', room:'zon', staff:[], walkin:true, newPhoto:true, photo:G(5),
 nl:{name:'Zonnestudio', desc:'Vijf moderne Ergoline-zonnebanken, walk-in, geen afspraak nodig.'},
 en:{name:'Tanning Studio', desc:'Five modern Ergoline sunbeds, walk-in, no appointment needed.'}},
 ];

 window.HL_STAFF = {
 chantal:{nl:'Chantal', en:'Chantal', role_nl:'Eigenaar · alle behandelingen', role_en:'Owner · all treatments', color:'#BC813A'},
 maaike:{nl:'Maaike', en:'Maaike', role_nl:'Behandelaar', role_en:'Therapist', color:'#5C6B4E'},
 };

 // SEO slugs → aparte pagina per behandeling
 window.HL_SLUG = {
 'royal-face':'holistic-royal-face','holi-facial':'holi-facial','anti-age':'anti-age',
 'buccal-facial':'buccal-facial','cupping-facial':'cupping-facial','golden-facial':'golden-facial',
 'honey-lift':'honey-lift-facial','full-body-reset':'full-body-reset','trans-cupping':'transformational-cupping',
 'honing-buik':'honing-bindweefselmassage-buik','honing-cellulite':'honing-bindweefselmassage-cellulite',
 'honing-rug':'honing-bindweefselmassage-rug','magnesium':'magnesiumpakking','artreum':'de-artreum',
 'kundalini':'kundalini-shakti-flow','honing-achterkant':'honingmassage-achterkant-lichaam',
 'honing-wellness':'honing-wellness-massage','oligo':'oligo-therapie','darm':'darm-therapie',
 'rood-licht':'rood-licht-therapie','breathwork':'breathwork','zonnestudio':'zonnestudio'
 };
 window.HL_slug = id => (window.HL_SLUG[id] || 'behandeling') ;

 // helper
 window.HL_treatment = id => (window.HL_TREATMENTS||[]).find(t=>t.id===id);
 window.HL_docLabel = (doc,lang)=>({
 A:{nl:'Ondertekening vereist', en:'Signature required'},
 B:{nl:'Aandachtspunten inzien', en:'Read the guidelines'},
 C:{nl:'Geen document', en:'No document'},
 }[doc][lang||'nl']);
})();
