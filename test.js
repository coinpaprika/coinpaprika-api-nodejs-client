require('jest-extended')
require('jest-chain')
const CoinpaprikaAPI = require('./')

require('dotenv').config()

test('Check CoinpaprikaAPI', () => {
  expect(CoinpaprikaAPI).toBeDefined()
})

test('Check new CoinpaprikaAPI client', () => {
  const client = new CoinpaprikaAPI()
  expect(client.getTicker).toBeDefined()
  expect(client.getGlobal).toBeDefined()
  expect(client.getCoins).toBeDefined()
})

test('check getTicker structure and type', async () => {
  const client = new CoinpaprikaAPI()
  const ticker = await client.getTicker()
  expect(ticker).toBeArray()
  expect(Array.isArray(ticker)).toBeTruthy()
  for (let info of ticker) {
    expect(typeof info).toBe('object')
    expect(info).toHaveProperty('id')
    expect(info).toHaveProperty('name')
    expect(info).toHaveProperty('rank')
  }
})

test('check getGlobal structure and type', async () => {
  const client = new CoinpaprikaAPI()
  const global = await client.getGlobal()

  expect(typeof global).toBe('object')
  expect(global).toHaveProperty('market_cap_usd')
  expect(global).toHaveProperty('volume_24h_usd')
  expect(global).toHaveProperty('bitcoin_dominance_percentage')
  expect(global).toHaveProperty('cryptocurrencies_number')
  expect(global).toHaveProperty('last_updated')
})

test('check getCoins structure and type', async () => {
  const client = new CoinpaprikaAPI()
  const coins = await client.getCoins()
  expect(coins).toBeArray()
  expect(Array.isArray(coins)).toBeTruthy()
  for (let info of coins) {
    expect(typeof info).toBe('object')
    expect(info).toHaveProperty('id')
    expect(info).toHaveProperty('name')
    expect(info).toHaveProperty('symbol')
  }
})

test('check single getTicker for Bitcoin data, structure and type', async () => {
  const client = new CoinpaprikaAPI()
  const ticker = await client.getTicker({ coinId: 'btc-bitcoin' })

  expect(typeof ticker).toBe('object')
  expect(ticker.price_btc).toBe('1')
  expect(ticker.name).toMatch('Bitcoin')
  expect(ticker.symbol).toMatch('BTC')
})
