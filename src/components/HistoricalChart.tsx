"use client";

import { useMemo, useState, type PointerEvent } from "react";
import type { CountryEconomicData } from "./EconomicHero";
import styles from "./HistoricalChart.module.css";

type Props = {
  countries: CountryEconomicData[];
  dataYear: number;
};

type IndicatorKey = "gdpGrowth" | "inflation" | "unemployment";

const INDICATORS: Record<IndicatorKey, { label: string; note: string }> = {
  gdpGrowth: {
    label: "Crecimiento del PIB",
    note: "Crecimiento del PIB (%)",
  },
  inflation: {
    label: "Inflacion",
    note: "Inflacion anual (%)",
  },
  unemployment: {
    label: "Desempleo",
    note: "Desempleo total (%)",
  },
};

const DEFAULT_COUNTRIES = ["CL", "AR", "PE"];
const MAX_SELECTED_COUNTRIES = 3;
const COLORS = ["#7448ff", "#ff9700", "#16a34a"];
const CHART_WIDTH = 980;
const CHART_HEIGHT = 280;
const PAD_LEFT = 42;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 32;

type ActivePoint = {
  countryName: string;
  countryCode: string;
  year: number;
  value: number;
  x: number;
  y: number;
  color: string;
};

function countryFlag(code: string) {
  return code.toUpperCase().replace(/./g, (character) =>
    String.fromCodePoint(127397 + character.charCodeAt(0)),
  );
}

function makeSmoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = points[index - 1];
    const midX = (previous.x + point.x) / 2;
    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function niceStep(rawStep: number) {
  if (rawStep <= 0) return 1;

  const power = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / power;

  if (normalized <= 1) return power;
  if (normalized <= 2) return 2 * power;
  if (normalized <= 5) return 5 * power;
  return 10 * power;
}

function makeScale(values: number[]) {
  if (!values.length) return { min: -1, max: 1, ticks: [-1, 0, 1] };

  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);
  const spread = Math.max(maxValue - minValue, 1);
  const step = niceStep(spread / 4);
  const min = Math.floor((minValue - step * .4) / step) * step;
  const max = Math.ceil((maxValue + step * .4) / step) * step;
  const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) / 4) * index);

  return { min, max, ticks };
}

function formatTick(value: number) {
  const rounded = Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1).replace(".0", "");
  return `${rounded}%`;
}

function colorForIndex(index: number) {
  return COLORS[index % COLORS.length];
}

