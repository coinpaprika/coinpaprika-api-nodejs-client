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
    expect(client.getCoin).toBeDefined()
    expect(client.getAllTickers).toBeDefined()
    expect(client.getTicker).toBeDefined()
    expect(client.getCoinsOHLCVHistorical).toBeDefined()
    expect(client.getCoinsOHLCVLatest).toBeDefined()
    expect(client.getCoinsOHLCVToday).toBeDefined()
    expect(client.getCoinTwitter).toBeDefined()
    expect(client.getCoinEvents).toBeDefined()
    expect(client.getCoinExchanges).toBeDefined()
    expect(client.getCoinMarkets).toBeDefined()
    expect(client.getCoinsMappings).toBeDefined()
    expect(client.getPeople).toBeDefined()
    expect(client.getTags).toBeDefined()
    expect(client.getTag).toBeDefined()
    expect(client.getExchanges).toBeDefined()
    expect(client.getExchange).toBeDefined()
    expect(client.getExchangeMarkets).toBeDefined()
    expect(client.search).toBeDefined()
    expect(client.priceConverter).toBeDefined()
    expect(client.getPlatforms).toBeDefined()
    expect(client.getContracts).toBeDefined()
    expect(client.getTickerByContract).toBeDefined()
    expect(client.getHistoricalByContract).toBeDefined()
    expect(client.getKeyInfo).toBeDefined()
    expect(client.getChangelogIds).toBeDefined()
  })
})
