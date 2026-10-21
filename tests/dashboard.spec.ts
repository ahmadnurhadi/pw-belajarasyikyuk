import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/dashboard.page';
import { hasTestCredentials, testCredentials } from './test-data';

test('signed-in student can navigate read-only dashboard features', async ({
  page,
}) => {
  test.skip(!hasTestCredentials, 'Set BA_TEST_EMAIL and BA_TEST_PASSWORD.');

  const dashboard = new DashboardPage(page);
  await dashboard.login(testCredentials.email!, testCredentials.password!);
  await expect(
    page.getByRole('heading', { name: 'Progress Belajar' }),
  ).toBeVisible();

  await dashboard.openRouteFromDashboard('/leaderboard');
  await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();
  const coinTab = page.getByRole('tab', { name: 'Koin' });
  await coinTab.click();
  await expect(coinTab).toHaveAttribute('aria-selected', 'true');
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Progress Belajar' }),
  ).toBeVisible();

  await dashboard.openRouteFromDashboard('/games');
  await expect(page.getByRole('heading', { name: 'Game Edukasi' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hitung Cepat' })).toBeVisible();
  await page.goBack();

  await dashboard.openRouteFromDashboard('/tutorial');
  await expect(
    page.getByRole('heading', { name: 'Tutorial Belajar' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Panduan Sebelum Mulai Belajar' }),
  ).toBeVisible();
  await page.goBack();

  await dashboard.openRouteFromDashboard('/notifications');
  await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Tandai semua dibaca' }),
  ).toBeVisible();
  await page.goBack();

  const subjects = [
    { route: '/subject/matematika', title: 'Matematika' },
    { route: '/subject/bahasa', title: 'Bahasa Indonesia' },
    { route: '/subject/ipa', title: 'IPA' },
    { route: '/subject/ips', title: 'IPS' },
    { route: '/subject/pai', title: 'Pendidikan Agama Islam' },
    { route: '/subject/ppkn', title: 'PPKN' },
    { route: '/subject/english', title: 'Bahasa Inggris' },
  ];

  for (const subject of subjects) {
    await dashboard.openRouteFromDashboard(subject.route);
    await expect(
      page.getByRole('heading', { name: subject.title, level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pilih Level' })).toBeVisible();
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Progress Belajar' }),
    ).toBeVisible();
  }
});
