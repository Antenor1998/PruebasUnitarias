import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Log in and save session storage', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/auth`);

    // Completa el formulario de login
    await page.fill('#username', 'Antenor');
    await page.fill('#password', 'tenoE18080561$');
    await page.click('#loginButton');

    // Espera a que se redirija a la página esperada
    await page.waitForURL(`${process.env.BASE_URL}/sidebar/my-space`);

    // Guarda el `sessionStorage` en un archivo JSON
    const sessionData = await page.evaluate(() => JSON.stringify(sessionStorage));
    fs.writeFileSync(`./auth/sessionStorage.dev.json`, sessionData);

    // Guarda `storageState` (cookies y localStorage)
    const env = process.env.NODE_ENV || 'local';
    await page.context().storageState({ path: `./auth/storageState.${env}.json` });
});
