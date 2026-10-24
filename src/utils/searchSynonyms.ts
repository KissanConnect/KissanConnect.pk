import { FertilizerPrice, Tractor, Listing, CropGuide } from '../types';
import { AgriScheme, AGRI_SCHEMES } from '../data/schemesData';
import { CROPS_DATA } from '../data/cropsData';
import { INITIAL_FERTILIZER_PRICES } from '../data/fertilizersData';
import { TRACTORS_DATA } from '../data/tractorsData';
import { INITIAL_LISTINGS } from '../data/marketInitialData';

// Filler words in English, Urdu, and Roman Urdu
export const FILLER_WORDS = new Set([
  'price', 'prices', 'rate', 'rates', 'bhao', 'bhav', 'cost', 'qeemat', 'keemat',
  'قیمت', 'ریٹ', 'بھاؤ', 'نرخ', 'لاگت',
  'کی', 'کا', 'کے', 'کو', 'سے', 'میں', 'پر', 'والا', 'والی', 'والے',
  'چاہیے', 'دکھاؤ', 'بتاؤ', 'کتنی', 'کتنا', 'ہے', 'ہیں', 'اور',
  'show', 'tell', 'me', 'the', 'what', 'is', 'for', 'about', 'give', 'latest', 'today', 'aj', 'aaj'
]);

// Synonyms map: Maps various user utterances (English, Urdu, Roman Urdu) to canonical keywords
export const SYNONYM_MAP: Record<string, string[]> = {
  urea: ['urea', 'یوریا', 'sona urea', 'sona', 'ffc urea', 'سونا یوریا', 'یو ریا'],
  dap: ['dap', 'ڈی اے پی', 'di ap', 'دی اے پی', 'engro dap', 'sona dap', 'ڈیپ'],
  can: ['can', 'گوآرا', 'گوارا', 'کین گوارا', 'can gowara', 'gawarah', 'کین'],
  nitrophos: ['np', 'این پی', 'nitrophos', 'نائٹروفاس', 'نائٹرو فاس'],
  potash: ['potash', 'پوٹاش', 'sop', 'mop', 'پو ٹاش'],
  ssp: ['ssp', 'ایس ایس پی', 'single super phosphate'],
  fertilizer: ['fertilizer', 'fertilizers', 'کھاد', 'کھادیں', 'khad', 'khaden', 'khadein'],
  wheat: ['wheat', 'گندم', 'gandum', 'gandham', 'kanak', 'کنک'],
  rice: ['rice', 'چاول', 'dhan', 'paddy', 'دھان', 'basmati', 'باسمتی'],
  cotton: ['cotton', 'کپاس', 'kapas', 'پھٹی', 'phutti'],
  sugarcane: ['sugarcane', 'گنا', 'ganna', 'kamad', 'کماد'],
  maize: ['maize', 'مکئی', 'makai', 'makki'],
  potato: ['potato', 'آلو', 'aloo', 'alu'],
  onion: ['onion', 'پیاز', 'pyaz', 'piaz', 'ganda'],
  tomato: ['tomato', 'ٹماٹر', 'tamatar'],
  mango: ['mango', 'آم', 'aam'],
  citrus: ['citrus', 'kinnow', 'کینو', 'مالٹا', 'malta', 'orange'],
  chickpea: ['chickpea', 'چنا', 'chana', 'gram'],
  mustard: ['mustard', 'سرسوں', 'sarson', 'raya', 'را Spoon'],
  tractor: ['tractor', 'tractors', 'ٹریکٹر', 'ٹریکٹرز', 'traktor'],
  millat: ['millat', 'ملت', 'mf', 'massey', 'ferguson', '240', '260', '350', '360', '375', '385'],
  fiat: ['fiat', 'فیات', 'al-ghazi', 'al ghazi', 'الغازی', 'new holland', 'نیو ہالینڈ', '480', '640'],
  belarus: ['belarus', 'بیلاروس', 'روس', 'mtz', '510', '820'],
  scheme: ['scheme', 'schemes', 'امداد', 'قرضہ', 'کامیاب کسان', 'کسان کارڈ', 'kissan card', 'subsidy', 'سبسڈی', 'لون', 'loan']
};

