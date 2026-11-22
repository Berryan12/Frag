# FRAG - Assignment and Lab Guide

This guide explains where the assignment concepts are implemented. Read the code and practice the small changes yourself before the individual lab assessment.

## Module 3 requirements kept in FRAG

| Requirement | File | How it works |
| --- | --- | --- |
| Fetch an external endpoint and convert it into objects using an Interface | `src/services/agentService.ts`, `src/types/agent.ts` | Fetches Valorant agents, checks the response, and maps API fields into the `Agent` interface. |
| Use custom and pre-built async functions | `src/app/(app)/index.tsx`, `src/services/agentService.ts` | `loadAgents()` is a custom async function. `fetch()` and `response.json()` are built-in asynchronous functions. |
| Use `.then()`, `.resolve()`, and `.reject()` | `src/services/agentService.ts` | The Promise chain processes the response, returns the result, and passes errors to `.catch()`. |
| Answer questions and modify code | This guide and the source files | Use the explanations and practice tasks below. The actual answer and live modification are individual tasks. |

## Module 4 Codelabs and assignment features

| Feature | File | How it works |
| --- | --- | --- |
| Secure token save/read/delete | `src/components/SecureVaultDemo.tsx` | Calls `SecureStore.setItemAsync`, `getItemAsync`, and `deleteItemAsync` with a separate demo token. |
| Supabase client connection | `src/lib/supabase.ts` | Creates one shared Supabase client using values from `.env`. |
| Secure session storage | `src/lib/supabase.ts` | Supabase uses a storage adapter that saves native session data through Expo SecureStore. No AsyncStorage is used for auth tokens. |
| Registration and login | `src/app/(auth)/login.tsx` | Uses `signUp()` for registration and `signInWithPassword()` for login. Callsign is stored as user metadata. |
| Logout | `src/contexts/AuthContext.tsx` | Calls `supabase.auth.signOut()`, which ends the session and removes the persisted session from the configured storage adapter. |
| Session persistence | `src/contexts/AuthContext.tsx` | Calls `getSession()` at startup and listens for auth changes with `onAuthStateChange()`. |
| Global auth state | `src/contexts/AuthContext.tsx` | Shares the current user, session, loading state, and sign-out function through React Context. |
| Protected routes | `src/app/_layout.tsx` | Uses `useSegments()` to redirect signed-out users to `/(auth)/login` and signed-in users to `/(app)`. It waits for session loading before redirecting. |
| Read missions | `src/services/missionService.ts` | Selects missions for the signed-in user and orders them newest first. |
| Create missions | `src/services/missionService.ts` | Inserts a mission using the authenticated user's ID. |
| Update missions | `src/services/missionService.ts` | Changes a mission between `pending` and `completed`. |
| Delete missions | `src/services/missionService.ts` | Deletes the selected mission. |
| RLS data isolation | `supabase/schema.sql` | PostgreSQL policies compare `auth.uid()` with `user_id` for every operation. |
| Pull-to-refresh | `src/app/(app)/index.tsx` | `RefreshControl` calls the refresh function to reload agents and missions. |
| Optimistic UI | `src/app/(app)/index.tsx` | The list changes immediately. If the database request fails, the previous list is restored. |
| Loading and error states | `src/app/(app)/index.tsx`, `src/app/(auth)/login.tsx` | Displays progress indicators, validation messages, and request errors rather than crashing. |

## How the app works from launch to logout

1. `src/app/_layout.tsx` wraps the application in `AuthProvider`.
2. `AuthContext` asks Supabase to restore a saved session with `getSession()`.
3. Supabase reads the session through the storage adapter in `src/lib/supabase.ts`. On Android/iOS, that adapter uses Expo SecureStore.
4. The route guard checks the current route with `useSegments()`.
5. If there is no logged-in user, the app redirects to `/(auth)/login`.
6. The login page registers or authenticates the user with Supabase Auth.
7. `onAuthStateChange()` updates the global context after a successful login.
8. The route guard sends the user to `/(app)`.
9. The dashboard loads that user's missions from Supabase. RLS also checks ownership on the database server.
10. When the user signs out, Supabase ends the session and the route guard returns the user to the login page.

## Important code explained

### 1. SecureStore adapter

File: `src/lib/supabase.ts`

```ts
const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
```

Supabase expects storage methods named `getItem`, `setItem`, and `removeItem`. The adapter connects those methods to Expo SecureStore. The app does not manually save the user's password.

