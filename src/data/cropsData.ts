import { CropGuide } from '../types';

export const CROPS_DATA: CropGuide[] = [
  {
    id: 'wheat',
    nameEn: 'Wheat (Gandum)',
    nameUr: 'گندم (Wheat)',
    season: 'Rabi',
    category: 'Grains',
    image: '',
    sowingWindow: {
      punjab: '1 Nov to 25 Nov (Ideal), Late sowing up to 15 Dec',
      sindh: '15 Oct to 20 Nov (Lower & Central Sindh)',
      kpk: '25 Oct to 25 Nov (Peshawar / Mardan / Swabi)',
      balochistan: '15 Oct to 15 Nov (Nasirabad & Usta Muhammad)'
    },
    temperature: '15°C to 25°C (Tillering & grain filling), Cold winters beneficial',
    soilType: 'Loamy to clay loam, well-drained and fertile',
    phRange: '6.5 to 7.5 (Tolerant up to 8.2 with gypsum)',
    waterRequirement: '4 to 5 irrigations (Crown root, Tillering, Booting, Milking, Dough stages)',
    laborInput: 'Moderate (Harvesting, threshing, and sowing)',
    seedRatePerAcre: '45-50 kg/acre (Nov), 60 kg/acre (Dec late)',
    landPreparation: [
      'Deep plowing with disc plow or chisel plow to break hard pan',
      '2-3 shallow cultivator runs followed by heavy planking (Sohaga)',
      'Laser land leveling is strongly recommended to save 25% water and improve germination'
    ],
    fertilizerSchedule: [
      { stage: 'At Sowing (Basal)', fertilizer: '1.5 Bag DAP + 0.5 Bag SOP + 1 Bag Urea', notes: 'Mix phosphate deep into soil' },
      { stage: '1st Irrigation (20-25 days)', fertilizer: '1 Bag Urea + 5 kg Zinc Sulphate (33%)', notes: 'Crown root initiation' },
      { stage: '2nd Irrigation (45-50 days)', fertilizer: '1 Bag Urea', notes: 'Active tillering stage' },
      { stage: 'Booting Stage (80 days)', fertilizer: '0.5 Bag CAN or Foliar Potash Spray', notes: 'Helps grain size and prevents lodging' }
    ],
    commonPests: [
      'Aphid (سست تیلا) during February/March warmth',
      'Yellow/Brown Rust (کنگی) in cloudy humid weather',
      'Termites (دیملک) in sandy soils',
      'Loose Smut (کنگیار)'
    ],
    commonMistakes: [
      'Late sowing after 25th Nov reduces yield by 15-20 kg per day per acre',
      'Broadcasting seed without proper depth control instead of drill sowing',
      'Excessive irrigation during high winds causes crop lodging (گرنا)',
      'Skipping Zinc application leading to pale stunted leaves'
    ],
    stepByStepTips: [
      'Always use certified rust-resistant seed varieties (Akbar-2019, Dilkash-20, Subhani-21, Fakhar-e-Bhakkar).',
      'Treat seed with fungicide (Thiophanate-methyl) before sowing to eliminate smuts.',
      'Sow with a rabi seed drill at 2 to 3 cm depth with 22 cm row-to-row spacing.',
      'Spray selective weedicide (Bromoxynil + MCPA or Sulfosulfuron) after 1st irrigation when weeds are 2-3 leaf stage.',
      'Stop irrigation 15 days before harvest when grain turns golden hard.'
    ]
  },
  {
    id: 'rice',
    nameEn: 'Rice / Paddy (Dhan)',
    nameUr: 'چاول / دھان (Rice)',
    season: 'Kharif',
    category: 'Grains',
    image: '',
    sowingWindow: {
      punjab: 'Nursery: 20 May - 20 June; Transplanting: 25 June - 25 July (Kalar tract)',
      sindh: 'Nursery: 1 May - 10 June; Transplanting: 1 June - 10 July (Larkana, Jacobabad)',
      kpk: 'Nursery: 10 May - 10 June; Transplanting: 15 June - 15 July (Swat, D.I. Khan)',
      balochistan: 'Nursery: 15 May - 15 June (Jafarabad)'
    },
    temperature: '25°C to 35°C during vegetative growth, warm sunny ripening',
    soilType: 'Heavy clay loam with impermeable subsoil to retain standing water',
    phRange: '5.5 to 7.2 (Tolerates slightly sodic soils with drainage)',
    waterRequirement: 'High (1200 - 1600 mm standing water 5-7 cm depth)',
    laborInput: 'High (Nursery uprooting, transplanting, weeding, manual harvest)',
    seedRatePerAcre: 'Basmati: 5-6 kg nursery seed; IRRI/Coarse: 8-10 kg nursery seed',
    landPreparation: [
      'Dry plowing followed by watering for puddling (کدو کرنا)',
      '2-3 runs with rotavator in standing water to create impervious muddy puddle',
      'Laser leveling beforehand ensures uniform water depth across the field'
    ],
    fertilizerSchedule: [
      { stage: 'At Puddling / Transplanting', fertilizer: '1.5 Bag DAP + 1 Bag SOP', notes: 'Incorporate in mud before planting' },
      { stage: '15-20 Days After Transplant', fertilizer: '1 Bag Urea + 5 kg Zinc Sulphate', notes: 'Panicle initiation booster' },
      { stage: '35-40 Days After Transplant', fertilizer: '1 Bag Urea', notes: 'Tillering booster' }
    ],
    commonPests: [
      'Rice Stem Borer (تنے کی سنڈی)',
      'Leaf Folder (پتہ لپیٹ سنڈی)',
      'Bacterial Leaf Blight (BLB - بیکٹیریل جھلسائو)',
      'Brown Plant Hopper (براؤن پلانٹ ہاپر)'
    ],
    commonMistakes: [
      'Planting nursery older than 35 days which reduces productive tillers',
      'Planting less than 80,000 hills per acre (keep 9x9 inches spacing)',
      'Draining field dry during panicle emergence causing blank grains (پوچے)'
    ],
    stepByStepTips: [
      'For Basmati varieties (Super Basmati, Kainat 1121, Chenab Basmati), maintain 20x20 cm plant spacing with 2 seedlings per hill.',
      'Dip nursery roots in Trichoderma or fungicide slurry before planting.',
      'Apply granular insecticide (Cartap hydrochloride or Carbofuran) at 25-30 days to counter stem borers.',
      'Drain standing water 10 days before harvest to facilitate combine harvesting.'
    ]
  },
  {
    id: 'cotton',
    nameEn: 'Cotton (Kapas)',
    nameUr: 'کپاس (Cotton)',
    season: 'Kharif',
    category: 'Cash Crops',
    image: '',
    sowingWindow: {
      punjab: '1 April - 31 May (Multan, Bahawalpur, Khanewal, Lodhran)',
      sindh: '15 March - 15 May (Sanghar, Mirpurkhas, Nawabshah)',
      kpk: '15 April - 15 May (D.I. Khan belt)',
      balochistan: '15 April - 10 May (Lasbela, Sibi)'
    },
    temperature: '28°C to 42°C (Loves heat; sensitive to frost and waterlogging)',
    soilType: 'Deep alluvial loams with good drainage and high water-holding capacity',
    phRange: '6.5 to 8.0',
    waterRequirement: '6 to 8 irrigations (Avoid irrigation during peak flower drop)',
    laborInput: 'Very high (Manual picking / چنائی, pest scouting, weeding)',
    seedRatePerAcre: '6-8 kg/acre for delinted seed (Bt varieties)',
    landPreparation: [
      'Chisel plow to eliminate hard subsurface soil pan',
      'Laser leveling followed by furrow bed making (75 cm bed-furrow system)',
      'Drip irrigation or raised bed sowing gives 30% higher boll retention'
    ],
    fertilizerSchedule: [
      { stage: 'At Planting / Bed Making', fertilizer: '1.5 Bag DAP + 1 Bag SOP', notes: 'Placed in bands' },
      { stage: '1st Irrigation (30 days)', fertilizer: '1 Bag Urea + Boron spray', notes: 'Square formation stage' },
      { stage: 'Peak Flowering (60-70 days)', fertilizer: '1 Bag CAN / Urea', notes: 'Boll development' },
      { stage: 'Boll Setting (90 days)', fertilizer: 'Foliar Potash spray (1%)', notes: 'Improves fiber strength and boll weight' }
    ],
    commonPests: [
      'Whitefly (سفید مکھی) vector of Cotton Leaf Curl Virus (CLCuV)',
      'Pink Bollworm (گلابی سنڈی) hidden inside green bolls',
      'Thrips (تھرپس) & Jassid (چست تیلا)',
      'Mealybug (ملی بگ)'
    ],
    commonMistakes: [
      'Indiscriminate early synthetic pyrethroid sprays killing natural predator insects',
      'Sowing non-certified unapproved Bt seed with low toxin expression',
      'Over-irrigating during humid July/August causing excessive vegetative growth and boll rot'
    ],
    stepByStepTips: [
      'Install Pheromone Traps (5 per acre) early to monitor pink bollworm moth flights.',
      'Use certified varieties like CKC-01, CKC-03, IUB-13, BS-15, FH-333.',
      'Treat seed with Imidacloprid to protect seedlings against sucking pests for 30 days.',
      'Pick clean cotton without trash or moisture to fetch premium mandi rates.'
    ]
  },
  {
    id: 'sugarcane',
    nameEn: 'Sugarcane (Kamad / Ganna)',
    nameUr: 'کماد / گنا (Sugarcane)',
    season: 'Kharif',
    category: 'Cash Crops',
    image: '',
    sowingWindow: {
      punjab: 'Autumn: 1 Sept - 15 Oct; Spring: 15 Feb - 31 March',
      sindh: 'Autumn: 15 Aug - 30 Sept; Spring: 1 Feb - 15 March',
      kpk: '15 Feb - 31 March (Mardan, Charsadda, Peshawar)',
      balochistan: '15 Feb - 20 March (Nasirabad)'
    },
    temperature: '24°C to 38°C (Long warm growing period with bright sunshine)',
    soilType: 'Deep, rich loams and clay loams with minimum 1 meter fertile depth',
    phRange: '6.5 to 7.5',
    waterRequirement: 'Very high (16 to 22 irrigations throughout the 12-month lifecycle)',
    laborInput: 'High (Trench planting, earthing up, cane cutting, stripping, loading)',
    seedRatePerAcre: '70 to 80 maunds of healthy seed setts (double-eye or three-eye setts)',
    landPreparation: [
      'Deep subsoiling to 45 cm depth followed by disc harrow',
      'Make deep trenches at 3.5 to 4 feet distance with tractor ridger',
      'Laser leveling mandatory to prevent waterlogging at ends'
    ],
    fertilizerSchedule: [
      { stage: 'At Planting in Trenches', fertilizer: '2 Bags DAP + 1 Bag SOP', notes: 'Place beneath seed setts' },
      { stage: 'Tillering (60-75 days)', fertilizer: '1.5 Bags Urea', notes: 'Along with earthing up' },
      { stage: 'Grand Growth (110 days)', fertilizer: '1.5 Bags Urea or CAN', notes: 'Maximum cane elongation' }
    ],
    commonPests: [
      'Top Borer (چوٹی کا گڑواں)',
      'Gurdaspur Borer (گرداسپور بورر)',
      'Pyrilla (کماد کا پتنگا)',
      'Red Rot fungus (لال سڑاند)'
    ],
    commonMistakes: [
      'Planting sets from red-rot infected ratoon crop',
      'Narrow row spacing under 3 feet making mechanical interculture impossible',
      'Delaying earthing up (مٹی چڑھانا) leading to cane lodging during monsoon storms'
    ],
    stepByStepTips: [
      'Opt for high-sugar commercial varieties (CPF-249, CPF-250, CP-77400, HSF-240).',
      'Treat cane setts in fungicide solution (Benomyl or Topsin-M) before trench planting.',
      'Apply earthing up in May/June to convert ridges into furrows and support root stability.',
      'Stop irrigation 20 days prior to harvesting to maximize sucrose recovery percentage.'
    ]
  },
  {
    id: 'maize',
    nameEn: 'Maize / Corn (Makai)',
    nameUr: 'مکئی (Maize)',
    season: 'Kharif',
    category: 'Grains',
    image: '',
    sowingWindow: {
      punjab: 'Spring: 20 Jan - 28 Feb; Autumn: 20 July - 15 Aug',
      sindh: 'Spring: 15 Jan - 20 Feb; Autumn: 1 Aug - 25 Aug',
      kpk: 'Spring: 1 Feb - 10 March; Autumn: 15 July - 10 Aug',
      balochistan: 'Spring: 15 Feb - 15 March'
    },
    temperature: '20°C to 35°C (Avoid temperatures >42°C during pollination)',
    soilType: 'Deep, well-drained sandy loam or silt loam with high organic matter',
    phRange: '5.8 to 7.2',
    waterRequirement: '7 to 9 irrigations (Critical at tasseling and silking)',
    laborInput: 'Moderate (Machine planter, mechanical harvesting or silage chopping)',
    seedRatePerAcre: '8-10 kg/acre hybrid seed (Pioneer, Monsanto/Bayer, Syngenta)',
    landPreparation: [
      'Thorough plowing and rotavation to achieve fine tilth',
      'Make raised ridges at 70 cm row spacing with furrow drill or planter',
      'Plant seed at 6 to 8 inches plant-to-plant spacing for 32,000 plants/acre'
    ],
    fertilizerSchedule: [
      { stage: 'At Planting', fertilizer: '2 Bags DAP + 1 Bag SOP', notes: 'Below seed line' },
      { stage: 'V4 Stage (4-leaf stage)', fertilizer: '1 Bag Urea + 5 kg Zinc', notes: 'Rapid root spread' },
      { stage: 'V8 Stage (Knee high)', fertilizer: '1.5 Bag Urea', notes: 'Tasseling preparation' },
      { stage: 'Tasseling / Silking', fertilizer: '0.5 Bag CAN', notes: 'Ensure full cob grain fill' }
    ],
    commonPests: [
      'Fall Armyworm (فال آرمی ورم - FAW) attacking whorls',
      'Maize Stem Borer (مکئی کا بورر)',
      'Shoot Fly in early spring sowing',
      'Downy Mildew'
    ],
    commonMistakes: [
      'Moisture stress during tasseling causing barren cobs (بغیر دانے کی چھلی)',
      'Delayed control of Fall Armyworm causing severe leaf shredding',
      'High plant density exceeding 35,000 plants per acre causing lodging'
    ],
    stepByStepTips: [
      'Sow high-yielding hybrid varieties like Pioneer 30Y87, DK-6789, Syngenta 8441.',
      'Apply Emamectin benzoate granules or spray in central leaf whorls at 12 and 22 days.',
      'Ensure uninterrupted irrigation during flowering and cob-filling stages.',
      'Harvest at 14% grain moisture or 32% dry matter for dairy silage.'
    ]
  },
  {
    id: 'potato',
    nameEn: 'Potato (Aaloo)',
    nameUr: 'آلو (Potato)',
    season: 'Rabi',
    category: 'Vegetables',
    image: '',
    sowingWindow: {
      punjab: 'Autumn (Core): 25 Sept - 20 Oct (Okara, Sahiwal, Pakpattan, Depalpur)',
      sindh: '15 Oct - 15 Nov (Sukkur, Khairpur)',
      kpk: 'Summer (Hilly): March - April; Autumn: Oct (Swat, Abbottabad)',
      balochistan: 'Spring: Feb - March (Ziarat, Kalat)'
    },
    temperature: '16°C to 22°C (Tuberization halts above 28°C night temperature)',
    soilType: 'Friable sandy loam, loose soil rich in organic matter',
    phRange: '5.2 to 6.5 (Acidic soil prevents common scab)',
    waterRequirement: '7 to 10 light, frequent irrigations (Furrow height 75%)',
    laborInput: 'High (Cutting seed tubers, ridging, weeding, digging, sorting, bagging)',
    seedRatePerAcre: '1000 - 1200 kg certified tubers (35-55 mm size)',
    landPreparation: [
      'Deep plowing with mouldboard plow, multiple cultivator passes, laser leveling',
      'Formation of ridges at 75-80 cm distance with mechanical potato planter'
    ],
    fertilizerSchedule: [
      { stage: 'At Planting', fertilizer: '2.5 Bags DAP + 2 Bags SOP', notes: 'Potash is crucial for tuber quality' },
      { stage: 'Earthing Up (30 days)', fertilizer: '1.5 Bags Urea + Calcium Nitrate', notes: 'Cover newly formed tubers' },
      { stage: 'Bulking Stage (55 days)', fertilizer: 'Foliar Potash (NPK 0-0-50)', notes: 'Enhances skin firmness and size' }
    ],
    commonPests: [
      'Late Blight (پیچھا جھلسائو - Phytophthora infestans) during foggy winter',
      'Early Blight (اگیتا جھلسائو)',
      'Aphids transmitting virus',
      'Cutworms (کٹا کیڑا)'
    ],
    commonMistakes: [
      'Water overflow submerging ridge top causing tuber rot (سڑن)',
      'Skipping preventative metalaxyl or copper fungicide spray before foggy humid weeks',
      'Rough handling during harvesting causing skin abrasions that spoil in cold storage'
    ],
    stepByStepTips: [
      'Use certified imported Dutch seed or tested local tissue culture seed (Santé, Kuroda, Mozart, Asterix).',
      'Pre-sprout tubers in diffused light before planting for uniform field emergence.',
      'Cut water 10 days before dehaulming (cut stems) to allow skin cure before harvest.',
      'Store in sanitized ventilated sheds before transport to commercial cold storage.'
    ]
  },
  {
    id: 'onion',
    nameEn: 'Onion (Piyaz)',
    nameUr: 'پیاز (Onion)',
    season: 'Rabi',
    category: 'Vegetables',
    image: '',
    sowingWindow: {
      punjab: 'Nursery: Oct - Nov; Transplanting: Dec - Jan',
      sindh: 'Nursery: July - Aug; Transplanting: Aug - Sept (Early crop Matiari/Mirpurkhas)',
      kpk: 'Nursery: Nov - Dec; Transplanting: Jan - Feb (Swat, Malakand)',
      balochistan: 'Nursery: Feb - March; Transplanting: April (Chaman, Mastung)'
    },
    temperature: '13°C to 24°C vegetative, 25°C to 30°C for bulb maturity',
    soilType: 'Light sandy loam with plenty of compost, free of stones',
    phRange: '6.0 to 7.0',
    waterRequirement: '12 to 15 light irrigations (Shallow root system needs moisture)',
    laborInput: 'High (Nursery management, transplanting, hand weeding, curing)',
    seedRatePerAcre: '3 to 4 kg nursery seed per acre of field',
    landPreparation: [
      'Plow to fine tilth, mix 10 trolleys well-rotted farmyard manure',
      'Form flat beds (1.5 x 3 m) or raised beds with 10 cm row spacing'
    ],
    fertilizerSchedule: [
      { stage: 'At Transplanting', fertilizer: '1.5 Bag DAP + 1 Bag SOP', notes: 'Basal mix' },
      { stage: '30 Days Post Transplant', fertilizer: '1 Bag Urea + Sulphur 5 kg', notes: 'Pungency and bulb health' },
      { stage: '60 Days Post Transplant', fertilizer: '1 Bag CAN', notes: 'Bulb enlargement' }
    ],
    commonPests: [
      'Onion Thrips (تھرپس) causing silver leaf spotting',
      'Purple Blotch (جامنی داغ fungus)',
      'Downy Mildew',
      'Basal Rot'
    ],
    commonMistakes: [
      'Applying excess nitrogen late in season resulting in thick necks and poor storage life',
      'Harvesting too early before tops collapse naturally (neck fall)',
      'Skipping the 7-day field curing under shade before bagging'
    ],
    stepByStepTips: [
      'Popular varieties include Phulkara, Desi Red, Dark Red, and Swat-1.',
      'Transplant healthy pencil-thick 6-week old seedlings with 10 cm spacing.',
      'Stop irrigation 10-14 days before harvest when 50% tops fall over.',
      'Cure bulbs in shaded airy shade until outer skin becomes paper dry and crackly.'
    ]
  },
  {
    id: 'tomato',
    nameEn: 'Tomato (Tamatar)',
    nameUr: 'ٹماٹر (Tomato)',
    season: 'Rabi',
    category: 'Vegetables',
    image: '',
    sowingWindow: {
      punjab: 'Autumn: Aug - Sept; Spring tunnel: Oct - Nov; Summer: Feb - March',
      sindh: 'Autumn: Sept - Oct; Spring: Dec - Jan (Badin, Thatta)',
      kpk: 'Spring: Feb - March; High hills summer: May - June',
      balochistan: 'Spring: March - April; Summer: May - June (Barkhan, Loralai)'
    },
    temperature: '20°C to 30°C day, 15°C to 20°C night (Fruit set fails over 35°C)',
    soilType: 'Fertile loams with high humus and sharp drainage',
    phRange: '6.0 to 6.8',
    waterRequirement: 'Regular drip or furrow watering (Never wet foliage to stop blight)',
    laborInput: 'High (Tunnel covering, staking/trellising, harvesting every 3-4 days)',
    seedRatePerAcre: '100-150 grams hybrid seed per acre',
    landPreparation: [
      'Deep plowing, 400 kg organic compost per kanal',
      'Raised beds 1 meter wide with drip pipes and black mulch plastic',
      'Install bamboo stakes or wire trellis for indeterminate varieties'
    ],
    fertilizerSchedule: [
      { stage: 'Bed Preparation', fertilizer: '2 Bags DAP + 1.5 Bags SOP', notes: 'Under mulch line' },
      { stage: 'Flowering Stage', fertilizer: 'Calcium Nitrate + Boron foliar', notes: 'Prevents Blossom End Rot' },
      { stage: 'Fruiting Flushes', fertilizer: 'Soluble NPK 20-20-20 via fertigation', notes: 'Weekly micro-dosing' }
    ],
    commonPests: [
      'Tomato Fruit Borer (Helicoverpa armigera)',
      'Tomato Leafminer (Tuta absoluta)',
      'Early & Late Blight',
      'Tomato Yellow Leaf Curl Virus (TYLCV)'
    ],
    commonMistakes: [
      'Overhead flood irrigation washing splash spores onto stems',
      'Calcium deficiency causing black sunken fruit bottoms (Blossom End Rot)',
      'Not pruning sucker shoots on indeterminate varieties'
    ],
    stepByStepTips: [
      'Use high yielding hybrids (Sahil, Advanta 1202, Red Stone, Rover).',
      'High tunnels with plastic sheeting protect winter crop from Punjab frost.',
      'Harvest at "breaker stage" (pink tinge) for distant mandi transport.'
    ]
  },
  {
    id: 'mustard',
    nameEn: 'Mustard / Canola / Raya (Sarson)',
    nameUr: 'سرسوں / رایا / کینولا (Mustard)',
    season: 'Rabi',
    category: 'Oilseeds',
    image: '',
    sowingWindow: {
      punjab: '1 Oct - 31 Oct (Canola/Raya); 15 Sept - 10 Oct (Toria early)',
      sindh: '15 Oct - 15 Nov (Lower & Central Sindh)',
      kpk: '1 Oct - 30 Oct',
      balochistan: '15 Sept - 30 Oct'
    },
    temperature: '15°C to 25°C (Cool climate during pod filling boosts oil percentage)',
    soilType: 'Adaptable to loam, sandy loam and light clay; salt tolerant',
    phRange: '6.5 to 8.2',
    waterRequirement: 'Low to moderate (2 to 3 irrigations)',
    laborInput: 'Low to moderate',
    seedRatePerAcre: '1.5 to 2 kg/acre for Canola; 2 to 2.5 kg for Raya',
    landPreparation: [
      '2 cultivator passes and good planking to retain residual moisture',
      'Sow with rabi drill at 1.5 inch depth with 45 cm row spacing'
    ],
    fertilizerSchedule: [
      { stage: 'At Sowing', fertilizer: '1 Bag DAP + 0.5 Bag SOP + 1 Bag Ammonium Sulphate', notes: 'Sulphur increases oil percentage' },
      { stage: '1st Irrigation (30 days)', fertilizer: '1 Bag Urea', notes: 'Vegetative growth' }
    ],
    commonPests: [
      'Mustard Aphid (ماہو / چست تیلا) attacking flower clusters',
      'Downy Mildew and White Rust',
      'Sawfly larvae'
    ],
    commonMistakes: [
      'Over-dense sowing without thinning leading to thin lanky stems',
      'Missing aphid spray in January causing pod emptiness',
      'Harvesting too late when pods shatter during sunny noon heat'
    ],
    stepByStepTips: [
      'Varieties: Super Canola, Khanpur Raya, Chakwal Raya, Sandal Canola.',
      'Thin crop at 20 days to keep 10-15 cm distance between plants.',
      'Harvest in early morning hours when pods have morning dew to avoid seed shattering.'
    ]
  },
  {
    id: 'chickpea',
    nameEn: 'Chickpea / Gram (Chana)',
    nameUr: 'چنا (Chickpea / Gram)',
    season: 'Rabi',
    category: 'Pulses',
    image: '',
    sowingWindow: {
      punjab: '15 Oct - 15 Nov (Thal desert belt: Bhakkar, Layyah, Khushab, Mianwali)',
      sindh: '15 Oct - 15 Nov (Dadu, Larkana, Jacobabad)',
      kpk: '1 Oct - 31 Oct (Karak, Bannu, Lakki Marwat)',
      balochistan: '15 Oct - 15 Nov'
    },
    temperature: '15°C to 28°C (High humidity or rain during flowering harms pod set)',
    soilType: 'Sandy loam to loamy sand, well-aerated with deep subsoil',
    phRange: '6.0 to 7.5',
    waterRequirement: 'Very low (Thrives on residual soil moisture / rain-fed Thal)',
    laborInput: 'Low (Low chemical input crop, great nitrogen fixer for soil)',
    seedRatePerAcre: 'Desi chana: 30-35 kg/acre; Kabuli chana: 40-45 kg/acre',
    landPreparation: [
      'Conserve soil moisture after summer monsoon with light shallow cultivation',
      'Deep plowing once before sowing, sow using pore drill behind plow'
    ],
    fertilizerSchedule: [
      { stage: 'At Sowing', fertilizer: '1 Bag DAP', notes: 'Pulses fix their own atmospheric nitrogen' }
    ],
    commonPests: [
      'Gram Pod Borer (چنے کی سنڈی - Helicoverpa armigera)',
      'Chickpea Blight (جھلسائو - Ascochyta rabiei)',
      'Fusarium Wilt (اکھیڑا)'
    ],
    commonMistakes: [
      'Irrigating during peak flowering causing vegetative boom and flower drop',
      'Planting in waterlogged or heavy saline soils prone to root rot',
      'Neglecting pod borer scouting when small green pods begin filling'
    ],
    stepByStepTips: [
      'Top varieties: Bittal-2016, Thal-2020, Noor-2019 (Kabuli), Niab-CH-2016.',
      'Inoculate seed with Rhizobium bio-fertilizer culture before planting.',
      'Spray Chlorantraniliprole or Lufenuron at first sign of pod borer larvae.'
    ]
  },
  {
    id: 'mango',
    nameEn: 'Mango (Aam)',
    nameUr: 'آم (Mango)',
    season: 'Kharif',
    category: 'Fruits',
    image: '',
    sowingWindow: {
      punjab: 'Planting: Feb - March & Aug - Sept (Multan, Rahim Yar Khan, Muzaffargarh)',
      sindh: 'Planting: Feb - March & Aug - Sept (Mirpurkhas, Hyderabad, Tando Allahyar)',
      kpk: 'Limited pocket planting in D.I. Khan',
      balochistan: 'Lasbela coastal belt'
    },
    temperature: '25°C to 45°C (Warm tropical/subtropical, sensitive to frost in infancy)',
    soilType: 'Deep alluvial loams at least 2-3 meters deep, with no hard kankar layer',
    phRange: '6.5 to 7.5',
    waterRequirement: 'Bi-weekly in summer, monthly in winter (Stop watering before bloom)',
    laborInput: 'Moderate to high (Pruning, bagging, canopy spray, careful picking)',
    seedRatePerAcre: 'Grafted nursery plants (Square system 30x30 ft: 48 trees/acre; High Density: 100+ trees/acre)',
    landPreparation: [
      'Dig 3x3 ft pits, air-dry for 15 days, refill with topsoil + FYM (50:50) + 1 kg SSP',
      'Install drip irrigation rings around tree canopy drip line'
    ],
    fertilizerSchedule: [
      { stage: 'After Harvest (August)', fertilizer: '1 kg Urea + 1.5 kg DAP + 1 kg SOP per mature tree', notes: 'Restores tree reserves' },
      { stage: 'Post Bloom (March)', fertilizer: '1 kg Urea + Micronutrient spray (Zinc + Boron)', notes: 'Fruit set retention' },
      { stage: 'Fruit Sizing (April/May)', fertilizer: '1 kg SOP or Potassium Nitrate', notes: 'Sweetness and fruit sizing' }
    ],
    commonPests: [
      'Mango Hopper (آم کا تیلا) during flowering',
      'Fruit Fly (Bactrocera dorsalis) attacking ripening fruit',
      'Mango Malformation (گچھا بیماری)',
      'Anthracnose & Powdery Mildew'
    ],
    commonMistakes: [
      'Irrigating during flower panicle emergence causing blossom drop',
      'Not installing Methyl Eugenol sex pheromone traps for fruit fly control',
      'Picking fruit by shaking tree; causes internal pulp breakdown'
    ],
    stepByStepTips: [
      'Renowned cultivars: Sindhri, Chaunsa (Samar Bahisht & White), Anwar Ratol, Dusehri, Fajri.',
      'Install 4-6 Fruit Fly Pheromone Traps per acre 45 days before fruit ripening.',
      'Bag premium Chaunsa/Sindhri fruits with brown paper bags for blemish-free export quality.',
      'Prune dead diseased twigs and open center canopy post-harvest in August.'
    ]
  },
  {
    id: 'citrus',
    nameEn: 'Citrus / Kinnow (Kinoo / Malta)',
    nameUr: 'کنو / مالٹا (Citrus / Kinnow)',
    season: 'Rabi',
    category: 'Fruits',
    image: '',
    sowingWindow: {
      punjab: 'Planting: Feb - March & Sept - Oct (Sargodha, Bhalwal, Toba Tek Singh, Sahiwal)',
      sindh: 'Planting: Spring & Autumn in selected sandy loam belts',
      kpk: 'Planting: Haripur, Swabi sweet orange pockets',
      balochistan: 'Barkhan and Harnai sweet orange pockets'
    },
    temperature: '15°C to 38°C (Subtropical; winter low temperatures induce peel coloration)',
    soilType: 'Deep, light loamy to sandy loam soils with rapid water infiltration',
    phRange: '6.0 to 7.5 (Extremely sensitive to salinity and waterlogging)',
    waterRequirement: 'Moderate (Every 10-14 days in summer; avoid water touching trunk)',
    laborInput: 'Moderate (Pruning, fruit thinning, harvesting with clippers)',
    seedRatePerAcre: 'Grafted plants on Rough Lemon (Jatti Khatti) rootstock (20x20 ft: ~108 plants/acre)',
    landPreparation: [
      'Pits 3x3 ft filled with silt, decomposed farm manure and 250 g Furadan for termites',
      'Make raised ridges so irrigation water never directly contacts trunk bark'
    ],
    fertilizerSchedule: [
      { stage: 'Spring Flush (February)', fertilizer: '1 kg DAP + 1 kg Urea + 0.5 kg SOP per tree', notes: 'Pre-flowering energy' },
      { stage: 'Fruit Setting (April)', fertilizer: '0.75 kg Urea + Zinc Sulphate spray', notes: 'Reduces early fruit drop' },
      { stage: 'Monsoon (August)', fertilizer: '0.5 kg Urea + 0.5 kg SOP', notes: 'Enhances juice percentage and skin shine' }
    ],
    commonPests: [
      'Citrus Canker (سائٹرس کینکر bacteria)',
      'Citrus Psylla (vector of citrus greening / Huanglongbing)',
      'Citrus Leafminer on tender spring flushes',
      'Fruit Drop (گرنا) due to Alternaria'
    ],
    commonMistakes: [
      'Flood irrigation allowing wet water pool against trunk, triggering Phytophthora gummosis (گوند کا نکلنا)',
      'Neglecting Zinc and Iron deficiency causing yellow leaf mottle',
      'Tearing fruit by hand without harvest shears, tearing the peel button'
    ],
    stepByStepTips: [
      'Punjab\'s Sargodha "Kinnow Capital" commands 80% of world\'s Kinnow production.',
      'Spray Copper Hydroxide / Copper Oxychloride after pruning to seal cut wounds against canker.',
      'Paint tree trunks up to 2 feet with Bordeaux paste (Nilathotha + Choona) twice yearly.',
      'Harvest mature fruit with clippers leaving a flush smooth button stem.'
    ]
  }
];
