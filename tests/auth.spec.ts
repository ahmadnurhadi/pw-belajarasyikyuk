import { expect, test } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { hasTestCredentials, testCredentials } from './test-data';

test('empty login submission stays on the login form', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.open();

  const email = page.getByRole('textbox', { name: 'Email' });
  const password = page.getByRole('textbox', { name: 'Password' });
  await expect(email).toHaveAttribute('type', 'email');
  await expect(password).toHaveAttribute('type', 'password');
  await expect(email).toHaveAttribute('required', '');
  await expect(password).toHaveAttribute('required', '');

  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/auth$/);
  await expect(
    page.getByRole('heading', { name: 'Masuk sebagai Siswa' }),
  ).toBeVisible();
});

test('invalid email is rejected by native email validation', async ({
  page,
}) => {
  const authPage = new AuthPage(page);
  await authPage.open();

  const email = page.getByRole('textbox', { name: 'Email' });
  await email.fill('not-an-email');
  await page.getByRole('textbox', { name: 'Password' }).fill('test-password');

  const isValidEmail = await email.evaluate(
    (element) => (element as HTMLInputElement).validity.valid,
  );
  expect(isValidEmail).toBe(false);

  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page).toHaveURL(/\/auth$/);
});

test('registration form exposes grade and student fields without submitting', async ({
  page,
}) => {
  const authPage = new AuthPage(page);
  await authPage.open();
  await authPage.openRegistration();

  await expect(
    page.getByRole('heading', { name: 'Daftar sebagai Siswa' }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Nama' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
    'type',
    'email',
  );
  await expect(page.getByRole('textbox', { name: 'Password' })).toHaveAttribute(
    'type',
    'password',
  );

  for (let grade = 1; grade <= 6; grade += 1) {
    await expect(
      page.getByRole('button', { name: String(grade) }),
    ).toBeVisible();
  }
});

test('test account can sign in and sign out', async ({ page }) => {
  test.skip(
    !hasTestCredentials,
    'Set BA_TEST_EMAIL and BA_TEST_PASSWORD (or TEST_EMAIL and TEST_PASSWORD).',
  );

  const authPage = new AuthPage(page);

  await authPage.open();
  await authPage.login(
    testCredentials.email!,
    testCredentials.password!,
  );

  await expect(page).toHaveURL(/\/dashboard$/);

  await expect(
    page.getByRole('heading', { name: 'Progress Belajar' }),
  ).toBeVisible();

  const accountAction = page
    .getByRole('banner')
    .getByRole('button')
    .last();

  await accountAction.click();

  await expect(page).toHaveURL('/');
  await expect(
    page.getByRole('link', { name: 'Masuk' }),
  ).toBeVisible();

  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/auth$/);
});
