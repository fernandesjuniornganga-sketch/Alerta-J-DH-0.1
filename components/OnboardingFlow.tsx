import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
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
import { EmergencyContact, DisguiseType, EMERGENCY_NUMBERS, PROVINCES_ANGOLA } from '@/lib/storage';
import PinPad from './PinPad';

type Step = 'welcome' | 'age' | 'location' | 'pin' | 'pin_confirm' | 'contacts' | 'disguise' | 'done';

const AGE_RANGES = ['Menos de 12', '12-17', '18-25', '26-35', '36-50', 'Mais de 50'];
const PROVINCES = PROVINCES_ANGOLA.map(p => p.name);

const DISGUISES: { id: DisguiseType; name: string; icon: string; desc: string }[] = [
  { id: 'calculator', name: 'Calculadora', icon: 'calculator-outline', desc: 'PIN + =' },
  { id: 'notes', name: 'Bloco de Notas', icon: 'document-text-outline', desc: 'PIN + #AJ no texto' },
  { id: 'clock', name: 'Relógio', icon: 'time-outline', desc: 'Segurar hora + PIN' },
];

export default function OnboardingFlow() {
  const insets = useSafeAreaInsets();
  const {
    setIsOnboarded,
    setIsUnlocked,
    setPin: savePin,
    setProfile,
    setContacts: saveContacts,
    setActiveDisguise,
  } = useApp();

  const [step, setStep] = useState<Step>('welcome');
  const [ageRange, setAgeRange] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIsPolice, setContactIsPolice] = useState(false);
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [disguise, setDisguise] = useState<DisguiseType>('calculator');

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const goNext = useCallback((nextStep: Step) => {
    haptic();
    setStep(nextStep);
  }, [haptic]);

  const handlePinSet = useCallback((p: string) => {
    setPin(p);
    goNext('pin_confirm');
  }, [goNext]);

  const handlePinConfirm = useCallback(
    (p: string) => {
      if (p === pin) {
        goNext('contacts');
      } else {
        setPinError('PINs não coincidem. Tente novamente.');
        setTimeout(() => setPinError(''), 2000);
      }
    },
    [pin, goNext],
  );

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
    haptic();
  }, [contactName, contactPhone, contactIsPolice, contactWhatsapp, contacts, haptic]);

  const removeContact = useCallback(
    (id: string) => {
      setContacts(contacts.filter((c) => c.id !== id));
      haptic();
    },
    [contacts, haptic],
  );

  const canProceedContacts = () => {
    if (contacts.length < 1) return false;
    return contacts.some(
      (c) =>
        c.isPolice ||
        c.phone === EMERGENCY_NUMBERS.policia ||
        c.phone === EMERGENCY_NUMBERS.bombeiros ||
        c.phone === EMERGENCY_NUMBERS.crianca ||
        c.phone === EMERGENCY_NUMBERS.mulher ||
        c.phone === '113' ||
        c.phone === '190' ||
        c.phone === '145' ||
        c.phone === '180',
    );
  };

  const finishOnboarding = useCallback(async () => {
    haptic();
    await savePin(pin);
    await setProfile({ ageRange, province, city });
    await saveContacts(contacts);
    await setActiveDisguise(disguise);
    setIsOnboarded(true);
    setIsUnlocked(true);
  }, [pin, ageRange, province, city, contacts, disguise, haptic]);

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-check" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Bem-vindo(a)</Text>
            <Text style={styles.welcomeDesc}>
              Este app foi criado para a sua protecção. Parece uma app normal, mas dentro esconde uma ferramenta de alerta de emergência.
            </Text>
            <Text style={styles.welcomeNote}>
              Os seus dados ficam apenas no seu telefone. Nenhuma informação é enviada para servidores.
            </Text>
            <Pressable
              onPress={() => goNext('age')}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryBtnText}>Começar</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </Pressable>
          </View>
        );

      case 'age':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Qual é a sua faixa etária?</Text>
            <Text style={styles.stepDesc}>Esta informação fica apenas no seu telefone</Text>
            <View style={styles.optionsGrid}>
              {AGE_RANGES.map((age) => (
                <Pressable
                  key={age}
                  onPress={() => { setAgeRange(age); haptic(); }}
                  style={[styles.optionChip, ageRange === age && styles.optionChipActive]}
                >
                  <Text style={[styles.optionText, ageRange === age && styles.optionTextActive]}>
                    {age}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => ageRange && goNext('location')}
              disabled={!ageRange}
              style={({ pressed }) => [
                styles.primaryBtn,
                !ageRange && styles.btnDisabled,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.primaryBtnText}>Continuar</Text>
            </Pressable>
          </View>
        );

      case 'location':
        return (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={styles.stepContent} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={styles.stepTitle}>Onde está?</Text>
              <Text style={styles.stepDesc}>Para encontrar postos seguros perto de si</Text>
              <Text style={styles.inputLabel}>Província</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                <View style={styles.chipRow}>
                  {PROVINCES.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => { setProvince(p); haptic(); }}
                      style={[styles.optionChip, province === p && styles.optionChipActive]}
                    >
                      <Text style={[styles.optionText, province === p && styles.optionTextActive]}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Text style={styles.inputLabel}>Cidade/Bairro</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="Ex: Maianga, Viana, Cazenga..."
                placeholderTextColor={Colors.textMuted}
              />
              <Pressable
                onPress={() => province && goNext('pin')}
                disabled={!province}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { marginTop: 24 },
                  !province && styles.btnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'pin':
        return (
          <PinPad
            title="Crie o seu PIN"
            subtitle="Este PIN desbloqueia o modo de emergência"
            onComplete={handlePinSet}
          />
        );

      case 'pin_confirm':
        return (
          <PinPad
            title="Confirme o PIN"
            subtitle="Digite o mesmo PIN novamente"
            onComplete={handlePinConfirm}
            error={pinError}
          />
        );

      case 'contacts':
        return (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.stepContent}
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.stepTitle}>Contactos de Emergência</Text>
              <Text style={styles.stepDesc}>
                Adicione 1 a 10 contactos. Pelo menos 1 deve ser policial (113/190/145/180).
              </Text>

              {contacts.map((c) => (
                <View key={c.id} style={styles.contactItem}>
                  <View style={styles.contactItemLeft}>
                    {c.isPolice ? (
                      <MaterialCommunityIcons name="shield-check" size={18} color={Colors.warning} />
                    ) : (
                      <Ionicons name="person" size={18} color={Colors.primary} />
                    )}
                    <View>
                      <Text style={styles.contactItemName}>{c.name}</Text>
                      <Text style={styles.contactItemPhone}>{c.phone}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => removeContact(c.id)}>
                    <Ionicons name="close-circle" size={22} color={Colors.danger} />
                  </Pressable>
                </View>
              ))}

              {contacts.length < 10 && (
                <View style={styles.addContactForm}>
                  <TextInput
                    style={styles.textInput}
                    value={contactName}
                    onChangeText={setContactName}
                    placeholder="Nome do contacto"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="Número de telefone"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={styles.textInput}
                    value={contactWhatsapp}
                    onChangeText={setContactWhatsapp}
                    placeholder="WhatsApp (opcional, com código país)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                  />
                  <Pressable
                    onPress={() => { setContactIsPolice(!contactIsPolice); haptic(); }}
                    style={styles.checkRow}
                  >
                    <View style={[styles.checkbox, contactIsPolice && styles.checkboxActive]}>
                      {contactIsPolice && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                    </View>
                    <Text style={styles.checkLabel}>Este é um contacto policial</Text>
                  </Pressable>
                  <Pressable
                    onPress={addContact}
                    disabled={!contactName.trim() || !contactPhone.trim()}
                    style={({ pressed }) => [
                      styles.addBtn,
                      (!contactName.trim() || !contactPhone.trim()) && styles.btnDisabled,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="add" size={20} color={Colors.white} />
                    <Text style={styles.addBtnText}>Adicionar Contacto</Text>
                  </Pressable>
                </View>
              )}

              <Pressable
                onPress={() => canProceedContacts() && goNext('disguise')}
                disabled={!canProceedContacts()}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { marginTop: 24 },
                  !canProceedContacts() && styles.btnDisabled,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
              </Pressable>
              {!canProceedContacts() && contacts.length > 0 && (
                <Text style={styles.warningText}>
                  Adicione pelo menos 1 contacto policial ou marque um existente como policial
                </Text>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        );

      case 'disguise':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Escolha o disfarce</Text>
            <Text style={styles.stepDesc}>
              O app aparecerá como esta aplicação no seu telefone. Só você saberá o que realmente é.
            </Text>
            {DISGUISES.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => { setDisguise(d.id); haptic(); }}
                style={[styles.disguiseOption, disguise === d.id && styles.disguiseOptionActive]}
              >
                <View style={styles.disguiseIcon}>
                  <Ionicons name={d.icon as any} size={28} color={disguise === d.id ? Colors.primary : Colors.textSecondary} />
                </View>
                <View style={styles.disguiseInfo}>
                  <Text style={[styles.disguiseName, disguise === d.id && { color: Colors.white }]}>{d.name}</Text>
                  <Text style={styles.disguiseDesc}>Desbloquear: {d.desc}</Text>
                </View>
                {disguise === d.id && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={finishOnboarding}
              style={({ pressed }) => [styles.primaryBtn, { marginTop: 24 }, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryBtnText}>Concluir</Text>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
            </Pressable>
          </View>
        );

      default:
        return null;
    }
  };

  const stepNumber = ['welcome', 'age', 'location', 'pin', 'pin_confirm', 'contacts', 'disguise'].indexOf(step);
  const totalSteps = 7;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      {step !== 'welcome' && step !== 'pin' && step !== 'pin_confirm' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(stepNumber / totalSteps) * 100}%` }]} />
        </View>
      )}
      {step !== 'welcome' && step !== 'pin' && step !== 'pin_confirm' && (
        <Pressable
          onPress={() => {
            const steps: Step[] = ['welcome', 'age', 'location', 'pin', 'pin_confirm', 'contacts', 'disguise'];
            const idx = steps.indexOf(step);
            if (idx > 0) setStep(steps[idx - 1]);
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
      )}
      {renderStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  backBtn: {
    padding: 16,
    width: 56,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
  },
  welcomeDesc: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  welcomeNote: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  optionChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '30',
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: Colors.white,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  horizontalScroll: {
    marginBottom: 12,
    maxHeight: 60,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  btnDisabled: {
    opacity: 0.4,
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
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  contactItemPhone: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addContactForm: {
    marginTop: 16,
    gap: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: 8,
  },
  disguiseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 14,
  },
  disguiseOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '20',
  },
  disguiseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disguiseInfo: {
    flex: 1,
  },
  disguiseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  disguiseDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
