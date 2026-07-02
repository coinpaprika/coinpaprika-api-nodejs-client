const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getCoins', () => {
  it('returns Promise if async/await not used', () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve([])
      })
    })
    const response = mockClient.getCoins()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns array of objects consistent with API documentation', async () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve([{
          id: 'btc-bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          rank: 1,
          is_new: false,
          is_active: true,
          type: 'coin'
        }])
      })
    })
    const response = await mockClient.getCoins()
    expect(Array.isArray(response)).toBeTruthy()

    const expectedProperties = ['id', 'name', 'symbol', 'rank', 'is_new', 'is_active', 'type']

    response.forEach(coin => {
      expect(isObject(coin)).toBeTruthy()
      expectedProperties.forEach(property => {
        expect(coin.hasOwnProperty(property)).toBeTruthy()
      })
    })
  })
})
