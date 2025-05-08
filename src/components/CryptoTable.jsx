import React from 'react';
import { useSelector } from 'react-redux';
import CryptoRow from './CryptoRow';
import { selectAvailableCurrencies, selectCurrencySymbol } from '../features/currency/currencySlice';

const CryptoTable = ({ cryptoData, loading, selectedCurrency, setSelectedCurrency }) => {
  // Get available currencies from Redux
  const availableCurrencies = useSelector(selectAvailableCurrencies);
  // Get currency symbol from Redux
  const currencySymbol = useSelector(selectCurrencySymbol);

  // Handle currency change
  const handleCurrencyChange = (e) => {
    setSelectedCurrency(e.target.value);
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-6xl mx-auto">
        <div className="h-8 bg-gray-700 rounded w-full max-w-xl mb-4"></div>
        <div className="h-80 bg-gray-800 rounded w-full mb-4"></div>
        <p className="text-gray-400 text-center">Loading cryptocurrency data...</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold mb-4 sm:mb-0 hover:text-blue-400 transition-colors duration-200">Top Cryptocurrencies</h2>
        
        <div className="flex items-center">
          <label htmlFor="currency-select" className="mr-2 text-gray-400 hover:text-white transition-colors duration-200">Currency:</label>
          <select 
            id="currency-select" 
            value={selectedCurrency} 
            onChange={handleCurrencyChange}
            className="bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            {availableCurrencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    
      <div className="rounded-lg shadow-lg border border-gray-800 hover:border-gray-700 transition-colors duration-300">
        <div className="w-full">
          <table className="w-full" style={{ tableLayout: 'auto', borderSpacing: '0' }}>
            <thead className="bg-gray-900">
              <tr>
                <th className="py-3 pl-3 pr-1 text-left font-medium hover:bg-gray-800 transition-colors duration-200" style={{ width: '10%' }}>Asset</th>
                <th className="py-3 px-1 text-right font-medium hover:bg-gray-800 transition-colors duration-200" style={{ width: '12%' }}>Price ({currencySymbol})</th>
                <th className="py-3 px-1 text-right font-medium hover:bg-gray-800 transition-colors duration-200" style={{ width: '8%' }}>1h %</th>
                <th className="py-3 px-1 text-right font-medium hover:bg-gray-800 transition-colors duration-200" style={{ width: '8%' }}>24h %</th>
                <th className="py-3 px-1 text-right font-medium hover:bg-gray-800 transition-colors duration-200" style={{ width: '8%' }}>7d %</th>
                <th className="py-3 px-1 text-right font-medium hidden md:table-cell hover:bg-gray-800 transition-colors duration-200" style={{ width: '14%' }}>Market Cap</th>
                <th className="py-3 px-1 text-right font-medium hidden lg:table-cell hover:bg-gray-800 transition-colors duration-200" style={{ width: '12%' }}>Volume (24h)</th>
                <th className="py-3 px-1 text-right font-medium hidden xl:table-cell hover:bg-gray-800 transition-colors duration-200" style={{ width: '10%' }}>Circulating Supply</th>
                <th className="py-3 px-1 text-center font-medium" style={{ width: '18%' }}>7d Chart</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {cryptoData.map(asset => (
                <CryptoRow key={asset.id} asset={asset} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CryptoTable; 