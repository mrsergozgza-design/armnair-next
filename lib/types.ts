export interface PricePoint { month: string; price: number; }
export interface Complex {
  id: string; name: string; developer: string; district: string;
  price_amd: number; price_usd: number; status: string; tax_refund: boolean;
  yield: string; last_updated: string; lat: number; lng: number;
  presentation?: string; history: PricePoint[]; description: string; image?: string;
}
