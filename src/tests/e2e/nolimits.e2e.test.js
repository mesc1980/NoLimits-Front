import { test, expect } from '@playwright/test';

test.describe('E2E - flujo de búsqueda NoLimits', () => {
  test('usuario busca una obra desde Home y navega a resultados', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('Buscar obras');

    await expect(input).toBeVisible();

    await input.fill('Naruto');
    await input.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=Naruto&type=all/);
    await expect(page.getByText(/Naruto/i)).toBeVisible();
  });

  test('usuario cambia el filtro de búsqueda desde resultados', async ({ page }) => {
    await page.goto('/');

    const input = page.getByLabel('Buscar obras');

    await input.fill('Naruto');
    await input.press('Enter');

    await expect(page).toHaveURL(/\/search\?q=Naruto&type=all/);

    const tabAnime = page.getByRole('tab', { name: /anime/i });

    await expect(tabAnime).toBeVisible();

    await tabAnime.click();

    await expect(page).toHaveURL(/\/search\?q=Naruto&type=anime/);
  });

  test('usuario navega a login y visualiza el formulario de acceso', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Iniciar sesión').last()).toBeVisible();
  });
});