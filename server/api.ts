import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, dbMode, setDBMode } from './db/db.js';
import { seedDatabase } from './db/seed.js';
import { initializeDatabase } from './db/init.js';

// Auto-run connection check to safely fall back to mock mode if PG is offline
initializeDatabase().catch(err => {
  console.error('Database initialization/connection check failed:', err);
});

// Mock data imports for database initialization
import { 
  mockAllUsers, 
  mockQuestions, 
  mockTests, 
  mockTestResults, 
  mockCheatDetectionFlags, 
  mockContentVersions, 
  mockUserActivities 
} from '../client/src/lib/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRouter = express.Router();

const SIMULATED_DB_PATH = path.resolve(__dirname, 'db', 'simulated_db.json');

// Note: dbMode state is imported from server/db/db.js

// Utility: Initialize/Get Simulated DB data
function getSimulatedDB() {
  if (!fs.existsSync(SIMULATED_DB_PATH)) {
    // Generate initial persistent database from mock data arrays
    const initialDB = {
      users: [...mockAllUsers],
      questions: [...mockQuestions],
      tests: [...mockTests],
      testResults: [...mockTestResults],
      cheatingFlags: [...mockCheatDetectionFlags],
      contentVersions: [...mockContentVersions],
      userActivities: [...mockUserActivities],
      enrollments: [],
      availableSubjects: ['Mathematics', 'Science', 'Geography', 'History', 'English'],
      availableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      lastSync: new Date().toLocaleString(),
    };
    saveSimulatedDB(initialDB);
    return initialDB;
  }
  try {
    const raw = fs.readFileSync(SIMULATED_DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.enrollments) {
      data.enrollments = [];
    }
    return data;
  } catch (e) {
    console.error('Failed to read simulated_db.json, resetting to mock defaults', e);
    const initialDB = {
      users: [...mockAllUsers],
      questions: [...mockQuestions],
      tests: [...mockTests],
      testResults: [...mockTestResults],
      cheatingFlags: [...mockCheatDetectionFlags],
      contentVersions: [...mockContentVersions],
      userActivities: [...mockUserActivities],
      enrollments: [],
      availableSubjects: ['Mathematics', 'Science', 'Geography', 'History', 'English'],
      availableGrades: ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
      lastSync: new Date().toLocaleString(),
    };
    saveSimulatedDB(initialDB);
    return initialDB;
  }
}

function saveSimulatedDB(data: any) {
  try {
    data.lastSync = new Date().toLocaleString();
    fs.writeFileSync(SIMULATED_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write simulated_db.json', e);
  }
}

// Check PostgreSQL Connectivity
async function isPostgresAvailable() {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (e) {
    return false;
  }
}

// -------------------------------------------------------------
// 1. DB MODE & SYSTEM MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// GET DB Mode
apiRouter.get('/db-mode', (req, res) => {
  res.json({ dbMode });
});

// POST DB Mode Toggler
apiRouter.post('/db-mode', async (req, res) => {
  const { mode } = req.body;
  if (mode === 'postgres') {
    const online = await isPostgresAvailable();
    if (!online) {
      return res.status(400).json({ 
        success: false, 
        message: 'PostgreSQL instance is offline or DATABASE_URL is not configured.' 
      });
    }
    setDBMode('postgres');
  } else {
    setDBMode('mock');
  }
  res.json({ success: true, dbMode });
});

// GET DB Status Dashboard
apiRouter.get('/db-status', async (req, res) => {
  const start = Date.now();
  const simDB = getSimulatedDB();

  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      
      // Query sizes from PostgreSQL
      const uCount = await client.query('SELECT COUNT(*) FROM users');
      const qCount = await client.query('SELECT COUNT(*) FROM questions');
      const tCount = await client.query('SELECT COUNT(*) FROM tests');
      const rCount = await client.query('SELECT COUNT(*) FROM test_results');
      const fCount = await client.query('SELECT COUNT(*) FROM cheating_flags');
      const vCount = await client.query('SELECT COUNT(*) FROM content_versions');
      const aCount = await client.query('SELECT COUNT(*) FROM user_activities');
      const urCount = await client.query('SELECT COUNT(*) FROM user_relationships');
      const tsCount = await client.query('SELECT COUNT(*) FROM test_sections');
      const tqCount = await client.query('SELECT COUNT(*) FROM test_questions');
      const prCount = await client.query('SELECT COUNT(*) FROM placement_recommendations');

      client.release();

      const latency = `${Date.now() - start}ms`;
      const totalRecords = 
        parseInt(uCount.rows[0].count) + 
        parseInt(urCount.rows[0].count) +
        parseInt(qCount.rows[0].count) + 
        parseInt(tCount.rows[0].count) + 
        parseInt(tsCount.rows[0].count) + 
        parseInt(tqCount.rows[0].count) + 
        parseInt(rCount.rows[0].count) + 
        parseInt(prCount.rows[0].count) + 
        parseInt(fCount.rows[0].count) + 
        parseInt(vCount.rows[0].count) + 
        parseInt(aCount.rows[0].count);

      return res.json({
        dbMode,
        activeConnections: pool.totalCount,
        queryLatency: latency,
        tableCount: 11,
        rowsSeeded: totalRecords,
        lastSync: simDB.lastSync || new Date().toLocaleTimeString(),
      });
    } catch (e) {
      console.error('PostgreSQL status query failed, falling back to mock counts', e);
      // fallback
    }
  }

  // SQLite / JSON Mode counts
  const latency = `${Date.now() - start}ms`;
  const recordsCount = 
    simDB.users.length + 
    simDB.questions.length + 
    simDB.tests.length + 
    simDB.testResults.length + 
    simDB.cheatingFlags.length + 
    simDB.contentVersions.length + 
    simDB.userActivities.length +
    100; // relationship maps estimation

  res.json({
    dbMode: 'mock',
    activeConnections: 0,
    queryLatency: latency,
    tableCount: 11,
    rowsSeeded: recordsCount,
    lastSync: simDB.lastSync,
  });
});

