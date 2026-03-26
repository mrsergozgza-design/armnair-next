export interface PricePoint { month: string; price: number; }

export interface Unit {
  project_id: string;
  type: string;
  area_m2: number;
  floor?: string;
  price_usd: number;
  status: string;
}

export interface Complex {
  // Core fields (always present)
  id: string; name: string; developer: string; district: string;
  price_amd: number; price_usd: number; status: string; tax_refund: boolean;
  yield: string; last_updated: string; lat: number; lng: number;
  presentation?: string; history: PricePoint[]; description: string; image?: string;
  images?: string[]        // from Main_Images — comma-separated direct URLs
  media_folder?: string    // from Media_Folder_Link

  // Extended fields from Google Sheets
  unit_type?: string;         // Unit type
  min_area?: string;          // min Total area, м2
  payment_plan?: string;      // Payment Plan
  subway_station?: string;    // Subway stancion
  infrastructure?: string;    // School/kindergarten/mall/university
  commission?: string;        // Commission, %
  contact?: string;           // контактное лицо (почта, тел)
  website?: string;           // Сайт, ссылка
  developer_logo?: string;    // Developer_Logo — URL логотипа застройщика
  developer_description?: string; // Developer_Description — описание застройщика
}
