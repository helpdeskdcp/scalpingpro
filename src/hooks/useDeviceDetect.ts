import { useState, useEffect } from 'react';

export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP';

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  width: number;
  height: number;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  fitMode: 'AUTO' | 'FIT_SCREEN' | 'EXPANDED';
}

export function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        deviceType: 'DESKTOP',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isAndroid: false,
        isIOS: false,
        width: 1440,
        height: 900,
        orientation: 'LANDSCAPE',
        fitMode: 'AUTO',
      };
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const width = window.innerWidth;
    const height = window.innerHeight;

    let deviceType: DeviceType = 'DESKTOP';
    if (width < 768 || (isAndroid && width < 600)) {
      deviceType = 'MOBILE';
    } else if (width < 1200 || /ipad|tablet/i.test(ua)) {
      deviceType = 'TABLET';
    }

    return {
      deviceType,
      isMobile: deviceType === 'MOBILE',
      isTablet: deviceType === 'TABLET',
      isDesktop: deviceType === 'DESKTOP',
      isAndroid,
      isIOS,
      width,
      height,
      orientation: width > height ? 'LANDSCAPE' : 'PORTRAIT',
      fitMode: 'AUTO',
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isAndroid = /android/i.test(ua);
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      const width = window.innerWidth;
      const height = window.innerHeight;

      let deviceType: DeviceType = 'DESKTOP';
      if (width < 768 || (isAndroid && width < 600)) {
        deviceType = 'MOBILE';
      } else if (width < 1200 || /ipad|tablet/i.test(ua)) {
        deviceType = 'TABLET';
      }

      setDeviceInfo(prev => ({
        ...prev,
        deviceType,
        isMobile: deviceType === 'MOBILE',
        isTablet: deviceType === 'TABLET',
        isDesktop: deviceType === 'DESKTOP',
        isAndroid,
        isIOS,
        width,
        height,
        orientation: width > height ? 'LANDSCAPE' : 'PORTRAIT',
      }));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const setFitMode = (mode: 'AUTO' | 'FIT_SCREEN' | 'EXPANDED') => {
    setDeviceInfo(prev => ({ ...prev, fitMode: mode }));
  };

  return { ...deviceInfo, setFitMode };
}
