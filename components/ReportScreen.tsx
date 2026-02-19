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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { REPORT_TYPES, PROVINCES_ANGOLA } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';

interface ReportScreenProps {
  onBack: () => void;
}

const AGE_OPTIONS = ['Menos de 12', '12-17', '18-25', '26-35', '36-50', 'Mais de 50', 'Desconhecido'];

export default function ReportScreen({ onBack }: ReportScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'type' | 'details' | 'location' | 'confirm' | 'success'>('type');
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [victimAge, setVictimAge] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const selectedProvince = PROVINCES_ANGOLA.find(p => p.name === province);
  const municipalities = selectedProvince?.municipalities || [];

  const submitReport = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const url = new URL('/api/reports', getApiUrl());
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          description,
          province: province || null,
          municipality: municipality || null,
          victimAge: victimAge || null,
        }),
      });

      if (response.ok) {
        setStep('success');
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        Alert.alert('Erro', 'Não foi possível enviar a denúncia. Tente novamente.');
      }
    } catch {
      Alert.alert('Erro', 'Sem ligação à internet. A denúncia será guardada localmente.');
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedType, description, province, municipality, victimAge]);

  const renderTypeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tipo de violência</Text>
      <Text style={styles.stepDesc}>Selecione o tipo de situação a reportar. A denúncia é completamente anónima.</Text>
      <View style={styles.typeGrid}>
        {REPORT_TYPES.map((type) => (
          <Pressable
            key={type.id}
            onPress={() => { setSelectedType(type.id); haptic(); }}
            style={[styles.typeCard, selectedType === type.id && styles.typeCardActive]}
          >
            <View style={[styles.typeIconWrap, selectedType === type.id && styles.typeIconActive]}>
              <Ionicons
                name={type.icon as any}
                size={24}
                color={selectedType === type.id ? Colors.white : Colors.textSecondary}
              />
            </View>
            <Text style={[styles.typeLabel, selectedType === type.id && { color: Colors.white }]}>
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => selectedType && setStep('details')}
        disabled={!selectedType}
        style={({ pressed }) => [styles.primaryBtn, !selectedType && styles.btnDisabled, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.primaryBtnText}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.white} />
      </Pressable>
    </View>
  );

  const renderDetailsStep = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.stepContent}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepTitle}>Descreva a situação</Text>
        <Text style={styles.stepDesc}>Forneça o máximo de detalhes possível. Não precisa identificar-se.</Text>

        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o que aconteceu, quando e onde..."
          placeholderTextColor={Colors.textMuted}
          multiline
          textAlignVertical="top"
          numberOfLines={6}
        />

        <Text style={styles.inputLabel}>Idade da vítima (opcional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {AGE_OPTIONS.map((age) => (
              <Pressable
                key={age}
                onPress={() => { setVictimAge(age); haptic(); }}
                style={[styles.chip, victimAge === age && styles.chipActive]}
              >
                <Text style={[styles.chipText, victimAge === age && styles.chipTextActive]}>{age}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Pressable
          onPress={() => description.trim().length >= 10 && setStep('location')}
          disabled={description.trim().length < 10}
          style={({ pressed }) => [
            styles.primaryBtn,
            { marginTop: 24 },
            description.trim().length < 10 && styles.btnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={styles.primaryBtnText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
        {description.trim().length > 0 && description.trim().length < 10 && (
          <Text style={styles.hintText}>Mínimo 10 caracteres</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderLocationStep = () => (
    <ScrollView
      style={styles.stepContent}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Localização (opcional)</Text>
      <Text style={styles.stepDesc}>Onde ocorreu a situação? Pode saltar se preferir não indicar.</Text>

      <Text style={styles.inputLabel}>Província</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {PROVINCES_ANGOLA.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => { setProvince(p.name); setMunicipality(''); haptic(); }}
              style={[styles.chip, province === p.name && styles.chipActive]}
            >
              <Text style={[styles.chipText, province === p.name && styles.chipTextActive]}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {municipalities.length > 0 && (
        <>
          <Text style={styles.inputLabel}>Município</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {municipalities.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => { setMunicipality(m); haptic(); }}
                  style={[styles.chip, municipality === m && styles.chipActive]}
                >
                  <Text style={[styles.chipText, municipality === m && styles.chipTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </>
      )}

      <View style={styles.btnRow}>
        <Pressable
          onPress={() => setStep('confirm')}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.secondaryBtnText}>Saltar</Text>
        </Pressable>
        <Pressable
          onPress={() => setStep('confirm')}
          style={({ pressed }) => [styles.primaryBtn, { flex: 1 }, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.primaryBtnText}>Continuar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const renderConfirmStep = () => {
    const typeObj = REPORT_TYPES.find(t => t.id === selectedType);
    return (
      <ScrollView
        style={styles.stepContent}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.stepTitle}>Confirmar denúncia</Text>
        <Text style={styles.stepDesc}>Verifique os dados antes de enviar. A denúncia é anónima.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tipo</Text>
            <Text style={styles.summaryValue}>{typeObj?.label}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Descrição</Text>
            <Text style={styles.summaryValue} numberOfLines={3}>{description}</Text>
          </View>
          {province ? (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Local</Text>
                <Text style={styles.summaryValue}>
                  {municipality ? `${municipality}, ` : ''}{province}
                </Text>
              </View>
            </>
          ) : null}
          {victimAge ? (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Idade</Text>
                <Text style={styles.summaryValue}>{victimAge}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
          <Text style={styles.privacyText}>
            Nenhum dado pessoal é recolhido. A denúncia é completamente anónima.
          </Text>
        </View>

        <Pressable
          onPress={submitReport}
          disabled={isSubmitting}
          style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }, isSubmitting && styles.btnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={Colors.white} />
              <Text style={styles.submitBtnText}>Enviar Denúncia</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    );
  };

  const renderSuccess = () => (
    <View style={styles.centerContent}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={48} color={Colors.success} />
      </View>
      <Text style={styles.successTitle}>Denúncia Enviada</Text>
      <Text style={styles.successDesc}>
        A sua denúncia foi registada com sucesso. Obrigado pela sua coragem. Juntos podemos combater a violência.
      </Text>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.primaryBtn, { marginTop: 32, width: '100%' }, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.primaryBtnText}>Voltar</Text>
      </Pressable>
    </View>
  );

  const currentStepIndex = ['type', 'details', 'location', 'confirm'].indexOf(step);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (step === 'type' || step === 'success') {
              onBack();
            } else {
              const steps: Array<typeof step> = ['type', 'details', 'location', 'confirm'];
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1]);
            }
          }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Denúncia Anónima</Text>
        <View style={{ width: 40 }} />
      </View>

      {step !== 'success' && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentStepIndex + 1) / 4) * 100}%` }]} />
        </View>
      )}

      {step === 'type' && renderTypeStep()}
      {step === 'details' && renderDetailsStep()}
      {step === 'location' && renderLocationStep()}
      {step === 'confirm' && renderConfirmStep()}
      {step === 'success' && renderSuccess()}
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
    fontWeight: '700',
    color: Colors.white,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  typeCard: {
    width: '47%' as any,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '25',
  },
  typeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconActive: {
    backgroundColor: Colors.primary,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
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
  textArea: {
    minHeight: 140,
    paddingTop: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDark + '30',
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: Colors.surface,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryRow: {
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.white,
    lineHeight: 22,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.success + '12',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.success + '25',
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.success,
    lineHeight: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
