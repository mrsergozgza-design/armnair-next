import type { Lang } from './LanguageContext'

export const fmtAmd = (v: number) => v >= 1e6 ? (v/1e6).toFixed(2)+'M ֏' : (v/1000).toFixed(1)+'K ֏';

export const fmtDate = (iso: string, lang?: Lang) => {
  if (!iso) return '—'
  const locale = lang === 'am' ? 'hy-AM' : lang === 'en' ? 'en-US' : 'ru-RU'
  return new Date(iso).toLocaleDateString(locale, { day:'2-digit', month:'long', year:'numeric' })
}

export const parseYield = (y: string) => parseFloat(String(y).replace('%',''))||0;

export const priceGrowth = (h: {price:number}[]) => {
  if(!h||h.length<2) return 0;
  return ((h[h.length-1].price - h[0].price) / h[0].price) * 100;
};

export function statusStyle(s: string): { bg: string; border: string; color: string } {
  if (s==='Completed'||s==='Сдан') return {bg:'rgba(42,157,143,.12)',border:'rgba(42,157,143,.35)',color:'#2A9D8F'};
  if (s==='Off-plan') return {bg:'rgba(120,120,180,.1)',border:'rgba(120,120,180,.28)',color:'#8888CC'};
  return {bg:'rgba(160,120,32,.12)',border:'rgba(160,120,32,.35)',color:'#C9A96E'};
}

const DAY_LABELS: Record<Lang, (d: number) => string> = {
  en: d => d <= 7 ? `${d}d ago` : `${Math.floor(d/7)}w ago`,
  ru: d => d <= 7 ? `${d}д назад` : `${Math.floor(d/7)}н назад`,
  am: d => d <= 7 ? `${d}o ago` : `${Math.floor(d/7)}w ago`, // [?]
}

export function freshLabel(iso: string, lang: Lang = 'ru'): {label:string|null, stale:boolean} {
  if (!iso) return {label:null,stale:false};
  const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  if (d <= 30) return { label: DAY_LABELS[lang](d), stale: false }
  const locale = lang === 'am' ? 'hy-AM' : lang === 'en' ? 'en-US' : 'ru-RU'
  return { label: new Date(iso).toLocaleDateString(locale, {day:'2-digit',month:'short',year:'numeric'}), stale: true }
}
