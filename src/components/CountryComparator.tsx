"use client";

import { useMemo, useState } from "react";
import type { CountryEconomicData } from "./EconomicHero";
import styles from "./CountryComparator.module.css";

type Props = {
  countries: CountryEconomicData[];
  dataYear: number;
};

type MetricKey = "gdp" | "growth" | "inflation" | "population" | "unemployment";

const DEFAULT_COMPARE_CODES = ["CL", "BR"];
const MIN_COUNTRIES = 2;
const MAX_COUNTRIES = 5;
const COLORS = ["#7448ff", "#2563eb", "#0f766e", "#e28a00", "#dc2626"];

function latestGrowth(country: CountryEconomicData) {
  return country.trend.at(-1)?.value ?? null;
}

function formatGDP(value: number | null) {
  if (value === null) return "Sin datos";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  return `$${(value / 1e9).toFixed(1)}B`;
}

function formatAxisGDP(value: number) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(value >= 2e12 ? 0 : 1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
  return String(value);
}

function formatPercent(value: number | null) {
  return value === null ? "Sin datos" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function formatPlainPercent(value: number | null) {
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

function countryOptionLabel(country: CountryEconomicData) {
  return `${country.code} ${country.name}`;
}

function findExtreme(
  countries: CountryEconomicData[],
  getValue: (country: CountryEconomicData) => number | null,
  mode: "max" | "min",
) {
  return countries.reduce<CountryEconomicData | null>((winner, country) => {
    const value = getValue(country);
    if (value === null) return winner;
    if (!winner) return country;

    const winnerValue = getValue(winner);
    if (winnerValue === null) return country;

    return mode === "max"
      ? value > winnerValue ? country : winner
      : value < winnerValue ? country : winner;
  }, null);
}

export default function CountryComparator({ countries, dataYear }: Props) {
  const fallbackDefaults = countries.slice(0, MIN_COUNTRIES).map((country) => country.code);
  const defaultCodes = DEFAULT_COMPARE_CODES.filter((code) =>
    countries.some((country) => country.code === code),
  );
  const [selectedCodes, setSelectedCodes] = useState(
    defaultCodes.length >= MIN_COUNTRIES ? defaultCodes : fallbackDefaults,
  );

  const selectedCountries = useMemo(
    () =>
      selectedCodes
        .map((code) => countries.find((country) => country.code === code))
        .filter((country): country is CountryEconomicData => Boolean(country)),
    [countries, selectedCodes],
  );

  const availableToAdd = countries.filter((country) => !selectedCodes.includes(country.code));
  const maxGdp = Math.max(...selectedCountries.map((country) => country.gdp ?? 0), 1);
  const axisValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) => maxGdp * ratio);

  const updateCountry = (index: number, code: string) => {
    setSelectedCodes((current) =>
      current.map((currentCode, currentIndex) => currentIndex === index ? code : currentCode),
    );
  };

  const addCountry = () => {
    const next = availableToAdd[0];
    if (!next || selectedCodes.length >= MAX_COUNTRIES) return;
    setSelectedCodes((current) => [...current, next.code]);
  };

  const removeCountry = (index: number) => {
    setSelectedCodes((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const highlights = [
    {
      label: "Mayor PIB",
      country: findExtreme(selectedCountries, (country) => country.gdp, "max"),
      value: (country: CountryEconomicData) => formatGDP(country.gdp),
      tone: "blue",
    },
    {
      label: "Mayor crecimiento",
      country: findExtreme(selectedCountries, latestGrowth, "max"),
      value: (country: CountryEconomicData) => formatPercent(latestGrowth(country)),
      tone: "green",
    },
    {
      label: "Menor inflacion",
      country: findExtreme(selectedCountries, (country) => country.inflation, "min"),
      value: (country: CountryEconomicData) => formatPlainPercent(country.inflation),
      tone: "teal",
    },
    {
      label: "Menor desempleo",
      country: findExtreme(selectedCountries, (country) => country.unemployment, "min"),
      value: (country: CountryEconomicData) => formatPlainPercent(country.unemployment),
      tone: "violet",
    },
  ];

  const rows: { label: string; key: MetricKey; format: (country: CountryEconomicData) => string }[] = [
    { label: "PIB", key: "gdp", format: (country) => formatGDP(country.gdp) },
    { label: "Crecimiento", key: "growth", format: (country) => formatPercent(latestGrowth(country)) },
    { label: "Inflacion", key: "inflation", format: (country) => formatPlainPercent(country.inflation) },
    { label: "Poblacion", key: "population", format: (country) => formatPopulation(country.population) },
    { label: "Desempleo", key: "unemployment", format: (country) => formatPlainPercent(country.unemployment) },
  ];

  if (!selectedCountries.length) return null;

  return (
    <section id="comparador" className={styles.section} aria-labelledby="comparator-title">
      <div className="site-container">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Comparador</p>
            <h2 id="comparator-title">Comparar paises</h2>
            <p className={styles.subtitle}>
              Selecciona entre {MIN_COUNTRIES} y {MAX_COUNTRIES} paises para comparar sus indicadores.
            </p>
          </div>
          <button
            type="button"
            className={styles.addButton}
            onClick={addCountry}
            disabled={selectedCodes.length >= MAX_COUNTRIES || availableToAdd.length === 0}
          >
            Agregar pais
          </button>
        </div>

        <div className={styles.controls} aria-label="Paises seleccionados">
          {selectedCountries.map((country, index) => (
            <div className={styles.countryControl} key={`${country.code}-${index}`}>
              <span className={styles.dot} style={{ backgroundColor: COLORS[index] }} aria-hidden="true" />
              <label className={styles.selectWrap}>
                <span className={styles.srOnly}>Pais {index + 1}</span>
                <select value={country.code} onChange={(event) => updateCountry(index, event.target.value)}>
                  {countries.map((option) => (
                    <option
                      key={option.code}
                      value={option.code}
                      disabled={selectedCodes.includes(option.code) && option.code !== country.code}
                    >
                      {countryOptionLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              {selectedCodes.length > MIN_COUNTRIES && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeCountry(index)}
                  aria-label={`Quitar ${country.name}`}
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.highlightGrid}>
          {highlights.map((highlight) => (
            <article className={`${styles.highlight} ${styles[highlight.tone]}`} key={highlight.label}>
              <span>{highlight.label}</span>
              <strong>{highlight.country ? highlight.value(highlight.country) : "Sin datos"}</strong>
              {highlight.country && <small>{countryFlag(highlight.country.code)} {highlight.country.name}</small>}
            </article>
          ))}
        </div>

        <div className={styles.detailGrid}>
          <article className={styles.chartPanel}>
            <div>
              <h3>PIB comparado (USD B)</h3>
              <p>Millones de dolares - {dataYear}</p>
            </div>
            <div className={styles.barChart}>
              {selectedCountries.map((country, index) => (
                <div className={styles.barRow} key={country.code}>
                  <span>{countryFlag(country.code)} {country.name}</span>
                  <div className={styles.barTrack}>
                    <i
                      style={{
                        width: `${Math.max(((country.gdp ?? 0) / maxGdp) * 100, country.gdp ? 4 : 0)}%`,
                        backgroundColor: COLORS[index],
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className={styles.axis} aria-hidden="true">
                {axisValues.map((value) => <span key={value}>{formatAxisGDP(value)}</span>)}
              </div>
            </div>
          </article>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Indicador</th>
                  {selectedCountries.map((country, index) => (
                    <th key={country.code} style={{ color: COLORS[index] }}>
                      {countryFlag(country.code)} {country.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {selectedCountries.map((country) => <td key={country.code}>{row.format(country)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
