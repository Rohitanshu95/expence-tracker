import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', onConfirm, confirmText = 'OK', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="text-blue-500" size={48} />,
    success: <CheckCircle className="text-green-500" size={48} />,
    warning: <AlertCircle className="text-amber-500" size={48} />,
    danger: <AlertCircle className="text-red-500" size={48} />
  };

  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }} onClick={onClose}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            background: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: '#f8fafc',
              border: 'none',
              borderRadius: '50%',
              padding: '0.5rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              padding: '1.25rem', 
              background: `${colors[type]}15`, 
              borderRadius: '20px',
              color: colors[type]
            }}>
              {icons[type]}
            </div>
          </div>

          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 800, 
            color: '#1e293b', 
            marginBottom: '0.75rem' 
          }}>
            {title}
          </h3>
          
          <p style={{ 
            color: '#64748b', 
            lineHeight: 1.6, 
            fontSize: '0.95rem',
            marginBottom: '2rem'
          }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            {onConfirm && (
              <button 
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {cancelText}
              </button>
            )}
            <button 
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              style={{
                flex: 1,
                padding: '0.85rem',
                borderRadius: '14px',
                border: 'none',
                background: colors[type],
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${colors[type]}30`
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
