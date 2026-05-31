import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'mysql2',
  dbCredentials: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'tire_shop_pos',
  },
  verbose: true,
  strict: true,
} satisfies Config;
