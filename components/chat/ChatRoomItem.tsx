import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ChatRoom } from '@/types/chat';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  index: number;
}

export function ChatRoomItem({ chatRoom, index }: ChatRoomItemProps) {
  const { profile, lastMessage, unreadCount } = chatRoom;
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'subtitle');

  const handlePress = () => {
    router.push(`/chat/${profile.id}`);
  };

  const getMessagePreview = () => {
    if (!lastMessage) return '';
    switch (lastMessage.content_type) {
      case 'image':
        return '📷 Photo';
      case 'file':
        return '📎 File';
      default:
        return lastMessage.content;
    }
  };

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100)}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <ThemedText style={styles.avatarText}>
                {profile.full_name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          {profile.is_online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {profile.full_name}
              {profile.is_guest && (
                <ThemedText style={styles.guestLabel}> (Guest)</ThemedText>
              )}
            </ThemedText>
            {lastMessage && (
              <ThemedText style={styles.time}>
                {format(new Date(lastMessage.created_at), 'HH:mm')}
              </ThemedText>
            )}
          </View>

          <View style={styles.messageContainer}>
            {lastMessage?.sender_id === profile.id && !lastMessage.is_read && (
              <View style={styles.unreadDot} />
            )}
            <ThemedText
              style={[
                styles.message,
                { color: unreadCount > 0 ? textColor : subtitleColor },
              ]}
              numberOfLines={1}
            >
              {getMessagePreview()}
            </ThemedText>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>
                  {unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  defaultAvatar: {
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
    marginRight: 6,
  },
  badge: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  guestLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
}); 