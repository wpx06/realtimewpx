export interface VisitData {
  id: string;
  timestamp: string;
  subsource: string;
  ip: string;
  country: string;
  user_agent: string;
  referer: string;
}

export interface ConversionData {
  id: string;
  time: string;
  subid: string;
  payout: string;
  country: string;
}

export interface StatsSummary {
  totalClicks: number;
  totalUnique: number;
  totalConversions: number;
  totalEarning: number;
}

export interface StatsData {
  subid: string;
  clicks: number;
  unique: number;
  conversions: number;
  earnings: number;
}

export interface TeamPerformance {
  rank: number;
  subid: string;
  clicks: number;
  unique: number;
  conversions: number;
  earnings: number;
  countries?: CountryBreakdown[];
}

export interface CountryBreakdown {
  country: string;
  clicks: number;
  unique: number;
  conversions: number;
  earnings: number;
}

export interface DateFilter {
  startDate: string;
  endDate: string;
  preset: string;
}