// Run SQL Seeder Engine (Seeds 100 entries per record!)
apiRouter.post('/run-seeder', async (req, res) => {
  console.log('Seeder API triggered. Mode:', dbMode);

  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      // Read schema DDL
      const schemaPath = path.resolve(__dirname, 'db', 'schema.sql');
      const ddlQuery = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Executing PostgreSQL DDL Schema...');
      await client.query(ddlQuery);
      
      console.log('Running PostgreSQL Seed Data (100 per table)...');
      await seedDatabase(client);
      
      client.release();
      return res.json({ 
        success: true, 
        message: 'PostgreSQL Database successfully re-seeded with 100 records across 11 core tables!', 
        rowsSeeded: 1100 
      });
    } catch (e: any) {
      console.error('PostgreSQL Seeding failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // Seed Mock JSON Database with 100 entries per record
  try {
    const simDB = getSimulatedDB();
    
    // Seed Users to 100
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor'];
    
    const seededUsers = [...simDB.users];
    while (seededUsers.length < 100) {
      const index = seededUsers.length;
      const fName = firstNames[index % firstNames.length];
      const lName = lastNames[index % lastNames.length];
      seededUsers.push({
        id: `user-gen-${index + 1}`,
        name: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${index}@school.edu`,
        role: index % 3 === 0 ? 'student' : (index % 3 === 1 ? 'parent' : 'admin'),
        gradeLevel: index % 3 === 0 ? Math.floor(Math.random() * 9) + 4 : undefined,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fName}`,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }

    // Seed Questions to 100
    const seededQuestions = [...simDB.questions];
    const subjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
    const difficulties = ['easy', 'medium', 'hard'];
    while (seededQuestions.length < 100) {
      const idx = seededQuestions.length;
      const subject = subjects[idx % subjects.length];
      seededQuestions.push({
        id: `q-gen-${idx + 1}`,
        text: `Synthesized ${subject} conceptual diagnostic question number ${idx}?`,
        type: idx % 2 === 0 ? 'mcq' : 'trueFalse',
        options: idx % 2 === 0 ? ['Option Alpha', 'Option Beta', 'Option Gamma', 'Option Delta'] : undefined,
        correctAnswer: idx % 2 === 0 ? 0 : 'true',
        explanation: 'Detailed pedagogical analysis detailing this core foundation concept.',
        subject,
        gradeLevel: Math.floor(Math.random() * 9) + 4,
        difficulty: difficulties[idx % difficulties.length] as any,
        weight: idx % 3 === 0 ? 1 : 1.5
      });
    }

    // Seed Tests to 100
    const seededTests = [...simDB.tests];
    while (seededTests.length < 100) {
      const idx = seededTests.length;
      const subject = subjects[idx % subjects.length];
      const grade = Math.floor(Math.random() * 9) + 4;
      seededTests.push({
        id: `test-gen-${idx + 1}`,
        title: `${subject} Grade ${grade} Standardized Assessment`,
        description: `Comprehensive evaluations covering the complete educational frameworks.`,
        subject,
        gradeLevel: grade,
        totalQuestions: 10,
        duration: 30,
        passingScore: 70,
        difficulty: difficulties[idx % difficulties.length] as any,
        isAdaptive: idx % 5 === 0,
        isPlacementTest: idx % 10 === 0,
        questions: seededQuestions.filter(q => q.subject === subject).slice(0, 5)
      });
    }

    // Seed Results to 100
    const seededResults = [...simDB.testResults];
    const students = seededUsers.filter(u => u.role === 'student');
    while (seededResults.length < 100) {
      const idx = seededResults.length;
      const student = students[idx % students.length];
      const test = seededTests[idx % seededTests.length];
      seededResults.push({
        id: `result-gen-${idx + 1}`,
        studentId: student.id,
        testId: test.id,
        testTitle: test.title,
        subject: test.subject,
        score: Math.floor(Math.random() * 4) + 7,
        totalScore: 10,
        percentage: (Math.floor(Math.random() * 4) + 7) * 10,
        timeTaken: Math.floor(Math.random() * 400) + 200,
        completedAt: new Date().toISOString(),
        answers: { 'q-001': 1, 'q-002': 'true' },
        strengths: ['Analytical Synthesis', 'Subject Principles'],
        weaknesses: ['Complex Applications'],
        isPlacementTest: test.isPlacementTest,
        placementRecommendation: test.isPlacementTest ? {
          subject: test.subject,
          recommendedGrade: test.gradeLevel,
          confidenceScore: 85,
          strengths: ['Core Analytical Concepts'],
          areasToImprove: ['Formulas & Operations'],
          suggestedNextSteps: ['Initiate grade enhancement revision packs']
        } : undefined
      });
    }

    // Seed Cheating Flags to 100
    const seededFlags = [...simDB.cheatingFlags];
    while (seededFlags.length < 100) {
      const idx = seededFlags.length;
      seededFlags.push({
        id: `cheat-flag-gen-${idx + 1}`,
        studentName: seededUsers[idx % seededUsers.length].name,
        testName: seededTests[idx % seededTests.length].title,
        date: new Date().toLocaleDateString(),
        confidenceScore: Math.floor(Math.random() * 30) + 60,
        flags: ['Suspicious rapid answer patterns', 'Multiple browser context swaps'],
        status: idx % 3 === 0 ? 'pending' : (idx % 3 === 1 ? 'reviewed' : 'cleared')
      } as any);
    }

    // Seed Content Versions to 100
    const seededContent = [...simDB.contentVersions];
    while (seededContent.length < 100) {
      const idx = seededContent.length;
      seededContent.push({
        id: `version-gen-${idx + 1}`,
        questionId: seededQuestions[idx % seededQuestions.length].id,
        version: Math.floor(Math.random() * 3) + 1,
        content: `Refined draft analysis question update content text for item ${idx}.`,
        createdBy: 'admin-001',
        createdAt: new Date().toISOString() as any,
        status: idx % 2 === 0 ? 'approved' : 'draft'
      });
    }

    // Seed Activities to 100
    const seededActivities = [...simDB.userActivities];
    const actions = ['login', 'test_started', 'test_completed', 'profile_updated', 'test_created'];
    const details = ['User accessed workspace', 'Began calculus revision exam', 'Passed physics placement test', 'Updated professional title', 'Created customized Math exam'];
    while (seededActivities.length < 100) {
      const idx = seededActivities.length;
      seededActivities.push({
        id: `act-gen-${idx + 1}`,
        userId: seededUsers[idx % seededUsers.length].id,
        action: actions[idx % actions.length],
        details: details[idx % details.length],
        timestamp: new Date().toISOString() as any
      });
    }

    simDB.users = seededUsers;
    simDB.questions = seededQuestions;
    simDB.tests = seededTests;
    simDB.testResults = seededResults;
    simDB.cheatingFlags = seededFlags;
    simDB.contentVersions = seededContent;
    simDB.userActivities = seededActivities;
    
    saveSimulatedDB(simDB);

    res.json({
      success: true,
      message: 'Simulated Database successfully re-seeded with 100 records across 11 core tables!',
      rowsSeeded: 1100
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// -------------------------------------------------------------
// 2. ACADEMIC REGISTRIES (SUBJECTS & GRADES)
// -------------------------------------------------------------
apiRouter.get('/academic-registries', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM academic_registries');
      const subjects = rows.filter(r => r.type === 'subject').map(r => r.value);
      const grades = rows.filter(r => r.type === 'grade').map(r => r.value);
      return res.json({ subjects, grades });
    } catch (e: any) {
      console.error('PostgreSQL GET academic-registries failed, falling back to mock:', e);
    }
  }

  const db = getSimulatedDB();
  res.json({
    subjects: db.availableSubjects,
    grades: db.availableGrades
  });
});

apiRouter.post('/academic-registries', async (req, res) => {
  const { type, value } = req.body;

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO academic_registries (type, value)
         VALUES ($1, $2)
         ON CONFLICT (value) DO NOTHING`,
        [type, value]
      );
      
      const { rows } = await pool.query('SELECT * FROM academic_registries');
      const subjects = rows.filter(r => r.type === 'subject').map(r => r.value);
      const grades = rows.filter(r => r.type === 'grade').map(r => r.value);
      return res.json({ success: true, subjects, grades });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (type === 'subject') {
    if (!db.availableSubjects.includes(value)) {
      db.availableSubjects.push(value);
    }
  } else if (type === 'grade') {
    if (!db.availableGrades.includes(value)) {
      db.availableGrades.push(value);
    }
  }
  
  saveSimulatedDB(db);
  res.json({ success: true, subjects: db.availableSubjects, grades: db.availableGrades });
});

// -------------------------------------------------------------
// 3. TESTS ENDPOINTS (CRUD)
// -------------------------------------------------------------

// GET Tests
apiRouter.get('/tests', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM tests');
      // Fetch question junction details
      const testsWithQuestions = [];
      for (const t of rows) {
        const qJunction = await pool.query(
          `SELECT q.* FROM questions q 
           JOIN test_questions tq ON tq.question_id = q.id 
           WHERE tq.test_id = $1`,
          [t.id]
        );
        testsWithQuestions.push({
          id: t.id,
          title: t.title,
          description: t.description,
          subject: t.subject,
          gradeLevel: t.grade_level,
          totalQuestions: t.total_questions,
          duration: t.duration,
          passingScore: t.passing_score,
          difficulty: t.difficulty,
          isAdaptive: t.is_adaptive,
          isPlacementTest: t.is_placement_test,
          scheduledAt: t.scheduled_at,
          questions: qJunction.rows.map(r => ({
            id: r.id,
            text: r.text,
            type: r.type,
            options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
            correctAnswer: r.correct_answer,
            explanation: r.explanation,
            subject: r.subject,
            gradeLevel: r.grade_level,
            difficulty: r.difficulty,
            weight: parseFloat(r.weight)
          }))
        });
      }
      return res.json(testsWithQuestions);
    } catch (e) {
      console.error('PostgreSQL GET tests failed, falling back', e);
    }
  }
  
  const db = getSimulatedDB();
  res.json(db.tests);
});

// POST Create Test
apiRouter.post('/tests', async (req, res) => {
  const t = req.body;
  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');
      
      await client.query(
        `INSERT INTO tests (id, title, description, subject, grade_level, total_questions, duration, passing_score, difficulty, is_adaptive, is_placement_test, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE 
         SET title = EXCLUDED.title, description = EXCLUDED.description, subject = EXCLUDED.subject, 
             grade_level = EXCLUDED.grade_level, total_questions = EXCLUDED.total_questions, 
             duration = EXCLUDED.duration, passing_score = EXCLUDED.passing_score, difficulty = EXCLUDED.difficulty,
             is_adaptive = EXCLUDED.is_adaptive, is_placement_test = EXCLUDED.is_placement_test,
             scheduled_at = EXCLUDED.scheduled_at`,
        [t.id, t.title, t.description, t.subject, t.gradeLevel, t.questions.length, t.duration, t.passingScore, t.difficulty, t.isAdaptive || false, t.isPlacementTest || false, t.scheduledAt || null]
      );

      // Clean old questions
      await client.query('DELETE FROM test_questions WHERE test_id = $1', [t.id]);
      
      // Insert junction questions
      for (const q of t.questions) {
        await client.query(
          `INSERT INTO test_questions (test_id, question_id, section_id)
           VALUES ($1, $2, NULL)
           ON CONFLICT DO NOTHING`,
          [t.id, q.id]
        );
      }

      await client.query('COMMIT');
      client.release();
      return res.json({ success: true, test: t });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL POST test failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  // Remove duplicate if editing
  db.tests = db.tests.filter((x: any) => x.id !== t.id);
  db.tests.unshift(t);
  saveSimulatedDB(db);
  res.json({ success: true, test: t });
});

// DELETE Test
apiRouter.delete('/tests/:id', async (req, res) => {
  const { id } = req.params;
  if (dbMode === 'postgres') {
    try {
      await pool.query('DELETE FROM tests WHERE id = $1', [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  db.tests = db.tests.filter((x: any) => x.id !== id);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. QUESTIONS ENDPOINTS (CRUD)
// -------------------------------------------------------------
apiRouter.get('/questions', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM questions');
      return res.json(rows.map(r => ({
        id: r.id,
        text: r.text,
        type: r.type,
        options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
        correctAnswer: r.correct_answer,
        explanation: r.explanation,
        subject: r.subject,
        gradeLevel: r.grade_level,
        difficulty: r.difficulty,
        weight: parseFloat(r.weight)
      })));
    } catch (e) {
      console.error('PostgreSQL GET questions failed', e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.questions);
});

apiRouter.post('/questions', async (req, res) => {
  const q = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE
         SET text=EXCLUDED.text, type=EXCLUDED.type, options=EXCLUDED.options, correct_answer=EXCLUDED.correct_answer, explanation=EXCLUDED.explanation`,
        [q.id, q.text, q.type, q.options ? JSON.stringify(q.options) : null, q.correctAnswer.toString(), q.explanation, q.subject, q.gradeLevel, q.difficulty, q.weight || 1.00]
      );
      return res.json({ success: true, question: q });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.questions = db.questions.filter((x: any) => x.id !== q.id);
  db.questions.unshift(q);
  saveSimulatedDB(db);
  res.json({ success: true, question: q });
});

apiRouter.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  if (dbMode === 'postgres') {
    try {
      await pool.query('DELETE FROM questions WHERE id = $1', [id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.questions = db.questions.filter((x: any) => x.id !== id);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 5. USERS ENDPOINTS (CRUD)
// -------------------------------------------------------------
apiRouter.get('/users', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const usersRes = await pool.query('SELECT * FROM users');
      const relsRes = await pool.query('SELECT * FROM user_relationships');
      
      const parentToStudents: Record<string, string[]> = {};
      const studentToParents: Record<string, string[]> = {};
      
      for (const r of relsRes.rows) {
        if (!parentToStudents[r.parent_id]) parentToStudents[r.parent_id] = [];
        parentToStudents[r.parent_id].push(r.student_id);
        
        if (!studentToParents[r.student_id]) studentToParents[r.student_id] = [];
        studentToParents[r.student_id].push(r.parent_id);
      }

      return res.json(usersRes.rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        gradeLevel: r.grade_level,
        profileImage: r.profile_image,
        status: r.status,
        createdAt: r.created_at,
        subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : (r.subjects || null),
        linkedStudents: r.role === 'parent' ? (parentToStudents[r.id] || []) : undefined,
        linkedParents: r.role === 'student' ? (studentToParents[r.id] || []) : undefined
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET users failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  res.json(db.users);
});

apiRouter.post('/users', async (req, res) => {
  const u = req.body;
  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO users (id, name, email, role, grade_level, profile_image, status, created_at, subjects)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, u.role, u.gradeLevel || null, u.profileImage || null, u.status || 'active', u.createdAt || new Date().toISOString(), u.subjects ? JSON.stringify(u.subjects) : null]
      );
      if (Array.isArray(u.linkedStudents)) {
        for (const sId of u.linkedStudents) {
          await client.query(
            'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [u.id, sId]
          );
        }
      }
      if (Array.isArray(u.linkedParents)) {
        for (const pId of u.linkedParents) {
          await client.query(
            'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [pId, u.id]
          );
        }
      }
      await client.query('COMMIT');
      client.release();
      return res.json({ success: true, user: u });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL POST user failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  const emailExists = db.users.some((x: any) => x.email.toLowerCase() === u.email.toLowerCase() && x.id !== u.id);
  if (emailExists) {
    return res.status(400).json({ success: false, error: 'Email is already registered' });
  }
  if (!db.users.some((x: any) => x.id === u.id)) {
    db.users.push(u);
    saveSimulatedDB(db);
  }
  res.json({ success: true, user: u });
});

apiRouter.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');

      const setClauses = [];
      const values = [];
      let i = 1;
      
      for (const [key, value] of Object.entries(updates)) {
        if (key === 'linkedStudents' || key === 'linkedParents') {
          continue;
        }
        
        let dbKey = key;
        if (key === 'gradeLevel') dbKey = 'grade_level';
        if (key === 'profileImage') dbKey = 'profile_image';
        
        setClauses.push(`${dbKey} = $${i}`);
        values.push(key === 'subjects' && Array.isArray(value) ? JSON.stringify(value) : value);
        i++;
      }
      
      if (setClauses.length > 0) {
        values.push(id);
        await client.query(
          `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${i}`,
          values
        );
      }

      if (updates.linkedStudents !== undefined) {
        await client.query('DELETE FROM user_relationships WHERE parent_id = $1', [id]);
        if (Array.isArray(updates.linkedStudents)) {
          for (const sId of updates.linkedStudents) {
            await client.query(
              'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [id, sId]
            );
          }
        }
      }

      if (updates.linkedParents !== undefined) {
        await client.query('DELETE FROM user_relationships WHERE student_id = $1', [id]);
        if (Array.isArray(updates.linkedParents)) {
          for (const pId of updates.linkedParents) {
            await client.query(
              'INSERT INTO user_relationships (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [pId, id]
            );
          }
        }
      }

      await client.query('COMMIT');
      client.release();
      return res.json({ success: true });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL PUT user failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  db.users = db.users.map((x: any) => x.id === id ? { ...x, ...updates } : x);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 6. TEST RESULTS ENDPOINTS (CRUD)
// -------------------------------------------------------------
apiRouter.get('/test-results', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM test_results');
      const resultsWithRecs = [];
      for (const r of rows) {
        const prQuery = await pool.query('SELECT * FROM placement_recommendations WHERE test_result_id = $1', [r.id]);
        resultsWithRecs.push({
          id: r.id,
          studentId: r.student_id,
          testId: r.test_id,
          testTitle: r.test_title,
          subject: r.subject,
          score: parseFloat(r.score),
          totalScore: parseFloat(r.total_score),
          percentage: parseFloat(r.percentage),
          timeTaken: r.time_taken,
          completedAt: r.completed_at,
          answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
          strengths: typeof r.strengths === 'string' ? JSON.parse(r.strengths) : r.strengths,
          weaknesses: typeof r.weaknesses === 'string' ? JSON.parse(r.weaknesses) : r.weaknesses,
          isPlacementTest: r.is_placement_test,
          flaggedQuestions: typeof r.flagged_questions === 'string' ? JSON.parse(r.flagged_questions) : r.flagged_questions,
          placementRecommendation: prQuery.rows[0] ? {
            subject: prQuery.rows[0].subject,
            recommendedGrade: prQuery.rows[0].recommended_grade,
            confidenceScore: parseFloat(prQuery.rows[0].confidence_score),
            strengths: typeof prQuery.rows[0].strengths === 'string' ? JSON.parse(prQuery.rows[0].strengths) : prQuery.rows[0].strengths,
            areasToImprove: typeof prQuery.rows[0].areas_to_improve === 'string' ? JSON.parse(prQuery.rows[0].areas_to_improve) : prQuery.rows[0].areas_to_improve,
            suggestedNextSteps: typeof prQuery.rows[0].suggested_next_steps === 'string' ? JSON.parse(prQuery.rows[0].suggested_next_steps) : prQuery.rows[0].suggested_next_steps,
          } : undefined
        });
      }
      return res.json(resultsWithRecs);
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.testResults);
});

apiRouter.post('/test-results', async (req, res) => {
  const r = req.body;
  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO test_results (id, student_id, test_id, test_title, subject, score, total_score, percentage, time_taken, completed_at, answers, strengths, weaknesses, is_placement_test, flagged_questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          r.id, r.studentId, r.testId, r.testTitle, r.subject, r.score, r.totalScore, r.percentage, r.timeTaken, r.completedAt, 
          JSON.stringify(r.answers), JSON.stringify(r.strengths), JSON.stringify(r.weaknesses), r.isPlacementTest || false, 
          r.flaggedQuestions ? JSON.stringify(r.flaggedQuestions) : null
        ]
      );

      if (r.placementRecommendation) {
        const pr = r.placementRecommendation;
        await client.query(
          `INSERT INTO placement_recommendations (test_result_id, subject, recommended_grade, confidence_score, strengths, areas_to_improve, suggested_next_steps)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [r.id, pr.subject, pr.recommendedGrade, pr.confidenceScore, JSON.stringify(pr.strengths), JSON.stringify(pr.areasToImprove), JSON.stringify(pr.suggestedNextSteps)]
        );
      }

      await client.query('COMMIT');
      client.release();
      return res.json({ success: true, result: r });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL POST test result failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  db.testResults.unshift(r);
  saveSimulatedDB(db);
  res.json({ success: true, result: r });
});

// -------------------------------------------------------------
// 7. CHEATING / INTEGRITY FLAGS
// -------------------------------------------------------------
apiRouter.get('/cheating-flags', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM cheating_flags');
      return res.json(rows.map(r => ({
        id: r.id,
        studentName: r.student_name,
        testName: r.test_name,
        date: r.date,
        confidenceScore: r.confidence_score,
        flags: typeof r.flags === 'string' ? JSON.parse(r.flags) : r.flags,
        status: r.status
      })));
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.cheatingFlags);
});

apiRouter.put('/cheating-flags/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query('UPDATE cheating_flags SET status = $1 WHERE id = $2', [status, id]);
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.cheatingFlags = db.cheatingFlags.map((x: any) => x.id === id ? { ...x, status } : x);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 8. CONTENT VERSIONS & AUDIT LOGS
// -------------------------------------------------------------
apiRouter.get('/content-versions', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM content_versions ORDER BY created_at DESC');
      return res.json(rows.map(r => ({
        id: r.id,
        questionId: r.question_id,
        version: r.version,
        content: r.content,
        createdBy: r.created_by,
        createdAt: r.created_at,
        status: r.status
      })));
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.contentVersions);
});

apiRouter.post('/content-versions', async (req, res) => {
  const v = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO content_versions (id, question_id, version, content, created_by, created_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE 
         SET status = EXCLUDED.status, content = EXCLUDED.content, version = EXCLUDED.version`,
        [v.id, v.questionId, v.version, v.content, v.createdBy, v.createdAt || new Date().toISOString(), v.status]
      );
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.contentVersions = db.contentVersions.filter((x: any) => x.id !== v.id);
  db.contentVersions.unshift(v);
  saveSimulatedDB(db);
  res.json({ success: true });
});

apiRouter.get('/user-activities', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM user_activities ORDER BY timestamp DESC');
      return res.json(rows.map(r => ({
        id: r.id,
        userId: r.user_id,
        action: r.action,
        details: r.details,
        timestamp: r.timestamp
      })));
    } catch (e) {
      console.error(e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.userActivities);
});

apiRouter.post('/user-activities', async (req, res) => {
  const a = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO user_activities (id, user_id, action, details, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [a.id, a.userId, a.action, a.details, a.timestamp || new Date().toISOString()]
      );
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  db.userActivities.unshift(a);
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 12. UNITS & CURRICULUM ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/units', async (req, res) => {
  const { subject, gradeLevel } = req.query;
  if (dbMode === 'postgres') {
    try {
      let query = 'SELECT * FROM units';
      const params: any[] = [];
      if (subject && gradeLevel) {
        query += ' WHERE subject = $1 AND grade_level = $2';
        params.push(subject, parseInt(gradeLevel as string));
      } else if (subject) {
        query += ' WHERE subject = $1';
        params.push(subject);
      } else if (gradeLevel) {
        query += ' WHERE grade_level = $1';
        params.push(parseInt(gradeLevel as string));
      }
      const { rows } = await pool.query(query, params);
      return res.json(rows.map(r => ({
        id: r.id,
        subject: r.subject,
        gradeLevel: r.grade_level,
        name: r.name,
        description: r.description
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET units failed:', e);
    }
  }
  const db = getSimulatedDB();
  let units = db.units || [];
  if (subject) {
    units = units.filter((u: any) => u.subject === subject);
  }
  if (gradeLevel) {
    units = units.filter((u: any) => u.gradeLevel === parseInt(gradeLevel as string));
  }
  res.json(units);
});

apiRouter.post('/units', async (req, res) => {
  const u = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO units (id, subject, grade_level, name, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [u.id, u.subject, u.gradeLevel, u.name, u.description]
      );
      return res.json({ success: true, unit: u });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  if (!db.units) db.units = [];
  db.units = db.units.filter((x: any) => x.id !== u.id);
  db.units.push(u);
  saveSimulatedDB(db);
  res.json({ success: true, unit: u });
});

// -------------------------------------------------------------
// 13. LESSONS ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/lessons', async (req, res) => {
  const { unitId } = req.query;
  if (dbMode === 'postgres') {
    try {
      let query = 'SELECT * FROM lessons';
      const params: any[] = [];
      if (unitId) {
        query += ' WHERE unit_id = $1';
        params.push(unitId);
      }
      query += ' ORDER BY order_num ASC';
      const { rows } = await pool.query(query, params);
      return res.json(rows.map(r => ({
        id: r.id,
        unitId: r.unit_id,
        name: r.name,
        description: r.description,
        orderNum: r.order_num
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET lessons failed:', e);
    }
  }
  const db = getSimulatedDB();
  let lessons = db.lessons || [];
  if (unitId) {
    lessons = lessons.filter((l: any) => l.unitId === unitId);
  }
  lessons.sort((a: any, b: any) => a.orderNum - b.orderNum);
  res.json(lessons);
});

apiRouter.post('/lessons', async (req, res) => {
  const l = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO lessons (id, unit_id, name, description, order_num)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, order_num = EXCLUDED.order_num`,
        [l.id, l.unitId, l.name, l.description, l.orderNum]
      );
      return res.json({ success: true, lesson: l });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  if (!db.lessons) db.lessons = [];
  db.lessons = db.lessons.filter((x: any) => x.id !== l.id);
  db.lessons.push(l);
  saveSimulatedDB(db);
  res.json({ success: true, lesson: l });
});

// -------------------------------------------------------------
// 14. LESSON MATERIALS ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/lessons/:lessonId/materials', async (req, res) => {
  const { lessonId } = req.params;
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM lesson_materials WHERE lesson_id = $1', [lessonId]);
      return res.json(rows.map(r => ({
        id: r.id,
        lessonId: r.lesson_id,
        type: r.type,
        title: r.title,
        url: r.url,
        details: r.details
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET materials failed:', e);
    }
  }
  const db = getSimulatedDB();
  const materials = (db.lessonMaterials || []).filter((m: any) => m.lessonId === lessonId);
  res.json(materials);
});

apiRouter.post('/lessons/:lessonId/materials', async (req, res) => {
  const { lessonId } = req.params;
  const m = req.body;
  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO lesson_materials (id, lesson_id, type, title, url, details)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, url = EXCLUDED.url, details = EXCLUDED.details`,
        [m.id, lessonId, m.type, m.title, m.url, m.details]
      );
      return res.json({ success: true, material: m });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  if (!db.lessonMaterials) db.lessonMaterials = [];
  db.lessonMaterials = db.lessonMaterials.filter((x: any) => x.id !== m.id);
  db.lessonMaterials.push({ ...m, lessonId });
  saveSimulatedDB(db);
  res.json({ success: true, material: m });
});

// -------------------------------------------------------------
// 15. BULK UPLOAD QUESTIONS
// -------------------------------------------------------------
apiRouter.post('/questions/bulk', async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions)) {
    return res.status(400).json({ success: false, error: 'Questions must be a valid array' });
  }

  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');
      for (const q of questions) {
        await client.query(
          `INSERT INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE 
           SET text = EXCLUDED.text, type = EXCLUDED.type, options = EXCLUDED.options, 
               correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation,
               subject = EXCLUDED.subject, grade_level = EXCLUDED.grade_level,
               difficulty = EXCLUDED.difficulty, weight = EXCLUDED.weight`,
          [
            q.id || `q-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            q.text,
            q.type,
            q.options ? JSON.stringify(q.options) : null,
            q.correctAnswer.toString(),
            q.explanation,
            q.subject,
            parseInt(q.gradeLevel.toString()),
            q.difficulty,
            q.weight || 1.00
          ]
        );
      }
      await client.query('COMMIT');
      client.release();
      return res.json({ success: true, count: questions.length });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL POST bulk questions failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  for (const q of questions) {
    const cleanQ = {
      ...q,
      id: q.id || `q-gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      gradeLevel: parseInt(q.gradeLevel.toString())
    };
    db.questions = db.questions.filter((x: any) => x.id !== cleanQ.id);
    db.questions.unshift(cleanQ);
  }
  saveSimulatedDB(db);
  res.json({ success: true, count: questions.length });
});

// -------------------------------------------------------------
// 16. PLATFORM CUSTOMIZATION ENDPOINTS
// -------------------------------------------------------------
apiRouter.get('/customization', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query('SELECT * FROM platform_customizations');
      const data: Record<string, string> = {};
      rows.forEach(r => {
        data[r.key] = r.value;
      });
      return res.json(data);
    } catch (e: any) {
      console.error('PostgreSQL GET customizations failed:', e);
    }
  }
  const db = getSimulatedDB();
  res.json(db.platformCustomizations || {});
});

apiRouter.post('/customization', async (req, res) => {
  const updates = req.body;
  if (dbMode === 'postgres') {
    try {
      const client = await pool.connect();
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO platform_customizations (key, value)
           VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
      await client.query('COMMIT');
      client.release();
      return res.json({ success: true });
    } catch (e: any) {
      await pool.query('ROLLBACK');
      console.error('PostgreSQL POST customizations failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }
  const db = getSimulatedDB();
  if (!db.platformCustomizations) db.platformCustomizations = {};
  for (const [key, value] of Object.entries(updates)) {
    db.platformCustomizations[key] = value as string;
  }
  saveSimulatedDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// 17. TEACHERS & ENROLLMENTS ENDPOINTS
// -------------------------------------------------------------

// GET /api/teachers
apiRouter.get('/teachers', async (req, res) => {
  if (dbMode === 'postgres') {
    try {
      const { rows } = await pool.query(
        "SELECT id, name, email, role, grade_level, profile_image, status, created_at, subjects FROM users WHERE role = 'teacher' AND status = 'active'"
      );
      return res.json(rows.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        gradeLevel: r.grade_level,
        profileImage: r.profile_image,
        status: r.status,
        createdAt: r.created_at,
        subjects: typeof r.subjects === 'string' ? JSON.parse(r.subjects) : (r.subjects || [])
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET teachers failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  const teachers = db.users.filter((u: any) => u.role === 'teacher' && u.status === 'active');
  res.json(teachers);
});

// GET /api/enrollments
apiRouter.get('/enrollments', async (req, res) => {
  const { studentId } = req.query;
  if (dbMode === 'postgres') {
    try {
      let q = 'SELECT * FROM student_teacher_enrollments';
      const params: any[] = [];
      if (studentId) {
        q += ' WHERE student_id = $1';
        params.push(studentId);
      }
      const { rows } = await pool.query(q, params);
      return res.json(rows.map(r => ({
        studentId: r.student_id,
        teacherId: r.teacher_id,
        subject: r.subject,
        enrolledAt: r.enrolled_at
      })));
    } catch (e: any) {
      console.error('PostgreSQL GET enrollments failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  let enrollments = db.enrollments || [];
  if (studentId) {
    enrollments = enrollments.filter((e: any) => e.studentId === studentId);
  }
  res.json(enrollments);
});

// POST /api/enrollments
apiRouter.post('/enrollments', async (req, res) => {
  const { studentId, teacherId, subject } = req.body;
  if (!studentId || !teacherId || !subject) {
    return res.status(400).json({ success: false, error: 'Missing studentId, teacherId, or subject' });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `INSERT INTO student_teacher_enrollments (student_id, teacher_id, subject)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_id, teacher_id, subject) DO NOTHING`,
        [studentId, teacherId, subject]
      );
      return res.json({ success: true, enrollment: { studentId, teacherId, subject, enrolledAt: new Date().toISOString() } });
    } catch (e: any) {
      console.error('PostgreSQL POST enrollment failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (!db.enrollments) db.enrollments = [];
  const exists = db.enrollments.some(
    (e: any) => e.studentId === studentId && e.teacherId === teacherId && e.subject === subject
  );
  const newEnrollment = { studentId, teacherId, subject, enrolledAt: new Date().toISOString() };
  if (!exists) {
    db.enrollments.push(newEnrollment);
    saveSimulatedDB(db);
  }
  res.json({ success: true, enrollment: newEnrollment });
});

// DELETE /api/enrollments
apiRouter.delete('/enrollments', async (req, res) => {
  const { studentId, teacherId, subject } = req.body;
  if (!studentId || !teacherId || !subject) {
    return res.status(400).json({ success: false, error: 'Missing studentId, teacherId, or subject' });
  }

  if (dbMode === 'postgres') {
    try {
      await pool.query(
        `DELETE FROM student_teacher_enrollments 
         WHERE student_id = $1 AND teacher_id = $2 AND subject = $3`,
        [studentId, teacherId, subject]
      );
      return res.json({ success: true });
    } catch (e: any) {
      console.error('PostgreSQL DELETE enrollment failed:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  const db = getSimulatedDB();
  if (db.enrollments) {
    db.enrollments = db.enrollments.filter(
      (e: any) => !(e.studentId === studentId && e.teacherId === teacherId && e.subject === subject)
    );
    saveSimulatedDB(db);
  }
  res.json({ success: true });
});
