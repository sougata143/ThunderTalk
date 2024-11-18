import React, { useState } from 'react';
import { StyleSheet, View, Image, Pressable, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Animated, { 
  FadeIn,
  FadeInRight,
  FadeInLeft,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Message } from '@/types/chat';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact: (messageId: string, reaction: string) => void;
}

export function MessageBubble({ message, isOwn, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const backgroundColor = useThemeColor(
    { light: isOwn ? '#0a7ea4' : '#e5e7eb', dark: isOwn ? '#0a7ea4' : '#374151' },
    'background'
  );

  const textColor = isOwn ? '#fff' : undefined;
  const iconColor = isOwn ? '#fff' : useThemeColor({}, 'text');

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(showReactions ? 1 : 0, {
          damping: 12,
          stiffness: 120,
        }),
      },
    ],
  }));

  const getStatusIcon = () => {
    if (!isOwn) return null;

    if (message.is_read) {
      return <Ionicons name="checkmark-done" size={16} color={iconColor} />;
    }
    return <Ionicons name="checkmark" size={16} color={iconColor} />;
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleReact = (reaction: string) => {
    onReact(message.id, reaction);
    setShowReactions(false);
  };

  const renderReactions = () => {
    if (!message.reactions) return null;
    
    return (
      <View style={[styles.reactionsContainer, isOwn && styles.reactionsContainerOwn]}>
        {Object.entries(message.reactions).map(([reaction, count]) => (
          <View key={reaction} style={styles.reactionBadge}>
            <ThemedText style={styles.reactionEmoji}>{reaction}</ThemedText>
            <ThemedText style={styles.reactionCount}>{count}</ThemedText>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (message.content_type) {
      case 'image':
        return (
          <Animated.Image
            entering={isOwn ? FadeInRight : FadeInLeft}
            source={{ uri: message.file_url }}
            style={styles.image}
            resizeMode="cover"
          />
        );
      case 'file':
        return (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(message.file_url!)}
            style={styles.fileContainer}>
            <Ionicons name="document" size={24} color={textColor} />
            <ThemedText style={[styles.text, textColor ? { color: textColor } : undefined]}>
              {message.content}
            </ThemedText>
          </Pressable>
        );
      default:
        return (
          <ThemedText style={[styles.text, textColor ? { color: textColor } : undefined]}>
            {message.content}
          </ThemedText>
        );
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      style={[styles.container, isOwn && styles.ownMessage]}
    >
      <Animated.View
        entering={isOwn ? FadeInRight : FadeInLeft}
        style={[styles.bubble, { backgroundColor }]}
      >
        {renderContent()}
        {renderReactions()}
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText style={styles.time}>
          {format(new Date(message.created_at), 'HH:mm')}
        </ThemedText>
        {getStatusIcon()}
      </View>

      {showReactions && (
        <Animated.View style={[styles.reactionsPanel, animatedStyle]}>
          {REACTIONS.map((reaction) => (
            <TouchableOpacity
              key={reaction}
              onPress={() => handleReact(reaction)}
              style={styles.reactionButton}
            >
              <ThemedText style={styles.reactionEmoji}>{reaction}</ThemedText>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 8,
    alignItems: 'flex-start',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionsPanel: {
    position: 'absolute',
    top: -45,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionButton: {
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionsContainerOwn: {
    justifyContent: 'flex-end',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 2,
  },
}); 