import apiClient from './client';

interface Chat {
  chat_id: number;
  buyer: any;
  seller: any;
  listing: any;
  last_message_at: string;
  last_message: any;
  unread_count: number;
}

interface Message {
  message_id: number;
  sender: any;
  content: string;
  message_type: string;
  is_read: boolean;
  sentat: string;
}

export const messagesApi = {
  // Get all chats
  getChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get('/chats/');
    return response.data;
  },

  // Get chat messages
  getMessages: async (chatId: number): Promise<Message[]> => {
    const response = await apiClient.get(`/chats/${chatId}/messages/`);
    return response.data;
  },

  // Send message
  sendMessage: async (chatId: number, content: string): Promise<Message> => {
    const response = await apiClient.post(`/chats/${chatId}/messages/send/`, {
      content,
      message_type: 'text',
    });
    return response.data.data;
  },

  // Create chat
  createChat: async (listingId: number): Promise<Chat> => {
    const response = await apiClient.post('/chats/create/', {
      listing_id: listingId,
    });
    return response.data.chat;
  },

  // Mark messages as read
  markAsRead: async (chatId: number): Promise<void> => {
    await apiClient.put(`/chats/${chatId}/mark-read/`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/chats/unread-count/');
    return response.data.unread_count;
  },
};