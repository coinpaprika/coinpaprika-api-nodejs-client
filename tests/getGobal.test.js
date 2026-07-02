const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getAllTickers', () => {
  it('returns Promise if async/await not used', () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve({})
      })
    })
    const response = mockClient.getGlobal()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns object with properties consistent to doc', async () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          market_cap_usd: 1,
          volume_24h_usd: 2,
          bitcoin_dominance_percentage: 3,
          cryptocurrencies_number: 4,
          market_cap_ath_value: 5,
          market_cap_ath_date: '2026-06-07T00:00:00Z',
          volume_24h_ath_value: 6,
          volume_24h_ath_date: '2026-06-07T00:00:00Z',
          market_cap_change_24h: 7,
          volume_24h_change_24h: 8,
          last_updated: 9
        })
      })
    })
    const response = await mockClient.getGlobal()
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