### 2. Registration and login

File: `src/app/(auth)/login.tsx`

- `signUp()` creates a new Supabase account.
- `options.data.callsign` attaches the callsign as user metadata.
- `signInWithPassword()` checks the email and password.
- `.trim()` removes accidental spaces from the email and callsign.
- `isSubmitting` disables the button while the request is running.

### 3. Global session state

File: `src/contexts/AuthContext.tsx`

- `getSession()` checks whether a saved session exists.
- `onAuthStateChange()` listens for login, logout, and token refresh events.
- `user` and `session` are shared with screens using `useAuth()`.
- `isLoading` prevents the route guard from redirecting before the saved session has been checked.

### 4. Protected routes

File: `src/app/_layout.tsx`

`useSegments()` reads the active Expo Router route group. If the user is not logged in, private app pages are blocked and the user is sent to the login page. If the user is already logged in, the login page is skipped and the user is sent to the app.

### 5. Row Level Security

File: `supabase/schema.sql`

The app filters mission queries by `user_id`, but that is not the main security boundary. The database policies are the important part:

```sql
using (auth.uid() = user_id)
```

This makes PostgreSQL check that the authenticated account owns the row. A user cannot read or change another user's missions just by modifying a request in the app.

### 6. Optimistic UI

File: `src/app/(app)/index.tsx`

When a mission is added, completed, or deleted, the local list changes first. The app then sends the request to Supabase. If the request fails, the previous list is restored and an error message is shown. This makes the interface feel responsive without hiding server errors.

## Questions a lab assistant may ask

### What is the difference between AsyncStorage and SecureStore?
AsyncStorage is suitable for non-sensitive preferences or cached data. SecureStore uses the iOS Keychain and Android Keystore for sensitive values such as authentication tokens. FRAG uses SecureStore for native Supabase sessions.

### Why does FRAG need a custom storage adapter?
Supabase needs a storage interface to persist its session. The adapter connects that interface to Expo SecureStore so the mobile app does not store auth tokens in ordinary unencrypted storage.

### What is a JWT?
A JSON Web Token is a signed token used to identify an authenticated user when making requests to the backend.

### What happens during registration?
The app calls `supabase.auth.signUp()` with the cleaned email, password, and callsign metadata. Supabase creates the account and may require email confirmation depending on project settings.

### What happens during login?
The app calls `signInWithPassword()`. If the credentials are valid, Supabase returns a session and the AuthContext receives the auth-state event.

### What does AuthContext do?
It stores the current session and user in one shared place, restores the session when the app starts, and listens for auth changes so every screen can respond.

### Why use `useSegments()`?
It tells the root layout which route group is currently active. FRAG uses it to protect the app group and redirect users to the correct screen.

### What is Row Level Security?
RLS is a database feature that checks which rows a user is allowed to access. FRAG policies compare `auth.uid()` with the row's `user_id`.

### What is CRUD?
CRUD means Create, Read, Update, and Delete. FRAG creates missions, lists them, changes their status, and deletes them.

### What is optimistic UI?
It updates the screen before the server confirms the operation. If the server returns an error, FRAG restores the previous list.

### Are all player statistics real?
No. Player name, rank, K/D, win rate, headshot percentage, and recent matches are sample data. Agent data comes from the Valorant API. Mission data and account sessions use Supabase after configuration.

## Practice live code modifications

1. Change the default mission reward from `150` to `200` in `src/app/(app)/index.tsx`.
2. Change the maximum mission title length from `120` to `80` in the mission `TextInput` and in the SQL table constraint.
3. Change the default role recommendation threshold in `getRecommendedRole()`.
4. Change the agent sorting order in `src/services/agentService.ts` from `b.fit - a.fit` to `a.fit - b.fit`.
5. Add a third mission status only after updating the TypeScript type, UI, and SQL constraint together.
6. Change the colors in `src/constants/styles.ts`.

Make the changes yourself and explain what each one affects. The lab assistant may request a different modification during the assessment.

## Setup reminders

- Add your own Supabase URL and anon/public key to `.env`.
- Run `supabase/schema.sql` in the Supabase SQL Editor.
- Do not use or commit the Supabase `service_role` key.
- Do not commit `.env` to GitHub.
- Test SecureStore and session persistence in Expo Go on Android/iOS. The browser preview uses only temporary in-memory storage.
