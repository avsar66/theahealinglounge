/* THE HEALING LOUNGE — Beheer 2.0 · shared utils (dates etc.) */
(function(){
  const MON={january:0,februari:1,february:1,maart:2,march:2,april:3,mei:4,may:4,juni:5,june:5,juli:6,july:6,augustus:7,august:7,september:8,oktober:9,october:9,november:10,december:11,januari:0};
  const MON_NL=['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  const DAY_NL=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  function parse(s){ // "10 June 2026 10:00"
    if(!s) return null;
    const m=String(s).match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if(!m) { const d=new Date(s); return isNaN(d)?null:d; }
    const mo=MON[m[2].toLowerCase()]; if(mo==null) return null;
    return new Date(+m[3], mo, +m[1], m[4]?+m[4]:0, m[5]?+m[5]:0);
  }
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function fmtDate(d){ return DAY_NL[d.getDay()]+' '+d.getDate()+' '+MON_NL[d.getMonth()]; }
  function fmtTime(d){ return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function eur(n){ return '€ '+(Math.round(n*100)/100).toFixed(2).replace('.',','); }
  function priceNum(s){ const m=String(s||'').match(/([\d]+[.,]?\d*)/); return m?parseFloat(m[1].replace(',','.')):0; }
  window.admUtil={parse, iso, fmtDate, fmtTime, eur, priceNum, MON_NL, DAY_NL, NOW:new Date(2026,5,10,9,0)};
})();
