import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import Colors from '@/constants/colors';
import { useApp } from '@/lib/app-context';
import { EmergencyContact, EMERGENCY_NUMBERS } from '@/lib/storage';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { contacts, setContacts, pin, setPin } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIsPolice, setContactIsPolice] = useState(false);
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const addContact = useCallback(() => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    if (contacts.length >= 10) return;
    const newContact: EmergencyContact = {
      id: Crypto.randomUUID(),
      name: contactName.trim(),
      phone: contactPhone.trim(),
      isPolice: contactIsPolice,
      whatsapp: contactWhatsapp.trim() || undefined,
    };
    setContacts([...contacts, newContact]);
    setContactName('');
    setContactPhone('');
    setContactIsPolice(false);
    setContactWhatsapp('');
    setShowAddContact(false);
    haptic();
  }, [contactName, contactPhone, contactIsPolice, contactWhatsapp, contacts, setContacts, haptic]);

  const removeContact = useCallback(
    (id: string) => {
      setContacts(contacts.filter((c) => c.id !== id));
      haptic();
    },
    [contacts, setContacts, haptic],
  );

  const handleChangePin = useCallback(async () => {
    if (newPin.length !== 4) return;
    if (newPin !== confirmPin) {
      if (Platform.OS === 'web') {
        alert('Os PINs não coincidem');
      } else {
        Alert.alert('Erro', 'Os PINs não coincidem');
      }
      return;
    }
    await setPin(newPin);
    setNewPin('');
    setConfirmPin('');
    setShowChangePin(false);
    haptic();
  }, [newPin, confirmPin, setPin, haptic]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Definições</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Segurança</Text>
          <Pressable
            onPress={() => { setShowChangePin(!showChangePin); haptic(); }}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '30' }]}>
                <Ionicons name="key" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuText}>Alterar PIN</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>

          {showChangePin && (
            <View style={styles.formSection}>
              <TextInput
                style={styles.textInput}
                value={newPin}
                onChangeText={setNewPin}
                placeholder="Novo PIN (4 dígitos)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <TextInput
                style={styles.textInput}
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="Confirmar novo PIN"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
              <Pressable
                onPress={handleChangePin}
                disabled={newPin.length !== 4}
                style={({ pressed }) => [
                  styles.actionBtn,
                  newPin.length !== 4 && styles.btnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.actionBtnText}>Guardar PIN</Text>
              </Pressable>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Contactos de Emergência ({contacts.length}/10)
          </Text>

          {contacts.map((c) => (
            <View key={c.id} style={styles.contactItem}>
              <View style={styles.contactLeft}>
                {c.isPolice ? (
                  <MaterialCommunityIcons name="shield-check" size={18} color={Colors.warning} />
                ) : (
                  <Ionicons name="person" size={18} color={Colors.primary} />
                )}
                <View>
                  <Text style={styles.contactName}>{c.name}</Text>
                  <Text style={styles.contactPhone}>{c.phone}</Text>
                </View>
              </View>
              <Pressable onPress={() => removeContact(c.id)}>
                <Ionicons name="trash-outline" size={20} color={Colors.danger} />
              </Pressable>
            </View>
          ))}

          {contacts.length < 10 && !showAddContact && (
            <Pressable
              onPress={() => { setShowAddContact(true); haptic(); }}
              style={styles.addContactBtn}
            >
              <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.addContactText}>Adicionar Contacto</Text>
            </Pressable>
          )}

          {showAddContact && (
            <View style={styles.formSection}>
              <TextInput
                style={styles.textInput}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Nome"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={styles.textInput}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Telefone"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.textInput}
                value={contactWhatsapp}
                onChangeText={setContactWhatsapp}
                placeholder="WhatsApp (opcional)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
              <Pressable
                onPress={() => { setContactIsPolice(!contactIsPolice); haptic(); }}
                style={styles.checkRow}
              >
                <View style={[styles.checkbox, contactIsPolice && styles.checkboxActive]}>
                  {contactIsPolice && <Ionicons name="checkmark" size={14} color={Colors.white} />}
                </View>
                <Text style={styles.checkLabel}>Contacto policial</Text>
              </Pressable>
              <View style={styles.formActions}>
                <Pressable
                  onPress={() => setShowAddContact(false)}
                  style={[styles.actionBtn, { backgroundColor: Colors.surface }]}
                >
                  <Text style={styles.actionBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={addContact}
                  disabled={!contactName.trim() || !contactPhone.trim()}
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { flex: 1 },
                    (!contactName.trim() || !contactPhone.trim()) && styles.btnDisabled,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.actionBtnText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Info</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Todos os dados são armazenados apenas no seu telefone. Nenhuma informação é enviada para servidores externos.
            </Text>
            <Text style={[styles.infoText, { marginTop: 8 }]}>
              Conforme a Lei de Proteção de Dados Pessoais de Angola e directrizes UN Women/Tech Safety.
            </Text>
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 8,
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  contactPhone: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addContactText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
