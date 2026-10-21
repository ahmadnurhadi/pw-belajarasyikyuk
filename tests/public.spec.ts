import { expect, test } from '@playwright/test';

test('landing page presents its title, entry points, and grade links', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Belajar Asyik/);
  await expect(
    page.getByRole('heading', { name: 'Belajar Terasa Seperti Bermain' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Masuk' })).toHaveAttribute(
    'href',
    '/auth',
  );
  await expect(
    page.getByRole('link', { name: 'Mulai Belajar Gratis' }),
  ).toHaveAttribute('href', '/auth');

  for (let grade = 1; grade <= 6; grade += 1) {
    await expect(
      page.getByRole('link', { name: new RegExp(`Kelas ${grade}`) }),
    ).toHaveAttribute('href', `/auth?grade=${grade}`);
  }
});

test('public page loads without app JavaScript errors or failed same-origin requests', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedAppRequests: string[] = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    if (request.url().startsWith('https://belajarasyikyuk.lovable.app/')) {
      failedAppRequests.push(request.url());
    }
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Belajar Terasa Seperti Bermain' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Masuk' }).click();
  await expect(
    page.getByRole('heading', { name: 'Masuk sebagai Siswa' }),
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedAppRequests).toEqual([]);
});

test('landing and authentication layouts fit a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const landingOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(landingOverflows).toBe(false);

  await page.getByRole('link', { name: 'Masuk' }).click();
  await expect(
    page.getByRole('heading', { name: 'Masuk sebagai Siswa' }),
  ).toBeVisible();

  const authOverflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(authOverflows).toBe(false);
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
});
