import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Key, ShieldCheck, Mail, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const [profileData, setProfileData] = useState({ username: user?.username || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState({ profile: false, password: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading({ ...loading, profile: true });
      const res = await api.put('/auth/profile', { username: profileData.username });
      
      // Update local storage and context
      const updatedUser = { ...user, username: profileData.username };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading({ ...loading, profile: false });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
      setLoading({ ...loading, profile: false });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }
    try {
      setLoading({ ...loading, password: true });
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading({ ...loading, password: false });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
      setLoading({ ...loading, password: false });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your profile information and security preferences.</p>
      </div>

      {/* Profile Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ padding: '2rem', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', gap: '2rem' }}
      >
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '24px', 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
        }}>
          <User size={40} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.username}</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{user?.email}</p>
        </div>
        <button onClick={logout} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', background: '#fee2e2', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </motion.div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            padding: '1rem', borderRadius: '12px', 
            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 600, border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}
        >
          {message.type === 'success' ? <ShieldCheck size={20} /> : <Lock size={20} />}
          {message.text}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Update Profile Section */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.6rem', background: '#f1f5f9', borderRadius: '12px', color: 'var(--primary)' }}>
              <UserCircle size={24} />
            </div>
            <h3 style={{ fontWeight: 800 }}>Profile Information</h3>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={profileData.username}
                  onChange={(e) => setProfileData({ username: e.target.value })}
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                <input 
                  type="email" 
                  value={user?.email}
                  disabled
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#f1f5f9', border: '2px solid #f1f5f9', borderRadius: '12px', color: '#94a3b8', cursor: 'not-allowed' }}
                />
              </div>
            </div>
            <button disabled={loading.profile} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
              <Save size={20} />
              {loading.profile ? 'Updating...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.6rem', background: '#fef2f2', borderRadius: '12px', color: '#ef4444' }}>
              <Key size={24} />
            </div>
            <h3 style={{ fontWeight: 800 }}>Security & Password</h3>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>CURRENT PASSWORD</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>NEW PASSWORD</label>
              <input 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>CONFIRM NEW PASSWORD</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••" 
                style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: '12px' }}
              />
            </div>
            <button disabled={loading.password} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}>
              <Lock size={20} />
              {loading.password ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
