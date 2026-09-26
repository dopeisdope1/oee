# Discord Bots Panel

A central management panel for multiple, already-existing Discord bots.
Each bot keeps its own data, config and API — this panel never mixes data
between bots, or between servers (guilds) of the same bot. It's not a bot
builder: bots are wired up by pointing the panel at each bot's own small
HTTP API (see **The bot API contract** below).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Prisma 7 · NextAuth (Auth.js) v5 with Discord OAuth2 · SQLite (dev) /
PostgreSQL (production, same schema).

## How it's organized

```
src/
  app/                 routes (App Router), grouped under (app) for the
                        authenticated shell, plus /login, /api
  components/          ui/ (design system), layout/ (sidebar, topbar),
                        bots/ (bot-specific cards, forms, charts)
  server/
    services/          DiscordBotService interface + HttpBotAdapter — the
                        ONLY place that talks to a bot's HTTP API
    repositories/       thin Prisma wrappers, one per entity
    queries/            DB-only aggregations for fast pages (dashboard)
    actions/             "use server" actions (sign in/out)
  types/               shared DTOs used by the UI, the service layer and
                        the API routes
  lib/                 design tokens' helpers, per-system config field
                        definitions, message-key catalog, nav config
prisma/
  schema.prisma        data model
  seed.ts              seeds Bot rows from BOT_n_* env vars, plus a
                        starter Systems catalog
```

The one rule that shapes all of this: **the UI and API routes never talk to
a bot directly.** They go through `getBotService(botId)` →
`DiscordBotService`. If a bot's own API ever changes shape, only its
adapter (`HttpBotAdapter`) needs to change — nothing else in the app does.

## Setup

```bash
npm install
cp .env.example .env   # already done in this repo; fill in the blanks
npm run db:generate     # prisma generate
npm run db:push         # creates dev.db from prisma/schema.prisma
npm run db:seed          # seeds Bot rows from BOT_n_* env vars
npm run dev
```

> **This scaffold was built in a network-sandboxed environment** that
> blocks the Prisma engine binary download (`binaries.prisma.sh`) and
> Google Fonts. Because of that:
> - `npm run db:generate` / `db:push` / `db:seed` have **not been run
>   successfully here** — run them yourself once you have normal internet
>   access. Everything else (`tsc --noEmit`, `eslint`) has been checked and
>   is clean; the only remaining type errors before you run `prisma
>   generate` are the expected "no exported member `PrismaClient`" ones.
> - The root layout uses a system font stack instead of `next/font/google`
>   Inter. Swap it in once deployed somewhere with normal internet access
>   (see the comment in `src/app/globals.css`).

Then fill in `.env`:

- `AUTH_SECRET` — already generated for you.
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` — from a Discord
  application at <https://discord.com/developers/applications>. Add
  `<your-panel-url>/api/auth/callback/discord` as a redirect URL.
- `ALLOWED_DISCORD_IDS` — comma-separated Discord user IDs allowed to sign
  in. This is the only access control; there's no in-app "invite" flow, by
  design (so no one can grant themselves access from inside the panel).
- `BOT_1..4_{NAME,AVATAR_URL,API_URL,API_KEY}` — one block per bot. A bot
  with no `NAME` is skipped by the seed script entirely (never invented).
  A bot with a `NAME` but no `API_URL`/`API_KEY` shows up in the panel as
  **"not configured yet"** — never as fake data.

## The bot API contract

Each bot exposes a small HTTP API (see `src/server/services/http-bot-adapter.ts`
for the exact paths) authenticated with `Authorization: Bearer <BOT_n_API_KEY>`:

| Method & path | Purpose |
|---|---|
| `GET /capabilities` | optional; `{ capabilities: string[] }`. If missing, the panel just tries each call and treats a 404 as "not implemented yet" |
| `GET /status` | `{ state, latencyMs, uptimeSeconds, guildCount, lastCheckedAt }` |
| `GET /guilds` | list of guilds the bot is in |
| `GET/PATCH /guilds/:id/config` | per-guild config (prefix, etc.) |
| `GET /commands`, `PATCH /commands/:id` | list/toggle commands, optionally guild-scoped via `?guildId=` |
| `GET /systems/:guildId`, `PATCH /systems/:guildId/:key` | list/toggle/configure feature systems for a guild |
| `GET/PATCH /messages/:key` | message/embed templates, optionally `?guildId=` |
| `GET /logs`, `GET /statistics` | filtered logs, time-series stats |
| `POST /restart` | optional |

**Bots can also push instead of waiting to be polled:**
`POST /api/bots/[botId]/events` on the panel, body
`{ type: "status" | "log" | "stat", data: {...} }`, signed with
`X-Signature: HMAC-SHA256(rawBody, BOT_n_API_KEY)` — see
`src/app/api/bots/[botId]/events/route.ts` for the exact schema. This route
is excluded from session auth (`src/proxy.ts`) since bots have no browser
session; the signature is the authentication.

A 404 from any of the `GET`/`PATCH` endpoints above is treated as "this bot
hasn't implemented this yet" and shown honestly in the UI — never faked.

## What's real vs. what needs your bots

Everything in this panel is real: there are no fake buttons, invented
statistics, or hardcoded "Online" states. What you get depends entirely on
what each bot's API implements:

- No `API_URL` configured → the bot shows as "not configured."
- `API_URL` set but a given endpoint 404s → that section shows "not
  available on this bot yet" (Systems falls back to a starter catalog, all
  disabled, so you can see what's planned).
- The bot is unreachable (network/timeout) → "offline," not "unknown as
  online."
- A save fails → an error toast, and any optimistic UI change (a toggle)
  reverts — never a fake "✓ Saved."

## Security

- Discord tokens/API keys live only in the server environment
  (`BOT_n_API_KEY`), read via `process.env` in `HttpBotAdapter` — never sent
  to the browser, never in `localStorage`.
- Every page and `/api/*` route requires a signed-in, allow-listed Discord
  account (`src/proxy.ts` + defense-in-depth checks in
  `(app)/layout.tsx` and each API route).
- Every mutating API route validates its body with Zod
  (`src/server/api-helpers.ts`) and records an audit log entry
  (`recordAudit`, independent of each bot's own functional logs).
- The webhook route is HMAC-signed and timing-safe compared
  (`crypto.timingSafeEqual`).

## Production database

Swap SQLite for PostgreSQL without any schema changes: change
`datasource db { provider = "postgresql" }` in `prisma/schema.prisma` and
point `DATABASE_URL` at your Postgres instance.
