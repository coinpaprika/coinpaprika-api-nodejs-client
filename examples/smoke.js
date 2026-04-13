'use strict'

/*
 * Live smoke / stress test for @coinpaprika/api-nodejs-client.
 * Exercises a representative slice of public endpoints against the real API,
 * plus 2.2.0 feature paths (apiKey, retry, AbortSignal, injected fetcher).
 *
 * Usage:  node examples/smoke.js
 * Exits non-zero if any check fails.
 */

const CoinpaprikaAPI = require('../index')

const client = new CoinpaprikaAPI()

const positive = [
  ['getGlobal', () => client.getGlobal()],
  ['getCoins', () => client.getCoins()],
  ['getCoin', () => client.getCoin('btc-bitcoin')],
  ['getCoin with params', () => client.getCoin('btc-bitcoin', { quotes: ['USD', 'BTC'] })],
  ['getCoinMarkets (CSV)', () => client.getCoinMarkets('btc-bitcoin', { quotes: 'USD,BTC' })],
  ['getCoinMarkets (array)', () => client.getCoinMarkets('btc-bitcoin', { quotes: ['USD', 'BTC'] })],
  ['getCoinExchanges', () => client.getCoinExchanges('btc-bitcoin')],
  ['getCoinEvents', () => client.getCoinEvents('btc-bitcoin')],
  ['getCoinTwitter', () => client.getCoinTwitter('btc-bitcoin')],
  ['getCoinsOHLCVLatest', () => client.getCoinsOHLCVLatest('btc-bitcoin')],
  ['getCoinsOHLCVToday', () => client.getCoinsOHLCVToday('btc-bitcoin')],
  ['getExchanges', () => client.getExchanges()],
  ['getExchange', () => client.getExchange('binance')],
  ['getExchangeMarkets', () => client.getExchangeMarkets('binance', { quotes: ['USD', 'BTC'] })],
  ['getPlatforms', () => client.getPlatforms()],
  ['getContracts', () => client.getContracts('eth-ethereum')],
  ['search', () => client.search({ q: 'bitcoin', limit: 3 })],
  ['priceConverter', () => client.priceConverter({ base_currency_id: 'btc-bitcoin', quote_currency_id: 'usd-us-dollars', amount: 1 })],
  ['getTags', () => client.getTags()],
  ['getTag', () => client.getTag('blockchain-service')],
  ['getPeople', () => client.getPeople('vitalik-buterin')]
]

const negative = [
  {
    name: 'search without q throws sync',
    run: () => {
      try { client.search({}); return { ok: false, detail: 'did not throw' } } catch (e) {
        return { ok: e.message === 'q (search query) is required', detail: e.message }
      }
    }
  },
  {
    name: 'getCoin with no id throws sync',
    run: () => {
      try { client.getCoin(); return { ok: false, detail: 'did not throw' } } catch (e) {
        return { ok: /coinId/i.test(e.message), detail: e.message }
      }
    }
  },
  {
    name: 'bad coinId surfaces API error (no hang)',
    run: async () => {
      const res = await client.getCoin('this-coin-does-not-exist-xyz')
      return { ok: !!(res && res.error), detail: res && (res.error || JSON.stringify(res).slice(0, 60)) }
    }
  }
]

const features = [
  {
    name: 'apiKey injects Authorization header',
    run: async () => {
      let captured = null
      const probe = new CoinpaprikaAPI({
        apiKey: 'dummy-key-for-inspection',
        fetcher: (_url, config) => {
          captured = config
          return Promise.resolve({ status: 200, json: () => Promise.resolve({}) })
        }
      })
      await probe.getKeyInfo()
      return { ok: captured && captured.headers.Authorization === 'Bearer dummy-key-for-inspection', detail: captured && captured.headers.Authorization }
    }
  },
  {
    name: 'retry recovers after transient 503',
    run: async () => {
      let n = 0
      const flaky = new CoinpaprikaAPI({
        retry: { attempts: 3, delay: 10 },
        fetcher: () => {
          n += 1
          if (n < 3) return Promise.resolve({ status: 503, json: () => Promise.resolve({}) })
          return Promise.resolve({ status: 200, json: () => Promise.resolve({ recovered: true }) })
        }
      })
      const res = await flaky.getGlobal()
      return { ok: res.recovered === true && n === 3, detail: `attempts=${n}` }
    }
  },
  {
    name: 'AbortSignal (constructor) cancels request',
    run: async () => {
      const controller = new AbortController()
      const p = new CoinpaprikaAPI({ config: { signal: controller.signal } }).getCoins()
      controller.abort()
      try { await p; return { ok: false, detail: 'did not reject' } } catch (e) {
        return { ok: /abort/i.test(e.message) || e.name === 'AbortError', detail: e.name + ': ' + e.message.slice(0, 60) }
      }
    }
  },
  {
    name: 'withSignal scopes abort per-call',
    run: async () => {
      const parent = new CoinpaprikaAPI()
      const controller = new AbortController()
      const scopedP = parent.withSignal(controller.signal).getCoins()
      controller.abort()
      try {
        await scopedP
        return { ok: false, detail: 'scoped call did not reject' }
      } catch (e) {
        // Parent must still work after scoped abort.
        const g = await parent.getGlobal()
        return { ok: !!g && typeof g === 'object', detail: `scoped aborted (${e.name}); parent still works` }
      }
    }
  }
]

const describeShape = (v) => Array.isArray(v) ? `array(${v.length})` : (v && typeof v === 'object' ? `object(${Object.keys(v).length} keys)` : typeof v)

async function run () {
  let pass = 0
  let fail = 0

  console.log('--- positive path ---')
  for (const [name, fn] of positive) {
    const t0 = Date.now()
    try {
      const res = await fn()
      console.log(`  OK   ${name.padEnd(28)} ${String(Date.now() - t0).padStart(5)}ms  -> ${describeShape(res)}`)
      pass++
    } catch (e) {
      console.log(`  FAIL ${name.padEnd(28)} ${String(Date.now() - t0).padStart(5)}ms  -> ${e.message}`)
      fail++
    }
  }

  console.log('\n--- negative path ---')
  for (const { name, run } of negative) {
    try {
      const { ok, detail } = await run()
      console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(48)} -> ${detail}`)
      ok ? pass++ : fail++
    } catch (e) {
      console.log(`  FAIL ${name.padEnd(48)} -> threw: ${e.message}`)
      fail++
    }
  }

  console.log('\n--- 3.0.0 features ---')
  for (const { name, run } of features) {
    try {
      const { ok, detail } = await run()
      console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${name.padEnd(48)} -> ${detail}`)
      ok ? pass++ : fail++
    } catch (e) {
      console.log(`  FAIL ${name.padEnd(48)} -> threw: ${e.message}`)
      fail++
    }
  }

  console.log(`\n${pass} pass, ${fail} fail`)
  process.exit(fail ? 1 : 0)
}

run()
