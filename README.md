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

Requires Node.js **14 or newer**. On Node 18+ the client uses the built-in `fetch`; on older versions it falls back to `node-fetch`.

## Usage

### CommonJS

```js
const CoinpaprikaAPI = require('@coinpaprika/api-nodejs-client');

const client = new CoinpaprikaAPI();

client.getGlobal().then(console.log).catch(console.error);
client.getCoin('btc-bitcoin').then(console.log).catch(console.error);
```

### ESM

```js
import CoinpaprikaAPI from '@coinpaprika/api-nodejs-client';

const client = new CoinpaprikaAPI();
const data = await client.getGlobal();
```

### TypeScript

Type declarations ship with the package — no `@types` install needed.

```ts
import CoinpaprikaAPI from '@coinpaprika/api-nodejs-client';

const client = new CoinpaprikaAPI({ apiKey: process.env.COINPAPRIKA_KEY });
const markets = await client.getCoinMarkets('btc-bitcoin', { quotes: ['USD', 'BTC'] });
```

Check out the [Coinpaprika API documentation](https://api.coinpaprika.com/) for more information!

## Configuration

```js
const client = new CoinpaprikaAPI({
  version: 'v1',                         // API version (default 'v1')
  apiKey: process.env.COINPAPRIKA_KEY,   // Coinpaprika Pro key → Authorization: Bearer <key>
  retry: { attempts: 3, delay: 300 },    // Opt-in retry on 408/425/429/5xx & network errors (exponential backoff)
  config: {                              // Passed straight to fetch(url, config)
    headers: { 'User-Agent': 'my-app/1.0' },
    signal: controller.signal            // AbortSignal for cancellation (see below)
  },
  fetcher: customFetch                   // Optional: override the fetch implementation
});
```

### Pro API key

Pro-tier endpoints (`getCoinsMappings`, `getChangelogIds`, `getKeyInfo`, and some fields on the public endpoints) require an API key. Pass it to the constructor and it will be injected as `Authorization: Bearer <key>` on every request:

```js
const client = new CoinpaprikaAPI({ apiKey: 'your-pro-key' });
await client.getKeyInfo();
```

### Request cancellation

```js
const controller = new AbortController();
const client = new CoinpaprikaAPI({ config: { signal: controller.signal } });

const p = client.getCoins();
setTimeout(() => controller.abort(), 100);
try { await p } catch (e) { /* AbortError */ }
```

### Retries

Opt in via `retry`. Retries only on transient failures (408, 425, 429, 500–504, network errors); 2xx/4xx (besides the above) are returned as-is. Exponential backoff: `delay * 2^(attempt-1)`.

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
client.getCoin('btc-bitcoin', { quotes: ['USD', 'BTC'] })  // Coin details with quotes
```

> `getTicker` and `getAllTickers` are kept for backwards compatibility but **deprecated**; the upstream `/ticker` endpoint is itself deprecated. Prefer `getCoin`, `getCoinsOHLCVLatest`, and `getCoinsOHLCVHistorical`.

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
client.getCoinMarkets('btc-bitcoin', { quotes: ['USD', 'BTC'] })  // Markets for coin (array or CSV string)
client.getCoinsMappings()                             // ID mappings (Pro)
```

#### Exchanges
```js
client.getExchanges()                                 // List all exchanges
client.getExchange('binance')                         // Exchange details
client.getExchangeMarkets('binance', { quotes: ['USD', 'BTC'] })  // Markets on exchange (array or CSV string)
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

## Notes on query params

- Any param that accepts multiple values (e.g. `quotes`, `c` for `search`) can be passed as either a CSV string or an array; arrays are joined with commas automatically before being sent to the API.
- Required params are validated synchronously and throw a descriptive `Error` before any network call (e.g. `client.search({})` throws `"q (search query) is required"`).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

CoinpaprikaAPI is available under the MIT license. See the LICENSE file for more info.