// Clean text: strip punctuation, lowercase, remove filler words
export function cleanSpokenPhrase(raw: string): { cleaned: string; rawCleaned: string; tokens: string[] } {
  if (!raw) return { cleaned: '', rawCleaned: '', tokens: [] };

  // Remove common punctuation except dashes
  const normalized = raw
    .toLowerCase()
    .replace(/[?,.!/\\;:"'()\[\]{}*&^%$#@!~`+=_<>|]/g, ' ')
    .trim();

  const words = normalized.split(/\s+/).filter(Boolean);
  const filtered = words.filter((w) => !FILLER_WORDS.has(w));

  return {
    cleaned: filtered.join(' ') || normalized,
    rawCleaned: normalized,
    tokens: filtered.length > 0 ? filtered : words
  };
}

// Expand a token with its synonyms for fuzzy multi-lingual matches
export function getSynonymsForToken(token: string): string[] {
  const lower = token.toLowerCase();
  const set = new Set<string>([lower]);

  for (const [canonical, variants] of Object.entries(SYNONYM_MAP)) {
    if (canonical === lower || variants.some((v) => v.toLowerCase() === lower || lower.includes(v.toLowerCase()))) {
      set.add(canonical);
      variants.forEach((v) => set.add(v.toLowerCase()));
    }
  }

  return Array.from(set);
}

// Intelligent Route Predictor: Determine matching section (Fertilizer, Tractors, Mandi, Learn, Schemes)
export interface SearchRoutePrediction {
  targetCategory: 'fertilizer' | 'tractors' | 'mandi' | 'learn' | 'schemes';
  targetUrl: string;
  prefilledQuery: string;
  categoryLabelEn: string;
  categoryLabelUr: string;
}

export function predictSearchRoute(spokenText: string): SearchRoutePrediction {
  const { cleaned, tokens } = cleanSpokenPhrase(spokenText);
  const lower = cleaned.toLowerCase();

  // Check fertilizers
  const fertTerms = ['urea', 'dap', 'can', 'nitrophos', 'potash', 'ssp', 'fertilizer', 'ffc', 'engro', 'fatima', 'agritech', 'کھاد', 'یوریا', 'سونا', 'ڈی اے پی'];
  for (const term of fertTerms) {
    if (lower.includes(term)) {
      return {
        targetCategory: 'fertilizer',
        targetUrl: `/fertilizer?search=${encodeURIComponent(cleaned)}`,
        prefilledQuery: cleaned,
        categoryLabelEn: 'Fertilizer Rates',
        categoryLabelUr: 'کھاد کے ریٹ'
      };
    }
  }

  // Check tractors
  const tractorTerms = ['tractor', 'millat', 'massey', 'ferguson', 'fiat', 'belarus', 'holland', 'al-ghazi', '480', '640', '240', '385', '375', '510', '820', 'ٹریکٹر', 'ملت', 'فیات', 'الغازی', 'بیلاروس'];
  for (const term of tractorTerms) {
    if (lower.includes(term)) {
      return {
        targetCategory: 'tractors',
        targetUrl: `/tractors?search=${encodeURIComponent(cleaned)}`,
        prefilledQuery: cleaned,
        categoryLabelEn: 'Tractor Specs & Prices',
        categoryLabelUr: 'ٹریکٹر کی قیمتیں'
      };
    }
  }

  // Check government schemes
  const schemeTerms = ['scheme', 'subsidy', 'card', 'loan', 'kissan card', 'قرضہ', 'سبسڈی', 'کسان کارڈ', 'امداد'];
  for (const term of schemeTerms) {
    if (lower.includes(term)) {
      return {
        targetCategory: 'schemes',
        targetUrl: `/schemes?search=${encodeURIComponent(cleaned)}`,
        prefilledQuery: cleaned,
        categoryLabelEn: 'Government Schemes',
        categoryLabelUr: 'سرکاری زرعی اسکیمیں'
      };
    }
  }

  // Check learning center production guides
  const learnTerms = ['manual', 'guide', 'sowing', 'cultivation', 'disease', 'pest', 'کاشت', 'رہنمائی', 'بیماریاں', 'سپرے'];
  for (const term of learnTerms) {
    if (lower.includes(term)) {
      return {
        targetCategory: 'learn',
        targetUrl: `/learn?search=${encodeURIComponent(cleaned)}`,
        prefilledQuery: cleaned,
        categoryLabelEn: 'Crop Production Manuals',
        categoryLabelUr: 'فصلوں کی رہنمائی'
      };
    }
  }

  // Default: Kissan Mandi Live Marketplace
  return {
    targetCategory: 'mandi',
    targetUrl: `/market?search=${encodeURIComponent(cleaned)}`,
    prefilledQuery: cleaned,
    categoryLabelEn: 'Kissan Mandi Marketplace',
    categoryLabelUr: 'کسان منڈی'
  };
}

// Categorized Global Search Results
export interface GlobalSearchResults {
  query: string;
  cleanedQuery: string;
  fertilizers: FertilizerPrice[];
  tractors: Tractor[];
  mandiListings: Listing[];
  crops: CropGuide[];
  schemes: AgriScheme[];
  didYouMean: string | null;
  totalCount: number;
}

export function searchAllCategories(rawQuery: string): GlobalSearchResults {
  const { cleaned, rawCleaned, tokens } = cleanSpokenPhrase(rawQuery);
  if (!cleaned.trim()) {
    return {
      query: rawQuery,
      cleanedQuery: '',
      fertilizers: [],
      tractors: [],
      mandiListings: [],
      crops: [],
      schemes: [],
      didYouMean: null,
      totalCount: 0
    };
  }

  // Expand all tokens through synonym dictionary
  const expandedTokens = new Set<string>();
  tokens.forEach((t) => {
    getSynonymsForToken(t).forEach((s) => expandedTokens.add(s.toLowerCase()));
  });

  const matchesAny = (texts: (string | undefined | number)[]): boolean => {
    const combined = texts.filter(Boolean).map((t) => String(t).toLowerCase()).join(' ');
    // Direct substring of full cleaned query
    if (combined.includes(cleaned)) return true;
    if (combined.includes(rawCleaned)) return true;

    // Check expanded synonym tokens
    for (const token of expandedTokens) {
      if (token.length >= 2 && combined.includes(token)) {
        return true;
      }
    }
    return false;
  };

  // 1. Fertilizers
  const fertilizers = INITIAL_FERTILIZER_PRICES.filter((f) =>
    matchesAny([f.name, f.nameUrdu, f.brand, f.brandUrdu, f.type, 'fertilizer', 'کھاد'])
  );

  // 2. Tractors
  const tractors = TRACTORS_DATA.filter((tr) =>
    matchesAny([tr.name, tr.brand, tr.model, tr.engine, 'tractor', 'ٹریکٹر', tr.bestFor, tr.bestForUrdu])
  );

  // 3. Mandi Listings
  const mandiListings = INITIAL_LISTINGS.filter((l) =>
    matchesAny([l.title, l.category, l.description, l.sellerCity, l.sellerProvince, l.sellerName])
  );

  // 4. Crop Guides
  const crops = CROPS_DATA.filter((c) =>
    matchesAny([c.nameEn, c.nameUr, c.category, c.season, c.id])
  );

  // 5. Schemes
  const schemes = AGRI_SCHEMES.filter((s) =>
    matchesAny([s.titleEn, s.titleUr, s.authorityEn, s.authorityUr, s.summaryEn, s.summaryUr, s.category])
  );

  const totalCount = fertilizers.length + tractors.length + mandiListings.length + crops.length + schemes.length;

  // Did you mean suggestion if exact results were thin
  let didYouMean: string | null = null;
  if (totalCount === 0) {
    // Check closest synonym keys
    for (const [key, variants] of Object.entries(SYNONYM_MAP)) {
      if (tokens.some((t) => variants.some((v) => v.includes(t) || t.includes(v)))) {
        didYouMean = key;
        break;
      }
    }
  }

  return {
    query: rawQuery,
    cleanedQuery: cleaned,
    fertilizers,
    tractors,
    mandiListings,
    crops,
    schemes,
    didYouMean,
    totalCount
  };
}
