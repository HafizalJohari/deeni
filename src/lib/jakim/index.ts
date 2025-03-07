import { supabase } from '@/lib/supabase/client';

export type JakimZone = {
  negeri: string;
  daerah: string;
  code: string;
  latitude?: number;
  longitude?: number;
};

// Add coordinates for major zones
const zoneCoordinates: Record<string, { lat: number; lng: number }> = {
  // Wilayah Persekutuan
  'WLY01': { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
  'WLY02': { lat: 5.2831, lng: 115.2308 }, // Labuan

  // Selangor
  'SGR01': { lat: 3.0833, lng: 101.5333 }, // Petaling
  'SGR02': { lat: 3.2333, lng: 101.7500 }, // Gombak
  'SGR03': { lat: 3.0440, lng: 101.4480 }, // Klang
  'SGR04': { lat: 3.3500, lng: 101.2500 }, // Kuala Selangor
  'SGR05': { lat: 3.7986, lng: 101.5322 }, // Hulu Selangor
  'SGR06': { lat: 3.0698, lng: 101.7937 }, // Hulu Langat
  'SGR07': { lat: 2.6889, lng: 101.7417 }, // Sepang
  'SGR08': { lat: 3.6667, lng: 101.1167 }, // Sabak Bernam
  'SGR09': { lat: 2.8259, lng: 101.7952 }, // Kuala Langat

  // Johor
  'JHR01': { lat: 1.4853, lng: 103.7618 }, // Pulau Johor
  'JHR02': { lat: 1.8500, lng: 103.7500 }, // Kota Tinggi
  'JHR03': { lat: 2.0361, lng: 102.5705 }, // Muar
  'JHR04': { lat: 1.7361, lng: 103.9194 }, // Kluang

  // Kedah
  'KDH01': { lat: 6.1167, lng: 100.3667 }, // Kota Setar
  'KDH02': { lat: 5.6500, lng: 100.4833 }, // Kuala Muda
  'KDH03': { lat: 6.4414, lng: 100.1986 }, // Kubang Pasu
  'KDH04': { lat: 5.7667, lng: 100.7333 }, // Baling
  'KDH05': { lat: 5.3667, lng: 100.5667 }, // Kulim

  // Kelantan
  'KTN01': { lat: 6.1333, lng: 102.2500 }, // Kota Bharu
  'KTN02': { lat: 5.8167, lng: 102.1500 }, // Pasir Mas
  'KTN03': { lat: 4.7500, lng: 101.9667 }, // Gua Musang

  // Melaka
  'MLK01': { lat: 2.1889, lng: 102.2511 }, // Melaka Tengah
  'MLK02': { lat: 2.4000, lng: 102.2333 }, // Alor Gajah
  'MLK03': { lat: 2.3667, lng: 102.4167 }, // Jasin

  // Negeri Sembilan
  'NGS01': { lat: 2.7167, lng: 101.9333 }, // Seremban
  'NGS02': { lat: 2.5167, lng: 102.0333 }, // Port Dickson
  'NGS03': { lat: 2.8833, lng: 102.2667 }, // Jempol

  // Pahang
  'PHG01': { lat: 3.8077, lng: 103.3260 }, // Kuantan
  'PHG02': { lat: 4.2167, lng: 101.9333 }, // Raub
  'PHG03': { lat: 3.9333, lng: 102.6000 }, // Maran
  'PHG04': { lat: 3.5167, lng: 101.9167 }, // Bentong
  'PHG05': { lat: 3.7500, lng: 102.4167 }, // Temerloh
  'PHG06': { lat: 4.4500, lng: 103.4167 }, // Rompin

  // Perlis
  'PLS01': { lat: 6.4333, lng: 100.1833 }, // Kangar

  // Pulau Pinang
  'PNG01': { lat: 5.4145, lng: 100.3294 }, // Georgetown
  'PNG02': { lat: 5.3500, lng: 100.4667 }, // Butterworth

  // Perak
  'PRK01': { lat: 4.5841, lng: 101.0829 }, // Ipoh
  'PRK02': { lat: 4.8500, lng: 100.7333 }, // Taiping
  'PRK03': { lat: 4.2167, lng: 100.7000 }, // Tanjung Malim
  'PRK04': { lat: 4.5833, lng: 101.4167 }, // Cameron Highlands
  'PRK05': { lat: 3.7833, lng: 101.0167 }, // Teluk Intan
  'PRK06': { lat: 5.1333, lng: 100.6167 }, // Parit Buntar
  'PRK07': { lat: 4.0167, lng: 101.2500 }, // Slim River

  // Terengganu
  'TRG01': { lat: 5.3302, lng: 103.1408 }, // Kuala Terengganu
  'TRG02': { lat: 4.7167, lng: 103.4167 }, // Dungun
  'TRG03': { lat: 5.7167, lng: 102.5500 }, // Besut
  'TRG04': { lat: 4.2333, lng: 103.4167 }, // Kemaman

  // Sabah
  'SBH01': { lat: 5.9749, lng: 116.0724 }, // Kota Kinabalu
  'SBH02': { lat: 5.3333, lng: 116.1667 }, // Ranau
  'SBH03': { lat: 4.2500, lng: 117.8833 }, // Tawau
  'SBH04': { lat: 5.0167, lng: 118.3333 }, // Sandakan
  'SBH05': { lat: 4.6000, lng: 116.6667 }, // Keningau
  'SBH06': { lat: 6.8833, lng: 116.8500 }, // Kudat
  'SBH07': { lat: 4.4167, lng: 118.6000 }, // Lahad Datu
  'SBH08': { lat: 5.0333, lng: 115.5667 }, // Beaufort
  'SBH09': { lat: 4.9167, lng: 115.0833 }, // Sipitang

  // Sarawak
  'SWK01': { lat: 1.5500, lng: 110.3333 }, // Kuching
  'SWK02': { lat: 2.3167, lng: 111.8167 }, // Sibu
  'SWK03': { lat: 4.4000, lng: 113.9833 }, // Miri
  'SWK04': { lat: 2.9083, lng: 112.9100 }, // Bintulu
  'SWK05': { lat: 1.8667, lng: 109.7667 }, // Sri Aman
  'SWK06': { lat: 2.0167, lng: 111.6333 }, // Sarikei
  'SWK07': { lat: 3.2000, lng: 113.1167 }, // Mukah
  'SWK08': { lat: 2.1167, lng: 111.1333 }, // Betong
  'SWK09': { lat: 4.5833, lng: 115.4167 }  // Limbang
};

let jakimZonesCache: JakimZone[] = [];

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestZone(latitude: number, longitude: number): string {
  let nearestZone = 'WLY01'; // Default to Kuala Lumpur
  let shortestDistance = Infinity;

  Object.entries(zoneCoordinates).forEach(([code, coords]) => {
    const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestZone = code;
    }
  });

  return nearestZone;
}

