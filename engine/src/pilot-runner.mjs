// ONDA · Ensayos aislados, sin efectos laterales y sin publicación.
// La política de pilotos es distinta de la configuración efectiva de ingesta.
const VALID_STAGE = new Set(['fixture', 'read-only', 'paused']);
const validNow = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

export function evaluatePilot(source, policy, state={}, now=new Date().toISOString()) {
  if (!source || !policy || source.id !== policy.sourceId) return {due:false,reason:'fuente no coincide'};
  if (!VALID_STAGE.has(policy.stage)) return {due:false,reason:'etapa de piloto desconocida'};
  if (policy.stage !== 'read-only') return {due:false,reason:'etapa '+policy.stage+': sin consultas'};
  if (!source.enabled || source.permission !== 'approved' || !source.permissionEvidence)
    return {due:false,reason:'acceso no aprobado o conector desactivado'};
  if (source.publicationPolicy !== 'review')
    return {due:false,reason:'ensayo exige política de revisión, no publicación'};
  if (source.adapter !== 'jsonld-event-html')
    return {due:false,reason:'adaptador real no implementado'};
  if (!Number.isInteger(policy.cadenceHours) || policy.cadenceHours < 24)
    return {due:false,reason:'frecuencia no segura'};
  if (!validNow(now)) return {due:false,reason:'fecha actual inválida'};
  if (policy.notBefore && (!validNow(policy.notBefore) || Date.parse(now)<Date.parse(policy.notBefore)))
    return {due:false,reason:'ventana de ensayo todavía no abierta'};
  const last = state?.sources?.[source.id]?.lastAttemptAt;
  if (last) {
    if (!validNow(last)) return {due:false,reason:'último intento inválido'};
    const elapsed = Date.parse(now)-Date.parse(last);
    if (elapsed < policy.cadenceHours * 3600000)
      return {due:false,reason:'frecuencia: próxima revisión pendiente'};
  }
  return {due:true,reason:'revisión de solo lectura habilitada'};
}

export async function runIsolatedPilots({sources,policies,state={},fetchOne,now=new Date().toISOString()}) {
  if (!Array.isArray(sources) || !Array.isArray(policies) || typeof fetchOne !== 'function')
    throw Error('configuración de pilotos inválida');
  const results=[];
  for (const policy of policies) {
    const source=sources.find(s=>s.id===policy.sourceId);
    const check=evaluatePilot(source,policy,state,now);
    if (!check.due) {
      results.push({sourceId:policy.sourceId,status:'omitida',reason:check.reason,checkedAt:now,networkAttempted:false});
      continue;
    }
    try {
      const res=await fetchOne(source);
      const amount=Array.isArray(res?.candidates) ? res.candidates.length : 0;
      const problems=Array.isArray(res?.issues) ? res.issues.length : 0;
      results.push({sourceId:source.id,status:res?.ok&&amount>0&&problems===0?'válida':'degradada',
        reason:!res?.ok?String(res?.error||'falló la consulta').slice(0,200):amount===0?'sin eventos estructurados':problems>0?'errores en el parser':'candidatos recibidos; requiere revisión',
        found:amount,issues:problems,checkedAt:now,networkAttempted:true});
    } catch(error) {
      results.push({sourceId:source.id,status:'degradada',reason:String(error?.message||error).slice(0,200),
        found:0,issues:1,checkedAt:now,networkAttempted:true});
    }
  }
  // Este módulo jamás llama a updatePipeline ni escribe a disco o a la red directamente.
  return {runAt:now,mode:'read-only',publicationAllowed:false,results};
}
