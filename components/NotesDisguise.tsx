import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

interface NotesDisguiseProps {
  onUnlock: () => void;
  pin: string;
}

export default function NotesDisguise({ onUnlock, pin }: NotesDisguiseProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const checkUnlock = useCallback(
    (text: string) => {
      const trigger = '#AJ';
      if (text.includes(pin + trigger)) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onUnlock();
      }
    },
    [pin, onUnlock],
  );

  const handleContentChange = useCallback(
    (text: string) => {
      setContent(text);
      checkUnlock(text);
    },
    [checkUnlock],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.headerBack}>Notas</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="share-outline" size={22} color="#007AFF" />
          <Ionicons name="ellipsis-horizontal-circle-outline" size={22} color="#007AFF" />
        </View>
      </View>
      <ScrollView style={styles.content} keyboardDismissMode="interactive">
        <TextInput
          style={styles.titleInput}
          placeholder="Título"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          multiline
        />
        <TextInput
          style={styles.bodyInput}
          placeholder="Comece a escrever..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={handleContentChange}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
      <View style={[styles.toolbar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) }]}>
        <Pressable>
          <Ionicons name="checkbox-outline" size={22} color="#007AFF" />
        </Pressable>
        <Pressable>
          <Ionicons name="camera-outline" size={22} color="#007AFF" />
        </Pressable>
        <Pressable>
          <Ionicons name="pencil-outline" size={22} color="#007AFF" />
        </Pressable>
        <Text style={styles.toolbarText}>0 caracteres</Text>
        <Pressable>
          <Ionicons name="create-outline" size={22} color="#007AFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBack: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    padding: 0,
  },
  bodyInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 300,
    padding: 0,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  toolbarText: {
    fontSize: 12,
    color: '#999',
  },
});
