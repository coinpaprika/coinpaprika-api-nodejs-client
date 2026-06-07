const CoinpaprikaAPI = require('../index')

describe('getCoinsOHLCVHistorical', () => {
  let client = null
  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  const weekAgo = new Date(Date.now() - 1000 * 60 * 60 * 1)
  const start = weekAgo.toISOString().slice(0, 10)

  it('returns array of objects consistent with API documentation', async () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve([{
          time_open: '2026-06-07T00:00:00Z',
          time_close: '2026-06-07T01:00:00Z',
          open: 1,
          high: 2,
          low: 1,
          close: 2,
          volume: 3,
          market_cap: 4
        }])
      })
    })
    const params = {
      coinId: "btc-bitcoin",
      quote: "usd",
      start
    }
    const response = await mockClient.getCoinsOHLCVHistorical(params)
    expect(Array.isArray(response)).toBeTruthy()

    const expectedProperties = ['time_open', 'time_close', 'open', 'high', 'low', 'close', 'volume', 'market_cap']

    response.forEach(value => {
      expect(typeof value).toBe("object")
      expectedProperties.forEach(property => {
        expect(value.hasOwnProperty(property)).toBeTruthy()
      })
    })
  })

  it('returns Promise if async/await not used', () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve([])
      })
    })
    const params = {
      coinId: "btc-bitcoin",
      quote: "usd",
      start
    }
    const response = mockClient.getCoinsOHLCVHistorical(params)
    expect(response instanceof Promise).toBe(true)
  })

  it('throw an error if the parameter is an array', async () => {
    expect(() => {
      const params = []
      client.getCoinsOHLCVHistorical(params).resolve()
    }).toThrowError("Please pass object as arg.")
  })

})
