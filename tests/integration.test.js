const nock = require('nock')
const CoinpaprikaAPI = require('../index')

const HOST = 'https://api.coinpaprika.com'

describe('integration (nock)', () => {
  beforeEach(() => {
    if (!nock.isActive()) nock.activate()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  afterAll(() => {
    nock.restore()
  })

  it('getGlobal returns the mocked payload', async () => {
    nock(HOST).get('/v1/global').reply(200, { market_cap_usd: 42 })
    const client = new CoinpaprikaAPI()
    const res = await client.getGlobal()
    expect(res).toEqual({ market_cap_usd: 42 })
  })

  it('getCoinMarkets serializes an array as CSV in the query', async () => {
    nock(HOST)
      .get('/v1/coins/btc-bitcoin/markets')
      .query({ quotes: 'USD,BTC' })
      .reply(200, [{ exchange_id: 'binance' }])
    const client = new CoinpaprikaAPI()
    const res = await client.getCoinMarkets('btc-bitcoin', { quotes: ['USD', 'BTC'] })
    expect(res).toEqual([{ exchange_id: 'binance' }])
  })

  it('apiKey sends Authorization: Bearer', async () => {
    nock(HOST, { reqheaders: { Authorization: 'Bearer secret-abc' } })
      .get('/v1/key/info')
      .reply(200, { plan: 'pro' })
    const client = new CoinpaprikaAPI({ apiKey: 'secret-abc' })
    const res = await client.getKeyInfo()
    expect(res).toEqual({ plan: 'pro' })
  })

  it('retry: recovers from 503 when retry policy is enabled', async () => {
    nock(HOST).get('/v1/global').reply(503)
    nock(HOST).get('/v1/global').reply(200, { ok: true })
    const client = new CoinpaprikaAPI({ retry: { attempts: 3, delay: 1 } })
    const res = await client.getGlobal()
    expect(res).toEqual({ ok: true })
  })

  it('search bubbles up request rejection when host is unreachable', async () => {
    nock(HOST).get('/v1/search').query(true).replyWithError('ENETUNREACH')
    const client = new CoinpaprikaAPI()
    await expect(client.search({ q: 'x' })).rejects.toThrow()
  })

  it('abort via constructor signal surfaces as a rejected promise', async () => {
    const controller = new AbortController()
    nock(HOST).get('/v1/global').delayConnection(500).reply(200, { ok: true })
    const client = new CoinpaprikaAPI({ config: { signal: controller.signal } })
    const p = client.getGlobal()
    controller.abort()
    await expect(p).rejects.toThrow()
  })

  it('withSignal scopes abort to a single call without affecting the parent', async () => {
    const controller = new AbortController()
    nock(HOST).get('/v1/global').delayConnection(500).reply(200, { scoped: true })
    nock(HOST).get('/v1/coins').reply(200, [{ id: 'btc' }])

    const client = new CoinpaprikaAPI()
    const scopedPromise = client.withSignal(controller.signal).getGlobal()
    controller.abort()
    await expect(scopedPromise).rejects.toThrow()

    // The parent client is unaffected and can still make requests.
    const coins = await client.getCoins()
    expect(coins).toEqual([{ id: 'btc' }])
  })
})
