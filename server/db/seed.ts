import pg from 'pg';
import { 
  mockAllUsers, 
  mockQuestions, 
  mockTests, 
  mockTestResults, 
  mockContentVersions, 
  mockUserActivities,
  mockCheatDetectionFlags
} from '../../client/src/lib/mockData.js';

export async function seedDatabase(client: pg.PoolClient) {
  console.log('🌱 Starting database seeding with programmatically generated demo data (100+ records per table)...');

  try {
    // -------------------------------------------------------------
    // 0. SEED ACADEMIC REGISTRIES
    // -------------------------------------------------------------
    console.log('Seeding academic registries (subjects & grades)...');
    const defaultSubjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
    const defaultGrades = ['Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

    for (const subj of defaultSubjects) {
      await client.query(
        `INSERT INTO academic_registries (type, value)
         VALUES ('subject', $1)
         ON CONFLICT (value) DO NOTHING`,
        [subj]
      );
    }
    for (const gd of defaultGrades) {
      await client.query(
        `INSERT INTO academic_registries (type, value)
         VALUES ('grade', $1)
         ON CONFLICT (value) DO NOTHING`,
        [gd]
      );
    }
    console.log('✅ Academic registries seeded.');

    // -------------------------------------------------------------
    // 1. GENERATE & SEED USERS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 user records...');
    const generatedUsers = [...mockAllUsers];
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Matthew', 'Lisa', 'Daniel', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

    const studentIds: string[] = [];
    const parentIds: string[] = [];
    const teacherIds: string[] = [];

    // Separate existing students, parents and teachers
    generatedUsers.forEach(u => {
      if (u.role === 'student') studentIds.push(u.id);
      if (u.role === 'parent') parentIds.push(u.id);
      if (u.role === 'teacher') teacherIds.push(u.id);
    });

    while (generatedUsers.length < 100) {
      const index = generatedUsers.length;
      const id = `user-gen-${index + 1}`;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@school.edu`;
      const role = Math.random() > 0.4 ? 'student' : (Math.random() > 0.6 ? 'parent' : (Math.random() > 0.5 ? 'teacher' : 'admin'));
      const gradeLevel = (role === 'student' || role === 'teacher') ? Math.floor(Math.random() * 9) + 4 : undefined;
      const userSubjects = role === 'student' ? ['Mathematics', 'Science', 'English'] :
                           role === 'teacher' ? ['Mathematics', 'Science'] : undefined;

      generatedUsers.push({
        id,
        name,
        email,
        role,
        gradeLevel,
        subjects: userSubjects,
        profileImage: role === 'student' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}` : undefined,
        status: 'active',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
      } as any);

      if (role === 'student') studentIds.push(id);
      if (role === 'parent') parentIds.push(id);
      if (role === 'teacher') teacherIds.push(id);
    }

    console.log(`Seeding ${generatedUsers.length} users in database...`);
    for (const u of generatedUsers) {
      await client.query(
        `INSERT INTO users (id, name, email, role, grade_level, profile_image, status, created_at, subjects)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role, 
             grade_level = EXCLUDED.grade_level, profile_image = EXCLUDED.profile_image, 
             status = EXCLUDED.status, created_at = EXCLUDED.created_at, subjects = EXCLUDED.subjects`,
        [u.id, u.name, u.email, u.role, u.gradeLevel || null, u.profileImage || null, u.status || 'active', u.createdAt, u.subjects ? JSON.stringify(u.subjects) : null]
      );
    }

    // Seed 100 parent-student relationship mapping 
    console.log('Seeding 100 parent-student relationships...');
    for (let i = 0; i < 100; i++) {
      const sId = studentIds[i % studentIds.length];
      const parentId = parentIds[Math.floor(Math.random() * parentIds.length)];
      await client.query(
        `INSERT INTO user_relationships (parent_id, student_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [parentId, sId]
      );
    }

    // -------------------------------------------------------------
    // 2. GENERATE & SEED QUESTIONS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 question records...');
    const generatedQuestions = [...mockQuestions];
    const subjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
    const difficulties = ['easy', 'medium', 'hard'] as const;

    const mathTemplates = [
      { text: 'Solve for x: Ax + B = C', expl: 'Subtract B and then divide by A.', diff: 'medium' },
      { text: 'What is A% of B?', expl: 'Multiply B by A/100.', diff: 'easy' },
      { text: 'If a triangle has angles 90° and A°, what is the third angle?', expl: 'The sum of angles in a triangle is 180°.', diff: 'easy' },
      { text: 'Calculate the derivative of Ax³', expl: 'Use power rule: 3 * A * x².', diff: 'hard' },
      { text: 'What is the value of A² - B²?', expl: 'It factors into (A - B)(A + B).', diff: 'medium' }
    ];

    const scienceTemplates = [
      { text: 'Which planet is known as the red planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1, expl: 'Mars is red due to iron oxide.', diff: 'easy' },
      { text: 'Water boils at 100°C under normal atmospheric pressure.', type: 'trueFalse', answer: 'true', expl: '100°C is the boiling point under standard conditions.', diff: 'easy' },
      { text: 'What is the chemical symbol for A?', options: ['Au', 'Ag', 'Fe', 'Cu'], answer: 0, expl: 'A represents Gold (Au) in this template.', diff: 'medium' },
      { text: 'The atomic number of Carbon is A.', options: ['6', '8', '12', '16'], answer: 0, expl: 'Carbon has 6 protons.', diff: 'medium' },
      { text: 'Light travels faster than sound in a vacuum.', type: 'trueFalse', answer: 'true', expl: 'Light travels at ~300,000 km/s while sound cannot travel in a vacuum.', diff: 'easy' }
    ];

    const geographyTemplates = [
      { text: 'What is the capital of A?', options: ['London', 'Paris', 'Berlin', 'Rome'], answer: 1, expl: 'Paris is the capital of France.', diff: 'easy' },
      { text: 'The Amazon River is the longest river in South America.', type: 'trueFalse', answer: 'true', expl: 'It is the largest by volume and longest in South America.', diff: 'easy' },
      { text: 'Which is the smallest continent by land area?', options: ['Europe', 'Australia', 'Antarctica', 'South America'], answer: 1, expl: 'Australia is the smallest.', diff: 'medium' },
      { text: 'Mount Everest is the highest mountain peak in the world.', type: 'trueFalse', answer: 'true', expl: 'Peak sits at 8,848 meters.', diff: 'easy' }
    ];

    while (generatedQuestions.length < 100) {
      const idx = generatedQuestions.length;
      const id = `q-gen-${idx + 1}`;
      const subject = subjects[idx % subjects.length];
      const difficulty = difficulties[idx % difficulties.length];
      const gradeLevel = Math.floor(Math.random() * 9) + 4;

      let qText = '';
      let qType: 'mcq' | 'trueFalse' = 'mcq';
      let options: string[] | undefined = undefined;
      let correctAnswer: string | number = '';
      let explanation = '';

      if (subject === 'Mathematics') {
        const temp = mathTemplates[idx % mathTemplates.length];
        const A = Math.floor(Math.random() * 8) + 2;
        const B = Math.floor(Math.random() * 15) + 5;
        const x = Math.floor(Math.random() * 5) + 2;
        const C = A * x + B;

        qText = temp.text.replace('A', A.toString()).replace('B', B.toString()).replace('C', C.toString());
        qType = 'mcq';
        options = [x.toString(), (x+2).toString(), (x-1).toString(), (x*2).toString()];
        correctAnswer = 0;
        explanation = temp.expl.replace('A', A.toString()).replace('B', B.toString()).replace('C', C.toString());
      } else {
        const templates = subject === 'Science' ? scienceTemplates :
                            subject === 'Geography' ? geographyTemplates :
                            scienceTemplates; // Fallback

        const temp = templates[idx % templates.length];
        qText = temp.text.replace('A', 'France');
        qType = temp.type as 'mcq' | 'trueFalse' || 'mcq';
        options = temp.options;
        correctAnswer = temp.answer !== undefined ? temp.answer : 'true';
        explanation = temp.expl;
      }

      generatedQuestions.push({
        id,
        text: qText,
        type: qType,
        options,
        correctAnswer,
        explanation,
        subject,
        gradeLevel,
        difficulty,
        weight: difficulty === 'easy' ? 1.00 : (difficulty === 'medium' ? 1.50 : 2.00)
      });
    }

    console.log(`Seeding ${generatedQuestions.length} questions in database...`);
    for (const q of generatedQuestions) {
      await client.query(
        `INSERT INTO questions (id, text, type, options, correct_answer, explanation, subject, grade_level, difficulty, weight)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE 
         SET text = EXCLUDED.text, type = EXCLUDED.type, options = EXCLUDED.options,
             correct_answer = EXCLUDED.correct_answer, explanation = EXCLUDED.explanation,
             subject = EXCLUDED.subject, grade_level = EXCLUDED.grade_level,
             difficulty = EXCLUDED.difficulty, weight = EXCLUDED.weight`,
        [
          q.id, 
          q.text, 
          q.type, 
          q.options ? JSON.stringify(q.options) : null, 
          q.correctAnswer.toString(), 
          q.explanation, 
          q.subject, 
          q.gradeLevel, 
          q.difficulty, 
          q.weight || 1.00
        ]
      );
    }

    // -------------------------------------------------------------
    // 3. SEED TESTS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 test configurations...');
    const generatedTests = [...mockTests];
    while (generatedTests.length < 100) {
      const idx = generatedTests.length;
      const id = `test-gen-${idx + 1}`;
      const subject = subjects[idx % subjects.length];
      const grade = Math.floor(Math.random() * 9) + 4;
      const diff = difficulties[idx % difficulties.length];

      generatedTests.push({
        id,
        title: `${subject} Grade ${grade} Exam`,
        description: `Comprehensive evaluation of Grade ${grade} ${subject} syllabus.`,
        subject,
        gradeLevel: grade,
        totalQuestions: 10,
        duration: 30,
        passingScore: 70,
        difficulty: diff,
        isAdaptive: idx % 10 === 0,
        isPlacementTest: idx % 15 === 0,
        questions: generatedQuestions.filter(q => q.subject === subject).slice(0, 10)
      });
    }

    console.log(`Seeding ${generatedTests.length} tests and junction mappings...`);
    for (const t of generatedTests) {
      await client.query(
        `INSERT INTO tests (id, title, description, subject, grade_level, total_questions, duration, passing_score, difficulty, is_adaptive, is_placement_test)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, description = EXCLUDED.description, subject = EXCLUDED.subject,
             grade_level = EXCLUDED.grade_level, total_questions = EXCLUDED.total_questions,
             duration = EXCLUDED.duration, passing_score = EXCLUDED.passing_score,
             difficulty = EXCLUDED.difficulty, is_adaptive = EXCLUDED.is_adaptive,
             is_placement_test = EXCLUDED.is_placement_test`,
        [
          t.id, 
          t.title, 
          t.description, 
          t.subject, 
          t.gradeLevel, 
          t.totalQuestions, 
          t.duration, 
          t.passingScore, 
          t.difficulty, 
          t.isAdaptive || false, 
          t.isPlacementTest || false
        ]
      );

      // Seed exactly 100 test sections (1 per test)
      const sectionId = `sec-gen-${t.id}`;
      await client.query(
        `INSERT INTO test_sections (id, test_id, name, description, duration)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration`,
        [sectionId, t.id, 'Section A: Core Foundation', 'Core diagnostics assessing fundamental topics.', 15]
      );

      // Map sections questions
      if (t.questions && t.questions.length > 0) {
        for (const sq of t.questions.slice(0, 3)) {
          await client.query(
            `INSERT INTO test_questions (test_id, question_id, section_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (test_id, question_id) DO UPDATE
             SET section_id = EXCLUDED.section_id`,
            [t.id, sq.id, sectionId]
          );
        }
      }

      // Map standard test questions
      if (t.questions && t.questions.length > 0) {
        for (const tq of t.questions) {
          await client.query(
            `INSERT INTO test_questions (test_id, question_id, section_id)
             VALUES ($1, $2, NULL)
             ON CONFLICT (test_id, question_id) DO NOTHING`,
            [t.id, tq.id]
          );
        }
      }
    }

    // -------------------------------------------------------------
    // 4. GENERATE & SEED TEST RESULTS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 student test results...');
    const generatedResults = [...mockTestResults];
    while (generatedResults.length < 100) {
      const idx = generatedResults.length;
      const id = `result-gen-${idx + 1}`;
      const studentId = studentIds[idx % studentIds.length];
      const test = generatedTests[idx % generatedTests.length];

      const score = Math.floor(Math.random() * 4) + 7; // score 7-10 out of 10
      const percentage = score * 10;

      const rec = {
        subject: test.subject,
        recommendedGrade: test.gradeLevel,
        confidenceScore: Math.floor(Math.random() * 20) + 75,
        strengths: ['Analytical Logic', 'Core Theories'],
        areasToImprove: ['Formulas Application'],
        suggestedNextSteps: ['Complete extra revision sets']
      };

      generatedResults.push({
        id,
        studentId,
        testId: test.id,
        testTitle: test.title,
        subject: test.subject,
        score,
        totalScore: 10,
        percentage,
        timeTaken: Math.floor(Math.random() * 600) + 300,
        completedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        answers: { 'q-gen-1': 1, 'q-gen-2': 'true' },
        strengths: ['Topic A', 'Topic B'],
        weaknesses: ['Topic C'],
        isPlacementTest: test.isPlacementTest,
        placementRecommendation: rec
      });
    }

    console.log(`Seeding ${generatedResults.length} test results and report recommendations...`);
    for (const r of generatedResults) {
      await client.query(
        `INSERT INTO test_results (id, student_id, test_id, test_title, subject, score, total_score, percentage, time_taken, completed_at, answers, strengths, weaknesses, is_placement_test, flagged_questions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE
         SET score = EXCLUDED.score, percentage = EXCLUDED.percentage, time_taken = EXCLUDED.time_taken,
             completed_at = EXCLUDED.completed_at, answers = EXCLUDED.answers, strengths = EXCLUDED.strengths,
             weaknesses = EXCLUDED.weaknesses, is_placement_test = EXCLUDED.is_placement_test,
             flagged_questions = EXCLUDED.flagged_questions`,
        [
          r.id,
          r.studentId,
          r.testId,
          r.testId.startsWith('test-gen-') ? generatedTests.find(t=>t.id===r.testId)?.title || 'Geography Exam' : r.testTitle,
          r.subject,
          r.score,
          r.totalScore,
          r.percentage,
          r.timeTaken,
          r.completedAt,
          JSON.stringify(r.answers),
          JSON.stringify(r.strengths),
          JSON.stringify(r.weaknesses),
          r.isPlacementTest || false,
          r.flaggedQuestions ? JSON.stringify(r.flaggedQuestions) : null
        ]
      );

      if (r.placementRecommendation) {
        const rec = r.placementRecommendation;
        await client.query(
          `INSERT INTO placement_recommendations (test_result_id, subject, recommended_grade, confidence_score, strengths, areas_to_improve, suggested_next_steps)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            r.id,
            rec.subject,
            rec.recommendedGrade,
            rec.confidenceScore,
            JSON.stringify(rec.strengths),
            JSON.stringify(rec.areasToImprove),
            JSON.stringify(rec.suggestedNextSteps)
          ]
        );
      }
    }

    // -------------------------------------------------------------
    // 5. GENERATE & SEED CHEATING FLAGS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 cheating/integrity alerts...');
    const generatedFlags = [...mockCheatDetectionFlags];
    const flagTypes = ['unusual_speed', 'score_jump', 'multiple_ip', 'tab_switch'];
    const flagReasons = [
      'Answer selection time was extremely rapid, averaging less than 3 seconds per question.',
      'A notable score increase compared to historical records.',
      'Attempt completed using multiple browser tabs or focus switches.',
      'Unusual speed anomaly detected in question answering patterns.'
    ];

    while (generatedFlags.length < 100) {
      const idx = generatedFlags.length;
      const id = `cheat-flag-gen-${idx + 1}`;
      const student = generatedUsers[idx % generatedUsers.length];
      const test = generatedTests[idx % generatedTests.length];

      generatedFlags.push({
        id,
        testId: test.id,
        studentId: student.id,
        flagType: flagTypes[idx % flagTypes.length],
        confidenceScore: Math.floor(Math.random() * 40) + 55,
        reasoning: flagReasons[idx % flagReasons.length],
        flaggedAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(),
        status: idx % 3 === 0 ? 'pending' : (idx % 3 === 1 ? 'reviewed' : 'cleared')
      } as any);
    }

    console.log(`Seeding ${generatedFlags.length} cheat flags in database...`);
    for (const f of generatedFlags) {
      const student = generatedUsers.find(u => u.id === f.studentId);
      const studentName = student ? student.name : 'Gen Student';
      const test = generatedTests.find(t => t.id === f.testId);
      const testName = test ? test.title : 'General Exam';

      await client.query(
        `INSERT INTO cheating_flags (id, student_name, test_name, date, confidence_score, flags, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET confidence_score = EXCLUDED.confidence_score, flags = EXCLUDED.flags, status = EXCLUDED.status`,
        [
          f.id,
          studentName,
          testName,
          f.flaggedAt,
          f.confidenceScore,
          JSON.stringify([f.reasoning]),
          f.status
        ]
      );
    }

    // -------------------------------------------------------------
    // 6. GENERATE & SEED CONTENT VERSIONS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 content approval history records...');
    const generatedVersions = [...mockContentVersions];
    while (generatedVersions.length < 100) {
      const idx = generatedVersions.length;
      const id = `version-gen-${idx + 1}`;
      const q = generatedQuestions[idx % generatedQuestions.length];

      generatedVersions.push({
        id,
        questionId: q.id,
        version: Math.floor(Math.random() * 3) + 1,
        content: `What is the correct value of equation ${idx}?`,
        createdBy: 'admin-001',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
        status: idx % 2 === 0 ? 'approved' : 'draft'
      });
    }

    console.log(`Seeding ${generatedVersions.length} content approval versions...`);
    for (const v of generatedVersions) {
      await client.query(
        `INSERT INTO content_versions (id, question_id, version, content, created_by, created_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE
         SET version = EXCLUDED.version, content = EXCLUDED.content, status = EXCLUDED.status`,
        [v.id, v.questionId, v.version, v.content, v.createdBy, v.createdAt, v.status]
      );
    }

    // -------------------------------------------------------------
    // 7. GENERATE & SEED USER ACTIVITIES LOGS (100 Records)
    // -------------------------------------------------------------
    console.log('Generating 100 administrative audit logs...');
    const generatedActivities = [...mockUserActivities];
    const actions = ['login', 'test_started', 'test_completed', 'question_created', 'flag_reviewed'];
    const details = [
      'Logged in successfully from desktop browser',
      'Started advanced calculus quiz',
      'Completed placement evaluation assessment',
      'Added new questions in Mathematics subject',
      'Marked suspicious cheating flag as cleared'
    ];

    while (generatedActivities.length < 100) {
      const idx = generatedActivities.length;
      const id = `act-gen-${idx + 1}`;
      const student = generatedUsers[idx % generatedUsers.length];

      generatedActivities.push({
        id,
        userId: student.id,
        action: actions[idx % actions.length],
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
        details: details[idx % details.length]
      });
    }

    console.log(`Seeding ${generatedActivities.length} user activity logs...`);
    for (const a of generatedActivities) {
      await client.query(
        `INSERT INTO user_activities (id, user_id, action, details, timestamp)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET action = EXCLUDED.action, details = EXCLUDED.details, timestamp = EXCLUDED.timestamp`,
        [a.id, a.userId, a.action, a.details, a.timestamp]
      );
    }

    // Seeding Curriculum Hierarchy (Units, Lessons, Materials)
    console.log('Seeding Units...');
    const defaultUnits = [
      { id: 'unit-001', subject: 'Mathematics', gradeLevel: 8, name: 'Algebraic Foundations', description: 'Understanding variables, expressions, and basic properties of algebra.' },
      { id: 'unit-002', subject: 'Mathematics', gradeLevel: 8, name: 'Linear Equations', description: 'Solving linear equations and graphing coordinate systems.' },
      { id: 'unit-003', subject: 'Science', gradeLevel: 8, name: 'Chemical Reactions', description: 'Exploring atomic bonds, chemical formulas, and equation balancing.' },
    ];
    for (const u of defaultUnits) {
      await client.query(
        `INSERT INTO units (id, subject, grade_level, name, description)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [u.id, u.subject, u.gradeLevel, u.name, u.description]
      );
    }

    console.log('Seeding Lessons...');
    const defaultLessons = [
      { id: 'lesson-001', unitId: 'unit-001', name: 'Variables & Expressions', description: 'Learn how to translate word problems into algebraic expressions.', orderNum: 1 },
      { id: 'lesson-002', unitId: 'unit-001', name: 'Distributive Property', description: 'Master expanding and factoring algebraic products.', orderNum: 2 },
      { id: 'lesson-003', unitId: 'unit-002', name: 'Solving 1-Step Equations', description: 'Using inverse operations to find the value of x.', orderNum: 1 },
      { id: 'lesson-004', unitId: 'unit-003', name: 'Atoms & Molecules', description: 'Understanding the building blocks of matter.', orderNum: 1 },
    ];
    for (const l of defaultLessons) {
      await client.query(
        `INSERT INTO lessons (id, unit_id, name, description, order_num)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, order_num = EXCLUDED.order_num`,
        [l.id, l.unitId, l.name, l.description, l.orderNum]
      );
    }

    console.log('Seeding Lesson Materials...');
    const defaultMaterials = [
      { id: 'material-001', lessonId: 'lesson-001', type: 'video', title: 'English Grammar: Nouns and Verbs', url: 'https://www.youtube.com/embed/m7Yx3gC0kIM', details: 'A comprehensive video lesson explaining nouns and verbs.' },
      { id: 'material-002', lessonId: 'lesson-001', type: 'document', title: 'Variables Cheat Sheet PDF', url: '#', details: 'Printable overview of variables terminology.' },
      { id: 'material-003', lessonId: 'lesson-004', type: 'video', title: 'English Grammar: Adjectives and Adverbs', url: 'https://www.youtube.com/embed/_bU5F7dJ7qg', details: 'Introduction to adjectives and adverbs.' },
    ];
    for (const m of defaultMaterials) {
      await client.query(
        `INSERT INTO lesson_materials (id, lesson_id, type, title, url, details)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
         SET title = EXCLUDED.title, url = EXCLUDED.url, details = EXCLUDED.details`,
        [m.id, m.lessonId, m.type, m.title, m.url, m.details]
      );
    }

    console.log('🎉 Database seeding completed with exactly 100 rich records per table! 🚀');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
