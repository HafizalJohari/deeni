'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, ChevronUp, ChevronDown, Settings, Navigation, RefreshCw, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchPrayerTimes, 
  getCurrentAndNextPrayer, 
  getJakimZones, 
  requestLocationPermission,
  findNearestZone,
  type PrayerData, 
  type PrayerTime, 
  type JakimZone 
} from '@/lib/jakim';
import PrayerNotification from './PrayerNotification';

const LOCATION_PERMISSION_KEY = 'prayer-times-location-permission';
const SELECTED_ZONE_KEY = 'prayer-times-selected-zone';
const NOTIFICATION_ENABLED_KEY = 'prayer-notification-enabled';

export function FloatingPrayerTime() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerData | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<PrayerTime | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zones, setZones] = useState<JakimZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<JakimZone | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [zoneSearch, setZoneSearch] = useState('');

  // Initialize, run once on mount
  useEffect(() => {
    console.log('FloatingPrayerTime component mounted');
    
    // Make sure we're in the browser environment
    if (typeof window !== 'undefined') {
      // Debug element removed - no longer showing "Prayer Time Active" indicator
      
      // Return empty cleanup function since we're not creating an element anymore
      return () => {};
    }
  }, []);

  // Load notification preferences
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const notificationSetting = localStorage.getItem(NOTIFICATION_ENABLED_KEY) === 'true';
        setNotificationsEnabled(notificationSetting);
      }
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  }, []);

  // Load saved zone from localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const savedZoneCode = localStorage.getItem(SELECTED_ZONE_KEY);
      const hasLocationPermission = localStorage.getItem(LOCATION_PERMISSION_KEY) === 'granted';

      const loadZones = async () => {
        try {
          const zones = await getJakimZones();
          console.log('Zones loaded:', zones.length);
          setZones(zones);

          if (savedZoneCode) {
            const savedZone = zones.find(zone => zone.code === savedZoneCode);
            if (savedZone) {
              setSelectedZone(savedZone);
              return;
            }
          }

          // If no saved zone or location permission, try to get location
          if (hasLocationPermission) {
            detectLocation();
          } else {
            // Default to Kuala Lumpur
            const defaultZone = zones.find(zone => zone.code === 'WLY01') || zones[0];
            if (defaultZone) {
              setSelectedZone(defaultZone);
            } else {
              console.error('No default zone found');
            }
          }
        } catch (err) {
          console.error('Error in loadZones:', err);
          setError('Failed to load prayer zones');
        }
      };

      loadZones();
    } catch (err) {
      console.error('Error in zone loading effect:', err);
    }
  }, []);

  const detectLocation = async () => {
    setIsLocating(true);
    try {
      const position = await requestLocationPermission();
      if (position) {
        const { latitude, longitude } = position.coords;
        const nearestZoneCode = findNearestZone(latitude, longitude);
        const nearestZone = zones.find(zone => zone.code === nearestZoneCode);
        
        if (nearestZone) {
          setSelectedZone(nearestZone);
          localStorage.setItem(SELECTED_ZONE_KEY, nearestZone.code);
          localStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
        }
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    } finally {
      setIsLocating(false);
    }
  };

  // Calculate remaining time to next prayer
  useEffect(() => {
    if (!nextPrayer || typeof window === 'undefined') return;

    try {
      const calculateRemainingTime = () => {
        const now = new Date();
        const [hours, minutes] = nextPrayer.time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        // If prayer time is in the past, set it to tomorrow
        if (prayerTime < now) {
          prayerTime.setDate(prayerTime.getDate() + 1);
        }

        const diffMs = prayerTime.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;

        let timeString = '';
        if (hrs > 0) {
          timeString += `${hrs} hour${hrs > 1 ? 's' : ''}`;
        }
        if (mins > 0 || hrs === 0) {
          if (hrs > 0) timeString += ' and ';
          timeString += `${mins} minute${mins > 1 ? 's' : ''}`;
        }

        setRemainingTime(timeString);

        // Show notification 15 minutes before prayer time
        if (diffMins <= 15 && diffMins > 0 && notificationsEnabled) {
          setShowNotification(true);
        } else {
          setShowNotification(false);
        }
      };

      calculateRemainingTime();
      const interval = setInterval(calculateRemainingTime, 60 * 1000); // Update every minute

      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error calculating remaining time:', err);
    }
  }, [nextPrayer, notificationsEnabled]);

  const getPrayerTimes = async () => {
    if (!selectedZone) return;

    try {
      setLoading(true);
      console.log(`Fetching prayer times for zone: ${selectedZone.code} (${selectedZone.daerah}, ${selectedZone.negeri})`);
      
      // Set a timeout to avoid UI freezes
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      const fetchPromise = fetchPrayerTimes(selectedZone.code);
      let data;
      
      try {
        data = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('Prayer time request timed out:', timeoutError);
        setError('Request timed out. Please try again.');
        setLoading(false);
        return;
      }
      
      if (data) {
        console.log('Prayer times fetched successfully:', data);
        console.log('API Source:', data.source || 'unknown');
        setPrayerTimes(data);
        const { current, next } = getCurrentAndNextPrayer(data);
        setCurrentPrayer(current);
        setNextPrayer(next);
        setError(null); // Clear any previous errors
      } else {
        console.error('No prayer times data returned');
        setError('Unable to fetch prayer times. The server may be down.');
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
      setError('Network error fetching prayer times.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedZone) {
      getPrayerTimes();
      const interval = setInterval(getPrayerTimes, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [selectedZone]);

  useEffect(() => {
    if (!prayerTimes) return;

    try {
      const updatePrayers = () => {
        const { current, next } = getCurrentAndNextPrayer(prayerTimes);
        setCurrentPrayer(current);
        setNextPrayer(next);
      };

      updatePrayers();
      const interval = setInterval(updatePrayers, 60 * 1000); // Update every minute

      return () => clearInterval(interval);
    } catch (err) {
      console.error('Error updating prayers:', err);
    }
  }, [prayerTimes]);

  const toggleNotifications = () => {
    try {
      if (typeof window !== 'undefined') {
        const newSetting = !notificationsEnabled;
        setNotificationsEnabled(newSetting);
        localStorage.setItem(NOTIFICATION_ENABLED_KEY, newSetting.toString());
      }
    } catch (err) {
      console.error('Error toggling notifications:', err);
    }
  };

  const retryLoading = () => {
    setError(null);
    setLoading(true);
    if (selectedZone) {
      console.log(`Retrying prayer times fetch for zone: ${selectedZone.code}`);
      
      // Set a timeout to avoid UI freezes
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Retry timeout')), 15000);
      });
      
      const fetchPromise = fetchPrayerTimes(selectedZone.code);
      
      Promise.race([fetchPromise, timeoutPromise])
        .then(data => {
          if (data) {
            console.log('Retry successful, data loaded:', data);
            setPrayerTimes(data);
            const { current, next } = getCurrentAndNextPrayer(data);
            setCurrentPrayer(current);
            setNextPrayer(next);
          } else {
            console.error('Retry failed: No data returned');
            setError('Unable to fetch prayer times. Please try again later.');
          }
        })
        .catch(err => {
          const errorMessage = err.message === 'Retry timeout' 
            ? 'Request timed out. Please try again.' 
            : 'Network error. Please check your connection and try again.';
          
          console.error('Error in retry:', err);
          setError(errorMessage);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No location selected. Please select a location first.');
    }
  };

  const handleZoneSelect = (zone: JakimZone) => {
    setSelectedZone(zone);
    localStorage.setItem(SELECTED_ZONE_KEY, zone.code);
    setShowZoneDialog(false);
    // Refetch prayer times with the new zone
    setLoading(true);
    setError(null);
  };

  const filteredZones = zones.filter(zone => 
    zone.negeri.toLowerCase().includes(zoneSearch.toLowerCase()) || 
    zone.daerah.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  // We're adding a simple version in case the regular component isn't visible
  if (!isVisible) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-[9999] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 cursor-pointer"
        onClick={() => setIsVisible(true)}
      >
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3 14.59L11.41 13l-1.41-1.41L14.59 7 16 8.41 12.41 12 16 15.59z"/>
            <path d="M4 12h2m12 0h2M12 4v2m0 12v2"/>
          </svg>
          <span className="text-sm font-medium">Prayer Times</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-36 right-6 z-[9999] prayer-time-widget">
        <div className="bg-white dark:bg-neutral-900 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium hidden sm:inline">Prayer Times</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="mt-2 h-4 w-24 animate-pulse bg-gray-200 dark:bg-neutral-800 rounded" />
            ) : error ? (
              <div className="mt-2 text-xs text-red-500 flex items-center justify-between">
                <span>
                  {error.includes('Network') ? 'Network error' : 
                   error.includes('timeout') ? 'Request timeout' :
                   error.includes('server') ? 'Server error' : 'Failed to load'}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    retryLoading();
                  }}
                  className="text-green-600 hover:text-green-500 transition-colors p-1"
                  aria-label="Retry loading prayer times"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">{currentPrayer?.name || 'Loading...'}</span>
                  <span>{currentPrayer?.time || '--:--'}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Next: {nextPrayer?.name || 'Loading...'}</span>
                  <span>{nextPrayer?.time || '--:--'}</span>
                </div>
                {remainingTime && (
                  <div className="text-xs text-gray-400 mt-1">
                    {remainingTime} until next prayer
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-200 dark:border-neutral-800"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedZone?.daerah || 'No zone selected'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          detectLocation();
                        }}
                        className={cn(
                          "p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors",
                          isLocating && "animate-pulse"
                        )}
                        disabled={isLocating}
                        title="Detect location"
                      >
                        <Navigation className="w-3 h-3 text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowZoneDialog(true);
                        }}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Select zone"
                      >
                        <Settings className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  {prayerTimes ? (
                    <>
                      {Object.entries(prayerTimes)
                        .filter(([key]) => key !== 'source') // Skip the source property
                        .map(([name, time]) => (
                          <div 
                            key={name} 
                            className={cn(
                              "flex items-center justify-between text-sm",
                              currentPrayer?.name.toLowerCase() === name && "text-green-600 font-medium"
                            )}
                          >
                            <span className="capitalize">{name}</span>
                            <span>{time || '--:--'}</span>
                          </div>
                        ))
                      }
                      <div 
                        className="text-xs text-gray-400 mt-1 text-right flex items-center justify-end space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Debug - Full prayer times data:', prayerTimes);
                        }}
                      >
                        <span>Source:</span>
                        <span className="font-medium">
                          {prayerTimes.source === 'waktusolat-api' ? 'waktusolat.app' : 'e-solat.gov.my'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryLoading();
                          }}
                          className="text-gray-400 hover:text-green-600 transition-colors p-1"
                          aria-label="Refresh prayer times"
                          title="Refresh prayer times"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-500 py-2 text-center">
                      {error ? (
                        <div className="flex flex-col items-center">
                          <span className="text-red-500">{error}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              retryLoading();
                            }}
                            className="mt-1 text-gray-400 hover:text-green-600 transition-colors px-2 py-1 rounded-md border border-gray-200 dark:border-neutral-800 text-xs"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        'Loading prayer times...'
                      )}
                    </div>
                  )}

                  <div className="pt-2 mt-2 border-t border-gray-200 dark:border-neutral-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotifications();
                      }}
                      className={cn(
                        "w-full text-xs px-3 py-2 rounded-lg transition-colors",
                        notificationsEnabled 
                          ? "bg-green-600 text-white hover:bg-green-700" 
                          : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                      )}
                    >
                      {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Zone Selection Dialog */}
      {showZoneDialog && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-medium">Select Prayer Time Zone</h3>
              <button 
                onClick={() => setShowZoneDialog(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by state or district..."
                  value={zoneSearch}
                  onChange={(e) => setZoneSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {filteredZones.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-neutral-800">
                  {filteredZones.map((zone) => (
                    <button
                      key={zone.code}
                      onClick={() => handleZoneSelect(zone)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors",
                        selectedZone?.code === zone.code && "bg-green-50 dark:bg-green-900/20"
                      )}
                    >
                      <div className="font-medium">{zone.daerah}</div>
                      <div className="text-sm text-gray-500">{zone.negeri}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {zones.length > 0 
                    ? 'No zones match your search' 
                    : 'Loading zones...'}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
              <button
                onClick={() => setShowZoneDialog(false)}
                className="w-full py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotification && nextPrayer && (
        <PrayerNotification
          prayerName={nextPrayer.name}
          prayerTime={nextPrayer.time}
          remainingTime={remainingTime || undefined}
          onDismiss={() => setShowNotification(false)}
          onAccept={() => {
            setShowNotification(false);
            // Can add additional action for accept (e.g. open full prayer app)
          }}
        />
      )}
    </>
  );
} 