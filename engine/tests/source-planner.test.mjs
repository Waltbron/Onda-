import test from 'node:test';
import assert from 'node:assert/strict';
import {planSources} from '../src/source-planner.mjs';
const inventory={sources:[
  {id:'redtickets',name:'RedTickets',layerName:'Ticketeras',url:'https://redtickets.uy/',priority:'alta',trust:'A',legalReview:'pendiente',endpointObserved:true,methodCandidate:'pagina-publica'},
  {id:'cartelera',name:'Cartelera',layerName:'Medios y agendas',url:null,priority:'media'}
]};
test('planifica fuentes sin publicar ni confundir existencia de URL con permiso',()=>{
 const p=planSources(inventory,[], '2026-11-21T21:00:00Z');
 assert.equal(p.total,2);assert.equal(p.active,0);assert.equal(p.published,false);assert.equal(p.networkRequests,0);
 assert.equal(p.sources[0].id,'redtickets');assert.equal(p.sources[0].status,'revision-de-acceso');assert.equal(p.sources[0].authorized,false);
 assert.equal(p.missingUrl,1);
});
test('solamente habilita estado activo con permiso explícito, activación y política automática',()=>{
 const cfg={id:'redtickets',url:'https://redtickets.uy/',enabled:true,permission:'pending',publicationPolicy:'automatic'};
 assert.equal(planSources(inventory,[cfg]).active,0);
 assert.equal(planSources(inventory,[{...cfg,permission:'approved',publicationPolicy:'review'}]).active,0);
 assert.equal(planSources(inventory,[{...cfg,permission:'approved'}]).active,1);
});
test('bloquea IDs duplicados en inventario',()=>assert.throws(()=>planSources({sources:[inventory.sources[0],inventory.sources[0]]}),/duplicado/));

test('varias agendas del mismo dominio requieren conectores independientes',()=>{
 const custom={sources:[{...inventory.sources[0],id:'redtickets-otro',url:'https://redtickets.uy/agenda-distinta'}]};
 const connector={id:'redtickets',url:'https://redtickets.uy/',enabled:true,permission:'approved',publicationPolicy:'automatic'};
 const plan=planSources(custom,[connector]);
 assert.equal(plan.active,0);
 assert.equal(plan.sources[0].connectionFound,false);
});
