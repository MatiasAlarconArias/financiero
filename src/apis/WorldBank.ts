const WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2";

export const WORLD_BANK_INDICATORS = {
  GDP: "NY.GDP.MKTP.CD",
  GDP_GROWTH: "NY.GDP.MKTP.KD.ZG",
  INFLATION: "FP.CPI.TOTL.ZG",
  POPULATION: "SP.POP.TOTL",
  UNEMPLOYMENT: "SL.UEM.TOTL.ZS",
} as const;

export type WorldBankIndicator =
  (typeof WORLD_BANK_INDICATORS)[keyof typeof WORLD_BANK_INDICATORS];

export interface WorldBankDataPoint {
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
  indicator: {
    id: string;
    value: string;
  };
  country: {
    id: string;
    value: string;
  };
}

export async function getWorldBankIndicator(
  countryCode: string,
  indicatorCode: WorldBankIndicator,
  perPage = 10,
  dateRange?: string,
): Promise<WorldBankDataPoint[]> {
  const params = new URLSearchParams({
    format: "json",
    per_page: String(perPage),
  });

  if (dateRange) params.set("date", dateRange);

  const url = `${WORLD_BANK_BASE_URL}/country/${countryCode}/indicator/${indicatorCode}?${params}`;

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 12 } });

  if (!response.ok) {
    throw new Error("Error al obtener datos desde World Bank API");
  }

  const data = await response.json();

  return data[1] ?? [];
}
