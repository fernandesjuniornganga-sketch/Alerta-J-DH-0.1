import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface PinPadProps {
  title?: string;
  subtitle?: string;
  pinLength?: number;
  onComplete: (pin: string) => void;
  error?: string;
}

export default function PinPad({
  title = 'Digite o PIN',
  subtitle,
  pinLength = 4,
  onComplete,
  error,
}: PinPadProps) {
  const [pin, setPin] = useState('');

  const handlePress = useCallback(
    (digit: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === pinLength) {
        onComplete(newPin);
        setTimeout(() => setPin(''), 300);
      }
    },
    [pin, pinLength, onComplete],
  );

  const handleDelete = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPin((p) => p.slice(0, -1));
  }, []);

  const dots = Array.from({ length: pinLength }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        i < pin.length && styles.dotFilled,
        !!error && styles.dotError,
      ]}
    />
  ));

  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.dotsRow}>{dots}</View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.pad}>
        {buttons.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn) => {
              if (btn === '') return <View key="empty" style={styles.btnEmpty} />;
              if (btn === 'delete') {
                return (
                  <Pressable
                    key="del"
                    onPress={handleDelete}
                    style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                  >
                    <Ionicons name="backspace-outline" size={28} color={Colors.white} />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={btn}
                  onPress={() => handlePress(btn)}
                  style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                >
                  <Text style={styles.btnText}>{btn}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.textSecondary,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotError: {
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  pad: {
    marginTop: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 24,
  },
  btn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    backgroundColor: Colors.surfaceLight,
    transform: [{ scale: 0.95 }],
  },
  btnEmpty: {
    width: 72,
    height: 72,
  },
  btnText: {
    fontSize: 28,
    fontWeight: '400',
    color: Colors.white,
  },
});
