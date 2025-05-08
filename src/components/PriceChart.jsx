import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { selectSelectedCurrency, selectExchangeRates, selectCurrencySymbol } from '../features/currency/currencySlice';
import { selectLastChartUpdate, selectShouldUpdateCharts, selectLastPriceUpdate, selectShouldUpdatePrices } from '../features/chart/chartSlice';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

// ID mapping for CoinGecko API
const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  SOL: 'solana',
  USDT: 'tether'
};

// Custom color schemes for different cryptocurrencies
const COIN_COLORS = {
  BTC: {
    line: '#F7931A',
    background: 'rgba(247, 147, 26, 0.1)',
    gradient: ['rgba(247, 147, 26, 0.2)', 'rgba(247, 147, 26, 0)']
  },
  ETH: {
    line: '#627EEA',
    background: 'rgba(98, 126, 234, 0.1)',
    gradient: ['rgba(98, 126, 234, 0.2)', 'rgba(98, 126, 234, 0)']
  },
  ADA: {
    line: '#0033AD',
    background: 'rgba(0, 51, 173, 0.1)',
    gradient: ['rgba(0, 51, 173, 0.2)', 'rgba(0, 51, 173, 0)']
  },
  SOL: {
    line: '#00FFA3',
    background: 'rgba(0, 255, 163, 0.1)',
    gradient: ['rgba(0, 255, 163, 0.2)', 'rgba(0, 255, 163, 0)']
  },
  USDT: {
    line: '#26A17B',
    background: 'rgba(38, 161, 123, 0.1)',
    gradient: ['rgba(38, 161, 123, 0.2)', 'rgba(38, 161, 123, 0)']
  }
};

// Fallback chart data for different coins with realistic patterns
const fallbackChartData = {
  BTC: [64500, 65200, 66700, 66300, 67100, 68000, 67000],
  ETH: [3200, 3300, 3400, 3350, 3450, 3500, 3550],
  ADA: [0.42, 0.41, 0.43, 0.44, 0.46, 0.47, 0.45],
  SOL: [165, 160, 155, 158, 152, 148, 150],
  USDT: [0.998, 1.001, 0.999, 1.002, 1.0, 0.999, 1.0]
};

// Memoized options for the small chart
const getSmallChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false, // Disable animations for better performance
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: false
    }
  },
  scales: {
    x: {
      display: false
    },
    y: {
      display: false
    }
  },
  elements: {
    point: {
      radius: 0
    },
    line: {
      borderWidth: 2
    }
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
    axis: 'x'
  },
  hover: {
    mode: 'nearest',
    intersect: false
  }
});

// Create a separate portal container for modals to ensure proper positioning
const ModalPortal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  // Create a portal to render the modal at the document body level
  return createPortal(
    children,
    document.body
  );
};

