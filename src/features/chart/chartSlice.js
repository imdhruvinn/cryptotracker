import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastChartUpdate: Date.now(),
  shouldUpdateCharts: false,
  lastPriceUpdate: Date.now(),
  shouldUpdatePrices: false,
  refreshIntervals: {
    price: 1500, // 1.5 seconds for price updates
    chart: 3600000 // 1 hour for chart updates
  }
};

export const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setLastChartUpdate: (state) => {
      state.lastChartUpdate = Date.now();
    },
    setShouldUpdateCharts: (state, action) => {
      state.shouldUpdateCharts = action.payload;
    },
    setLastPriceUpdate: (state) => {
      state.lastPriceUpdate = Date.now();
    },
    setShouldUpdatePrices: (state, action) => {
      state.shouldUpdatePrices = action.payload;
    },
    setRefreshInterval: (state, action) => {
      const { type, interval } = action.payload;
      if (state.refreshIntervals[type] !== undefined) {
        state.refreshIntervals[type] = interval;
      }
    },
    triggerChartUpdate: (state) => {
      state.lastChartUpdate = Date.now();
      state.shouldUpdateCharts = true;
    },
    triggerPriceUpdate: (state) => {
      state.lastPriceUpdate = Date.now();
      state.shouldUpdatePrices = true;
    },
    resetChartState: () => initialState
  }
});


export const {
  setLastChartUpdate,
  setShouldUpdateCharts,
  setLastPriceUpdate,
  setShouldUpdatePrices,
  setRefreshInterval,
  triggerChartUpdate,
  triggerPriceUpdate,
  resetChartState
} = chartSlice.actions;


export const selectLastChartUpdate = (state) => state.chart.lastChartUpdate;
export const selectShouldUpdateCharts = (state) => state.chart.shouldUpdateCharts;
export const selectLastPriceUpdate = (state) => state.chart.lastPriceUpdate;
export const selectShouldUpdatePrices = (state) => state.chart.shouldUpdatePrices;
export const selectRefreshIntervals = (state) => state.chart.refreshIntervals;


export const setupRefreshIntervals = () => (dispatch, getState) => {
  const { price: priceInterval, chart: chartInterval } = getState().chart.refreshIntervals;
  

  const priceUpdateInterval = setInterval(() => {
    dispatch(triggerPriceUpdate());
    
    // Reset flag after a short delay
    setTimeout(() => {
      dispatch(setShouldUpdatePrices(false));
    }, 100);
  }, priceInterval);
  

  const chartUpdateInterval = setInterval(() => {
    dispatch(triggerChartUpdate());
    
    // Reset flag after a short delay
    setTimeout(() => {
      dispatch(setShouldUpdateCharts(false));
    }, 1000);
  }, chartInterval);
  

  return () => {
    clearInterval(priceUpdateInterval);
    clearInterval(chartUpdateInterval);
  };
};

export default chartSlice.reducer; 