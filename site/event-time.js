/* ONDA V2.1 — vigencia de eventos. Sin dependencias, hora de Uruguay. */
(function (root, make) {
  const api = make();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.ONDAEventTime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TIME_ZONE = 'America/Montevideo';
  const HOUR = 3600000;
  const MINUTE = 60000;
  const CATEGORY_HOURS = Object.freeze({
    'Fiestas': 8, 'Gastronomía': 8, 'Deporte': 8, 'Aire libre': 8,
    'Música': 4, 'Cultura': 4, 'Encuentros': 4, 'Bienestar': 4
  });
  const MAX_REASONABLE_DATE = 9999;
  const dtf = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  const validDate = date => {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const y=+date.slice(0,4), m=+date.slice(5,7), d=+date.slice(8,10);
    if (y < 1900 || y > MAX_REASONABLE_DATE) return false;
    const t=new Date(Date.UTC(y,m-1,d));
    return t.getUTCFullYear()===y && t.getUTCMonth()===m-1 && t.getUTCDate()===d;
  };
  const validTime = s => typeof s==='string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const addDays = (date,n) => {
    if (!validDate(date)) return null;
    const d = new Date(date+'T12:00:00Z');
    d.setUTCDate(d.getUTCDate()+n);
    return d.toISOString().slice(0,10);
  };
  // Transforma fecha + hora uruguayas al instante absoluto. No depende de
  // la zona del teléfono ni fija manualmente UTC-03 (que puede cambiar).
  function uyInstant(date, time) {
    if (!validDate(date) || !validTime(time)) return NaN;
    const target = Date.UTC(+date.slice(0,4), +date.slice(5,7)-1, +date.slice(8,10), +time.slice(0,2), +time.slice(3,5));
    let ms = target;
    for (let i=0;i<4;i++) {
      const parts=Object.fromEntries(dtf.formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,+p.value]));
      const observed = Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute,parts.second);
      const diff = target-observed;
      if (diff===0) break;
      ms+=diff;
    }
    return ms;
  }
  const uyDate = (nowMs = Date.now()) => {
    const p=Object.fromEntries(dtf.formatToParts(new Date(nowMs)).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  // Para fecha sin hora: mantener en listados hasta las 00:00 del día siguiente.
  const nextDayStart = date => uyInstant(addDays(date,1),'00:00');
  function eventWindow(e) {
    if (!e || !validDate(e.date)) return null;
    if (e.endDate != null && !validDate(e.endDate)) return null;
    if (e.time != null && !validTime(e.time)) return null;
    if (e.endTime != null && !validTime(e.endTime)) return null;
    const finalDate = validDate(e.endDate) ? e.endDate : e.date;
    if (finalDate < e.date) return null;
    const hasStart=validTime(e.time), hasEnd=validTime(e.endTime);
    let start=hasStart ? uyInstant(e.date,e.time) : uyInstant(e.date,'00:00');
    let until, basis, hours=null;
    if (hasEnd) {
      let date=finalDate;
      if (date===e.date && hasStart && e.endTime < e.time) date=addDays(date,1);
      until=uyInstant(date,e.endTime);
      basis='explicit_end';
    } else if (e.endDate && finalDate > e.date) {
      // Exposición / feria de varios días: sólo hay fecha final confirmada.
      until=nextDayStart(finalDate);
      basis='date_range';
    } else if (hasStart) {
      hours=CATEGORY_HOURS[e.category] || 4;
      until=start+hours*HOUR;
      basis='category_fallback';
    } else {
      until=nextDayStart(finalDate);
      basis='date_only';
    }
    if (!Number.isFinite(until) || until <= start) return null;
    return {start,visibleUntil:until,expiryBasis:basis,fallbackHours:hours,confirmedEnd:hasEnd};
  }
  const inactiveStatus = status => ['cancelado','finalizado','reprogramado','agotado','retirado','dudoso'].includes(status);
  function isCurrent(e, nowMs=Date.now()) {
    const w=eventWindow(e);
    return Boolean(w && !inactiveStatus(e.status) && nowMs < w.visibleUntil);
  }
  // 'Hoy' incluye una salida que arrancó anoche pero continúa vigente hoy.
  function overlapsDate(e,date,nowMs=Date.now()) {
    if (!validDate(date) || !isCurrent(e,nowMs)) return false;
    const w=eventWindow(e);
    const dayStart=uyInstant(date,'00:00');
    const dayEnd=nextDayStart(date);
    return w.start < dayEnd && w.visibleUntil > dayStart;
  }
  function overlapsRange(e,dateA,dateB,nowMs=Date.now()) {
    if (!validDate(dateA) || !validDate(dateB) || dateA>dateB || !isCurrent(e,nowMs)) return false;
    const w=eventWindow(e);
    return w.start < nextDayStart(dateB) && w.visibleUntil > uyInstant(dateA,'00:00');
  }
  function timingNote(e,nowMs=Date.now()) {
    const w=eventWindow(e);
    if (!w || !isCurrent(e,nowMs) || !validTime(e.time) || nowMs<w.start) return '';
    if (w.confirmedEnd) return '';
    return `Comenzó a las ${e.time} h. La hora de finalización no está confirmada; consultá la fuente antes de salir.`;
  }
  return {TIME_ZONE,CATEGORY_HOURS,validDate,validTime,addDays,uyInstant,uyDate,eventWindow,isCurrent,overlapsDate,overlapsRange,timingNote};
});
