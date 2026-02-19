import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: '@aj_onboarding_complete',
  USER_PROFILE: '@aj_user_profile',
  PIN: '@aj_pin',
  CONTACTS: '@aj_contacts',
  ACTIVE_DISGUISE: '@aj_active_disguise',
  SAFE_STATIONS: '@aj_safe_stations',
  SOS_HISTORY: '@aj_sos_history',
};

export interface UserProfile {
  ageRange: string;
  province: string;
  city: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  isPolice: boolean;
  whatsapp?: string;
  telegram?: string;
}

export type DisguiseType = 'calculator' | 'notes' | 'clock';

export interface SafeStation {
  id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'police' | 'ngo' | 'shelter' | 'custom';
  isCustom: boolean;
}

export interface SOSRecord {
  id: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
  contactsNotified: string[];
  cancelled: boolean;
}

export const DEFAULT_SAFE_STATIONS: SafeStation[] = [
  {
    id: '1',
    name: 'Centro de Acolhimento Maianga',
    address: 'Bairro Maianga, Luanda',
    phone: '222321456',
    latitude: -8.8383,
    longitude: 13.2344,
    type: 'shelter',
    isCustom: false,
  },
  {
    id: '2',
    name: 'Hospital Josina Machel',
    address: 'Rua Major Kanhangulo, Luanda',
    phone: '222337244',
    latitude: -8.8147,
    longitude: 13.2302,
    type: 'hospital',
    isCustom: false,
  },
  {
    id: '3',
    name: 'Esquadra Policial - Maianga',
    address: 'Maianga, Luanda',
    phone: '113',
    latitude: -8.8380,
    longitude: 13.2350,
    type: 'police',
    isCustom: false,
  },
  {
    id: '4',
    name: 'Rede Mulher Angola',
    address: 'Luanda Centro',
    phone: '222390988',
    latitude: -8.8200,
    longitude: 13.2400,
    type: 'ngo',
    isCustom: false,
  },
  {
    id: '5',
    name: 'SIC - Luanda',
    address: 'Rua Direita de Luanda',
    phone: '113',
    latitude: -8.8100,
    longitude: 13.2350,
    type: 'police',
    isCustom: false,
  },
  {
    id: '6',
    name: 'Hospital Militar',
    address: 'Av. Deolinda Rodrigues, Luanda',
    phone: '222321000',
    latitude: -8.8300,
    longitude: 13.2250,
    type: 'hospital',
    isCustom: false,
  },
];

export const EMERGENCY_NUMBERS = {
  policia: '113',
  bombeiros: '190',
  crianca: '145',
  mulher: '180',
};

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const Storage = {
  isOnboardingComplete: () => getItem<boolean>(KEYS.ONBOARDING_COMPLETE, false),
  setOnboardingComplete: (v: boolean) => setItem(KEYS.ONBOARDING_COMPLETE, v),

  getProfile: () => getItem<UserProfile | null>(KEYS.USER_PROFILE, null),
  setProfile: (p: UserProfile) => setItem(KEYS.USER_PROFILE, p),

  getPin: () => getItem<string | null>(KEYS.PIN, null),
  setPin: (pin: string) => setItem(KEYS.PIN, pin),

  getContacts: () => getItem<EmergencyContact[]>(KEYS.CONTACTS, []),
  setContacts: (c: EmergencyContact[]) => setItem(KEYS.CONTACTS, c),

  getActiveDisguise: () => getItem<DisguiseType>(KEYS.ACTIVE_DISGUISE, 'calculator'),
  setActiveDisguise: (d: DisguiseType) => setItem(KEYS.ACTIVE_DISGUISE, d),

  getSafeStations: () => getItem<SafeStation[]>(KEYS.SAFE_STATIONS, DEFAULT_SAFE_STATIONS),
  setSafeStations: (s: SafeStation[]) => setItem(KEYS.SAFE_STATIONS, s),

  getSOSHistory: () => getItem<SOSRecord[]>(KEYS.SOS_HISTORY, []),
  addSOSRecord: async (record: SOSRecord) => {
    const history = await getItem<SOSRecord[]>(KEYS.SOS_HISTORY, []);
    history.unshift(record);
    await setItem(KEYS.SOS_HISTORY, history.slice(0, 50));
  },
};
