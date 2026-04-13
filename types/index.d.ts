// Type definitions for @coinpaprika/api-nodejs-client
// Project: https://github.com/coinpaprika/coinpaprika-api-nodejs-client

declare namespace CoinpaprikaAPI {
  type Scalar = string | number | boolean
  type QueryValue = Scalar | Scalar[]
  interface QueryParams {
    [key: string]: QueryValue | undefined
  }

  interface FetchResponseLike {
    status?: number
    json(): Promise<any>
  }

  type Fetcher = (url: string, config?: any) => Promise<FetchResponseLike>

  interface RetryOptions {
    /** Max attempts (including the first). Default 3 when `retry` is set. */
    attempts?: number
    /** Base delay in ms; doubled on each subsequent attempt (exponential backoff). Default 300. */
    delay?: number
  }

  interface Options {
    /** API version path segment. Defaults to 'v1'. */
    version?: string
    /** Base fetch config merged into every request (headers, signal, agent, ...). */
    config?: Record<string, any>
    /** Coinpaprika Pro API key. Injected as `Authorization: Bearer <key>`. */
    apiKey?: string
    /** Opt-in retry policy; retries on 408/425/429/5xx and network errors. */
    retry?: RetryOptions
    /** Override the underlying fetch implementation. */
    fetcher?: Fetcher
  }

  interface HistoricalParams {
    start: string
    end?: string
    limit?: number
    quote?: string
    interval?: string
  }

  interface GetTickerArgs {
    coinId?: string
  }

  interface GetAllTickersParams {
    coinId?: string
    quotes?: string | string[]
    historical?: HistoricalParams
  }

  interface OHLCVHistoricalParams {
    coinId: string
    start: string
    end?: string
    quote?: string
  }

  interface OHLCVQueryParams {
    quote?: string
  }

  interface MarketsParams {
    quotes?: string | string[]
  }

  interface MappingsParams extends QueryParams {}

  interface TagsParams {
    additional_fields?: string
  }

  interface ExchangesParams {
    quotes?: string | string[]
  }

  interface SearchParams {
    q: string
    c?: string | string[]
    modifier?: string
    limit?: number
  }

  interface PriceConverterParams {
    base_currency_id: string
    quote_currency_id: string
    amount?: number
  }
}

declare class CoinpaprikaAPI {
  constructor (options?: CoinpaprikaAPI.Options)

  getGlobal (): Promise<any>

  /** @deprecated Upstream `/ticker` is deprecated; prefer `getCoin` / `getCoinsOHLCVLatest`. */
  getTicker (args?: CoinpaprikaAPI.GetTickerArgs): Promise<any>

  /** @deprecated Prefer the explicit endpoints. */
  getAllTickers (params?: CoinpaprikaAPI.GetAllTickersParams): Promise<any>

  getCoins (): Promise<any>
  getCoin (coinId: string, params?: CoinpaprikaAPI.QueryParams): Promise<any>

  getCoinsOHLCVHistorical (params: CoinpaprikaAPI.OHLCVHistoricalParams): Promise<any>
  getCoinsOHLCVLatest (coinId: string, params?: CoinpaprikaAPI.OHLCVQueryParams): Promise<any>
  getCoinsOHLCVToday (coinId: string, params?: CoinpaprikaAPI.OHLCVQueryParams): Promise<any>

  getCoinTwitter (coinId: string): Promise<any>
  getCoinEvents (coinId: string): Promise<any>
  getCoinExchanges (coinId: string): Promise<any>
  getCoinMarkets (coinId: string, params?: CoinpaprikaAPI.MarketsParams): Promise<any>
  getCoinsMappings (params?: CoinpaprikaAPI.MappingsParams): Promise<any>

  getPeople (personId: string): Promise<any>

  getTags (params?: CoinpaprikaAPI.TagsParams): Promise<any>
  getTag (tagId: string, params?: CoinpaprikaAPI.TagsParams): Promise<any>

  getExchanges (params?: CoinpaprikaAPI.ExchangesParams): Promise<any>
  getExchange (exchangeId: string, params?: CoinpaprikaAPI.ExchangesParams): Promise<any>
  getExchangeMarkets (exchangeId: string, params?: CoinpaprikaAPI.ExchangesParams): Promise<any>

  search (params: CoinpaprikaAPI.SearchParams): Promise<any>
  priceConverter (params: CoinpaprikaAPI.PriceConverterParams): Promise<any>

  getPlatforms (): Promise<any>
  getContracts (platformId: string): Promise<any>
  getTickerByContract (platformId: string, contractAddress: string): Promise<any>
  getHistoricalByContract (platformId: string, contractAddress: string, params?: CoinpaprikaAPI.HistoricalParams): Promise<any>

  getKeyInfo (): Promise<any>
  getChangelogIds (): Promise<any>
}

export = CoinpaprikaAPI
