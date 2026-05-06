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
  ChevronDown
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
  const [filter, setFilter] = useState('all'); // 'all', 'get', 'give'

  const [newParty, setNewParty] = useState({
    personName: '',
    phoneNumber: '',
    openingBalance: '',
    openingBalanceType: 'give',
    partyType: 'customer',
    gstin: '',
    address: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    e.stopPropagation();
    if (!window.confirm('Are you sure? All transaction history for this person will be deleted.')) return;
    try {
      await api.delete(`/khata/${id}`);
      if (selectedKhata?._id === id) setSelectedKhata(null);
      fetchKhatas();
    } catch (err) {
      console.error('Error deleting person', err);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await api.delete(`/khata/${selectedKhata._id}/transaction/${txId}`);
      setSelectedKhata(res.data);
      fetchKhatas();
    } catch (err) {
      console.error('Error deleting transaction', err);
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

  // Helper to group transactions by date
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
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
      {/* Top Bar - Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>YOU WILL GIVE:</span>
            <span style={{ fontWeight: 900, color: '#ef4444', fontSize: '1.1rem' }}>₹{totalToGive.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>YOU WILL GET:</span>
            <span style={{ fontWeight: 900, color: '#10b981', fontSize: '1.1rem' }}>₹{totalToGet.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowAddPerson(true)}
          style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <UserPlus size={18} />
          ADD CUSTOMER
        </button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {/* Left Side: Customers List */}
        <div style={{ background: 'white', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search customers" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'get', 'give'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    background: filter === f ? '#2563eb' : 'white',
                    color: filter === f ? 'white' : '#64748b'
                  }}
                >
                  {f === 'all' ? 'All' : f === 'get' ? 'You\'ll Get' : 'You\'ll Give'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>
            <span>NAME</span>
            <span style={{ textAlign: 'right' }}>AMOUNT</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.8rem' }}>Loading...</div>
            ) : filteredKhatas.map(khata => (
              <div
                key={khata._id}
                onClick={() => setSelectedKhata(khata)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 100px', 
                  padding: '1rem', 
                  cursor: 'pointer',
                  background: selectedKhata?._id === khata._id ? '#eff6ff' : 'white',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2563eb', fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                    {khata.personName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{khata.personName}</h4>
                    <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{khata.transactions.length} Transactions</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: khata.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                    ₹{Math.abs(khata.netBalance).toLocaleString('en-IN')}
                  </p>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>
                    {khata.netBalance >= 0 ? 'Get' : 'Give'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Ledger Detail */}
        <div style={{ background: 'white', display: 'flex', flexDirection: 'column' }}>
          {selectedKhata ? (
            <>
              {/* Ledger Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                    {selectedKhata.personName.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedKhata.personName}</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => {}} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Report</button>
                  <button onClick={(e) => handleDeletePerson(selectedKhata._id, e)} style={{ padding: '0.5rem', borderRadius: '6px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>

              {/* Transactions Area */}
              <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '0.5rem 1rem', background: 'white', borderRadius: '8px 8px 0 0', border: '1px solid #e2e8f0', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>
                  <span>ENTRIES</span>
                  <span style={{ textAlign: 'center' }}>GAVE</span>
                  <span style={{ textAlign: 'center' }}>GOT</span>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px', background: 'white' }}>
                  {groupedTransactions.map(([date, transactions]) => (
                    <div key={date}>
                      <div style={{ padding: '0.4rem 1rem', background: '#f1f5f9', fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>
                        {date}
                      </div>
                      {transactions.map(tx => (
                        <div key={tx._id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '1rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{tx.description}</p>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            {tx.type === 'gave' ? (
                              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ef4444' }}>₹{tx.amount.toLocaleString('en-IN')}</span>
                            ) : '-'}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            {tx.type === 'got' ? (
                              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981' }}>₹{tx.amount.toLocaleString('en-IN')}</span>
                            ) : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>TOTAL BALANCE</span>
                  <h4 style={{ fontWeight: 900, color: selectedKhata.netBalance >= 0 ? '#10b981' : '#ef4444' }}>
                    ₹{Math.abs(selectedKhata.netBalance).toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.6 }}>{selectedKhata.netBalance >= 0 ? 'to get' : 'to give'}</span>
                  </h4>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => { setNewTx({ ...newTx, type: 'gave' }); setShowAddTransaction(true); }}
                    style={{ padding: '0.75rem 2.5rem', borderRadius: '6px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    I GAVE ₹
                  </button>
                  <button 
                    onClick={() => { setNewTx({ ...newTx, type: 'got' }); setShowAddTransaction(true); }}
                    style={{ padding: '0.75rem 2.5rem', borderRadius: '6px', background: '#10b981', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                  >
                    I GOT ₹
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <BookOpen size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p style={{ fontWeight: 700 }}>Select a customer to view ledger</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Party Modal - High Fidelity Clone */}
      <AnimatePresence>
        {showAddPerson && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div onClick={() => setShowAddPerson(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ width: '450px', maxHeight: '90vh', background: 'white', borderRadius: '8px', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              {/* Modal Header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Add New Party</h3>
                <button onClick={() => setShowAddPerson(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
              </div>

              {/* Modal Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                <form id="add-party-form" onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Party Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Party Name</label>
                    <input 
                      autoFocus
                      placeholder="Enter Party Name"
                      value={newParty.personName}
                      onChange={(e) => setNewParty({...newParty, personName: e.target.value})}
                      style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Phone Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Phone Number</label>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(optional)</span>
                    </div>
                    <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <span style={{ padding: '0.75rem', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>+91</span>
                      <input 
                        placeholder="Enter Phone Number"
                        value={newParty.phoneNumber}
                        onChange={(e) => setNewParty({...newParty, phoneNumber: e.target.value})}
                        style={{ flex: 1, padding: '0.75rem', border: 'none', fontSize: '0.9rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Opening Balance */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Opening Balance</label>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(optional)</span>
                    </div>
                    <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <span style={{ padding: '0.75rem', background: '#f8fafc', borderRight: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>₹</span>
                      <input 
                        type="number"
                        placeholder="Enter amount"
                        value={newParty.openingBalance}
                        onChange={(e) => setNewParty({...newParty, openingBalance: e.target.value})}
                        style={{ flex: 1, padding: '0.75rem', border: 'none', fontSize: '0.9rem', outline: 'none' }}
                      />
                      <select 
                        value={newParty.openingBalanceType}
                        onChange={(e) => setNewParty({...newParty, openingBalanceType: e.target.value})}
                        style={{ padding: '0.75rem', border: 'none', borderLeft: '1px solid #e2e8f0', background: 'white', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="give">You Gave</option>
                        <option value="got">You Got</option>
                      </select>
                    </div>
                  </div>

                  {/* Who are they? */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Who are they?</label>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                        <input 
                          type="radio" 
                          name="partyType" 
                          checked={newParty.partyType === 'customer'}
                          onChange={() => setNewParty({...newParty, partyType: 'customer'})}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Customer
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
                        <input 
                          type="radio" 
                          name="partyType" 
                          checked={newParty.partyType === 'supplier'}
                          onChange={() => setNewParty({...newParty, partyType: 'supplier'})}
                          style={{ accentColor: '#2563eb' }}
                        />
                        Supplier
                      </label>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

                  {/* Advanced Section */}
                  <div>
                    <button 
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '0.5rem 0', cursor: 'pointer', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      Add GSTIN & Address (Optional)
                      <ChevronDown size={18} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                    </button>
                    {showAdvanced && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.8rem', color: '#64748b' }}>GSTIN</label>
                          <input 
                            placeholder="Enter GSTIN"
                            value={newParty.gstin}
                            onChange={(e) => setNewParty({...newParty, gstin: e.target.value})}
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Address</label>
                          <textarea 
                            placeholder="Enter Address"
                            value={newParty.address}
                            onChange={(e) => setNewParty({...newParty, address: e.target.value})}
                            style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', minHeight: '80px', resize: 'vertical' }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <button 
                  form="add-party-form"
                  type="submit" 
                  disabled={actionLoading || !newParty.personName}
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem', 
                    background: !newParty.personName ? '#e2e8f0' : '#2563eb', 
                    color: !newParty.personName ? '#94a3b8' : 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 700,
                    cursor: !newParty.personName ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Adding...' : 'Add Customer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTransaction && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div onClick={() => setShowAddTransaction(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '400px', background: 'white', padding: '2rem', borderRadius: '12px', position: 'relative' }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{newTx.type === 'gave' ? 'You Gave' : 'You Got'}</h3>
              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="number"
                  placeholder="Amount"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '1.25rem', fontWeight: 800 }}
                />
                <input 
                  placeholder="Description"
                  value={newTx.description}
                  onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                />
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  style={{ padding: '0.75rem', background: newTx.type === 'gave' ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700 }}
                >
                  Save Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Khata;
