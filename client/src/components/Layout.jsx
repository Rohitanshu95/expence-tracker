import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import AddTransactionModal from './AddTransactionModal';
import { motion } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener('toggleSidebar', handleToggle);
    return () => window.removeEventListener('toggleSidebar', handleToggle);
  }, []);

  // Close sidebar and modal on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsModalOpen(false);
  }, [location]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="app-container">
      {/* Sidebar - Remains as a hidden drawer for "More" options */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onAddTransaction={() => setIsModalOpen(true)} 
      />
      
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mobile-container-wrapper"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation onAddTransaction={() => setIsModalOpen(true)} />

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={handleRefresh} 
      />
    </div>
  );
};

export default Layout;
