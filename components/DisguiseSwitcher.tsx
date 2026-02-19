import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { DisguiseType } from '@/lib/storage';

interface DisguiseSwitcherProps {
  onBack: () => void;
}

const DISGUISES: {
  id: DisguiseType;
  name: string;
  icon: string;
  desc: string;
  instruction: string;
}[] = [
  {
    id: 'calculator',
    name: 'Calculadora Simples',
    icon: 'calculator-outline',
    desc: 'App de calculadora funcional',
    instruction: 'Digite o seu PIN seguido de = para desbloquear',
  },
  {
    id: 'notes',
    name: 'Bloco de Notas',
    icon: 'document-text-outline',
    desc: 'App de anotações',
    instruction: 'Escreva o seu PIN seguido de #AJ no texto',
  },
  {
    id: 'clock',
    name: 'Relógio',
    icon: 'time-outline',
    desc: 'App de relógio mundial',
    instruction: 'Segure a hora por 2 segundos e depois digite o PIN',
  },
];

export default function DisguiseSwitcher({ onBack }: DisguiseSwitcherProps) {
  const insets = useSafeAreaInsets();
  const { activeDisguise, setActiveDisguise, lock } = useApp();

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleSelect = useCallback(
    async (id: DisguiseType) => {
      haptic();
      await setActiveDisguise(id);
      lock();
    },
    [setActiveDisguise, lock, haptic],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Trocar Disfarce</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Escolha como o app aparece. Depois de aplicar, o app será bloqueado automaticamente.
        </Text>

        {DISGUISES.map((d) => {
          const isActive = activeDisguise === d.id;
          return (
            <Pressable
              key={d.id}
              onPress={() => handleSelect(d.id)}
              style={({ pressed }) => [
                styles.disguiseCard,
                isActive && styles.disguiseCardActive,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.disguiseIcon, isActive && styles.disguiseIconActive]}>
                <Ionicons
                  name={d.icon as any}
                  size={30}
                  color={isActive ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={styles.disguiseInfo}>
                <View style={styles.disguiseNameRow}>
                  <Text style={[styles.disguiseName, isActive && { color: Colors.white }]}>
                    {d.name}
                  </Text>
                  {isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.disguiseDesc}>{d.desc}</Text>
                <View style={styles.instructionBox}>
                  <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.instructionText}>{d.instruction}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
          <Text style={styles.infoText}>
            O disfarce protege a sua privacidade. Qualquer pessoa que abra o app verá apenas a aplicação de disfarce.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  disguiseCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 16,
  },
  disguiseCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '15',
  },
  disguiseIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disguiseIconActive: {
    backgroundColor: Colors.primary + '20',
  },
  disguiseInfo: {
    flex: 1,
  },
  disguiseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  disguiseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  disguiseDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
