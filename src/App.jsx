import React, { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import CryptoTable from "./components/CryptoTable";
import { fetchInitialData, startWebSocketConnection } from "./features/crypto/cryptoSlice";
import { selectSelectedCurrency, setSelectedCurrency } from "./features/currency/currencySlice";
import { setupRefreshIntervals } from "./features/chart/chartSlice";
import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const cryptoStatus = useSelector(state => state.crypto.status);
  const error = useSelector(state => state.crypto.error);
  const cryptoData = useSelector(state => state.crypto.data);
  
  useEffect(() => {
    // Fetch initial data
    dispatch(fetchInitialData());
    
    // Start WebSocket connection
    const cleanupWebSocket = dispatch(startWebSocketConnection());
    
    // Setup refresh intervals
    const cleanupIntervals = dispatch(setupRefreshIntervals());
    
    // Cleanup function
    return () => {
      cleanupWebSocket();
      cleanupIntervals();
    };
  }, [dispatch]);
  
  const handleCurrencyChange = (currency) => {
    dispatch(setSelectedCurrency(currency));
  };
  
  const loading = cryptoStatus === 'loading';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Cryptocurrency Tracker</h1>
        <p className="text-gray-400">Track cryptocurrency prices in real-time</p>
      </header>
      
      {error && (
        <div className="bg-red-900 text-white p-4 rounded mb-6">
          Error: {error}
        </div>
      )}
      
      <CryptoTable 
        cryptoData={cryptoData} 
        loading={loading} 
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={handleCurrencyChange}
      />
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Data updates automatically. All prices are delayed by at most 1 minute.</p>
        <p className="mt-2">© 2024 Crypto Tracker</p>
      </footer>
    </div>
  );
};

export default App; 