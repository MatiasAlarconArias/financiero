import Navbar from "@/components/Navbar";
import EconomicHero, { type CountryEconomicData } from "@/components/EconomicHero";
import EconomicIndicators from "@/components/EconomicIndicators";
import CountryComparator from "@/components/CountryComparator";
import HistoricalChart from "@/components/HistoricalChart";
import RegionalRankings from "@/components/RegionalRankings";
import { getWorldBankIndicator, WORLD_BANK_INDICATORS, type WorldBankDataPoint } from "@/apis/WorldBank";
import { getCountryInfo } from "@/apis/RESTCountries";
import { getLatestRates } from "@/apis/Frankfurter";

const COUNTRY_CODES = ["CL", "AR", "BR", "MX", "CO", "PE", "UY"] as const;
const DATA_YEAR = 2024;
const TREND_START_YEAR = 2015;

const FALLBACK_TRENDS: Record<string, number[]> = {
  CL: [2.3, 1.8, 1.4, 4, .6, -6.1, 11.3, 2.2, .5, 2.6], AR: [2.7, -2.1, 2.8, -2.6, -2, -9.9, 10.4, 6, -1.9, -1.3],
  BR: [-3.5, -3.3, 1.3, 1.8, 1.2, -3.3, 4.8, 3, 3.2, 3.4],
  MX: [3.3, 2.6, 2.1, 2.2, -0.2, -8.6, 5.7, 3.9, 3.3, 1.5],
  CO: [3, 2.1, 1.4, 2.6, 3.2, -7.2, 10.8, 7.3, .7, 1.6], PE: [3.3, 4, 2.5, 4, 2.2, -10.9, 13.4, 2.8, -.4, 3.3],
  UY: [.4, 1.7, 1.7, .2, .9, -7.4, 5.8, 4.5, .7, 3.1],
};

const FALLBACK_INFLATION_TRENDS: Record<string, number[]> = {
  CL: [4.3, 3.8, 2.2, 2.4, 2.6, 3, 4.5, 11.6, 7.6, 4.3],
  AR: [26.5, 39.4, 25.7, 34.3, 53.5, 42, 48.4, 72.4, 133.5, 219.9],
  BR: [9, 8.7, 3.4, 3.7, 3.7, 3.2, 8.3, 9.3, 4.6, 4.4],
  MX: [2.7, 2.8, 6, 4.9, 3.6, 3.4, 5.7, 7.9, 5.5, 4.7],
  CO: [5, 7.5, 4.3, 3.2, 3.5, 2.5, 3.5, 10.2, 11.7, 6.6],
  PE: [3.6, 3.6, 2.8, 1.3, 2.1, 1.8, 4, 7.9, 6.3, 2],
  UY: [8.7, 9.6, 6.2, 7.6, 7.9, 9.8, 7.7, 9.1, 5.9, 4.8],
};

const FALLBACK_UNEMPLOYMENT_TRENDS: Record<string, number[]> = {
  CL: [6.5, 6.7, 7, 7.4, 7.2, 10.8, 8.9, 7.8, 8.7, 8.7],
  AR: [7.5, 8, 8.3, 9.2, 9.8, 11.5, 8.7, 6.8, 6.2, 7.2],
  BR: [8.4, 11.6, 12.8, 12.3, 11.9, 13.7, 13.2, 9.5, 7.8, 6.8],
  MX: [4.3, 3.9, 3.4, 3.3, 3.5, 4.4, 4.1, 3.3, 2.8, 2.8],
  CO: [8.9, 9.2, 9.4, 9.7, 10.5, 15.9, 13.8, 11.2, 10.2, 9.6],
  PE: [6.5, 6.7, 6.9, 6.7, 6.6, 12.8, 7.7, 7.2, 6.8, 5.2],
  UY: [7.5, 7.8, 7.9, 8.3, 8.9, 10.4, 9.3, 7.9, 8.3, 8.2],
};

const FALLBACK_METRICS: Record<string, [number, number, number, number]> = {
  CL: [330_267_137_372, 4.3, 8.7, 19_764_771], AR: [638_365_455_340, 219.9, 7.2, 45_696_159],
  BR: [2_185_821_648_944, 4.4, 6.8, 211_998_573], CO: [418_818_154_879, 6.6, 9.6, 52_886_363],
  MX: [1_789_114_658_045, 4.7, 2.8, 129_739_759],
  PE: [289_221_969_063, 2, 5.2, 34_217_848], UY: [80_961_511_074, 4.8, 8.2, 3_386_588],
};

