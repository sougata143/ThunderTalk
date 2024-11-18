import React, { useEffect, useState } from 'react';
import { StyleSheet, View, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { ThemedView } from '@/components/ThemedView';
import { ChatList } from '@/components/chat/ChatList';
import { ChatRoom } from '@/types/chat';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from '@/components/chat/SearchBar';
import { FloatingButton } from '@/components/common/FloatingButton';

export default function ChatsScreen() {
  const { session } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchChatRooms();
    subscribeToMessages();
  }, [session]);

  const fetchChatRooms = async () => {
    if (!session?.user) return;

    try {
      // Fetch all messages to build chat rooms
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by chat partner
      const roomsMap = new Map<string, ChatRoom>();
      messages?.forEach((message) => {
        const partner = message.sender_id === session.user.id ? message.receiver : message.sender;
        const partnerId = partner.id;

        if (!roomsMap.has(partnerId)) {
          roomsMap.set(partnerId, {
            profile: partner,
            lastMessage: message,
            unreadCount: message.receiver_id === session.user.id && !message.is_read ? 1 : 0,
          });
        } else if (!message.is_read && message.receiver_id === session.user.id) {
          const room = roomsMap.get(partnerId)!;
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
      });

      setChatRooms(Array.from(roomsMap.values()));
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToMessages = () => {
    if (!session?.user) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id})`,
        },
        () => {
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchChatRooms();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredChatRooms = chatRooms.filter((room) =>
    room.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    router.push('/(tabs)/contacts');
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['rgba(10, 126, 164, 0.1)', 'transparent']}
        style={styles.gradient}
      />
      
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search chats..."
          />
        </BlurView>
      ) : (
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search chats..."
          />
        </View>
      )}

      <ChatList
        chatRooms={filteredChatRooms}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#0a7ea4"
            colors={['#0a7ea4']}
          />
        }
        loading={loading}
      />

      <FloatingButton
        icon={<Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />}
        onPress={handleNewChat}
        style={styles.floatingButton}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  searchBarContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: Platform.OS === 'ios' ? undefined : 'rgba(255, 255, 255, 0.9)',
  },
  floatingButton: {
    shadowColor: '#0a7ea4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
}); 