// Evalúa la salud de las fuentes SIN tocar datos. Lo usa scripts/health.mjs al final de cada corrida.
// Incidente = fuente degradada/bloqueada en la última corrida, o fuente habilitada sin éxito reciente.
export const STALE_HOURS=36;
export function evaluateHealth({report={},state={},sources=[],now=new Date().toISOString(),staleHours=STALE_HOURS}={}){
  const incidents=[];
  for(const x of report.sources||[]){
    if(['degradada','bloqueada'].includes(x.status))incidents.push({sourceId:x.sourceId,type:'fallo',detail:x.error||x.status});
  }
  const nowMs=Date.parse(now);
  for(const s of sources.filter(s=>s.enabled&&s.permission==='approved')){
    const last=state.sources?.[s.id]?.lastSuccessAt;
    if(!last)continue; // sin historial todavía: no es "desactualizada", es nueva
    const hours=(nowMs-Date.parse(last))/36e5;
    if(Number.isFinite(hours)&&hours>staleHours)incidents.push({sourceId:s.id,type:'desactualizada',detail:`sin éxito hace ${Math.floor(hours)} h (límite ${staleHours} h)`});
  }
  return {ok:incidents.length===0,incidents};
}