export async function requestLocationPermission(): Promise<GeolocationPosition | null> {
  if (!('geolocation' in navigator)) {
    return null;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
    return position;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
}

export async function getJakimZones(): Promise<JakimZone[]> {
  // Return cached data if available
  if (jakimZonesCache.length > 0) {
    return jakimZonesCache;
  }

  try {
    const { data, error } = await supabase
      .from('jakim_zones')
      .select('negeri, daerah, code')
      .order('negeri', { ascending: true });

    if (error) {
      throw error;
    }

    // Add coordinates to zones
    const zonesWithCoordinates = data.map(zone => ({
      ...zone,
      ...(zoneCoordinates[zone.code] ? {
        latitude: zoneCoordinates[zone.code].lat,
        longitude: zoneCoordinates[zone.code].lng
      } : {})
    }));

    jakimZonesCache = zonesWithCoordinates;
    return zonesWithCoordinates;
  } catch (error) {
    console.error('Error fetching JAKIM zones:', error);
    // Fallback to default zones if there's an error
    return [
      { negeri: 'SELANGOR', daerah: 'PETALING', code: 'SGR01' },
      { negeri: 'SELANGOR', daerah: 'GOMBAK', code: 'SGR02' },
      { negeri: 'SELANGOR', daerah: 'KLANG', code: 'SGR03' },
      { negeri: 'SELANGOR', daerah: 'KUALA SELANGOR', code: 'SGR04' },
      { negeri: 'SELANGOR', daerah: 'HULU SELANGOR', code: 'SGR05' },
      { negeri: 'SELANGOR', daerah: 'HULU LANGAT', code: 'SGR06' },
      { negeri: 'SELANGOR', daerah: 'SEPANG', code: 'SGR07' },
      { negeri: 'SELANGOR', daerah: 'SABAK BERNAM', code: 'SGR08' },
      { negeri: 'KUALA LUMPUR', daerah: 'KUALA LUMPUR', code: 'WLY01' },
    ];
  }
}

export type PrayerTime = {
  name: string;
  time: string;
};

export type PrayerData = {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  source?: 'waktusolat-api' | 'e-solat-api';
};

// Zone code mapping between e-solat format and waktusolat.app format if needed
const zoneCodeMapping: Record<string, string> = {
  // Example mapping if needed in the future
  // 'WLY01': 'kuala-lumpur',
};

// Add an interface for the prayer time object in the waktusolat.app API response
interface WaktuSolatPrayer {
  day: number;
  hijri: string;
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

// Function to convert Unix timestamp to formatted time string (HH:MM)
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export async function fetchPrayerTimes(zoneCode: string): Promise<PrayerData | null> {
  try {
    // Print current datetime for debugging timestamp issues
    const now = new Date();
    console.log(`Current date/time: ${now.toISOString()}, local time: ${now.toLocaleString()}, day: ${now.getDate()}`);
    
    // Try the new API first
    try {
      console.log(`Calling waktusolat.app API for zone: ${zoneCode}`);
      
      // Format zone code for waktusolat.app API (lowercase or mapped)
      const mappedZoneCode = zoneCodeMapping[zoneCode] || zoneCode;
      const formattedZoneCode = mappedZoneCode.toLowerCase();
      
      console.log(`Using formatted zone code for waktusolat.app: ${formattedZoneCode}`);
      
      const apiUrl = `https://api.waktusolat.app/v2/solat/${formattedZoneCode}`;
      console.log(`Full API URL: ${apiUrl}`);
      
      const newApiResponse = await fetch(
        apiUrl,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      const status = newApiResponse.status;
      console.log(`waktusolat.app API status: ${status}`);
      
      if (newApiResponse.ok) {
        const data = await newApiResponse.json();
        console.log('waktusolat.app API raw response:', JSON.stringify(data));
        
        // Check if data has the expected format with prayers array
        if (data?.prayers && Array.isArray(data.prayers) && data.prayers.length > 0) {
          console.log('Found prayers array in the response');
          
          // Get today's date
          const today = new Date();
          const dayOfMonth = today.getDate();
          
          // Find today's prayer times in the array
          const todayPrayers = data.prayers.find((prayer: WaktuSolatPrayer) => prayer.day === dayOfMonth);
          
          if (todayPrayers) {
            console.log('Found prayer times for today:', todayPrayers);
            
            // Convert Unix timestamps to formatted time strings
            const result: PrayerData = {
              fajr: formatTimestamp(todayPrayers.fajr),
              dhuhr: formatTimestamp(todayPrayers.dhuhr),
              asr: formatTimestamp(todayPrayers.asr),
              maghrib: formatTimestamp(todayPrayers.maghrib),
              isha: formatTimestamp(todayPrayers.isha),
              source: 'waktusolat-api'
            };
            
            console.log('Mapped prayer times from waktusolat.app v2 format:', result);
            
            // Verify we have prayer times
            if (result.fajr && result.dhuhr && result.asr && result.maghrib && result.isha) {
              console.log('Successfully parsed waktusolat.app response:', result);
              return result;
            } else {
              console.log('Missing prayer times in mapped result:', result);
            }
          } else {
            console.log(`Could not find prayer times for day ${dayOfMonth} in response`);
            // Log all available days for debugging
            console.log('Available days in response:', data.prayers.map((p: WaktuSolatPrayer) => p.day).join(', '));
            
            // Try to use first available day as fallback
            if (data.prayers.length > 0) {
              console.log('Using first available day as fallback');
              const fallbackPrayers = data.prayers[0];
              
              // Convert Unix timestamps to formatted time strings
              const fallbackResult: PrayerData = {
                fajr: formatTimestamp(fallbackPrayers.fajr),
                dhuhr: formatTimestamp(fallbackPrayers.dhuhr),
                asr: formatTimestamp(fallbackPrayers.asr),
                maghrib: formatTimestamp(fallbackPrayers.maghrib),
                isha: formatTimestamp(fallbackPrayers.isha),
                source: 'waktusolat-api'
              };
              
              console.log('Mapped fallback prayer times:', fallbackResult);
              
              // Verify we have prayer times
              if (fallbackResult.fajr && fallbackResult.dhuhr && fallbackResult.asr && 
                  fallbackResult.maghrib && fallbackResult.isha) {
                console.log('Using fallback prayer times:', fallbackResult);
                return fallbackResult;
              } else {
                console.log('Missing prayer times in fallback result:', fallbackResult);
              }
            }
          }
        }
        // Try the alternative format for older API version
        else if (data?.data?.prayers) {
          console.log('Found prayers in data.data.prayers (older format)');
          
          const prayers = data.data.prayers;
          // Convert to our standard format
          const result: PrayerData = {
            fajr: prayers.subuh || '',   // Different API naming: subuh instead of fajr
            dhuhr: prayers.zohor || '',  // Different API naming: zohor instead of dhuhr
            asr: prayers.asar || '',     // Different API naming: asar instead of asr
            maghrib: prayers.maghrib || '',
            isha: prayers.isyak || '',   // Different API naming: isyak instead of isha
            source: 'waktusolat-api'
          };
          
          console.log('Mapped prayer times from older waktusolat.app format:', result);
          
          // Verify we have prayer times
          if (result.fajr && result.dhuhr && result.asr && result.maghrib && result.isha) {
            console.log('Successfully parsed waktusolat.app response:', result);
            return result;
          } else {
            console.log('Missing prayer times in mapped result:', result);
          }
        } else {
          // Try alternative formats as fallback
          let prayerData;
          
          if (data?.data?.prayer_times?.today) {
            console.log('Using format type 1: data.data.prayer_times.today');
            prayerData = data.data.prayer_times.today;
          } else if (data?.data?.today) {
            console.log('Using format type 2: data.data.today');
            prayerData = data.data.today;
          } else if (data?.prayer_times) {
            console.log('Using format type 3: data.prayer_times');
            prayerData = data.prayer_times;
          } else if (data?.data) {
            console.log('Using format type 4: data.data');
            prayerData = data.data;
          } else {
            console.log('Unknown API response format:', Object.keys(data));
          }
          
          console.log('Extracted prayer data structure:', prayerData ? Object.keys(prayerData) : 'null');
          
          if (prayerData) {
            // Map to our standard format, handling different possible field names
            const result: PrayerData = {
              fajr: prayerData.fajr || prayerData.subuh || prayerData.Fajr || '',
              dhuhr: prayerData.dhuhr || prayerData.zohor || prayerData.Dhuhr || '',
              asr: prayerData.asr || prayerData.asar || prayerData.Asr || '',
              maghrib: prayerData.maghrib || prayerData.Maghrib || '',
              isha: prayerData.isha || prayerData.isyak || prayerData.Isha || '',
              source: 'waktusolat-api'
            };
            
            console.log('Mapped prayer times from fallback format:', result);
            
            // Verify we have prayer times
            if (result.fajr && result.dhuhr && result.asr && result.maghrib && result.isha) {
              console.log('Successfully parsed waktusolat.app fallback response:', result);
              return result;
            } else {
              console.log('Missing prayer times in fallback result:', result);
            }
          }
        }
      } else {
        const errorText = await newApiResponse.text();
        console.error(`waktusolat.app API error (${status}):`, errorText);
      }
      
      // If the new API doesn't return expected data, log it
      console.log('New API response was not as expected, falling back to original API');
    } catch (newApiError) {
      console.error('Error with new waktusolat.app API, falling back to original API:', newApiError);
    }
    
    // Fall back to the original API
    console.log(`Calling e-solat.gov.my API for zone: ${zoneCode}`);
    const response = await fetch(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=${zoneCode}`
    );
    
    const status = response.status;
    console.log(`e-solat.gov.my API status: ${status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('e-solat.gov.my API response:', JSON.stringify(data));

      if (data.status === 'OK' && data.prayerTime?.[0]) {
        const prayerData = data.prayerTime[0];
        const result = {
          fajr: prayerData.fajr,
          dhuhr: prayerData.dhuhr,
          asr: prayerData.asr,
          maghrib: prayerData.maghrib,
          isha: prayerData.isha,
          source: 'e-solat-api' as const
        };
        console.log('Mapped e-solat.gov.my API response:', result);
        return result;
      } else {
        console.error('Invalid data format from e-solat.gov.my API:', data);
      }
    } else {
      const errorText = await response.text();
      console.error(`e-solat.gov.my API error (${status}):`, errorText);
    }
    
    console.error('Both APIs failed, returning null');
    return null;
  } catch (error) {
    console.error('Unhandled error in fetchPrayerTimes:', error);
    return null;
  }
}

export function getCurrentAndNextPrayer(prayerTimes: PrayerData): { current: PrayerTime; next: PrayerTime } {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers: PrayerTime[] = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha },
  ];

  const prayerTimeMinutes = prayers.map(prayer => {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    return { ...prayer, minutes: hours * 60 + minutes };
  });

  let current = prayerTimeMinutes[prayerTimeMinutes.length - 1];
  let next = prayerTimeMinutes[0];

  for (let i = 0; i < prayerTimeMinutes.length; i++) {
    if (currentTime >= prayerTimeMinutes[i].minutes) {
      current = prayerTimeMinutes[i];
      next = prayerTimeMinutes[(i + 1) % prayerTimeMinutes.length];
    }
  }

  return {
    current: { name: current.name, time: current.time },
    next: { name: next.name, time: next.time },
  };
} 