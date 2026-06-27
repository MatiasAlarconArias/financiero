# MacroPulse LATAM

Aplicacion web creada con Next.js para explorar indicadores economicos de
America Latina en una interfaz visual, comparativa y educativa.

El proyecto muestra datos macroeconomicos de Chile, Argentina, Brasil,
Colombia, Peru y Uruguay, combinando informacion abierta del Banco Mundial,
datos de paises y tipos de cambio. Tambien incluye valores de respaldo para que
la experiencia siga funcionando cuando alguna fuente externa no entrega datos.

https://financiero-mocha.vercel.app/

## Funcionalidades

- Resumen visual por pais con PIB, inflacion, desempleo, poblacion, crecimiento
  del PIB y tipo de cambio.
- Comparador entre paises latinoamericanos.
- Graficos historicos para revisar tendencias desde 2015 hasta 2024.
- Rankings regionales para identificar mejores y peores indicadores.
- Perfil economico por pais.
- Seccion educativa para entender que significa cada indicador.
- Footer con las fuentes de datos utilizadas.

## Paises incluidos

- Chile
- Argentina
- Brasil
- Colombia
- Peru
- Uruguay

## Fuentes de datos

- World Bank API: PIB, crecimiento del PIB, inflacion, desempleo y poblacion.
- Frankfurter API: tipos de cambio frente al dolar estadounidense.
- countries-list: nombres, monedas e informacion base de cada pais.

Los datos principales usan como ano base `2024`. Si una API no responde o no
entrega un valor disponible, la aplicacion usa datos locales de respaldo
definidos en `src/app/page.tsx`.

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- CSS Modules
- ESLint

## Estructura principal

```text
src/
  apis/
    Frankfurter.ts
    RESTCountries.ts
    WorldBank.ts
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    CountryComparator.tsx
    CountryProfile.tsx
    DataSourcesFooter.tsx
    EconomicHero.tsx
    EconomicIndicators.tsx
    HistoricalChart.tsx
    IndicatorLearning.tsx
    Navbar.tsx
    RegionalRankings.tsx
```

## Instalacion

Instala las dependencias:

```sh
npm install
```

Inicia el entorno de desarrollo:

```sh
npm run dev
```

Luego abre `http://localhost:3000` en el navegador.

## Scripts disponibles

```sh
npm run dev
```

Ejecuta la aplicacion en modo desarrollo.

```sh
npm run build
```

Genera la version de produccion.

```sh
npm run start
```

Ejecuta la version de produccion generada.

```sh
npm run lint
```

Revisa el codigo con ESLint.

## Objetivo del proyecto

El objetivo de MacroPulse LATAM es centralizar informacion economica relevante
de la region y presentarla de forma clara para analisis rapido, comparacion
entre paises y aprendizaje de conceptos macroeconomicos basicos.
