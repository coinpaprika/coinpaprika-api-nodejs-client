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

## API

#### getGlobal

Get global information

##### Examples
```javascript
const client = new CoinpaprikaAPI();
client.getGlobal().then(console.log).catch(console.error);
```

#### getCoins

Get a list of all cryptocurrencies available on coinpaprika.com.

##### Examples

```javascript
const client = new CoinpaprikaAPI();
client.getCoins().then(console.log).catch(console.error);
```

#### getCoinsOHLCVHistorical

Get the OHLCV historical for a coin

##### Examples

```javascript
const client = new CoinpaprikaAPI()
client.getCoinsOHLCVHistorical({
    coinId: "btc-bitcoin",
    quote: "usd",
    start: "2020-01-01",
    end: "2020-01-02" 
}).then(console.log).catch(console.error)
```


#### getTicker
(**DEPRECATED**)
Get information on all tickers or specifed ticker.


##### Parameters

-   `args`   (optional, default `{}`)
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options for the request
    -   `options.coinId` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Coinpaprika ID from `getCoins()` (optional, default ``)

##### Examples

```javascript
const client = new CoinpaprikaAPI();
client.getTicker().then(console.log).catch(console.error);
client.getTicker({coinId: 'btc-bitcoin'}).then(console.log).catch(console.error);
```

#### getAllTickers

Get tickers for all coins

##### Parameters

-   `params` (optional, default `{}`)
    -   `coinId` string (optional but *`required` with historical key*)
    -   `quotes` array of strings (optional)
    -   `historical` object (optional)
        - start: string (required)
        - end: string (optional)
        - limit: integer (optional)
        - quote: string (optional)
        - interval: string (optional) 
 
##### Examples
```javascript
const client = new CoinpaprikaAPI()
client.getAllTickers({
    coinId:'btc-bitcoin',
    quotes: ['BTC', 'ETH']
}).then(console.log).catch(console.error)

client.getAllTickers({
    coinId:'btc-bitcoin',
    historical: {
        start: '2018-02-15',
        end: '2018-02-16',
        limit: 2000,
        quote: 'btc',
        interval: '30m'
    }
}).then(console.log).catch(console.error)
```

## License

CoinpaprikaAPI is available under the MIT license. See the LICENSE file for more info.
