export interface AgriScheme {
  id: string;
  titleEn: string;
  titleUr: string;
  badgeEn: string;
  badgeUr: string;
  authorityEn: string;
  authorityUr: string;
  summaryEn: string;
  summaryUr: string;
  benefitsEn: string[];
  benefitsUr: string[];
  eligibilityEn: string[];
  eligibilityUr: string[];
  documentsEn: string[];
  documentsUr: string[];
  howToApplyEn: string;
  howToApplyUr: string;
  stepsEn: string[];
  stepsUr: string[];
  helpline: string;
  officialSite: string;
  category: 'subsidy' | 'credit' | 'equipment' | 'insurance';
}

export const AGRI_SCHEMES: AgriScheme[] = [
  {
    id: 'kissan-card-punjab',
    titleEn: 'Punjab CM Kissan Card Initiative',
    titleUr: 'وزیر اعلیٰ پنجاب کسان کارڈ پروگرام',
    badgeEn: 'Direct Financial Aid',
    badgeUr: 'براہ راست مالی امداد',
    authorityEn: 'Govt. of Punjab / Bank of Punjab (BOP)',
    authorityUr: 'حکومت پنجاب / بینک آف پنجاب',
    summaryEn: 'An interest-free production loan of up to PKR 150,000 per crop season for small farmers (up to 12.5 acres) to purchase genuine seeds, DAP, and Urea fertilizers.',
    summaryUr: 'چھوٹے کسانوں (12.5 ایکڑ تک) کے لیے فی سیزن 150,000 روپے تک کا بلاسود زرعی قرضہ جس سے منظور شدہ ڈیلرز سے اصلی بیج، ڈی اے پی اور یوریا خریدی جا سکتی ہے۔',
    benefitsEn: [
      'PKR 150,000 interest-free production credit per crop season',
      'Direct purchase from registered fertilizer dealers via POS biometric machines',
      'Repayment within 6 months after harvest with zero interest or hidden charges',
      'Guaranteed supply of genuine registered seed bags and quality fertilizers'
    ],
    benefitsUr: [
      'فی سیزن ڈیڑھ لاکھ روپے (150,000 روپے) تک کا بلاسود پروڈکشن قرضہ',
      'رجسٹرڈ ڈیلرز سے بائیو میٹرک تصدیق پر اصلی کھاد اور بیج کی فوری خریداری',
      'فصل کٹائی کے بعد 6 ماہ میں بلاسود آسان واپسی',
      'دو نمبر کھاد اور بلیک مارکیٹ سے مکمل نجات'
    ],
    eligibilityEn: [
      'Landholding up to 12.5 acres registered in Punjab Land Record Authority (PLRA)',
      'Verified mobile SIM registered in the applicant farmer\'s own CNIC',
      'Clear credit history with no existing commercial bank defaults',
      'Resident and active cultivator in Punjab province'
    ],
    eligibilityUr: [
      'پنجاب لینڈ ریکارڈ اتھارٹی (PLRA) میں 12.5 ایکڑ تک زرعی رقبہ کا اندراج',
      'کسان کے اپنے شناختی کارڈ پر رجسٹرڈ موبائل سم',
      'کسی کمرشل بینک یا مائیکرو فنانس ادارے سے نادہندہ نہ ہو',
      'پنجاب کا مستقل رہائشی اور خود کاشتکار ہو'
    ],
    documentsEn: [
      'Original CNIC along with 2 verified photocopies',
      'Fard Malkiat / Khasra Girdawari issued by PLRA Arazi Record Center',
      'Biometric SIM verification slip from cellular operator',
      'Two recent passport-size photographs'
    ],
    documentsUr: [
      'اصل قومی شناختی کارڈ بمعہ 2 تصدیق شدہ نقول',
      'اراضی ریکارڈ سینٹر (PLRA) سے جاری کردہ فرد ملکیت یا خسرہ گرداوری',
      'اپنے نام رجسٹرڈ سم کی بائیو میٹرک سلپ',
      'دو عدد تازہ ترین پاسپورٹ سائز تصاویر'
    ],
    howToApplyEn: 'Send SMS "PKC <space> CNIC Number" to 8070 or visit nearest Agriculture Extension office / Bank of Punjab branch.',
    howToApplyUr: 'اپنے شناختی کارڈ نمبر سے 8070 پر "PKC <space> شناختی کارڈ نمبر" کا میسج بھیجیں یا قریبی محکمہ زراعت توسیع کے دفتر / بینک آف پنجاب سے رجوع کریں۔',
    stepsEn: [
      'Step 1: Check mobile registration by sending "PKC <space> CNIC" to 8070.',
      'Step 2: Receive SMS confirmation with Arazi Record Center verification token.',
      'Step 3: Visit the local Bank of Punjab (BOP) branch to complete biometric account opening.',
      'Step 4: Receive Kissan ATM/Debit card and activate at any registered fertilizer dealership.'
    ],
    stepsUr: [
      'مرحلہ 1: اپنے موبائل سے 8070 پر "PKC <space> شناختی کارڈ نمبر" بھیج کر اہلیت چیک کریں۔',
      'مرحلہ 2: تصدیقی جوابی ایس ایم ایس اور اراضی ریکارڈ سینٹر کا تصدیقی ٹوکن حاصل کریں۔',
      'مرحلہ 3: قریبی بینک آف پنجاب (BOP) برانچ جا کر بائیو میٹرک تصدیق اور فارم مکمل کریں۔',
      'مرحلہ 4: اپنا کسان کارڈ وصول کریں اور قریبی رجسٹرڈ کھاد ڈیلر سے بائیو میٹرک پی او ایس مشین کے ذریعے خریداری کریں۔'
    ],
    helpline: '0800-17000',
    officialSite: 'https://agripunjab.gov.pk',
    category: 'credit'
  },
  {
    id: 'green-tractor-scheme',
    titleEn: 'Chief Minister Green Tractor Scheme',
    titleUr: 'چیف منسٹر گرین ٹریکٹر سبسیڈی سکیم',
    badgeEn: 'Equipment Subsidy',
    badgeUr: 'مشینری سبسیڈی',
    authorityEn: 'Punjab Agriculture Department & Millat / Al-Ghazi',
    authorityUr: 'محکمہ زراعت پنجاب و مقامی ٹریکٹر مینوفیکچررز',
    summaryEn: 'Direct government subsidy of up to PKR 1,000,000 (10 Lakh) on purchase of new locally manufactured 50 to 85 HP agricultural tractors through digital balloting.',
    summaryUr: '50 تا 85 ہارس پاور کے نئے مقامی ٹریکٹروں کی خریداری پر حکومت کی طرف سے 10 لاکھ روپے تک کی یکمشت نقد سبسیڈی، جس کا فیصلہ شفاف ڈیجیٹل قرعہ اندازی سے ہوتا ہے۔',
    benefitsEn: [
      'Flat PKR 1,000,000 direct subsidy deducted from ex-factory price',
      'Choice of any brand: Millat MF-240, 260, 385 or Al-Ghazi NH-480, NH-640',
      'Transparent district and tehsil quota computerized digital balloting',
      'Full factory warranty with direct company delivery'
    ],
    benefitsUr: [
      'ایکس فیکٹری قیمت پر 10 لاکھ روپے (1,000,000 روپے) کی یکمشت نقد سبسیڈی',
      'اپنی پسند کا ٹریکٹر منتخب کریں: ملت میسی فرگوسن یا الغازی نیو ہالینڈ',
      'تحصیل اور ضلعی کوٹہ کے تحت مکمل شفاف کمپیوٹرائزڈ قرعہ اندازی',
      'کمپنی کی مکمل وارنٹی اور براہ راست ڈلیوری'
    ],
    eligibilityEn: [
      'Pakistani agricultural landholders owning between 1 to 50 acres in Punjab',
      'Applicant must not have won any tractor subsidy in the last 5 years',
      'Applicant must possess a valid biometric-verified Pakistani CNIC'
    ],
    eligibilityUr: [
      'پنجاب میں 1 تا 50 ایکڑ زرعی اراضی کے مالک کاشتکار',
      'گزشتہ 5 سال کے دوران کسی بھی سرکاری ٹریکٹر سکیم کا فائدہ نہ اٹھایا ہو',
      'امیدوار کے پاس نادرا کا ویریفائیڈ بائیو میٹرک شناختی کارڈ ہو'
    ],
    documentsEn: [
      'CNIC copy (applicant)',
      'Verified land ownership deed (Fard) from PLRA Arazi Center',
      'Affidavit on stamp paper declaring no tractor subsidy received in past 5 years',
      'Bank deposit receipt for application processing fee'
    ],
    documentsUr: [
      'امیدوار کے قومی شناختی کارڈ کی کاپی',
      'اراضی ریکارڈ سینٹر سے مصدقہ فرد ملکیت',
      'اشٹام پیپر پر حلف نامہ کہ گزشتہ 5 سال میں کوئی ٹریکٹر سبسیڈی نہیں لی',
      'بینک فیس کی ڈپازٹ رسید'
    ],
    howToApplyEn: 'Apply online through the Punjab Agriculture official portal (agripunjab.gov.pk) or through Kissan Portal when applications open.',
    howToApplyUr: 'محکمہ زراعت پنجاب کے آفیشل پورٹل پر آن لائن درخواست جمع کروائیں۔',
    stepsEn: [
      'Step 1: Register your CNIC on the official Punjab Agri portal (agripunjab.gov.pk).',
      'Step 2: Upload Fard Malkiat and select your desired tractor model and manufacturer.',
      'Step 3: Monitor computerized live balloting results published on the portal.',
      'Step 4: Successful applicants deposit the remaining balance at the designated bank and collect delivery letter.'
    ],
    stepsUr: [
      'مرحلہ 1: محکمہ زراعت پنجاب کے پورٹل (agripunjab.gov.pk) پر اپنا شناختی کارڈ درج کریں۔',
      'مرحلہ 2: فرد ملکیت اپلوڈ کریں اور اپنی پسند کا ٹریکٹر ماڈل اور کمپنی منتخب کریں۔',
      'مرحلہ 3: آن لائن قرعہ اندازی کے نتائج کا انتظار کریں جو لائیو شائع کیے جاتے ہیں۔',
      'مرحلہ 4: کامیاب کاشتکار بقیہ رقم بینک میں جمع کروا کر ڈلیوری لیٹر وصول کریں۔'
    ],
    helpline: '0800-17000',
    officialSite: 'https://agripunjab.gov.pk',
    category: 'equipment'
  },
  {
    id: 'sindh-hari-card',
    titleEn: 'Sindh Hari Welfare Card & Subsidy Package',
    titleUr: 'سندھ ہاری کارڈ و زرعی ریلیف پیکیج',
    badgeEn: 'Provincial Grant',
    badgeUr: 'صوبائی گرانٹ',
    authorityEn: 'Govt. of Sindh Agriculture Department / Sindh Bank',
    authorityUr: 'محکمہ زراعت حکومت سندھ و سندھ بینک',
    summaryEn: 'Direct relief package for Haris and peasant farmers in Sindh, providing targeted seed and fertilizer compensation, emergency flood aid, and subsidized irrigation tubewells.',
    summaryUr: 'سندھ کے ہاریوں اور چھوٹے کسانوں کے لیے خصوصی ریلیف پیکیج جس کے تحت تصدیق شدہ کسانوں کو بیج، کھاد، زرعی مشینری اور سولر ٹیوب ویل پر رعایت فراہم کی جاتی ہے۔',
    benefitsEn: [
      'Direct cash transfer for certified wheat and cotton seeds',
      'Subsidy vouchers for DAP and Urea purchases at authorized Sindh depots',
      'Registration with Sindh Hari Social Security registry',
      'Priority access to solar tubewell and laser leveler grants'
    ],
    benefitsUr: [
      'تصدیق شدہ بیج اور کھاد کی خریداری کے لیے براہ راست مالی امداد',
      'منظور شدہ سندھ ڈپوز سے سستی ڈی اے پی اور یوریا کے واؤچرز',
      'سندھ ہاری سوشل سیکیورٹی ڈیٹا بیس میں باضابطہ رجسٹریشن',
      'سولر ٹیوب ویل اور لیزر لیولر گرانٹ میں ترجیح'
    ],
    eligibilityEn: [
      'Peasant farmers (Haris) and small landholders (up to 16 acres) in Sindh',
      'Verification by local Tapedar / Mukhtiarkar and District Agri Committee',
      'Valid CNIC with permanent address located in Sindh'
    ],
    eligibilityUr: [
      'سندھ کے ہاری اور 16 ایکڑ تک زرعی زمین رکھنے والے چھوٹے کسان',
      'مقامی تپیدار / مختارکار اور ضلعی ایگری کمیٹی سے تصدیق',
      'سندھ کے پتے پر مشتمل نادرا شناختی کارڈ'
    ],
    documentsEn: [
      'Original CNIC and photocopies',
      'Form VII / Deh revenue ownership register copy or Hari tenancy agreement',
      'Passport size photographs (3 copies)',
      'Union Council residence certificate'
    ],
    documentsUr: [
      'اصل شناختی کارڈ اور نقول',
      'فارم VII (ریونیو ریکارڈ) یا ہاری معاہدہ نامہ',
      'تین عدد پاسپورٹ سائز تصاویر',
      'یونین کونسل کا رہائشی سرٹیفکیٹ'
    ],
    howToApplyEn: 'Visit your local Taluka Mukhtiarkar office or District Deputy Director Agriculture Extension Sindh.',
    howToApplyUr: 'اپنے قریبی تعلقہ مختارکار دفتر یا ڈسٹرکٹ ڈپٹی ڈائریکٹر زراعت توسیع سندھ کے دفتر سے رجوع کریں۔',
    stepsEn: [
      'Step 1: Collect Hari registration form from the Taluka Agriculture Office.',
      'Step 2: Obtain attestation from Tapedar regarding acreage under cultivation.',
      'Step 3: Submit documents to the Sindh Bank biometric enrollment desk.',
      'Step 4: Receive Hari Card for electronic subsidy disbursements.'
    ],
    stepsUr: [
      'مرحلہ 1: تعلقہ زراعت دفتر سے ہاری رجسٹریشن فارم حاصل کریں۔',
      'مرحلہ 2: زیر کاشت رقبے کے بارے میں مقامی تپیدار سے تصدیق کروائیں۔',
      'مرحلہ 3: سندھ بینک کے بائیو میٹرک ڈیسک پر کوائف جمع کروائیں۔',
      'مرحلہ 4: ہاری کارڈ وصول کریں اور سبسڈی براہ راست اکاؤنٹ میں حاصل کریں۔'
    ],
    helpline: '022-9200624',
    officialSite: 'https://sindh.gov.pk',
    category: 'subsidy'
  },
  {
    id: 'ztbl-production-loans',
    titleEn: 'ZTBL Seasonal Crop & Development Loans',
    titleUr: 'زرعی ترقیاتی بینک (ZTBL) زرعی و ترقیاتی قرضہ جات',
    badgeEn: 'Agricultural Finance',
    badgeUr: 'زرعی فنانسنگ',
    authorityEn: 'Zarai Taraqiati Bank Limited (ZTBL)',
    authorityUr: 'زرعی ترقیاتی بینک لمیٹڈ',
    summaryEn: 'Comprehensive credit facilities covering crop inputs (seeds, fertilizer, sprays), tubewell solarization, tractor financing, and dairy/livestock farm expansion with flexible mark-up rates.',
    summaryUr: 'فصلوں کے اخراجات (بیج، کھاد، سپرے)، ٹیوب ویل سولرائزیشن، ٹریکٹر کی خریداری اور ڈیری فارم کے لیے لچکدار مارک اپ پر وسیع زرعی قرضہ جات۔',
    benefitsEn: [
      'Seasonal production loans repayable after crop harvest',
      'Up to 80% financing on new tractors with up to 5-year tenure',
      'Special discounted mark-up schemes for female farmers and youth',
      'Wide network of 500+ rural branches across Pakistan'
    ],
    benefitsUr: [
      'سیزنل پروڈکشن قرضہ جات جن کی واپسی فصل کی کٹائی کے بعد کی جاتی ہے',
      'نئے ٹریکٹر کی خریداری پر 80 فیصد تک فنانسنگ، 5 سالہ آسان اقساط',
      'خواتین کسانوں اور نوجوانوں کے لیے خصوصی رعایتی مارک اپ کی سہولت',
      'پورے پاکستان میں 500 سے زائد دیہی برانچوں کا نیٹ ورک'
    ],
    eligibilityEn: [
      'Pakistani national farmer owning or leasing cultivable land',
      'Clear e-CIB report from State Bank of Pakistan',
      'Valid farming track record verified by ZTBL Mobile Credit Officer (MCO)'
    ],
    eligibilityUr: [
      'پاکستانی شہری جو زرعی زمین کا مالک یا قانونی پٹہ دار ہو',
      'سٹیٹ بینک کی ای سی آئی بی (e-CIB) رپورٹ میں کلیئر ہو',
      'بینک کے موبائل کریڈٹ آفیسر (MCO) سے فیلڈ ویریفکیشن'
    ],
    documentsEn: [
      'CNIC copies of applicant and two guarantors',
      'Passbook / Fard Malkiat from Revenue Department',
      'Recent utilities bills (electricity / tubewell)',
      'Four passport size photos and proof of cultivation'
    ],
    documentsUr: [
      'درخواست گزار اور 2 ضامنوں کے قومی شناختی کارڈ کی کاپیاں',
      'محکمہ مال کی جاری کردہ زرعی پاس بک یا فرد ملکیت',
      'حالیہ یوٹیلیٹی بل (بجلی / ٹیوب ویل)',
      'چار عدد پاسپورٹ سائز تصاویر اور کاشتکاری کا ثبوت'
    ],
    howToApplyEn: 'Visit your nearest ZTBL branch and meet the Mobile Credit Officer (MCO) for farm inspection.',
    howToApplyUr: 'اپنے قریبی زرعی ترقیاتی بینک (ZTBL) کی برانچ جائیں اور فیلڈ معائنے کے لیے موبائل کریڈٹ آفیسر سے ملیں۔',
    stepsEn: [
      'Step 1: Contact your designated area ZTBL Mobile Credit Officer (MCO).',
      'Step 2: Submit land Passbook and fill loan application form.',
      'Step 3: MCO visits your farmland for physical verification of crops and area.',
      'Step 4: Branch issues loan sanction and disburses funds directly to your account.'
    ],
    stepsUr: [
      'مرحلہ 1: اپنے علاقے کے نامزد ZTBL موبائل کریڈٹ آفیسر (MCO) سے رابطہ کریں۔',
      'مرحلہ 2: زرعی پاس بک اور ضروری دستاویزات جمع کروا کر فارم پر کریں۔',
      'مرحلہ 3: فیلڈ آفیسر آپ کے فارم کا دورہ کر کے رقبہ اور فصل کی تصدیق کرے گا۔',
      'مرحلہ 4: بینک کی منظوری کے بعد قرضہ براہ راست آپ کے اکاؤنٹ میں منتقل کر دیا جائے گا۔'
    ],
    helpline: '051-111-30-30-30',
    officialSite: 'https://ztbl.com.pk',
    category: 'credit'
  },
  {
    id: 'solar-tubewell-subsidy',
    titleEn: 'National Solar Tubewell Conversion Subsidy',
    titleUr: 'قومی سولر ٹیوب ویل کنورژن سبسیڈی سکیم',
    badgeEn: 'Energy Transition',
    badgeUr: 'توانائی رعایت',
    authorityEn: 'Ministry of National Food Security & Provincial Departments',
    authorityUr: 'وزارت نیشنل فوڈ سیکیورٹی و صوبائی محکمہ جات',
    summaryEn: 'Massive government cost-sharing model covering up to 80% of the capital cost to convert diesel and electricity tubewells to high-efficiency solar power systems.',
    summaryUr: 'ڈیزل اور بجلی سے چلنے والے زرعی ٹیوب ویلوں کو سولر پر منتقل کرنے کے لیے حکومت کی جانب سے 80 فیصد تک لاگت برداشت کرنے کا منصوبہ۔',
    benefitsEn: [
      '80% cost borne by government, farmer pays only 20% equity',
      'Saves PKR 150,000 to PKR 350,000 per month in expensive diesel and electricity bills',
      'Standardized Tier-1 solar panels with 10-year replacement warranty',
      'Guaranteed irrigation during critical daylight hours without loadshedding'
    ],
    benefitsUr: [
      '80 فیصد لاگت حکومت برداشت کرے گی، کسان صرف 20 فیصد رقم ادا کرے گا',
      'ماہانہ ڈیڑھ سے ساڑھے تین لاکھ روپے کے بھاری ڈیزل اور بجلی بلوں کی مستقل بچت',
      'معیاری ٹائر 1 سولر پینلز بمعہ 10 سالہ ریپلیسمنٹ وارنٹی',
      'لوڈشیڈنگ کے بغیر دن کی روشنی میں مفت اور مسلسل پانی کی فراہمی'
    ],
    eligibilityEn: [
      'Farmers possessing an existing functional tubewell with tested sweet water',
      'Minimum command area of 5 acres',
      'Water table depth suitable for solar submersible installation'
    ],
    eligibilityUr: [
      'وہ کسان جن کے پاس پہلے سے میٹھے پانی کا فعال ٹیوب ویل موجود ہو',
      'کم از کم 5 ایکڑ زیر کاشت کمانڈ رقبہ',
      'زیر زمین پانی کی سطح سولر موٹر کے لیے موزوں ہو'
    ],
    documentsEn: [
      'CNIC copy of applicant',
      'Land revenue document verifying command area',
      'Water testing laboratory report for salinity/sodicity',
      'Previous electricity bill (for electric tubewell conversion)'
    ],
    documentsUr: [
      'درخواست گزار کے شناختی کارڈ کی کاپی',
      'زیر کاشت رقبے کی تصدیقی فرد یا گرداوری',
      'پانی کی لیبارٹری ٹیسٹ رپورٹ (میٹھا پانی)',
      'سابقہ بجلی بل کی کاپی (اگر بجلی ٹیوب ویل تبدیل کرنا ہو)'
    ],
    howToApplyEn: 'Submit expression of interest at On-Farm Water Management (OFWM) or District Agriculture Directorate.',
    howToApplyUr: 'آن فارم واٹر مینجمنٹ (OFWM) کے ضلعی دفتر میں درخواست جمع کروائیں۔',
    stepsEn: [
      'Step 1: Obtain the Solar Tubewell Application Form from OFWM office.',
      'Step 2: Water Management engineers survey water depth and land feasibility.',
      'Step 3: Pay farmer share (20%) into the designated State Bank account.',
      'Step 4: Certified engineering firm installs panels, inverter, and pumping unit on site.'
    ],
    stepsUr: [
      'مرحلہ 1: آن فارم واٹر مینجمنٹ کے ضلعی دفتر سے درخواست فارم حاصل کریں۔',
      'مرحلہ 2: محکمہ کے انجینئرز پانی کے لیول اور رقبے کا فیلڈ سروے کریں گے۔',
      'مرحلہ 3: کسان کے حصے کی 20 فیصد رقم مجاز بینک اکاؤنٹ میں جمع کروائیں۔',
      'مرحلہ 4: منظور شدہ سولر فرم آپ کے فارم پر پینلز، انورٹر اور موٹر انسٹال کرے گی۔'
    ],
    helpline: '042-99200732',
    officialSite: 'https://ofwm.agripunjab.gov.pk',
    category: 'equipment'
  },
  {
    id: 'crop-insurance-takaful',
    titleEn: 'Crop Loan Insurance & Takaful Scheme',
    titleUr: 'حکومتی کراپ انشورنس و زرعی تکافل سکیم',
    badgeEn: 'Disaster Protection',
    badgeUr: 'فصل تحفظ',
    authorityEn: 'State Bank of Pakistan / National Insurance Company (NICL)',
    authorityUr: 'اسٹیٹ بینک آف پاکستان و نیشنل انشورنس کمپنی',
    summaryEn: 'Government-subsidized crop damage insurance for borrowing farmers against natural calamities including floods, excessive rains, drought, and locust attacks.',
    summaryUr: 'قدرتی آفات، طوفانی بارش، سیلاب، قحط اور ٹڈی دل کے حملے سے فصلوں کو پہنچنے والے نقصان سے تحفظ کے لیے حکومت کی جانب سے 100 فیصد پریمیئم ادائیگی۔',
    benefitsEn: [
      '100% premium subsidy paid by government for small farmers up to 12.5 acres',
      'Covers major crops: Wheat, Rice, Cotton, Sugarcane, and Maize',
      'Automatic compensation payout against declared catastrophic disaster areas',
      'Prevents farmers from falling into perpetual debt traps after natural shocks'
    ],
    benefitsUr: [
      '12.5 ایکڑ تک کے چھوٹے کسانوں کے لیے انشورنس پریمیئم کی 100 فیصد رقم حکومت ادا کرے گی',
      'گندم، چاول، کپاس، کماد اور مکئی کی فصلوں کا مکمل تحفظ',
      'آفت زدہ قرار دیے گئے علاقوں میں کسانوں کو فوری مالی معاوضہ',
      'سیلاب یا خشک سالی کے بعد کسان کو دیوالیہ ہونے سے بچانے کا محفوظ راستہ'
    ],
    eligibilityEn: [
      'All farmers obtaining agricultural production loans from commercial or microfinance banks',
      'Farmers cultivating designated major crops in recognized canal/rain-fed zones'
    ],
    eligibilityUr: [
      'وہ تمام کاشتکار جو کسی بھی بینک سے سیزنل زرعی قرضہ حاصل کر رہے ہیں',
      'منظور شدہ اضلاع میں گندم، کپاس، چاول یا کماد کاشت کرنے والے کسان'
    ],
    documentsEn: [
      'Standard bank loan application form',
      'CNIC copy',
      'Crop sowing declaration and revenue settlement paper'
    ],
    documentsUr: [
      'بینک قرضہ درخواست فارم',
      'شناختی کارڈ کی کاپی',
      'فصل کی بوائی کا تصدیقی ڈیکلریشن'
    ],
    howToApplyEn: 'Crop insurance is bundled automatically when you apply for seasonal farm credit at any authorized Pakistani bank.',
    howToApplyUr: 'کسی بھی مجاز بینک سے زرعی قرضہ لیتے وقت کراپ تکافل فارم پر دستخط کر کے خودکار طور پر شامل ہو جائیں۔',
    stepsEn: [
      'Step 1: Apply for crop financing at your bank.',
      'Step 2: Sign the State Bank Crop Loan Insurance declaration clause.',
      'Step 3: In case of disaster, Revenue Department notifies the loss assessment.',
      'Step 4: Insurance claim is settled directly against your outstanding loan balance.'
    ],
    stepsUr: [
      'مرحلہ 1: اپنے متعلقہ بینک میں فصل کے قرضے کی درخواست جمع کروائیں۔',
      'مرحلہ 2: اسٹیٹ بینک کے کراپ لون انشورنس کے خانے کو منتخب کریں۔',
      'مرحلہ 3: آفت کی صورت میں محکمہ مال کی رپورٹ کے مطابق نقصان کا تعین کیا جاتا ہے۔',
      'مرحلہ 4: انشورنس کمپنی کلیم کی رقم براہ راست بینک کو ادا کر کے آپ کا قرضہ معاف کر دیتی ہے۔'
    ],
    helpline: '111-727-111',
    officialSite: 'https://sbp.org.pk',
    category: 'insurance'
  }
];
