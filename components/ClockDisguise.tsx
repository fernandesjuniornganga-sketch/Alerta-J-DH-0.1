import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface ClockDisguiseProps {
  onUnlock: () => void;
  pin: string;
}

export default function ClockDisguise({ onUnlock, pin }: ClockDisguiseProps) {
  const insets = useSafeAreaInsets();
  const [time, setTime] = useState(new Date());
  const [showPinInput, setShowPinInput] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLongPressIn = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      setShowPinInput(true);
      setPinInput('');
      setPinError(false);
    }, 2000);
  }, []);

  const handleLongPressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePinDigit = useCallback(
    (digit: string) => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const newPin = pinInput + digit;
      setPinInput(newPin);
      if (newPin.length === pin.length) {
        if (newPin === pin) {
          onUnlock();
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinInput('');
            setPinError(false);
          }, 500);
        }
      }
    },
    [pinInput, pin, onUnlock],
  );

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('pt-AO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (showPinInput) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
        <View style={styles.pinOverlay}>
          <Text style={styles.pinTitle}>Alarme</Text>
          <Text style={styles.pinSubtitle}>Digite o código</Text>
          <View style={styles.pinDots}>
            {Array.from({ length: pin.length }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  i < pinInput.length && styles.pinDotFilled,
                  pinError && styles.pinDotError,
                ]}
              />
            ))}
          </View>
          <View style={styles.pinPad}>
            {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'x']].map(
              (row, ri) => (
                <View key={ri} style={styles.pinRow}>
                  {row.map((d) => {
                    if (d === '') return <View key="e" style={styles.pinBtn} />;
                    if (d === 'x')
                      return (
                        <Pressable
                          key="x"
                          style={styles.pinBtn}
                          onPress={() => {
                            setShowPinInput(false);
                            setPinInput('');
                          }}
                        >
                          <Ionicons name="close" size={24} color={Colors.white} />
                        </Pressable>
                      );
                    return (
                      <Pressable
                        key={d}
                        style={({ pressed }) => [styles.pinBtn, pressed && { opacity: 0.6 }]}
                        onPress={() => handlePinDigit(d)}
                      >
                        <Text style={styles.pinBtnText}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ),
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.tabs}>
        <Text style={styles.tabInactive}>Alarme</Text>
        <Text style={styles.tabActive}>Relógio</Text>
        <Text style={styles.tabInactive}>Cronómetro</Text>
        <Text style={styles.tabInactive}>Temporizador</Text>
      </View>
      <View style={styles.clockArea}>
        <Pressable
          onPressIn={handleLongPressIn}
          onPressOut={handleLongPressOut}
        >
          <Text style={styles.timeText}>
            {hours}:{minutes}
          </Text>
          <Text style={styles.secondsText}>{seconds}</Text>
        </Pressable>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
        <Pressable style={styles.bottomItem}>
          <Ionicons name="alarm-outline" size={24} color="#888" />
          <Text style={styles.bottomLabel}>Alarme</Text>
        </Pressable>
        <Pressable style={styles.bottomItem}>
          <Ionicons name="globe-outline" size={24} color={Colors.calculator.buttonOrange} />
          <Text style={[styles.bottomLabel, { color: Colors.calculator.buttonOrange }]}>Relógio</Text>
        </Pressable>
        <Pressable style={styles.bottomItem}>
          <Ionicons name="stopwatch-outline" size={24} color="#888" />
          <Text style={styles.bottomLabel}>Cronómetro</Text>
        </Pressable>
        <Pressable style={styles.bottomItem}>
          <Ionicons name="timer-outline" size={24} color="#888" />
          <Text style={styles.bottomLabel}>Temporizador</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  tabActive: {
    color: Colors.calculator.buttonOrange,
    fontSize: 14,
    fontWeight: '600',
  },
  tabInactive: {
    color: '#888',
    fontSize: 14,
  },
  clockArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 4,
  },
  secondsText: {
    fontSize: 24,
    fontWeight: '200',
    color: '#888',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    textTransform: 'capitalize',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  bottomItem: {
    alignItems: 'center',
    gap: 4,
  },
  bottomLabel: {
    fontSize: 10,
    color: '#888',
  },
  pinOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  pinTitle: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#555',
  },
  pinDotFilled: {
    backgroundColor: Colors.calculator.buttonOrange,
    borderColor: Colors.calculator.buttonOrange,
  },
  pinDotError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  pinPad: {
    gap: 12,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 24,
  },
  pinBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBtnText: {
    fontSize: 24,
    color: '#FFF',
  },
});
