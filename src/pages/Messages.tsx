import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  User,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, OrderMessage } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';

export const Messages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const recipientIdFromQuery = searchParams.get('recipient');

  const { user } = useAuth();
  const [conversations, setConversations] = useState<{ peer: Profile; lastMessage?: OrderMessage }[]>([]);
  const [activePeer, setActivePeer] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, recipientIdFromQuery]);

  useEffect(() => {
    if (activePeer && user) {
      loadMessagesForPeer(activePeer.id);
      const interval = setInterval(() => {
        loadMessagesForPeer(activePeer.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activePeer, user]);

  const loadConversations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch messages where user is sender or receiver
      const { data: userMessages, error } = await supabase
        .from('order_messages')
        .select('*, sender:profiles!order_messages_sender_id_fkey(*)')
        .order('created_at', { ascending: false });

      const peerMap = new Map<string, { peer: Profile; lastMessage?: OrderMessage }>();

      if (userMessages) {
        for (const msg of userMessages) {
          // Identify peer id
          const isSender = msg.sender_id === user.id;
          // In Supabase, if order messages or direct chat:
          // We can determine the other participant
          // If receiver_id isn't directly in schema, msg might reference order.
          // In our local engine or schema: msg.sender_id != user.id -> peer is sender
          if (!isSender && msg.sender) {
            if (!peerMap.has(msg.sender_id)) {
              peerMap.set(msg.sender_id, { peer: msg.sender, lastMessage: msg });
            }
          }
        }
      }

      // If recipient was specified in URL query
      if (recipientIdFromQuery && recipientIdFromQuery !== user.id) {
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', recipientIdFromQuery)
          .single();

        if (recipientProfile && !peerMap.has(recipientIdFromQuery)) {
          peerMap.set(recipientIdFromQuery, { peer: recipientProfile });
        }
        if (recipientProfile) {
          setActivePeer(recipientProfile);
        }
      }

      const convList = Array.from(peerMap.values());
      setConversations(convList);

      if (!activePeer && convList.length > 0 && !recipientIdFromQuery) {
        setActivePeer(convList[0].peer);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessagesForPeer = async (peerId: string) => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('order_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Error loading chat messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePeer || !newMessageText.trim()) return;

    setIsSending(true);
    const messageContent = newMessageText.trim();
    setNewMessageText('');

    try {
      const newMsg = {
        sender_id: user.id,
        receiver_id: activePeer.id,
        message: messageContent,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('order_messages')
        .insert(newMsg)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMessages((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-sand-400 mx-auto" />
        <h2 className="text-2xl font-bold font-heading text-navy-900">Student Messaging</h2>
        <p className="text-sand-600 text-sm">Please log in to communicate with your student peers and freelancers.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-sand-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[750px]">
        {/* Left Sidebar: Conversations */}
        <div className="border-r border-sand-200 flex flex-col h-full bg-sand-50/40">
          <div className="p-4 border-b border-sand-200">
            <h2 className="font-heading font-bold text-navy-900 text-lg">Direct Messages</h2>
            <p className="text-xs text-sand-500 mt-0.5">Discussions & Order Inquiries</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-sand-100">
            {conversations.length > 0 ? (
              conversations.map(({ peer, lastMessage }) => (
                <button
                  key={peer.id}
                  onClick={() => setActivePeer(peer)}
                  className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                    activePeer?.id === peer.id
                      ? 'bg-teal-50/70 border-r-4 border-teal-600'
                      : 'hover:bg-sand-100/60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-heading font-bold flex items-center justify-center shrink-0">
                    {peer.avatar_url ? (
                      <img
                        src={peer.avatar_url}
                        alt={peer.full_name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      peer.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-navy-900 text-sm truncate">
                        {peer.full_name}
                      </h4>
                      {lastMessage && (
                        <span className="text-[10px] text-sand-400">
                          {new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-teal-700 truncate">{peer.department || 'GPM Malvan'}</p>
                    {lastMessage && (
                      <p className="text-xs text-sand-500 truncate mt-0.5">
                        {lastMessage.message}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-sand-300 mx-auto" />
                <p className="text-xs text-sand-500">No message conversations yet.</p>
                <p className="text-[11px] text-sand-400">
                  Visit any service page and click "Message Freelancer" to start a discussion.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="md:col-span-2 flex flex-col h-full bg-white">
          {activePeer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-sand-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm">
                    {activePeer.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 text-sm">{activePeer.full_name}</h3>
                    <p className="text-[11px] text-sand-500">{activePeer.department || 'Government Polytechnic Malvan'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-sand-50/20">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-teal-600 text-white rounded-br-none shadow-sm'
                              : 'bg-white border border-sand-200 text-navy-900 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-sand-400 mt-1 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-sand-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-sand-300" />
                    <p className="text-xs font-medium text-navy-800">Start the conversation</p>
                    <p className="text-[11px] max-w-xs">
                      Say hello to {activePeer.full_name} regarding your project topic, timeline, or scope.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-sand-200 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={`Message ${activePeer.full_name}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-sand-200 bg-sand-50/50 text-navy-900 placeholder:text-sand-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessageText.trim()}
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-sand-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-sand-300" />
              <h3 className="font-heading font-semibold text-navy-900 text-base">Select a Conversation</h3>
              <p className="text-xs text-sand-500 max-w-sm">
                Choose a student contact from the list on the left to review messages and order discussions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
