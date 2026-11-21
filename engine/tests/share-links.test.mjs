import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const scope={URL,encodeURIComponent};
scope.globalThis=scope;
runInNewContext(readFileSync(new URL('../../site/share.js',import.meta.url),'utf8'),scope);
const share=scope.ONDAShare;
const e={id:'onda-abc123',title:'Jam del bosque',date:'2026-11-28',time:'19:30',place:'Parque El Jagüel',city:'Maldonado',cost:'UYU 250'};
test('el enlace compartido abre la ficha en ONDA y no traslada parámetros publicitarios',()=>{
 const u=new URL(share.permalink('https://onda-lab-hormiga.netlify.app/?utm_source=red#agenda',e.id));
 assert.equal(u.searchParams.get('plan'),e.id);assert.equal(u.searchParams.has('utm_source'),false);assert.equal(u.hash,'');
});
test('WhatsApp contiene evento, fecha, lugar, direcciones y enlace profundo',()=>{
 const u=new URL(share.whatsapp(e,'https://onda-lab-hormiga.netlify.app/'));
 assert.equal(u.hostname,'wa.me');const text=u.searchParams.get('text');
 assert.ok(text.includes('Jam del bosque'));assert.ok(text.includes('28/11/2026 a las 19:30 h'));
 assert.ok(text.includes('Cómo llegar: https://www.google.com/maps/search/'));
 assert.ok(text.includes('https://onda-lab-hormiga.netlify.app/?plan=onda-abc123'));
});
test('no acepta identificadores maliciosos ni enlaces sin protocolo web',()=>{
 assert.throws(()=>share.permalink('https://onda-lab-hormiga.netlify.app/','<script>alert</script>'));
 assert.throws(()=>share.permalink('javascript:alert(1)',e.id));
});
test('si hay dirección física, evita inventar otro nombre de sede en Maps',()=>{
 const url=share.directions({...e,address:'Ruta 104 km 4,5, Manantiales'});
 assert.ok(decodeURIComponent(url).includes('Ruta 104 km 4,5'));
 assert.equal(url.includes('Parque%20El%20Jag%C3%BCel'),false);
});
