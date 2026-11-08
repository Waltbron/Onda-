#!/usr/bin/env node
// Auditoría de calidad barata: solo lee archivos locales, no hace requests.
import {readFileSync,writeFileSync,mkdirSync,existsSync,appendFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditQuality} from '../engine/src/quality-audit.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const radarPath=path.join(root,'data/reports/radar-review.json');
const report=auditQuality({
  events:read('site/data/events.json'),
  sources:read('data/sources.json'),
  meta:read('site/data/meta.json'),
  radar:existsSync(radarPath)?read('data/reports/radar-review.json'):null
});
const output=path.join(root,'data/reports/quality-audit.json');
mkdirSync(path.dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
const m=report.metrics;
const rows=[
  '### ONDA · Auditoría ligera de calidad',
  '| Indicador interno | Resultado |','|---|---:|',
  '| Fichas en el catálogo | '+m.publishedTotal+' |',
  '| Vigentes ahora | '+m.activeNow+' |',
  '| No vigentes | '+m.notCurrent+' |',
  '| Actividades de los próximos 7 días | '+m.availableNext7Days+' |',
  '| Actividades de los próximos 30 días | '+m.availableNext30Days+' |',
  '| Conectores automáticos activos | '+m.activeConnectors+' |',
  '| Candidatos Radar pendientes | '+(m.radarPending===null?'sin informe':m.radarPending)+' |',
  '| Problemas de integridad | '+report.invalid.length+' |',
  '| Duplicados posibles | '+report.possibleDuplicates.length+' |',
  '| Fichas vigentes con revisión antigua | '+report.staleChecks.length+' |',
  '',
  '**Próximas acciones por prioridad:**',
  ...report.findings.slice(0,5).map(x=>'- '+x.priority+' · '+x.action),
  '',
  '_Sin IA, sin red y sin publicación; las métricas NO representan cobertura de todo el mercado._',''
].join('\n');
console.log(rows);
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,rows+'\n');
console.log('Informe: data/reports/quality-audit.json');