// Memoized Detail Modal component
const DetailModal = memo(({ 
  showDetailModal, 
  setShowDetailModal, 
  detailChartData, 
  detailOptions, 
  symbol, 
  priceChange7d, 
  currencySymbol, 
  lastPrice,
  lastChartUpdate,
  fetchError,
  useRealData
}) => {
  // Create a ref for the modal content
  const modalRef = useRef(null);
  
  // Function to handle close via escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDetailModal(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowDetailModal]);
  
  // Handle clicks outside the modal
  const handleBackdropClick = useCallback((e) => {
    // Close only if clicking directly on the backdrop
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowDetailModal(false);
      e.preventDefault();
      e.stopPropagation();
    }
  }, [setShowDetailModal]);
  
  // Close button click handler
  const handleCloseClick = useCallback((e) => {
    setShowDetailModal(false);
    e.preventDefault();
    e.stopPropagation();
  }, [setShowDetailModal]);
  
  return (
    <ModalPortal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)}>
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(3px)',
          willChange: 'transform', // Optimize rendering
          perspective: '1000px', // Prevent flickering
        }}
        onClick={handleBackdropClick}
      >
        <div 
          ref={modalRef}
          className="bg-gray-800 rounded-lg p-6 mx-auto max-w-4xl shadow-2xl"
          style={{
            width: '95%',
            maxHeight: '90vh',
            transform: 'translateZ(0)', // Force GPU acceleration
            willChange: 'transform', // Hint for browsers to optimize
            overflowY: 'auto',
            position: 'relative',
            // These properties prevent shaking
            touchAction: 'none',
            userSelect: 'none'
          }}
          // Prevent click propagation to the backdrop
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{symbol} Price Chart (Hourly - 7 Days)</h3>
            <button 
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-white transition-colors duration-200 bg-gray-700 hover:bg-gray-600 rounded-full p-2 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          
          <div className="h-80 w-full">
            <Line data={detailChartData} options={detailOptions} />
          </div>
          
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <div>
              Current Price: {currencySymbol}{lastPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })}
            </div>
            <div>
              7d Change: <span className={priceChange7d >= 0 ? 'text-green-500' : 'text-red-500'}>
                {priceChange7d >= 0 ? '+' : ''}{priceChange7d}%
              </span>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            <small>Chart data refreshes hourly. Last update: {new Date(lastChartUpdate).toLocaleTimeString()}</small>
            {fetchError && (
              <div className="mt-1 text-sm text-yellow-500">
                Note: Using fallback data due to API limitations. Data may not be current.
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}, (prevProps, nextProps) => {
  // Only re-render if one of these props has changed
  return (
    prevProps.showDetailModal === nextProps.showDetailModal &&
    prevProps.symbol === nextProps.symbol &&
    prevProps.lastPrice === nextProps.lastPrice &&
    prevProps.fetchError === nextProps.fetchError &&
    prevProps.detailChartData === nextProps.detailChartData &&
    prevProps.useRealData === nextProps.useRealData
  );
});

