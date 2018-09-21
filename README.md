# Coinpaprika API NodeJS Client

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

#### getTicker

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

## License

CoinpaprikaAPI is available under the MIT license. See the LICENSE file for more info.