function valueForYear(points: WorldBankDataPoint[], year: number) {
  return points.find((point) => Number(point.date) === year)?.value ?? null;
}

function makeHistory(
  points: WorldBankDataPoint[],
  fallbackValues: number[],
  startYear: number,
) {
  return fallbackValues.map((fallbackValue, index) => {
    const year = startYear + index;
    return { year, value: valueForYear(points, year) ?? fallbackValue };
  });
}

async function getCountryData(code: string): Promise<CountryEconomicData> {
  const info = getCountryInfo(code);
  const currency = info?.currency?.[0] ?? "—";
  const [fallbackGdp, fallbackInflation, fallbackUnemployment, fallbackPopulation] = FALLBACK_METRICS[code];
  const exchangeRatePromise = currency === "—"
    ? Promise.resolve(null)
    : getLatestRates("USD", [currency])
        .then((result) => result.rates[currency] ?? null)
        .catch(() => null);
  const fallback = (): CountryEconomicData => ({
    code, name: info?.name ?? code, currency, gdp: fallbackGdp,
    inflation: fallbackInflation, unemployment: fallbackUnemployment,
    population: fallbackPopulation, exchangeRate: null,
    trend: FALLBACK_TRENDS[code].map((value, index) => ({ year: TREND_START_YEAR + index, value })),
    histories: {
      gdpGrowth: FALLBACK_TRENDS[code].map((value, index) => ({ year: TREND_START_YEAR + index, value })),
      inflation: FALLBACK_INFLATION_TRENDS[code].map((value, index) => ({ year: TREND_START_YEAR + index, value })),
      unemployment: FALLBACK_UNEMPLOYMENT_TRENDS[code].map((value, index) => ({ year: TREND_START_YEAR + index, value })),
    },
  });

  try {
    const [
      trend,
      inflationTrend,
      unemploymentTrend,
      gdp,
      inflation,
      unemployment,
      population,
      exchangeRate,
    ] = await Promise.all([
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.GDP_GROWTH, 20, `${TREND_START_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.INFLATION, 20, `${TREND_START_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.UNEMPLOYMENT, 20, `${TREND_START_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.GDP, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.INFLATION, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.UNEMPLOYMENT, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      getWorldBankIndicator(code, WORLD_BANK_INDICATORS.POPULATION, 3, `${DATA_YEAR}:${DATA_YEAR}`),
      exchangeRatePromise,
    ]);
    return {
      ...fallback(), gdp: valueForYear(gdp, DATA_YEAR) ?? fallbackGdp,
      inflation: valueForYear(inflation, DATA_YEAR) ?? fallbackInflation,
      unemployment: valueForYear(unemployment, DATA_YEAR) ?? fallbackUnemployment,
      population: valueForYear(population, DATA_YEAR) ?? fallbackPopulation,
      exchangeRate,
      trend: makeHistory(trend, FALLBACK_TRENDS[code], TREND_START_YEAR),
      histories: {
        gdpGrowth: makeHistory(trend, FALLBACK_TRENDS[code], TREND_START_YEAR),
        inflation: makeHistory(inflationTrend, FALLBACK_INFLATION_TRENDS[code], TREND_START_YEAR),
        unemployment: makeHistory(unemploymentTrend, FALLBACK_UNEMPLOYMENT_TRENDS[code], TREND_START_YEAR),
      },
    };
  } catch {
    return { ...fallback(), exchangeRate: await exchangeRatePromise };
  }
}

export default async function Home() {
  const countries = await Promise.all(COUNTRY_CODES.map(getCountryData));
  return <><Navbar /><EconomicHero countries={countries} dataYear={DATA_YEAR} /><EconomicIndicators countries={countries} dataYear={DATA_YEAR} /><CountryComparator countries={countries} dataYear={DATA_YEAR} /><HistoricalChart countries={countries} dataYear={DATA_YEAR} /><RegionalRankings countries={countries} dataYear={DATA_YEAR} /></>;
}
