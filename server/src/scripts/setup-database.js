import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // Read SQL file
    const sqlFile = path.join(__dirname, '../db/migrations/0000_quiet_rocket_raccoon.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL by statement breakpoints
    const statements = sql.split('--> statement-breakpoint').filter(s => s.trim());

    // Create connection without database
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: ''
    });

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS tire_shop_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.changeUser({ database: 'tire_shop_pos' });

    console.log('✅ Database created');

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log('✅ Tables created successfully');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
