const CoinpaprikaAPI = require("../index");

describe("getCoin", () => {
  let client = null;

  beforeEach(() => {
    client = new CoinpaprikaAPI();
  });

  it("returns Promise if async/await not used", () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve({})
      })
    });
    const response = mockClient.getCoin("btc-bitcoin");
    expect(response instanceof Promise).toBe(true);
  });

  it("throws an error if no coinId provided", () => {
    expect(() => {
      client.getCoin();
    }).toThrow();
  });

  it("returns coin info consistent to API documentation", async () => {
    const mockClient = new CoinpaprikaAPI({
      fetcher: () => Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
          id: "btc-bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          tags: [],
          rank: 1,
          is_new: false,
          is_active: true,
          type: "coin",
          description: "Bitcoin",
          open_source: true,
          development_status: "Working product",
          hardware_wallet: true,
          proof_type: "Proof of Work",
          org_structure: "Decentralized",
          hash_algorithm: "SHA256",
          links: {},
          links_extended: [],
          whitepaper: {},
          logo: "https://static.coinpaprika.com/coin/btc-bitcoin/logo.png",
          team: [],
          message: "",
          started_at: "2009-01-03T00:00:00Z",
          first_data_at: "2010-07-17T00:00:00Z",
          last_data_at: "2026-06-07T00:00:00Z",
        })
      })
    });
    const response = await mockClient.getCoin("btc-bitcoin");

    const expectedProperties = [
      "id",
      "name",
      "symbol",
      "tags",
      "rank",
      "is_new",
      "is_active",
      "type",
      "description",
      "open_source",
      "development_status",
      "hardware_wallet",
      "proof_type",
      "org_structure",
      "hash_algorithm",
      "links",
      "links_extended",
      "whitepaper",
      "logo",
      "team",
      "message",
      "started_at",
      "first_data_at",
      "last_data_at",
    ];

    expect(
      Object.keys(response).every((key) => {
        if (!expectedProperties.includes(key)) {
          console.log(key);
        }

        return expectedProperties.includes(key);
      })
    ).toBe(true);
  });
});
