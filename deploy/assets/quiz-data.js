/* ============================================================
 THE HEALING LOUNGE, quiz content & scoring data
 Feeds quiz.js. Bilingual (nl/en) like the rest of the site.
 --------------------------------------------------------------
 SCORING MODEL
 Each treatment carries a flat list of `tags` (strings).
 Each answer option carries a `boost` list of the same strings.
 Score(treatment) = Σ question.weight for every boost tag the
 treatment also has. Contra-indication options carry an
 `exclude` tag (x:…) that hard-removes treatments that match.
 ============================================================ */
(function(){

 /* ---------- treatment tags (matching profile) ----------
 goal: relax · skin · pain · detox · energy
 zone: face · back · belly · fullbody · mind
 mood: stressed · tired · tense · pamper · maintain
 vibe: honey · glow · deeppressure · stillness
 int: 1 (zacht) · 2 (midden) · 3 (diep)
 x:… contra-indication flags (used to EXCLUDE)
 */
 window.HL_QUIZ_TAGS = {
 'royal-face': ['goal:relax','goal:skin','zone:face','mood:stressed','mood:pamper','vibe:stillness','vibe:glow','int:1'],
 'holi-facial': ['goal:skin','zone:face','mood:maintain','mood:tired','vibe:glow','int:1'],
 'anti-age': ['goal:skin','zone:face','mood:maintain','vibe:glow','int:2'],
 'buccal-facial': ['goal:skin','zone:face','mood:pamper','vibe:glow','int:2'],
 'cupping-facial': ['goal:skin','zone:face','vibe:deeppressure','int:2','x:preg','x:blood','x:sensitive'],
 'golden-facial': ['goal:skin','zone:face','mood:pamper','vibe:glow','int:1'],
 'honey-lift': ['goal:skin','zone:face','mood:maintain','vibe:honey','vibe:glow','int:1'],

 'full-body-reset': ['goal:relax','zone:fullbody','mood:tired','mood:pamper','vibe:stillness','int:2'],
 'trans-cupping': ['goal:pain','goal:detox','zone:fullbody','zone:back','mood:tense','vibe:deeppressure','int:3','x:preg','x:blood'],
 'honing-buik': ['goal:detox','zone:belly','mood:tense','vibe:honey','vibe:deeppressure','int:3','x:preg','x:blood'],
 'honing-cellulite': ['goal:detox','zone:fullbody','vibe:honey','vibe:deeppressure','int:3','x:preg','x:blood'],
 'honing-rug': ['goal:pain','goal:detox','zone:back','mood:tense','vibe:honey','vibe:deeppressure','int:3','x:preg','x:blood'],
 'magnesium': ['goal:relax','goal:pain','zone:fullbody','zone:back','mood:tense','mood:tired','vibe:stillness','int:1'],

 'artreum': ['goal:relax','goal:energy','zone:fullbody','mood:stressed','mood:pamper','vibe:stillness','int:2'],
 'kundalini': ['goal:energy','goal:relax','zone:fullbody','zone:mind','mood:tired','mood:stressed','vibe:stillness','int:2'],
 'honing-achterkant':['goal:relax','zone:back','zone:fullbody','mood:tense','vibe:honey','int:2'],
 'honing-wellness': ['goal:relax','zone:fullbody','mood:pamper','mood:stressed','vibe:honey','vibe:stillness','int:1'],

 'oligo': ['goal:skin','goal:detox','zone:fullbody','vibe:glow','int:1'],
 'darm': ['goal:detox','zone:belly','mood:tired','vibe:stillness','int:1','x:preg'],
 'rood-licht': ['goal:energy','goal:skin','zone:fullbody','mood:tired','mood:maintain','vibe:glow','int:1'],
 'breathwork': ['goal:energy','goal:relax','zone:mind','mood:stressed','mood:tired','vibe:stillness','int:1'],
 };

 /* ---------- the 6 questions ---------- */
 window.HL_QUIZ_QUESTIONS = [
 {
 id:'goal', multi:false, weight:3,
 nl:{q:'Wat wil je vooral voelen na afloop?', sub:'Er is geen fout antwoord, kies wat nu het meest klopt.'},
 en:{q:'What do you most want to feel afterwards?', sub:'There is no wrong answer, pick what feels truest now.'},
 options:[
 {id:'relax', boost:['goal:relax','vibe:stillness'], nl:'Diep ontspannen', en:'Deeply relaxed', fragNl:'je vooral wilt ontspannen', fragEn:'you mainly want to relax'},
 {id:'skin', boost:['goal:skin','vibe:glow'], nl:'Een stralende, verzorgde huid', en:'Radiant, cared-for skin', fragNl:'je je huid wilt laten stralen', fragEn:'you want your skin to glow'},
 {id:'pain', boost:['goal:pain','vibe:deeppressure'], nl:'Verlost van pijn & spanning', en:'Free of pain & tension', fragNl:'je pijn en spanning wilt loslaten', fragEn:'you want to release pain and tension'},
 {id:'detox', boost:['goal:detox'], nl:'Licht & ontgift', en:'Light & detoxed', fragNl:'je je lichter en ontgift wilt voelen', fragEn:'you want to feel lighter and detoxed'},
 {id:'energy', boost:['goal:energy'], nl:'Energiek & in balans', en:'Energised & balanced', fragNl:'je weer energie en balans zoekt', fragEn:'you are looking for energy and balance'},
 ]
 },
 {
 id:'mood', multi:false, weight:2,
 nl:{q:'En hoe voel je je op dit moment?', sub:'Heel eerlijk, daar stemmen we de behandeling op af.'},
 en:{q:'And how do you feel right now?', sub:'Be honest, we tune the treatment to it.'},
 options:[
 {id:'stressed', boost:['mood:stressed'], nl:'Gestrest & overprikkeld', en:'Stressed & overstimulated'},
 {id:'tired', boost:['mood:tired'], nl:'Moe & opgebrand', en:'Tired & burnt out'},
 {id:'tense', boost:['mood:tense','goal:pain'], nl:'Gespannen in mijn lijf', en:'Tense in my body'},
 {id:'pamper', boost:['mood:pamper'], nl:'Gewoon toe aan verwennen',en:'Simply ready to be pampered'},
 {id:'maintain', boost:['mood:maintain'], nl:'Goed, ik wil onderhoud', en:"Good, I'm here for upkeep"},
 ]
 },
 {
 id:'zone', multi:false, weight:3,
 nl:{q:'Waar mag de aandacht vooral naartoe?', sub:'Het deel van jou dat er nu om vraagt.'},
 en:{q:'Where should the attention mainly go?', sub:'The part of you asking for it now.'},
 options:[
 {id:'face', boost:['zone:face'], nl:'Mijn gezicht & huid', en:'My face & skin', fragNl:'je aandacht naar je huid mag', fragEn:'care can go to your skin'},
 {id:'back', boost:['zone:back'], nl:'Rug, nek & schouders', en:'Back, neck & shoulders', fragNl:'je rug en schouders aandacht vragen', fragEn:'your back and shoulders ask for attention'},
 {id:'belly', boost:['zone:belly'], nl:'Mijn buik & spijsvertering', en:'My belly & digestion', fragNl:'je buik aandacht mag krijgen', fragEn:'your belly can receive attention'},
 {id:'fullbody', boost:['zone:fullbody'], nl:'Mijn hele lichaam', en:'My whole body', fragNl:'je hele lichaam tot rust mag komen', fragEn:'your whole body can come to rest'},
 {id:'mind', boost:['zone:mind'], nl:'Mijn hoofd & adem', en:'My head & breath', fragNl:'je hoofd tot rust mag komen', fragEn:'your mind can settle'},
 ]
 },
 {
 id:'intensity', multi:false, weight:2,
 nl:{q:'Hoe mag de aanraking voelen?', sub:'Van zacht en koesterend tot stevig en diepgaand.'},
 en:{q:'How should the touch feel?', sub:'From soft and nurturing to firm and deep.'},
 options:[
 {id:'soft', boost:['int:1'], nl:'Zacht & koesterend', en:'Soft & nurturing', fragNl:'met een zachte aanraking', fragEn:'with a gentle touch'},
 {id:'mid', boost:['int:2'], nl:'Ergens in het midden',en:'Somewhere in between', fragNl:'met een evenwichtige aanraking', fragEn:'with a balanced touch'},
 {id:'deep', boost:['int:3','vibe:deeppressure'], nl:'Stevig & diepgaand', en:'Firm & deep', fragNl:'met een stevige, diepe aanraking', fragEn:'with a firm, deep touch'},
 ]
 },
 {
 id:'vibe', multi:false, weight:2,
 nl:{q:'Wat klinkt als jouw soort luxe?', sub:'Volg je gevoel, dit zegt vaak het meest.'},
 en:{q:'What sounds like your kind of luxury?', sub:'Follow your instinct, this often tells us most.'},
 options:[
 {id:'honey', boost:['vibe:honey'], nl:'De warmte van honing', en:'The warmth of honey'},
 {id:'glow', boost:['vibe:glow'], nl:'Een gouden, stralende glow',en:'A golden, radiant glow'},
 {id:'deeppressure', boost:['vibe:deeppressure'], nl:'Diepe, losmakende druk', en:'Deep, releasing pressure'},
 {id:'stillness', boost:['vibe:stillness'], nl:'Stilte, adem & rust', en:'Stillness, breath & rest'},
 ]
 },
 {
 id:'contra', multi:true, weight:0,
 nl:{q:'Is er iets waar we rekening mee moeten houden?', sub:'Voor jouw veiligheid. Meerdere antwoorden mogen, of kies “niets”.'},
 en:{q:'Anything we should take into account?', sub:'For your safety. Pick several, or choose “nothing”.'},
 options:[
 {id:'preg', exclude:'x:preg', nl:'Ik ben zwanger', en:"I'm pregnant"},
 {id:'blood', exclude:'x:blood', nl:'Bloedverdunners of net geopereerd', en:'Blood thinners or recent surgery'},
 {id:'sensitive', exclude:'x:sensitive', nl:'Gevoelige of beschadigde huid', en:'Sensitive or damaged skin'},
 {id:'none', none:true, nl:'Nee, niets van toepassing', en:'No, nothing applies'},
 ]
 },
 ];

 /* ---------- per-treatment "why it's good" content ----------
 why : one warm sentence (used under the result name)
 benefits: 3 short bullets, what it does for you
 expect : one line, what the treatment is like
 */
 window.HL_QUIZ_INFO = {
 'royal-face':{
 why:{nl:'Een verstillende gezichtsbehandeling die je hele systeem laat zakken.', en:'A quieting facial that lets your whole system settle.'},
 benefits:{nl:['Kalmeert huid én zenuwstelsel tegelijk','Verzacht stress die zich aftekent op je gezicht','Laat je stralend én ontspannen vertrekken'], en:['Calms both skin and nervous system','Softens the stress that shows on your face','You leave radiant and relaxed']},
 expect:{nl:'Een holistisch ritueel van reiniging, massage en maskers, 75 minuten volledige aandacht.', en:'A holistic ritual of cleansing, massage and masks, 75 minutes of full attention.'}},
 'holi-facial':{
 why:{nl:'Een herstellende facial die je huid weer laat oplichten.', en:'A restoring facial that brings your skin back to life.'},
 benefits:{nl:['Herstelt een vermoeide, doffe huid','Geeft direct zichtbare glow','Voelt licht en verfrissend'], en:['Restores tired, dull skin','Gives a visible glow right away','Feels light and refreshing']},
 expect:{nl:'Een verfijnde gezichtsbehandeling van 60 minuten, afgestemd op jouw huid.', en:'A refined 60-minute facial, tailored to your skin.'}},
 'anti-age':{
 why:{nl:'Verstevigt en voedt waar de tijd zich begint af te tekenen.', en:'Firms and nourishes where time begins to show.'},
 benefits:{nl:['Verzacht fijne lijntjes','Verstevigt en voedt de huid','Een zichtbaar fitter gezicht'], en:['Softens fine lines','Firms and nourishes the skin','A visibly fresher face']},
 expect:{nl:'Een gerichte verstevigende behandeling van 60 minuten.', en:'A targeted firming treatment of 60 minutes.'}},
 'buccal-facial':{
 why:{nl:'Lifting van binnenuit, een sculpterende massage van je gezicht.', en:'Lifting from within, a sculpting massage of your face.'},
 benefits:{nl:['Tilt en sculpteert de gelaatstrekken','Ontspant kaak- en gezichtsspanning','Natuurlijk, opgefrist resultaat'], en:['Lifts and sculpts the features','Releases jaw and facial tension','A natural, refreshed result']},
 expect:{nl:'Een intensieve gezichtsmassage van 60 minuten, ook van binnenuit.', en:'An intensive 60-minute facial massage, also from within.'}},
 'cupping-facial':{
 why:{nl:'Zachte gezichtscupping die je huid van binnenuit laat ademen.', en:'Gentle facial cupping that lets your skin breathe from within.'},
 benefits:{nl:['Stimuleert doorbloeding en huidstructuur','Geeft een frisse, opgepofte teint','Verfijnt de huid zichtbaar'], en:['Boosts circulation and skin texture','Gives a fresh, plumped complexion','Visibly refines the skin']},
 expect:{nl:'Een verfijnde behandeling van 60 minuten met zachte cups.', en:'A refined 60-minute treatment with gentle cups.'}},
 'golden-facial':{
 why:{nl:'Pure luxe met een gouden glow, voor een moment dat telt.', en:'Pure luxury with a golden glow, for a moment that matters.'},
 benefits:{nl:['Directe, feestelijke stralende huid','Voedt en verstevigt diep','Het ultieme verwenmoment'], en:['Instant, festive radiance','Deeply nourishes and firms','The ultimate pampering moment']},
 expect:{nl:'Een luxe gezichtsbehandeling van 75 minuten met goud.', en:'A luxurious 75-minute facial with gold.'}},
 'honey-lift':{
 why:{nl:'Liftende honing die je huid voedt en verstevigt.', en:'Lifting honey that nourishes and firms your skin.'},
 benefits:{nl:['Verstevigt met de warmte van honing','Voedt een droge, vermoeide huid','Zacht liftend effect'], en:['Firms with the warmth of honey','Nourishes dry, tired skin','A soft lifting effect']},
 expect:{nl:'Een voedende honingbehandeling van 60 minuten.', en:'A nourishing 60-minute honey treatment.'}},

 'full-body-reset':{
 why:{nl:'Een volledige reset, ontspanning van top tot teen.', en:'A complete reset, relaxation from head to toe.'},
 benefits:{nl:['Laat je hele lichaam zakken','Diepe, allesomvattende rust','Je komt thuis bij jezelf'], en:['Lets your whole body soften','Deep, all-encompassing rest','You come home to yourself']},
 expect:{nl:'Een ruim ritueel van 90 minuten voor het hele lichaam.', en:'A generous 90-minute full-body ritual.'}},
 'trans-cupping':{
 why:{nl:'Diepe cupping die vastzittende spanning eindelijk loslaat.', en:'Deep cupping that finally releases locked-in tension.'},
 benefits:{nl:['Maakt diepe spierspanning los','Stimuleert doorbloeding krachtig','Een merkbaar lichter lichaam'], en:['Releases deep muscular tension','Powerfully boosts circulation','A noticeably lighter body']},
 expect:{nl:'Een stevige cupping-behandeling van 60 minuten. Lichte blauwe plekken zijn normaal.', en:'A firm 60-minute cupping treatment. Mild bruising is normal.'}},
 'honing-buik':{
 why:{nl:'Een ontgiftende honingmassage die je buik laat ontspannen.', en:'A detoxifying honey massage that lets your belly relax.'},
 benefits:{nl:['Maakt het bindweefsel van de buik los','Ondersteunt spijsvertering en afvoer','Ontspant een gespannen buik'], en:['Releases the belly\u2019s connective tissue','Supports digestion and drainage','Relaxes a tense belly']},
 expect:{nl:'Een diepe honingmassage van 60 minuten, gericht op de buik.', en:'A deep 60-minute honey massage focused on the belly.'}},
 'honing-cellulite':{
 why:{nl:'Gerichte honingmassage die cellulite zichtbaar verzacht.', en:'Targeted honey massage that visibly softens cellulite.'},
 benefits:{nl:['Verzacht cellulite zichtbaar','Stimuleert afvoer en doorbloeding','Strakker, gladder gevoel'], en:['Visibly softens cellulite','Stimulates drainage and circulation','A firmer, smoother feel']},
 expect:{nl:'Een stevige, gerichte honingmassage van 60 minuten.', en:'A firm, targeted 60-minute honey massage.'}},
 'honing-rug':{
 why:{nl:'Diepe honingmassage die je rug volledig losmaakt.', en:'A deep honey massage that fully releases your back.'},
 benefits:{nl:['Maakt een gespannen rug volledig los','Ontgift via het bindweefsel','Verlicht vastzittende pijn'], en:['Fully releases a tense back','Detoxifies through the connective tissue','Relieves locked-in pain']},
 expect:{nl:'Een diepe, ontgiftende rugmassage met honing van 60 minuten.', en:'A deep, detoxifying 60-minute honey back massage.'}},
 'magnesium':{
 why:{nl:'Een rustgevende pakking die spieren ontspant en magnesium aanvult.', en:'A calming wrap that relaxes muscles and replenishes magnesium.'},
 benefits:{nl:['Ontspant vermoeide spieren','Vult magnesium aan via de huid','Zacht en volledig rustgevend'], en:['Relaxes tired muscles','Replenishes magnesium through the skin','Soft and fully calming']},
 expect:{nl:'Een warme, rustgevende pakking van 45 minuten.', en:'A warm, calming 45-minute wrap.'}},

 'artreum':{
 why:{nl:'Onze holistische signatuurmassage die lichaam en geest in balans brengt.', en:'Our holistic signature massage that balances body and mind.'},
 benefits:{nl:['Brengt lichaam en geest in balans','Lost stress laag voor laag op','Een diep, samenhangend ritueel'], en:['Balances body and mind','Dissolves stress layer by layer','A deep, cohesive ritual']},
 expect:{nl:'Een holistische signatuurmassage van 75 minuten.', en:'A holistic 75-minute signature massage.'}},
 'kundalini':{
 why:{nl:'Een flow-massage die je energie weer laat stromen, van top tot teen.', en:'A flow massage that lets your energy move again, head to toe.'},
 benefits:{nl:['Laat vastgelopen energie weer stromen','Combineert ontspanning en vitaliteit','Brengt je terug in balans'], en:['Gets stuck energy flowing again','Combines relaxation and vitality','Brings you back into balance']},
 expect:{nl:'Een holistische flow-massage van 75 minuten.', en:'A holistic 75-minute flow massage.'}},
 'honing-achterkant':{
 why:{nl:'Een warme honingmassage van je hele achterkant.', en:'A warm honey massage of your entire back side.'},
 benefits:{nl:['Ontspant de hele achterkant van het lichaam','De koesterende warmte van honing','Heerlijk losmakend'], en:['Relaxes the entire back of the body','The nurturing warmth of honey','Beautifully releasing']},
 expect:{nl:'Een warme honingmassage van 60 minuten.', en:'A warm 60-minute honey massage.'}},
 'honing-wellness':{
 why:{nl:'Een heerlijke, ontspannende wellnessmassage met warme honing.', en:'A delightful, relaxing wellness massage with warm honey.'},
 benefits:{nl:['Pure ontspanning met warme honing','Verzacht stress in het hele lichaam','Een echt verwenmoment'], en:['Pure relaxation with warm honey','Eases stress in the whole body','A true pampering moment']},
 expect:{nl:'Een ontspannende wellnessmassage van 75 minuten.', en:'A relaxing 75-minute wellness massage.'}},

 'oligo':{
 why:{nl:'Een verstevigende therapie die vocht afvoert en de huid herstelt.', en:'A firming therapy that drains fluid and restores the skin.'},
 benefits:{nl:['Voert vasthoudend vocht af','Verstevigt en herstelt de huid','Een lichter, strakker gevoel'], en:['Drains retained fluid','Firms and restores the skin','A lighter, firmer feel']},
 expect:{nl:'Een verstevigende therapie van 60 minuten.', en:'A firming 60-minute therapy.'}},
 'darm':{
 why:{nl:'Een zachte buikbehandeling die je spijsvertering ondersteunt.', en:'A gentle abdominal treatment supporting your digestion.'},
 benefits:{nl:['Ondersteunt een rustige spijsvertering','Ontspant de buik zacht','Voelt licht en verzorgd'], en:['Supports calm digestion','Gently relaxes the belly','Feels light and cared-for']},
 expect:{nl:'Een zachte buikbehandeling van 60 minuten.', en:'A gentle 60-minute abdominal treatment.'}},
 'rood-licht':{
 why:{nl:'Herstel met rood licht, de hele dag zelfstandig boekbaar.', en:'Recover with red light, bookable independently all day.'},
 benefits:{nl:['Ondersteunt huidherstel en energie','Geen afspraak met een medewerker nodig','Kort, krachtig en de hele dag boekbaar'], en:['Supports skin recovery and energy','No staff appointment needed','Short, powerful and bookable all day']},
 expect:{nl:'Een zelfstandige sessie van 20 minuten in de Rode Licht Ruimte.', en:'A self-guided 20-minute session in the Red Light Room.'}},
 'breathwork':{
 why:{nl:'Een begeleide ademsessie die stress loslaat en je hoofd opent.', en:'A guided breathing session that releases stress and opens your mind.'},
 benefits:{nl:['Laat mentale stress los','Brengt rust en helderheid','Opent adem en energie'], en:['Releases mental stress','Brings calm and clarity','Opens breath and energy']},
 expect:{nl:'Een begeleide ademsessie van 60 minuten.', en:'A guided 60-minute breathing session.'}},
 };

})();
