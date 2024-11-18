import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Image, ActivityIndicator, Alert, Platform, Share } from 'react-native';
import { router } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/chat/SearchBar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/chat';

interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers?: Contacts.PhoneNumber[];
  email?: string;
  image?: string;
}

export default function ContactsScreen() {
  const { session } = useAuth();
  const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
  const [registeredContacts, setRegisteredContacts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
    subscribeToProfileChanges();
  }, []);

  const subscribeToProfileChanges = () => {
    const subscription = supabase
      .channel('profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          loadContacts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please allow access to your contacts');
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        const formattedContacts = data
          .filter(contact => contact.name && (contact.phoneNumbers?.length || contact.emails?.length))
          .map(contact => ({
            id: contact.id,
            name: contact.name,
            phoneNumbers: contact.phoneNumbers?.map(phone => ({
              ...phone,
              number: formatPhoneNumber(phone.number),
            })),
            email: contact.emails?.[0]?.email,
            image: contact.image?.uri,
          }));

        setDeviceContacts(formattedContacts);

        const phoneNumbers = formattedContacts
          .flatMap(contact => contact.phoneNumbers?.map(phone => phone.number))
          .filter(Boolean) as string[];

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .in('phone_number', phoneNumbers);

        if (error) throw error;
        setRegisteredContacts(profiles || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return '';
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '');
  };

  const handleContactPress = async (contact: DeviceContact) => {
    if (!session?.user) return;

    const phoneNumber = contact.phoneNumbers?.[0]?.number;
    if (!phoneNumber) {
      Alert.alert('Error', 'No phone number available for this contact');
      return;
    }

    try {
      // Check if contact is registered
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, is_guest')
        .eq('phone_number', formatPhoneNumber(phoneNumber))
        .single();

      if (existingProfile) {
        // Navigate to chat if profile exists (registered or guest)
        router.push(`/chat/${existingProfile.id}`);
      } else {
        // Ask user if they want to start chat with unregistered contact
        Alert.alert(
          'Start Chat',
          `${contact.name} is not on ThunderTalk. Would you like to start a chat anyway?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Start Chat',
              onPress: async () => {
                try {
                  // Create guest profile using the function
                  const { data, error } = await supabase
                    .rpc('get_or_create_guest_profile', {
                      phone_number_param: formatPhoneNumber(phoneNumber),
                      full_name_param: contact.name,
                    });

                  if (error) throw error;
                  
                  // Navigate to chat with the guest profile
                  router.push(`/chat/${data}`);
                } catch (error) {
                  console.error('Error creating guest profile:', error);
                  Alert.alert('Error', 'Failed to start chat');
                }
              },
            },
            { 
              text: 'Invite',
              onPress: () => handleInvite(contact),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error handling contact:', error);
      Alert.alert('Error', 'Failed to process contact');
    }
  };

  const handleInvite = async (contact: DeviceContact) => {
    try {
      const appLink = 'https://thundertalk.app'; // Replace with your actual app link
      const message = `Hey! Join me on ThunderTalk to chat. Download the app here: ${appLink}`;
      
      const shareOptions = {
        title: 'Invite to ThunderTalk',
        message: message,
        // You can add these options when you have the actual app store links
        // url: appLink, // For iOS
        // subject: 'Join me on ThunderTalk', // For email
      };

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert(
        'Invite Error',
        'Could not share the invitation. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
            style: 'default',
          },
        ]
      );
    }
  };

  const filteredContacts = deviceContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumbers?.some(phone => phone.number?.includes(searchQuery)) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContact = ({ item: contact }: { item: DeviceContact }) => {
    const isRegistered = registeredContacts.some(rc => 
      contact.phoneNumbers?.some(phone => phone.number === rc.phone_number)
    );

    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleContactPress(contact)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {contact.image ? (
            <Image source={{ uri: contact.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.defaultAvatar]}>
              <ThemedText style={styles.avatarText}>
                {contact.name.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          {isRegistered && <View style={styles.registeredIndicator} />}
        </View>

        <View style={styles.contactInfo}>
          <ThemedText style={styles.name}>{contact.name}</ThemedText>
          {contact.phoneNumbers?.[0] && (
            <ThemedText style={styles.subtitle}>
              {contact.phoneNumbers[0].number}
            </ThemedText>
          )}
        </View>

        <Ionicons 
          name={isRegistered ? "chatbubbles-outline" : "person-add-outline"} 
          size={24} 
          color="#0a7ea4" 
        />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search contacts..."
      />
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>No contacts found</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={loadContacts}
          refreshing={refreshing}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingVertical: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  defaultAvatar: {
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  registeredIndicator: {
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
  contactInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 