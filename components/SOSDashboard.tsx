import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { EmergencyContact, SafeStation, EMERGENCY_NUMBERS, Storage, SOSRecord } from '@/lib/storage';
import { sendSMS, makeCall, sendWhatsApp, sendTelegram } from '@/lib/alerts';
import * as Crypto from 'expo-crypto';

interface SOSDashboardProps {
  onSettings: () => void;
  onSafeStations: () => void;
  onDisguiseSwitch: () => void;
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const handleCall = () => makeCall(contact.phone);
  const handleSMS = () => sendSMS(contact.phone, 'Preciso de ajuda!');

  return (
    <View style={styles.contactCard}>
      <View style={styles.contactIcon}>
        {contact.isPolice ? (
          <MaterialCommunityIcons name="shield-check" size={20} color={Colors.warning} />
        ) : (
          <Ionicons name="person" size={20} color={Colors.primary} />
        )}
      </View>
      <Text style={styles.contactName} numberOfLines={1}>
        {contact.name}
      </Text>
      <View style={styles.contactActions}>
        <Pressable onPress={handleCall} style={styles.contactAction}>
          <Ionicons name="call" size={16} color={Colors.success} />
        </Pressable>
        <Pressable onPress={handleSMS} style={styles.contactAction}>
          <Ionicons name="chatbubble" size={16} color={Colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function SafeStationItem({ station }: { station: SafeStation }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'hospital': return 'medkit';
      case 'police': return 'shield-checkmark';
      case 'ngo': return 'heart';
      case 'shelter': return 'home';
      default: return 'location';
    }
  };

  const handleCall = () => {
    if (station.phone) makeCall(station.phone);
  };

  return (
    <View style={styles.stationCard}>
      <View style={styles.stationIcon}>
        <Ionicons name={getIcon(station.type) as any} size={18} color={Colors.white} />
      </View>
      <View style={styles.stationInfo}>
        <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
        <Text style={styles.stationAddr} numberOfLines={1}>{station.address}</Text>
      </View>
      {station.phone && (
        <Pressable onPress={handleCall} style={styles.stationCallBtn}>
          <Ionicons name="call" size={16} color={Colors.success} />
        </Pressable>
      )}
    </View>
  );
}

export default function SOSDashboard({ onSettings, onSafeStations, onDisguiseSwitch }: SOSDashboardProps) {
  const insets = useSafeAreaInsets();
  const { contacts, safeStations, lock } = useApp();
  const [sosActive, setSOSActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const triggerSOS = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setSOSActive(true);
    setCountdown(10);

    const msg = location
      ? `ALERTA SOS! Preciso de ajuda urgente! Minha localização: https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'ALERTA SOS! Preciso de ajuda urgente!';

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);

          contacts.forEach((c) => {
            sendSMS(c.phone, msg);
            if (c.whatsapp) sendWhatsApp(c.whatsapp, msg);
            if (c.telegram) sendTelegram(c.telegram, msg);
          });

          Storage.addSOSRecord({
            id: Crypto.randomUUID(),
            timestamp: Date.now(),
            latitude: location?.lat,
            longitude: location?.lng,
            contactsNotified: contacts.map((c) => c.id),
            cancelled: false,
          });

          setSOSActive(false);
          return 0;
        }
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        return prev - 1;
      });
    }, 1000);
  }, [contacts, location]);

  const cancelSOS = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSOSActive(false);
    setCountdown(10);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleSOSPress = useCallback(() => {
    if (sosActive) return;
    triggerSOS();
  }, [sosActive, triggerSOS]);

  const nearbyStations = safeStations.slice(0, 3);

  if (sosActive) {
    return (
      <View style={[styles.sosOverlay, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
        <View style={styles.sosContent}>
          <Text style={styles.sosCountdownLabel}>ALERTA EM</Text>
          <Text style={styles.sosCountdownNumber}>{countdown}</Text>
          <Text style={styles.sosCountdownSub}>segundos</Text>
          <Text style={styles.sosDesc}>
            A mensagem SOS será enviada para {contacts.length} contacto(s) com a sua localização
          </Text>
          <Pressable
            onPress={cancelSOS}
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
          >
            <Ionicons name="close-circle" size={28} color={Colors.white} />
            <Text style={styles.cancelText}>CANCELAR</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={lock} style={styles.headerBtn}>
          <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.statusDot} />
          <Text style={styles.headerTitle}>Protegido</Text>
        </View>
        <Pressable onPress={onSettings} style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sosArea}>
          <Animated.View style={[styles.sosPulse, pulseStyle]} />
          <Pressable
            onPress={handleSOSPress}
            onLongPress={handleSOSPress}
            delayLongPress={2000}
            style={({ pressed }) => [
              styles.sosButton,
              pressed && { transform: [{ scale: 0.95 }], backgroundColor: Colors.primaryDark },
            ]}
          >
            <MaterialCommunityIcons name="alert" size={40} color={Colors.white} />
            <Text style={styles.sosLabel}>ALERTE JÁ!</Text>
          </Pressable>
          <Text style={styles.sosHint}>Toque 2x ou segure 3s</Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => makeCall(EMERGENCY_NUMBERS.policia)}
            style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="call" size={22} color={Colors.danger} />
            <Text style={styles.quickLabel}>Polícia{'\n'}113</Text>
          </Pressable>
          <Pressable
            onPress={onSafeStations}
            style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="location" size={22} color={Colors.success} />
            <Text style={styles.quickLabel}>Postos{'\n'}Seguros</Text>
          </Pressable>
          <Pressable
            onPress={onDisguiseSwitch}
            style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="swap-horizontal" size={22} color={Colors.accent} />
            <Text style={styles.quickLabel}>Trocar{'\n'}Disfarce</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contactos de Emergência</Text>
            <Pressable onPress={onSettings}>
              <Feather name="edit-2" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <FlatList
            data={contacts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ContactCard contact={item} />}
            contentContainerStyle={styles.contactsList}
            scrollEnabled={contacts.length > 0}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Postos Seguros Próximos</Text>
            <Pressable onPress={onSafeStations}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </Pressable>
          </View>
          {nearbyStations.map((s) => (
            <SafeStationItem key={s.id} station={s} />
          ))}
        </View>

        <View style={styles.emergencyNumbers}>
          <Text style={styles.sectionTitle}>Números de Emergência</Text>
          <View style={styles.numbersGrid}>
            {Object.entries(EMERGENCY_NUMBERS).map(([key, num]) => (
              <Pressable
                key={key}
                onPress={() => makeCall(num)}
                style={({ pressed }) => [styles.numberCard, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.numberLabel}>
                  {key === 'policia' ? 'Polícia' : key === 'bombeiros' ? 'Bombeiros' : key === 'crianca' ? 'Criança' : 'Mulher'}
                </Text>
                <Text style={styles.numberValue}>{num}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const SOS_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sosArea: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  sosPulse: {
    position: 'absolute',
    top: 32,
    width: SOS_SIZE + 40,
    height: SOS_SIZE + 40,
    borderRadius: (SOS_SIZE + 40) / 2,
    backgroundColor: Colors.primary,
  },
  sosButton: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  sosLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  sosHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    width: 130,
    alignItems: 'center',
    gap: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  stationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  stationAddr: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  stationCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyNumbers: {
    marginBottom: 24,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  numberCard: {
    width: '47%' as any,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  numberLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  numberValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  sosOverlay: {
    flex: 1,
    backgroundColor: '#1A0000',
  },
  sosContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  sosCountdownLabel: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 8,
  },
  sosCountdownNumber: {
    fontSize: 96,
    fontWeight: '200',
    color: Colors.white,
  },
  sosCountdownSub: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  sosDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
  },
});
