import { useEffect, useRef, useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';

import { Message, Profile } from '@/types/chat';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const subscription = useRef<ReturnType<typeof supabase.channel>>();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    fetchProfile();
    subscribeToMessages();
    subscribeToTyping();

    return () => {
      subscription.current?.unsubscribe();
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (session?.user && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, session]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchMessages = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data);
    setLoading(false);
  };

  const markMessagesAsRead = async () => {
    if (!session?.user) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.is_read && msg.receiver_id === session.user.id
    );

    if (unreadMessages.length === 0) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in(
        'id',
        unreadMessages.map((msg) => msg.id)
      );

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!session?.user) return;

    subscription.current = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${session.user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${session.user.id}))`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [payload.new as Message, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === (payload.new as Message).id ? (payload.new as Message) : msg
              )
            );
          }
        }
      )
      .subscribe();
  };

  const subscribeToTyping = () => {
    supabase.channel('typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === id) {
          setIsTyping(true);
        }
      })
      .on('broadcast', { event: 'stop_typing' }, ({ payload }) => {
        if (payload.userId === id) {
          setIsTyping(false);
        }
      })
      .subscribe();
  };

  const uploadFile = async (uri: string, type: 'image' | 'file'): Promise<string> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('chat-files')
        .upload(filePath, {
          uri: uri,
          type: type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          name: fileName,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', fileUri?: string) => {
    if (!session?.user || (!content.trim() && type === 'text')) return;

    try {
      let fileUrl = '';
      if (fileUri && (type === 'image' || type === 'file')) {
        fileUrl = await uploadFile(fileUri, type);
      }

      const newMessage = {
        sender_id: session.user.id,
        receiver_id: id,
        content: content.trim(),
        content_type: type,
        file_url: fileUrl || null,
        is_read: false,
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartTyping = () => {
    if (!session?.user) return;

    supabase.channel('typing')
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: session.user.id }
      });

    // Clear previous timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set new timeout
    typingTimeout.current = setTimeout(() => {
      supabase.channel('typing')
        .send({
          type: 'broadcast',
          event: 'stop_typing',
          payload: { userId: session.user.id }
        });
    }, 3000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ThemedView style={styles.container}>
        <MessageList
          messages={messages}
          userId={session?.user?.id}
          loading={loading}
          isTyping={isTyping}
          onReact={handleReaction}
        />
        <MessageInput 
          onSend={handleSendMessage}
          onStartTyping={handleStartTyping}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 