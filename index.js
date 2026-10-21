'use strict'

const qs = require('qs')

const BASE_URL = 'https://api.coinpaprika.com'
const PRO_BASE_URL = 'https://api-pro.coinpaprika.com'

if (typeof globalThis.fetch !== 'function') {
  throw new Error('@coinpaprika/api-nodejs-client 3.x requires Node.js 18+ (global fetch). For older runtimes use 2.x.')
}

const defaultFetcher = globalThis.fetch.bind(globalThis)

// Matches a path separator, '\', '?', '#', '%' or whitespace/control characters
// once the candidate id has been percent-decoded a single time.
// eslint-disable-next-line no-control-regex
const UNSAFE_SEGMENT_CHARS = /[/\\?#%\s\x00-\x1f]/

/**
 * Validate and encode a caller-supplied id as exactly one URL path segment.
 * Rejects empty ids, '.' / '..', and ids that decode (one percent-decode pass)
 * to a separator, '?', '#', '%', whitespace or a control character, so a value
 * like '../key/info' or 'x#y' can never add, remove or replace path segments.
 */
const seg = (value) => {
  const s = String(value)
  if (s === '') throw new Error('id must not be empty')
  let decoded
  try {
    decoded = decodeURIComponent(s)
  } catch (err) {
    throw new Error('invalid id')
  }
  if (decoded === '.' || decoded === '..' || UNSAFE_SEGMENT_CHARS.test(decoded)) {
    throw new Error('invalid id')
  }
  return encodeURIComponent(s)
}

/**
 * Defence in depth for seg(): confirm that inserting the encoded id did not
 * change which path the final URL resolves to (catches anything a URL parser
 * rewrites after the fact, such as normalizing a dot segment).
 */
const assertPathIntegrity = (baseUrl, path, fullUrl) => {
  let expectedPathname
  try {
    expectedPathname = new URL(baseUrl).pathname + path
  } catch (err) {
    return // baseUrl is not an absolute URL (custom fetcher/base); nothing to verify
  }
  let actualPathname
  try {
    actualPathname = new URL(fullUrl).pathname
  } catch (err) {
    throw new Error('invalid request URL')
  }
  if (actualPathname !== expectedPathname) {
    throw new Error('invalid request path')
  }
}

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
    return this._request({ path: `/coins/${seg(coinId)}`, query: params })
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
    return this._request({ path: `/coins/${seg(coinId)}/ohlcv/historical`, query })
  }

  getCoinsOHLCVLatest (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/ohlcv/latest`, query: params })
  }

  getCoinsOHLCVToday (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/ohlcv/today`, query: params })
  }

  getCoinTwitter (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/twitter` })
  }

  getCoinEvents (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/events` })
  }

  getCoinExchanges (coinId) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/exchanges` })
  }

  getCoinMarkets (coinId, params = {}) {
    if (!coinId) throw new Error('coinId is required')
    return this._request({ path: `/coins/${seg(coinId)}/markets`, query: params })
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
    return this._request({ path: `/people/${seg(personId)}` })
  }

  getTags (params = {}) {
    return this._request({ path: '/tags', query: params })
  }

  getTag (tagId, params = {}) {
    if (!tagId) throw new Error('tagId is required')
    return this._request({ path: `/tags/${seg(tagId)}`, query: params })
  }

  getExchanges (params = {}) {
    return this._request({ path: '/exchanges', query: params })
  }

  getExchange (exchangeId, params = {}) {
    if (!exchangeId) throw new Error('exchangeId is required')
    return this._request({ path: `/exchanges/${seg(exchangeId)}`, query: params })
  }

  getExchangeMarkets (exchangeId, params = {}) {
    if (!exchangeId) throw new Error('exchangeId is required')
    return this._request({ path: `/exchanges/${seg(exchangeId)}/markets`, query: params })
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
    return this._request({ path: `/contracts/${seg(platformId)}` })
  }

  getTickerByContract (platformId, contractAddress) {
    if (!platformId) throw new Error('platformId is required')
    if (!contractAddress) throw new Error('contractAddress is required')
    return this._request({ path: `/contracts/${seg(platformId)}/${seg(contractAddress)}` })
  }

  getHistoricalByContract (platformId, contractAddress, params = {}) {
    if (!platformId) throw new Error('platformId is required')
    if (!contractAddress) throw new Error('contractAddress is required')
    return this._request({ path: `/contracts/${seg(platformId)}/${seg(contractAddress)}/historical`, query: params })
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
    const url = `${this.url}${path}`
    assertPathIntegrity(this.url, path, url)
    return executeRequest({
      fetcher: this.fetcher,
      url,
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
