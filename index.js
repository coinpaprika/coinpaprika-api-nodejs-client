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
        'Accept': 'application/json',
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
   *
   * @param {Object=} options Options for the request
   * @param {String=} [options.coinId="all"] Type of cryptocurrency to include ("all" | "coins" | "tokens")
   *
   * @example
   * const client = new CoinpaprikaAPI()
   * client.getTicker({coinId: 3}).then(console.log).catch(console.error)
   * client.getTicker().then(console.log).catch(console.error)
   */
  getTicker (args = {}) {
    let { coinId } = args
    return createRequest({
      fetcher: this.fetcher,
      url: `${this.url}/ticker${(coinId) ? `/${coinId}` : ``}`,
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
}

const createRequest = (args = {}) => {
  const { url, config, query, fetcher } = args;
  return fetcher(`${url}${query ? `?${qs.stringify(query)}` : ''}`, config).then(res => res.json())
};

module.exports = CoinpaprikaAPI
