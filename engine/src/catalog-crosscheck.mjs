// Cruza candidatos nuevos contra catálogo manual sin fusionar automáticamente.
// Identidad propuesta para revisión editorial antes de reutilizar un ID existente.
const normalize=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\b(el|la|los|las|de|del|en|un|una|al|con|por|para|the)\b/g,' ').trim().replace(/\s+/g,' ');
function sim(a,b){const A=new Set(normalize(a).split(' ').filter(Boolean)),B=new Set(normalize(b).split(' ').filter(Boolean));const intersection=[...A].filter(w=>B.has(w)).length;return intersection/Math.max(1,Math.min(A.size,B.size));}
export function crosscheckManual(manual, candidates, aliasMap={}) {
  const possibleMatches=[];
  for(const c of candidates){
    const aliasKey=`${c.sourceId}|${c.sourceUrl}`;
    const aliasId=aliasMap[aliasKey];
    if(aliasId && !manual.some(e=>e.id===aliasId))throw Error('alias points to unknown manual id: '+aliasKey);
    const byDate=manual.filter(e=>e.date===c.date && ((e.sourceName||'').toLowerCase().includes('maca')||(e.id||'').startsWith('maca-')));
    const candidatesFound=aliasId?[{eventId:aliasId,method:'editorial-candidate-alias'}]:byDate.filter(e=>sim(e.title,c.title)>=0.72).map(e=>({eventId:e.id,method:'title-date-similarity-needs-review'}));
    for(const m of candidatesFound)possibleMatches.push({...m,sourceUrl:c.sourceUrl,sourceTitle:c.title});
  }
  return possibleMatches;
}
