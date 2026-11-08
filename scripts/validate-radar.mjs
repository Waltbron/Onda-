#!/usr/bin/env node
// ONDA · Inspección local de un lote de radar: nunca publica ni consulta sitios.
import {readFileSync} from 'node:fs';
import {inspectRadarBatch} from '../engine/src/radar-intake.mjs';
const file=process.argv[2];
if(!file || process.argv.slice(2).some(a=>a.startsWith('--'))){
 console.error('Uso: node scripts/validate-radar.mjs <lote-radar.json>');
 process.exit(2);
}
try{
 const data=JSON.parse(readFileSync(file,'utf8'));
 const report=inspectRadarBatch(data);
 console.log(JSON.stringify(report,null,2));
 if(report.rejectedCount)process.exitCode=1;
}catch(e){
 console.error('Radar inválido: '+e.message);
 process.exitCode=2;
}
