# FRAG 

FRAG is a React Native + Expo Router project using a black, red, and gray theme. This update keeps the Module 3 Valorant API work and adds the Module 4 SecureStore, Supabase, authentication, protected routes, and private mission board.

This ZIP is a **source-code update for an existing Expo project**, not a complete Expo project. Keep your existing `package.json`, `app.json`, and `node_modules`.

## 1. Install the required packages

Run these commands from the folder that contains your existing `package.json`:

```bash
npx expo install expo-secure-store
npm install @supabase/supabase-js react-native-url-polyfill
```

Keep `@expo/vector-icons` installed because the FRAG screen uses Ionicons.

## 2. Copy the source files

Copy the contents of this ZIP into the root of your existing Expo project and allow matching files to be replaced.

The updated structure is:

```text
YOUR_EXPO_PROJECT/
├── .env                         # create this yourself; do not copy real keys into Git
├── .env.example
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── (auth)/
│   │   │   └── login.tsx
│   │   └── (app)/
│   │       └── index.tsx
│   ├── components/
│   │   └── SecureVaultDemo.tsx
│   ├── constants/
│   │   └── styles.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── services/
│   │   ├── agentService.ts
│   │   └── missionService.ts
│   └── types/
│       ├── agent.ts
│       ├── database.ts
│       └── mission.ts
├── supabase/
│   └── schema.sql
└── exercise.ts
```

**Important migration step:** the old `src/app/index.tsx` has been moved to `src/app/(app)/index.tsx`. Delete the old `src/app/index.tsx` after copying so Expo Router does not find two routes for `/`.

Keep your existing root `src/app/_layout.tsx` only if you merge its navigation setup with the new `AuthProvider` and route guard. The included file already provides both.

## 3. Connect your Supabase project

1. Create or open your project at https://supabase.com/dashboard.
2. Open Project Settings -> API.
3. Copy the Project URL and the anon/public key. Do not use the `service_role` key in a mobile app.
4. Create a file named `.env` in the same folder as `package.json`.
5. Add your own values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

The values in `.env.example` are placeholders. Replace them with your own project values. Do not upload `.env` to GitHub.

## 4. Create the missions table and RLS policies

1. Open your Supabase project.
2. Select SQL Editor -> New query.
3. Open `supabase/schema.sql` from this ZIP.
4. Paste the full SQL into the editor and click Run.

This creates the `missions` table and enables Row Level Security. Each policy checks `auth.uid() = user_id`, so users can only read, create, update, and delete their own missions.

## 5. Configure email confirmation for lab testing

Supabase may require email confirmation after registration. For the lab's quick test, open Authentication -> Providers -> Email and turn off Confirm email if your instructor permits it. Otherwise, use the confirmation link sent to your email before signing in.

## 6. Run FRAG

After adding `.env`, restart Expo so it reads the new environment values:

```bash
npx expo start --go -c
```

Scan the QR code from Expo Go on Android or iOS. SecureStore is intended for native devices. The web preview uses temporary in-memory session storage only; it does not provide secure persistent token storage.

## 7. Test the Module 4 features

1. Register an account with a callsign, email, and password of at least 6 characters.
2. Sign in with the account.
3. Add a mission to the Mission Board.
4. Mark the mission as completed, then change it back to pending.
5. Delete the mission.
6. Pull down on the screen to refresh the mission list.
7. Close and reopen Expo Go. The session should be restored on the same device.
8. Sign out. FRAG should return to the login screen.
9. Register a second account and confirm it cannot see the first account's missions.
10. Use Save, Retrieve, and Clear in Secure Token Vault to test Expo SecureStore.

## Notes

- The player rank, K/D, win rate, headshot percentage, and recent matches are sample data.
- Agent information is fetched from the public Valorant API.
- Agent role-fit scores are prototype values, not official Valorant statistics.
- The Supabase anon/public key is designed to be used by a client app; RLS is what protects user rows. Never put a service-role key in this project.
- The web fallback is only for previewing the UI. Test secure session persistence in Expo Go on a mobile device.
