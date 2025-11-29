import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/context';
import { api } from '../utils/api';

export function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'security'>('account');
  const [profile, setProfile] = useState<any>(null);
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('vibegram_theme');
      return stored === 'dark';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // apply theme
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('vibegram_theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.auth.getProfile();
        setProfile(res.data);
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    };
    load();
  }, []);

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(String(reader.result));
      reader.readAsDataURL(avatarFile);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
  };

  const saveAvatar = async () => {
    if (!avatarPreview) return;
    try {
      await updateProfile(undefined, avatarPreview);
      alert('Avatar updated');
      setAvatarFile(null);
    } catch (e) {
      console.error('Failed to save avatar:', e);
      alert('Failed to update avatar');
    }
  };

  const handleToggleTheme = () => setDark((v) => !v);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="flex gap-4">
        <div className="w-56 bg-gray-50 p-4 rounded shadow">
          <button
            className={`w-full text-left p-2 rounded ${activeTab === 'account' ? 'bg-white font-semibold' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`w-full text-left p-2 rounded mt-2 ${activeTab === 'security' ? 'bg-white font-semibold' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <div className="mt-4 border-t pt-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={dark} onChange={handleToggleTheme} />
              <span>Dark theme</span>
            </label>
          </div>
        </div>

        <div className="flex-1 bg-white p-4 rounded shadow">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Account Info</h2>
              {!profile ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>User ID:</strong> {profile.id}</div>
                  <div><strong>Username:</strong> @{profile.username}</div>
                  <div><strong>Phone:</strong> {profile.phone}</div>
                  <div><strong>Display name:</strong> {profile.displayName}</div>
                  <div><strong>Created:</strong> {new Date(profile.createdAt || Date.now()).toLocaleString()}</div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Avatar</label>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-2" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 mb-2" />
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    {avatarPreview && (
                      <div className="mt-2">
                        <img src={avatarPreview} alt="preview" className="w-24 h-24 rounded-full object-cover" />
                        <div className="mt-2">
                          <button onClick={saveAvatar} className="bg-cyan-500 text-white px-3 py-1 rounded">Save Avatar</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Security</h2>
              <p className="text-sm text-gray-700">Token (masked):</p>
              <div className="mt-2 p-2 bg-gray-100 rounded">
                {user?.token ? `${user.token.substring(0, 10)}...${user.token.substring(user.token.length - 6)}` : '—'}
              </div>
              <div className="mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => { logout(); window.location.href = '/login'; }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
