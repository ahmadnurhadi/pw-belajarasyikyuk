import { type Page } from '@playwright/test';
import { AuthPage } from './auth.page';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async login(email: string, password: string) {
    const authPage = new AuthPage(this.page);
    await authPage.open();
    await authPage.login(email, password);
    await this.page.waitForURL('**/dashboard');
  }

  async openRouteFromDashboard(route: string) {
    const link = this.page.locator(`a[href="${route}"]`).first();
    await link.focus();
    await this.page.keyboard.press('Enter');
  }
}
