import React from 'react';
import { VisitData, ConversionData, StatsSummary, StatsData, TeamPerformance } from '@/types';

// Mock data generators
const countries = [
  { code: 'US', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
];

const osTypes = ['Windows', 'MacOS', 'Android', 'iOS', 'Linux'];
const referrerTypes = ['Facebook', 'Instagram', 'Threads', 'X', 'Direct'];
const sub_source = ['sub001', 'sub002', 'sub003', 'sub004', 'sub005', 'sub006', 'sub007', 'sub008'];

// Storage for live data (max 10 items each)
let liveClicks: VisitData[] = [];
let liveConversions: ConversionData[] = [];

const generateRandomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const generateRandomVisit = (): VisitData => {
  const country = countries[Math.floor(Math.random() * countries.length)];
  const os = osTypes[Math.floor(Math.random() * osTypes.length)];
  const referrer = referrerTypes[Math.floor(Math.random() * referrerTypes.length)];
  const sub_source = sub_source[Math.floor(Math.random() * sub_source.length)];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    subsource: sub_source,
    ip: generateRandomIP(),
    country: country.code,
    user_agent: os,
    referer: referrer,
  };
};

const generateRandomConversion = (): ConversionData => {
  const country = countries[Math.floor(Math.random() * countries.length)];
  const sub_source = sub_source[Math.floor(Math.random() * sub_source.length)];
  const payout = (Math.random() * 10 + 0.5).toFixed(2);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    time: new Date().toISOString(),
    sub_source: sub_source,
    payout: payout,
    country: country.code,
  };
};

// Simulate real-time data generation
setInterval(() => {
  // Add new click (30% chance every 2 seconds)
  if (Math.random() < 0.3) {
    const newVisit = generateRandomVisit();
    liveClicks.unshift(newVisit);
    if (liveClicks.length > 10) {
      liveClicks = liveClicks.slice(0, 10);
    }
  }
  
  // Add new conversion (10% chance every 2 seconds)
  if (Math.random() < 0.1) {
    const newConversion = generateRandomConversion();
    liveConversions.unshift(newConversion);
    if (liveConversions.length > 10) {
      liveConversions = liveConversions.slice(0, 10);
    }
  }
}, 2000);

// Initialize with some sample data
for (let i = 0; i < 5; i++) {
  liveClicks.push(generateRandomVisit());
  if (i < 3) {
    liveConversions.push(generateRandomConversion());
  }
}

export const realtimeApi = {
  getLiveClicks: async (): Promise<VisitData[]> => {
    try {
      const response = await fetch('https://re.newbiee.my.id/api/visits_json.php');
      if (!response.ok) {
        throw new Error('Failed to fetch live clicks');
      }
      const data = await response.json();
      return data.slice(0, 10).map((item: any) => ({
        id: item.id,
        timestamp: item.timestamp,
        subsource: item.subsource,
        ip: item.ip,
        country: item.country,
        user_agent: item.user_agent,
        referer: item.referer,
      }));
    } catch (error) {
      console.error('Error fetching live clicks from external API:', error);
      return [];
    }
  },

  getLiveConversions: async (): Promise<ConversionData[]> => {
    try {
      const response = await fetch('https://re.newbiee.my.id/api/get_conversions.php');
      if (!response.ok) {
        throw new Error('Failed to fetch live conversions');
      }
      const data = await response.json();
      return data.slice(0, 10).map((item: any) => ({
        id: item.id,
        time: item.time,
        subid: item.subid,
        payout: item.payout,
        country: item.country
      }));
    } catch (error) {
      console.error('Error fetching live conversions from external API:', error);
      return [];
    }
  },

  getStatsSummary: (): Promise<StatsSummary> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalClicks: 45280,
          totalUnique: 32150,
          totalConversions: 1420,
          totalEarning: 8950.50,
        });
      }, 500);
    });
  },

  getStatsData: (startDate: string, endDate: string): Promise<StatsData[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData: StatsData[] = subIds.map(subid => ({
          subid,
          clicks: Math.floor(Math.random() * 1000) + 100,
          unique: Math.floor(Math.random() * 800) + 80,
          conversions: Math.floor(Math.random() * 50) + 5,
          earnings: parseFloat((Math.random() * 500 + 50).toFixed(2)),
        }));
        resolve(mockData);
      }, 800);
    });
  },

  getTeamPerformance: (): Promise<TeamPerformance[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockData: TeamPerformance[] = subIds.map((subid, index) => ({
          rank: index + 1,
          subid,
          clicks: Math.floor(Math.random() * 2000) + 500,
          unique: Math.floor(Math.random() * 1500) + 400,
          conversions: Math.floor(Math.random() * 100) + 20,
          earnings: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
          countries: [
            {
              country: 'GB',
              clicks: Math.floor(Math.random() * 800) + 200,
              unique: Math.floor(Math.random() * 800) + 200,
              conversions: Math.floor(Math.random() * 40) + 8,
              earnings: parseFloat((Math.random() * 400 + 80).toFixed(2)),
            },
            {
              country: 'AU',
              clicks: Math.floor(Math.random() * 600) + 150,
              unique: Math.floor(Math.random() * 600) + 150,
              conversions: Math.floor(Math.random() * 30) + 6,
              earnings: parseFloat((Math.random() * 300 + 60).toFixed(2)),
            },
            {
              country: 'US',
              clicks: Math.floor(Math.random() * 400) + 100,
              unique: Math.floor(Math.random() * 400) + 100,
              conversions: Math.floor(Math.random() * 20) + 4,
              earnings: parseFloat((Math.random() * 200 + 40).toFixed(2)),
            },
            {
              country: 'DE',
              clicks: Math.floor(Math.random() * 200) + 50,
              unique: Math.floor(Math.random() * 200) + 50,
              conversions: Math.floor(Math.random() * 10) + 2,
              earnings: parseFloat((Math.random() * 100 + 20).toFixed(2)),
            },
          ],
        })).sort((a, b) => b.conversions - a.conversions);
        
        // Add rank based on sorted data
        mockData.forEach((item, index) => {
          item.rank = index + 1;
        });
        
        resolve(mockData);
      }, 600);
    });
  },

  getCountryFlag: (countryCode: string): string => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.flag : '🌍';
  },

  getOSIcon: (useragent: string): string => {
    if (!useragent) return '/images/window.svg';
    const ua = useragent.toLowerCase();
    if (ua.includes('android')) return '/images/android.svg';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios') || ua.includes('apple')) return '/images/apple.svg';
    if (ua.includes('mac')) return '/images/mac.svg';
    if (ua.includes('win')) return '/images/window.svg';
    if (ua.includes('linux')) return '/images/window.svg'; // fallback, bisa diganti jika ada icon linux
    return '/images/window.svg';
  },

  getReferrerIcon: (referrer: string): string => {
    if (!referrer) return '/images/socials/browser.svg';
    const ref = referrer.toLowerCase();
    if (ref.includes('facebook.com')) return '/images/socials/facebook.svg';
    if (ref.includes('instagram.com')) return '/images/socials/instagram.svg';
    if (ref.includes('threads.net')) return '/images/socials/threads.svg';
    if (ref.includes('twitter.com') || ref.includes('x.com')) return '/images/socials/x.svg';
    if (ref === '' || ref === '-' || ref === 'direct') return '/images/socials/direct.svg';
    return '/images/socials/browser.svg';
  },
};
