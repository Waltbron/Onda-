#!/usr/bin/env node
// Genera cola de revisión documental. No realiza capturas externas.
import fs from 'node:fs';
import {planSources} from '../engine/src/source-planner.mjs';
const inventory=JSON.parse(fs.readFileSync('data/source-inventory-75.json','utf8'));
const connected=JSON.parse(fs.readFileSync('data/sources.json','utf8'));
const report=planSources(inventory,connected);
fs.mkdirSync('data/reports',{recursive:true});
fs.writeFileSync('data/reports/source-plan.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,active:report.active,accessReview:report.accessReview,missingUrl:report.missingUrl,byLayer:report.byLayer,report:'data/reports/source-plan.json'},null,2));
