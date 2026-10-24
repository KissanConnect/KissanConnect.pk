export type UserRole = 'farmer' | 'wholesaler' | 'admin';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  province: string;
  city: string;
  businessName?: string;
  bio?: string;
  createdAt: string;
  photoURL?: string;
}

export interface FertilizerPrice {
  id: string;
  name: string;
  nameUrdu: string;
  brand: string;
  brandUrdu: string;
  type: 'Urea' | 'DAP' | 'CAN' | 'NP' | 'SSP' | 'Potash' | 'Nitrophos';
  bagWeightKg: number;
  currentPrice: number;
  previousPrice: number;
  lastUpdated: string;
  notes?: string;
}

export interface Tractor {
  id: string;
  name: string;
  brand: string;
  model: string;
  horsepower: number;
  engine: string;
  cylinders: number;
  fuelTankLitres: number;
  transmission: string;
  liftingCapacityKg: number;
  pricePKR: number;
  image: string;
  bestFor: string;
  bestForUrdu: string;
  isPopular?: boolean;
}

export interface CropGuide {
  id: string;
  nameEn: string;
  nameUr: string;
  season: 'Rabi' | 'Kharif' | 'Zaid';
  category: 'Grains' | 'Cash Crops' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Oilseeds';
  image: string;
  sowingWindow: {
    punjab: string;
    sindh: string;
    kpk: string;
    balochistan: string;
  };
  temperature: string;
  soilType: string;
  phRange: string;
  waterRequirement: string;
  laborInput: string;
  seedRatePerAcre: string;
  landPreparation: string[];
  fertilizerSchedule: { stage: string; fertilizer: string; notes: string }[];
  commonPests: string[];
  commonMistakes: string[];
  stepByStepTips: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  titleUrdu: string;
  date: string;
  type: 'sowing' | 'irrigation' | 'fertilizer' | 'spray' | 'harvest';
  completed: boolean;
  notes?: string;
}

export interface CropPlan {
  id: string;
  userId: string;
  cropId: string;
  cropName: string;
  cropNameUrdu: string;
  province: string;
  city: string;
  landArea: number;
  areaUnit: 'acre' | 'kanal' | 'marla' | 'hectare';
  soilType: 'loamy' | 'sandy' | 'clay';
  irrigationSource: 'canal' | 'tubewell' | 'rain-fed';
  sowingDate: string;
  estimatedSeedQty: string;
  estimatedFertilizer: string;
  events: CalendarEvent[];
  createdAt: string;
}

export type ListingCategory = 
  | 'Crops/Produce' 
  | 'Seeds' 
  | 'Fertilizers' 
  | 'Pesticides' 
  | 'Tractors' 
  | 'Farm Machinery' 
  | 'Equipment/Tools' 
  | 'Livestock' 
  | 'Land/Rent' 
  | 'Buy Requests';

export interface Listing {
  id: string;
  userId: string;
  sellerName: string;
  sellerRole: UserRole;
  sellerPhone: string;
  sellerCity: string;
  sellerProvince: string;
  title: string;
  category: ListingCategory;
  price: number;
  isNegotiable: boolean;
  quantity?: string;
  condition: 'new' | 'used';
  description: string;
  images: string[];
  isVerifiedPhone: boolean;
  isSold: boolean;
  viewsCount: number;
  inquiriesCount: number;
  createdAt: string;
}

export interface ProduceRecord {
  id: string;
  userId: string;
  crop: string;
  season: string;
  landArea: string;
  date: string;
  quantity: number;
  unit: 'maund' | 'kg' | 'ton';
  quality: 'A (Top)' | 'B (Medium)' | 'C (Fair)';
  storageLocation: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'labor' | 'diesel' | 'electricity' | 'tractor rent' | 'water charges' | 'transport' | 'other';
  amount: number;
  date: string;
  crop: string;
  notes?: string;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  crop: string;
  quantitySold: number;
  unit: 'maund' | 'kg' | 'ton';
  ratePerUnit: number;
  totalAmount: number;
  buyer: string;
  date: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  listingId?: string;
  listingTitle?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  listingId?: string;
  listingTitle?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: Record<string, number>;
}

export interface ReportedListing {
  id: string;
  listingId: string;
  listingTitle: string;
  reportedBy: string;
  reason: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ReviewRatings {
  honesty: number; // 1 to 5
  paymentSpeed: number; // 1 to 5
  behavior: number; // 1 to 5
  overall: number; // average
}

export interface WholesalerReview {
  id: string;
  wholesalerUid: string;
  wholesalerName?: string;
  farmerUid: string;
  farmerName: string;
  farmerCity?: string;
  farmerPhone?: string;
  ratings: ReviewRatings;
  comment: string;
  dealType?: 'wheat' | 'rice' | 'cotton' | 'fertilizer' | 'machinery' | 'other' | string;
  createdAt: string;
  wholesalerReply?: {
    text: string;
    repliedAt: string;
  };
  hidden?: boolean;
}

export interface ReportedReview {
  id: string;
  reviewId: string;
  wholesalerUid: string;
  wholesalerName?: string;
  farmerUid: string;
  farmerName: string;
  reviewComment: string;
  reportedBy: string;
  reason: string;
  details?: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}
