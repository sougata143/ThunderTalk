import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { useThemeColor } from '@/hooks/useThemeColor';
import { FilePreview } from './FilePreview';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'image' | 'file', fileUri?: string) => Promise<void>;
}

interface FileUpload {
  uri: string;
  type: 'image' | 'file';
  name?: string;
  progress: number;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [fileUpload, setFileUpload] = useState<FileUpload | null>(null);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'tint');
  const inputRef = useRef<TextInput>(null);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const handleSend = async () => {
    try {
      if (fileUpload) {
        await onSend(
          fileUpload.name || fileUpload.uri.split('/').pop() || '',
          fileUpload.type,
          fileUpload.uri
        );
        setFileUpload(null);
      } else if (message.trim()) {
        await onSend(message, 'text');
        setMessage('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setFileUpload(prev => prev ? { ...prev, progress } : null);
      } else {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        setFileUpload({
          uri: result.assets[0].uri,
          type: 'image',
          progress: 0,
        });
        simulateProgress();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
    setIsPickerVisible(false);
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        setFileUpload({
          uri: result.assets[0].uri,
          type: 'file',
          name: result.assets[0].name,
          progress: 0,
        });
        simulateProgress();
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
    setIsPickerVisible(false);
  };

  return (
    <View>
      {fileUpload && (
        <FilePreview
          {...fileUpload}
          onRemove={() => setFileUpload(null)}
        />
      )}
      <View style={[styles.container, { backgroundColor }]}>
        <TouchableOpacity 
          onPress={() => setIsPickerVisible(!isPickerVisible)} 
          style={styles.button}
        >
          <Ionicons name="add" size={24} color={iconColor} />
        </TouchableOpacity>
        
        {isPickerVisible && (
          <View style={styles.pickerContainer}>
            <TouchableOpacity onPress={handleImagePick} style={styles.pickerButton}>
              <Ionicons name="image" size={24} color={iconColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFilePick} style={styles.pickerButton}>
              <Ionicons name="document" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend}
          style={[
            styles.button,
            (!message.trim() && !fileUpload) && styles.buttonDisabled
          ]}
          disabled={!message.trim() && !fileUpload}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={(!message.trim() && !fileUpload) ? '#666' : iconColor} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  button: {
    padding: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 12,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
}); 