import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, setDBMode } from './db.js';
import { seedDatabase } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) return;
  isInitialized = true;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('ℹ️ No DATABASE_URL configured. Skipping PostgreSQL initialization.');
    return;
  }

  console.log('🔌 Checking PostgreSQL Database connection...');
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connection to PostgreSQL established successfully!');

    // Check if the schema tables exist by checking if 'users' table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const res = await client.query(checkTableQuery);
    const tablesExist = res.rows[0].exists;

    if (!tablesExist) {
      console.log('📂 Users table does not exist. Initializing schema tables...');
      
      // Read schema file
      const schemaPath = path.resolve(__dirname, 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`schema.sql not found at path: ${schemaPath}`);
      }
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');

      // Execute SQL schema
      console.log('Running DDL transactions...');
      await client.query(schemaSql);
      console.log('✅ Database schema tables created successfully.');

      // Run seeding
      console.log('Running data seeder...');
      await seedDatabase(client);
      console.log('🎉 PostgreSQL Database fully initialized and seeded!');
    } else {
      console.log('ℹ️ PostgreSQL database tables are already initialized. Skipping schema setup.');
      
      // Ensure student_teacher_enrollments table exists
      const checkEnrollmentsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'student_teacher_enrollments'
        );
      `;
      const enrollmentsRes = await client.query(checkEnrollmentsQuery);
      if (!enrollmentsRes.rows[0].exists) {
        console.log('📂 student_teacher_enrollments table does not exist. Creating it...');
        await client.query(`
          CREATE TABLE student_teacher_enrollments (
              student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
              teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
              subject VARCHAR(255) NOT NULL,
              enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
              PRIMARY KEY (student_id, teacher_id, subject)
          );
          CREATE INDEX idx_ste_student ON student_teacher_enrollments(student_id);
        `);
        console.log('✅ student_teacher_enrollments table created.');
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to or initialize PostgreSQL database:', error.message);
    console.warn('⚠️ Switching system driver back to simulated SQLite Local Mode for safety!');
    setDBMode('mock');
  } finally {
    if (client) {
      client.release();
    }
  }
}
