import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let apiClient: AxiosInstance | null = null;

export function setApiToken(token: string) {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_URL,
    });
  }
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_URL,
    });
  }
  return apiClient;
}

export const api = {
  auth: {
    register: (phone: string, username: string, password: string) =>
      getApiClient().post('/api/auth/register', { phone, username, password }),
    login: (phone: string, password: string) =>
      getApiClient().post('/api/auth/login', { phone, password }),
    getProfile: () =>
      getApiClient().get('/api/auth/profile'),
    getUserById: (id: string) =>
      getApiClient().get(`/api/auth/user/${id}`),
    updateProfile: (displayName?: string, avatar?: string) =>
      getApiClient().put('/api/auth/profile', { displayName, avatar }),
    search: (q: string) =>
      getApiClient().get(`/api/auth/search?q=${encodeURIComponent(q)}`),
  },
  friends: {
    sendRequest: (friendId: string) =>
      getApiClient().post(`/api/friends/request/${friendId}`),
    acceptRequest: (requestId: string) =>
      getApiClient().post(`/api/friends/accept/${requestId}`),
    rejectRequest: (requestId: string) =>
      getApiClient().post(`/api/friends/reject/${requestId}`),
    getList: () =>
      getApiClient().get('/api/friends/list'),
    getPending: () =>
      getApiClient().get('/api/friends/pending'),
    getSent: () =>
      getApiClient().get('/api/friends/sent'),
    removeFriend: (friendId: string) =>
      getApiClient().delete(`/api/friends/${friendId}`),
  },
  messages: {
    getConversation: (friendId: string, limit?: number, offset?: number) =>
      getApiClient().get(
        `/api/messages/conversation/${friendId}?limit=${limit || 50}&offset=${offset || 0}`
      ),
    getRecent: (limit?: number) =>
      getApiClient().get(`/api/messages/recent?limit=${limit || 20}`),
    uploadAttachment: (friendId: string, file: File, content?: string) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('recipientId', friendId);
      if (content) fd.append('content', content);
      return getApiClient().post('/api/messages/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};
