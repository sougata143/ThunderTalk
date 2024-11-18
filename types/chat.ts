export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  last_seen: Date;
  is_online: boolean;
  is_guest?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: 'text' | 'image' | 'file';
  file_url?: string;
  file_type?: string;
  is_read: boolean;
  created_at: Date;
  delivered_at?: Date;
  read_at?: Date;
  reactions?: Record<string, number>;
}

export interface ChatRoom {
  profile: Profile;
  lastMessage?: Message;
  unreadCount: number;
} 