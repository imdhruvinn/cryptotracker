import React from 'react';

const PriceChange = ({ value }) => {
  const isPositive = value > 0;
  const colorClass = isPositive ? 'price-up' : value < 0 ? 'price-down' : 'text-gray-400';
  const sign = isPositive ? '+' : '';
  
  return (
    <span className={colorClass}>
      {sign}{value}%
    </span>
  );
};

export default PriceChange; 