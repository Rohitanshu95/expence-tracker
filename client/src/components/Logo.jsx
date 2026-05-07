import React from 'react';

const Logo = ({ size = 32 }) => {
  return (
    <img 
      src="/logo.png" 
      alt="ExpenseFlow Logo" 
      style={{ 
        width: size, 
        height: size, 
        objectFit: 'contain',
        borderRadius: size > 40 ? '12px' : '8px'
      }} 
    />
  );
};

export default Logo;
