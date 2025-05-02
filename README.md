# 📈 Stock & Currency Tracker - WordPress Gutenberg Plugin

A WordPress plugin containing two Gutenberg blocks to display real-time stock market data and currency exchange rates on your WordPress site.

## ✨ Features

### 📊 Stock Tracker Block

- Real-time stock market data display via Finnhub API
- Multiple stock symbols selection
- Automatic data refresh
- Modern and active user interface
- Price variations with color coding
- Error handling and API rate limits management

### 💱 Currency Tracker Block

- Real-time exchange rates display via ExchangeRate API
- Base currency and target currencies selection
- Automatic rate updates
- Clean and professional interface
- Real-time rate updates
- Error handling and API limits management

## Installation

1. Download the `Gutenberg-Stock-Tracker` folder to the `wp-content/plugins/` directory of your WordPress installation
2. Activate the plugin through the "Plugins" menu in WordPress admin
3. The API keys (Finnhub and ExchangeRate) are stored in the `.key` file at the plugin root
4. You can modify this file to use your own API keys

## 🔍 Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher

## 🚀 Usage

### 📈 Using the Stock Tracker Block

1. Add the "Stock Tracker" block to your page or post
2. In the sidebar panel, verify that the Finnhub API key is present
3. Select the stock symbols you want to display
4. Configure the refresh options according to your preferences

### 💱 Using the Currency Tracker Block

1. Add the "Currency Tracker" block to your page or post
2. In the sidebar panel, verify that the ExchangeRate API key is present
3. Select the base currency and target currencies
4. Rates will automatically update according to the configured interval

## 💻 Development

### 📦 Installing Dependencies

```bash
npm install
```

### 🔨 Building Assets

```bash
# For development (with file watching)
npm run start

# For production
npm run build
```

## 🖼️ Screenshots

_Screenshots will be added after the first stable release_

## 📄 License

GPL-2.0-or-later
