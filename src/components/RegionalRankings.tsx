"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { CountryEconomicData } from "./EconomicHero";
import styles from "./RegionalRankings.module.css";

type Props = {
  countries: CountryEconomicData[];
  dataYear: number;
};

type RankingKey = "gdp" | "population" | "growth" | "unemployment";

type RankingConfig = {
  label: string;
  icon: ReactNode;
  getValue: (country: CountryEconomicData) => number | null;
  format: (value: number | null) => string;
  direction: "asc" | "desc";
};

function latestGrowth(country: CountryEconomicData) {
  return country.trend.at(-1)?.value ?? null;
}

function formatGDP(value: number | null) {
  if (value === null) return "Sin datos";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function formatPopulation(value: number | null) {
  if (value === null) return "Sin datos";
  return value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value.toLocaleString("es-CL");
}

function formatPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatPlainPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value.toFixed(1)}%`;
}

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

const RANKINGS: Record<RankingKey, RankingConfig> = {
  gdp: {
    label: "Mayor PIB",
    icon: <Icon><path d="M12 3v18M17 7h-7a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6" /></Icon>,
    getValue: (country) => country.gdp,
    format: formatGDP,
    direction: "desc",
  },
  population: {
    label: "Mayor poblacion",
    icon: <Icon><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 7a3 3 0 0 1 0 6M17 14a4 4 0 0 1 3.5 4v1" /></Icon>,
    getValue: (country) => country.population,
    format: formatPopulation,
    direction: "desc",
  },
  growth: {
    label: "Mayor crecimiento",
    icon: <Icon><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></Icon>,
    getValue: latestGrowth,
    format: formatPercent,
    direction: "desc",
  },
  unemployment: {
    label: "Menor desempleo",
    icon: <Icon><path d="M4 7h5M15 17h5M6 5l12 14" /><path d="M18 5v4h-4" /></Icon>,
    getValue: (country) => country.unemployment,
    format: formatPlainPercent,
    direction: "asc",
  },
};

export default function RegionalRankings({ countries, dataYear }: Props) {
  const [activeKey, setActiveKey] = useState<RankingKey>("gdp");
  const activeRanking = RANKINGS[activeKey];

  const rankedCountries = useMemo(() => {
    return [...countries].sort((first, second) => {
      const firstValue = activeRanking.getValue(first);
      const secondValue = activeRanking.getValue(second);

      if (firstValue === null && secondValue === null) return first.name.localeCompare(second.name);
      if (firstValue === null) return 1;
      if (secondValue === null) return -1;

      return activeRanking.direction === "desc"
        ? secondValue - firstValue
        : firstValue - secondValue;
    });
  }, [activeRanking, countries]);

  return (
    <section id="rankings" className={styles.section} aria-labelledby="rankings-title">
      <div className="site-container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Rankings LATAM</p>
          <h2 id="rankings-title">Quien lidera la region?</h2>
          <p>Rankings economicos {dataYear} entre los {countries.length} paises analizados.</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Criterio de ranking">
          {(Object.entries(RANKINGS) as [RankingKey, RankingConfig][]).map(([key, ranking]) => (
            <button
              type="button"
              key={key}
              role="tab"
              aria-selected={activeKey === key}
              className={activeKey === key ? styles.tabActive : styles.tab}
              onClick={() => setActiveKey(key)}
            >
              {ranking.icon}
              {ranking.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {rankedCountries.map((country, index) => {
            const value = activeRanking.getValue(country);
            return (
              <article className={index === 0 ? styles.cardWinner : styles.card} key={country.code}>
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.code}>{country.code}</span>
                <div className={styles.country}>
                  <h3>{country.name}</h3>
                  <strong>{activeRanking.format(value)}</strong>
                </div>
                {index === 0 && (
                  <span className={styles.medal} aria-label="Primer lugar">
                    <Icon><circle cx="12" cy="8" r="4" /><path d="M9 12 7 21l5-3 5 3-2-9" /></Icon>
                  </span>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
