import { type Page } from '@playwright/test';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/auth');
  }

  async login(email: string, password: string) {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Masuk' }).click();
  }

  async openRegistration() {
    await this.page.getByRole('button', { name: 'Daftar di sini' }).click();
  }
}
