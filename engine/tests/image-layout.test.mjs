import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const state={};state.globalThis=state;
runInNewContext(readFileSync(new URL('../../site/image-layout.js',import.meta.url),'utf8'),state);
const choose=state.ONDAImageLayout.decide;
test('horizontal si afiche apaisado, lateral si vertical',()=>{
 assert.equal(choose({scope:'foto',imageType:'poster'}),'banner');
 assert.equal(choose({scope:'foto',imageType:'poster',aspectRatio:1.9}),'banner');
 assert.equal(choose({scope:'foto',imageType:'poster',aspectRatio:.7}),'side');
 assert.equal(choose({scope:'foto',imageType:'flyer',aspectRatio:.6}),'side');
});
test('foto panoramica arriba, foto usual e ilustraciones en formato compacto',()=>{
 assert.equal(choose({scope:'foto',imageType:'photo',aspectRatio:1.85}),'banner');
 assert.equal(choose({scope:'foto',imageType:'photo',aspectRatio:1.3}),'side');
 assert.equal(choose({scope:'foto',imageType:'reference',aspectRatio:1.9}),'banner');
 assert.equal(choose({scope:'formato',imageType:'poster',aspectRatio:2.8}),'side');
 assert.equal(choose({scope:'identidad',imageType:'photo',aspectRatio:3}),'side');
});
test('excepcion editorial por dato sin CSS ni reglas por proveedor',()=>{
 assert.equal(choose({scope:'foto',imageType:'photo',aspectRatio:2,imageLayout:'side'}),'side');
 assert.equal(choose({scope:'foto',imageType:'poster',aspectRatio:.7,imageLayout:'banner'}),'banner');
 assert.equal(choose({scope:'foto',imageType:'photo',imageLayout:'invalido'}),'side');
 assert.equal(choose({scope:'foto',imageType:'poster',aspectRatio:-2}),'banner');
});
test('interfaz carga helper primero y restaura formato lateral al fallar',()=>{
 const a=readFileSync(new URL('../../site/app.js',import.meta.url),'utf8');
 const h=readFileSync(new URL('../../site/index.html',import.meta.url),'utf8');
 const c=readFileSync(new URL('../../site/styles.css',import.meta.url),'utf8');
 assert.ok(h.indexOf('image-layout.js')<h.indexOf('app.js'));
 assert.match(a,/function mediaClasses\(visual\)/);
 assert.match(a,/document\.addEventListener\('load',ev=>/);
 assert.match(a,/img\.naturalWidth\/img\.naturalHeight/);
 assert.match(a,/data-image-layout/);
 assert.match(a,/classList\.remove\('has-poster','media-banner','media-side'\)/);
 assert.match(c,/\.event-card\.media-banner\{/);
 assert.match(c,/\.event-visual\.media-side\.has-poster/);
});
