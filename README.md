# Bible in Context

A free, in-depth iOS Bible study app. Cross-references, Greek/Hebrew with Strong's, commentary (Matthew Henry, JFB, Tyndale), community plans, social study sharing.

**Live web build:** https://bible-in-context.vercel.app

## Stack

- React 19 + React Router 7 + Vite 8 + Tailwind 4
- Capacitor 8 (iOS native shell)
- Supabase (auth + sync for notes/highlights/bookmarks/prayers/plans)
- All Bible text bundled offline: WEB, KJV, ASV (public domain only)

## Getting started

```bash
npm install
cp .env.example .env   # fill in Supabase + Google OAuth keys
npm run dev            # http://localhost:5174
```

## iOS development

Capacitor must be initialized once. After that, `npm run ios` builds the web bundle, syncs to native, and opens Xcode.

```bash
# First time only
npx cap add ios

# Every build
npm run ios
```

Then in Xcode: select a simulator or device, set your team and bundle ID, and run.

## Environment variables

| Variable | Used for |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_GOOGLE_IOS_CLIENT_ID` | Native iOS Google Sign-In |
| `VITE_GOOGLE_WEB_CLIENT_ID` | Web Google OAuth |

The app runs in offline-only mode if Supabase keys are missing — auth features are disabled, all study tools still work locally.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL editor (initial setup).
3. If you set up the project before 2026-05-08, run `supabase-migration-v1.1.sql`.
4. Enable Google + Apple OAuth providers in Authentication → Providers.

## Project layout

```
src/
├── pages/         # Routes (BibleIndex, ChapterView, VerseContext, Notes, ...)
├── components/    # Shared UI (TabBar, EmptyState, Toast, ...)
├── contexts/      # AuthContext, ThemeContext
├── hooks/         # useUserData (offline-first sync), useAuth, ...
├── lib/           # supabase client, bible-api, strongs, tsk, jfb, ...
├── data/          # Bundled scripture, lexicons, commentary, cross-refs
└── assets/        # Static images
```

## Data principles

- **No external API calls** for Bible content. Everything is bundled.
- **No LLM-generated content.** Insights come from the Strong's lexicon and public-domain commentaries directly.
- **Optional accounts.** The app works fully without signing in. Sign-in only adds cross-device sync.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production web build |
| `npm run preview` | Preview the prod build locally |
| `npm run lint` | ESLint check |
| `npm run cap:sync` | Build + sync to iOS native project |
| `npm run cap:open` | Open the iOS project in Xcode |
| `npm run ios` | All of the above |
