import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  console.log('🚀 Initializing PostgreSQL Database Setup...');
  
  const client = await pool.connect();
  try {
    // 1. Read DDL schema file
    console.log('Reading schema.sql...');
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const ddlQuery = fs.readFileSync(schemaPath, 'utf8');

    // 2. Execute DDL queries
    console.log('Executing schema initialization...');
    await client.query(ddlQuery);
    console.log('✅ Database schema initialized successfully!');

    // 3. Run seeding
    await seedDatabase(client);
    
    console.log('🎉 Setup completed successfully without errors.');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);
