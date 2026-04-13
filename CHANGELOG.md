# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-04-13

### Removed (BREAKING)
- **`getTicker(args)` removed.** Upstream `/ticker` has been deprecated by Coinpaprika for some time; replace with `getCoin(coinId)` or `getCoinsOHLCVLatest(coinId)`.
- **`getAllTickers(params)` removed.** Replace with the explicit per-endpoint methods: `getCoins()`, `getCoin()`, `getCoinsOHLCVHistorical()`, `getCoinsOHLCVLatest()`.
- **`node-fetch` dropped as a runtime dependency.** The client uses the built-in global `fetch` unconditionally; the constructor throws at load time if it is not present.

### Changed (BREAKING)
- **`engines.node` bumped to `>=18`.** Node 14–17 are no longer supported. Stay on `2.x` if you need the older runtimes.

### Added
- **Per-call cancellation via `client.withSignal(signal)`.** Returns a new client instance that attaches the given `AbortSignal` to every request it makes; the original client is untouched. Use this to scope cancellation to a single call or a small group of calls without constructing a new client end-to-end:

  ```js
  const controller = new AbortController()
  const scoped = client.withSignal(controller.signal)
  const result = scoped.getCoins()
  controller.abort()
  ```

### Migration from 2.x

```diff
- const data = await client.getTicker({ coinId: 'btc-bitcoin' })
+ const data = await client.getCoin('btc-bitcoin')

- const tickers = await client.getAllTickers({ quotes: ['USD','BTC'] })
+ const coins   = await client.getCoins()
+ const market  = await client.getCoinMarkets('btc-bitcoin', { quotes: ['USD','BTC'] })

- const hist = await client.getAllTickers({ coinId: 'btc-bitcoin', historical: { start: '2024-01-01' } })
+ const hist = await client.getCoinsOHLCVHistorical({ coinId: 'btc-bitcoin', start: '2024-01-01' })
```

Runtime: ensure you're on Node 18 or newer. No `node-fetch` install needed.

## [2.2.0] - 2026-04-13

### Added
- **TypeScript declarations** (`types/index.d.ts`) ship with the package — every method, option, and parameter is typed. No separate `@types` install needed.
- **`apiKey` constructor option.** Pass `new CoinpaprikaAPI({ apiKey })` and `Authorization: Bearer <key>` is injected into every request. Covers Pro-only endpoints (`getCoinsMappings`, `getChangelogIds`, `getKeyInfo`) without hand-crafting headers.
- **Opt-in retry policy** via `new CoinpaprikaAPI({ retry: { attempts, delay } })`. Exponential backoff on 408, 425, 429, 500–504, and network errors. Off by default.
- **Injectable `fetcher`** option (`new CoinpaprikaAPI({ fetcher })`) — simplifies testing, custom transports, and mocking without monkey-patching.
- **Optional `params` argument to `getCoin`** — any query params (e.g. `{ quotes: ['USD','BTC'] }`) are forwarded to `/coins/{id}`.
- **ESM entry point.** `import CoinpaprikaAPI from '@coinpaprika/api-nodejs-client'` now works natively via `exports` map + `index.mjs` wrapper. CommonJS `require()` continues to work unchanged.
- **`nock`-based integration tests** (`tests/integration.test.js`) covering URL construction, array-CSV serialization, `apiKey` headers, retry-on-503, error bubbling, and `AbortSignal` cancellation end-to-end.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) runs lint + Jest on Node 18, 20, 22 for every push and PR.
- **README sections**: Pro API key usage, TypeScript usage, ESM usage, configuration options (retry, signal, custom fetcher), Node version requirements.

### Changed
- **Native `fetch` when available.** On Node 18+ the client uses `globalThis.fetch`; `node-fetch` remains a fallback dependency for Node 14–17. No code changes required for consumers.
- **Legacy methods refactored to the unified `query` pattern.** `getTicker`, `getAllTickers`, and `getCoinsOHLCVHistorical` now delegate query-string building to the shared helper instead of hand-concatenating — same URLs, less code, shared array→CSV normalization.
- `getTicker` and `getAllTickers` are now flagged `@deprecated` in JSDoc and TypeScript; the upstream `/ticker` endpoint is itself deprecated.
- `engines.node` now declares `>=14`.
- `exports` map in `package.json` provides correct resolution for CJS, ESM, and TypeScript consumers.

### Deprecated
- `getTicker(args)` — prefer `getCoin(coinId)` or `getCoinsOHLCVLatest(coinId)`.
- `getAllTickers(params)` — prefer the explicit per-endpoint methods.

## [2.1.1] - 2026-04-13

### Fixed
- `getCoin` now forwards the constructor `config` (headers, auth) to the underlying fetch like every other method. Previously custom headers set via `new CoinpaprikaAPI({ config })` were silently dropped on this one endpoint.
- Array query params (e.g. `{ quotes: ['USD', 'BTC'] }`) are now serialized as comma-separated values (`quotes=USD,BTC`), matching the format Coinpaprika's API expects. Previously only scalar strings worked on the v2.1.0 endpoints; arrays produced indexed keys that the API rejects.

### Changed
- `getCoinsMappings` JSDoc now points at the live API docs for the current supported query params instead of documenting a nonexistent `limit` option.

### Added
- URL-construction tests for the new endpoints: verifies the exact fetched URL, CSV serialization of array params, required-param throws, and that `getCoin` forwards configured headers.

## [2.1.0] - 2026-04-02

### Added
- 21 new endpoints covering the full Coinpaprika public API: `getCoinsOHLCVLatest`, `getCoinsOHLCVToday`, `getCoinTwitter`, `getCoinEvents`, `getCoinExchanges`, `getCoinMarkets`, `getCoinsMappings`, `getPeople`, `getTags`, `getTag`, `getExchanges`, `getExchange`, `getExchangeMarkets`, `search`, `priceConverter`, `getPlatforms`, `getContracts`, `getTickerByContract`, `getHistoricalByContract`, `getKeyInfo`, `getChangelogIds`.
- README reorganized into categorized sections (Market Data / OHLCV / Coins / Exchanges / Contracts / Other) for quicker scanning.

## [2.0.0] - earlier

### Changed
- Version bump to reflect API behavior change (see commit `ce9a1d4`).
- `getCoin(coinId)` added as a first-class method.
