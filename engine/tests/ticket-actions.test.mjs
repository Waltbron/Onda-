import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const ctx={URL};ctx.globalThis=ctx;
runInNewContext(readFileSync(new URL('../../site/ticket-actions.js',import.meta.url),'utf8'),ctx);
const access=ctx.ONDATickets.access;
const events=JSON.parse(readFileSync(new URL('../../site/data/events.json',import.meta.url),'utf8'));
test('un enlace directo real muestra acceso útil',()=>{
 const e=events.find(x=>x.id==='redtickets-narakan-jam-20261122');
 assert.equal(access(e).hasDirectTicket,true);
 assert.match(access(e).url,/redtickets\.uy\/evento\//);
 assert.equal(access(e).label,'Ver entradas ↗');
});
test('jazz MACA apunta al evento y no a la portada de la plataforma',()=>{
 const e=events.find(x=>x.id==='maca-mas-que-jazz-las-rodetts-20261128');
 assert.equal(access(e).url,'https://entradas.macamuseo.org/evento/las-rodetts');
 assert.equal(access(e).label,'Reservar ↗');
});
test('portada de ticketeras no se disfraza de entrada al evento',()=>{
 const e={title:'Actividad',category:'Cultura',sourceUrl:'https://macamuseo.org/eventosmaca',ticketUrl:'https://entradas.macamuseo.org/'};
 assert.equal(access(e).hasDirectTicket,false);
 assert.equal(access(e).label,'Fuente oficial ↗');
 assert.equal(access(e).url,e.sourceUrl);
});
test('sin ticket ni fuente válida, no se inventa enlace',()=>{
 assert.equal(access({ticketUrl:'javascript:alert(1)'}).hasDirectTicket,false);
 assert.equal(access({ticketUrl:'http://ejemplo.uy/entradas',sourceUrl:'http://ejemplo.uy'}).url,null);
 assert.equal(access({ticketUrl:'https://bad.uy/registro',sourceUrl:'https://bien.uy/agenda'}).hasDirectTicket,false);
});
test('la interfaz expone CTA directo pero no elimina detalle y WhatsApp',()=>{
 const app=readFileSync(new URL('../../site/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../../site/index.html',import.meta.url),'utf8');
 assert.match(app,/ticketAction\(e\)/);assert.match(app,/TIX\.access\(e\)/);
 assert.match(app,/wa-cta/);assert.match(app,/detail-btn/);
 assert.match(html,/ticket-actions\.js/);
});
test('la ingesta preserva el manifiesto y versión visual',()=>{
 const code=readFileSync(new URL('../../scripts/run.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(code,/version:'3\.1 · Biblioteca visual/);
 assert.match(code,/\.{3}read\('site\/data\/meta\.json'\)/);
});
