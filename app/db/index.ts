import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Make sure you have DATABASE_URL in your .env file
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema }); 