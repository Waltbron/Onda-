import test from 'node:test';import assert from 'node:assert/strict';
import {parseICS} from '../src/ics-adapter.mjs';
const o={sourceId:'x',baseUrl:'https://ejemplo.uy/agenda',city:'Maldonado'};
const cal=b=>`BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${b}END:VCALENDAR\r\n`;
const ev=l=>`BEGIN:VEVENT\r\n${l}\r\nEND:VEVENT\r\n`;
test('evento UTC se convierte a hora de Montevideo',()=>{
  const r=parseICS(cal(ev('UID:a1\r\nSUMMARY:Concierto en la plaza\r\nDTSTART:20261205T230000Z\r\nDTEND:20261206T010000Z\r\nURL:https://ejemplo.uy/e/1\r\nLOCATION:Plaza Artigas')),o);
  assert.equal(r.candidates.length,1);const c=r.candidates[0];
  assert.deepEqual([c.date,c.time,c.endDate,c.endTime,c.place],['2026-12-05','20:00','2026-12-05','22:00','Plaza Artigas']);
});
test('día completo: DTEND exclusivo se resta',()=>{
  const c=parseICS(cal(ev('UID:b\r\nSUMMARY:Feria de artesanos\r\nDTSTART;VALUE=DATE:20261210\r\nDTEND;VALUE=DATE:20261212\r\nURL:https://ejemplo.uy/e/2')),o).candidates[0];
  assert.deepEqual([c.date,c.endDate,c.time],['2026-12-10','2026-12-11',null]);
});
test('rechaza hora flotante, recurrentes, URL ajena y sin URL',()=>{
  const r=parseICS(cal(
   ev('UID:c\r\nSUMMARY:Hora flotante x\r\nDTSTART:20261210T200000\r\nURL:https://ejemplo.uy/e/3')+
   ev('UID:d\r\nSUMMARY:Evento recurrente\r\nDTSTART;TZID=America/Montevideo:20261210T200000\r\nRRULE:FREQ=WEEKLY\r\nURL:https://ejemplo.uy/e/4')+
   ev('UID:e\r\nSUMMARY:URL de otro host\r\nDTSTART;TZID=America/Montevideo:20261210T200000\r\nURL:https://otro.com/x')+
   ev('UID:f\r\nSUMMARY:Sin url en ficha\r\nDTSTART;TZID=America/Montevideo:20261210T200000')),o);
  assert.equal(r.candidates.length,0);assert.equal(r.issues.length,4);
});
test('TZID Montevideo, líneas plegadas, CANCELLED y duplicados',()=>{
  const body=ev('UID:g\r\nSUMMARY:Obra de teatro muy\r\n  larga\r\nDTSTART;TZID=America/Montevideo:20261211T210000\r\nSTATUS:CANCELLED\r\nURL:https://ejemplo.uy/e/5');
  const r=parseICS(cal(body+body),o);assert.equal(r.candidates.length,1);
  assert.equal(r.candidates[0].title,'Obra de teatro muy larga');assert.equal(r.candidates[0].externalStatus,'cancelled');assert.equal(r.candidates[0].time,'21:00');
});
test('texto que no es ICS falla',()=>assert.throws(()=>parseICS('<html></html>',o)));