export default function HistoricalChart({ countries, dataYear }: Props) {
  const allYears = useMemo(() => {
    const years = countries.flatMap((country) => country.histories.gdpGrowth.map((point) => point.year));
    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [countries]);

  const defaultStart = allYears[0] ?? dataYear - 9;
  const defaultEnd = allYears.includes(dataYear - 1) ? dataYear - 1 : allYears.at(-1) ?? dataYear;
  const defaultCodes = DEFAULT_COUNTRIES.filter((code) => countries.some((country) => country.code === code));

  const [indicator, setIndicator] = useState<IndicatorKey>("gdpGrowth");
  const [startYear, setStartYear] = useState(defaultStart);
  const [endYear, setEndYear] = useState(defaultEnd);
  const [selectedCodes, setSelectedCodes] = useState(
    defaultCodes.length ? defaultCodes : countries.slice(0, MAX_SELECTED_COUNTRIES).map((country) => country.code),
  );
  const [activePoint, setActivePoint] = useState<ActivePoint | null>(null);

  const visibleYears = allYears.filter((year) => year >= startYear && year <= endYear);
  const selectedCountries = selectedCodes
    .map((code) => countries.find((country) => country.code === code))
    .filter((country): country is CountryEconomicData => Boolean(country));

  const chartValues = selectedCountries.flatMap((country) =>
    country.histories[indicator]
      .filter((point) => point.year >= startYear && point.year <= endYear && point.value !== null)
      .map((point) => point.value as number),
  );
  const scale = makeScale(chartValues);
  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const series = selectedCountries.map((country, countryIndex) => {
    const points = visibleYears
      .map((year, yearIndex) => {
        const value = country.histories[indicator].find((point) => point.year === year)?.value ?? null;
        if (value === null) return null;

        return {
          year,
          value,
          x: PAD_LEFT + (yearIndex / Math.max(visibleYears.length - 1, 1)) * plotWidth,
          y: PAD_TOP + ((scale.max - value) / (scale.max - scale.min || 1)) * plotHeight,
        };
      })
      .filter((point): point is { year: number; value: number; x: number; y: number } => Boolean(point));

    return {
      country,
      color: colorForIndex(countryIndex),
      points,
      path: makeSmoothPath(points),
    };
  });

  const toggleCountry = (code: string) => {
    setSelectedCodes((current) => {
      if (current.includes(code)) {
        return current.length === 1 ? current : current.filter((currentCode) => currentCode !== code);
      }

      if (current.length >= MAX_SELECTED_COUNTRIES) {
        return [...current.slice(1), code];
      }

      return [...current, code];
    });
  };

  const handleChartPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!visibleYears.length) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * CHART_HEIGHT;
    const boundedX = Math.max(PAD_LEFT, Math.min(CHART_WIDTH - PAD_RIGHT, x));
    const yearIndex = Math.round(((boundedX - PAD_LEFT) / plotWidth) * Math.max(visibleYears.length - 1, 0));
    const year = visibleYears[Math.max(0, Math.min(visibleYears.length - 1, yearIndex))];
    const candidates = series
      .map((item) => {
        const point = item.points.find((currentPoint) => currentPoint.year === year);
        if (!point) return null;

        return {
          countryName: item.country.name,
          countryCode: item.country.code,
          year: point.year,
          value: point.value,
          x: point.x,
          y: point.y,
          color: item.color,
        };
      })
      .filter((point): point is ActivePoint => Boolean(point));

    if (!candidates.length) {
      setActivePoint(null);
      return;
    }

    setActivePoint(
      candidates.reduce((closest, point) =>
        Math.abs(point.y - y) < Math.abs(closest.y - y) ? point : closest,
      ),
    );
  };

  const handleStartChange = (year: number) => {
    setStartYear(year);
    if (year > endYear) setEndYear(year);
  };

  const handleEndChange = (year: number) => {
    setEndYear(year);
    if (year < startYear) setStartYear(year);
  };

  return (
    <section id="graficos" className={styles.section} aria-labelledby="historical-title">
      <div className="site-container">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Grafico historico</p>
          <h2 id="historical-title">Evolucion temporal de indicadores</h2>
          <p>Compara como ha cambiado cada indicador a lo largo del tiempo.</p>
        </div>

        <article className={styles.panel}>
          <div className={styles.controls}>
            <label className={styles.field}>
              <span>Indicador</span>
              <select value={indicator} onChange={(event) => setIndicator(event.target.value as IndicatorKey)}>
                {Object.entries(INDICATORS).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Desde</span>
              <select value={startYear} onChange={(event) => handleStartChange(Number(event.target.value))}>
                {allYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>

            <label className={styles.field}>
              <span>Hasta</span>
              <select value={endYear} onChange={(event) => handleEndChange(Number(event.target.value))}>
                {allYears.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>

            <div className={styles.countryGroup} aria-label="Paises del grafico">
              <span>Paises</span>
              <div className={styles.countryButtons}>
                {countries.map((country) => {
                  const isSelected = selectedCodes.includes(country.code);
                  const selectedIndex = selectedCodes.indexOf(country.code);
                  return (
                    <button
                      type="button"
                      key={country.code}
                      className={isSelected ? styles.countryActive : styles.countryButton}
                      style={isSelected ? { backgroundColor: colorForIndex(selectedIndex) } : undefined}
                      aria-pressed={isSelected}
                      onClick={() => toggleCountry(country.code)}
                    >
                      {countryFlag(country.code)} {country.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.chartScroller}>
            <div className={styles.chartWrap}>
              <svg
                className={styles.chart}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                role="img"
                aria-label={`${INDICATORS[indicator].label} entre ${startYear} y ${endYear}`}
                onPointerMove={handleChartPointerMove}
                onPointerLeave={() => setActivePoint(null)}
              >
                {scale.ticks.map((tick) => {
                  const y = PAD_TOP + ((scale.max - tick) / (scale.max - scale.min || 1)) * plotHeight;
                  return <line key={tick} x1={PAD_LEFT} x2={CHART_WIDTH - PAD_RIGHT} y1={y} y2={y} className={styles.gridLine} />;
                })}
                {visibleYears.map((year, index) => {
                  const x = PAD_LEFT + (index / Math.max(visibleYears.length - 1, 1)) * plotWidth;
                  return <line key={year} x1={x} x2={x} y1={PAD_TOP} y2={CHART_HEIGHT - PAD_BOTTOM} className={styles.yearLine} />;
                })}
                {scale.ticks.map((tick) => {
                  const y = PAD_TOP + ((scale.max - tick) / (scale.max - scale.min || 1)) * plotHeight;
                  return <text key={`label-${tick}`} x={PAD_LEFT - 8} y={y + 4} className={styles.yLabel} textAnchor="end">{formatTick(tick)}</text>;
                })}
                {visibleYears.map((year, index) => {
                  const x = PAD_LEFT + (index / Math.max(visibleYears.length - 1, 1)) * plotWidth;
                  return <text key={`year-${year}`} x={x} y={CHART_HEIGHT - 8} className={styles.xLabel} textAnchor="middle">{year}</text>;
                })}
                {series.map((item) => (
                  <g key={item.country.code}>
                    {item.path && <path d={item.path} className={styles.seriesLine} style={{ stroke: item.color }} />}
                    {item.points.map((point) => (
                      <circle
                        key={`${item.country.code}-${point.year}`}
                        cx={point.x}
                        cy={point.y}
                        r={activePoint?.countryCode === item.country.code && activePoint.year === point.year ? "6" : "4"}
                        fill={item.color}
                        className={styles.dataPoint}
                      />
                    ))}
                  </g>
                ))}
                {activePoint && (
                  <g className={styles.activeLayer} aria-hidden="true">
                    <line
                      x1={activePoint.x}
                      x2={activePoint.x}
                      y1={PAD_TOP}
                      y2={CHART_HEIGHT - PAD_BOTTOM}
                      className={styles.activeLine}
                    />
                    <circle cx={activePoint.x} cy={activePoint.y} r="9" fill={activePoint.color} opacity=".16" />
                    <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#ffffff" stroke={activePoint.color} strokeWidth="3" />
                  </g>
                )}
              </svg>

              {activePoint && (
                <div
                  className={styles.tooltip}
                  style={{
                    left: `${(activePoint.x / CHART_WIDTH) * 100}%`,
                    top: `${(activePoint.y / CHART_HEIGHT) * 100}%`,
                  }}
                >
                  <span style={{ color: activePoint.color }}>
                    {countryFlag(activePoint.countryCode)} {activePoint.countryName}
                  </span>
                  <strong>{formatTick(activePoint.value)}</strong>
                  <small>{INDICATORS[indicator].label} · {activePoint.year}</small>
                </div>
              )}

              <div className={styles.legend}>
                {series.map((item) => (
                  <span key={item.country.code} style={{ color: item.color }}>
                    <i style={{ backgroundColor: item.color }} /> {countryFlag(item.country.code)} {item.country.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <footer className={styles.source}>
            <span aria-hidden="true">▣</span>
            {INDICATORS[indicator].note} · Fuente: World Bank API
            {selectedCodes.includes("AR") ? " · Los datos de Argentina pueden presentar distorsiones estadisticas significativas." : ""}
          </footer>
        </article>
      </div>
    </section>
  );
}
