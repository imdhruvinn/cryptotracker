import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PriceChange from './PriceChange';
import PriceChart from './PriceChart';
import { selectSelectedCurrency, selectExchangeRates, selectCurrencySymbol } from '../features/currency/currencySlice';
import { selectLastPriceUpdate } from '../features/chart/chartSlice';

// Ethereum logo - inline SVG as fallback
const ETH_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
  <path d="M16.498 4V12.87L23.995 16.22L16.498 4Z" fill="white" fill-opacity="0.602"/>
  <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
  <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fill-opacity="0.602"/>
  <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
  <path d="M16.498 20.573L23.995 16.22L16.498 12.872V20.573Z" fill="white" fill-opacity="0.2"/>
  <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fill-opacity="0.602"/>
</svg>`;

// Bitcoin logo - inline SVG as fallback
const BTC_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F7931A"/>
  <path d="M22.4 14.08C22.768 11.616 20.912 10.48 18.4 9.76L19.104 7.04L17.408 6.624L16.72 9.264C16.224 9.12 15.728 9.008 15.232 8.864L15.936 6.224L14.24 5.808L13.536 8.528C13.152 8.416 12.768 8.304 12.384 8.192V8.16L10.16 7.584L9.712 9.392C9.712 9.392 10.96 9.68 10.928 9.68C11.584 9.84 11.68 10.32 11.648 10.688L10.832 13.84C10.88 13.856 10.944 13.872 11.024 13.904L10.832 13.856L9.68 18.144C9.616 18.352 9.44 18.672 8.992 18.544C9.008 18.56 7.776 18.24 7.776 18.24L7 20.16L9.088 20.704C9.536 20.832 9.984 20.976 10.416 21.104L9.696 23.856L11.392 24.272L12.096 21.552C12.608 21.712 13.104 21.856 13.6 22L12.896 24.688L14.592 25.104L15.312 22.352C18.672 23.024 21.184 22.72 22.384 19.712C23.36 17.296 22.496 15.904 20.752 15.008C22 14.272 22.144 13.072 22.4 14.08ZM18.432 18.656C17.76 21.072 14.08 19.84 12.896 19.536L13.856 15.776C15.04 16.08 19.136 16.16 18.432 18.656ZM19.088 14.016C18.464 16.224 15.44 15.2 14.464 14.944L15.328 11.568C16.304 11.824 19.744 11.728 19.088 14.016Z" fill="white"/>
</svg>`;

// Solana logo - inline SVG as fallback
const SOL_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0C0C0C"/>
  <path d="M9.677 19.042C9.778 18.941 9.9 18.872 10.035 18.842C10.17 18.812 10.311 18.823 10.438 18.873L22.01 23.516C22.242 23.608 22.407 23.803 22.458 24.044C22.508 24.285 22.437 24.536 22.271 24.714C22.17 24.815 22.048 24.884 21.913 24.914C21.778 24.944 21.637 24.933 21.51 24.883L9.938 20.24C9.823 20.194 9.72 20.119 9.639 20.023C9.559 19.927 9.503 19.813 9.477 19.691C9.45 19.569 9.453 19.442 9.485 19.322C9.518 19.201 9.578 19.091 9.662 19C9.667 19.014 9.672 19.028 9.677 19.042Z" fill="#00FFA3"/>
  <path d="M9.677 11.85C9.778 11.749 9.9 11.68 10.035 11.65C10.17 11.62 10.311 11.631 10.438 11.681L22.01 16.324C22.242 16.416 22.407 16.611 22.458 16.852C22.508 17.093 22.437 17.344 22.271 17.522C22.17 17.623 22.048 17.692 21.913 17.722C21.778 17.752 21.637 17.741 21.51 17.691L9.938 13.048C9.823 13.002 9.72 12.927 9.639 12.831C9.559 12.735 9.503 12.621 9.477 12.499C9.45 12.377 9.453 12.25 9.485 12.13C9.518 12.009 9.578 11.899 9.662 11.808C9.667 11.822 9.672 11.836 9.677 11.85Z" fill="#00FFA3"/>
  <path d="M22.271 9.698C22.17 9.597 22.048 9.528 21.913 9.498C21.778 9.468 21.637 9.479 21.51 9.529L9.938 14.172C9.706 14.264 9.541 14.459 9.49 14.7C9.44 14.941 9.511 15.192 9.677 15.37C9.778 15.471 9.9 15.54 10.035 15.57C10.17 15.6 10.311 15.589 10.438 15.539L22.01 10.896C22.125 10.85 22.228 10.775 22.309 10.679C22.389 10.583 22.445 10.469 22.471 10.347C22.498 10.225 22.495 10.098 22.463 9.978C22.43 9.857 22.37 9.747 22.286 9.656C22.281 9.67 22.276 9.684 22.271 9.698Z" fill="#00FFA3"/>
