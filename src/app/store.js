import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from '../features/crypto/cryptoSlice';
import currencyReducer from '../features/currency/currencySlice';
import chartReducer from '../features/chart/chartSlice';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    currency: currencyReducer,
    chart: chartReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Allow non-serializable data like Dates
    }),
}); 