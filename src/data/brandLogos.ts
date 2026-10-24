export interface BrandData {
  key: string;
  name: string;
  nameUrdu: string;
  fullName: string;
}

/**
 * 11 Leading Agricultural Brands in Pakistan
 */
export const BRANDS: Record<string, BrandData> = {
  ffc: {
    key: 'ffc',
    name: 'FFC',
    nameUrdu: 'ایف ایف سی',
    fullName: 'Fauji Fertilizer Company'
  },
  engro: {
    key: 'engro',
    name: 'Engro',
    nameUrdu: 'اینگرو',
    fullName: 'Engro Fertilizers'
  },
  ffbl: {
    key: 'ffbl',
    name: 'FFBL',
    nameUrdu: 'ایف ایف بی ایل',
    fullName: 'Fauji Fertilizer Bin Qasim'
  },
  fatima: {
    key: 'fatima',
    name: 'Fatima Fertilizer',
    nameUrdu: 'فاطمہ فرٹیلائزر',
    fullName: 'Fatima Fertilizer Group'
  },
  agritech: {
    key: 'agritech',
    name: 'Agritech',
    nameUrdu: 'ایگری ٹیک',
    fullName: 'Agritech Limited (Tara)'
  },
  'massey-ferguson': {
    key: 'massey-ferguson',
    name: 'Massey Ferguson',
    nameUrdu: 'میسی فرگوسن',
    fullName: 'Massey Ferguson'
  },
  millat: {
    key: 'millat',
    name: 'Millat Tractors',
    nameUrdu: 'ملت ٹریکٹرز',
    fullName: 'Millat Tractors Limited'
  },
  'new-holland': {
    key: 'new-holland',
    name: 'New Holland',
    nameUrdu: 'نیو ہالینڈ',
    fullName: 'New Holland Agriculture'
  },
  'al-ghazi': {
    key: 'al-ghazi',
    name: 'Al-Ghazi Tractors',
    nameUrdu: 'الغازی ٹریکٹرز',
    fullName: 'Al-Ghazi Tractors Limited'
  },
  fiat: {
    key: 'fiat',
    name: 'Fiat',
    nameUrdu: 'فیاٹ',
    fullName: 'Fiat Trattori'
  },
  belarus: {
    key: 'belarus',
    name: 'Belarus',
    nameUrdu: 'بیلارس',
    fullName: 'Belarus Tractors'
  }
};

export const BRAND_KEYS = [
  'ffc',
  'engro',
  'ffbl',
  'fatima',
  'agritech',
  'massey-ferguson',
  'millat',
  'new-holland',
  'al-ghazi',
  'fiat',
  'belarus'
];

/**
 * Resolves any string query to canonical BrandData.
 */
export function lookupBrand(input?: string): BrandData {
  if (!input) return BRANDS.ffc;
  const norm = input.toLowerCase().trim();

  if (BRANDS[norm]) return BRANDS[norm];

  if (norm.includes('ffbl') || norm.includes('qasim')) return BRANDS.ffbl;
  if (norm.includes('ffc') || norm.includes('fauji')) return BRANDS.ffc;
  if (norm.includes('engro')) return BRANDS.engro;
  if (norm.includes('fatima') || norm.includes('sarsabz')) return BRANDS.fatima;
  if (norm.includes('agritech') || norm.includes('tara')) return BRANDS.agritech;
  if (norm.includes('massey') || norm.includes('ferguson') || norm.includes('mf-') || norm.includes('mf ')) return BRANDS['massey-ferguson'];
  if (norm.includes('millat') || norm.includes('mtl')) return BRANDS.millat;
  if (norm.includes('holland') || norm.includes('nh-') || norm.includes('nh ')) return BRANDS['new-holland'];
  if (norm.includes('ghazi') || norm.includes('alghazi') || norm.includes('agtl')) return BRANDS['al-ghazi'];
  if (norm.includes('fiat')) return BRANDS.fiat;
  if (norm.includes('belarus') || norm.includes('mtz')) return BRANDS.belarus;

  for (const b of Object.values(BRANDS)) {
    if (norm === b.name.toLowerCase() || norm === b.fullName.toLowerCase()) return b;
  }

  return {
    key: 'custom',
    name: input,
    nameUrdu: input,
    fullName: input
  };
}

export const BRAND_LOGOS = BRANDS;
