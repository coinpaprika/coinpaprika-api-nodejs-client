const CoinpaprikaAPI = require('../index')

const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'

describe('getAllTickers', () => {
  let client = null

  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('returns Promise if async/await not used', () => {
    const response = client.getAllTickers()
    expect(response instanceof Promise).toBe(true)
  })

  it('returns array of objects consistent to API documentation', async () => {
    const response = await client.getAllTickers()
    expect(Array.isArray(response)).toBeTruthy()
    const expectedProperties = ['id', 'name', 'rank', 'symbol', 'circulating_supply', 'total_supply', 'max_supply', 'beta_value', 'last_updated', 'quotes']

    response.forEach(item => {
      expect(isObject(item)).toBeTruthy()
      expectedProperties.forEach(property => {
        expect(item.hasOwnProperty(property)).toBeTruthy()
      })
    })
  })

  it('returns particular coin when called with coinId param', async () => {
    const payload = { coinId: 'btc-bitcoin' }
    const response = await client.getAllTickers(payload)

    expect(isObject(response)).toBeTruthy()
    expect(response.id).toMatch('btc-bitcoin')
    expect(response.symbol).toMatch('BTC')
    expect(response.name.toLowerCase()).toMatch('bitcoin')
  })

  it('returns quotes object with expected params when called with quotes param', async () => {
    const quotes = ['BTC', 'PLN', 'ETH']
    const payload = { quotes }
    const response = await client.getAllTickers(payload)
    expect(Array.isArray(response)).toBeTruthy()

    response.forEach(({ quotes }) => {
      expect(isObject(quotes))
      expect(quotes.hasOwnProperty(quotes[0]))
      expect(quotes.hasOwnProperty(quotes[1]))
      expect(quotes.hasOwnProperty(quotes[2]))
    })
  })

  it('returns historical coin data when "coinId","historical" and "historical.start" were pass', async () => {
    const payload = {
      coinId: 'btc-bitcoin',
      historical: {
        start: '2019-09-22'
      }
    }

    const response = await client.getAllTickers(payload)
    expect(Array.isArray(response)).toBeTruthy()

    response.forEach(item => {
      expect(isObject(item)).toBeTruthy()
      expect(item.hasOwnProperty('timestamp')).toBeTruthy()
      expect(item.hasOwnProperty('price')).toBeTruthy()
      expect(item.hasOwnProperty('volume_24h')).toBeTruthy()
      expect(item.hasOwnProperty('market_cap')).toBeTruthy()
    })
  })

  it('returns properly response when all of "historical" params are passed', async () => {
    const payload = {
      coinId: 'btc-bitcoin',
      historical: {
        start: '2019-09-18',
        end: '2019-09-19',
        limit: 2000,
        interval: '1h',
        quote: 'btc'
      }
    }

    const response = await client.getAllTickers(payload)
    expect(Array.isArray(response)).toBeTruthy()
    expect(response.length).toEqual(24)

    response.forEach(item => {
      expect(isObject(item)).toBeTruthy()
      expect(item.price).toBeLessThanOrEqual(1.001)
    })
  })

  it('throws when is historical endpoint call but coinId param was not pass', () => {
    const payload = {
      historical: {
        start: '2019-09-22'
      }
    }
    expect(() => {
      client.getAllTickers(payload)
    }).toThrowError('required param was not pass, please check CoinpaprikaAPI client usage')
  })

  it('throws when is historical endpoint call but historical.start is not defined', () => {
    const payload = {
      coinId: 'btc-bitcoin',
      historical: {
        quote: 'usd',
        last: '2019-09-22'
      }
    }

    expect(() => {
      client.getAllTickers(payload)
    }).toThrowError('required param was not pass, please check CoinpaprikaAPI client usage')
  })

  it('throws when object is not passed as arg', () => {
    const payload = 'something'

    expect(() => {
      client.getAllTickers(payload)
    }).toThrowError('Please pass object as arg.')
  })
})
