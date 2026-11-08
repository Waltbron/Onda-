import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeCoverageAudits} from '../src/coverage-audit.mjs';
const evidence={id:'event-a',event:'Festival cultural',date:'2026-11-08',sourceUrl:'https://maldonado.gub.uy/actividades/festival',wasMissing:true};
const audit={schemaVersion:'1.0',auditDate:'2026-11-08',evidence:[evidence]};
const sources=[{url:'https://www.maldonado.gub.uy/actividades',enabled:false,permission:'pending',publicationPolicy:'review'}];
test('registra omisión pasada y corrección manual presente',()=>{
 const r=summarizeCoverageAudits({audits:[audit],catalog:[{id:'event-a'}],sources});
 assert.equal(r.missedPreviously,1);assert.equal(r.resolved,1);assert.equal(r.stillMissing,0);assert.equal(r.coverageRate,null);
});
test('registra brecha aún pendiente si el evento no figura',()=>{
 const r=summarizeCoverageAudits({audits:[audit],catalog:[],sources});
 assert.equal(r.stillMissing,1);assert.equal(r.items[0].likelyGap,'sin-conector-activo');assert.equal(r.items[0].sourceRegistered,true);
});
test('no confunde muestra auditada con tasa total de cobertura',()=>{
 const r=summarizeCoverageAudits({audits:[audit]});assert.equal(r.coverageRate,null);
});
test('una auditoría sin evidencia no produce un falso evento',()=>{
 const r=summarizeCoverageAudits({audits:[{schemaVersion:'1.0',auditDate:'2026-11-08'}]});
 assert.equal(r.sampleSize,0);assert.equal(r.issues.length,1);
});
test('no duplica el mismo caso en la misma auditoría',()=>{
 const r=summarizeCoverageAudits({audits:[{...audit,evidence:[evidence,evidence]}]});assert.equal(r.sampleSize,1);assert.equal(r.issues.length,1);
});
