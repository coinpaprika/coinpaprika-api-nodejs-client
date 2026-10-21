const CoinpaprikaAPI = require('../index')

// Regression test for the id-encoding finding: every id-taking method must
// reject or safely encode a caller-supplied id so it can never steer the
// request to a different endpoint (for example /key/info) or add a query
// string or fragment. Each payload below either throws before any request is
// made, or results in a single encoded path segment under the method's own
// fixed endpoint.

const mockFetcher = (response = {}, status = 200) =>
  jest.fn().mockResolvedValue({ status, json: () => Promise.resolve(response) })

const TRAVERSAL_PAYLOADS = [
  '../key/info',
  '../../usage',
  '..%2F..%2Fusage',
  'a/b',
  'x?y=1',
  'x#y',
  '%2e%2e',
  '..\\x',
  '․․', // U+2024 ONE DOT LEADER
  '．．', // U+FF0E FULLWIDTH FULL STOP
  '∕', // U+2215 DIVISION SLASH
  '／' // U+FF0F FULLWIDTH SOLIDUS
]

// Methods that take a single id as their first argument, with the fixed
// path prefix/suffix the id must stay inside of.
const SINGLE_ID_METHODS = [
  ['getCoin', 'coins', ''],
  ['getCoinsOHLCVLatest', 'coins', '/ohlcv/latest'],
  ['getCoinsOHLCVToday', 'coins', '/ohlcv/today'],
  ['getCoinTwitter', 'coins', '/twitter'],
  ['getCoinEvents', 'coins', '/events'],
  ['getCoinExchanges', 'coins', '/exchanges'],
  ['getCoinMarkets', 'coins', '/markets'],
  ['getPeople', 'people', ''],
  ['getTag', 'tags', ''],
  ['getExchange', 'exchanges', ''],
  ['getExchangeMarkets', 'exchanges', '/markets'],
  ['getContracts', 'contracts', '']
]

describe('path parameter encoding (regression for the id-traversal finding)', () => {
  let fetcher
  let client

  beforeEach(() => {
    fetcher = mockFetcher()
    client = new CoinpaprikaAPI({ fetcher })
  })

  const calledUrl = () => fetcher.mock.calls[0][0]

  describe.each(SINGLE_ID_METHODS)('%s', (method, prefix, suffix) => {
    it.each(TRAVERSAL_PAYLOADS)('never escapes its endpoint with payload %j', (payload) => {
      let url
      try {
        client[method](payload)
        url = calledUrl()
      } catch (err) {
        // Rejecting the id outright is an acceptable, safe outcome.
        expect(err).toBeInstanceOf(Error)
        return
      }
      // If the call went through, the id must have landed as a single
      // encoded segment inside this method's own endpoint, never outside it.
      expect(url.startsWith(`https://api.coinpaprika.com/v1/${prefix}/`)).toBe(true)
      const afterPrefix = url.slice(`https://api.coinpaprika.com/v1/${prefix}/`.length)
      const segment = suffix ? afterPrefix.slice(0, afterPrefix.length - suffix.length) : afterPrefix
      expect(afterPrefix.endsWith(suffix)).toBe(true)
      expect(segment).toBe(encodeURIComponent(payload))
      expect(url).not.toContain('/key/info')
      expect(url).not.toContain('/usage')
    })
  })

  it('getCoinsOHLCVHistorical never escapes its endpoint', () => {
    for (const payload of TRAVERSAL_PAYLOADS) {
      try {
        client.getCoinsOHLCVHistorical({ coinId: payload, start: '2020-01-01' })
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
        continue
      }
      const url = calledUrl()
      expect(url).not.toContain('/key/info')
      expect(url.startsWith('https://api.coinpaprika.com/v1/coins/')).toBe(true)
    }
  })

  it('getTickerByContract never escapes its endpoint via either id', () => {
    for (const payload of TRAVERSAL_PAYLOADS) {
      try {
        client.getTickerByContract(payload, 'eth-ethereum')
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
      try {
        client.getTickerByContract('eth-ethereum', payload)
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    }
    for (const call of fetcher.mock.calls) {
      expect(call[0]).not.toContain('/key/info')
      expect(call[0].startsWith('https://api.coinpaprika.com/v1/contracts/')).toBe(true)
    }
  })

  it('getHistoricalByContract never escapes its endpoint via either id', () => {
    for (const payload of TRAVERSAL_PAYLOADS) {
      try {
        client.getHistoricalByContract(payload, 'eth-ethereum', {})
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
      try {
        client.getHistoricalByContract('eth-ethereum', payload, {})
      } catch (err) {
        expect(err).toBeInstanceOf(Error)
      }
    }
    for (const call of fetcher.mock.calls) {
      expect(call[0]).not.toContain('/key/info')
      expect(call[0].startsWith('https://api.coinpaprika.com/v1/contracts/')).toBe(true)
    }
  })

  it('the exact payloads from the audit reach only their own endpoint, never /key/info', () => {
    const cases = [
      ['getExchange', ['../key/info']],
      ['getTag', ['.%2E/key/info']],
      ['getCoinEvents', ['../key/info#']],
      ['getHistoricalByContract', ['eth-ethereum', '../../key/info?', {}]]
    ]
    for (const [method, args] of cases) {
      let threw = false
      try {
        client[method](...args)
      } catch (err) {
        threw = true
      }
      if (!threw) {
        const url = calledUrl()
        expect(url).not.toContain('/key/info')
        fetcher.mockClear()
      }
    }
  })

  it('still allows legitimate ids through unencoded-looking but safe', () => {
    client.getExchange('binance')
    expect(calledUrl()).toBe('https://api.coinpaprika.com/v1/exchanges/binance')
  })

  it('rejects empty, "." and ".." ids outright', () => {
    expect(() => client.getExchange('.')).toThrow()
    expect(() => client.getExchange('..')).toThrow()
    expect(() => client.getTag('.')).toThrow()
    expect(() => client.getTag('..')).toThrow()
  })
})
