import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCryptoData, startWebSocket } from '../../services/cryptoAPI';

// Initial state structure
const initialState = {
  data: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastUpdated: null,
  socketConnected: false,
  lastPriceUpdate: Date.now()
};

// Async thunk for fetching initial crypto data
export const fetchInitialData = createAsyncThunk(
  'crypto/fetchInitialData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCryptoData();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Crypto slice definition
export const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updatePriceData: (state, action) => {
      const updates = action.payload;
      
      // Apply price updates to existing data
      state.data = state.data.map(crypto => {
        const update = updates.find(u => u.symbol === crypto.symbol);
        if (update) {
          return {
            ...crypto,
            current_price: update.price,
            price_change_percentage_24h: update.price_change_percentage_24h,
            price_change_percentage_1h_in_currency: update.price_change_percentage_1h
          };
        }
        return crypto;
      });
      
      state.lastPriceUpdate = Date.now();
    },
    
    setSocketStatus: (state, action) => {
      state.socketConnected = action.payload;
    },

    resetState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch data';
      });
  }
});

// Export actions
export const { 
  updatePriceData, 
  setSocketStatus,
  resetState
} = cryptoSlice.actions;

// Selectors
export const selectAllCrypto = (state) => state.crypto.data;
export const selectCryptoBySymbol = (state, symbol) => 
  state.crypto.data.find(crypto => crypto.symbol === symbol);
export const selectCryptoStatus = (state) => state.crypto.status;
export const selectCryptoError = (state) => state.crypto.error;
export const selectLastPriceUpdate = (state) => state.crypto.lastPriceUpdate;
export const selectSocketConnected = (state) => state.crypto.socketConnected;

// Thunk for managing WebSocket connection
export const startWebSocketConnection = () => (dispatch) => {
  const { cleanup } = startWebSocket((updatedData) => {
    if (updatedData && updatedData.length > 0) {
      dispatch(updatePriceData(updatedData));
    }
  });
  
  dispatch(setSocketStatus(true));
  
  // Return cleanup function to be used when component unmounts
  return cleanup;
};

export default cryptoSlice.reducer; 