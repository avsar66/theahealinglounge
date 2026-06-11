# Design Brief — The Healing Lounge: Website & Boekingsplatform

**Versie 2.0 — voor Claude Designer**
Opdrachtgever: The Healing Lounge, De Brouwerij 4, 3831 ND Leusden · info@thehealinglounge.nl · +31 6 13 76 16 73 · KVK 83541306
Huidige website: www.thehealinglounge.nl (WordPress/Elementor met Amelia-boekingen)

---

## 1. Projectcontext en doel

The Healing Lounge is een luxe zonnestudio en wellnesssalon in Leusden met een zachte, boeddhistisch geïnspireerde uitstraling. Naast vijf moderne Ergoline-zonnebanken bieden zij gezichtsbehandelingen, honing-bindweefselmassages, cupping, pakkingen, holistische massages, therapieën en breathwork.

We bouwen een volledig nieuw, **extreem luxe en high-end ogend** platform dat bestaat uit vijf onderdelen:

1. **Boekingssysteem** — klanten boeken behandelingen, lezen en ondertekenen waar nodig documenten, en beheren hun afspraak via een magic link (geen wachtwoord).
2. **Admin-agenda** — dag/week/maandweergave, filteren op medewerker, kleurcodering, volwaardig op mobiel.
3. **Marketingmodule** — klanten melden zich bij het boeken aan voor mailings; de salon verstuurt acties en nieuwsbrieven via kant-en-klare, aanpasbare templates met live preview.
4. **CMS** — alle content van de website (teksten, foto's, behandelingen, prijzen, documenten, e-mails, marketingtemplates) is via de backend aanpasbaar, zonder developer.
5. **Tweetaligheid** — Nederlands en Engels, vanaf dag één in de architectuur en het design verwerkt.

Geautomatiseerde e-mails: bevestiging met ICS-agendabijlage, herinnering, dagelijkse ochtendagenda voor het team, kopieën van ondertekende verklaringen, en marketingcampagnes.

**Scope-opmerking voor de designer:** ontwerp álle schermen en states alsof het systeem volledig werkt — gevulde agenda met realistische dummy-afspraken, e-mails als visuele templates, lege/fout/succes-states, en beide talen waar dat het ontwerp raakt (taalswitcher, langere Engelse teksten). De technische realisatie (mailverzending, ICS, tokens, beschikbaarheidslogica, CMS-backend) volgt daarna in een aparte build; dit design dient als complete blauwdruk.

---

## 2. Openstaande vragen — eerst invullen [INVULLEN]

Gebruik tot beantwoording realistische aannames en markeer ze in het design.

1. **Scope website:** vervangt dit platform de volledige huidige website (home, over ons, behandelpagina's, contact) of alleen het boekingsgedeelte? Aanname in deze brief: het wordt op termijn de volledige website, dus ontwerp de publieke pagina's mee. [INVULLEN]
2. **Maaike's behandelingen:** Chantal doet alles; Maaike doet een deel. Welke precies? [INVULLEN]
3. **Per behandeling:** duur (minuten), prijs, en document-flow (zie §9): handtekening / alleen inzien / geen. [INVULLEN]
4. **Rode licht therapie:** sessieduur per slot, aantal gelijktijdige plekken, starttijden-raster. [INVULLEN]
5. **Zonnebanken:** blijven walk-in (zoals nu) of worden de 5 banken ook online boekbaar? [INVULLEN]
6. **Annuleren:** zelfde 24-uursgrens als wijzigen? (Aanname: ja.) [INVULLEN]
7. **Buffer:** omsteltijd tussen behandelingen in de behandelruimte (aanname: 15 min). [INVULLEN]
8. **Ochtendmail:** verzendtijdstip (aanname 07:30) en ontvangers. [INVULLEN]
9. **Marketing:** gewenste frequentie/typen mailings (maandelijkse nieuwsbrief? losse acties?) en afzendernaam. [INVULLEN]

---

## 3. Designrichting — "stille luxe"

Het geheel moet voelen als een high-end spa-merk: rustig, warm, verfijnd. Géén standaard SaaS-boekingswidget-look, géén harde kleuren, géén drukke UI. Dit geldt voor klantzijde, admin én e-mails — alles uit één huisstijl.

- **Sfeer:** serene wellness met boeddhistische zachtheid; warmte van honing en hout; gedimd licht. Referentiegevoel: Aesop, Aman Resorts, Rituals — maar een eigen identiteit, geen kopie.
- **Palet (voorstel, designer mag verfijnen):** diep warm bruin/espresso als basis, honing-amber en zacht goud als accent, gebroken wit/linnen voor vlakken, een diep groen voor rust. Rode licht therapie krijgt een subtiel warmrood accent in agenda en kleurcodering.
- **Typografie:** elegante display-serif voor koppen (luxe hotelgevoel) met een rustige, goed leesbare sans voor UI en body. Royale witruimte, ruime regelafstand. Houd rekening met tweetalige teksten (Engels loopt vaak langer of korter — geen layouts die breken).
- **Beeld:** de bestaande fotografie (§4) is warm en sfeervol — groot en rustig inzetten, met zachte overlays voor leesbaarheid.
- **Micro-interacties:** subtiel en traag-elegant (zachte fades, geen bounces). De boekingsbevestiging mag een klein "ritueel"-moment zijn — een rustige animatie met "Tot snel bij The Healing Lounge".
- **Toon:** Nederlands warm en persoonlijk in je/jij-vorm (zoals de huidige site); Engels in dezelfde warme, verzorgde toon.
- **Toegankelijkheid:** voldoende contrast ondanks het warme palet, zichtbare focus-states, volledig met toetsenbord bedienbaar.

---

## 4. Foto-manifest — direct te importeren

Alle beelden staan publiek op de mediaserver van de huidige site en kunnen direct in het design worden geladen (hotlink). Voor productie worden ze later naar eigen hosting gekopieerd.

Basis-URL: `https://www-static.thehealinglounge.nl/wp-content/uploads/`

| Gebruik | URL (achter basis-URL) |
|---|---|
| Logo | `2025/08/logo-the-healing-lounge-web-2_.png` |
| Hero / algemeen | `2025/10/banner1.png` |
| Interieur hoofdfoto | `2025/10/Foto-hoofdpagina.png` |
| Honing bindweefsel buik | `2025/10/Honingbindweefselmassage-buik.png` |
| Honing bindweefsel rug | `2025/10/Honing-rug-massage-banner.png` |
| Honingmassage achterkant | `2025/10/Honing-achterkant-massage.png` |
| Honing wellness massage | `2025/10/Honing-wellness-massage.png` |
| Kundalini Shakti Flow | `2025/10/Kundalini-banner.png` |
| Oligo therapie | `2025/10/Oligo-Banner.png` |
| Holistic Royal Face | `2025/10/Royal-Facial.png` |
| Holi Facial | `2025/10/Holi-facial-banner.png` |
| Transformational Cupping | `2025/10/Transformational-cupping-banner.png` |
| Galerij interieur (8 stuks) | `2025/08/Untitled-1.jpg` t/m `2025/08/Untitled-8.jpg` |

Voor behandelingen zonder eigen foto (o.a. Anti Age, Buccal Facial, Golden Facial, Darm Therapie, Breathwork, Magnesiumpakking, Full Body Reset, De Artreum, Rood licht): gebruik passende sfeerfoto's uit de galerij als placeholder en markeer ze als "nieuwe fotografie gewenst". Alle afbeeldingen worden in het CMS beheerbaar (§12).

---

## 5. Tweetaligheid (NL / EN) — vanaf het begin

- Taalswitcher (NL | EN) elegant en onopvallend in de header van de klantzijde, keuze onthouden.
- **Alle** klantgerichte content bestaat in twee talen: pagina's, behandelnamen en -omschrijvingen, boekingsflow, documenten (contra-indicaties, verklaringen), e-mails, foutmeldingen, en marketingtemplates.
- De taal van de klant wordt bij de boeking opgeslagen; alle e-mails aan die klant (bevestiging, herinnering, marketing) gaan automatisch in die taal.
- In het CMS staan NL en EN per item naast elkaar (twee velden of taal-tabs), met een duidelijke markering voor ontbrekende vertalingen.
- Admin-interface zelf mag in het Nederlands; de tweetaligheid betreft de klantzijde en alle klantcommunicatie.
- Ondertekende verklaringen: het systeem registreert in welke taalversie van het document is getekend.

---

## 6. Behandelingencatalogus

Alle behandelingen van de huidige site moeten in het nieuwe systeem. Velden per behandeling: naam (NL/EN), categorie, omschrijving (NL/EN, overnemen van huidige site), duur, prijs, foto, ruimte, toegestane medewerkers, document-flow, actief/inactief.

**Gezichtsbehandelingen** — Anti Age · Buccal Facial · Cupping Facial · Golden Facial · Honey Lift Facial · Holistic Royal Face · Holi Facial

**Lichaamsbehandelingen** — Full Body Reset · Transformational Cupping · Honing Bindweefselmassage Buik · Honing Bindweefselmassage Cellulite · Honing Bindweefselmassage Rug · Magnesiumpakking

**Lichaamsmassage** — De Artreum · Kundalini Shakti Flow · Honingmassage achterkant lichaam · Honing Wellness Massage

**Therapie** — Oligo Therapie · Darm Therapie · Rood Licht Therapie

**Overig** — Breathwork · Zonnestudio (5 Ergoline-banken; walk-in of boekbaar, zie §2.5)

Duur en prijs per behandeling: [INVULLEN] — gebruik realistische placeholders (bijv. 60 min / € 75) en maak het ontwerp robuust voor variërende waarden.

---

## 7. Ruimtes, medewerkers en planningregels

**Ruimtes (resources):**
- **Rode Licht Ruimte** — alleen Rood Licht Therapie. Geen medewerker nodig: klanten boeken zelfstandig gedurende de volledige openingstijden, ook wanneer beide medewerkers bezet zijn. Slots in vast raster (§2.4).
- **Behandelruimte** — alle overige behandelingen. Maximaal één afspraak tegelijk, vereist een medewerker, plus buffertijd tussen afspraken.

Beide ruimtes zijn volledig onafhankelijk: een rode-licht-boeking blokkeert nooit de behandelruimte en andersom.

**Medewerkers:**
- **Chantal** — alle behandelingen.
- **Maaike** — een deel van de behandelingen (§2.2).
- Klant kiest een specifieke medewerker óf "geen voorkeur" (systeem toont dan de ruimste beschikbaarheid). Bij behandelingen die alleen Chantal doet, wordt de medewerkerkeuze overgeslagen.

**Openingstijden (boekbaarheid):**
maandag 12:00–20:30 · dinsdag t/m vrijdag 10:00–20:30 · zaterdag 10:00–15:30 · zondag gesloten.
Per medewerker eigen werkdagen/-tijden instelbaar (rooster), plus blokkades voor vakantie, pauze of privé-afspraken.

---

## 8. Klant-boekingsflow (te ontwerpen schermen)

**Stap 1 — Behandeling kiezen.** Luxe overzicht per categorie met foto, naam, duur, prijs en korte omschrijving. Grote sfeervolle kaarten, filterbaar per categorie. Rood Licht Therapie prominent vindbaar ("hele dag boekbaar").

**Stap 2 — Medewerker & moment.** Keuze medewerker (foto + naam, of "geen voorkeur"), daarna een elegante kalender met beschikbare dagen en tijdsloten. Toon alleen écht beschikbare slots. Mobiel: dagselectie horizontaal scrollend, slots als ruime tap-targets.

**Stap 3 — Gegevens.** Naam, e-mail, telefoon, opmerking (optioneel). Geen account, geen wachtwoord. Hier staat ook de **marketing opt-in**: een niet-vooraf-aangevinkte checkbox in de stijl van het merk — "Houd mij op de hoogte van acties en nieuws van The Healing Lounge" (EN-variant idem). AVG-noot: het vinkje mag wettelijk niet vooraf aangevinkt zijn; de klant zet het zelf aan. Wie het aanzet, komt automatisch in de marketinglijst (§11).

**Stap 4 — Documenten** (alleen indien van toepassing, §9).

**Stap 5 — Overzicht & bevestigen.** Samenvatting (behandeling, medewerker, datum/tijd, duur, prijs, "betaling in de salon na afloop" — de salon vraagt nadrukkelijk nooit vooruitbetaling; vermeld dit ook als vertrouwenssignaal). Daarna bevestigingsscherm met het "ritueel"-moment en: "Je ontvangt een bevestiging per e-mail met een agenda-uitnodiging."

Ontwerp ook: geen-beschikbaarheid-state, foutstate (slot net vergeven) en laad-states.

---

## 9. Documenten: inzien en ondertekenen

Per behandeling is één van drie flows ingesteld (beheerbaar in het CMS):

**A. Handtekening vereist.** Vóór bevestiging krijgt de klant het document/de documenten in een nette, goed leesbare viewer (scrollbaar, ook als download), in de taal van de klant. Onderaan: verplichte checkbox "Ik heb dit gelezen en ga akkoord" plus een veld waarin de klant zijn/haar **volledige naam typt als handtekening**, met een elegante handtekening-achtige weergave van de getypte naam. Pas daarna kan de boeking worden afgerond. Het systeem registreert: documentnaam + versie + taal, naam, datum en tijd. De salon ontvangt automatisch een e-mail met de bevestiging **inclusief waarvoor is getekend**; de klant krijgt het ondertekende document als kopie in de bevestigingsmail.

**B. Alleen informatie inzien.** De klant moet de informatie openen/doorlezen (bijv. aandachtspunten: niet scheren/waxen 24 uur vooraf, geen zonnebank 24 uur na, voldoende water drinken) en bevestigen met één checkbox "Gelezen en begrepen" — geen handtekening. Daarna pas verder.

**C. Geen document.** Stap wordt overgeslagen.

Bestaande documenten van de salon: *Contra-indicaties*, *Specifieke aandachtspunten per behandeling* (met secties voor honingbindweefselmassage, transformational cupping, honingpakking, magnesiumpakking en algemene nazorg), *Algemene voorwaarden*, *Privacyverklaring*. In het CMS worden documenten geüpload, geversioneerd, vertaald (NL/EN) en aan behandelingen gekoppeld.

Welke behandeling flow A, B of C krijgt: §2.3. Logische aanname voor het design: cupping en bindweefselmassages → A; pakkingen en rood licht → B; zonnestudio-info → C.

---

## 10. Afspraak beheren door de klant (magic link)

- De bevestigingsmail bevat een knop "Bekijk je afspraak" met een unieke token-link — **geen wachtwoord, geen account**; de link opent direct.
- De afspraakpagina toont: behandeling, medewerker, datum/tijd, locatie met routelink, voorbereidingsinstructies (uit §9) en de getekende verklaring (indien van toepassing). Onderaan: beheer van de marketingvoorkeur (aan-/afmelden).
- **Tot 24 uur van tevoren:** wijzigen (nieuwe datum/tijd kiezen via de flow van stap 2) en annuleren. Binnen 24 uur: knoppen vervangen door een vriendelijke melding met telefoonnummer ("Bel ons even, dan kijken we samen").
- Token verloopt na de afspraak (met korte nagloei voor de nazorginformatie); een nieuwe link is op te vragen via e-mailadres.
- Ontwerp ook de verlopen-link-state.

---

## 11. Marketingmodule — acties, nieuwsbrieven en templates

Een volwaardig maar rustig marketingonderdeel in de admin, in dezelfde luxe huisstijl.

**Marketinglijst:**
- Klanten die bij het boeken het opt-in-vinkje aanzetten (§8 stap 3) komen automatisch in de lijst, inclusief hun taal (NL/EN), naam en boekingshistorie.
- Iedere marketingmail bevat onderaan een verplichte, nette **afmeldlink**; afmelden werkt met één klik en toont een korte bevestigingspagina ("Je bent afgemeld — je afspraakbevestigingen blijf je gewoon ontvangen"). Transactionele mails (bevestiging, herinnering) staan los van deze voorkeur en gaan altijd door.
- In admin: lijst met abonnees, status (aangemeld/afgemeld, datum), zoeken, handmatig toevoegen/verwijderen, export.
- Aan-/afmeldhistorie wordt vastgelegd (AVG: aantoonbare toestemming met datum en bron).

**Templates met live preview:**
- Een bibliotheek met **kant-en-klare, high-end e-mailtemplates** in de huisstijl: bijvoorbeeld "Actie / aanbieding", "Nieuwsbrief", "Nieuwe behandeling", "Seizoensgroet", "Last-minute plekken vrij".
- Templates zijn opgebouwd uit blokken (hero-foto, titel, tekst, behandeling-uitlichting met foto en knop "Boek nu", actiecode-blok, galerij, afsluiting) die de salon zelf kan herschikken, toevoegen en verwijderen.
- **Live preview** naast de editor: wijzigingen direct zichtbaar, schakelbaar tussen desktop- en mobielweergave en tussen NL- en EN-versie. Foto's komen uit de mediabibliotheek van het CMS.
- Personalisatie-velden: voornaam van de klant, en automatische "Boek nu"-knoppen die direct naar de juiste behandeling in de boekingsflow linken.
- Templates zijn altijd aanpasbaar en op te slaan als eigen variant.

**Campagnes versturen:**
- Flow: template kiezen → inhoud aanpassen (NL en EN naast elkaar) → doelgroep kiezen (alle abonnees, of een eenvoudige selectie zoals "klanten met een afspraak in de laatste 6 maanden") → testmail naar jezelf sturen → direct versturen of inplannen op datum/tijd.
- Na verzending een rustig resultaatscherm: aantal verzonden, geopend, geklikt, afgemeld.
- Ontwerp ook: lege staat ("nog geen campagnes"), concept-overzicht, en een bevestigingsdialoog vóór verzending ("Je staat op het punt 214 klanten te mailen").

---

## 12. CMS — de hele website aanpasbaar via de backend

Alle content die een bezoeker of klant ziet, is zonder developer aan te passen, steeds met NL- en EN-velden naast elkaar:

- **Pagina's:** home, over ons, behandelingenoverzicht, individuele behandelpagina's, contact — teksten, koppen en volgorde van secties bewerkbaar.
- **Behandelingen:** alles uit §6, inclusief prijzen en duur, direct aanpasbaar; wijzigingen werken meteen door in de boekingsflow.
- **Mediabibliotheek:** foto's uploaden, ordenen en koppelen aan behandelingen, pagina's en marketingtemplates (vervangt het hotlinken uit §4 zodra de salon eigen beelden uploadt).
- **Documenten:** uploaden, versioneren, vertalen en koppelen aan behandelingen (§9).
- **E-mailteksten:** alle transactionele mails (§13) als bewerkbare templates met dezelfde live preview-aanpak als de marketingmodule.
- **Instellingen:** openingstijden, roosters, buffertijd, ochtendmail (tijdstip en ontvangers), contactgegevens, social links.

Ontwerp het CMS rustig en overzichtelijk: een zijbalknavigatie (Agenda · Afspraken · Behandelingen · Marketing · Pagina's · Media · Documenten · Klanten · Instellingen), geen overweldigende dashboards.

---

## 13. Transactionele e-mails (als visuele templates ontwerpen, in huisstijl, NL én EN)

1. **Bevestiging klant** — direct na boeking: alle details, ICS-bijlage ("voeg toe aan je agenda"), magic link, voorbereidingsinstructies, getekend document als kopie indien van toepassing, betaling-in-salon-melding.
2. **Bevestiging salon** — direct na boeking: wie, wat, wanneer, bij welke medewerker, plus expliciet de getekende verklaring(en) met naam en tijdstip van ondertekening.
3. **Dagelijkse ochtendagenda salon** — elke ochtend (§2.8) een nette mail met de volledige dagplanning: per medewerker chronologisch alle afspraken (tijd, klantnaam, behandeling, ruimte, telefoonnummer, opmerking, ⚠-markering bij eerste bezoek of getekende verklaring), rode-licht-boekingen apart gegroepeerd, en een samenvatting bovenaan ("Vandaag: 7 afspraken · Chantal 4 · Maaike 2 · Rood licht 1"). Op lege dagen een korte "geen afspraken vandaag"-variant.
4. **Herinnering klant** — 24 uur vóór de afspraak (precies op de wijzigingsdeadline): details, laatste moment om te wijzigen, voorbereidingsinstructies.
5. **Wijziging/annulering** — naar klant én salon, met oude en nieuwe gegevens.

Alle mails: dezelfde luxe huisstijl, logo, warm taalgebruik, mobielvriendelijk, automatisch in de taal van de klant.

---

## 14. Admin-agenda en beheer (voor Chantal & Maaike)

Net zo mooi en doordacht als de klantkant — geen kale beheerschermen.

**Agenda (kernscherm):**
- **Drie weergaven:** dagview (tijdlijn met kolommen per medewerker + aparte baan voor de Rode Licht Ruimte), weekview (ma–za), maandview (compacte dichtheidsweergave met aantal afspraken per dag, klikbaar naar de dag).
- **Filteren op medewerker:** snelle chips (Alles · Chantal · Maaike · Rood licht).
- **Weekselectie:** datumkiezer/weeknummer-navigatie om direct naar een gekozen week te springen, plus vandaag-knop en pijlnavigatie.
- **Kleurcodering:** vaste kleur per medewerker plus herkenbare tint voor rood licht; legenda zichtbaar; geblokkeerde tijden (pauze/vakantie) in neutrale arcering.
- **Afspraakkaart:** klantnaam, behandeling, tijd, duur; klik opent een detailpaneel met alle gegevens, getekende documenten en acties (wijzigen, annuleren, notitie, klant bellen/mailen).
- **Handmatig boeken:** afspraken toevoegen (telefonisch, walk-in) en tijden blokkeren direct vanuit de agenda (klik op een leeg slot).
- **Mobiel volwaardig:** de agenda wordt in de praktijk vooral op de telefoon gebruikt. Ontwerp mobiel als eersteklas ervaring: dagview als verticale tijdlijn met swipen tussen dagen, weekview als compacte lijst per dag, grote tap-targets, medewerker-filter bovenin, plakkerige "nieuwe afspraak"-knop.

**Overige adminschermen:** afsprakenlijst met zoeken/filteren; klantenoverzicht (historie per e-mailadres, notities, marketingstatus); roosters en blokkades per medewerker; uitzonderingsdagen.

---

## 15. Extra aanbevolen opties (advies — meenemen waar het design ze raakt)

1. **iCal-feed per medewerker** — Chantal en Maaike abonneren hun telefoonagenda op een privé-kalenderlink, zodat de planning live in hun eigen agenda staat naast de ochtendmail.
2. **Review-verzoek na afloop** — automatische mail enkele uren na de behandeling met nazorgtips en een Google-review-link (de salon staat op 4.9; dit versterkt dat).
3. **No-show-registratie** — afspraak als no-show markeren; zichtbaar in de klantgeschiedenis.
4. **Wachtlijst** — bij een volgeboekte dag e-mail achterlaten; bij annulering automatisch bericht ("er is een plek vrijgekomen").
5. **Audit-trail handtekeningen** — per ondertekening documentversie, taal en tijdstempel bewaren en tonen in admin; juridisch veel sterker dan alleen "akkoord". Leg ook een AVG-bewaartermijn vast.
6. **Eerste-bezoek-herkenning** — nieuwe klanten (e-mailadres) gemarkeerd in agenda en ochtendmail, zodat het team extra tijd en aandacht kan inplannen.
7. **Cadeaubon-/actiecodeveld** — optioneel veld bij het boeken; sluit aan op de marketingacties (§11) en kanaliseert de giveaways waar de salon nu voor nep-accounts moet waarschuwen.
8. **Dagnotities in de agenda** — vrij notitieveld per dag voor het team ("bank 3 in onderhoud").
9. **Statistiek-dashboardje** — bezetting per week, populairste behandelingen, verdeling Chantal/Maaike, plus de marketingcijfers uit §11. Klein houden: enkele rustige kaarten, geen druk BI-scherm.
10. **Verjaardags- of terugkom-mail** — optionele automatische marketingmail ("we hebben je gemist — boek je volgende moment voor jezelf") voor klanten die langer dan X maanden niet geweest zijn, via dezelfde templates.

---

## 16. Deliverables voor de designer

Ontwerp desktop én mobiel van:

**Publieke website (NL/EN):** (1) homepagina, (2) behandelingenoverzicht, (3) behandeldetailpagina, (4) over ons, (5) contact, (6) taalswitcher-gedrag.

**Boekingsflow:** (7) medewerker/tijdkeuze, (8) gegevens incl. marketing opt-in, (9) documenten-inzien-flow B, (10) onderteken-flow A, (11) overzicht & bevestiging met succesmoment, (12) klant-afspraakpagina via magic link incl. wijzigen/annuleren, verlopen-link en marketingvoorkeur.

**Admin:** (13) dagview, (14) weekview, (15) maandview, (16) afspraakdetail + handmatig boeken, (17) behandelingenbeheer, (18) documentenbeheer, (19) pagina-/CMS-editor met NL/EN naast elkaar, (20) mediabibliotheek, (21) marketinglijst/abonnees, (22) template-editor met live preview (desktop/mobiel, NL/EN), (23) campagne-verstuurflow met bevestigingsdialoog en resultaatscherm, (24) instellingen.

**E-mails (NL/EN):** (25) de vijf transactionele mails uit §13 en (26) minimaal twee marketingtemplates uit §11 (actie + nieuwsbrief).

**States:** (27) lege, fout- en laad-states van boekingsflow, agenda en marketingmodule.

Gebruik overal realistische Nederlandse en Engelse dummy-data (echte behandelnamen uit §6, namen Chantal en Maaike, plausibele tijden binnen de openingstijden) en de foto's uit §4. Alles in de "stille luxe"-richting van §3.
