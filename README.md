# Proyecto de Pruebas con Playwright

Este proyecto utiliza [Playwright](https://playwright.dev/) para automatizar pruebas en una aplicación que requiere autenticación, con soporte para múltiples entornos (`local`, `dev`, `prod`). Las pruebas incluyen el manejo de `storageState` para persistir el estado de sesión, así como `sessionStorage` manualmente.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (versión 6 o superior)

## Instalación

1. Clona este repositorio.
2. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

3. Instala los navegadores necesarios para Playwright:

   ```bash
   npx playwright install
   ```

## Configuración de Entornos

1. Crea archivos `.env` específicos para cada entorno (`.env.local`, `.env.dev`, `.env.prod`). Cada archivo debe incluir al menos la variable `BASE_URL`.

   - **Ejemplo `.env.local`**
     ```plaintext
     BASE_URL=http://localhost:3000
     TIMEOUT=60000
     ```

2. La estructura de configuración en `playwright.config.ts` cargará automáticamente el archivo `.env` según el entorno que esté definido en `NODE_ENV`.

3. En `package.json`, están configurados scripts para cada entorno:

   ```json
   "scripts": {
     "test:local": "cross-env NODE_ENV=local npx playwright test",
     "test:dev": "cross-env NODE_ENV=dev npx playwright test",
     "test:prod": "cross-env NODE_ENV=prod npx playwright test"
   }
   ```

## Autenticación y Almacenamiento del Estado de Sesión

Para evitar repetir el proceso de autenticación en cada prueba, se guarda el estado de sesión en un archivo `storageState` específico para cada entorno. Esto incluye cookies y `localStorage`, y adicionalmente `sessionStorage` se maneja manualmente.

### Paso 1: Ejecución de la Prueba de Autenticación

1. Ejecuta la prueba de autenticación para crear el archivo `storageState`:

   ```bash
   npm run test:dev -- auth/auth.spec.ts
   ```

   Esta prueba:
   - Navega a la página de login y completa el formulario de autenticación.
   - Guarda el estado de sesión en `./auth/storageState.dev.json` para el entorno `dev`.
   - Extrae `sessionStorage` para usarlo en pruebas futuras.

### Paso 2: Configuración de `storageState` en `playwright.config.ts`

Después de crear el archivo `storageState` para cada entorno, actualiza `playwright.config.ts` para que las pruebas autenticadas lo usen automáticamente.

```typescript
import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'local';
dotenv.config({ path: `.env.${env}` });

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.TIMEOUT || '30000'),
    headless: true,
    storageState: `./auth/storageState.${env}.json`, // Usa el estado de sesión guardado
  },
  retries: 2,
});
```

### Paso 3: Restaurar `sessionStorage` en las Pruebas

Dado que `sessionStorage` no se guarda automáticamente, se restaura manualmente en las pruebas autenticadas. Aquí tienes un ejemplo de cómo configurarlo:

```typescript
import { test, expect } from '@playwright/test';

let sessionData: string;

test('Log in and save session state', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/auth`);
    await page.fill('#username', 'Antenor');
    await page.fill('#password', 'tenoE18080561$');
    await page.click('#loginButton');
    await page.waitForURL(`${process.env.BASE_URL}/sidebar/my-space`);

    sessionData = await page.evaluate(() => JSON.stringify(sessionStorage));

    const env = process.env.NODE_ENV || 'local';
    await page.context().storageState({ path: `./auth/storageState.${env}.json` });
});

test.use({ storageState: './auth/storageState.dev.json' });

test('Prueba autenticada con sessionStorage restaurado', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/sidebar/my-space`);

    await page.evaluate((data) => {
        const sessionData = JSON.parse(data);
        for (const key in sessionData) {
            sessionStorage.setItem(key, sessionData[key]);
        }
    }, sessionData);

    const sessionValue = await page.evaluate(() => sessionStorage.getItem('someKey'));
    expect(sessionValue).toBe('expectedValue');
});
```

## Ejecución de Pruebas

### Comandos Básicos

- Ejecutar todas las pruebas en un entorno específico:
  ```bash
  npm run test:local        # Ejecuta en entorno local
  npm run test:dev          # Ejecuta en entorno de desarrollo
  npm run test:prod         # Ejecuta en entorno de producción
  ```

- Ejecutar pruebas de un archivo específico:
  ```bash
  npx playwright test auth/auth.spec.ts
  ```

- Ejecutar una prueba específica dentro de un archivo:
  ```bash
  npx playwright test auth/auth.spec.ts --grep "Nombre de la prueba"
  ```

### Comandos de Depuración

- Ejecutar en modo depuración (interactivo):
  ```bash
  npx playwright test auth/auth.spec.ts --debug
  ```

- Ejecutar en modo visual (sin headless):
  ```bash
  npx playwright test auth/auth.spec.ts --headed
  ```

- Capturar rastreo detallado (`trace`):
  ```bash
  npx playwright test auth/auth.spec.ts --trace on
  ```

  Para revisar el `trace`, usa:
  ```bash
  npx playwright show-trace trace.zip
  ```

### Comandos de Reportes

- Generar un reporte HTML:
  ```bash
  npx playwright test --reporter=html
  npm run test:dev -- auth/auth.spec.ts --reporter=html
  ```

  Abrir el reporte en el navegador:
  ```bash
  npx playwright show-report
  ```

- Generar un reporte JSON:
  ```bash
  npx playwright test --reporter=json
  ```

### Comandos para Control de Ejecución

- Ejecutar en paralelo con un número específico de hilos:
  ```bash
  npx playwright test --workers=4
  ```

- Deshabilitar ejecución en paralelo:
  ```bash
  npx playwright test --workers=1
  ```

- Reintentar fallos en las pruebas:
  ```bash
  npx playwright test --retries=3
  ```

### Filtrado de Pruebas

- Ejecutar pruebas que coincidan con una etiqueta:
  ```bash
  npx playwright test --grep "@auth"
  ```

- Excluir pruebas con una etiqueta:
  ```bash
  npx playwright test --grep-invert "@skip"
  ```

### Integración Continua (CI/CD)

- Ejecutar pruebas en modo headless en CI/CD:
  ```bash
  npx playwright test --config=playwright.config.ts --headless
  ```

- Exportar resultados en formato JUnit:
  ```bash
  npx playwright test --reporter=junit
  ```
