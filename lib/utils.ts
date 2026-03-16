export const fmtAmd = (v: number) => v >= 1e6 ? (v/1e6).toFixed(2)+'M ֏' : (v/1000).toFixed(1)+'K ֏';
export const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString('ru-RU',{day:'2-digit',month:'long',year:'numeric'}) : '—';
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
export function freshLabel(iso: string): {label:string|null, stale:boolean} {
  if (!iso) return {label:null,stale:false};
  const d = Math.floor((Date.now()-new Date(iso).getTime())/86400000);
  if (d<=7)  return {label:d+'д назад',stale:false};
  if (d<=30) return {label:Math.floor(d/7)+'н назад',stale:false};
  return {label:new Date(iso).toLocaleDateString('ru-RU',{day:'2-digit',month:'short',year:'numeric'}),stale:true};
}
