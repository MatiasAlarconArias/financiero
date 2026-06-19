const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export interface FrankfurterRatesResponse {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function getLatestRates(
  baseCurrency = "USD",
  symbols?: string[]
): Promise<FrankfurterRatesResponse> {
  const params = new URLSearchParams();

  params.append("base", baseCurrency);

  if (symbols && symbols.length > 0) {
    params.append("symbols", symbols.join(","));
  }

  const url = `${FRANKFURTER_BASE_URL}/latest?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error Frankfurter API: ${response.status}`);
  }

  return response.json();
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const data = await getLatestRates(from, [to]);

  return amount * data.rates[to];
}