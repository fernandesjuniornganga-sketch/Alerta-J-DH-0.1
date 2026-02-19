import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Storage,
  UserProfile,
  EmergencyContact,
  DisguiseType,
  SafeStation,
  DEFAULT_SAFE_STATIONS,
} from './storage';

interface AppContextValue {
  isLoading: boolean;
  isOnboarded: boolean;
  isUnlocked: boolean;
  pin: string | null;
  profile: UserProfile | null;
  contacts: EmergencyContact[];
  activeDisguise: DisguiseType;
  safeStations: SafeStation[];
  setIsOnboarded: (v: boolean) => void;
  setIsUnlocked: (v: boolean) => void;
  setPin: (pin: string) => Promise<void>;
  setProfile: (p: UserProfile) => Promise<void>;
  setContacts: (c: EmergencyContact[]) => Promise<void>;
  setActiveDisguise: (d: DisguiseType) => Promise<void>;
  setSafeStations: (s: SafeStation[]) => Promise<void>;
  lock: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPinState] = useState<string | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [contacts, setContactsState] = useState<EmergencyContact[]>([]);
  const [activeDisguise, setActiveDisguiseState] = useState<DisguiseType>('calculator');
  const [safeStations, setSafeStationsState] = useState<SafeStation[]>(DEFAULT_SAFE_STATIONS);

  useEffect(() => {
    (async () => {
      try {
        const [onboarded, storedPin, storedProfile, storedContacts, disguise, stations] =
          await Promise.all([
            Storage.isOnboardingComplete(),
            Storage.getPin(),
            Storage.getProfile(),
            Storage.getContacts(),
            Storage.getActiveDisguise(),
            Storage.getSafeStations(),
          ]);
        setIsOnboarded(onboarded);
        setPinState(storedPin);
        setProfileState(storedProfile);
        setContactsState(storedContacts);
        setActiveDisguiseState(disguise);
        setSafeStationsState(stations);
      } catch (e) {
        console.error('Load error:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isOnboarded,
      isUnlocked,
      pin,
      profile,
      contacts,
      activeDisguise,
      safeStations,
      setIsOnboarded: (v: boolean) => {
        setIsOnboarded(v);
        Storage.setOnboardingComplete(v);
      },
      setIsUnlocked,
      setPin: async (newPin: string) => {
        setPinState(newPin);
        await Storage.setPin(newPin);
      },
      setProfile: async (p: UserProfile) => {
        setProfileState(p);
        await Storage.setProfile(p);
      },
      setContacts: async (c: EmergencyContact[]) => {
        setContactsState(c);
        await Storage.setContacts(c);
      },
      setActiveDisguise: async (d: DisguiseType) => {
        setActiveDisguiseState(d);
        await Storage.setActiveDisguise(d);
      },
      setSafeStations: async (s: SafeStation[]) => {
        setSafeStationsState(s);
        await Storage.setSafeStations(s);
      },
      lock: () => setIsUnlocked(false),
    }),
    [isLoading, isOnboarded, isUnlocked, pin, profile, contacts, activeDisguise, safeStations],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be inside AppProvider');
  return context;
}
