import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import ChatList from '../components/messaging/ChatList';
import MessageBubble from '../components/messaging/MessageBubble';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { Send, ArrowLeft, ExternalLink, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listingId = searchParams.get('listing');

  // Fetch chats
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: messagesApi.getChats,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () => messagesApi.getMessages(selectedChatId!),
    enabled: !!selectedChatId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: messagesApi.createChat,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSelectedChatId(chat.chat_id);
      toast.success('Chat started');
    },
    onError: () => {
      toast.error('Failed to start chat');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content }: { chatId: number; content: string }) =>
      messagesApi.sendMessage(chatId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessageInput('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedChatId && messages) {
      messagesApi.markAsRead(selectedChatId);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  }, [selectedChatId, messages, queryClient]);

  // Create chat if listing param exists
  useEffect(() => {
    if (listingId && !selectedChatId) {
      createChatMutation.mutate(parseInt(listingId));
    }
  }, [listingId]);

  // Select first chat if none selected
  useEffect(() => {
    if (chats && chats.length > 0 && !selectedChatId && !listingId) {
      setSelectedChatId(chats[0].chat_id);
    }
  }, [chats, selectedChatId, listingId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim(),
    });
  };

  const selectedChat = chats?.find((c) => c.chat_id === selectedChatId);
  const otherUser = selectedChat
    ? selectedChat.buyer.userid === user?.userid
      ? selectedChat.seller
      : selectedChat.buyer
    : null;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Chat List Sidebar */}
            <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              </div>
              
              {chatsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ChatList
                  chats={chats || []}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUserId={user.userid}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChatId(null)}
                        className="md:hidden"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {otherUser?.user_firstname?.[0] || '?'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {otherUser?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {selectedChat.listing.listing_title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/listings/${selectedChat.listing.listing_id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Listing"
                      >
                        <ExternalLink className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <LoadingSpinner />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.message_id}
                            message={message}
                            isOwnMessage={message.sender.userid === user.userid}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 input"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        type="submit"
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        isLoading={sendMessageMutation.isPending}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}