import { expect, test, type Page } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { hasTestCredentials, testCredentials } from './test-data';

async function signIn(page: Page) {
  test.skip(!hasTestCredentials, 'Set BA_TEST_EMAIL and BA_TEST_PASSWORD.');

  const dashboard = new DashboardPage(page);
  await dashboard.login(testCredentials.email!, testCredentials.password!);
  await expect(
    page.getByRole('heading', { name: 'Progress Belajar' }),
  ).toBeVisible();
}

async function openMathTutorial(page: Page) {
  const dashboard = new DashboardPage(page);
  await dashboard.openRouteFromDashboard('/tutorial');
  await expect(
    page.getByRole('heading', { name: 'Pilih Mata Pelajaran' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: /Matematika 7 tutorial tersedia/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Tutorial Matematika' }),
  ).toBeVisible();

  const search = page.getByRole('textbox', { name: /Cari tutorial/ });
  await search.fill('Pecahan');

  const tutorial = page.getByRole('button', {
    name: /Pecahan Campuran Menguasai Pecahan Campuran & Operasinya/,
  });
  await expect(tutorial).toBeVisible();
  await tutorial.click();
}

test('leaderboard filters classes and switches ranking metrics', async ({
  page,
}) => {
  await signIn(page);
  const dashboard = new DashboardPage(page);
  await dashboard.openRouteFromDashboard('/leaderboard');

  await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();

  for (let grade = 1; grade <= 6; grade += 1) {
    await expect(
      page.getByRole('button', { name: `Kelas ${grade}`, exact: true }),
    ).toBeVisible();
  }

  const allClasses = page.getByRole('button', { name: 'Semua', exact: true });
  await expect(allClasses).toBeVisible();

  const panel = page.getByRole('tabpanel');
  const rows = panel.locator(':scope > div > div');
  await expect(rows).not.toHaveCount(0);

  await page.getByRole('button', { name: 'Kelas 1', exact: true }).click();
  await expect(rows).not.toHaveCount(0);
  expect(
    await rows.evaluateAll((items) =>
      items.every((item) => item.textContent?.includes('Kelas 1')),
    ),
  ).toBe(true);

  await allClasses.click();
  await expect(rows).not.toHaveCount(0);

  for (const name of ['Streak', 'Koin', 'Cek Login']) {
    const tab = page.getByRole('tab', { name });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(panel).toBeVisible();
    await expect(rows).not.toHaveCount(0);
  }
});

test('education game catalog is visible and shows each coin cost before play', async ({
  page,
}) => {
  await signIn(page);
  const dashboard = new DashboardPage(page);
  await dashboard.openRouteFromDashboard('/games');

  await expect(page.getByRole('heading', { name: 'Game Edukasi' })).toBeVisible();

  const games = [
    { name: 'Hitung Cepat', cost: 5 },
    { name: 'Susun Kata', cost: 5 },
    { name: 'Kartu Memori', cost: 8 },
    { name: 'Tebak Emoji', cost: 10 },
    { name: 'Hitung Benda', cost: 5 },
    { name: 'Tebak Gambar', cost: 8 },
    { name: 'Teka-Teki Silang', cost: 10 },
  ];

  for (const game of games) {
    const card = page
      .getByRole('button')
      .filter({
        has: page.getByRole('heading', {
          name: game.name,
          exact: true,
        }),
      });
    await expect(card).toBeVisible();
    await expect(card).toBeEnabled();
    await expect(card).toContainText(`${game.cost} Koin`);
  }

  await expect(
    page.getByRole('heading', { name: /Bonus Koin dari Game/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Cara Mendapatkan Koin/ }),
  ).toBeVisible();
});

test('tutorial search opens a lesson with steps, examples, and parent guidance', async ({
  page,
}) => {
  await signIn(page);
  await openMathTutorial(page);

  await expect(
    page.getByRole('heading', {
      name: 'Menguasai Pecahan Campuran & Operasinya',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Langkah-langkah Belajar/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Contoh Konkret/ }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tips & Trik' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Panduan untuk Orang Tua' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Tonton Video Gratis/ }),
  ).toBeVisible();
});

test('selected tutorial video is available to watch', async ({ page }) => {
  await signIn(page);
  await openMathTutorial(page);

  await page.getByRole('button', { name: /Tonton Video Gratis/ }).click();

  const player = page.frameLocator(
    'iframe[title="Menguasai Pecahan Campuran & Operasinya"]',
  );
  const playerBody = player.locator('body');
  await expect.poll(async () => (await playerBody.innerText()).trim(), {
    timeout: 15_000,
  }).not.toBe('');

  const playerText = await playerBody.innerText();
  expect(playerText).not.toMatch(
    /Video unavailable|This video is unavailable/i,
  );
});
