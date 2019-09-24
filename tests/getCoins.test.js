const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getCoins', () => {
  let client = null
  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('returns Promise if async/await not used', () => {
    const response = client.getAllTickers()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns array of objects consistent with API documentation', async () => {
    const response = await client.getCoins()
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
