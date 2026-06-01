# Bible in Context — Marketing Site

Next.js 16 + React Three Fiber + Tailwind 4 marketing site for the Bible in Context iOS app.

## Vision
That the Word of God would actually be understood — in its true context.

## Stack
- Next.js 16 App Router
- React 19, TypeScript
- @react-three/fiber + drei (ambient 3D scene)
- Tailwind 4
- next/font (Cormorant Garamond + Inter)

## Theme
Mirrors the bible-in-context app exactly:
- **Dark (Noah)** — black + blood red + parchment + gold
- **Light (Allie)** — cream + pastoral green + warm dark + gold

Toggle is in the top-right. Defaults to system preference, persists in localStorage.

## Develop
```bash
npm install
npm run dev
```

## Deploy (Vercel — new project, separate from the app)
```bash
npx vercel link
npx vercel deploy --prod --yes
```
