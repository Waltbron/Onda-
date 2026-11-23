import test from 'node:test';
import assert from 'node:assert/strict';
import {eligiblePage,extractMeta,matchesEvent} from '../../scripts/image-discovery.mjs';
test('descubre imagen de evento real sin metadatos jurídicos obligatorios',()=>{
 const html='<meta property="og:title" content="Cordera y La Caravana Mágica 2026">'+
 '<meta property="og:image" content="https://cdn.example.org/cordera.webp">';
 const meta=extractMeta(html,'https://www.passline.com/eventos/cordera-y-la-caravana-magica');
 assert.equal(meta.imageUrl,'https://cdn.example.org/cordera.webp');
 assert.equal(matchesEvent({title:'Cordera y La Caravana Mágica'},meta.title),true);
});
test('evita páginas genéricas, logotipos y fuentes no específicas',()=>{
 assert.equal(eligiblePage('https://macamuseo.org/eventosmaca'),false);
 assert.equal(eligiblePage('https://www.passline.com/eventos/cordera-y-la-caravana-magica'),true);
 assert.equal(eligiblePage('https://github.com/suzrik/data.events.uy/blob/main/a.yaml'),false);
 assert.equal(matchesEvent({title:'Cordera y La Caravana Mágica'},'Festival de salsa'),false);
 const meta=extractMeta('<meta property="og:image" content="/assets/logo.png">','https://www.passline.com/eventos/cordera-y-la-caravana-magica');
 assert.equal(meta.imageUrl,null);
});

test('og:image indefinida no se incorpora al catálogo',()=>{
 const info=extractMeta('<meta property="og:title" content="Feria Turismo Rural"><meta property="og:image" content="undefined">','https://maldonado.gub.uy/actividades/feria-rural');
 assert.equal(info.imageUrl,null);
});
