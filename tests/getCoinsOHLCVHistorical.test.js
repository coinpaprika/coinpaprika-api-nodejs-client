const CoinpaprikaAPI = require('../index')

describe('getCoinsOHLCVHistorical', () => {
  let client = null
  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('returns array of objects consistent with API documentation', async () => {
    const params = {
        coinId: "btc-bitcoin",
        quote: "usd",
        start: "2020-01-01",
        end: "2020-01-02"
    } 
    const response = await client.getCoinsOHLCVHistorical(params)
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
      start: "2020-01-01",
      end: "2020-01-02"
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
