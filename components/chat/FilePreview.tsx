import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface FilePreviewProps {
  uri: string;
  type: 'image' | 'file';
  name?: string;
  onRemove: () => void;
  progress?: number;
}

export function FilePreview({ uri, type, name, onRemove, progress }: FilePreviewProps) {
  const iconColor = useThemeColor({}, 'text');

  return (
    <Animated.View 
      entering={FadeIn}
      style={styles.container}
    >
      {type === 'image' ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={styles.fileContainer}>
          <Ionicons name="document" size={24} color={iconColor} />
          <ThemedText numberOfLines={1} style={styles.fileName}>
            {name || uri.split('/').pop()}
          </ThemedText>
        </View>
      )}

      {progress !== undefined && progress < 100 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      )}

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={onRemove}
      >
        <Ionicons name="close-circle" size={24} color="#ef4444" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0a7ea4',
  },
}); 