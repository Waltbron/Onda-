import test from 'node:test';import assert from 'node:assert/strict';
import {mayFetch} from '../src/robots-policy.mjs';
const u='https://macamuseo.org/eventosmaca';
test('robots no disponible falla cerrado',()=>assert.equal(mayFetch('',u).allowed,false));
test('allow ruta pública',()=>assert.equal(mayFetch('User-agent: *\nDisallow: /privado\n',u).allowed,true));
test('deniega todo',()=>assert.equal(mayFetch('User-agent: *\nDisallow: /\n',u).allowed,false));
test('regla específica allow gana',()=>assert.equal(mayFetch('User-agent: *\nDisallow: /\nAllow: /eventosmaca\n',u).allowed,true));
test('deniega query de exportación squarespace',()=>assert.equal(mayFetch('User-agent: *\nDisallow: /*?format=json\n',u+'?format=json').allowed,false));
test('permisos explícitos de UA',()=>assert.equal(mayFetch('User-agent: *\nAllow: /\nUser-agent: onda-hormiga\nDisallow: /\n',u).allowed,false));
