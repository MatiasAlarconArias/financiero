"use client";

import { useState, type ReactNode } from "react";
import type { CountryEconomicData } from "./EconomicHero";
import styles from "./EconomicIndicators.module.css";

type Props = {
  countries: CountryEconomicData[];
  dataYear: number;
};

type IconName = "gdp" | "growth" | "inflation" | "population" | "unemployment" | "exchange";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    gdp: <><path d="M12 2v20M17 6.5h-7a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6H6" /></>,
    growth: <><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></>,
    inflation: <path d="M3 12h4l2-7 4 14 2-7h6" />,
    population: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19v-1.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V19M16 6.5a3 3 0 0 1 0 5.8M17 14a4 4 0 0 1 3.5 4v1" /></>,
    unemployment: <><path d="M5 20v-6M10 20V9M15 20V4M20 20v-9" /></>,
    exchange: <><path d="M20 7h-4V3" /><path d="M19 4a8 8 0 1 0 1 9M4 17h4v4" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function DataIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></svg>;
}

function formatGDP(value: number | null) {
  if (value === null) return "Sin datos";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function formatPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value.toFixed(1)}%`;
}

function formatPopulation(value: number | null) {
  if (value === null) return "Sin datos";
  return value >= 1e6 ? `${(value / 1e6).toFixed(1)}M` : value.toLocaleString("es-CL");
}

function countryFlag(code: string) {
  return code.toUpperCase().replace(/./g, (character) =>
    String.fromCodePoint(127397 + character.charCodeAt(0)),
  );
}

export default function EconomicIndicators({ countries, dataYear }: Props) {
  const [selectedCode, setSelectedCode] = useState(countries[0]?.code ?? "CL");
  const selected = countries.find((country) => country.code === selectedCode) ?? countries[0];
  if (!selected) return null;

  const growth = selected.trend.at(-1)?.value ?? null;
  const unemploymentLevel = selected.unemployment === null
    ? null
    : selected.unemployment < 5 ? "Bajo" : selected.unemployment <= 10 ? "Moderado" : "Alto";
  const cards = [
    { icon: "gdp" as const, tone: "blue", value: formatGDP(selected.gdp), label: "PIB", description: "Producto Interno Bruto nominal", badge: growth === null ? null : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`, badgeTone: growth !== null && growth >= 0 ? "good" : "bad", source: "World Bank" },
    { icon: "growth" as const, tone: "green", value: formatPercent(growth), label: "Crecimiento del PIB", description: "Variación anual del PIB real", badge: `${dataYear} vs ${dataYear - 1}`, badgeTone: growth !== null && growth >= 0 ? "good" : "bad", source: "World Bank" },
    { icon: "inflation" as const, tone: "amber", value: formatPercent(selected.inflation), label: "Inflación", description: "Índice de precios al consumidor", badge: "IPC anual", badgeTone: "bad", source: "World Bank" },
    { icon: "population" as const, tone: "teal", value: formatPopulation(selected.population), label: "Población", description: `Habitantes estimados ${dataYear}`, badge: "millones", badgeTone: "good", source: "World Bank" },
    { icon: "unemployment" as const, tone: "red", value: formatPercent(selected.unemployment), label: "Desempleo", description: "Tasa sobre la población activa", badge: unemploymentLevel, badgeTone: selected.unemployment !== null && selected.unemployment < 5 ? "good" : "bad", source: "World Bank" },
    ...(selected.exchangeRate === null ? [] : [{ icon: "exchange" as const, tone: "violet", value: `${selected.exchangeRate.toLocaleString("es-CL", { maximumFractionDigits: 2 })} ${selected.currency}`, label: "Tipo de cambio", description: `${selected.currency} por dólar estadounidense`, badge: "vs USD", badgeTone: "bad", source: "Frankfurter" }]),
  ];

  return (
    <section id="resumen" className={styles.section} aria-labelledby="indicators-title">
      <div className="site-container">
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>Resumen económico</p>
            <h2 id="indicators-title">Indicadores principales</h2>
            <p className={styles.subtitle}>Datos macroeconómicos {dataYear} del país seleccionado.</p>
          </div>
          <label className={styles.selector}>
            <span aria-hidden="true">{countryFlag(selected.code)}</span>
            <span className={styles.srOnly}>Seleccionar país</span>
            <select value={selectedCode} onChange={(event) => setSelectedCode(event.target.value)}>
              {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
          </label>
        </div>

        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <article className={styles.card} key={card.label}>
              <div className={styles.cardTop}>
                <span className={`${styles.icon} ${styles[card.tone]}`}><Icon name={card.icon} /></span>
                {card.badge && <span className={`${styles.badge} ${styles[card.badgeTone]}`}>{card.badge}</span>}
              </div>
              <div className={styles.cardBody}>
                <strong>{card.value}</strong>
                <h3>{card.label}</h3>
                <p>{card.description}</p>
              </div>
              <footer>
                <span><DataIcon /> {card.source}</span>
                <span>{countryFlag(selected.code)} {selected.name}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
