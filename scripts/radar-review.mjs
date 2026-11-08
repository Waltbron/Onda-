#!/usr/bin/env node
// Convierte pistas de data/radar en un informe de revisión; no publica eventos.
import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateRadarInboxes} from '../engine/src/radar-review.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(readFileSync(path.join(root,p),'utf8'));
const dir=path.join(root,'data/radar');
const files=readdirSync(dir).filter(n=>/^inbox-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
const inboxes=files.map(file=>({file,data:read('data/radar/'+file)}));
const report=evaluateRadarInboxes({inboxes,manual:read('data/manual.json'),automatic:read('data/automatic.json')});
const out=path.join(root,'data/reports/radar-review.json');
mkdirSync(path.dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({mode:report.mode,published:report.published,sourceFiles:report.sourceFiles,total:report.total,pending:report.pending,expired:report.expired,possibleDuplicates:report.possibleDuplicates,invalid:report.invalid,reportPath:'data/reports/radar-review.json'},null,2));
if(report.invalid) process.exitCode=1;
