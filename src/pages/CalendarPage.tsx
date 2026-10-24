import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CROPS_DATA } from '../data/cropsData';
import { CropImage } from '../components/CropImage';
import { CropPlan, CalendarEvent } from '../types';
import { saveCropPlan, getCropPlans, deleteCropPlan } from '../services/dataService';
import { 
  CalendarDays, 
  Sprout, 
  Droplets, 
  TrendingUp, 
  Sun, 
  CheckSquare, 
  Square, 
  Trash2, 
  Save, 
  Sparkles, 
  CloudRain, 
  Info, 
  Lock, 
  MapPin, 
  Plus
} from 'lucide-react';
import { fetchCityWeather } from '../utils/pakistanCitiesWeather';

export const CalendarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedCrop = searchParams.get('crop') || 'wheat';

  const { lang, t } = useLanguage();
  const { currentUser } = useAuth();

  // Inputs
  const [selectedCropId, setSelectedCropId] = useState<string>(preSelectedCrop);
  const [province, setProvince] = useState<string>(currentUser?.province || 'Punjab');
  const [city, setCity] = useState<string>(currentUser?.city || 'Multan');
  const [landArea, setLandArea] = useState<number>(5);
  const [areaUnit, setAreaUnit] = useState<'acre' | 'kanal' | 'marla' | 'hectare'>('acre');
  const [soilType, setSoilType] = useState<'loamy' | 'sandy' | 'clay'>('loamy');
  const [irrigationSource, setIrrigationSource] = useState<'canal' | 'tubewell' | 'rain-fed'>('canal');
  const [sowingDate, setSowingDate] = useState<string>(() => {
    // default to next week
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Generated Plan & Saved Plans
  const [currentPlan, setCurrentPlan] = useState<CropPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<CropPlan[]>([]);
  const [loadingSaved, setLoadingSaved] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [weatherTip, setWeatherTip] = useState<string | null>(null);

  const selectedCrop = CROPS_DATA.find((c) => c.id === selectedCropId) || CROPS_DATA[0];

  useEffect(() => {
    if (currentUser) {
      getCropPlans(currentUser.uid).then((plans) => {
        setSavedPlans(plans);
        if (plans.length > 0 && !currentPlan) {
          setCurrentPlan(plans[0]);
        }
        setLoadingSaved(false);
      });
    } else {
      setLoadingSaved(false);
    }
  }, [currentUser]);

  // Check Open-Meteo for rain probability on next irrigation
  useEffect(() => {
    if (!city) return;
    fetchCityWeather(city)
      .then((w) => {
        if (w.daily && w.daily.rainProbs && w.daily.rainProbs.length > 0) {
          const maxProb = Math.max(...w.daily.rainProbs);
          if (maxProb > 40) {
            setWeatherTip(
              lang === 'ur'
                ? `اوپن میٹیو الرٹ (${w.city}): اگلے 7 دنوں میں ${maxProb}% تک بارش کا امکان ہے۔ اگر آنے والے دنوں میں آبپاشی طے ہے تو اسے بارش تک موخر کر دیں۔`
                : `Open-Meteo Weather Alert (${w.city}): ${maxProb}% chance of rain in the coming 7 days. If an irrigation task falls on a rainy day, postpone watering to avoid root rotting and nutrient leaching.`
            );
          } else {
            setWeatherTip(
              lang === 'ur'
                ? `اوپن میٹیو الرٹ (${w.city}): اگلے 7 دنوں میں کوئی خاص بارش متوقع نہیں۔ اپنا آبپاشی شیڈول معمول کے مطابق جاری رکھیں۔`
                : `Open-Meteo Forecast (${w.city}): Dry skies expected for the next 7 days. Proceed with standard scheduled irrigation doses.`
            );
          }
        }
      })
      .catch(() => null);
  }, [city, lang]);

  // Helper to convert land area to normalized acres for calculation
  const getAcres = () => {
    switch (areaUnit) {
      case 'kanal':
        return landArea / 8;
      case 'marla':
        return landArea / 160;
      case 'hectare':
        return landArea * 2.471;
      default:
        return landArea;
    }
  };

  const generateTimeline = () => {
    const acres = getAcres();
    const sow = new Date(sowingDate);

    // Seed calculation
    const baseSeedKg = selectedCrop.id === 'wheat' ? 50 : selectedCrop.id === 'cotton' ? 7 : selectedCrop.id === 'maize' ? 9 : 8;
    const estSeed = `${Math.round(baseSeedKg * acres)} kg certified seed`;

    // Fertilizer estimation
    const dapBags = Math.round(1.5 * acres * 10) / 10;
    const ureaBags = Math.round(2.5 * acres * 10) / 10;
    const sopBags = Math.round(1.0 * acres * 10) / 10;
    const estFert = `${dapBags} Bags DAP + ${ureaBags} Bags Urea + ${sopBags} Bags Potash (SOP)`;

    // Events timeline generator
    const events: CalendarEvent[] = [];

    // 1. Sowing Event
    events.push({
      id: 'evt-sow',
      title: `Field Sowing / Seed Drill (${selectedCrop.nameEn})`,
      titleUrdu: `${selectedCrop.nameUr} کی بوائی / ڈرل`,
      date: sowingDate,
      type: 'sowing',
      completed: false,
      notes: `Apply ${dapBags} bags DAP basal in soil. Sowing depth 2-3 cm.`
    });

    // 2. First Irrigation & Fertilizer
    const d1 = new Date(sow);
    d1.setDate(d1.getDate() + (soilType === 'sandy' ? 18 : 22));
    events.push({
      id: 'evt-irrig-1',
      title: '1st Irrigation (Crown Root initiation)',
      titleUrdu: 'پہلا پانی (جڑ بننے کا مرحلہ) اور یوریا',
      date: d1.toISOString().slice(0, 10),
      type: 'irrigation',
      completed: false,
      notes: `Broadcast ${Math.round(ureaBags * 0.4)} bags Urea + Zinc Sulphate.`
    });

    // 3. Spray Checkpoint / Weedicide
    const d2 = new Date(sow);
    d2.setDate(d2.getDate() + 32);
    events.push({
      id: 'evt-spray-1',
      title: 'Weedicide & Pest Scouting Checkpoint',
      titleUrdu: 'جڑی بوٹی مار سپرے اور کیڑوں کا معائنہ',
      date: d2.toISOString().slice(0, 10),
      type: 'spray',
      completed: false,
      notes: 'Check for narrow and broad leaf weeds. Spray when weeds are 2-3 leaf stage.'
    });

    // 4. Second Irrigation & Tillering Booster
    const d3 = new Date(sow);
    d3.setDate(d3.getDate() + (soilType === 'sandy' ? 45 : 52));
    events.push({
      id: 'evt-irrig-2',
      title: '2nd Irrigation & Tillering Booster',
      titleUrdu: 'دوسرا پانی اور شگوفے پھوٹنے پر کھاد',
      date: d3.toISOString().slice(0, 10),
      type: 'fertilizer',
      completed: false,
      notes: `Apply remaining ${Math.round(ureaBags * 0.4)} bags Urea.`
    });

    // 5. Third Irrigation / Booting Stage
    const d4 = new Date(sow);
    d4.setDate(d4.getDate() + 85);
    events.push({
      id: 'evt-irrig-3',
      title: '3rd Irrigation (Booting / Flowering Stage)',
      titleUrdu: 'تیسرا پانی (سٹہ نکلنے اور پھول کا مرحلہ)',
      date: d4.toISOString().slice(0, 10),
      type: 'irrigation',
      completed: false,
      notes: 'Avoid irrigation during heavy winds to prevent crop lodging.'
    });

    // 6. Final Irrigation / Grain Filling
    const d5 = new Date(sow);
    d5.setDate(d5.getDate() + 115);
    events.push({
      id: 'evt-irrig-4',
      title: 'Final Irrigation (Milking / Dough Stage)',
      titleUrdu: 'آخری پانی (دودھیا اور دانہ بننے کا مرحلہ)',
      date: d5.toISOString().slice(0, 10),
      type: 'irrigation',
      completed: false,
      notes: 'Stop all irrigation 15 days before harvest.'
    });

    // 7. Harvest Event
    const d6 = new Date(sow);
    d6.setDate(d6.getDate() + 145);
    events.push({
      id: 'evt-harvest',
      title: `Crop Harvest & Threshing (${selectedCrop.nameEn})`,
      titleUrdu: `${selectedCrop.nameUr} کی کٹائی اور گہائی`,
      date: d6.toISOString().slice(0, 10),
      type: 'harvest',
      completed: false,
      notes: 'Harvest when grains are hard and moisture is below 13%.'
    });

    const newPlan: CropPlan = {
      id: 'plan_' + Date.now(),
      userId: currentUser?.uid || 'guest-farmer',
      cropId: selectedCrop.id,
      cropName: selectedCrop.nameEn,
      cropNameUrdu: selectedCrop.nameUr,
      province,
      city,
      landArea,
      areaUnit,
      soilType,
      irrigationSource,
      sowingDate,
      estimatedSeedQty: estSeed,
      estimatedFertilizer: estFert,
      events,
      createdAt: new Date().toISOString()
    };

    setCurrentPlan(newPlan);
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;
    if (!currentUser) return;
    await saveCropPlan(currentPlan);
    setSaveSuccess(true);
    const updated = await getCropPlans(currentUser.uid);
    setSavedPlans(updated);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleEvent = async (eventId: string) => {
    if (!currentPlan) return;
    const updatedEvents = currentPlan.events.map((e) =>
      e.id === eventId ? { ...e, completed: !e.completed } : e
    );
    const updatedPlan = { ...currentPlan, events: updatedEvents };
    setCurrentPlan(updatedPlan);
    if (currentUser) {
      await saveCropPlan(updatedPlan);
      const updated = await getCropPlans(currentUser.uid);
      setSavedPlans(updated);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!currentUser) return;
    await deleteCropPlan(planId);
    const updated = await getCropPlans(currentUser.uid);
    setSavedPlans(updated);
    if (currentPlan?.id === planId) {
      setCurrentPlan(updated[0] || null);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'sowing':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'irrigation':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'fertilizer':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'spray':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'harvest':
        return 'bg-yellow-100 text-yellow-950 border-yellow-300 font-black';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-start">
      
      {/* Header */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-xs uppercase tracking-wider mb-1">
          <CalendarDays className="w-4 h-4" />
          <span>Automated Agronomic Timeline Generator</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1B5E20]">
          {t.calendarTitle}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">
          {t.calendarSubtitle}
        </p>

        {/* Weather aware alert tip */}
        {weatherTip && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-blue-950">
            <CloudRain className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-blue-900 mb-0.5">{t.weatherAwareTip}</span>
              <p className="leading-relaxed">{weatherTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Form Generator on Left, Output & Calendar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Parameters */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-bold">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">
                {t.createNewPlan}
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'ur' ? 'اپنے رقبے اور مٹی کی معلومات درج کریں' : 'Enter your field details to generate tailored dates'}
              </p>
            </div>
          </div>

          {/* Crop Selector with Visual Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {lang === 'ur' ? 'فصل منتخب کریں' : 'Select Crop'}
            </label>
            <div className="mb-3 rounded-2xl overflow-hidden border border-[#E3D3A8]">
              <CropImage crop={selectedCrop} frameClassName="w-full aspect-[16/10]" />
            </div>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#2E7D32]"
            >
              {CROPS_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'ur' ? c.nameUr : c.nameEn} ({c.season})
                </option>
              ))}
            </select>
          </div>

          {/* Provincial Sowing Window Guidance */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
            <span className="font-bold text-[#1B5E20] block mb-0.5">
              {t.sowingWindow} ({province}):
            </span>
            <p className="text-gray-700 font-medium">
              {province === 'Punjab'
                ? selectedCrop.sowingWindow.punjab
                : province === 'Sindh'
                ? selectedCrop.sowingWindow.sindh
                : province === 'KPK'
                ? selectedCrop.sowingWindow.kpk
                : selectedCrop.sowingWindow.balochistan}
            </p>
          </div>

          {/* Province & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.province}
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="Punjab">Punjab (پنجاب)</option>
                <option value="Sindh">Sindh (سندھ)</option>
                <option value="KPK">Khyber Pakhtunkhwa (کے پی کے)</option>
                <option value="Balochistan">Balochistan (بلوچستان)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.city}
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Multan, Sahiwal"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>
          </div>

          {/* Land Area & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.landArea}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={landArea}
                onChange={(e) => setLandArea(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.areaUnit}
              </label>
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="acre">{lang === 'ur' ? 'ایکڑ (Acre)' : 'Acre'}</option>
                <option value="kanal">{lang === 'ur' ? 'کنال (Kanal)' : 'Kanal'}</option>
                <option value="marla">{lang === 'ur' ? 'مرلہ (Marla)' : 'Marla'}</option>
                <option value="hectare">{lang === 'ur' ? 'ہیکٹر (Hectare)' : 'Hectare'}</option>
              </select>
            </div>
          </div>

          {/* Soil Type & Water Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.soilType}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="loamy">{lang === 'ur' ? 'میرا مٹی (Loamy)' : 'Loamy (Medium)'}</option>
                <option value="sandy">{lang === 'ur' ? 'ریتلی مٹی (Sandy)' : 'Sandy (Light)'}</option>
                <option value="clay">{lang === 'ur' ? 'چکنی مٹی (Clay)' : 'Clay / Heavy'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {t.irrigationSource}
              </label>
              <select
                value={irrigationSource}
                onChange={(e) => setIrrigationSource(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold"
              >
                <option value="canal">{lang === 'ur' ? 'نہری پانی (Canal)' : 'Canal Water'}</option>
                <option value="tubewell">{lang === 'ur' ? 'ٹیوب ویل (Tubewell)' : 'Tubewell Water'}</option>
                <option value="rain-fed">{lang === 'ur' ? 'بارانی / بارش (Rain-fed)' : 'Rain-fed (Barani)'}</option>
              </select>
            </div>
          </div>

          {/* Sowing Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {lang === 'ur' ? 'متوقع بوائی کی تاریخ' : 'Planned Sowing Date'}
            </label>
            <input
              type="date"
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-800"
            />
          </div>

          {/* Action button */}
          <button
            onClick={generateTimeline}
            className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-[#F9A825]" />
            <span>{t.generatePlan}</span>
          </button>
        </div>

        {/* Right Column: Interactive Schedule & Events */}
        <div className="lg:col-span-7 space-y-6">
          
          {currentPlan ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 space-y-6">
              
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 px-2.5 py-1 bg-[#E8F5E9] rounded-lg">
                    {currentPlan.province} • {currentPlan.landArea} {currentPlan.areaUnit} ({currentPlan.soilType} soil)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                    {lang === 'ur' ? currentPlan.cropNameUrdu : currentPlan.cropName} Timeline
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sowing: {currentPlan.sowingDate} | {currentPlan.events.length} Key Farm Events
                  </p>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleSavePlan}
                    className="px-4 py-2.5 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saveSuccess ? (lang === 'ur' ? 'محفوظ ہو گیا!' : 'Saved!') : (lang === 'ur' ? 'پلان محفوظ کریں' : 'Save Plan')}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-3.5 py-2 bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'محفوظ کرنے کے لیے لاگ ان کریں' : 'Login to Save'}</span>
                  </Link>
                )}
              </div>

              {/* Input Quantities Summary Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl">
                  <span className="text-amber-800 font-bold uppercase block text-[10px]">
                    {t.estimatedSeedRequirement}
                  </span>
                  <span className="text-sm font-black text-amber-950 mt-0.5 block">
                    {currentPlan.estimatedSeedQty}
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                  <span className="text-emerald-800 font-bold uppercase block text-[10px]">
                    {t.estimatedFertilizerRequirement}
                  </span>
                  <span className="text-sm font-black text-emerald-950 mt-0.5 block">
                    {currentPlan.estimatedFertilizer}
                  </span>
                </div>
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-semibold text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Sowing
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span> Irrigation
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-600"></span> Fertilizer
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600"></span> Spray Checkpoint
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Harvest
                </span>
              </div>

              {/* Interactive Event Checkboxes Timeline */}
              <div className="space-y-3 pt-2">
                {currentPlan.events.map((evt) => {
                  return (
                    <div
                      key={evt.id}
                      onClick={() => handleToggleEvent(evt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        evt.completed
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-white hover:bg-gray-50/80 border-gray-200 shadow-xs'
                      }`}
                    >
                      <div className="mt-0.5 text-[#1B5E20] shrink-0">
                        {evt.completed ? (
                          <CheckSquare className="w-5 h-5 text-[#2E7D32]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getEventBadge(
                              evt.type
                            )}`}
                          >
                            {evt.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-gray-500">
                            📅 {evt.date}
                          </span>
                        </div>

                        <h4
                          className={`text-sm font-bold ${
                            evt.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {lang === 'ur' ? evt.titleUrdu : evt.title}
                        </h4>

                        {evt.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {evt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="h-80 bg-white rounded-3xl p-8 border border-gray-200 flex flex-col items-center justify-center text-center space-y-3 shadow-md">
              <CalendarDays className="w-12 h-12 text-[#81C784]" />
              <h3 className="text-lg font-bold text-gray-800">
                {lang === 'ur' ? 'اپنا پہلا فصل شیڈول بنائیں' : 'Ready to Generate Your Schedule'}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                {lang === 'ur'
                  ? 'بائیں جانب فارم میں فصل، رقبہ اور بوائی کی تاریخ منتخب کر کے شیڈول حاصل کریں۔'
                  : 'Select your crop, land area, and intended sowing date to generate a tailored calendar.'}
              </p>
            </div>
          )}

          {/* Saved Plans Section */}
          {savedPlans.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
              <h3 className="text-lg font-black text-[#1B5E20]">
                {t.mySavedPlans} ({savedPlans.length})
              </h3>

              <div className="space-y-3">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl bg-gray-50 hover:bg-[#E8F5E9]/50 border border-gray-200 transition-colors flex items-center justify-between gap-3"
                  >
                    <div
                      onClick={() => setCurrentPlan(plan)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <span className="font-bold text-sm text-gray-900 block truncate">
                        {lang === 'ur' ? plan.cropNameUrdu : plan.cropName} ({plan.landArea} {plan.areaUnit})
                      </span>
                      <span className="text-xs text-gray-500">
                        {plan.province} • Sown: {plan.sowingDate}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
