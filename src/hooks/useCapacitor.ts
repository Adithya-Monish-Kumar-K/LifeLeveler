import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useCapacitor() {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const checkPlatform = () => {
      setIsNative(Capacitor.isNativePlatform());
      setPlatform(Capacitor.getPlatform());
    };

    checkPlatform();

    // Configure native features if running on mobile
    if (Capacitor.isNativePlatform()) {
      configureNativeFeatures();
    }
  }, []);

  const configureNativeFeatures = async () => {
    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#111827' });

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Handle back button on Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });

      // Handle keyboard events
      Keyboard.addListener('keyboardWillShow', (info) => {
        document.body.style.transform = `translateY(-${info.keyboardHeight / 2}px)`;
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.body.style.transform = 'translateY(0px)';
      });

    } catch (error) {
      console.error('Error configuring native features:', error);
    }
  };

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.error('Haptic feedback error:', error);
      }
    }
  };

  const hideKeyboard = async () => {
    if (isNative) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.error('Hide keyboard error:', error);
      }
    }
  };

  return {
    isNative,
    platform,
    triggerHaptic,
    hideKeyboard,
  };
}