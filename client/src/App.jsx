import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Modules from './pages/Modules';
import FinanceView from './pages/FinanceView';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import CanteenTracker from './pages/CanteenTracker';
import Khata from './pages/Khata';

import { SearchProvider } from './context/SearchContext';

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/income" element={<FinanceView type="income" />} />
              <Route path="/expenses" element={<FinanceView type="expense" />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/canteen" element={<CanteenTracker />} />
              <Route path="/khata" element={<Khata />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