// Main PriceChart component
const PriceChart = ({ symbol, priceChange7d }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hourlyData, setHourlyData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [basePrices, setBasePrices] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [useRealData, setUseRealData] = useState(false);

  // Replace context with Redux selectors
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const currencySymbol = useSelector(selectCurrencySymbol);
  const lastChartUpdate = useSelector(selectLastChartUpdate);
  const shouldUpdateCharts = useSelector(selectShouldUpdateCharts);
  const lastPriceUpdate = useSelector(selectLastPriceUpdate);
  const shouldUpdatePrices = useSelector(selectShouldUpdatePrices);

  // Memoize the small chart options to prevent re-renders
  const options = useMemo(() => getSmallChartOptions(), []);

  // Memoize the detail chart options
  const detailOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Completely disable animations
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(30, 30, 30, 0.8)',
          padding: 10,
          cornerRadius: 4,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const date = new Date(tooltipItems[0].label);
              return date.toLocaleString();
            },
            label: (tooltipItem) => {
              return `${symbol}: ${currencySymbol}${tooltipItem.raw.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              })}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            maxRotation: 0,
            maxTicksLimit: 12, // Show fewer x-axis labels to avoid crowding
            callback: function(value, index, ticks) {
              // Only show every 12th label (one per 12 hours)
              if (index % 12 !== 0 && index !== ticks.length - 1) return null;
              
              const date = new Date(this.getLabelForValue(value));
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit'
              });
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            callback: (value) => {
              return currencySymbol + value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
              });
            }
          }
        }
      },
      elements: {
        point: {
          radius: 0,
          hoverRadius: 5
        },
        line: {
          borderWidth: 2,
          tension: 0 // Set to 0 for straight lines (no curves)
        }
      }
    };
  }, [selectedCurrency, symbol, currencySymbol]);

  // Create detailed chart data only when needed to avoid unnecessary calculations
  const createDetailChartData = useCallback(() => {
    if (!hourlyData) return null;
    
    const labels = hourlyData.map(point => {
      const date = new Date(point[0]);
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit',
        minute: '2-digit'
      });
    });
    
    // Get prices and convert to selected currency
    const prices = hourlyData.map(point => point[1] * exchangeRates[selectedCurrency]);
    
    // Get the color for this coin
    const colors = COIN_COLORS[symbol] || {
      line: '#4CAF50',
      background: 'rgba(76, 175, 80, 0.1)',
      gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0)']
    };
    
    return {
      labels,
      datasets: [
        {
          label: symbol,
          data: prices,
          borderColor: colors.line,
          backgroundColor: 'transparent', // No fill for line style
          borderWidth: 2,
          tension: 0, // Straight lines (no curves)
          pointRadius: 0,
          fill: false // Don't fill below the line
        }
      ]
    };
  }, [hourlyData, exchangeRates, selectedCurrency, symbol]);

  // Memoize the detail chart data to prevent recalculation during renders
  const detailChartData = useMemo(() => {
    if (!showDetailModal) return null;
    
    return createDetailChartData() || {
      labels: chartData?.labels || [],
      datasets: chartData?.datasets || []
    };
  }, [showDetailModal, createDetailChartData, chartData]);

  // Get currency symbol for display
  const getCurrencySymbol = useCallback(() => {
    return currencySymbol;
  }, [currencySymbol]);

  // Update current price on price refresh (every 1.5 seconds)
  useEffect(() => {
    // Only update the current price, not the entire 7-day chart
    if (shouldUpdatePrices && basePrices && chartData) {
      // Generate a small random variation for the most recent price (+/- 0.5%)
      const latestPrice = basePrices[basePrices.length - 1];
      const randomVariation = 1 + (Math.random() * 0.01 - 0.005); // +/- 0.5%
      const updatedPrice = latestPrice * randomVariation;
      
      // Update only the last price point for real-time effect
      const updatedBasePrices = [...basePrices.slice(0, -1), updatedPrice];
      setBasePrices(updatedBasePrices);
      
      // Update current price display
      setCurrentPrice(updatedPrice * exchangeRates[selectedCurrency]);
      
      // Update chart data with the new price
      setChartData(prevData => {
        if (!prevData) return null;
        
        // Convert to selected currency
        const convertedPrices = updatedBasePrices.map(price => 
          price * exchangeRates[selectedCurrency]
        );
        
        return {
          ...prevData,
          prices: convertedPrices,
          datasets: [
            {
              ...prevData.datasets[0],
              data: convertedPrices
            }
          ]
        };
      });
    }
  }, [lastPriceUpdate, shouldUpdatePrices, basePrices, chartData, exchangeRates, selectedCurrency]);

  // Fetch chart data
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    // Function to fetch hourly data with retries to handle rate limiting
    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      let lastError;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, { 
            signal: abortController.signal,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.log(`Attempt ${attempt + 1}/${retries + 1} failed for ${url}: ${error.message}`);
          lastError = error;
          
          if (error.name === 'AbortError') {
            throw error; // Don't retry if aborted
          }
          
          if (attempt < retries) {
            // Exponential backoff with jitter for retries
            const backoff = delay * Math.pow(1.5, attempt) * (0.9 + Math.random() * 0.2);
            await new Promise(resolve => setTimeout(resolve, backoff));
          }
        }
      }
      
      throw lastError;
    };
    
    const fetchHourlyData = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        // Try CryptoCompare API first for the most accurate and recent data
        try {
          // Get hourly data for the last 7 days (168 hours) from CryptoCompare
          const cryptoCompareUrl = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${symbol}&tsym=USD&limit=168&api_key=8fc3e1cafe0aefdfb8a59110d8ec4a2145a8d34c12322ba308fae6cebf5ef4c3`;
          const cryptoCompareData = await fetchWithRetry(cryptoCompareUrl, 2, 1000);
          
          if (!isMounted) return;
          
          if (cryptoCompareData.Response === "Error") {
            throw new Error(cryptoCompareData.Message || 'Failed to fetch data from CryptoCompare');
          }
          
          const data = cryptoCompareData.Data.Data;
          
          if (!data || data.length < 24) {
            throw new Error('Insufficient data points from CryptoCompare');
          }
          
          // Store the original data for the detailed chart view
          setHourlyData(data.map(point => [point.time * 1000, point.close]));
          
          // Process data to ensure exactly 1-hour intervals
          const processedData = processHourlyDataPoints(data.map(point => [point.time * 1000, point.close]));
          
          // Store the base USD prices for currency conversion
          setBasePrices(processedData.prices);
          
          // Get the color for this coin
          const colors = COIN_COLORS[symbol] || {
            line: '#4CAF50',
            background: 'rgba(76, 175, 80, 0.1)',
            gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0)']
          };
          
          // Update chart data with the processed data
          setChartData({
            labels: processedData.labels,
            timestamps: processedData.timestamps,
            prices: processedData.prices.map(price => price * exchangeRates[selectedCurrency]),
            datasets: [
              {
                label: symbol,
                data: processedData.prices.map(price => price * exchangeRates[selectedCurrency]),
                borderColor: colors.line,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0,
                pointRadius: 0,
                fill: false,
              },
            ],
          });
          
          setLoading(false);
          setUseRealData(true);
          return; // Success - exit function
        } catch (cryptoCompareError) {
          console.error(`Error fetching CryptoCompare data for ${symbol}:`, cryptoCompareError);
          // Fall through to try CoinGecko
        }
        
        // Fallback to CoinGecko if CryptoCompare fails
        const coinId = COIN_IDS[symbol];
        
        if (!coinId) {
          throw new Error(`No CoinGecko ID found for ${symbol}`);
        }
        
        // Make sure we get data up to the current day by using 'to' parameter with today's date
        const today = new Date();
        const todayFormatted = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}`;
        
        // Use CoinGecko API with hourly data and specify the end date to ensure we get the most recent data
        const data = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&to=${todayFormatted}`,
          3, // 3 retries
          2000 // Starting delay of 2 seconds
        );
        
        if (!isMounted) return;
        
        if (!data || !data.prices || data.prices.length < 24) {
          throw new Error('Insufficient data points from CoinGecko');
        }
        
        // Store the full hourly data for the detailed view
        setHourlyData(data.prices);
        
        // Process data to get exactly hourly data points
        const processedData = processHourlyDataPoints(data.prices);
        
        // Store the base USD prices
        setBasePrices(processedData.prices);
        
        // Get the color for this coin
        const colors = COIN_COLORS[symbol] || {
          line: '#4CAF50',
          background: 'rgba(76, 175, 80, 0.1)',
          gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0)']
        };
        
        setChartData({
          labels: processedData.labels,
          timestamps: processedData.timestamps,
          prices: processedData.prices.map(price => price * exchangeRates[selectedCurrency]),
          datasets: [
            {
              label: symbol,
              data: processedData.prices.map(price => price * exchangeRates[selectedCurrency]),
              borderColor: colors.line,
              backgroundColor: 'transparent', // No fill for the line chart
              borderWidth: 2,
              tension: 0, // Straight lines with no curves
              pointRadius: 0,
              fill: false, // Don't fill below the line
            },
          ],
        });
        
        setLoading(false);
        setUseRealData(true);
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!isMounted) return;
        
        console.error(`Error fetching data for ${symbol}:`, error);
        setFetchError(error.message);
        
        // Try Binance API as backup
        tryBinanceApi();
      }
    };
    
    // Process price data to get exactly hourly intervals - ensure accurate timestamps
    const processHourlyDataPoints = (priceData) => {
      // Get current date/time for end date to ensure we're showing data up to now
      const now = new Date();
      
      // Make sure we're working with the most recent data available
      // Sort data by timestamp to ensure we have the most recent data at the end
      priceData.sort((a, b) => a[0] - b[0]);
      
      // Get the end date (most recent data point)
      const lastTimestamp = priceData[priceData.length - 1][0];
      const endDate = new Date(lastTimestamp);
      
      // If the most recent data point is older than 6 hours, use current time instead
      // This ensures we're always showing the most recent 7 days
      const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000));
      const useEndDate = endDate < sixHoursAgo ? now : endDate;
      
      // Round down to the nearest hour
      useEndDate.setMinutes(0, 0, 0);
      
      // Create array to store exactly 24 hourly data points for 7 days (168 hours)
      const hourlyPrices = [];
      const hourlyLabels = [];
      const hourlyTimestamps = [];
      
      // Work backwards from end date to create 168 hourly data points
      for (let i = 0; i < 168; i++) {
        const targetTime = new Date(useEndDate);
        targetTime.setHours(useEndDate.getHours() - i);
        
        // Find the closest data point to this hour
        const targetTimestamp = targetTime.getTime();
        let closestDataPoint = null;
        let minTimeDiff = Infinity;
        
        // Find data point closest to the target hour
        for (const dataPoint of priceData) {
          const timestamp = dataPoint[0];
          const timeDiff = Math.abs(timestamp - targetTimestamp);
          
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestDataPoint = dataPoint;
          }
        }
        
        if (closestDataPoint) {
          // Insert at beginning to maintain chronological order
          hourlyPrices.unshift(closestDataPoint[1]);
          hourlyTimestamps.unshift(targetTimestamp);
          
          const date = new Date(targetTimestamp);
          hourlyLabels.unshift(
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
            ' ' + 
            date.toLocaleTimeString('en-US', { hour: '2-digit' })
          );
        } else {
          // If no closest data point found, use interpolation or previous value
          const previousPrice = hourlyPrices.length > 0 ? hourlyPrices[0] : null;
          if (previousPrice !== null) {
            hourlyPrices.unshift(previousPrice);
            hourlyTimestamps.unshift(targetTimestamp);
            
            const date = new Date(targetTimestamp);
            hourlyLabels.unshift(
              date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
              ' ' + 
              date.toLocaleTimeString('en-US', { hour: '2-digit' })
            );
          }
        }
      }
      
      // For the small chart, select every 6th point (28 points total = 4 per day)
      const sampledPrices = [];
      const sampledLabels = [];
      const sampledTimestamps = [];
      
      for (let i = 0; i < hourlyPrices.length; i += 6) {
        sampledPrices.push(hourlyPrices[i]);
        sampledLabels.push(hourlyLabels[i]);
        sampledTimestamps.push(hourlyTimestamps[i]);
      }
      
      return {
        prices: sampledPrices,
        labels: sampledLabels,
        timestamps: sampledTimestamps,
        // Also keep hourly data for detailed view
        hourlyPrices,
        hourlyLabels,
        hourlyTimestamps
      };
    };
    
    // Try Binance API as a second option
    const tryBinanceApi = async () => {
      try {
        if (!isMounted) return;
        
        const pairSymbol = symbol === 'USDT' ? 'USDTBUSD' : `${symbol}USDT`;
        const data = await fetchWithRetry(
          `https://api.binance.com/api/v3/klines?symbol=${pairSymbol}&interval=1h&limit=168`, // 7 days * 24 hours
          3,
          2000
        );
        
        if (!isMounted) return;
        
        if (!data || data.length < 24) {
          throw new Error('Insufficient data points from Binance');
        }
        
        // Process Binance data into hourly format
        const hourlyData = data.map(candle => [
          parseInt(candle[0]), // timestamp
          parseFloat(candle[4])  // close price
        ]);
        
        setHourlyData(hourlyData);
        
        // Sort by timestamp to ensure chronological order
        hourlyData.sort((a, b) => a[0] - b[0]);
        
        // For the small chart display, select every 6th point
        const step = Math.max(1, Math.floor(hourlyData.length / 28));
        const sampledPrices = [];
        const sampledLabels = [];
        const sampledTimestamps = [];
        
        for (let i = 0; i < hourlyData.length; i += step) {
          if (hourlyData[i]) {
            sampledPrices.push(hourlyData[i][1]);
            
            const date = new Date(hourlyData[i][0]);
            sampledLabels.push(
              date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
              ' ' + 
              date.toLocaleTimeString('en-US', { hour: '2-digit' })
            );
            sampledTimestamps.push(hourlyData[i][0]);
          }
        }
        
        // Store base USD prices
        setBasePrices(sampledPrices);
        
        // Get the color for this coin
        const colors = COIN_COLORS[symbol] || {
          line: '#4CAF50',
          background: 'rgba(76, 175, 80, 0.1)',
          gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0)']
        };
        
        setChartData({
          labels: sampledLabels,
          timestamps: sampledTimestamps,
          prices: sampledPrices.map(price => price * exchangeRates[selectedCurrency]),
          datasets: [
            {
              label: symbol,
              data: sampledPrices.map(price => price * exchangeRates[selectedCurrency]),
              borderColor: colors.line,
              backgroundColor: 'transparent', // No fill for line style
              borderWidth: 2,
              tension: 0, // Straight lines with no curves
              pointRadius: 0,
              fill: false, // Don't fill below the line
            },
          ],
        });
        
        setLoading(false);
        setUseRealData(false);
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!isMounted) return;
        
        console.error(`Both API attempts failed for ${symbol}:`, error);
        // If both APIs fail, use fallback data
        generateFallbackChart();
      }
    };
    
    // Generate fallback chart data if real data is not available
    const generateFallbackChart = () => {
      console.log("Generating fallback chart for", symbol);
      let hourlyPrices = [];
      const hourlyLabels = [];
      const hourlyTimestamps = [];
      
      // Get the base data for the coin
      const baseData = [...fallbackChartData[symbol]];
      
      // Current time for the most recent data point
      const now = new Date();
      now.setMinutes(0, 0, 0); // Round to current hour
      
      // Generate hourly data points by interpolating between daily values
      for (let day = 0; day < 7; day++) {
        const startValue = baseData[6 - day]; // Reverse order (most recent first)
        const endValue = baseData[5 - day] || startValue; // Use previous day, or same if last day
        
        for (let hour = 0; hour < 24; hour++) {
          const timestamp = new Date(now);
          timestamp.setDate(timestamp.getDate() - day);
          timestamp.setHours(now.getHours() - hour);
          
          const dateStr = timestamp.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          
          const timeStr = timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit' 
          });
          
          hourlyLabels.push(`${dateStr} ${timeStr}`);
          hourlyTimestamps.push(timestamp.getTime());
          
          // Calculate interpolated value for this hour
          const progress = hour / 24;
          const interpolatedValue = startValue * (1 - progress) + endValue * progress;
          
          // Add small random variation for realism
          const randomFactor = 1 + (Math.random() * 0.01 - 0.005); // ±0.5% variation
          hourlyPrices.push(interpolatedValue * randomFactor);
        }
      }
      
      // For chart display, use the same sampling approach as the real data (every 6th point)
      const sampledPrices = [];
      const sampledLabels = [];
      const sampledTimestamps = [];
      
      for (let i = 0; i < hourlyPrices.length; i += 6) {
        if (i < hourlyPrices.length) {
          sampledPrices.push(hourlyPrices[i]);
          sampledLabels.push(hourlyLabels[i]);
          sampledTimestamps.push(hourlyTimestamps[i]);
        }
      }
      
      // Make sure the chart data format is identical to what real data would produce
      // Store full hourly data for detailed view
      setHourlyData(hourlyTimestamps.map((time, idx) => [time, hourlyPrices[idx]]));
      
      // Store base USD prices
      setBasePrices(sampledPrices);
      
      // Get the color for this coin
      const colors = COIN_COLORS[symbol] || {
        line: '#4CAF50',
        background: 'rgba(76, 175, 80, 0.1)',
        gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0)']
      };
      
      setChartData({
        labels: sampledLabels,
        timestamps: sampledTimestamps,
        prices: sampledPrices.map(price => price * exchangeRates[selectedCurrency]),
        datasets: [
          {
            label: symbol,
            data: sampledPrices.map(price => price * exchangeRates[selectedCurrency]),
            borderColor: colors.line,
            backgroundColor: 'transparent', // No fill
            borderWidth: 2,
            tension: 0, // Straight lines with no curves
            pointRadius: 0,
            fill: false, // Don't fill below the line
          },
        ],
      });
      
      setLoading(false);
      setUseRealData(false);
      setFetchError('API data unavailable, showing estimated values');
    };
    
    // Fetch data only when necessary
    const shouldFetch = lastChartUpdate && (!chartData || shouldUpdateCharts);
    
    if (shouldFetch) {
      fetchHourlyData();
    } else if (!chartData) {
      // If we don't have chart data yet, generate fallback chart
      generateFallbackChart();
    }
    
    // Add a timeout to ensure we show something even if fetch is slow
    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading) {
        generateFallbackChart();
      }
    }, 3000); // Reduced timeout
    
    return () => {
      isMounted = false;
      abortController.abort();
      clearTimeout(fallbackTimer);
    };
  }, [symbol, lastChartUpdate, shouldUpdateCharts, exchangeRates, chartData]);

  // Update prices when currency changes, but don't fetch new data
  useEffect(() => {
    if (basePrices && chartData) {
      // Convert existing USD prices to selected currency
      const convertedPrices = basePrices.map(price => price * exchangeRates[selectedCurrency]);
      
      // Update chart data with new currency values WITHOUT triggering a full re-render
      setChartData(prevData => {
        if (!prevData) return null;
        
        // Check if prices actually changed to avoid unnecessary updates
        const pricesChanged = !prevData.prices || 
          prevData.prices.length !== convertedPrices.length ||
          prevData.prices.some((price, i) => price !== convertedPrices[i]);
          
        if (!pricesChanged) return prevData;
        
        return {
          ...prevData,
          prices: convertedPrices,
          datasets: [
            {
              ...prevData.datasets[0],
              data: convertedPrices
            }
          ]
        };
      });
    }
  }, [selectedCurrency, exchangeRates, basePrices]);

  // Handler for opening the detailed modal with memoization
  const handleChartClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetailModal(true);
  }, []);
  
  // Loading placeholder
  if (loading || !chartData) {
    return (
      <div className="flex justify-center w-full">
        <div className="h-10 w-40 bg-gray-800 animate-pulse rounded"></div>
      </div>
    );
  }
  
  // Get last price and currency symbol for display
  const lastPrice = currentPrice || (chartData.prices ? chartData.prices[chartData.prices.length - 1] : 0);
  
  // Update UI with data source indicator when using fallback data
  return (
    <div className="flex justify-center w-full">
      <div 
        className={`h-10 w-40 cursor-pointer hover:opacity-80 transition-all duration-200 hover:shadow-lg rounded hover:scale-105 ${!useRealData ? 'relative' : ''}`}
        onClick={handleChartClick}
        title={useRealData ? "Click to view detailed hourly chart" : "Using estimated data - click to view details"}
      >
        <Line data={chartData} options={options} />
        {!useRealData && (
          <div className="absolute bottom-0 right-0 bg-gray-900 text-xs text-gray-400 px-1 rounded-bl">est</div>
        )}
      </div>
      
      <DetailModal
        showDetailModal={showDetailModal}
        setShowDetailModal={setShowDetailModal}
        detailChartData={detailChartData}
        detailOptions={detailOptions}
        symbol={symbol}
        priceChange7d={priceChange7d}
        currencySymbol={currencySymbol}
        lastPrice={lastPrice}
        lastChartUpdate={lastChartUpdate}
        fetchError={fetchError}
        useRealData={useRealData}
      />
    </div>
  );
};

export default memo(PriceChart); 