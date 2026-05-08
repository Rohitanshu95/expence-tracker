import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Plus, Trash2, Tag, X, ArrowUpCircle, ArrowDownCircle, Check,
  Utensils, Car, Wallet, ShoppingBag, Home, Film, Heart, Zap, 
  TrendingUp, Briefcase, Coffee, Gift, Plane, Smartphone, BookOpen,
  Music, Dumbbell, Scissors, PiggyBank, GraduationCap, Stethoscope,
  Bus, Fuel, Shirt, Baby, Gamepad2, Palette, Wrench, Globe,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

// Icon map for rendering dynamic icons
const iconMap = {
  Tag, Utensils, Car, Wallet, ShoppingBag, Home, Film, Heart, Zap,
  TrendingUp, Briefcase, Coffee, Gift, Plane, Smartphone, BookOpen,
  Music, Dumbbell, Scissors, PiggyBank, GraduationCap, Stethoscope,
  Bus, Fuel, Shirt, Baby, Gamepad2, Palette, Wrench, Globe, LayoutGrid
};

const iconOptions = [
  { name: 'Tag', label: 'Tag' },
  { name: 'Utensils', label: 'Food' },
  { name: 'Car', label: 'Car' },
  { name: 'Wallet', label: 'Wallet' },
  { name: 'ShoppingBag', label: 'Shop' },
  { name: 'Home', label: 'Home' },
  { name: 'Film', label: 'Film' },
  { name: 'Heart', label: 'Health' },
  { name: 'Zap', label: 'Energy' },
  { name: 'TrendingUp', label: 'Invest' },
  { name: 'Briefcase', label: 'Work' },
  { name: 'Coffee', label: 'Cafe' },
  { name: 'Gift', label: 'Gift' },
  { name: 'Plane', label: 'Travel' },
  { name: 'Smartphone', label: 'Tech' },
  { name: 'BookOpen', label: 'Study' },
  { name: 'Music', label: 'Music' },
  { name: 'Dumbbell', label: 'Gym' },
  { name: 'Scissors', label: 'Salon' },
  { name: 'PiggyBank', label: 'Savings' },
  { name: 'GraduationCap', label: 'Edu' },
  { name: 'Stethoscope', label: 'Medical' },
  { name: 'Bus', label: 'Bus' },
  { name: 'Fuel', label: 'Fuel' },
  { name: 'Shirt', label: 'Clothes' },
  { name: 'Baby', label: 'Kids' },
  { name: 'Gamepad2', label: 'Games' },
  { name: 'Palette', label: 'Art' },
  { name: 'Wrench', label: 'Repair' },
  { name: 'Globe', label: 'Online' },
];

const colorPalette = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#94a3b8', '#64748b', '#78716c',
];

