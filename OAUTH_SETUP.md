# OAuth Setup Runbook

Complete dashboard walkthrough to enable Google + Apple sign-in for Bible in Context.

The code is already wired (`src/pages/Login.jsx`). All that's left is configuring the providers' dashboards and pasting the resulting credentials into `.env` and Xcode.

---

## 1. Apple — Sign in with Apple

### 1a. In Xcode (one-time)

1. `npm run cap:open` — opens the iOS project.
2. Select the **App** target → **Signing & Capabilities** tab.
3. Click **+ Capability**, add **Sign in with Apple**.
4. Set your Team. Confirm Bundle ID is `com.noahgniffke.bibleincontext`.

### 1b. In Apple Developer dashboard (https://developer.apple.com/account)

1. **Identifiers** → find `com.noahgniffke.bibleincontext` → ensure **Sign In with Apple** is checked under Capabilities → Save.
2. **Identifiers** → click **+** → **Services IDs** → Continue.
3. Description: `Bible in Context Web Sign-In` · Identifier: `com.noahgniffke.bibleincontext.web` · Continue → Register.
4. Click the new Services ID → enable **Sign In with Apple** → Configure.
5. Primary App ID: select `com.noahgniffke.bibleincontext`.
6. Domains: `<your-supabase-project>.supabase.co`
7. Return URLs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
8. Save.

### 1c. Generate Sign In with Apple key

1. **Keys** → **+** → name it `Bible in Context Apple Sign-In`.
2. Check **Sign In with Apple** → Configure → primary App ID = `com.noahgniffke.bibleincontext` → Save → Continue → Register.
3. Download the `.p8` file (only chance — save it).
4. Note: Key ID (10 chars), Team ID (top-right of dashboard).

---

## 2. Google — OAuth client IDs

In Google Cloud Console (https://console.cloud.google.com):

1. Create project `bible-in-context` (or reuse).
2. **APIs & Services** → **OAuth consent screen** → External → fill in app name, support email, dev email → Save.
3. **APIs & Services** → **Credentials** → **+ Create Credentials** → **OAuth client ID**.

### iOS client

- Application type: **iOS**
- Name: `Bible in Context iOS`
- Bundle ID: `com.noahgniffke.bibleincontext`
- Save → copy the **Client ID** (looks like `123-abc.apps.googleusercontent.com`).

### Web client

- Application type: **Web application**
- Name: `Bible in Context Web`
- Authorized redirect URIs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
- Save → copy the **Client ID** AND **Client Secret**.

---

## 3. Supabase — enable providers

In your Supabase dashboard → Authentication → Providers:

### Google

- Enabled: ✅
- Client ID: paste the **Web Client ID** from step 2
- Client Secret: paste the **Web Client Secret** from step 2
- Save.

### Apple

- Enabled: ✅
- Client IDs (comma-separated):
  `com.noahgniffke.bibleincontext,com.noahgniffke.bibleincontext.web`
- Secret Key (.p8 contents): open the `.p8` from step 1c in a text editor and paste the entire contents (including `-----BEGIN PRIVATE KEY-----` lines).
- Key ID: from step 1c.
- Team ID: from step 1c.
- Save.

### Site URL & redirect

- Authentication → URL Configuration
- Site URL: `https://bible-in-context.vercel.app`
- Redirect URLs (add each on its own line):
  - `https://bible-in-context.vercel.app/auth/callback`
  - `http://localhost:5174/auth/callback`
  - `bibleincontext://auth/callback` (for native deep linking, if you add it)

---

## 4. Update `.env`

```bash
VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<from Supabase → Project Settings → API>
VITE_GOOGLE_IOS_CLIENT_ID=<iOS client ID from step 2>
VITE_GOOGLE_WEB_CLIENT_ID=<Web client ID from step 2>
```

For the Vercel-deployed web build, set the same values in **Vercel → Project Settings → Environment Variables**, then redeploy.

---

## 5. Add Google URL scheme to Info.plist

Google Sign-In on iOS needs a custom URL scheme in `ios/App/App/Info.plist` so the OAuth redirect can return to the app.

The scheme is your iOS Client ID with the parts reversed.

If `VITE_GOOGLE_IOS_CLIENT_ID=123456789-abc.apps.googleusercontent.com`, the scheme is `com.googleusercontent.apps.123456789-abc`.

Add this to Info.plist before the closing `</dict>`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

Then run `npm run cap:sync` to copy the change into the iOS project.

---

## 6. Verify

```bash
npm run dev
```

Open the web build → Sign In → click **Continue with Google** → consent screen → redirected back signed in. Same with Apple.

Then test on iOS:

```bash
npm run ios
```

In Xcode → run on a real device (Sign in with Apple is finicky on the simulator). Both flows should land you in `/complete-profile` on first sign-in, then `/` after picking a username.

---

## Common issues

| Symptom | Fix |
|---|---|
| Apple button does nothing on iOS | Sign in with Apple capability not enabled in Xcode (step 1a) |
| "Invalid client" on Google web | Web Client Secret missing from Supabase or wrong client (must use Web ID, not iOS ID) |
| Apple sign-in returns user but Supabase rejects | Services ID not configured with Supabase callback URL (step 1b.7) |
| Google iOS opens browser then never returns | URL scheme missing from Info.plist (step 5) |
| New user lands on `/` instead of `/complete-profile` | Profile creation failed — check browser console for Supabase errors, verify `profiles` row was created |
