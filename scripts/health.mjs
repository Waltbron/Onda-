// Se ejecuta al final de GitHub Actions, DESPUÉS de registrar el estado.
// Cualquier fuente degradada o desactualizada genera una alerta roja sin borrar el último catálogo.
import fs from 'node:fs';
import {evaluateHealth} from '../engine/src/health.mjs';
const load=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const result=evaluateHealth({report:load('data/reports/latest.json'),state:load('data/state.json'),sources:load('data/sources.json')});
if(!result.ok){
 console.error('ONDA: fuentes con incidentes',result.incidents.map(x=>`${x.sourceId} [${x.type}]: ${x.detail}`).join(' | '));
 process.exitCode=1;
}else console.log('ONDA: sin incidentes registrados en la última ejecución.');