const Modules = () => {
  const { searchQuery } = useSearch();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    type: 'expense',
    color: '#3b82f6',
    icon: 'Tag'
  });

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/modules');
      setModules(res.data);
    } catch (err) {
      console.error('Error fetching modules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newModule.name.trim()) return;
    try {
      await api.post('/modules', newModule);
      setNewModule({ name: '', type: 'expense', color: '#3b82f6', icon: 'Tag' });
      setShowModal(false);
      fetchModules();
    } catch (err) {
      console.error('Error creating module', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will not delete transactions in this category.')) {
      try {
        await api.delete(`/modules/${id}`);
        fetchModules();
      } catch (err) {
        console.error('Error deleting module', err);
      }
    }
  };

  const filteredModules = modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = iconMap[iconName] || Tag;
    return <IconComponent size={size} />;
  };

  if (loading && modules.length === 0) return <div>Loading categories...</div>;

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Categories</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage how you organize your transactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary)',
            color: 'white',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          New Category
        </motion.button>
      </header>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filteredModules.map((m) => (
          <motion.div
            key={m._id}
            layout
            className="glass card-hover"
            style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${m.color}18`,
                color: m.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {renderIcon(m.icon, 22)}
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{m.name}</h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: m.type === 'income' ? 'var(--success)' : 'var(--text-muted)',
                  background: m.type === 'income' ? '#10b98118' : '#f1f5f9',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px'
                }}>{m.type}</span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(m._id)}
              style={{ color: 'var(--text-muted)', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* ====== Add Category Modal ====== */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 4000, padding: '1rem'
          }}>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(8px)'
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                width: '100%',
                maxWidth: '480px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                background: 'white',
                zIndex: 4001
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute', right: '1.25rem', top: '1.25rem',
                  color: '#94a3b8', background: '#f8fafc', border: 'none',
                  borderRadius: '50%', padding: '0.5rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${newModule.color}15`, color: newModule.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem auto', transition: 'all 0.3s ease'
                }}>
                  {renderIcon(newModule.icon, 28)}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>New Category</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Create a custom category for your transactions</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Type Switcher */}
                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setNewModule({ ...newModule, type: 'expense' })}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: newModule.type === 'expense' ? 'white' : 'transparent',
                      color: newModule.type === 'expense' ? '#ef4444' : '#94a3b8',
                      boxShadow: newModule.type === 'expense' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowDownCircle size={16} />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewModule({ ...newModule, type: 'income' })}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                      background: newModule.type === 'income' ? 'white' : 'transparent',
                      color: newModule.type === 'income' ? '#10b981' : '#94a3b8',
                      boxShadow: newModule.type === 'income' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowUpCircle size={16} />
                    Income
                  </button>
                </div>

                {/* Category Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Groceries, Freelance"
                    value={newModule.name}
                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                    style={{
                      width: '100%', padding: '0.8rem 1rem',
                      fontSize: '0.95rem', fontWeight: 600,
                      border: '2px solid #f1f5f9', background: '#f8fafc',
                      borderRadius: '12px', outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = newModule.color}
                    onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                  />
                </div>

                {/* Icon Picker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Icon</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '0.4rem',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '2px solid #f1f5f9'
                  }}>
                    {iconOptions.map((opt) => {
                      const isSelected = newModule.icon === opt.name;
                      const IconComp = iconMap[opt.name] || Tag;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setNewModule({ ...newModule, icon: opt.name })}
                          title={opt.label}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.15rem',
                            padding: '0.5rem 0.25rem',
                            borderRadius: '10px',
                            border: isSelected ? `2px solid ${newModule.color}` : '2px solid transparent',
                            background: isSelected ? `${newModule.color}12` : 'white',
                            color: isSelected ? newModule.color : '#64748b',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            position: 'relative'
                          }}
                        >
                          <IconComp size={18} />
                          <span style={{ fontSize: '0.55rem', fontWeight: 600, lineHeight: 1 }}>{opt.label}</span>
                          {isSelected && (
                            <div style={{
                              position: 'absolute', top: '-4px', right: '-4px',
                              width: '14px', height: '14px', borderRadius: '50%',
                              background: newModule.color, color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Check size={8} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Picker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Color</label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '14px',
                    border: '2px solid #f1f5f9'
                  }}>
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewModule({ ...newModule, color })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          background: color,
                          border: newModule.color === color ? '3px solid #1e293b' : '3px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          transform: newModule.color === color ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: newModule.color === color ? `0 4px 12px ${color}50` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {newModule.color === color && <Check size={14} color="white" strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', borderRadius: '14px',
                  background: '#f8fafc', border: '2px dashed #e2e8f0'
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${newModule.color}18`, color: newModule.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {renderIcon(newModule.icon, 22)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                      {newModule.name || 'Category Name'}
                    </p>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: newModule.type === 'income' ? '#10b981' : '#94a3b8'
                    }}>{newModule.type}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>PREVIEW</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1, padding: '0.85rem', borderRadius: '14px',
                      border: '2px solid #e2e8f0', background: 'white',
                      color: '#64748b', fontWeight: 700, fontSize: '0.9rem',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1.5, padding: '0.85rem', borderRadius: '14px',
                      border: 'none', background: newModule.color,
                      color: 'white', fontWeight: 700, fontSize: '0.95rem',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: `0 4px 14px ${newModule.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    <Plus size={18} />
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Modules;
