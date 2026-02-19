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
  province?: string;
  municipality?: string;
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

export const PROVINCES_ANGOLA: { name: string; municipalities: string[] }[] = [
  { name: 'Bengo', municipalities: ['Ambriz', 'Bula Atumba', 'Dande', 'Dembos', 'Nambuangongo', 'Pango Aluquém'] },
  { name: 'Benguela', municipalities: ['Baía Farta', 'Balombo', 'Benguela', 'Bocoio', 'Caimbambo', 'Catumbela', 'Chongoroi', 'Cubal', 'Ganda', 'Lobito'] },
  { name: 'Bié', municipalities: ['Andulo', 'Camacupa', 'Catabola', 'Chinguar', 'Chitembo', 'Cuemba', 'Cunhinga', 'Cuíto', 'Nharea'] },
  { name: 'Cabinda', municipalities: ['Belize', 'Buco-Zau', 'Cabinda', 'Cacongo', 'Landana'] },
  { name: 'Cuando', municipalities: ['Calai', 'Cuangar', 'Cuchi', 'Dirico', 'Mavinga', 'Nancova', 'Rivungo'] },
  { name: 'Cubango', municipalities: ['Chitembo', 'Cuchi', 'Cuito Cuanavale', 'Longa', 'Menongue', 'Nancova'] },
  { name: 'Cuanza Norte', municipalities: ['Ambaca', 'Banga', 'Bolongongo', 'Cambambe', 'Cazengo', 'Dondo', 'Golungo Alto', 'Gonguembo', 'Lucala', 'Quiculungo', 'Samba Caju'] },
  { name: 'Cuanza Sul', municipalities: ['Amboim', 'Cassongue', 'Cela', 'Conda', 'Ebo', 'Libolo', 'Mussende', 'Porto Amboim', 'Quibala', 'Quilenda', 'Seles', 'Sumbe'] },
  { name: 'Cunene', municipalities: ['Cahama', 'Cuanhama', 'Curoca', 'Cuvelai', 'Namacunde', 'Ombadja'] },
  { name: 'Huambo', municipalities: ['Bailundo', 'Cachiungo', 'Caála', 'Ecunha', 'Huambo', 'Londuimbali', 'Longonjo', 'Mungo', 'Tchicala-Tcholoanga', 'Tchindjenje', 'Ucuma'] },
  { name: 'Huíla', municipalities: ['Caconda', 'Cacula', 'Caluquembe', 'Chibia', 'Chicomba', 'Chipindo', 'Gambos', 'Humpata', 'Jamba', 'Lubango', 'Matala', 'Quilengues', 'Quipungo'] },
  { name: 'Icolo e Bengo', municipalities: ['Bom Jesus', 'Cabiri', 'Cabo Ledo', 'Calumbo', 'Catete', 'Quiçama', 'Sequele'] },
  { name: 'Luanda', municipalities: ['Belas', 'Cacuaco', 'Camama', 'Cazenga', 'Hoji-ya-Henda', 'Ingombota', 'Kilamba', 'Kilamba Kiaxi', 'Maianga', 'Mulenvos', 'Mussulo', 'Rangel', 'Samba', 'Sambizanga', 'Talatona', 'Viana'] },
  { name: 'Lunda Norte', municipalities: ['Cambulo', 'Capenda Camulemba', 'Caungula', 'Chitato', 'Cuango', 'Cuílo', 'Lóvua', 'Lubalo', 'Lucapa', 'Xá-Muteba'] },
  { name: 'Lunda Sul', municipalities: ['Cacolo', 'Dala', 'Muconda', 'Saurimo'] },
  { name: 'Malanje', municipalities: ['Cacuso', 'Calandula', 'Cambundi-Catembo', 'Cangandala', 'Cuaba Nzoji', 'Cunda-dia-Baze', 'Luquembo', 'Malanje', 'Marimba', 'Massango', 'Mucari', 'Quela', 'Quirima'] },
  { name: 'Moxico', municipalities: ['Alto Zambeze', 'Bundas', 'Camanongue', 'Léua', 'Luau', 'Luchazes', 'Luena', 'Lumeje', 'Moxico'] },
  { name: 'Moxico Leste', municipalities: ['Caiundo', 'Luacano', 'Lumbala Nguimbo'] },
  { name: 'Namibe', municipalities: ['Bibala', 'Camucuio', 'Moçâmedes', 'Tômbwa', 'Virei'] },
  { name: 'Uíge', municipalities: ['Alto Cauale', 'Ambuíla', 'Bembe', 'Buengas', 'Bungo', 'Damba', 'Macocola', 'Mucaba', 'Negage', 'Puri', 'Quimbele', 'Quitexe', 'Sanza Pombo', 'Songo', 'Uíge', 'Zombo'] },
  { name: 'Zaire', municipalities: ['Cuimba', 'Mbanza Congo', 'Nóqui', 'Nzeto', 'Soyo', 'Tomboco'] },
];

