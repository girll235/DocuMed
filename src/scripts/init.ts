import { config } from 'dotenv';
import { resolve } from 'path';
import { initializeDatabase } from './initializeDatabase';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env') });

(async () => {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
})();