'use strict'

const fetch = require('node-fetch')
const qs = require('qs')

const BASE_URL = 'https://api.coinpaprika.com'

class CoinpaprikaAPI {
  /**
   *
   * @param {Object=} Options Options for the CoinpaprikaAPI instance
   *
   * @param {String=} options.version  Version of API. Defaults to 'v1'
   * @param {Object=} options.config = Configuration for fetch request
   *
   */
  constructor ({ version = 'v1', config = {} } = {}) {
    this.config = Object.assign({}, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        'Accept-Encoding': 'deflate, gzip'
      }
    }, config)

    this.fetcher = fetch
    this.url = `${BASE_URL}/${version}`
  }

  /**
   * Get global information
   *
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getGlobal().then(console.log).catch(console.error)
   */
  getGlobal () {
    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/global`,
      config: this.config
    })
  }

  /**
   * Get information on all tickers or specifed ticker.
   * DEPRECATED
   *
   * @param {Object=} options Options for the request
   *
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getTicker({coinId: 3}).then(console.log).catch(console.error)
   * client.getTicker().then(console.log).catch(console.error)
   */
  getTicker (args = {}) {
    if (Object.prototype.toString.call(args) !== '[object Object]') {
      throw Error('Please pass object as arg.')
    }

    const { coinId } = args
    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/ticker${(coinId) ? `/${coinId}` : ''}`,
      config: this.config
    })
  }

  /**
   * Get tickers for all coins
   * @param {Object=} options for the request consistent to https://api.coinpaprika.com/#tag/Tickers
   * @param coinId: string
   * @param quotes: array of strings
   * @param historical: object
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getAllTickers({
   *     coinId:'btc-bitcoin',
   *     quotes: ['BTC', 'ETH']
   * })
   * .then(console.log)
   * .catch(console.error)
   *
   * client.getAllTickers({
   *     coinId:'btc-bitcoin',
   *     historical: {
   *         start: '2018-02-15',
   *         end: '2018-02-16',
   *         limit: 2000,
   *         quote: 'btc',
   *         interval: '30m'
   *     }
   * })
   * .then(console.log)
   * .catch(console.error)
   */
  getAllTickers (params = {}) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      throw Error('Please pass object as arg.')
    }

    const { coinId, quotes, historical } = params

    if ((historical && typeof coinId === 'undefined') || (coinId && historical && typeof historical.start === 'undefined')) {
      throw Error('required param was not pass, please check CoinpaprikaAPI client usage')
    }

    const coinIdParam = coinId ? `/${coinId}` : ''
    const quotesParam = quotes ? `?quotes=${quotes.join(',')}` : ''
    let historicalParam = ''
    if (historical && coinId) {
      historicalParam = ((historicalArgs = {}) => {
        const { start, end, limit, quote, interval } = historicalArgs
        const startParam = `start=${start}`
        const endParam = end ? `&end=${end}` : ''
        const limitParam = limit ? `&limit=${limit}` : ''
        const quoteParam = quote ? `&quote=${quote}` : ''
        const intervalParam = interval ? `&interval=${interval}` : ''

        return `/historical?${startParam}${endParam}${limitParam}${quoteParam}${intervalParam}`
      })(historical)
    }

    const query = `${coinIdParam}${historicalParam}${quotesParam}`

    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/tickers/${query}`,
      config: this.config
    })
  }

  /**
   * Get a list of all cryptocurrencies available on coinpaprika.com.
   *
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getCoins().then(console.log).catch(console.error)
   */
  getCoins () {
    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/coins`,
      config: this.config
    })
  }

  /**
   * Get particular coin by coinId available on coinpaprika.com.
   *
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getCoin('btc-bitcoin').then(console.log).catch(console.error)
   */
  getCoin (coinId) {
    if (!coinId) throw new Error('Can not be called without coinId')

    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/coins/${coinId}`
    })
  }

  /**
   * Get the coin OHLCV historical
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getCoinsOHLCVHistorical({
   * coinId: "btc-bitcoin",
   * quote: "usd",
   * start: "2020-01-01",
   * end: "2020-01-02"
   * }).then(console.log).catch(console.error)
   */
  getCoinsOHLCVHistorical (params = {}) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      throw Error('Please pass object as arg.')
    }

    const { coinId, quote, start, end } = params

    if (typeof coinId !== 'string' || typeof start !== 'string' || !coinId || !start) {
      throw Error('required param was not pass, please check CoinpaprikaAPI client usage')
    }

    const reqparams = {
      coinId,
      start: `?start=${start}`,
      quote: quote ? `&quote=${quote}` : '',
      end: end ? `&end=${end}` : ''
    }
    const query = `${reqparams.start}${reqparams.end}${reqparams.quote}`

    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/coins/${reqparams.coinId}/ohlcv/historical${query}`,
      config: this.config
    })
  }
}

const createRequest = (args = {}) => {
  const { url, config, query, fetcher } = args
  return fetcher(`${url}${query ? `?${qs.stringify(query)}` : ''}`, config).then(res => res.json())
}

module.exports = CoinpaprikaAPI