export const EMERGENCY_NUMBERS = {
  policia: '113',
  bombeiros: '190',
  crianca: '145',
  mulher: '180',
};

export const REPORT_TYPES = [
  { id: 'fisica', label: 'Violência Física', icon: 'hand-left' },
  { id: 'sexual', label: 'Violência Sexual', icon: 'alert-circle' },
  { id: 'psicologica', label: 'Violência Psicológica', icon: 'sad' },
  { id: 'economica', label: 'Violência Económica', icon: 'cash' },
  { id: 'menores', label: 'Abuso de Menores', icon: 'people' },
  { id: 'digital', label: 'Violência Digital', icon: 'phone-portrait' },
  { id: 'outro', label: 'Outro', icon: 'ellipsis-horizontal' },
];

export const DEFAULT_SAFE_STATIONS: SafeStation[] = [
  { id: '1', name: 'Hospital Josina Machel', address: 'Rua Major Kanhangulo, Ingombota, Luanda', phone: '222337244', latitude: -8.8147, longitude: 13.2302, type: 'hospital', province: 'Luanda', municipality: 'Ingombota', isCustom: false },
  { id: '2', name: 'Hospital Militar Principal', address: 'Av. Deolinda Rodrigues, Luanda', phone: '222321000', latitude: -8.8300, longitude: 13.2250, type: 'hospital', province: 'Luanda', municipality: 'Maianga', isCustom: false },
  { id: '3', name: 'Maternidade Lucrécia Paím', address: 'Luanda Centro', phone: '222339595', latitude: -8.8180, longitude: 13.2350, type: 'hospital', province: 'Luanda', municipality: 'Ingombota', isCustom: false },
  { id: '4', name: 'Esquadra da Polícia - Maianga', address: 'Bairro Maianga, Luanda', phone: '113', latitude: -8.8380, longitude: 13.2350, type: 'police', province: 'Luanda', municipality: 'Maianga', isCustom: false },
  { id: '5', name: 'SIC - Investigação Criminal', address: 'Rua Direita de Luanda', phone: '113', latitude: -8.8100, longitude: 13.2350, type: 'police', province: 'Luanda', municipality: 'Ingombota', isCustom: false },
  { id: '6', name: 'Rede Mulher Angola', address: 'Luanda Centro', phone: '222390988', latitude: -8.8200, longitude: 13.2400, type: 'ngo', province: 'Luanda', municipality: 'Maianga', isCustom: false },
  { id: '7', name: 'INAC - Instituto Nac. da Criança', address: 'Luanda', phone: '145', latitude: -8.8250, longitude: 13.2380, type: 'ngo', province: 'Luanda', municipality: 'Maianga', isCustom: false },
  { id: '8', name: 'Centro de Acolhimento Maianga', address: 'Bairro Maianga, Luanda', phone: '222321456', latitude: -8.8383, longitude: 13.2344, type: 'shelter', province: 'Luanda', municipality: 'Maianga', isCustom: false },
];

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
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch {}
  },
};
