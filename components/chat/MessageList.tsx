import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, RefreshControl, ActivityIndicator, View, ViewToken } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface MessageListProps {
  messages: Message[];
  userId?: string;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  isTyping?: boolean;
  onReact: (messageId: string, reaction: string) => void;
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export function MessageList({ 
  messages, 
  userId, 
  loading, 
  onRefresh, 
  refreshing,
  isTyping,
  onReact,
}: MessageListProps) {
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  });

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Handle message visibility changes here
    // For example, mark messages as read when they become visible
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
      </View>
    );
  }

  const renderItem = ({ item: message, index }: { item: Message; index: number }) => (
    <Animated.View
      entering={FadeIn.delay(index * 50)}
      layout={Layout.springify()}
    >
      <MessageBubble
        message={message}
        isOwn={message.sender_id === userId}
        onReact={onReact}
      />
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <AnimatedFlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
          ) : undefined
        }
        contentContainerStyle={styles.list}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: 16,
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