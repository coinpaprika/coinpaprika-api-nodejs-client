const CoinpaprikaAPI = require('../index')

describe('CoinpaprikaAPI class', () => {
  let client = null

  beforeEach(() => {
    client = new CoinpaprikaAPI()
  })

  it('is defined', () => {
    expect(client).toBeDefined()
  })

  it('has defined all endpoints consistent to API documentation', () => {
    expect(client.getGlobal).toBeDefined()
    expect(client.getCoins).toBeDefined()
    expect(client.getAllTickers).toBeDefined()
    expect(client.getTicker).toBeDefined()
  })
})
