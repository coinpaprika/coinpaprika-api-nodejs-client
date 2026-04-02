# Coinpaprika API NodeJS Client

<span class="badge-npmversion"><a href="https://www.npmjs.com/package/@coinpaprika/api-nodejs-client" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@coinpaprika/api-nodejs-client.svg" alt="NPM version" /></a></span>
<span class="badge-travisci"><a href="http://travis-ci.org/bevry/badges" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/coinpaprika/coinpaprika-api-nodejs-client/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmdownloads"><a href="https://www.npmjs.com/package/@coinpaprika/api-nodejs-client" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/@coinpaprika/api-nodejs-client.svg" alt="NPM downloads" /></a></span>
<span class="badge-npmlicence"><a href="https://www.npmjs.com/package/@coinpaprika/api-nodejs-client" title="View this project on NPM"><img src="https://img.shields.io/npm/l/@coinpaprika/api-nodejs-client.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/coinpaprika/coinpaprika-api-nodejs-client" title="View the status of this project's dependencies on DavidDM"><img src="https://david-dm.org/googleapis/google-api-nodejs-client.svg" alt="Dependency Status" /></a></span>

This library provides convenient way to use [Coinpaprika.com API](https://api.coinpaprika.com/) in NodeJS.

[Coinpaprika](https://coinpaprika.com) delivers full market data to the world of crypto: coin prices, volumes, market caps, ATHs, return rates and more.

## Install

```sh
npm install @coinpaprika/api-nodejs-client
```

## Usage

```js
const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client');

const client = new CoinpaprikaAPI();

client.getTicker().then(console.log).catch(console.error);
client.getGlobal().then(console.log).catch(console.error);
```

Check out the [Coinpaprika API documentation](https://api.coinpaprika.com/) for more information!

## API Coverage

```js
const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client')
const client = new CoinpaprikaAPI()
```

#### Market Data
```js
client.getGlobal()                                    // Global market overview
client.getCoins()                                     // List all coins
client.getCoin('btc-bitcoin')                         // Coin details
client.getAllTickers({ quotes: ['USD', 'BTC'] })      // All tickers
client.getAllTickers({ coinId: 'btc-bitcoin' })       // Single ticker
client.getAllTickers({ coinId: 'btc-bitcoin', historical: { start: '2024-01-01' } })  // Historical
```

#### OHLCV
```js
client.getCoinsOHLCVLatest('btc-bitcoin')             // Latest full day OHLCV
client.getCoinsOHLCVToday('btc-bitcoin')              // Today's OHLCV (live)
client.getCoinsOHLCVHistorical({ coinId: 'btc-bitcoin', start: '2024-01-01' })  // Historical
```

#### Coins
```js
client.getCoinTwitter('btc-bitcoin')                  // Twitter timeline
client.getCoinEvents('btc-bitcoin')                   // Coin events
client.getCoinExchanges('btc-bitcoin')                // Exchanges listing coin
client.getCoinMarkets('btc-bitcoin', { quotes: 'USD' })  // Markets for coin
client.getCoinsMappings()                             // ID mappings (Pro)
```

#### Exchanges
```js
client.getExchanges()                                 // List all exchanges
client.getExchange('binance')                         // Exchange details
client.getExchangeMarkets('binance', { quotes: 'USD' })  // Markets on exchange
```

#### Contracts
```js
client.getPlatforms()                                 // List contract platforms
client.getContracts('eth-ethereum')                   // Contracts on Ethereum
client.getTickerByContract('eth-ethereum', '0xdac1...') // Ticker by contract
client.getHistoricalByContract('eth-ethereum', '0xdac1...', { start: '2024-01-01' })
```

#### Other
```js
client.search({ q: 'bitcoin', c: 'currencies', limit: 10 })
client.priceConverter({ base_currency_id: 'btc-bitcoin', quote_currency_id: 'usd-us-dollars', amount: 1 })
client.getPeople('vitalik-buterin')                   // Person details
client.getTags()                                      // List tags
client.getTag('blockchain-service')                   // Tag details
client.getKeyInfo()                                   // API key info (requires key)
client.getChangelogIds()                              // Recent changelog IDs (Pro)
```

## License

CoinpaprikaAPI is available under the MIT license. See the LICENSE file for more info.
