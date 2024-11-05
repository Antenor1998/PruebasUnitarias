import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Log in and save session storage', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/auth`);

    // Completa el formulario de login
    await page.fill('#username', 'qatester');
    await page.fill('#password', 'Qatester2024.');
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


/*************************Crear usuarios aleatorios*********************************/

// Función para generar una cadena aleatoria
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// Generar datos de usuario aleatorios
function generateRandomUser() {
    const folio = `folio_${generateRandomString(5)}`;
    const nombre = `Usuario_${generateRandomString(5)}`;
    const Apaterno = `Paterno_${generateRandomString(3)}`;
    const fechacontratacion = '05/11/2023';
    const email = `${nombre}@example.com`;
    const empresa = `Empresa_${generateRandomString(5)}`;
    const departamento = `Departamento_${generateRandomString(5)}`;
    const centrodetrabajo = `lK20zbAk4JRDVEa1`;
    const tipodehorariodetrabajo = '0';
    const prestacion = `B9oQdeA1qYAvl1Wa`
    
    return {folio, nombre, Apaterno, fechacontratacion,
        email, empresa, departamento, centrodetrabajo, tipodehorariodetrabajo, prestacion
      };
}

test.describe('Automated Random User Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Cargar el estado de la sesión (login previamente guardado)
    await page.context().addCookies(JSON.parse(fs.readFileSync('./auth/storageState.dev.json', 'utf-8')).cookies);
  });

  test('Create random users', async ({ page }) => {
    // Define la cantidad de usuarios aleatorios que deseas crear
    const numberOfUsers = 5;

    for (let i = 0; i < numberOfUsers; i++) {
      const user = generateRandomUser();

      // Navegar a la página de creación de usuario
      //await page.goto('https://arierp.gruposisprovisa.net/sidebar/human-resources/new-employee/'); 
      await page.goto(`${process.env.BASE_URL}/sidebar/human-resources/new-employee/`);

      // Completa el formulario de creación de usuario con datos aleatorios
      await page.fill('#folio', user.folio);
      await page.fill('#firstName', user.nombre);
      await page.fill('#lastName', user.Apaterno);
      await page.fill('#fechacontratacion', user.fechacontratacion);
      await page.fill('#employeeEmail', user.email);
      await page.fill('#empresa', user.empresa);
      await page.fill('#companyId', user.departamento);
      await page.fill('#workCenterId', user.centrodetrabajo);
      await page.fill('#tipodehorariodetrabajo', user.tipodehorariodetrabajo);
      await page.fill('#prestacion', user.prestacion);
      
      // Enviar el formulario
      await page.click('#saveEmployee'); 

      // Verifica que el usuario fue creado exitosamente
      await expect(page.locator('.success-message')).toContainText('Usuario creado exitosamente');

      console.log(`Usuario creado: ${user.nombre}, Email: ${user.email}`);
    }
  });
});
