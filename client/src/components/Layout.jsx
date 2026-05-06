import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AddTransactionModal from './AddTransactionModal';
import { motion } from 'framer-motion';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = () => {
    // In a real app, this would be a context refresh, but here we just trigger reload 
    // to ensure all charts and lists update with new data
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar stays fixed on the left */}
      <Sidebar onAddTransaction={() => setIsModalOpen(true)} />
      
      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '0 2.5rem 2rem 2.5rem', overflowY: 'auto' }}>
        <Header />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ maxWidth: '1400px', margin: '0 auto' }}
        >
          <Outlet />
        </motion.div>
      </main>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={handleRefresh} 
      />
    </div>
  );
};

export default Layout;
