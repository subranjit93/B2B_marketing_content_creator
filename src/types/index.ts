export type BrandType = 'Peavey';

export interface ProductSpec {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

export interface AudioProduct {
  id: string;
  brand: BrandType;
  model: string;
  category: 'Power Amplifiers' | 'Line Arrays & Speakers' | 'Digital Mixers' | 'Architectural Audio';
  shortTagline: string;
  keySpecs: ProductSpec[];
  targetApplications: string[];
  stockStatus: 'In Stock' | 'Available for Project' | 'Arriving Soon' | string;
  mrp: number; // In INR
  siB2BPrice: number; // Net SI B2B price in INR
  warrantyYears: number;
  imagePath: string;
  factoryImagePath?: string; // Canonical factory asset for one-click restore
  distributorNote?: string;
  featuredDayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
}

export type PosterAspectRatio = '9:16' | '1:1';

export type PosterTheme = 'electric-blue' | 'yellow-volt' | 'deep-navy';

export interface PosterConfig {
  aspectRatio: PosterAspectRatio;
  theme: PosterTheme;
  showPrice: boolean;
  priceType: 'si-net' | 'mrp-and-net' | 'quote-on-request';
  customBadge: string;
  customHeadline: string;
  contactPerson: string;
  contactNumber: string;
  contactEmail: string;
  cityLocation: string;
  partnerInfo: string;
  customOfferText: string;
  highlightApplications: boolean;
  distributorLogo?: string;
  distributorCompanyName?: string;
  showBrandLogoPlaceholder?: boolean;
}

export interface SIPitchResponse {
  headline: string;
  whatsappBody: string;
  siKeyBenefits: string[];
}
