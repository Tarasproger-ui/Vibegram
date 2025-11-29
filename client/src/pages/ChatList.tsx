import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/context';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../utils/uiContext';
import Sidebar from '../components/Sidebar';

interface Conversation {
  otherUserId: string;
  lastMessageAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

export function ChatList() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState(0);
  const autoRefreshRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { toggleSidebar } = useUI();

  useEffect(() => {
    loadConversations();
    loadFriendRequestCount();

    // Auto refresh conversations every 3 seconds
    autoRefreshRef.current = setInterval(() => {
      loadConversations();
      loadFriendRequestCount();
    }, 3000);

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.messages.getRecent();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequestCount = async () => {
    try {
      const response = await api.friends.getPending();
      setFriendRequests(response.data.length);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vibegram</h1>
          <p className="text-sm opacity-90">Messages</p>
        </div>
        <div className="flex items-center gap-2">
          <button id="sidebar-open-btn" onClick={() => { toggleSidebar(); }} className="mr-2 md:hidden">
            ☰
          </button>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => navigate('/friends')}
              className="relative bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
            >
              Friends
              {friendRequests > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold">
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{user?.displayName || user?.username}</p>
            <p className="text-sm text-gray-600">{user?.phone}</p>
          </div>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No conversations yet. Add friends to start messaging!</p>
          </div>
        ) : (
          <div>
            {conversations.map((conv) => (
              <button
                key={conv.otherUserId}
                onClick={() => navigate(`/chat/${conv.otherUserId}`)}
                className="w-full text-left border-b border-gray-100 p-4 hover:bg-gray-50 transition flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {conv.user?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">
                    {conv.user?.displayName || conv.user?.username}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
