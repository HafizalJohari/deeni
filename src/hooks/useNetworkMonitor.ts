'use client';

import { useState, useEffect, useRef } from 'react';

interface NetworkLog {
  url: string;
  method: string;
  status?: number;
  type: 'request' | 'response' | 'error';
  timestamp: number;
  duration?: number;
  error?: Error;
  redirectSource?: string;
  redirectTarget?: string;
  isRedirect?: boolean;
}

interface UseNetworkMonitorProps {
  enabled?: boolean;
  captureRedirects?: boolean;
  maxLogs?: number;
  filterUrls?: string[];
}

export function useNetworkMonitor({
  enabled = true,
  captureRedirects = true,
  maxLogs = 100,
  filterUrls = [], // URLs to focus on, e.g. ['/api/auth', '/auth/callback']
}: UseNetworkMonitorProps = {}) {
  const [networkLogs, setNetworkLogs] = useState<NetworkLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(enabled);
  const requestsInProgress = useRef<Map<string, number>>(new Map());
  
  // Setup performance observer for monitoring redirects
  useEffect(() => {
    if (!enabled || !captureRedirects || typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }
    
    try {
      const navigationObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            if (navEntry.redirectCount > 0) {
              console.log('[Network Monitor] Redirect detected:', {
                redirectCount: navEntry.redirectCount,
                startTime: new Date(navEntry.startTime).toISOString(),
                redirectStart: new Date(navEntry.redirectStart).toISOString(),
                redirectEnd: new Date(navEntry.redirectEnd).toISOString(),
                duration: navEntry.redirectEnd - navEntry.redirectStart,
                url: navEntry.name,
              });
              
              setNetworkLogs((prev) => [
                {
                  url: navEntry.name,
                  method: 'GET', // Redirects are typically GET
                  type: 'response',
                  timestamp: Date.now(),
                  duration: navEntry.redirectEnd - navEntry.redirectStart,
                  isRedirect: true,
                  redirectSource: document.referrer || 'unknown',
                  redirectTarget: navEntry.name,
                },
                ...prev,
              ].slice(0, maxLogs));
            }
          }
        });
      });
      
      navigationObserver.observe({ entryTypes: ['navigation'] });
      
      return () => {
        navigationObserver.disconnect();
      };
    } catch (error) {
      console.error('[Network Monitor] Error setting up navigation observer:', error);
    }
  }, [enabled, captureRedirects, maxLogs]);
  
  // Setup network request monitoring
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }
    
    // Use a custom performance observer for resource timing
    try {
      const resourceObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Skip if we're filtering URLs and this one doesn't match
            if (filterUrls.length > 0 && !filterUrls.some(filter => resourceEntry.name.includes(filter))) {
              return;
            }
            
            console.log('[Network Monitor] Resource timing:', {
              url: resourceEntry.name,
              initiatorType: resourceEntry.initiatorType,
              duration: resourceEntry.duration,
              startTime: new Date(performance.timeOrigin + resourceEntry.startTime).toISOString(),
            });
            
            setNetworkLogs((prev) => [
              {
                url: resourceEntry.name,
                method: resourceEntry.initiatorType === 'fetch' || resourceEntry.initiatorType === 'xmlhttprequest' 
                  ? 'unknown' // We can't determine the HTTP method from ResourceTiming
                  : 'GET',
                type: 'response',
                timestamp: Date.now(),
                duration: resourceEntry.duration,
              },
              ...prev,
            ].slice(0, maxLogs));
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      
      return () => {
        resourceObserver.disconnect();
      };
    } catch (error) {
      console.error('[Network Monitor] Error setting up resource observer:', error);
    }
  }, [enabled, filterUrls, maxLogs]);
  
  // Save logs to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || networkLogs.length === 0) {
      return;
    }
    
    try {
      localStorage.setItem('auth_debug_network_logs', JSON.stringify(networkLogs));
    } catch (error) {
      console.error('[Network Monitor] Error saving logs to localStorage:', error);
    }
  }, [networkLogs]);
  
  const clearLogs = () => {
    setNetworkLogs([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_debug_network_logs');
      } catch (error) {
        console.error('[Network Monitor] Error removing logs from localStorage:', error);
      }
    }
  };
  
  const toggleMonitoring = () => {
    setIsMonitoring((prev) => !prev);
  };
  
  const getRedirectChain = () => {
    return networkLogs.filter(log => log.isRedirect === true);
  };
  
  return {
    logs: networkLogs,
    isMonitoring,
    toggleMonitoring,
    clearLogs,
    getRedirectChain,
  };
}

export default useNetworkMonitor; 