import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AddTransactionModal from './AddTransactionModal';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Mobile Toggle */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="show-mobile"
          style={{
            position: 'fixed',
            top: '1.25rem',
            left: '1rem',
            zIndex: 100,
            background: 'white',
            border: '1px solid var(--border)',
            padding: '0.6rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow)',
            cursor: 'pointer'
          }}
        >
          <Menu size={24} color="var(--primary)" />
        </button>
      )}

      {/* Sidebar - Handles both Desktop and Mobile Drawer */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onAddTransaction={() => setIsModalOpen(true)} 
      />
      
      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        padding: '0 2.5rem 2rem 2.5rem', 
        overflowY: 'auto',
        maxWidth: '100vw'
      }}>
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
