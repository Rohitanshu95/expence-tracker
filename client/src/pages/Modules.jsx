import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Tag, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSearch } from '../context/SearchContext';

const Modules = () => {
  const { searchQuery } = useSearch();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
    try {
      await api.post('/modules', newModule);
      setNewModule({ name: '', type: 'expense', color: '#3b82f6', icon: 'Tag' });
      setShowAddForm(false);
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
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '0.75rem 1.25rem', 
            borderRadius: 'var(--radius)',
            fontWeight: 600
          }}
        >
          <Plus size={20} />
          New Category
        </motion.button>
      </header>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass"
            style={{ marginBottom: '2rem', overflow: 'hidden', padding: '1.5rem' }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Groceries"
                  value={newModule.name}
                  onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                />
              </div>
              <div style={{ width: '150px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Type</label>
                <select 
                  value={newModule.type}
                  onChange={(e) => setNewModule({...newModule, type: e.target.value})}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div style={{ width: '80px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Color</label>
                <input 
                  type="color" 
                  value={newModule.color}
                  onChange={(e) => setNewModule({...newModule, color: e.target.value})}
                  style={{ padding: '0', height: '42px', cursor: 'pointer' }}
                />
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem' }}>Save</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                background: `${m.color}20`, 
                color: m.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Tag size={20} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{m.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.type}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(m._id)}
              style={{ color: 'var(--text-muted)', padding: '0.5rem' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--error)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Modules;
