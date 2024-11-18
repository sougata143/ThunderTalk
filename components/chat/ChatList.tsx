import React from 'react';
import { FlatList, StyleSheet, RefreshControl, ActivityIndicator, View } from 'react-native';
import { ChatRoom } from '@/types/chat';
import { ChatRoomItem } from './ChatRoomItem';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface ChatListProps {
  chatRooms: ChatRoom[];
  loading: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ChatList({ chatRooms, loading, onRefresh, refreshing }: ChatListProps) {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={chatRooms}
      keyExtractor={(item) => item.profile.id}
      renderItem={({ item, index }) => (
        <ChatRoomItem chatRoom={item} index={index} />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
        ) : undefined
      }
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
  },
}); 