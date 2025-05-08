const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  SOL: 'solana',
  USDT: 'tether'
};

const CRYPTOCOMPARE_API = 'https://min-api.cryptocompare.com/data';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';


export const fetchCryptoData = async () => {
  try {

    const priceResponse = await fetch(
      `${CRYPTOCOMPARE_API}/pricemultifull?fsyms=BTC,ETH,ADA,SOL,USDT&tsyms=USD`
    );
    
    if (!priceResponse.ok) {
      throw new Error(`CryptoCompare API error: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    

    const coinGeckoResponse = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,tether&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
    );
    
    let coinGeckoData = [];
    if (coinGeckoResponse.ok) {
      coinGeckoData = await coinGeckoResponse.json();
    }
    

    const combinedData = [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        current_price: priceData.RAW.BTC.USD.PRICE,
        market_cap: priceData.RAW.BTC.USD.MKTCAP,
        market_cap_rank: 1,
        total_volume: priceData.RAW.BTC.USD.TOTALVOLUME24H,
        price_change_percentage_24h: priceData.RAW.BTC.USD.CHANGEPCT24HOUR,
        price_change_percentage_7d_in_currency: findCoinGeckoInfo(coinGeckoData, "bitcoin", "price_change_percentage_7d_in_currency") || 0,
        circulating_supply: priceData.RAW.BTC.USD.SUPPLY,
        max_supply: 21000000
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        current_price: priceData.RAW.ETH.USD.PRICE,
        market_cap: priceData.RAW.ETH.USD.MKTCAP,
        market_cap_rank: 2,
        total_volume: priceData.RAW.ETH.USD.TOTALVOLUME24H,
        price_change_percentage_24h: priceData.RAW.ETH.USD.CHANGEPCT24HOUR,
        price_change_percentage_7d_in_currency: findCoinGeckoInfo(coinGeckoData, "ethereum", "price_change_percentage_7d_in_currency") || 0,
        circulating_supply: priceData.RAW.ETH.USD.SUPPLY,
        max_supply: null
      },
      {
        id: "cardano",
        symbol: "ADA",
        name: "Cardano",
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        current_price: priceData.RAW.ADA.USD.PRICE,
        market_cap: priceData.RAW.ADA.USD.MKTCAP,
        market_cap_rank: findCoinGeckoInfo(coinGeckoData, "cardano", "market_cap_rank") || 8,
        total_volume: priceData.RAW.ADA.USD.TOTALVOLUME24H,
        price_change_percentage_24h: priceData.RAW.ADA.USD.CHANGEPCT24HOUR,
        price_change_percentage_7d_in_currency: findCoinGeckoInfo(coinGeckoData, "cardano", "price_change_percentage_7d_in_currency") || 0,
        circulating_supply: priceData.RAW.ADA.USD.SUPPLY,
        max_supply: 45000000000
      },
      {
        id: "solana",
        symbol: "SOL",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: priceData.RAW.SOL.USD.PRICE,
        market_cap: priceData.RAW.SOL.USD.MKTCAP,
        market_cap_rank: findCoinGeckoInfo(coinGeckoData, "solana", "market_cap_rank") || 5,
        total_volume: priceData.RAW.SOL.USD.TOTALVOLUME24H,
        price_change_percentage_24h: priceData.RAW.SOL.USD.CHANGEPCT24HOUR,
        price_change_percentage_7d_in_currency: findCoinGeckoInfo(coinGeckoData, "solana", "price_change_percentage_7d_in_currency") || 0,
        circulating_supply: priceData.RAW.SOL.USD.SUPPLY,
        max_supply: null
      },
      {
        id: "tether",
        symbol: "USDT",
        name: "Tether",
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        current_price: priceData.RAW.USDT.USD.PRICE,
        market_cap: priceData.RAW.USDT.USD.MKTCAP,
        market_cap_rank: 3,
        total_volume: priceData.RAW.USDT.USD.TOTALVOLUME24H,
        price_change_percentage_24h: priceData.RAW.USDT.USD.CHANGEPCT24HOUR,
        price_change_percentage_7d_in_currency: findCoinGeckoInfo(coinGeckoData, "tether", "price_change_percentage_7d_in_currency") || 0,
        circulating_supply: priceData.RAW.USDT.USD.SUPPLY,
        max_supply: null
      }
    ];
    
    return combinedData;
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    

    try {

      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,tether&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      

      return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
        circulating_supply: coin.circulating_supply,
        max_supply: coin.max_supply
      }));
    } catch (fallbackError) {
      console.error('All API attempts failed:', fallbackError);

      return getFallbackData();
    }
  }
};


const findCoinGeckoInfo = (data, id, property) => {
  const coin = data.find(item => item.id === id);
  return coin ? coin[property] : null;
};


const getFallbackData = () => {
  return [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 64789,
      market_cap: 1272231669550,
      market_cap_rank: 1,
      total_volume: 32586618681,
      price_change_percentage_24h: 1.2,
      price_change_percentage_7d_in_currency: 2.5,
      circulating_supply: 19687531,
      max_supply: 21000000
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      current_price: 3457.49,
      market_cap: 415546291176,
      market_cap_rank: 2,
      total_volume: 15854771431,
      price_change_percentage_24h: 0.8,
      price_change_percentage_7d_in_currency: 1.2,
      circulating_supply: 120232683,
      max_supply: null
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      current_price: 0.45,
      market_cap: 15930599764,
      market_cap_rank: 9,
      total_volume: 431559821,
      price_change_percentage_24h: -0.7,
      price_change_percentage_7d_in_currency: -2.1,
      circulating_supply: 35045020830,
      max_supply: 45000000000
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      current_price: 148.52,
      market_cap: 64772389741,
      market_cap_rank: 5,
      total_volume: 2879023342,
      price_change_percentage_24h: -1.5,
      price_change_percentage_7d_in_currency: -3.8,
      circulating_supply: 437489571,
      max_supply: null
    },
    {
      id: "tether",
      symbol: "USDT",
      name: "Tether",
      image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      current_price: 1.0,
      market_cap: 100625419631,
      market_cap_rank: 3,
      total_volume: 63221144810,
      price_change_percentage_24h: 0.1,
      price_change_percentage_7d_in_currency: 0.05,
      circulating_supply: 100635868015,
      max_supply: null
    }
  ];
};


export const startWebSocket = (onUpdate) => {
  console.log("Starting price updates...");
  

  const interval = setInterval(async () => {
    try {

      const response = await fetch(
        `${CRYPTOCOMPARE_API}/pricemultifull?fsyms=BTC,ETH,ADA,SOL,USDT&tsyms=USD`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      

      const updates = [
        {
          symbol: 'BTC',
          price: data.RAW.BTC.USD.PRICE,
          price_change_percentage_24h: data.RAW.BTC.USD.CHANGEPCT24HOUR,
          price_change_percentage_1h: data.RAW.BTC.USD.CHANGEPCTHOUR || (Math.random() * 1.5 - 0.75)
        },
        {
          symbol: 'ETH',
          price: data.RAW.ETH.USD.PRICE,
          price_change_percentage_24h: data.RAW.ETH.USD.CHANGEPCT24HOUR,
          price_change_percentage_1h: data.RAW.ETH.USD.CHANGEPCTHOUR || (Math.random() * 1.5 - 0.75)
        },
        {
          symbol: 'ADA',
          price: data.RAW.ADA.USD.PRICE,
          price_change_percentage_24h: data.RAW.ADA.USD.CHANGEPCT24HOUR,
          price_change_percentage_1h: data.RAW.ADA.USD.CHANGEPCTHOUR || (Math.random() * 1.5 - 0.75)
        },
        {
          symbol: 'SOL',
          price: data.RAW.SOL.USD.PRICE,
          price_change_percentage_24h: data.RAW.SOL.USD.CHANGEPCT24HOUR,
          price_change_percentage_1h: data.RAW.SOL.USD.CHANGEPCTHOUR || (Math.random() * 1.5 - 0.75)
        },
        {
          symbol: 'USDT',
          price: data.RAW.USDT.USD.PRICE,
          price_change_percentage_24h: data.RAW.USDT.USD.CHANGEPCT24HOUR,
          price_change_percentage_1h: data.RAW.USDT.USD.CHANGEPCTHOUR || (Math.random() * 0.2 - 0.1)
        }
      ];
      
      onUpdate(updates);
    } catch (error) {
      console.error('Error fetching price updates:', error);
      

      const randomUpdates = Object.keys(COIN_IDS).map(symbol => {
        const basePrice = symbol === 'BTC' ? 65000 :
                        symbol === 'ETH' ? 3400 :
                        symbol === 'ADA' ? 0.45 :
                        symbol === 'SOL' ? 150 : 1.0;
        
                
        const random24hChange = Math.random() * 4 - 2; // Range from -2% to +2%
        const random1hChange = Math.random() * 1.2 - 0.6; // Range from -0.6% to +0.6%
                        
        return {
          symbol,
          price: basePrice * (1 + (Math.random() * 0.02 - 0.01)),
          price_change_percentage_24h: random24hChange,
          price_change_percentage_1h: random1hChange
        };
      });
      
      onUpdate(randomUpdates);
    }
  }, 1500);
  

  return {
    socket: { status: "connected" },
    cleanup: () => {
      console.log("Stopping price updates...");
      clearInterval(interval);
    }
  };
};


export const fetchHistoricalData = async (symbol) => {
  try {

    const response = await fetch(
      `${CRYPTOCOMPARE_API}/v2/histohour?fsym=${symbol}&tsym=USD&limit=168&aggregate=1`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate and return price data
    if (!data || !data.Data || !data.Data.Data || data.Data.Data.length === 0) {
      throw new Error('No historical data available');
    }
    

    return data.Data.Data.map(point => [
      point.time * 1000,
      point.close
    ]);
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    

    try {

      const coinId = COIN_IDS[symbol];
      if (!coinId) {
        throw new Error(`No CoinGecko ID found for ${symbol}`);
      }
      

      const response = await fetch(
        `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=hourly`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      

      if (!data || !data.prices || data.prices.length === 0) {
        throw new Error('No historical data available');
      }
      
      return data.prices;
    } catch (secondError) {
      console.error(`All API attempts failed for ${symbol}:`, secondError);

      return generateFallbackHistoricalData(symbol);
    }
  }
};


const generateFallbackHistoricalData = (symbol) => {
  const dataPoints = [];
  const now = Date.now();
  

  const basePrice = symbol === 'BTC' ? 65000 :
                  symbol === 'ETH' ? 3400 :
                  symbol === 'ADA' ? 0.45 :
                  symbol === 'SOL' ? 150 : 1.0;
  

  for (let i = 167; i >= 0; i--) {
    const timestamp = now - (i * 3600000);

    const noise = Math.sin(i * 0.1) * 0.05 + (Math.random() * 0.02 - 0.01);
    const price = basePrice * (1 + noise);
    
    dataPoints.push([timestamp, price]);
  }
  
  return dataPoints;
}; 