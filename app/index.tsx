import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '@/lib/app-context';
import Colors from '@/constants/colors';
import OnboardingFlow from '@/components/OnboardingFlow';
import CalculatorDisguise from '@/components/CalculatorDisguise';
import NotesDisguise from '@/components/NotesDisguise';
import ClockDisguise from '@/components/ClockDisguise';
import SOSDashboard from '@/components/SOSDashboard';
import SettingsScreen from '@/components/SettingsScreen';
import SafeStationsScreen from '@/components/SafeStationsScreen';
import DisguiseSwitcher from '@/components/DisguiseSwitcher';
import ResourcesScreen from '@/components/ResourcesScreen';
import ReportScreen from '@/components/ReportScreen';

type Screen = 'main' | 'settings' | 'stations' | 'disguise' | 'resources' | 'report';

export default function MainScreen() {
  const { isLoading, isOnboarded, isUnlocked, pin, activeDisguise, setIsUnlocked } = useApp();
  const [screen, setScreen] = useState<Screen>('main');

  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
    setScreen('main');
  }, [setIsUnlocked]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isOnboarded) {
    return (
      <>
        <OnboardingFlow />
        <StatusBar style="light" />
      </>
    );
  }

  if (!isUnlocked) {
    const disguiseProps = {
      onUnlock: handleUnlock,
      pin: pin || '0000',
    };

    switch (activeDisguise) {
      case 'notes':
        return (
          <>
            <NotesDisguise {...disguiseProps} />
            <StatusBar style="dark" />
          </>
        );
      case 'clock':
        return (
          <>
            <ClockDisguise {...disguiseProps} />
            <StatusBar style="light" />
          </>
        );
      case 'calculator':
      default:
        return (
          <>
            <CalculatorDisguise {...disguiseProps} />
            <StatusBar style="light" />
          </>
        );
    }
  }

  switch (screen) {
    case 'settings':
      return (
        <>
          <SettingsScreen onBack={() => setScreen('main')} />
          <StatusBar style="light" />
        </>
      );
    case 'stations':
      return (
        <>
          <SafeStationsScreen onBack={() => setScreen('main')} />
          <StatusBar style="light" />
        </>
      );
    case 'disguise':
      return (
        <>
          <DisguiseSwitcher onBack={() => setScreen('main')} />
          <StatusBar style="light" />
        </>
      );
    case 'resources':
      return (
        <>
          <ResourcesScreen onBack={() => setScreen('main')} />
          <StatusBar style="light" />
        </>
      );
    case 'report':
      return (
        <>
          <ReportScreen onBack={() => setScreen('main')} />
          <StatusBar style="light" />
        </>
      );
    default:
      return (
        <>
          <SOSDashboard
            onSettings={() => setScreen('settings')}
            onSafeStations={() => setScreen('stations')}
            onDisguiseSwitch={() => setScreen('disguise')}
            onResources={() => setScreen('resources')}
            onReport={() => setScreen('report')}
          />
          <StatusBar style="light" />
        </>
      );
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
