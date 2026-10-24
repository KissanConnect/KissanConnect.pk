import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { generateFarmerAdvice, getWeatherCodeLabel } from '../utils/weatherAdvice';
import { 
  fetchCityWeather, 
  PAKISTAN_CITIES, 
  ParsedWeatherData 
} from '../utils/pakistanCitiesWeather';
import { 
  CloudSun, 
  Search, 
  Wind, 
  Droplets, 
  Sun, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Calendar,
  Compass,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';

const CITIES_LIST = Object.values(PAKISTAN_CITIES);

export const WeatherPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  const [selectedCity, setSelectedCity] = useState<string>(
    currentUser?.city || 'Multan'
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<ParsedWeatherData | null>(null);

  const loadWeather = async (cityName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCityWeather(cityName);
      setWeatherData(data);
    } catch (err: any) {
      console.error('Weather load exception:', err);
      setError(
        lang === 'ur'
          ? 'موسمی ڈیٹا لوڈ کرنے میں عارضی مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Unable to reach weather satellite right now. You can retry or view saved offline forecast.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedCity(searchInput.trim());
      setSearchInput('');
    }
  };

  // Farmer advice generator based on latest data
  const adviceList = weatherData
    ? generateFarmerAdvice(
        weatherData.current.temperature,
        weatherData.current.windSpeed,
        weatherData.current.precipitation,
        weatherData.daily.rainProbs[1] || 0,
        weatherData.daily.rainSums[1] || 0,
        weatherData.daily.maxTemps[0] || weatherData.current.temperature
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-xs uppercase tracking-wider mb-1">
            <CloudSun className="w-4 h-4" />
            <span>Open-Meteo Satellite Micro-Climate (Pakistan)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20]">
            {t.weatherTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.weatherSubtitle}
          </p>
        </div>

        <button
          onClick={() => loadWeather(selectedCity)}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? (lang === 'ur' ? 'اپ ڈیٹ ہو رہا ہے...' : 'Updating...') : t.refresh}</span>
        </button>
      </div>

      {/* City Selector & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-gray-100 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchCityPlaceholder}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer shrink-0"
          >
            {t.search}
          </button>
        </form>

        {/* Popular Pakistani Agri Cities Pills */}
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            {t.popularCities} (Pre-loaded coordinates):
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CITIES_LIST.map((cityObj) => {
              const isSelected = selectedCity.toLowerCase() === cityObj.name.toLowerCase();
              return (
                <button
                  key={cityObj.name}
                  onClick={() => setSelectedCity(cityObj.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B5E20] text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {lang === 'ur' ? cityObj.nameUrdu : cityObj.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Friendly Cache Notification / Error State with Retry Button */}
      {weatherData?.isFromCache && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F9A825] shrink-0" />
            <span>
              {lang === 'ur'
                ? `محفوظ شدہ موسمی رپورٹ دکھائی جا رہی ہے (${weatherData.city})۔ لائیو اپ ڈیٹ کے لیے دوبارہ کوشش کریں۔`
                : `Displaying last verified weather snapshot for ${weatherData.city}.`}
            </span>
          </div>
          <button
            onClick={() => loadWeather(selectedCity)}
            className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-xs cursor-pointer transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadWeather(selectedCity)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Weather Display */}
      {loading && !weatherData ? (
        <div className="h-64 bg-white rounded-3xl p-8 flex flex-col items-center justify-center space-y-3 shadow-md animate-pulse">
          <CloudSun className="w-12 h-12 text-[#81C784] animate-bounce" />
          <p className="text-sm font-semibold text-gray-500">{t.loading}</p>
        </div>
      ) : weatherData ? (
        <div className="space-y-8">
          
          {/* Current Conditions Card */}
          <div className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="md:col-span-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A5D6A7] text-xs font-semibold backdrop-blur-xs">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Lat: {weatherData.latitude.toFixed(2)}°, Long: {weatherData.longitude.toFixed(2)}°</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white">
                  {weatherData.city}
                </h2>
                <p className="text-base text-[#C8E6C9] font-medium">
                  {getWeatherCodeLabel(weatherData.current.weatherCode, lang === 'ur').label}
                </p>
                <div className="text-5xl sm:text-6xl font-black text-[#F9A825] pt-2">
                  {weatherData.current.temperature}°C
                </div>
              </div>

              {/* Sensor metrics grid */}
              <div className="md:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#C8E6C9] text-xs font-semibold">
                    <Droplets className="w-4 h-4 text-[#81C784]" />
                    <span>{t.humidity}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {weatherData.current.humidity}%
                  </div>
                  <span className="text-[10px] text-[#A5D6A7]">Relative air moisture</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#C8E6C9] text-xs font-semibold">
                    <Wind className="w-4 h-4 text-[#81C784]" />
                    <span>{t.windSpeed}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {weatherData.current.windSpeed} km/h
                  </div>
                  <span className="text-[10px] text-[#A5D6A7]">
                    {weatherData.current.windSpeed > 18 ? 'Too windy for spray' : 'Safe for spray'}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#C8E6C9] text-xs font-semibold">
                    <CloudRain className="w-4 h-4 text-[#81C784]" />
                    <span>{t.precipitation}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {weatherData.current.precipitation} mm
                  </div>
                  <span className="text-[10px] text-[#A5D6A7]">Current rainfall</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-[#C8E6C9] text-xs font-semibold">
                    <Sun className="w-4 h-4 text-[#81C784]" />
                    <span>Today High/Low</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {Math.round(weatherData.daily.maxTemps[0] || weatherData.current.temperature)}° / {Math.round(weatherData.daily.minTemps[0] || 18)}°
                  </div>
                  <span className="text-[10px] text-[#A5D6A7]">Diurnal variation</span>
                </div>

              </div>

            </div>
          </div>

          {/* Actionable Farmer Advisory Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center">
                <Sun className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#1B5E20]">
                  {t.agriAdviceTitle} ({weatherData.city})
                </h3>
                <p className="text-xs text-gray-500">
                  {lang === 'ur'
                    ? 'ہوا، بارش اور گرمی کے تناسب سے فصل کی دیکھ بھال کے مشورے'
                    : 'Real-time guidance for pesticide application, tubewell scheduling, and field operations.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adviceList.map((adv) => (
                <div
                  key={adv.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    adv.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : adv.type === 'success'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {adv.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : adv.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">
                      {lang === 'ur' ? adv.titleUr : adv.titleEn}
                    </h4>
                    <p className="text-xs leading-relaxed mt-1 opacity-90">
                      {lang === 'ur' ? adv.messageUr : adv.messageEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
            <h3 className="text-lg sm:text-xl font-extrabold text-[#1B5E20] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{t.forecast7Day}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weatherData.daily.dates.map((dateStr, idx) => {
                const dateObj = new Date(dateStr);
                const dayName = dateObj.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-PK', { weekday: 'short' });
                const monthDay = dateObj.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
                const code = weatherData.daily.weatherCodes[idx] ?? 0;
                const weatherInfo = getWeatherCodeLabel(code, lang === 'ur');
                const rainSum = weatherData.daily.rainSums[idx] || 0;

                return (
                  <div
                    key={dateStr}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between transition-all hover:border-[#81C784] ${
                      idx === 0 ? 'bg-[#E8F5E9]/50 border-[#81C784]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">{dayName}</span>
                      <span className="text-[10px] text-gray-500 block mb-2">{monthDay}</span>

                      <div className="w-9 h-9 rounded-xl bg-white shadow-xs mx-auto flex items-center justify-center text-[#2E7D32] my-1">
                        {rainSum > 1 ? (
                          <CloudRain className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Sun className="w-5 h-5 text-amber-500" />
                        )}
                      </div>

                      <span className="text-[10px] font-semibold text-gray-700 block truncate mt-1">
                        {weatherInfo.label}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200/80">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black text-gray-900">
                        <span>{Math.round(weatherData.daily.maxTemps[idx] ?? 30)}°</span>
                        <span className="text-gray-400 font-normal">/</span>
                        <span className="text-gray-500 text-[11px] font-semibold">{Math.round(weatherData.daily.minTemps[idx] ?? 18)}°</span>
                      </div>

                      {rainSum > 0 ? (
                        <span className="text-[10px] font-bold text-blue-700 block mt-1">
                          ☔ {rainSum} mm
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-800 font-medium block mt-1">
                          No Rain
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
};
