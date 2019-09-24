const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getAllTickers', () => {
  let client = null

  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('returns Promise if async/await not used', () => {
    const response = client.getGlobal()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns object with properties consistent to doc', async () => {
    const response = await client.getGlobal()
    expect(isObject(response)).toBeTruthy()
    const expectedProperties = [
      'market_cap_usd',
      'volume_24h_usd',
      'bitcoin_dominance_percentage',
      'cryptocurrencies_number',
      'market_cap_ath_value',
      'market_cap_ath_date',
      'volume_24h_ath_value',
      'volume_24h_ath_date',
      'market_cap_change_24h',
      'volume_24h_change_24h',
      'last_updated'
    ]

    expectedProperties.forEach(property => {
      expect(response.hasOwnProperty(property)).toBeTruthy()
    })
  })
})