</svg>`;

// Cardano logo - inline SVG as fallback
const ADA_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#0033AD"/>
  <path d="M16.08 7.05L17.77 10.83C17.84 11.03 17.7 11.11 17.54 11.05L16.16 10.23C16.03 10.16 15.87 10.16 15.73 10.23L14.33 11.05C14.17 11.14 14.03 11.03 14.1 10.83L15.8 7.05C15.87 6.85 16.01 6.85 16.08 7.05Z" fill="white"/>
  <path d="M20.78 8.74L20.37 12.81C20.34 13.03 20.17 13.03 20.06 12.86L19.07 11.38C18.97 11.28 18.82 11.21 18.65 11.21L16.92 11.14C16.75 11.11 16.67 10.96 16.78 10.83L19.34 7.91C19.48 7.74 19.68 7.76 19.75 7.96L20.78 8.74Z" fill="white"/>
  <path d="M11.81 8.74L12.22 12.81C12.25 13.03 12.42 13.03 12.53 12.86L13.52 11.38C13.62 11.28 13.77 11.21 13.94 11.21L15.67 11.14C15.84 11.11 15.92 10.96 15.81 10.83L13.25 7.91C13.11 7.74 12.91 7.76 12.84 7.96L11.81 8.74Z" fill="white"/>
  <path d="M22.39 13.52L19.75 16.69C19.61 16.87 19.41 16.85 19.31 16.64L18.14 14.17C18.07 14.04 17.95 13.94 17.79 13.87L16.16 12.86C16 12.76 15.99 12.6 16.12 12.5L19.31 10.6C19.51 10.47 19.72 10.57 19.79 10.8L22.39 13.52Z" fill="white"/>
  <path d="M9.61 13.52L12.25 16.69C12.39 16.87 12.59 16.85 12.69 16.64L13.86 14.17C13.93 14.04 14.05 13.94 14.21 13.87L15.84 12.86C16 12.76 16.01 12.6 15.88 12.5L12.69 10.6C12.49 10.47 12.28 10.57 12.21 10.8L9.61 13.52Z" fill="white"/>
  <path d="M12.5 24.42L10.8 20.64C10.73 20.44 10.87 20.36 11.03 20.42L12.41 21.24C12.54 21.31 12.69 21.31 12.84 21.24L14.24 20.42C14.4 20.33 14.54 20.44 14.47 20.64L12.77 24.42C12.7 24.62 12.56 24.62 12.5 24.42Z" fill="white"/>
  <path d="M7.79 22.73L8.2 18.66C8.23 18.44 8.4 18.44 8.51 18.61L9.5 20.09C9.6 20.19 9.75 20.26 9.92 20.26L11.65 20.33C11.82 20.36 11.9 20.51 11.79 20.64L9.23 23.56C9.09 23.73 8.89 23.71 8.82 23.51L7.79 22.73Z" fill="white"/>
  <path d="M16.76 22.73L16.35 18.66C16.32 18.44 16.15 18.44 16.04 18.61L15.05 20.09C14.95 20.19 14.8 20.26 14.63 20.26L12.9 20.33C12.73 20.36 12.65 20.51 12.76 20.64L15.32 23.56C15.46 23.73 15.66 23.71 15.73 23.51L16.76 22.73Z" fill="white"/>
  <path d="M6.17 17.96L8.82 14.79C8.95 14.61 9.16 14.62 9.26 14.83L10.43 17.3C10.5 17.43 10.62 17.53 10.78 17.61L12.41 18.61C12.57 18.71 12.58 18.87 12.45 18.97L9.26 20.87C9.06 21 8.85 20.9 8.78 20.67L6.17 17.96Z" fill="white"/>
  <path d="M18.96 17.96L16.32 14.79C16.18 14.61 15.98 14.62 15.88 14.83L14.71 17.3C14.64 17.43 14.52 17.53 14.36 17.61L12.73 18.61C12.57 18.71 12.56 18.87 12.69 18.97L15.88 20.87C16.08 21 16.29 20.9 16.36 20.67L18.96 17.96Z" fill="white"/>
  <path d="M15.7 15.88C15.7 16.3 15.36 16.64 14.94 16.64C14.52 16.64 14.19 16.3 14.19 15.88C14.19 15.46 14.52 15.12 14.94 15.12C15.36 15.12 15.7 15.46 15.7 15.88Z" fill="white"/>
  <path d="M17.81 15.88C17.81 16.3 17.48 16.64 17.06 16.64C16.64 16.64 16.3 16.3 16.3 15.88C16.3 15.46 16.64 15.12 17.06 15.12C17.48 15.12 17.81 15.46 17.81 15.88Z" fill="white"/>
  <path d="M14.04 17.4C14.04 17.82 13.7 18.16 13.28 18.16C12.87 18.16 12.53 17.82 12.53 17.4C12.53 16.98 12.87 16.64 13.28 16.64C13.7 16.64 14.04 16.98 14.04 17.4Z" fill="white"/>
  <path d="M19.47 17.4C19.47 17.82 19.13 18.16 18.72 18.16C18.3 18.16 17.96 17.82 17.96 17.4C17.96 16.98 18.3 16.64 18.72 16.64C19.13 16.64 19.47 16.98 19.47 17.4Z" fill="white"/>
  <path d="M15.67 17.89C15.67 18.31 15.34 18.65 14.92 18.65C14.5 18.65 14.16 18.31 14.16 17.89C14.16 17.47 14.5 17.13 14.92 17.13C15.34 17.13 15.67 17.47 15.67 17.89Z" fill="white"/>
  <path d="M17.84 17.89C17.84 18.31 17.5 18.65 17.08 18.65C16.66 18.65 16.33 18.31 16.33 17.89C16.33 17.47 16.66 17.13 17.08 17.13C17.5 17.13 17.84 17.47 17.84 17.89Z" fill="white"/>
  <path d="M16.75 16.87C16.75 17.29 16.42 17.62 16 17.62C15.58 17.62 15.25 17.29 15.25 16.87C15.25 16.45 15.58 16.11 16 16.11C16.42 16.11 16.75 16.45 16.75 16.87Z" fill="white"/>
</svg>`;

