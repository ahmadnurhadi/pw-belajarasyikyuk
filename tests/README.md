# Belajar Asyik Playwright checks

These tests exercise the live application at `https://belajarasyikyuk.lovable.app`.
They use read-only navigation where possible. The suite deliberately does not
start paid games, complete lessons, convert coins, mark notifications read, or
create an account.

## Run

```powershell
npm ci
npx playwright install chromium
npm test
```

Tests that need a test account are skipped unless credentials are provided as
`BA_TEST_EMAIL` and `BA_TEST_PASSWORD` (or the aliases `TEST_EMAIL` and
`TEST_PASSWORD`). `dotenv/config` loads these values from a local, ignored
`.env` file or the current shell environment. Do not commit credentials or
include them in screenshots or traces. For an interactive PowerShell session,
enter the password with a secure prompt:

```powershell
$env:BA_TEST_EMAIL = Read-Host "Test account email"
$securePassword = Read-Host "Test account password" -AsSecureString
$env:BA_TEST_PASSWORD = [Net.NetworkCredential]::new("", $securePassword).Password
npm test
Remove-Item Env:BA_TEST_EMAIL, Env:BA_TEST_PASSWORD
```

The authentication checks log in using that account. The dashboard and
navigation smoke tests read feature pages but avoid state-changing actions.
Application-side login/streak behavior may still run when an authenticated
session is opened.

Use `BA_BASE_URL` to point the suite at another deployment. The default
Playwright project is Chromium; mobile layout is checked by changing the
viewport within a test.

## Exploratory findings

- Public routes observed: `/` and `/auth`; the landing page links to
  `/auth?grade=1` through `/auth?grade=6`.
- Authenticated routes observed: `/dashboard`, `/notifications`,
  `/leaderboard`, `/games`, `/tutorial`, and seven `/subject/...` pages.
- Lesson links show an XP cost; they are not opened by the smoke suite.
- Coin conversion, paid games, and marking all notifications read are not
  exercised because they mutate account state.
- The game catalogue shows seven enabled options with costs from 5 to 10 Koin.
  Tests verify the cards and visible prices but do not start a game, since doing
  so may spend the test account's coins.
- The leaderboard's class filter and Streak, Koin, and Cek Login tabs are
  exercised. Tests verify class filtering without recording leaderboard names.
- Tutorial search and lesson guidance (steps, examples, tips, parent guidance)
  are exercised. The embedded YouTube player for the selected tutorial
  currently reports **"Video unavailable"**. The video-availability test is
  expected to fail until the application's video source is corrected.
- The dashboard account action had no accessible name in the browser
  accessibility snapshot. The logout smoke check currently identifies it as
  the last button in the banner; add an accessible name in the application
  before relying on a name-based locator.
- The detailed exploratory inventory and actual results are in
  [`test-plan.csv`](./test-plan.csv).

The test plan differentiates executed checks from `NOT RUN`, `NOT VERIFIED`,
and `BLOCKED` scenarios. A passing smoke test is not a complete accessibility
audit.
