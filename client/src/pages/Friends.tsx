import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/context';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
}

interface FriendRequest {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  createdAt: string;
}

export function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    // Only search when user starts with @ and types at least 2 characters after it
    if (searchQuery.startsWith('@') && searchQuery.length > 2) {
      handleSearch(searchQuery.slice(1));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        api.friends.getList(),
        api.friends.getPending(),
        api.friends.getSent(),
      ]);
      setFriends(friendsRes.data);
      setPendingRequests(pendingRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await api.auth.search(query);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Quick add: try to add a friend directly from the search input when using @username
  const handleQuickAdd = async () => {
    if (!searchQuery || !searchQuery.startsWith('@')) {
      alert('Please type @username to add a friend.');
      return;
    }

    const q = searchQuery.slice(1);
    if (q.length < 2) {
      alert('Please type at least 2 characters after @');
      return;
    }

    try {
      const res = await api.auth.search(q);
      const matches = res.data || [];
      if (matches.length === 0) {
        alert('No users found for that username');
        return;
      }

      // If exact match on username, prefer it
      let match = matches.find((m: any) => m.username.toLowerCase() === q.toLowerCase());
      if (!match) match = matches[0];

      if (match) {
        // send request
        await handleSendRequest(match.id);
      }
    } catch (error) {
      console.error('Quick add failed:', error);
      alert('Could not send friend request.');
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      await api.friends.sendRequest(friendId);
      await loadFriends();
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Error: Could not send friend request. You may already have a pending request or be friends already.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.friends.acceptRequest(requestId);
      await loadFriends();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.friends.rejectRequest(requestId);
      await loadFriends();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await api.friends.removeFriend(friendId);
      await loadFriends();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="text-xl hover:opacity-80"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Friends</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users (type @username)..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            onClick={handleQuickAdd}
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition text-sm"
            title="Quick add by @username"
          >
            Add Friend
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Tip: start search with <span className="font-mono">@</span> followed by username.</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">Search Results</div>
            {searchResults.map((result) => {
              const isFriend = friends.some((f) => f.id === result.id);
              const hasRequestSent = sentRequests.some((r) => r.friendId === result.id);
              const hasPendingRequest = pendingRequests.some((r) => r.userId === result.id);
              const isMe = user?.userId === result.id;

              return (
                <div
                  key={result.id}
                  className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{result.displayName}</p>
                    <p className="text-sm text-gray-600">@{result.username}</p>
                  </div>
                  {isMe ? (
                    <p className="text-gray-500 text-sm">That's you</p>
                  ) : isFriend ? (
                    <p className="text-green-600 text-sm font-semibold">✓ Friend</p>
                  ) : hasRequestSent ? (
                    <p className="text-blue-600 text-sm font-semibold">⏳ Request Sent</p>
                  ) : hasPendingRequest ? (
                    <p className="text-blue-600 text-sm font-semibold">⏳ Pending</p>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(result.id)}
                      className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition text-sm"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">Friend Requests ({pendingRequests.length})</div>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{req.displayName}</p>
                  <p className="text-sm text-gray-600">@{req.username}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">Sent Requests ({sentRequests.length})</div>
            {sentRequests.map((req) => (
              <div
                key={req.id}
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{req.displayName}</p>
                  <p className="text-sm text-gray-600">@{req.username}</p>
                </div>
                <p className="text-gray-500 text-sm">⏳ Pending</p>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div>
          <div className="bg-gray-50 px-4 py-2 font-semibold text-gray-700">
            Friends ({friends.length})
          </div>
          {friends.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              {searchResults.length === 0 && searchQuery === '' ? 'No friends yet. Search for users above!' : 'No friends'}
            </div>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="px-4 py-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50"
              >
                <button
                  onClick={() => navigate(`/chat/${friend.id}`)}
                  className="flex-1 text-left"
                >
                  <p className="font-semibold text-gray-800">{friend.displayName}</p>
                  <p className="text-sm text-gray-600">@{friend.username}</p>
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
