// Se ejecuta al final de GitHub Actions, DESPUÉS de registrar el estado.
// Cualquier fuente degradada genera una alerta roja sin borrar el último catálogo.
import fs from 'node:fs';
const report=JSON.parse(fs.readFileSync(new URL('../data/reports/latest.json',import.meta.url),'utf8'));
const failing=(report.sources||[]).filter(x=>['degradada','bloqueada'].includes(x.status));
if(failing.length){
 console.error('ONDA: fuentes con incidentes',failing.map(x=>`${x.sourceId}: ${x.error||x.status}`).join(' | '));
 process.exitCode=1;
}else console.log('ONDA: sin incidentes registrados en la última ejecución.');
