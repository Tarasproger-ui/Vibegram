import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/context';
import { useUI } from '../utils/uiContext';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUI();
  const navigate = useNavigate();
  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => toggleSidebar()}
      />

      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-lg transform transition-transform z-50`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-lg">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{user?.displayName || user?.username}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.phone}</div>
          </div>
          <button onClick={toggleSidebar} className="ml-auto text-gray-500">✕</button>
        </div>

        <div className="p-4 space-y-2">
          <button onClick={() => { navigate('/chat'); toggleSidebar(); }} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Chats</button>
          <button onClick={() => { navigate('/friends'); toggleSidebar(); }} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Friends</button>
          <button onClick={() => { navigate('/settings'); toggleSidebar(); }} className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">Settings</button>
          <div className="border-t pt-2 mt-2">
            <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left p-2 rounded text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800">Logout</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
