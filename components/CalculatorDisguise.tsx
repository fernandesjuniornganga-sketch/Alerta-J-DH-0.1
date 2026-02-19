import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface CalculatorDisguiseProps {
  onUnlock: () => void;
  pin: string;
}

export default function CalculatorDisguise({ onUnlock, pin }: CalculatorDisguiseProps) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [inputSequence, setInputSequence] = useState('');

  const haptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleNumber = useCallback(
    (num: string) => {
      haptic();
      const newSeq = inputSequence + num;
      setInputSequence(newSeq);

      if (waitingForNext) {
        setDisplay(num);
        setWaitingForNext(false);
      } else {
        setDisplay(display === '0' ? num : display + num);
      }
    },
    [display, waitingForNext, inputSequence, haptic],
  );

  const handleOperation = useCallback(
    (op: string) => {
      haptic();
      const current = parseFloat(display);

      if (op === '=') {
        const newSeq = inputSequence + '=';
        if (newSeq.includes(pin + '=')) {
          onUnlock();
          return;
        }
        setInputSequence(newSeq);

        if (prevValue !== null && operation) {
          let result = 0;
          switch (operation) {
            case '+': result = prevValue + current; break;
            case '-': result = prevValue - current; break;
            case '×': result = prevValue * current; break;
            case '÷': result = current !== 0 ? prevValue / current : 0; break;
          }
          setDisplay(String(result));
          setPrevValue(null);
          setOperation(null);
        }
        return;
      }

      if (op === 'AC') {
        setDisplay('0');
        setPrevValue(null);
        setOperation(null);
        setWaitingForNext(false);
        setInputSequence('');
        return;
      }

      if (op === '±') {
        setDisplay(String(parseFloat(display) * -1));
        return;
      }

      if (op === '%') {
        setDisplay(String(parseFloat(display) / 100));
        return;
      }

      if (op === '.') {
        if (!display.includes('.')) {
          setDisplay(display + '.');
        }
        return;
      }

      setPrevValue(current);
      setOperation(op);
      setWaitingForNext(true);
      setInputSequence(inputSequence + op);
    },
    [display, prevValue, operation, inputSequence, pin, onUnlock, haptic],
  );

  const formatDisplay = (val: string) => {
    if (val.length > 9) return val.slice(0, 9);
    return val;
  };

  const buttons = [
    [
      { label: 'AC', type: 'func' },
      { label: '±', type: 'func' },
      { label: '%', type: 'func' },
      { label: '÷', type: 'op' },
    ],
    [
      { label: '7', type: 'num' },
      { label: '8', type: 'num' },
      { label: '9', type: 'num' },
      { label: '×', type: 'op' },
    ],
    [
      { label: '4', type: 'num' },
      { label: '5', type: 'num' },
      { label: '6', type: 'num' },
      { label: '-', type: 'op' },
    ],
    [
      { label: '1', type: 'num' },
      { label: '2', type: 'num' },
      { label: '3', type: 'num' },
      { label: '+', type: 'op' },
    ],
    [
      { label: '0', type: 'num', wide: true },
      { label: '.', type: 'num' },
      { label: '=', type: 'op' },
    ],
  ];

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text
          style={[
            styles.displayText,
            display.length > 6 && { fontSize: 48 },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatDisplay(display)}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        {buttons.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn) => {
              const isOp = btn.type === 'op';
              const isFunc = btn.type === 'func';
              const isActive = isOp && operation === btn.label && waitingForNext;
              return (
                <Pressable
                  key={btn.label}
                  onPress={() =>
                    btn.type === 'num'
                      ? handleNumber(btn.label)
                      : handleOperation(btn.label)
                  }
                  style={({ pressed }) => [
                    styles.button,
                    (btn as { wide?: boolean }).wide && styles.buttonWide,
                    isOp && styles.buttonOp,
                    isFunc && styles.buttonFunc,
                    isActive && styles.buttonOpActive,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isFunc && styles.buttonFuncText,
                      isActive && styles.buttonOpActiveText,
                    ]}
                  >
                    {btn.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const BUTTON_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.calculator.bg,
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  displayContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 120,
  },
  displayText: {
    fontSize: 64,
    fontWeight: '300',
    color: Colors.calculator.text,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.calculator.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWide: {
    width: BUTTON_SIZE * 2 + 12,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  buttonOp: {
    backgroundColor: Colors.calculator.buttonOrange,
  },
  buttonFunc: {
    backgroundColor: Colors.calculator.buttonGray,
  },
  buttonOpActive: {
    backgroundColor: Colors.white,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.white,
  },
  buttonFuncText: {
    color: Colors.black,
  },
  buttonOpActiveText: {
    color: Colors.calculator.buttonOrange,
  },
});
