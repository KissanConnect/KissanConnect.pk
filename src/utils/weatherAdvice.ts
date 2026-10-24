export interface WeatherAdvice {
  id: string;
  type: 'warning' | 'info' | 'success';
  titleEn: string;
  titleUr: string;
  messageEn: string;
  messageUr: string;
}

export function generateFarmerAdvice(
  currentTemp: number,
  windSpeed: number,
  rainToday: number,
  rainTomorrowProb: number,
  rainTomorrowSum: number,
  maxTemp: number
): WeatherAdvice[] {
  const tips: WeatherAdvice[] = [];

  // Wind check for pesticide spray
  if (windSpeed > 18) {
    tips.push({
      id: 'high-wind',
      type: 'warning',
      titleEn: 'High Wind Alert - Avoid Spraying',
      titleUr: 'تیز ہوا کی وارننگ - سپرے نہ کریں',
      messageEn: `Current wind speed is ${windSpeed} km/h. Avoid pesticide and weedicide spraying as drift will waste chemicals and damage neighboring crops.`,
      messageUr: `ہوا کی رفتار ${windSpeed} کلومیٹر فی گھنٹہ ہے۔ کیڑے مار اور جڑی بوٹی مار ادویات کا سپرے نہ کریں کیونکہ ہوا سے دوائی ضائع ہو جائے گی۔`
    });
  } else if (windSpeed < 10) {
    tips.push({
      id: 'calm-wind',
      type: 'success',
      titleEn: 'Favorable Spray Conditions',
      titleUr: 'سپرے کے لیے موافق موسم',
      messageEn: `Gentle breeze (${windSpeed} km/h). Good window for foliar fertilizer or pest control applications in the morning or late afternoon.`,
      messageUr: `ہوا معتدل ہے (${windSpeed} کلومیٹر/گھنٹہ)۔ صبح یا شام کے وقت سپرے یا کھاد کے اسپرے کے لیے بہترین وقت ہے۔`
    });
  }

  // Rain forecast check for irrigation
  if (rainTomorrowProb > 40 || rainTomorrowSum > 3 || rainToday > 2) {
    tips.push({
      id: 'rain-alert',
      type: 'warning',
      titleEn: 'Rain Expected - Postpone Irrigation',
      titleUr: 'بارش کا امکان - آبپاشی روک دیں',
      messageEn: `Precipitation chance is ${rainTomorrowProb}% (estimated ${rainTomorrowSum} mm). Delay canal or tubewell watering to prevent waterlogging and fertilizer leaching.`,
      messageUr: `کل بارش کا امکان ${rainTomorrowProb}% ہے۔ ٹیوب ویل یا نہری پانی لگانے میں تاخیر کریں تاکہ پانی جمع ہونے اور کھاد ضائع ہونے سے بچا جا سکے۔`
    });
  } else {
    tips.push({
      id: 'clear-skies',
      type: 'info',
      titleEn: 'Clear Sky - Normal Field Operations',
      titleUr: 'صاف مطلع - معمول کا کام جاری رکھیں',
      messageEn: 'No significant rain expected in the next 24-48 hours. Routine irrigation, harvesting, and sowing can proceed safely.',
      messageUr: 'اگلے 24 سے 48 گھنٹوں میں بارش کا کوئی خطرہ نہیں۔ آبپاشی، کٹائی یا بوائی معمول کے مطابق جاری رکھیں۔'
    });
  }

  // Temperature and heat check
  if (maxTemp >= 38) {
    tips.push({
      id: 'heat-stress',
      type: 'warning',
      titleEn: 'High Heat Warning - Irrigate in Evening',
      titleUr: 'شدید گرمی - صرف شام کو پانی لگائیں',
      messageEn: `Maximum temperature reaches ${maxTemp}°C. Apply irrigation in late evenings to reduce water evaporation and protect root zone temperature. Provide shade for livestock.`,
      messageUr: `درجہ حرارت ${maxTemp}°C تک پہنچنے کا امکان ہے۔ شام کے وقت ٹھنڈے موسم میں پانی لگائیں اور مویشیوں کو دھوپ سے بچائیں۔`
    });
  } else if (currentTemp <= 5) {
    tips.push({
      id: 'frost-cold',
      type: 'warning',
      titleEn: 'Cold / Frost Risk - Shield Sensitive Crops',
      titleUr: 'کورا اور شدید سردی کا خطرہ',
      messageEn: `Low temperatures near ${currentTemp}°C. Light evening irrigation or smoke mulching can raise field temperatures by 2-3°C and save potato/vegetable crops from frost damage.`,
      messageUr: `درجہ حرارت ${currentTemp}°C تک گر چکا ہے۔ سبزیوں اور آلو کو کورے سے بچانے کے لیے ہلکا پانی لگائیں۔`
    });
  }

  return tips;
}

// Weather Code descriptions for Open-Meteo WMO weather interpretation codes
export function getWeatherCodeLabel(code: number, isUrdu = false): { label: string; icon: string } {
  switch (code) {
    case 0:
      return { label: isUrdu ? 'صاف آسمان' : 'Clear Sky', icon: 'Sun' };
    case 1:
    case 2:
      return { label: isUrdu ? 'جزوی ابر آلود' : 'Partly Cloudy', icon: 'CloudSun' };
    case 3:
      return { label: isUrdu ? 'مکمل ابر آلود' : 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { label: isUrdu ? 'دھند / سموگ' : 'Fog / Mist', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { label: isUrdu ? 'ہلکی بوندا باندی' : 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { label: isUrdu ? 'بارش' : 'Rain', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { label: isUrdu ? 'برف باری' : 'Snow', icon: 'CloudSnow' };
    case 80:
    case 81:
    case 82:
      return { label: isUrdu ? 'تیز بارش کی پھوار' : 'Rain Showers', icon: 'CloudRain' };
    case 95:
    case 96:
    case 99:
      return { label: isUrdu ? 'گرج چمک اور طوفان' : 'Thunderstorm', icon: 'CloudLightning' };
    default:
      return { label: isUrdu ? 'معتدل موسم' : 'Fair', icon: 'Sun' };
  }
}
