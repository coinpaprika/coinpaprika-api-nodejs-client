const CoinpaprikaAPI = require("../index");

describe("getCoin", () => {
  let client = null;

  beforeEach(() => {
    client = new CoinpaprikaAPI();
  });

  it("returns Promise if async/await not used", () => {
    const response = client.getCoin("btc-bitcoin");
    expect(response instanceof Promise).toBe(true);
  });

  it("throws an error if no coinId provided", () => {
    expect(() => {
      client.getCoin("btc-bitcoin").resolve();
    }).toThrow();
  });

  it("returns coin info consistent to API documentation", async () => {
    const response = await client.getCoin("btc-bitcoin");

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
