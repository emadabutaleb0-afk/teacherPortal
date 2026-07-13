import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('Warning: DATABASE_URL environment variable is not defined. Database operations may fail.');
}

export const pool = new Pool({
  connectionString,
});

// Prevent background connection errors from causing unhandled process crashes
pool.on('error', (err) => {
  console.error('Unexpected database connection pool error:', err.message);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Database driver mode state
export let dbMode: 'mock' | 'postgres' = connectionString ? 'postgres' : 'mock';

export function setDBMode(mode: 'mock' | 'postgres') {
  dbMode = mode;
}
