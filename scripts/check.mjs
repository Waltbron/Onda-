import fs from 'node:fs';
const load=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const base=load('data/manual.json'),published=load('site/data/events.json'),auto=load('data/automatic.json'),sources=load('data/sources.json'),meta=load('site/data/meta.json');
if(base.length<29)throw Error('Baseline manual inferior a las 29 fichas originales');
const ids=new Set(base.map(x=>x.id));
if(ids.size!==base.length)throw Error('ID duplicado en registros manuales');
for(const id of ids)if(!published.some(x=>x.id===id))throw Error('Ficha manual sin publicación: '+id);
if(new Set(published.map(x=>x.id)).size!==published.length)throw Error('ID duplicado');
for(const e of published){if(!e.id||!e.sourceUrl||!e.date||!e.title)throw Error('Ficha incompleta: '+e.id);if(!e.sourceUrl.startsWith('https://'))throw Error('Fuente insegura')}
const eligible=sources.filter(s=>s.enabled&&s.permission==='approved'&&s.publicationPolicy==='automatic').length;
if(meta.activeConnectors!==eligible)console.warn('AVISO: metadatos de despliegue y configuración de fuentes difieren, falta ejecutar ingesta para sincronizar estado.');
console.log(`ONDA VALIDACIÓN OK: ${base.length} fichas manuales, ${auto.length} automáticas, ${published.length} publicadas, ${meta.activeConnectors} conectores activos`);
