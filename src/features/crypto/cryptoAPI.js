import { updatePrice, updatePriceChange, updateVolume, updateMarketCap, setError, setLoading } from './cryptoSlice';


const symbolMapping = {
  'BTCUSDT': 'BTC',
  'ETHUSDT': 'ETH',
  'ADAUSDT': 'ADA',
  'SOLUSDT': 'SOL',
  'USDTBUSD': 'USDT',
};


const fallbackData = {
  BTC: { price: 97148, priceChange24h: 1.5, volume: 25000000000 },
  ETH: { price: 1805, priceChange24h: 2.3, volume: 15000000000 },
  ADA: { price: 0.66, priceChange24h: 3.1, volume: 500000000 },
  SOL: { price: 150, priceChange24h: -2.1, volume: 3000000000 },
  USDT: { price: 1.0, priceChange24h: 0.01, volume: 50000000000 }
};


const calculateMarketCap = (price, circulatingSupply) => {
  return price * circulatingSupply;
};


export const createWebSocketConnection = (store) => {

  const state = store.getState();
  const assets = state.crypto.assets;
  

  store.dispatch(setLoading(true));


  const fallbackTimer = setTimeout(() => {
    const currentState = store.getState();
    Object.keys(fallbackData).forEach(symbol => {
      if (currentState.crypto.assets[symbol].price === 0) {

        const data = fallbackData[symbol];
        store.dispatch(updatePrice({ symbol, price: data.price }));
        store.dispatch(updatePriceChange({ 
          symbol, 
          period: '24h', 
          value: data.priceChange24h 
        }));
        store.dispatch(updateVolume({ symbol, volume: data.volume }));
        

        if (currentState.crypto.assets[symbol].circulatingSupply) {
          const marketCap = calculateMarketCap(
            data.price, 
            currentState.crypto.assets[symbol].circulatingSupply
          );
          store.dispatch(updateMarketCap({ symbol, marketCap }));
        }
      }
    });
    
    // Set loading to false
    store.dispatch(setLoading(false));
  }, 3000);

  try {

    const wsUrl = 'wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker/adausdt@ticker/solusdt@ticker';
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data && data.data) {
          const { s: symbol, c: lastPrice, p: priceChange24h, P: priceChangePercent, v: volume, q: quoteVolume } = data.data;
          
          const ourSymbol = symbolMapping[symbol];
          
          if (ourSymbol) {

            const price = parseFloat(lastPrice);
            

            store.dispatch(updatePrice({ symbol: ourSymbol, price }));
            

            store.dispatch(updatePriceChange({ 
              symbol: ourSymbol, 
              period: '24h', 
              value: parseFloat(priceChangePercent) 
            }));
            

            store.dispatch(updateVolume({ 
              symbol: ourSymbol, 
              volume: parseFloat(quoteVolume) 
            }));
            

            if (assets[ourSymbol] && assets[ourSymbol].circulatingSupply) {
              const marketCap = calculateMarketCap(price, assets[ourSymbol].circulatingSupply);
              store.dispatch(updateMarketCap({ symbol: ourSymbol, marketCap }));
            }
            

            store.dispatch(setLoading(false));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket data:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      store.dispatch(setError('WebSocket connection error'));
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');

      setTimeout(() => createWebSocketConnection(store), 5000);
    };


    return { ws, fallbackTimer };
  } catch (error) {
    console.error('Error creating WebSocket:', error);

    clearTimeout(fallbackTimer);

    Object.keys(fallbackData).forEach(symbol => {
      const data = fallbackData[symbol];
      store.dispatch(updatePrice({ symbol, price: data.price }));
      store.dispatch(updatePriceChange({ symbol, period: '24h', value: data.priceChange24h }));
      store.dispatch(updateVolume({ symbol, volume: data.volume }));
      
      // Calculate market cap
      if (assets[symbol] && assets[symbol].circulatingSupply) {
        const marketCap = calculateMarketCap(data.price, assets[symbol].circulatingSupply);
        store.dispatch(updateMarketCap({ symbol, marketCap }));
      }
    });
    
    // Set loading to false
    store.dispatch(setLoading(false));
    
    return { ws: null, fallbackTimer: null };
  }
};


export const simulateAdditionalUpdates = (store) => {
  const interval = setInterval(() => {

    const state = store.getState();
    const assets = Object.keys(state.crypto.assets);
    

    assets.forEach(symbol => {
      
      const change1h = (Math.random() * 6 - 3).toFixed(2);
      const change7d = (Math.random() * 10 - 5).toFixed(2);
      
      store.dispatch(updatePriceChange({ symbol, period: '1h', value: parseFloat(change1h) }));
      store.dispatch(updatePriceChange({ symbol, period: '7d', value: parseFloat(change7d) }));
    });
  }, 1500);
  
  return interval;
}; 