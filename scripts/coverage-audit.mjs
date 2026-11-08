#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {summarizeCoverageAudits} from '../engine/src/coverage-audit.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=r=>JSON.parse(fs.readFileSync(path.join(root,r),'utf8'));
const auditDir=path.join(root,'data','audits');
const files=fs.existsSync(auditDir)?fs.readdirSync(auditDir).filter(f=>/^\d{4}-\d{2}-\d{2}.*\.json$/.test(f)).sort():[];
const audits=files.map(f=>read('data/audits/'+f));
const report=summarizeCoverageAudits({audits,catalog:[...read('data/manual.json'),...read('data/automatic.json')],sources:read('data/sources.json')});
fs.mkdirSync(path.join(root,'data/reports'),{recursive:true});
fs.writeFileSync(path.join(root,'data/reports/coverage-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({audits:report.audits,missedPreviously:report.missedPreviously,resolved:report.resolved,stillMissing:report.stillMissing,activeSources:report.activeSources,coverageRate:report.coverageRate,issues:report.issues.length},null,2));
if(report.issues.length)process.exitCode=1;
