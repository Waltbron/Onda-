import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTicketeraFeed,fetchPartnerTicketera} from '../src/ticketera-feed.mjs';
import {updatePipeline} from '../src/pipeline.mjs';
const source={id:'partner-demo',name:'Ticketera asociada de prueba',adapter:'partner-ticket-feed-json',url:'https://feed.organizador.example/agenda.json',expectedHost:'feed.organizador.example',partnerName:'TicketerA',allowedEventHosts:['tickets.organizador.example'],minItems:1,enabled:true,permission:'approved',authorizationType:'direct-partner-feed',permissionEvidence:'https://organizador.example/acuerdo-del-feed',publicationPolicy:'automatic'};
const event={id:'evt-8',title:'Concierto de música en Maldonado',city:'Maldonado',category:'Música',date:'2026-12-12',time:'21:00',venue:'Sala organizadora',eventUrl:'https://tickets.organizador.example/e/evt-8',ticketUrl:'https://tickets.organizador.example/e/evt-8',status:'confirmed',price:{amount:390,currency:'UYU',label:'desde'}};
const feed={version:1,partner:'TicketerA',events:[event]};
const when='2026-11-21T21:00:00Z';
test('feed consentido convierte precio, ticketera, evidencia y procedencia',()=>{
 const [c]=normalizeTicketeraFeed(feed,source,when);
 assert.equal(c.priceAmount,390);assert.equal(c.priceTier,'pago');assert.equal(c.ticketera,'TicketerA');assert.equal(c.ticketUrl,event.ticketUrl);
 assert.equal(c.sourceVerification,'authorized-partner-feed');assert.ok(c.evidence.some(e=>e.field==='price'));});
test('no permite fingir aprobación ni aceptar host ajeno',()=>{
 assert.throws(()=>normalizeTicketeraFeed(feed,{...source,permission:'pending'},when));
 assert.throws(()=>normalizeTicketeraFeed({ ...feed,events:[{...event,eventUrl:'https://cobraticket.uy/evento'}]},source,when));
});
test('sin fecha concreta, estado explícito ni precio válido no promueve',()=>{
 assert.throws(()=>normalizeTicketeraFeed({...feed,events:[{...event,date:'2026-12'}]},source,when));
 assert.throws(()=>normalizeTicketeraFeed({...feed,events:[{...event,status:null}]},source,when));
 assert.throws(()=>normalizeTicketeraFeed({...feed,events:[{...event,price:{amount:-5,currency:'UYU'}}]},source,when));
});
test('una ficha repetida en un feed completo degrada la fuente',()=>{
 assert.throws(()=>normalizeTicketeraFeed({...feed,events:[event,event]},source,when));
});
test('HTTP de un socio en prueba se integra con pipeline, idempotencia y etiquetas',async()=>{
 const mock=async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(feed)});
 const data=await fetchPartnerTicketera(source,{},mock,when);
 assert.equal(data.ok,true);assert.equal(data.candidates.length,1);
 const input={manual:[],automatic:[],state:{schema:1,sources:{}},sources:[source],results:[data],now:when,mode:'live'};
 const out=updatePipeline(input);assert.equal(out.report.publishedChanges,1);assert.equal(out.automatic[0].ticketera,'TicketerA');assert.equal(out.automatic[0].priceAmount,390);
 const again=updatePipeline({...input,automatic:out.automatic,state:out.state});
 assert.equal(again.report.publishedChanges,0);assert.equal(again.publicEvents.length,1);
});
test('no ejecuta requests ni publica con fuente no autorizada',async()=>{
 let called=0;
 const x=await fetchPartnerTicketera({...source,permission:'pending'},{},async()=>{called++;return {ok:true}},when);
 assert.equal(called,0);assert.equal(x.ok,false);
 const r=updatePipeline({manual:[],sources:[{...source,permission:'pending'}],results:[{sourceId:source.id,ok:true,candidates:normalizeTicketeraFeed(feed,source,when)}],now:when,mode:'live'});
 assert.equal(r.publicEvents.length,0);
});
