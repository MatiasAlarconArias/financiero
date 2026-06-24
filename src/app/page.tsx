import Navbar from "@/components/Navbar";
import EconomicHero, { type CountryEconomicData } from "@/components/EconomicHero";
import { getWorldBankIndicator, WORLD_BANK_INDICATORS, type WorldBankDataPoint } from "@/apis/WorldBank";
import { getCountryInfo } from "@/apis/RESTCountries";

const COUNTRY_CODES = ["CL", "AR", "BR", "CO", "PE", "UY"] as const;
const DATA_YEAR = 2024;
const TREND_START_YEAR = 2016;

const FALLBACK_TRENDS: Record<string, number[]> = {
  CL: [1.8, 1.4, 4, .6, -6.1, 11.3, 2.2, .5, 2.6], AR: [-2.1, 2.8, -2.6, -2, -9.9, 10.4, 6, -1.9, -1.3],
  BR: [-3.3, 1.3, 1.8, 1.2, -3.3, 4.8, 3, 3.2, 3.4],
  CO: [2.1, 1.4, 2.6, 3.2, -7.2, 10.8, 7.3, .7, 1.6], PE: [4, 2.5, 4, 2.2, -10.9, 13.4, 2.8, -.4, 3.3],
  UY: [1.7, 1.7, .2, .9, -7.4, 5.8, 4.5, .7, 3.1],
};

const FALLBACK_METRICS: Record<string, [number, number, number]> = {
  CL: [330_267_137_372, 4.3, 8.7], AR: [638_365_455_340, 219.9, 7.2], BR: [2_185_821_648_944, 4.4, 6.8],
  CO: [418_818_154_879, 6.6, 9.6], PE: [289_221_969_063, 2, 5.2], UY: [80_961_511_074, 4.8, 8.2],
};

function valueForYear(points: WorldBankDataPoint[], year: number) {
  return points.find((point) => Number(point.date) === year)?.value ?? null;
}

async function getCountryData(code: string): Promise<CountryEconomicData> {
  const info = getCountryInfo(code);
  const [fallbackGdp, fallbackInflation, fallbackUnemployment] = FALLBACK_METRICS[code];
  const fallback = (): CountryEconomicData => ({
    code, name: info?.name ?? code, currency: info?.currency?.[0] ?? "—", gdp: fallbackGdp,
    inflation: fallbackInflation, unemployment: fallbackUnemployment,
    trend: FALLBACK_TRENDS[code].map((value, index) => ({ year: TREND_START_YEAR + index, value })),
  });

  try {
    const [trend, gdp, inflation, unemployment] = await Promise.all([
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.GDP_GROWTH, 20, `${TREND_START_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.GDP, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.INFLATION, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.UNEMPLOYMENT, 3, `${DATA_YEAR}:${DATA_YEAR}`),
    ]);
    return {
      ...fallback(), gdp: valueForYear(gdp, DATA_YEAR) ?? fallbackGdp,
      inflation: valueForYear(inflation, DATA_YEAR) ?? fallbackInflation,
      unemployment: valueForYear(unemployment, DATA_YEAR) ?? fallbackUnemployment,
      trend: FALLBACK_TRENDS[code].map((fallbackValue, index) => {
        const year = TREND_START_YEAR + index;
        return { year, value: valueForYear(trend, year) ?? fallbackValue };
      }),
    };
  } catch { return fallback(); }
}

export default async function Home() {
  const countries = await Promise.all(COUNTRY_CODES.map(getCountryData));
  return <><Navbar /><EconomicHero countries={countries} dataYear={DATA_YEAR} /></>;
}
