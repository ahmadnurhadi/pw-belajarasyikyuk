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

Tests that need a test account are skipped unless `BA_TEST_EMAIL` and
`BA_TEST_PASSWORD` are provided. Set them through a local secret manager or
the current shell environment; do not put credentials in source files,
screenshots, traces, or committed `.env` files. For an interactive PowerShell
session, enter the password with a secure prompt:

```powershell
$env:BA_TEST_EMAIL = Read-Host "Test account email"
$securePassword = Read-Host "Test account password" -AsSecureString
$env:BA_TEST_PASSWORD = [Net.NetworkCredential]::new("", $securePassword).Password
npm test
Remove-Item Env:BA_TEST_EMAIL, Env:BA_TEST_PASSWORD
```

The authentication checks log in using that account. The dashboard and
navigation smoke test reads feature pages but avoids state-changing actions.
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
- The dashboard account action had no accessible name in the browser
  accessibility snapshot. The logout smoke check currently identifies it as
  the last button in the banner; add an accessible name in the application
  before relying on a name-based locator.
- The detailed exploratory inventory and actual results are in
  [`test-plan.csv`](./test-plan.csv).

The test plan differentiates executed checks from `NOT RUN`, `NOT VERIFIED`,
and `BLOCKED` scenarios. A passing smoke test is not a complete accessibility
audit.
