import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'local';
dotenv.config({ path: `.env.${env}` });

export default defineConfig({
    timeout: parseInt(process.env.TIMEOUT || '30000'),  // Configuración global de tiempo de espera para cada prueba
    use: {
      baseURL: process.env.BASE_URL || 'http://localhost:3000',
      headless: false,
      storageState: `./auth/storageState.${env}.json`,
    },
    retries: 1,
});
