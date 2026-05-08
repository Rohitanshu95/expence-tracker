import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Camera, Check, AlertCircle, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update local state when user data is loaded or changed
  useEffect(() => {
    if (user) {
      if (!username) setUsername(user.username || '');
      if (!avatar) setAvatar(user.avatar || '');
    }
  }, [user]);

  // Clear messages after a delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.patch('/auth/profile', { username, avatar });
      setUser(res.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const avatars = [
    { src: '/src/assets/avatars/male_1.png', label: 'Male 1' },
    { src: '/src/assets/avatars/male_2.png', label: 'Male 2' },
    { src: '/src/assets/avatars/male_3.png', label: 'Male 3' },
    { src: '/src/assets/avatars/male_4.png', label: 'Male 4' },
    { src: '/src/assets/avatars/male_5.png', label: 'Male 5' },
    { src: '/src/assets/avatars/female_1.png', label: 'Female 1' },
    { src: '/src/assets/avatars/female_2.png', label: 'Female 2' },
    { src: '/src/assets/avatars/female_3.png', label: 'Female 3' },
    { src: '/src/assets/avatars/female_4.png', label: 'Female 4' },
    { src: '/src/assets/avatars/female_5.png', label: 'Female 5' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: isMobile ? '1rem' : '0' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            padding: '0.6rem', 
            borderRadius: '12px', 
            background: 'white', 
            border: '1px solid var(--border)', 
            boxShadow: 'var(--shadow)',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>My Profile</h1>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            padding: '1rem', 
            borderRadius: '12px', 
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#059669' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#f87171'}`
          }}
        >
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{message.text}</span>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
        {/* Profile Info Card */}
        <motion.div 
          className="glass" 
          style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="var(--primary)" /> Basic Info
          </h3>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '4px solid white',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                  {avatar ? (
                    <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>{username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', padding: '0.4rem', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                  <Camera size={16} color="var(--primary)" />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {avatars.map((av) => (
                  <button 
                    key={av.label} 
                    type="button"
                    onClick={() => setAvatar(av.src)}
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      border: avatar === av.src ? '3px solid var(--primary)' : '2px solid #f1f5f9',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      transform: avatar === av.src ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: avatar === av.src ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
                    }}
                    title={av.label}
                  >
                    <img src={av.src} alt={av.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email" 
                  value={user?.email}
                  disabled
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: 'var(--primary)', color: 'white', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </motion.div>

        {/* Change Password Card */}
        <motion.div 
          className="glass" 
          style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid #e2e8f0' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="#f43f5e" /> Security
          </h3>
          
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Current Password</label>
              <input 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: '#1e293b', color: 'white', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '1rem' }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Logout Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginTop: '1rem' }}
      >
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '1rem',
            background: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '20px',
            color: '#ef4444',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
        >
          <LogOut size={20} />
          Sign Out of ExpenseFlow
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
