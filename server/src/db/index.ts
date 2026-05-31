import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import * as schema from './schema';

config();

// Create MySQL connection pool
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  multipleStatements: true,
});

// Create Drizzle instance
export const db = drizzle(connection, { schema, mode: 'default' });

// Export schema for use in other modules
export * from './schema';

// Export for use in other modules
export { connection };
