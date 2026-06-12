import { test, expect } from '@playwright/test';

test.describe('Smoke Test - NoLimits', () => {
  test('la aplicación carga correctamente', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL('/');

    await expect(
      page.getByRole('search')
    ).toBeVisible();

    await expect(
      page.getByLabel('Buscar obras')
    ).toBeVisible();
  });

  test('el layout principal está presente', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.locator('header')
    ).toBeVisible();

    await expect(
      page.locator('main')
    ).toBeVisible();

    await expect(
      page.locator('footer')
    ).toBeVisible();
  });
});