// USDT logo - inline SVG as fallback
const USDT_LOGO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#26A17B"/>
  <path d="M17.922 17.383V14.944H21.969V11.825H9.86V14.944H13.907V17.383C10.177 17.57 7.395 18.304 7.395 19.173C7.395 20.042 10.177 20.776 13.907 20.963V25.296H17.922V20.963C21.643 20.776 24.417 20.042 24.417 19.173C24.417 18.304 21.643 17.57 17.922 17.383ZM17.922 20.627V20.629C17.839 20.636 17.071 20.684 15.932 20.684C14.992 20.684 14.058 20.651 13.907 20.629V20.627C10.744 20.472 8.401 19.86 8.401 19.147C8.401 18.434 10.744 17.822 13.907 17.667V20.044C14.064 20.073 15.027 20.145 15.955 20.145C17.092 20.145 17.853 20.056 17.922 20.044V17.667C21.075 17.823 23.41 18.434 23.41 19.147C23.41 19.86 21.075 20.472 17.922 20.627Z" fill="white"/>
</svg>`;

// Estimated max supply values for cryptocurrencies without a fixed supply
const ESTIMATED_MAX_SUPPLY = {
  ETH: 120000000 * 1.5, // Estimated based on current supply plus future issuance
  SOL: 500000000, // Estimated based on current supply plus future issuance
  USDT: 100000000000 // Estimated based on growth projections
};

// Logo fallbacks by symbol
const LOGO_FALLBACKS = {
  BTC: BTC_LOGO,
  ETH: ETH_LOGO,
  SOL: SOL_LOGO,
  ADA: ADA_LOGO, 
  USDT: USDT_LOGO
};

const CryptoRow = ({ asset }) => {
  // Use Redux selectors instead of context
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const exchangeRates = useSelector(selectExchangeRates);
  const currencySymbol = useSelector(selectCurrencySymbol);
  const lastPriceUpdate = useSelector(selectLastPriceUpdate);
  
  const [priceDirection, setPriceDirection] = useState(null); // 'up', 'down', or null
  const [prevPrice, setPrevPrice] = useState(asset.current_price);
  
  // Track price changes for color effect
  useEffect(() => {
    if (asset.current_price > prevPrice) {
      setPriceDirection('up');
    } else if (asset.current_price < prevPrice) {
      setPriceDirection('down');
    }
    
    setPrevPrice(asset.current_price);
    
    // Reset direction after a short delay
    const timer = setTimeout(() => {
      setPriceDirection(null);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [asset.current_price, prevPrice, lastPriceUpdate]);
  
  // Format number to full digits instead of abbreviations
  const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return 'N/A';
    }
    
    // Convert to the selected currency
    const convertedValue = num * exchangeRates[selectedCurrency];
    
    // Format the number with locale and proper grouping
    return currencySymbol + new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true, // Enables thousand separators
      notation: 'standard' // Use standard notation (not compact like 'B' or 'T')
    }).format(convertedValue);
  };
  
  // Format price with proper decimals based on value
  const formatPrice = (price) => {
    if (price === null || price === undefined) {
      return 'N/A';
    }
    
    // Convert to the selected currency
    const convertedPrice = price * exchangeRates[selectedCurrency];
    
    // Determine decimal places based on price
    let maxDecimals = 2;
    if (convertedPrice < 1) {
      maxDecimals = 6;
    } else if (convertedPrice < 10) {
      maxDecimals = 4;
    }
    
    // Format with proper decimals
    return currencySymbol + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: maxDecimals,
      useGrouping: true // Enables thousand separators
    }).format(convertedPrice);
  };
  
  // Format percentage with + or - sign and coloring
  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) {
      return 'N/A';
    }
    
    return (percentage >= 0 ? '+' : '') + percentage.toFixed(2) + '%';
  };
  
  // Format supply with the cryptocurrency symbol instead of currency
  const formatSupply = (supply) => {
    if (supply === null || supply === undefined) {
      return 'N/A';
    }
    // Format without currency symbol, add cryptocurrency symbol instead
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true // Enables thousand separators
    }).format(supply) + ' ' + asset.symbol;
  };
  
  // Format volume with both fiat currency and crypto amount
  const formatVolume = (volume) => {
    if (volume === null || volume === undefined) {
      return 'N/A';
    }
    
    // Convert to selected currency
    const convertedVolume = volume * exchangeRates[selectedCurrency];
    
    // Calculate approximate crypto amount (volume divided by price)
    const cryptoAmount = asset.current_price > 0 ? volume / asset.current_price : 0;
    
    // Format the volume in fiat currency
    const fiatFormatted = currencySymbol + new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true // Enables thousand separators
    }).format(convertedVolume);
    
    // Format the crypto amount
    const cryptoFormatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(cryptoAmount) + ' ' + asset.symbol;
    
    return (
      <div>
        <div>{fiatFormatted}</div>
        <div className="text-xs text-gray-500">{cryptoFormatted}</div>
      </div>
    );
  };
  
  // Get logo - either from API or fallback
  const getLogo = () => {
    if (asset.image && asset.image.startsWith('http')) {
      return (
        <img 
          src={asset.image} 
          alt={asset.name} 
          className="w-full h-full object-contain"
          onError={(e) => {
            // If image fails to load, use SVG fallback
            const fallbackSvg = LOGO_FALLBACKS[asset.symbol];
            if (fallbackSvg) {
              const container = e.target.parentNode;
              container.innerHTML = fallbackSvg;
            }
          }}
        />
      );
    } else {
      // Use SVG fallback if no image provided
      const fallbackSvg = LOGO_FALLBACKS[asset.symbol];
      if (fallbackSvg) {
        return <div dangerouslySetInnerHTML={{ __html: fallbackSvg }} />;
      }
      
      // Default placeholder if no fallback available
      return (
        <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{asset.symbol.charAt(0)}</span>
        </div>
      );
    }
  };
  
  // Mock data for 1h change if not available
  const price_change_percentage_1h = asset.price_change_percentage_1h_in_currency || 
    (Math.random() * 2 - 1).toFixed(2) * 1; // Random value between -1 and 1

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <td className="py-4 pl-3 pr-1">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2 flex-shrink-0 transition-transform duration-200 hover:scale-110">
            {getLogo()}
          </div>
          <div className="transition-all duration-200 hover:translate-x-1">
            <div className="font-medium">{asset.name}</div>
            <div className="text-gray-500 text-sm">{asset.symbol}</div>
          </div>
        </div>
      </td>
      <td className={`py-4 px-1 text-right font-medium transition-all duration-200 hover:text-white hover:font-bold ${
        priceDirection === 'up' ? 'text-green-500' : 
        priceDirection === 'down' ? 'text-red-500' : ''
      }`}>
        {formatPrice(asset.current_price)}
      </td>
      <td className={`py-4 px-1 text-right ${price_change_percentage_1h >= 0 ? 'text-green-500' : 'text-red-500'} transition-all duration-200 hover:font-bold`}>
        {formatPercentage(price_change_percentage_1h)}
      </td>
      <td className={`py-4 px-1 text-right ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'} transition-all duration-200 hover:font-bold`}>
        {asset.price_change_percentage_24h !== undefined ? 
          formatPercentage(asset.price_change_percentage_24h) : 
          'N/A'
        }
      </td>
      <td className={`py-4 px-1 text-right ${asset.price_change_percentage_7d_in_currency >= 0 ? 'text-green-500' : 'text-red-500'} transition-all duration-200 hover:font-bold`}>
        {asset.price_change_percentage_7d_in_currency !== undefined ? 
          formatPercentage(asset.price_change_percentage_7d_in_currency) : 
          'N/A'
        }
      </td>
      <td className="py-4 px-1 text-right hidden md:table-cell transition-all duration-200 hover:text-white hover:font-bold">
        {formatNumber(asset.market_cap)}
      </td>
      <td className="py-4 px-1 text-right hidden lg:table-cell transition-all duration-200 hover:text-white hover:font-bold">
        {formatVolume(asset.total_volume)}
      </td>
      <td className="py-4 px-1 text-right hidden xl:table-cell transition-all duration-200 hover:text-white hover:font-bold">
        {formatSupply(asset.circulating_supply)}
      </td>
      <td className="py-4 px-1 chart-cell text-center transition-all duration-200">
        <div className="flex justify-center">
          <PriceChart 
            symbol={asset.symbol} 
            priceChange7d={asset.price_change_percentage_7d_in_currency} 
          />
        </div>
      </td>
    </tr>
  );
};

export default CryptoRow; 