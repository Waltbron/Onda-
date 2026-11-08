#!/usr/bin/env node
// ONDA V3.0, operador determinístico. No escritura de HTML de terceros ni de credenciales.
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {updatePipeline} from '../engine/src/pipeline.mjs';
import {parseJSONLDEvents} from '../engine/src/html-adapter.mjs';
import {fetchSource} from '../engine/src/live.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const mode=(args.find(a=>a.startsWith('--mode='))||'--mode=fixture').split('=')[1];
const publish=args.includes('--publish'), preview=args.includes('--write-preview');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const write=(relative,value)=>{const p=path.join(ROOT,relative);fs.mkdirSync(path.dirname(p),{recursive:true});const tmp=p+'.tmp-'+process.pid;fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');fs.renameSync(tmp,p)};
const sources=read('data/sources.json'), manual=read('data/manual.json'),automatic=read('data/automatic.json'),state=read('data/state.json'),overrides=read('data/overrides.json');
const suggestedAliases=read('data/candidate-aliases.json');
const now=new Date().toISOString();
if(!['fixture','live'].includes(mode))throw Error('Modo inválido: fixture o live');
if(mode==='fixture'&&publish)throw Error('BLOQUEADO: nunca publicar ejemplos');
if(publish&&process.env.ONDA_AUTOMATION_ENABLED!=='true')throw Error('BLOQUEADO: ONDA_AUTOMATION_ENABLED debe ser true');
const results=[];
if(mode==='fixture'){
  const html=fs.readFileSync(path.join(ROOT,'engine/fixtures/maca-jsonld-ejemplo.html'),'utf8');
  const fixtureSource={...sources[0],enabled:true,permission:'approved',publicationPolicy:'automatic'};
  const parsed=parseJSONLDEvents(html,{sourceId:fixtureSource.id,baseUrl:fixtureSource.url,sourceName:fixtureSource.name,city:fixtureSource.city});
  results.push({sourceId:fixtureSource.id,ok:true,candidates:parsed.candidates,issues:parsed.issues});
} else if(process.env.ONDA_AUTOMATION_ENABLED==='true') {
  for(const source of sources.filter(s=>s.enabled))results.push(await fetchSource(source));
}
let runSources=mode==='fixture'?[{...sources[0],enabled:true,permission:'approved',publicationPolicy:'automatic'}]:sources;
const output=updatePipeline({manual,automatic,state,sources:runSources,results,overrides,suggestedAliases,now,mode});
console.log(JSON.stringify({mode,publish,runAt:now,activeSources:output.report.activeConnectors,report:output.report},null,2));
if(mode==='fixture'){
  if(preview){write('output/fixture-report.json',output.report);write('output/fixture-public-preview.json',output.publicEvents)}
  console.log('ENSAYO: no se alteraron ni catálogo ni estado de publicación.');
} else if(publish&&results.length){
  // Registrar SIEMPRE la salud de la fuente, incluso si falló o solo permite revisión.
  write('data/state.json',output.state);
  write('data/reports/latest.json',output.report);
  const successes=output.report.sources.filter(s=>s.status==='ok'||s.status==='revisión');
  if(!successes.length){
    console.error('ATENCIÓN: ninguna fuente fue procesada correctamente; se preserva el catálogo público.');
    // El estado degradado se deja listo para commit; un paso posterior del workflow marcará la alerta.
  } else if(output.report.sources.some(s=>s.status==='ok')){
    write('data/automatic.json',output.automatic);
    write('site/data/events.json',output.publicEvents);
    write('site/data/meta.json',{
      project:'ONDA',version:'3.0',catalogType:'manual-plus-verified-automated',
      automaticIngestionEnabled:true,activeConnectors:output.report.activeConnectors,
      lastSuccessfulRunAt:output.state.lastSuccessfulRunAt,timezone:'America/Montevideo',
      notice:'ONDA no vende entradas. Confirmá posibles cambios en la fuente original.'
    });
  } else {
    console.log('FUENTE EN REVISIÓN: informe y salud actualizados, sin publicar cambios de eventos.');
  }
} else if(publish&&mode==='live'&&!results.length){
  // Desactivar una fuente no debe mantener para siempre una etiqueta "actualización automática activa".
  const meta=read('site/data/meta.json');
  if(meta.activeConnectors || meta.automaticIngestionEnabled){
    write('site/data/meta.json',{...meta,activeConnectors:0,automaticIngestionEnabled:false,notice:'La captura automática está pausada. Verificá cambios en la fuente.'});
    write('data/reports/latest.json',output.report);
    console.log('AUTOMATIZACIÓN PAUSADA: estado visible corregido; catálogo anterior conservado.');
  }else console.log('Sin fuentes habilitadas. No hay trabajo ni cambios para publicar.');
} else {
  console.log('MODO LECTURA: sin publicación. Para automatizar, habilitar permisos y ejecutar --mode=live --publish.');
}
