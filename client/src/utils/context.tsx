import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { setApiToken, getApiClient } from './api';

interface User {
  userId: string;
  phone: string;
  username: string;
  displayName?: string;
  avatar?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (phone: string, username: string, password: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (displayName?: string, avatar?: string) => Promise<void>;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('vibegram_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vibegram_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vibegram_user');
    }
  }, [user]);

  // Keep the axios client Authorization header in sync with the logged-in user
  useEffect(() => {
    if (user && user.token) {
      setApiToken(user.token);
    } else {
      try {
        const client = getApiClient();
        if (client && client.defaults && client.defaults.headers) {
          delete client.defaults.headers.common['Authorization'];
        }
      } catch (e) {
        // ignore if api client not initialized yet
      }
    }
  }, [user]);

  const register = async (phone: string, username: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        phone,
        username,
        password,
      });
      setUser(response.data);
      if (response.data?.token) setApiToken(response.data.token);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        phone,
        password,
      });
      setUser(response.data);
      if (response.data?.token) setApiToken(response.data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      const client = getApiClient();
      if (client && client.defaults && client.defaults.headers) {
        delete client.defaults.headers.common['Authorization'];
      }
    } catch (e) {
      // ignore
    }
  };

  const updateProfile = async (displayName?: string, avatar?: string) => {
    if (!user) return;
    try {
      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        { displayName, avatar },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, ...response.data });
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      newSocket.emit('authenticate', user.token);
    });

    newSocket.on('authenticated', (data) => {
      if (data.success) {
        setIsConnected(true);
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}
