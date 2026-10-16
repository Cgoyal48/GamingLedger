# Gaming Ledger

A personal ledger that joins what you paid for your games with how long you played them, so every game gets a **cost per hour**. It celebrates good value rather than adding up what you spent.

- **Inventory**: every game you own, with cost, in-game spend, cost per hour and a value rank against the rest of your library.
- **Quests**: games you bought to play and haven't opened yet.
- **Loot log**: every purchase, by month.
- **Timeline**: purchases and play sessions in order.
- **Stats**: value by platform and year.

Personal and non-commercial. It uses only official APIs, your own data exports and manual entry. No scraping and no unofficial platform libraries. Playtime is manual for every platform except Steam (planned).

## Stack


| Part           | Tech                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Frontend       | React 19, Vite, TypeScript, TanStack Query, React Hook Form + Zod, Tailwind CSS v4, shadcn/ui on Base UI |
| Backend        | Java 25, Spring Boot 4, jOOQ, Flyway                                                                     |
| Database       | Postgres 18 in Docker                                                                                    |
| Auth           | Supabase (the API verifies Supabase JWTs)                                                                |
| Game data      | IGDB, for titles and covers                                                                              |
| Exchange rates | European Central Bank, cached in Postgres                                                                |




## Prerequisites

- **Docker**, for Postgres and the backend tests
- **Java 25**
- **Node 22+**
- A **Supabase** project with email sign-in enabled
- A **Twitch developer app**, whose client id and secret give access to IGDB ([dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps))



## Setup



### 1. Environment files

```bash
cp .env.example .env                    # database + IGDB credentials
cp frontend/.env.example frontend/.env  # Supabase URL + anon key
```

Fill in the empty values. Both `.env` files are gitignored.

The API reads the root `.env` itself (`spring.config.import` in `application.properties`). Its Supabase project is set in `application.properties` (`jwt.issuer-uri` and `jwt.jwk-set-uri`). Point both at your own project.

### 2. Database

```bash
docker compose up -d
```



### 3. API (port 8080)

```bash
cd api
./mvnw spring-boot:run
```

The **database must be running before you build**. During the build, Flyway applies the migrations in `src/main/resources/db/migration`, and jOOQ then generates its Java classes from the resulting schema.

### 4. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards `/api` requests to the API on port 8080.

## Scripts

**Frontend** (`frontend/`)


| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server with hot reload              |
| `npm run build`        | Type-check and production build         |
| `npm run lint`         | oxlint                                  |
| `npm run format`       | Prettier (also sorts Tailwind classes)  |
| `npm run format:check` | Check formatting without changing files |


**Backend** (`api/`)


| Command                  | What it does                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `./mvnw spring-boot:run` | Run the API                                                                                                           |
| `./mvnw test`            | Unit and integration tests. Integration tests start their own Postgres with Testcontainers, so Docker must be running |
| `./mvnw test-compile`    | Compile everything without running tests                                                                              |




## Project structure

```
api/src/main/java/com/gamingledger/
  common/        security config, current-user annotation, shared exceptions
  games/         copies, playtime, covers, cost per hour
  purchases/     purchase log
  stats/         stats page figures
  settings/      display currency
  fx/            exchange rates (fetch, cache, convert)
  igdb/          IGDB search and covers
api/src/main/resources/db/migration/   Flyway migrations (V1, V2, …)

frontend/src/
  api/           server types and TanStack Query hooks, one folder per feature
  app/<feature>/ a page plus that feature's components/, hooks/ and utils/
  app/shared/    components, hooks, utils and constants used by more than one feature
  app/shell/     signed-in layout: header, tabs, dialogs, keyboard shortcuts
  components/ui/ generated shadcn components (don't edit by hand)
```

Each backend feature follows `controller → service → dao`, with `model` for request and response records and `mapper` to build responses.

## Conventions

- **Money** is stored in whole minor units (paise, cents) with its original currency. It's converted to your display currency only when shown, at the exchange rate on the purchase date. A converted amount is marked with `≈`.
- **The user id comes only from the verified JWT**, never from a request body. Every query is scoped to that user.
- **Schema changes** go in a new Flyway migration (`V12__…`, `V13__…`). Never edit one that has already been applied.
- **API JSON** uses snake_case.

