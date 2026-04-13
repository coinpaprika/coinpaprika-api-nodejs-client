'use strict'

const qs = require('qs')

const BASE_URL = 'https://api.coinpaprika.com'
const PRO_BASE_URL = 'https://api-pro.coinpaprika.com'

if (typeof globalThis.fetch !== 'function') {
  throw new Error('@coinpaprika/api-nodejs-client 3.x requires Node.js 18+ (global fetch). For older runtimes use 2.x.')
}

const defaultFetcher = globalThis.fetch.bind(globalThis)

class CoinpaprikaAPI {
  /**
   * @param {Object=} options
   * @param {String=} options.version   API version. Defaults to 'v1'.
   * @param {String=} options.baseUrl   Base URL. Defaults to 'https://api.coinpaprika.com'. Set to 'https://api-pro.coinpaprika.com' for Pro plans, or pass `pro: true` below.
   * @param {Boolean=} options.pro      Shortcut: use the Pro base URL.
   * @param {Object=} options.config    Base fetch config (headers, signal, etc.) merged into every request.
   * @param {String=} options.apiKey    Coinpaprika API key. Sent as `Authorization: <key>` (matches the Coinpaprika docs — no "Bearer" prefix).
   * @param {Object=} options.retry     Optional retry policy. { attempts = 3, delay = 300 } — exponential backoff on 429/5xx/network errors.
   * @param {Function=} options.fetcher Override the underlying fetch implementation (useful for tests / custom transports).
   */
  constructor ({ version = 'v1', baseUrl, pro = false, config = {}, apiKey, retry, fetcher } = {}) {
    const headers = Object.assign({
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'Accept-Encoding': 'deflate, gzip'
    }, config.headers || {})

    if (apiKey) headers.Authorization = apiKey

    this.config = Object.assign({ method: 'GET' }, config, { headers })
    this.retry = retry || null
    this.fetcher = fetcher || defaultFetcher
    const host = baseUrl || (pro ? PRO_BASE_URL : BASE_URL)
    this.url = `${host}/${version}`
  }

  /**
   * Return a new client bound to an AbortSignal. The original client is unchanged.
   * Use this to scope cancellation to a single call or a small group of calls:
   *
   *   const controller = new AbortController()
   *   await client.withSignal(controller.signal).getCoins()
   *   controller.abort()
   */
  withSignal (signal) {
    const clone = Object.create(Object.getPrototypeOf(this))
    clone.config = Object.assign({}, this.config, { signal })
    clone.retry = this.retry
    clone.fetcher = this.fetcher
    clone.url = this.url
    return clone
  }

  getGlobal () {
    return this._request({ path: '/global' })
  }

  getCoins () {
    return this._request({ path: '/coins' })
  }

  getCoin (coinId, params = {}) {
    if (!coinId) throw new Error('Can not be called without coinId')
    return this._request({ path: `/coins/${coinId}`, query: params })
  }

  getCoinsOHLCVHistorical (params = {}) {
    if (Object.prototype.toString.call(params) !== '[object Object]') {
      throw new Error('Please pass object as arg.')
    }
    const { coinId, start } = params
    if (typeof coinId !== 'string' || typeof start !== 'string' || !coinId || !start) {
      throw new Error('required param was not pass, please check CoinpaprikaAPI client usage')
    }
    const query = {}
    if (params.start) query.start = params.start
    if (params.end) query.end = params.end
    if (params.quote) query.quote = params.quote
    return this._request({ path: `/coins/${coinId}/ohlcv/historical`, query })
  }

  getCoinsOHLCVLatest (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/ohlcv/latest`, query: params })
  }

  getCoinsOHLCVToday (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/ohlcv/today`, query: params })
  }

  getCoinTwitter (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/twitter` })
  }

  getCoinEvents (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/events` })
  }

  getCoinExchanges (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/exchanges` })
  }

  getCoinMarkets (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${coinId}/markets`, query: params })
  }

  /**
   * Get coin ID mappings to other data providers.
   * See https://api.coinpaprika.com/ for supported query params.
   */
  getCoinsMappings (params = {}) {
    return this._request({ path: '/coins/mappings', query: params })
  }

  getPeople (personId) {
    if (!personId) throw new Error('personId is required')
    return this._request({ path: `/people/${personId}` })
  }

  getTags (params = {}) {
    return this._request({ path: '/tags', query: params })
  }

  getTag (tagId, params = {}) {
    if (!tagId) throw new Error('tagId is required')
    return this._request({ path: `/tags/${tagId}`, query: params })
  }

  getExchanges (params = {}) {
    return this._request({ path: '/exchanges', query: params })
  }

  getExchange (exchangeId, params = {}) {
    if (!exchangeId) throw new Error('exchangeId is required')
    return this._request({ path: `/exchanges/${exchangeId}`, query: params })
  }

  getExchangeMarkets (exchangeId, params = {}) {
    if (!exchangeId) throw new Error('exchangeId is required')
    return this._request({ path: `/exchanges/${exchangeId}/markets`, query: params })
  }

  search (params = {}) {
    if (!params.q) throw new Error('q (search query) is required')
    return this._request({ path: '/search', query: params })
  }

  priceConverter (params = {}) {
    return this._request({ path: '/price-converter', query: params })
  }

  getPlatforms () {
    return this._request({ path: '/contracts' })
  }

  getContracts (platformId) {
    if (!platformId) throw new Error('platformId is required')
    return this._request({ path: `/contracts/${platformId}` })
  }

  getTickerByContract (platformId, contractAddress) {
    if (!platformId) throw new Error('platformId is required')
    if (!contractAddress) throw new Error('contractAddress is required')
    return this._request({ path: `/contracts/${platformId}/${contractAddress}` })
  }

  getHistoricalByContract (platformId, contractAddress, params = {}) {
    if (!platformId) throw new Error('platformId is required')
    if (!contractAddress) throw new Error('contractAddress is required')
    return this._request({ path: `/contracts/${platformId}/${contractAddress}/historical`, query: params })
  }

  getKeyInfo () {
    return this._request({ path: '/key/info' })
  }

  /**
   * Get ID changelog for all coins.
   * @param {Object=} params - Optional: { page } (default 1; 100 records per page).
   */
  getChangelogIds (params = {}) {
    return this._request({ path: '/changelog/ids', query: params })
  }

  _request ({ path, query }) {
    return executeRequest({
      fetcher: this.fetcher,
      url: `${this.url}${path}`,
      config: this.config,
      query,
      retry: this.retry
    })
  }
}

const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const buildUrl = (url, query) => {
  if (!query) return url
  const normalized = Object.fromEntries(
    Object.entries(query).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])
  )
  const qstr = qs.stringify(normalized)
  return qstr ? `${url}?${qstr}` : url
}

const executeRequest = async ({ fetcher, url, config, query, retry }) => {
  const finalUrl = buildUrl(url, query)
  const attempts = Math.max(1, (retry && retry.attempts) || 1)
  const baseDelay = (retry && retry.delay) || 300

  let lastError

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetcher(finalUrl, config)
      if (res && typeof res.status === 'number' && RETRY_STATUSES.has(res.status) && attempt < attempts) {
        await sleep(baseDelay * Math.pow(2, attempt - 1))
        continue
      }
      return res.json()
    } catch (err) {
      lastError = err
      if (attempt >= attempts) throw err
      await sleep(baseDelay * Math.pow(2, attempt - 1))
    }
  }

  throw lastError
}

module.exports = CoinpaprikaAPI
module.exports.default = CoinpaprikaAPI
