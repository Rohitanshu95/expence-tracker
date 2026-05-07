import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, IndianRupee, Calendar as CalendarIcon, FileText, Tag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../utils/api';

const AddTransactionModal = ({ isOpen, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [stagedTransactions, setStagedTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    note: '',
    moduleId: '',
    otherDetail: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchModules = async () => {
        try {
          const res = await api.get('/modules');
          setModules(res.data);
          const firstExpense = res.data.find(m => m.type === 'expense');
          if (firstExpense) {
            setFormData(prev => ({ ...prev, moduleId: firstExpense._id }));
          }
        } catch (err) {
          console.error('Error fetching modules', err);
        }
      };
      fetchModules();
      // Reset staged transactions when opening
      setStagedTransactions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (modules.length > 0 && !formData.moduleId) {
      if (formData.type === 'income') {
        const inc = modules.find(m => m.type === 'income');
        if (inc) setFormData(prev => ({ ...prev, moduleId: inc._id }));
      } else {
        const exp = modules.find(m => m.type === 'expense');
        if (exp) setFormData(prev => ({ ...prev, moduleId: exp._id }));
      }
    }
  }, [formData.type, modules]);

  const processCurrentTransaction = () => {
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return null;
    }

    const otherModule = modules.find(m => m.name === 'Other');
    const incomeModule = modules.find(m => m.type === 'income') || modules[0];
    
    let actualModuleId = formData.moduleId;
    let finalNote = formData.note;

    if (formData.type === 'income') {
      actualModuleId = incomeModule?._id || formData.moduleId;
      finalNote = `[Source: ${formData.otherDetail}] ${formData.note}`.trim();
    } else {
      if (formData.moduleId === 'other_special' || formData.moduleId === otherModule?._id) {
        actualModuleId = otherModule?._id || modules.find(m => m.type === 'expense')?._id;
        finalNote = `[Other: ${formData.otherDetail}] ${formData.note}`.trim();
      }
    }

    return { 
      ...formData, 
      moduleId: actualModuleId, 
      amount: amountNum, 
      note: finalNote,
      categoryName: formData.type === 'income' ? 'Income' : (modules.find(m => m._id === actualModuleId)?.name || 'Other')
    };
  };

  const handleAddMore = () => {
    const processed = processCurrentTransaction();
    if (!processed) {
      alert('Please enter a valid amount');
      return;
    }
    setStagedTransactions([...stagedTransactions, processed]);
    setFormData({
      ...formData,
      amount: '',
      note: '',
      otherDetail: '',
      // Keep date and type for convenience
    });
  };

  const handleRemoveStaged = (index) => {
    setStagedTransactions(stagedTransactions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalPayload = [...stagedTransactions];
    
    // If form has data but not added to list, add it now
    if (formData.amount) {
      const processed = processCurrentTransaction();
      if (processed) {
        finalPayload.push(processed);
      }
    }

    if (finalPayload.length === 0) {
      alert('Please add at least one transaction');
      return;
    }

    setIsSubmitting(true);

    try {
      // If only one, send as object, else as array
      const payload = finalPayload.length === 1 ? finalPayload[0] : finalPayload;
      await api.post('/transactions', payload);
      onRefresh();
      onClose();
      setFormData({
        amount: '',
        type: 'expense',
        note: '',
        moduleId: modules.find(m => m.type === 'expense')?._id || '',
        otherDetail: '',
        date: new Date().toISOString().split('T')[0]
      });
      setStagedTransactions([]);
    } catch (err) {
      console.error('Error adding transaction', err);
      alert(err.response?.data?.message || 'Failed to add transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)'
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '550px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              background: 'white'
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Add Transactions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add one or multiple entries for the day.</p>
            </div>

            {stagedTransactions.length > 0 && (
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Staged Items ({stagedTransactions.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stagedTransactions.map((tx, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <span style={{ fontWeight: 700, color: tx.type === 'expense' ? 'var(--error)' : 'var(--success)', marginRight: '0.5rem' }}>
                          ₹{tx.amount}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{tx.categoryName}</span>
                        {tx.note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>• {tx.note}</span>}
                      </div>
                      <button onClick={() => handleRemoveStaged(idx)} style={{ color: 'var(--error)', padding: '2px' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: 'var(--radius-lg)' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontSize: '0.85rem', fontWeight: 700,
                    background: formData.type === 'expense' ? 'white' : 'transparent',
                    color: formData.type === 'expense' ? 'var(--error)' : 'var(--text-muted)',
                    boxShadow: formData.type === 'expense' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ArrowDownCircle size={16} />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontSize: '0.85rem', fontWeight: 700,
                    background: formData.type === 'income' ? 'white' : 'transparent',
                    color: formData.type === 'income' ? 'var(--success)' : 'var(--text-muted)',
                    boxShadow: formData.type === 'income' ? '0 4px 6px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ArrowUpCircle size={16} />
                  Income
                </button>
              </div>

              {/* Amount Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>Amount</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>₹</div>
                  <input
                    type="number" step="0.01" placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.25rem', fontSize: '1.1rem', fontWeight: 800, border: '2px solid #f1f5f9', background: '#f8fafc', borderRadius: '12px' }}
                  />
                </div>
              </div>

              {/* Category / Source */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  {formData.type === 'income' ? 'Source of Income' : 'Category'}
                </label>
                <div style={{ position: 'relative' }}>
                  {formData.type === 'income' ? (
                    <input
                      type="text" placeholder="e.g. Freelance, Salary"
                      value={formData.otherDetail}
                      onChange={(e) => setFormData({ ...formData, otherDetail: e.target.value })}
                      style={{ width: '100%', border: '2px solid #f1f5f9', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  ) : (
                    <select
                      value={formData.moduleId}
                      onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: 600, borderRadius: '12px' }}
                    >
                      <option value="" disabled>Select a category</option>
                      {modules.filter(m => m.type === 'expense').map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                      <option value="other_special">Other</option>
                    </select>
                  )}
                </div>
                {formData.type === 'expense' && (formData.moduleId === 'other_special' || modules.find(m => m._id === formData.moduleId)?.name === 'Other') && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '0.4rem' }}>
                    <input
                      type="text" placeholder="Specify other category"
                      value={formData.otherDetail}
                      onChange={(e) => setFormData({ ...formData, otherDetail: e.target.value })}
                      style={{ width: '100%', border: '2px solid #f1f5f9', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  </motion.div>
                )}
              </div>

              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>Date</label>
                  <DatePicker
                    selected={new Date(formData.date)}
                    onChange={(date) => setFormData({ ...formData, date: date.toISOString().split('T')[0] })}
                    dateFormat="dd/MM/yyyy"
                    className="premium-datepicker"
                    wrapperClassName="datepicker-wrapper"
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>Note</label>
                  <input
                    type="text" placeholder="Short note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    style={{ width: '100%', border: '2px solid #f1f5f9', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleAddMore}
                  style={{ 
                    flex: 1, padding: '0.875rem', borderRadius: '12px', border: '2px solid #e2e8f0',
                    background: 'white', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <Tag size={18} />
                  Add More
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  className="btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', borderRadius: '12px' }}
                >
                  {isSubmitting ? 'Saving...' : (stagedTransactions.length > 0 ? `Save All (${stagedTransactions.length + (formData.amount ? 1 : 0)})` : 'Save Transaction')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


export default AddTransactionModal;
