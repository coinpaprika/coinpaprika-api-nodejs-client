const CoinpaprikaAPI = require('../index')

const mockFetcher = (response = {}, status = 200) =>
  jest.fn().mockResolvedValue({ status, json: () => Promise.resolve(response) })

describe('CoinpaprikaAPI class', () => {
  let client = null

  beforeEach(() => {
    client = new CoinpaprikaAPI({ fetcher: mockFetcher() })
  })

  it('is defined', () => {
    expect(client).toBeDefined()
  })

  it('has defined all endpoints consistent to API documentation', () => {
    const methods = [
      'getGlobal', 'getCoins', 'getCoin',
      'getCoinsOHLCVHistorical', 'getCoinsOHLCVLatest', 'getCoinsOHLCVToday',
      'getCoinTwitter', 'getCoinEvents', 'getCoinExchanges', 'getCoinMarkets',
      'getCoinsMappings', 'getPeople', 'getTags', 'getTag',
      'getExchanges', 'getExchange', 'getExchangeMarkets',
      'search', 'priceConverter',
      'getPlatforms', 'getContracts', 'getTickerByContract', 'getHistoricalByContract',
      'getKeyInfo', 'getChangelogIds',
      'withSignal'
    ]
    for (const m of methods) expect(typeof client[m]).toBe('function')
  })

  it('does not expose legacy removed methods', () => {
    expect(client.getTicker).toBeUndefined()
    expect(client.getAllTickers).toBeUndefined()
  })

  it('exposes default export for ESM interop', () => {
    expect(CoinpaprikaAPI.default).toBe(CoinpaprikaAPI)
  })
})

describe('URL construction', () => {
  let fetcher = null
  let client = null

  beforeEach(() => {
    fetcher = mockFetcher()
    client = new CoinpaprikaAPI({ fetcher })
  })

  const calledUrl = () => fetcher.mock.calls[0][0]
  const calledConfig = () => fetcher.mock.calls[0][1]

  it('getCoinsOHLCVLatest appends coinId and query', () => {
    client.getCoinsOHLCVLatest('btc-bitcoin', { quote: 'usd' })
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/coins/btc-bitcoin/ohlcv/latest?quote=usd')
  })

  it('getCoinMarkets serializes array quotes as CSV', () => {
    client.getCoinMarkets('btc-bitcoin', { quotes: ['USD', 'BTC'] })
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/coins/btc-bitcoin/markets?quotes=USD%2CBTC')
  })

  it('getExchangeMarkets accepts string quotes', () => {
    client.getExchangeMarkets('binance', { quotes: 'USD' })
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/exchanges/binance/markets?quotes=USD')
  })

  it('search encodes query param', () => {
    client.search({ q: 'bitcoin' })
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/search?q=bitcoin')
  })

  it('getTickerByContract joins two path segments', () => {
    client.getTickerByContract('eth-ethereum', '0xdac17f958d2ee523a2206206994597c13d831ec7')
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/contracts/eth-ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7')
  })

  it('no query yields a bare URL', () => {
    client.getGlobal()
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/global')
  })

  it('getCoin accepts optional params', () => {
    client.getCoin('btc-bitcoin', { quotes: ['USD', 'BTC'] })
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/coins/btc-bitcoin?quotes=USD%2CBTC')
  })

  it('search throws without q', () => {
    expect(() => client.search({})).toThrow('q (search query) is required')
  })

  it('getCoin forwards constructor config headers', () => {
    const withCfg = new CoinpaprikaAPI({
      fetcher,
      config: { headers: { 'X-Test': '1' } }
    })
    withCfg.getCoin('btc-bitcoin')
    expect(calledConfig().headers['X-Test']).toBe('1')
  })
})

