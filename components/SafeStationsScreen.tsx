import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { SafeStation } from '@/lib/storage';
import { makeCall } from '@/lib/alerts';

interface SafeStationsScreenProps {
  onBack: () => void;
}

export default function SafeStationsScreen({ onBack }: SafeStationsScreenProps) {
  const insets = useSafeAreaInsets();
  const { safeStations, setSafeStations } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<SafeStation['type']>('custom');
  const [filter, setFilter] = useState<string | null>(null);

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const getIcon = (t: string) => {
    switch (t) {
      case 'hospital': return 'medkit';
      case 'police': return 'shield-checkmark';
      case 'ngo': return 'heart';
      case 'shelter': return 'home';
      default: return 'location';
    }
  };

  const getColor = (t: string) => {
    switch (t) {
      case 'hospital': return '#4CAF50';
      case 'police': return '#2196F3';
      case 'ngo': return '#E91E63';
      case 'shelter': return '#FF9800';
      default: return Colors.textSecondary;
    }
  };

  const getLabel = (t: string) => {
    switch (t) {
      case 'hospital': return 'Hospital';
      case 'police': return 'Polícia';
      case 'ngo': return 'ONG';
      case 'shelter': return 'Abrigo';
      default: return 'Outro';
    }
  };

  const addStation = useCallback(() => {
    if (!name.trim() || !address.trim()) return;
    const newStation: SafeStation = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      latitude: 0,
      longitude: 0,
      type,
      isCustom: true,
    };
    setSafeStations([...safeStations, newStation]);
    setName('');
    setAddress('');
    setPhone('');
    setShowAdd(false);
    haptic();
  }, [name, address, phone, type, safeStations, setSafeStations, haptic]);

  const removeStation = useCallback(
    (id: string) => {
      setSafeStations(safeStations.filter((s) => s.id !== id));
      haptic();
    },
    [safeStations, setSafeStations, haptic],
  );

  const filtered = filter ? safeStations.filter((s) => s.type === filter) : safeStations;
  const types = ['hospital', 'police', 'ngo', 'shelter', 'custom'];

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Postos Seguros</Text>
        <Pressable onPress={() => { setShowAdd(!showAdd); haptic(); }} style={styles.backBtn}>
          <Ionicons name={showAdd ? 'close' : 'add'} size={22} color={Colors.white} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          onPress={() => { setFilter(null); haptic(); }}
          style={[styles.filterChip, !filter && styles.filterChipActive]}
        >
          <Text style={[styles.filterText, !filter && styles.filterTextActive]}>Todos</Text>
        </Pressable>
        {types.map((t) => (
          <Pressable
            key={t}
            onPress={() => { setFilter(filter === t ? null : t); haptic(); }}
            style={[styles.filterChip, filter === t && styles.filterChipActive]}
          >
            <Ionicons name={getIcon(t) as any} size={14} color={filter === t ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.filterText, filter === t && styles.filterTextActive]}>{getLabel(t)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {showAdd && (
            <View style={styles.addForm}>
              <Text style={styles.formTitle}>Adicionar Posto</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Nome do local"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={styles.textInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Endereço"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefone (opcional)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeRow}>
                  {types.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => { setType(t as SafeStation['type']); haptic(); }}
                      style={[styles.typeChip, type === t && { borderColor: getColor(t) }]}
                    >
                      <Text style={[styles.typeText, type === t && { color: getColor(t) }]}>{getLabel(t)}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Pressable
                onPress={addStation}
                disabled={!name.trim() || !address.trim()}
                style={({ pressed }) => [
                  styles.saveBtn,
                  (!name.trim() || !address.trim()) && styles.btnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </Pressable>
            </View>
          )}

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum posto encontrado</Text>
            </View>
          ) : (
            filtered.map((s) => (
              <View key={s.id} style={styles.stationCard}>
                <View style={[styles.stationBadge, { backgroundColor: getColor(s.type) + '20' }]}>
                  <Ionicons name={getIcon(s.type) as any} size={22} color={getColor(s.type)} />
                </View>
                <View style={styles.stationInfo}>
                  <Text style={styles.stationName}>{s.name}</Text>
                  <Text style={styles.stationAddr}>{s.address}</Text>
                  <View style={styles.stationMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: getColor(s.type) + '20' }]}>
                      <Text style={[styles.typeBadgeText, { color: getColor(s.type) }]}>{getLabel(s.type)}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.stationActions}>
                  {s.phone && (
                    <Pressable
                      onPress={() => makeCall(s.phone!)}
                      style={styles.stationActionBtn}
                    >
                      <Ionicons name="call" size={18} color={Colors.success} />
                    </Pressable>
                  )}
                  {s.isCustom && (
                    <Pressable
                      onPress={() => removeStation(s.id)}
                      style={styles.stationActionBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  filterBar: {
    maxHeight: 48,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  addForm: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  stationBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  stationAddr: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  stationMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stationActions: {
    gap: 8,
  },
  stationActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
