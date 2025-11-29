import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './utils/context';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ChatList } from './pages/ChatList';
import { Chat } from './pages/Chat';
import { Friends } from './pages/Friends';
import Sidebar from './components/Sidebar';
import { Settings } from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black dark:bg-slate-900 dark:text-gray-100">
        <Sidebar />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <div className="h-screen flex flex-col md:flex-row">
                <div className="w-full md:w-80 h-screen md:h-full overflow-y-auto">
                  <ChatList />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:friendId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/chat" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
