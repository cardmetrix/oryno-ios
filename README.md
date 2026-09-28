# ORYNO for iOS

End-user iPhone and iPad app for the live ORYNO platform ([orynoafrica.com](https://www.orynoafrica.com)).

Uses the **external API** on `oryno-website` and **Clerk** for authentication. Admin console lives on the website only — this repo has no admin screens or `/api/admin` client code.

## Setup

1. Public env only (already in `.env` / `.env.local`):

```bash
EXPO_PUBLIC_API_URL=https://orynoafrica.com
EXPO_PUBLIC_API_PREFIX=/api
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…
```

After deploying the website middleware rewrite for the external API, you can switch to:

```bash
EXPO_PUBLIC_API_PREFIX=/api/external/v1
```

(The client auto-falls back to `/api` if external returns 401/404/503.)

2. Install & run:

```bash
pnpm install
pnpm ios
```

## API

Default prefix is `/api` (same first-party routes as the website).

Optional external surface (after deploying `oryno-website` middleware rewrite):

```
EXPO_PUBLIC_API_PREFIX=/api/external/v1
GET https://orynoafrica.com/api/external/v1
```

Docs: `oryno-website/docs/EXTERNAL_API.md`.

## Live features

| Area | External API |
|------|----------------|
| Auth sync | `POST /auth/sync`, `POST /auth/logout` |
| Wallet | `GET /wallet`, deposit-account, withdraw, banks |
| History | `/transactions` |
| Airtime / Data / Bills | `/services/*` aliases or `/vtpass/*` |
| Social Boost | `/services/social` or `/jap/*` |
| Gift Cards | `/services/gift-cards/*` or Reloadly/Sogo |
| Virtual Numbers / Emails | `/services/numbers/*`, `/services/emails/*` |
| Profile / Settings | `/profile`, `/settings` |
| Notifications | `/notifications` |

## Security

- Mobile only stores **publishable** Clerk key + API URL.
- All provider secrets stay on the Next.js server.
- Native app sends `Authorization: Bearer <Clerk session JWT>` on every API call.

## Clerk dashboard (Google sign-in)

1. **Configure → SSO connections → Google** — enable Google (same connection as the website).
2. **Native applications** — add the Expo redirect URL shown in Metro logs as `[ORYNO OAuth] starting`:
   - Dev build / TestFlight: `oryno://sso-callback`
   - Expo Go: `exp://<your-lan-ip>:8081/--/sso-callback` (or the value `AuthSession.makeRedirectUri` prints)
3. App scheme is `oryno` (`app.json`). Sign in with Apple is first, and Google is also available. Both use Clerk `useSSO` on login & register.

## App Store release

Production builds use EAS with the external API pinned to production:

```bash
pnpm eas:build:production
pnpm eas:submit
```

Before submitting:

- Set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (live) in the EAS **production** environment.
- In the Apple Developer account, enable Sign in with Apple and push notifications for `com.oryno.africa`.
- Complete App Store Connect: privacy policy URL, encryption (uses non-exempt encryption is off), and store listing assets.

Release builds are iOS-only, use **HTTPS**, version **1.0.1+**, and EAS `autoIncrement` for the iOS build number.

Photo uploads use the iOS photo library (Photos permission). Receipts and invoice PDFs open the native share sheet. Unlock uses Face ID or Touch ID, with a passcode fallback.
