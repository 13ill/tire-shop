import { config } from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
config();

async function runMigrations() {
  try {
    console.log('🔄 Starting database migrations...');

    // Use drizzle-kit to run migrations
    execSync('npx drizzle-kit push:mysql', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('✅ Migrations completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
runMigrations();

export default runMigrations;
