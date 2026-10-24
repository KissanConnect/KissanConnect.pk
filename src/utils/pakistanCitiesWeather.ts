/**
 * Pakistan Agricultural Cities Coordinates & Open-Meteo Weather Service
 */

export interface CityCoords {
  name: string;
  nameUrdu: string;
  lat: number;
  lon: number;
}

export const PAKISTAN_CITIES: Record<string, CityCoords> = {
  multan: { name: 'Multan', nameUrdu: 'ملتان', lat: 30.19, lon: 71.47 },
  lahore: { name: 'Lahore', nameUrdu: 'لاہور', lat: 31.55, lon: 74.34 },
  faisalabad: { name: 'Faisalabad', nameUrdu: 'فیصل آباد', lat: 31.42, lon: 73.08 },
  karachi: { name: 'Karachi', nameUrdu: 'کراچی', lat: 24.86, lon: 67.01 },
  peshawar: { name: 'Peshawar', nameUrdu: 'پشاور', lat: 34.01, lon: 71.58 },
  quetta: { name: 'Quetta', nameUrdu: 'کوئٹہ', lat: 30.18, lon: 66.99 },
  'mirpur mathelo': { name: 'Mirpur Mathelo', nameUrdu: 'میرپور ماتھیلو', lat: 28.02, lon: 69.55 },
  sahiwal: { name: 'Sahiwal', nameUrdu: 'ساہیوال', lat: 30.67, lon: 73.11 },
  bahawalpur: { name: 'Bahawalpur', nameUrdu: 'بہاولپور', lat: 29.40, lon: 71.68 },
  'rahim yar khan': { name: 'Rahim Yar Khan', nameUrdu: 'رحیم یار خان', lat: 28.42, lon: 70.30 },
  sukkur: { name: 'Sukkur', nameUrdu: 'سکھر', lat: 27.71, lon: 68.86 },
  hyderabad: { name: 'Hyderabad', nameUrdu: 'حیدرآباد', lat: 25.39, lon: 68.37 },
  larkana: { name: 'Larkana', nameUrdu: 'لاڑکانہ', lat: 27.56, lon: 68.21 },
  mardan: { name: 'Mardan', nameUrdu: 'مردان', lat: 34.20, lon: 72.05 },
  sargodha: { name: 'Sargodha', nameUrdu: 'سرگودھا', lat: 32.08, lon: 72.67 },
  okara: { name: 'Okara', nameUrdu: 'اوکاڑہ', lat: 30.81, lon: 73.45 },
  gujranwala: { name: 'Gujranwala', nameUrdu: 'گوجرانوالہ', lat: 32.16, lon: 74.19 },
  islamabad: { name: 'Islamabad', nameUrdu: 'اسلام آباد', lat: 33.68, lon: 73.04 }
};

export function getCityCoordinates(cityName: string): CityCoords {
  const normalized = cityName.trim().toLowerCase();
  if (PAKISTAN_CITIES[normalized]) {
    return PAKISTAN_CITIES[normalized];
  }

  // Partial match check
  for (const key of Object.keys(PAKISTAN_CITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return PAKISTAN_CITIES[key];
    }
  }

  // Default fallback to Multan (Pakistan's central agricultural hub)
  return PAKISTAN_CITIES.multan;
}

export interface ParsedWeatherData {
  city: string;
  latitude: number;
  longitude: number;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
  };
  daily: {
    dates: string[];
    maxTemps: number[];
    minTemps: number[];
    rainSums: number[];
    rainProbs: number[];
    weatherCodes: number[];
  };
  isFromCache?: boolean;
}

// In-memory cache for fast instant renders & fallback
const memoryCache: Record<string, ParsedWeatherData> = {};

/**
 * Fetch forecast from Open-Meteo using the requested simple URL format
 */
export async function fetchCityWeather(cityName: string): Promise<ParsedWeatherData> {
  const coords = getCityCoordinates(cityName);
  const cacheKey = `kissan_weather_${coords.name.toLowerCase()}`;

  // Simple URL format without extra headers or API key
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP status ${res.status}`);
    }
    const data = await res.json();

    if (!data.current || !data.daily) {
      throw new Error('Invalid Open-Meteo payload structure');
    }

    const rainSums: number[] = data.daily.precipitation_sum || [];
    // Estimate rain probability percentages from precipitation sums for the farmer advice generator
    const rainProbs = rainSums.map((sum: number) => {
      if (sum > 10) return 90;
      if (sum > 4) return 70;
      if (sum > 1) return 45;
      if (sum > 0.1) return 20;
      return 0;
    });

    const parsed: ParsedWeatherData = {
      city: coords.name,
      latitude: coords.lat,
      longitude: coords.lon,
      current: {
        temperature: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m ?? 45),
        windSpeed: Math.round(data.current.wind_speed_10m ?? 8),
        precipitation: data.current.precipitation ?? 0,
        weatherCode: data.current.weather_code ?? 0
      },
      daily: {
        dates: data.daily.time || [],
        maxTemps: data.daily.temperature_2m_max || [],
        minTemps: data.daily.temperature_2m_min || [],
        rainSums,
        rainProbs,
        weatherCodes: data.daily.weather_code || []
      },
      isFromCache: false
    };

    // Store in both memory and local storage
    memoryCache[cacheKey] = parsed;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(parsed));
    } catch {
      // ignore localstorage write failures
    }

    return parsed;
  } catch (error) {
    console.warn(`Weather fetch failed for ${cityName}, retrieving cache:`, error);

    // 1. Check memory cache first
    if (memoryCache[cacheKey]) {
      return { ...memoryCache[cacheKey], isFromCache: true };
    }

    // 2. Check localStorage cache next
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache[cacheKey] = parsed;
        return { ...parsed, isFromCache: true };
      }
    } catch {
      // ignore
    }

    // 3. Realistic fallback data for Pakistan if completely offline
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    });

    const fallback: ParsedWeatherData = {
      city: coords.name,
      latitude: coords.lat,
      longitude: coords.lon,
      current: {
        temperature: 28,
        humidity: 42,
        windSpeed: 9,
        precipitation: 0,
        weatherCode: 1
      },
      daily: {
        dates,
        maxTemps: [31, 32, 30, 29, 31, 32, 33],
        minTemps: [18, 19, 17, 16, 17, 18, 19],
        rainSums: [0, 0, 0.2, 0, 0, 0, 0],
        rainProbs: [0, 0, 15, 0, 0, 0, 0],
        weatherCodes: [1, 1, 2, 0, 0, 1, 1]
      },
      isFromCache: true
    };

    return fallback;
  }
}
