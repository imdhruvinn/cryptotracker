import { createSlice } from '@reduxjs/toolkit';

// Exchange rates for converting USD to other currencies
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.82,
  INR: 83.25,
  CNY: 7.09,
  CHF: 0.90,
  CAD: 1.37,
  AUD: 1.51
};

// Available currencies with symbols and names
const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' }
];

const initialState = {
  selectedCurrency: 'USD',
  exchangeRates: EXCHANGE_RATES,
  availableCurrencies: AVAILABLE_CURRENCIES
};

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
    updateExchangeRates: (state, action) => {
      state.exchangeRates = {
        ...state.exchangeRates,
        ...action.payload
      };
    },
    resetCurrency: () => initialState
  }
});

// Export actions
export const { 
  setSelectedCurrency, 
  updateExchangeRates,
  resetCurrency
} = currencySlice.actions;

// Selectors
export const selectSelectedCurrency = (state) => state.currency.selectedCurrency;
export const selectExchangeRates = (state) => state.currency.exchangeRates;
export const selectAvailableCurrencies = (state) => state.currency.availableCurrencies;
export const selectCurrencySymbol = (state) => {
  const { selectedCurrency, availableCurrencies } = state.currency;
  const currency = availableCurrencies.find(c => c.code === selectedCurrency);
  return currency ? currency.symbol : '$';
};

export default currencySlice.reducer; 