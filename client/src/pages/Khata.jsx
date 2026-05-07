import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Trash2, 
  ChevronRight, 
  History, 
  X, 
  Plus, 
  MessageSquare,
  IndianRupee,
  Clock,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Phone,
  MessageCircle,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { useSearch } from '../context/SearchContext';

const Khata = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [khatas, setKhatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKhata, setSelectedKhata] = useState(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'gave', amount: '', description: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all'); 
  
  const [newParty, setNewParty] = useState({
    personName: '',
    phoneNumber: '',
    openingBalance: '',
    openingBalanceType: 'give',
    partyType: 'customer',
    gstin: '',
    address: ''
  });

  const fetchKhatas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/khata');
      setKhatas(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching khatas', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhatas();
  }, []);

  const handleCreatePerson = async (e) => {
    e.preventDefault();
    if (!newParty.personName.trim()) return;
    try {
      setActionLoading(true);
      await api.post('/khata', newParty);
      setNewParty({
        personName: '',
        phoneNumber: '',
        openingBalance: '',
        openingBalanceType: 'give',
        partyType: 'customer',
        gstin: '',
        address: ''
      });
      setShowAddPerson(false);
      fetchKhatas();
    } catch (err) {
      console.error('Error creating person', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/khata/${selectedKhata._id}/transaction`, newTx);
      setSelectedKhata(res.data);
      setNewTx({ type: 'gave', amount: '', description: '' });
      setShowAddTransaction(false);
      fetchKhatas();
    } catch (err) {
      console.error('Error adding transaction', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePerson = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure? All transaction history for this person will be deleted.')) return;
    try {
      await api.delete(`/khata/${id}`);
      if (selectedKhata?._id === id) setSelectedKhata(null);
      fetchKhatas();
    } catch (err) {
      console.error('Error deleting person', err);
    }
  };

  const filteredKhatas = useMemo(() => {
    return khatas.filter(k => {
      const matchesSearch = k.personName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ? true : 
                          filter === 'get' ? k.netBalance > 0 : 
                          k.netBalance < 0;
      return matchesSearch && matchesFilter;
    });
  }, [khatas, searchQuery, filter]);

  const totalToGet = khatas.filter(k => k.netBalance > 0).reduce((sum, k) => sum + k.netBalance, 0);
  const totalToGive = Math.abs(khatas.filter(k => k.netBalance < 0).reduce((sum, k) => sum + k.netBalance, 0));

  const groupedTransactions = useMemo(() => {
    if (!selectedKhata) return [];
    const groups = {};
    [...selectedKhata.transactions].reverse().forEach(tx => {
      const date = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return Object.entries(groups);
  }, [selectedKhata]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
      
      {/* Header & Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Friend Khata</h1>
            <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>Track money you give or get from friends.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="premium-card" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>You'll Give</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>₹{totalToGive.toLocaleString('en-IN')}</h3>
          </div>
          <div className="premium-card" style={{ padding: '1rem', borderLeft: '4px solid #10b981' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>You'll Get</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>₹{totalToGet.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedKhata ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Search friends..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.25rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}
                />
              </div>
              <button 
                style={{ padding: '0.7rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b' }}
                onClick={() => setFilter(filter === 'all' ? 'get' : filter === 'get' ? 'give' : 'all')}
              >
                <Filter size={18} />
              </button>
            </div>

            {/* Customer List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredKhatas.map(khata => (
                <motion.div
                  key={khata._id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedKhata(khata)}
                  className="premium-card"
                  style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                >
                  <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2563eb', fontSize: '1rem', border: '1px solid #e2e8f0' }}>
                    {khata.personName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.1rem' }}>{khata.personName}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8' }}>
                      <Clock size={12} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{khata.transactions.length > 0 ? 'Last updated recently' : 'No entries yet'}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 900, color: khata.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                      ₹{Math.abs(khata.netBalance).toLocaleString('en-IN')}
                    </p>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7, color: khata.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                      {khata.netBalance >= 0 ? 'To Get' : 'To Give'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {filteredKhatas.length === 0 && (
                <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <UserPlus size={24} color="#cbd5e1" />
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#64748b' }}>No friends found</h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Add a new friend to start tracking.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)' }}
          >
            {/* Ledger Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => setSelectedKhata(null)} style={{ background: '#f1f5f9', border: 'none', color: '#1e293b', cursor: 'pointer', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
                  <ArrowLeft size={20} />
                </button>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                  {selectedKhata.personName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{selectedKhata.personName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedKhata.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>₹{Math.abs(selectedKhata.netBalance).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>{selectedKhata.netBalance >= 0 ? 'To Get' : 'To Give'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <a href={`tel:${selectedKhata.phoneNumber}`} style={{ padding: '0.6rem', borderRadius: '12px', background: '#f1f5f9', color: '#2563eb', display: 'flex' }}><Phone size={18} /></a>
                <a href={`https://wa.me/91${selectedKhata.phoneNumber}`} target="_blank" rel="noreferrer" style={{ padding: '0.6rem', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex' }}><MessageCircle size={18} /></a>
                <button onClick={() => handleDeletePerson(selectedKhata._id)} style={{ padding: '0.6rem', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', border: 'none' }}><Trash2 size={18} /></button>
              </div>
            </div>

            {/* Transactions Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
              {groupedTransactions.map(([date, transactions]) => (
                <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                    <span style={{ background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{date}</span>
                  </div>
                  {transactions.map(tx => (
                    <div 
                      key={tx._id} 
                      style={{ 
                        alignSelf: tx.type === 'gave' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: tx.type === 'gave' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div 
                        style={{ 
                          padding: '0.75rem 1rem', 
                          background: tx.type === 'gave' ? '#fff1f2' : '#f0fdf4', 
                          borderRadius: tx.type === 'gave' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          border: `1px solid ${tx.type === 'gave' ? '#ffe4e6' : '#dcfce7'}`,
                          position: 'relative'
                        }}
                      >
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>{tx.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: tx.type === 'gave' ? '#e11d48' : '#16a34a' }}>₹{tx.amount.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {selectedKhata.transactions.length === 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', opacity: 0.6 }}>
                  <BookOpen size={48} style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 700 }}>No entries found</p>
                  <p style={{ fontSize: '0.75rem' }}>Start by adding "I Gave" or "I Got" entries.</p>
                </div>
              )}
            </div>

            {/* Quick Action Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => { setNewTx({ ...newTx, type: 'gave' }); setShowAddTransaction(true); }}
                style={{ padding: '1rem', borderRadius: '16px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
              >
                YOU GAVE ₹
              </button>
              <button 
                onClick={() => { setNewTx({ ...newTx, type: 'got' }); setShowAddTransaction(true); }}
                style={{ padding: '1rem', borderRadius: '16px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              >
                YOU GOT ₹
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Party - Centered Modal */}
      <AnimatePresence>
        {showAddPerson && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '1.5rem' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPerson(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ width: '100%', maxWidth: '400px', background: 'white', borderRadius: '24px', position: 'relative', display: 'flex', flexDirection: 'column', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Add New Friend</h3>
                <button onClick={() => setShowAddPerson(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%', color: '#64748b' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                  <input autoFocus placeholder="Enter name" value={newParty.personName} onChange={(e) => setNewParty({...newParty, personName: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', fontWeight: 600, background: '#f8fafc' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="tel" placeholder="10-digit mobile" value={newParty.phoneNumber} onChange={(e) => setNewParty({...newParty, phoneNumber: e.target.value})} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', fontWeight: 600, background: '#f8fafc' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Opening Balance</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#94a3b8' }}>₹</span>
                      <input type="number" placeholder="0" value={newParty.openingBalance} onChange={(e) => setNewParty({...newParty, openingBalance: e.target.value})} style={{ width: '100%', padding: '0.85rem 0.85rem 0.85rem 1.75rem', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, background: '#f8fafc' }} />
                    </div>
                    <select value={newParty.openingBalanceType} onChange={(e) => setNewParty({...newParty, openingBalanceType: e.target.value})} style={{ width: '100px', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0 0.5rem', fontWeight: 700, fontSize: '0.75rem', background: 'white' }}>
                      <option value="give">I GAVE</option>
                      <option value="got">I GOT</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={actionLoading || !newParty.personName} style={{ width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '1rem', marginTop: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                  {actionLoading ? 'Saving...' : 'Add Friend'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction - Bottom Sheet */}
      <AnimatePresence>
        {showAddTransaction && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'flex-end', zIndex: 5000 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddTransaction(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ width: '100%', background: 'white', borderRadius: '32px 32px 0 0', position: 'relative', display: 'flex', flexDirection: 'column', padding: '1.5rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 1.5rem auto' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{newTx.type === 'gave' ? 'You Gave Money' : 'You Got Money'}</h3>
                <button onClick={() => setShowAddTransaction(false)} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '50%' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Amount</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, fontSize: '1.2rem', color: newTx.type === 'gave' ? '#ef4444' : '#10b981' }}>₹</span>
                    <input autoFocus type="number" placeholder="0.00" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: e.target.value})} style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', border: '2px solid #f1f5f9', borderRadius: '20px', fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Note / Description</label>
                  <input placeholder="What was this for?" value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})} style={{ width: '100%', padding: '1rem', border: '2px solid #f1f5f9', borderRadius: '16px', fontSize: '1rem', fontWeight: 600 }} />
                </div>
                <button type="submit" disabled={actionLoading || !newTx.amount} style={{ width: '100%', padding: '1.1rem', background: newTx.type === 'gave' ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 4px 15px ${newTx.type === 'gave' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}` }}>
                  {actionLoading ? 'Saving Entry...' : 'Confirm Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!selectedKhata && !showAddPerson && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAddPerson(true)}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          <UserPlus size={24} />
        </motion.button>
      )}
    </div>
  );
};

export default Khata;
