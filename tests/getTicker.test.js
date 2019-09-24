const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getAllTickers', () => {
  let client = null

  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('returns Promise if async/await not used', () => {
    const response = client.getTicker()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns array of objects consistent with API documentation', async () => {
    const response = await client.getTicker()
    expect(Array.isArray(response)).toBeTruthy()
    const expectedProperties = [
      'id',
      'name',
      'rank',
      'symbol',
      'price_usd',
      'price_btc',
      'volume_24h_usd',
      'market_cap_usd',
      'circulating_supply',
      'total_supply',
      'max_supply',
      'percent_change_1h',
      'percent_change_24h',
      'percent_change_7d',
      'last_updated'
    ]

    response.forEach(item => {
      expect(isObject(item)).toBeTruthy()
      expectedProperties.forEach(property => {
        expect(item.hasOwnProperty(property)).toBeTruthy()
      })
    })
  })

  it('it returns correct object when called with coinID', async () => {
    const payload = { coinId: 'btc-bitcoin' }

    const response = await client.getTicker(payload)
    expect(response.id).toMatch('btc-bitcoin')
    expect(response.symbol).toMatch('BTC')
    expect(response.price_btc).toMatch('1')
  })

  it('throws when object is not passed as arg', () => {
    const payload = 'something'
    expect(() => {
      client.getTicker(payload)
    }).toThrowError('Please pass object as arg.')
  })
})
