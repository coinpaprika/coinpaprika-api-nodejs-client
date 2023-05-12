const CoinpaprikaAPI = require('../index')

describe('getCoinsOHLCVHistorical', () => {
  let client = null
  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  const weekAgo = new Date(Date.now() - 1000 * 60 * 60 * 1)
  const start = weekAgo.toISOString().slice(0, 10)

  it('returns array of objects consistent with API documentation', async () => {
    const weekAgo = new Date(Date.now() - 7 * 1000)
    const params = {
        coinId: "btc-bitcoin",
        quote: "usd",
        start: weekAgo.toISOString().slice(0, 10),
    } 
    const response = await client.getCoinsOHLCVHistorical(params)
    console.log(response)
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
    const params = {
      coinId: "btc-bitcoin",
      quote: "usd",
      start
    }
    const response = client.getCoinsOHLCVHistorical(params)
    expect(response instanceof Promise).toBe(true)
  })

  it('throw an error if the parameter is an array', async () => {
    expect(() => {
      const params = []
      client.getCoinsOHLCVHistorical(params).resolve()
    }).toThrowError("Please pass object as arg.")
  })

})
