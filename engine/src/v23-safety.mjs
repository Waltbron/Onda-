// Puertas de seguridad de la Fase 1: aplica sobre salidas determinísticas.
// Los eventos nuevos siguen 'dudoso'; SIN promoción pública automática.
export function qualityGate(previous, result, {sourceId,minimumExpected=1,minCoverage=0.5,maxChangeRatio=0.3}={}) {
  const priorSource=previous.filter(e=>e.sourceId===sourceId), candidateSource=result.events.filter(e=>e.sourceId===sourceId);
  const issues=[];
  if(result.report.degraded)issues.push(result.report.reason);
  if(result.report.unchanged+result.report.updated+result.report.new<minimumExpected)issues.push('below-minimum-expected');
  // No comparar faltantes como bajas: un listado parcial no demuestra retirada.
  if(priorSource.length>=5 && candidateSource.length<priorSource.length*minCoverage)issues.push('source-drop-anomaly');
  if(priorSource.length>=10 && (result.report.new+result.report.updated)/priorSource.length>maxChangeRatio)issues.push('large-change-set-review');
  if(issues.length)return {...result,events:previous.map(e=>({...e})),changes:[],report:{...result.report,degraded:true,publication:'blocked',reasons:issues}};
  return {...result,report:{...result.report,publication:'staging-only',promotableToPublic:false}};
}
export function publicationPreview(manual,staging,potentialDuplicates=[]){
  // Solo catálogo manual y eventos previamente verificados por proceso EXTERNO.
  // Nunca incluir en feed público nuevos eventos no revisados.
  const ids=new Set(manual.map(e=>e.id));
  const duplicateUrls=new Set(potentialDuplicates.map(e=>e.sourceUrl));
  const extra=staging.filter(e=>e.status==='verificado'&&!e.demo&&!ids.has(e.id)&&!duplicateUrls.has(e.sourceUrl));
  return [...manual,...extra];
}
