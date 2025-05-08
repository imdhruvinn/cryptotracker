# Crypto Tracker

A real-time cryptocurrency price tracker that displays live updates from Binance WebSocket API, similar to CoinMarketCap.

Live link : https://livecurrencytracker.netlify.app/

## Features

- **Real-time Data**: Uses Binance WebSocket API for live price updates
- **Redux State Management**: All data managed through Redux Toolkit
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Color-coded Price Changes**: Green for positive, red for negative

## Tech Stack

- **React**: UI library
- **Redux Toolkit**: State management
- **WebSockets**: Real-time data from Binance
- **Tailwind CSS**: Styling

## Demo

[Live Demo Link][(https://livecurrencytracker.netlify.app/)]

## Setup Instructions

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/crypto-tracker.git
   cd crypto-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`

## Build for Production

```
npm run build
```

The build files will be in the `dist` directory.

## Architecture

- **Components**: Modular UI components in `src/components`
- **Redux Store**: State management in `src/app/store.js`
- **Crypto Slice**: Main redux slice in `src/features/crypto/cryptoSlice.js`
- **WebSocket API**: Connection handling in `src/features/crypto/cryptoAPI.js`

## License

MIT 
