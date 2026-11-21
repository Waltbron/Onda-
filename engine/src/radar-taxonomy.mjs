// ONDA Lab — etiquetas determinísticas para pistas, sin extracción ni publicación.
// No infiere que un evento exista, que sea gratis o que haya entradas disponibles.
const fold = x => String(x ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const patterns = [
  ['electronica', /\b(dj|electronica|techno|house|sunset|rave)\b/],
  ['musica-en-vivo', /\b(recital|concierto|banda|musica en vivo|jam|acustico|festival de musica)\b/],
  ['teatro', /\b(teatro|obra teatral|funcion teatral)\b/],
  ['cine', /\b(cine|pelicula|documental|proyeccion)\b/],
  ['gastronomia', /\b(gastronomia|degustacion|feria gastronomica|paella|comida|cocina|food truck)\b/],
  ['feria', /\b(feria|mercado artesanal|artesania|emprendedores)\b/],
  ['taller', /\b(taller|curso|capacitacion|formacion|charla)\b/],
  ['deporte', /\b(deporte|tenis|surf|yoga|carrera|maraton|bicicleta|kayak|paddle)\b/],
  ['familias', /\b(familia|infantil|ninos|ninas|para chicos)\b/],
  ['aire-libre', /\b(playa|parque|rambla|bosque|plaza|laguna|aire libre)\b/]
];
const platforms = new Map([
  ['redtickets.uy','RedTickets'],['cobraticket.uy','CobraTicket'],
  ['portalbosque.com','Portal Bosque'],['ticketmaster.uy','Ticketmaster Uruguay'],
  ['tickantel.com.uy','Tickantel'],['entradas.tickantel.com.uy','Tickantel'],
  ['passline.com','Passline'],['eventbrite.com','Eventbrite']
]);
export function classifyRadarLead(candidate) {
  const haystack=fold([candidate.title,candidate.category,candidate.venue,candidate.notes].join(' '));
  const tags=patterns.filter(([,regex])=>regex.test(haystack)).map(([tag])=>tag);
  let host='';
  try {host=new URL(candidate.sourceUrl).hostname.toLowerCase().replace(/^www\./,'')} catch {}
  const ticketera=platforms.get(host) || null;
  const sourceType=ticketera?'ticketera':host==='maldonado.gub.uy'||host.endsWith('.maldonado.gub.uy')?'institucional':'otra-fuente';
  return {tags,sourceType,ticketera};
}