describe('apiKey option', () => {
  it('injects Authorization: Bearer header on every request', () => {
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ apiKey: 'test-key-123', fetcher })
    client.getKeyInfo()
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key-123')
  })

  it('omits Authorization when no apiKey', () => {
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ fetcher })
    client.getGlobal()
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('apiKey wins over config.headers.Authorization', () => {
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({
      apiKey: 'from-apikey',
      config: { headers: { Authorization: 'Custom from-config' } },
      fetcher
    })
    client.getGlobal()
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer from-apikey')
  })
})

describe('signal / abort support', () => {
  it('forwards AbortSignal from constructor config', () => {
    const controller = new AbortController()
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ config: { signal: controller.signal }, fetcher })
    client.getGlobal()
    expect(fetcher.mock.calls[0][1].signal).toBe(controller.signal)
  })

  it('withSignal returns a new client with that signal', () => {
    const controller = new AbortController()
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ fetcher })
    const scoped = client.withSignal(controller.signal)

    expect(scoped).not.toBe(client)
    expect(scoped).toBeInstanceOf(CoinpaprikaAPI)

    scoped.getGlobal()
    expect(fetcher.mock.calls[0][1].signal).toBe(controller.signal)
  })

  it('withSignal does not mutate the parent client', () => {
    const controller = new AbortController()
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ fetcher })
    client.withSignal(controller.signal)
    client.getGlobal()
    expect(fetcher.mock.calls[0][1].signal).toBeUndefined()
  })

  it('withSignal preserves apiKey, retry, and fetcher', () => {
    const fetcher = mockFetcher()
    const client = new CoinpaprikaAPI({ fetcher, apiKey: 'k', retry: { attempts: 2, delay: 1 } })
    const controller = new AbortController()
    const scoped = client.withSignal(controller.signal)
    scoped.getKeyInfo()
    const cfg = fetcher.mock.calls[0][1]
    expect(cfg.headers.Authorization).toBe('Bearer k')
    expect(scoped.retry).toEqual({ attempts: 2, delay: 1 })
  })
})

describe('retry policy', () => {
  it('retries on 429 then succeeds', async () => {
    let n = 0
    const fetcher = jest.fn().mockImplementation(() => {
      n += 1
      if (n < 3) return Promise.resolve({ status: 429, json: () => Promise.resolve({}) })
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true }) })
    })
    const client = new CoinpaprikaAPI({ fetcher, retry: { attempts: 3, delay: 1 } })
    const res = await client.getGlobal()
    expect(res).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })

  it('retries on network error then succeeds', async () => {
    let n = 0
    const fetcher = jest.fn().mockImplementation(() => {
      n += 1
      if (n === 1) return Promise.reject(new Error('ECONNRESET'))
      return Promise.resolve({ status: 200, json: () => Promise.resolve({ ok: true }) })
    })
    const client = new CoinpaprikaAPI({ fetcher, retry: { attempts: 2, delay: 1 } })
    const res = await client.getGlobal()
    expect(res).toEqual({ ok: true })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 2xx', async () => {
    const fetcher = mockFetcher({ ok: true })
    const client = new CoinpaprikaAPI({ fetcher, retry: { attempts: 3, delay: 1 } })
    await client.getGlobal()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('does not retry when retry option is absent', async () => {
    const fetcher = jest.fn().mockResolvedValue({ status: 503, json: () => Promise.resolve({}) })
    const client = new CoinpaprikaAPI({ fetcher })
    await client.getGlobal()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('gives up after configured attempts and surfaces the last error', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('boom'))
    const client = new CoinpaprikaAPI({ fetcher, retry: { attempts: 3, delay: 1 } })
    await expect(client.getGlobal()).rejects.toThrow('boom')
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
})

describe('fetcher option', () => {
  it('allows injecting a custom fetcher', async () => {
    const fetcher = jest.fn().mockResolvedValue({ status: 200, json: () => Promise.resolve({ hi: 1 }) })
    const client = new CoinpaprikaAPI({ fetcher })
    const res = await client.getGlobal()
    expect(res).toEqual({ hi: 1 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
