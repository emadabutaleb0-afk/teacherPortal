-- PostgreSQL Schema for EduPath Platform

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS student_teacher_enrollments CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS content_versions CASCADE;
DROP TABLE IF EXISTS cheating_flags CASCADE;
DROP TABLE IF EXISTS placement_recommendations CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS test_sections CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS user_relationships CASCADE;
DROP TABLE IF EXISTS lesson_materials CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS academic_registries CASCADE;

-- 0. Academic Registries Table (For Subjects & Grades)
CREATE TABLE academic_registries (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('subject', 'grade')),
    value VARCHAR(255) UNIQUE NOT NULL
);

-- Index for registry type lookup
CREATE INDEX idx_ar_type ON academic_registries(type);

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'parent', 'admin', 'teacher')),
    grade_level INT,
    profile_image TEXT,
    status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subjects JSONB
);

-- Index for roles and emails
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 2. User Relationships (Many-to-Many for Parents & Students)
CREATE TABLE user_relationships (
    parent_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, student_id)
);

-- Indexes for relationships
CREATE INDEX idx_ur_parent ON user_relationships(parent_id);
CREATE INDEX idx_ur_student ON user_relationships(student_id);

-- 3. Questions Table
CREATE TABLE questions (
    id VARCHAR(50) PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('mcq', 'trueFalse')),
    options JSONB, -- Array of string choices for MCQ questions
    correct_answer TEXT NOT NULL, -- Holds correct index string or 'true'/'false'
    explanation TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    weight NUMERIC(3,2) DEFAULT 1.00 NOT NULL
);

-- Indexes for questions retrieval
CREATE INDEX idx_questions_subject_grade ON questions(subject, grade_level);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- 4. Tests Table
CREATE TABLE tests (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    total_questions INT NOT NULL,
    duration INT NOT NULL, -- in minutes
    passing_score INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_adaptive BOOLEAN DEFAULT FALSE NOT NULL,
    is_placement_test BOOLEAN DEFAULT FALSE NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE
);

-- Index for test lookups
CREATE INDEX idx_tests_subject ON tests(subject);
CREATE INDEX idx_tests_placement ON tests(is_placement_test);

-- 5. Test Sections Table (Optional, for sections inside tests like Placement test)
CREATE TABLE test_sections (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    duration INT -- in minutes, optional
);

-- Index for section sorting
CREATE INDEX idx_test_sections_test ON test_sections(test_id);

-- 6. Test Questions Junction Table
CREATE TABLE test_questions (
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    question_id VARCHAR(50) REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    section_id VARCHAR(50) REFERENCES test_sections(id) ON DELETE SET NULL,
    PRIMARY KEY (test_id, question_id)
);

-- 7. Test Results Table
CREATE TABLE test_results (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    test_id VARCHAR(50) REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
    test_title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    total_score NUMERIC(5,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    time_taken INT NOT NULL, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    answers JSONB NOT NULL, -- Key-value answers map: {"q-001": 2, "q-002": "true"}
    strengths JSONB NOT NULL, -- Array of string strengths
    weaknesses JSONB NOT NULL, -- Array of string weaknesses
    is_placement_test BOOLEAN DEFAULT FALSE NOT NULL,
    flagged_questions JSONB -- Array of string question IDs
);

-- Indexes for performance lookups
CREATE INDEX idx_test_results_student ON test_results(student_id);
CREATE INDEX idx_test_results_test ON test_results(test_id);

-- 8. Placement Recommendations Table
CREATE TABLE placement_recommendations (
    id SERIAL PRIMARY KEY,
    test_result_id VARCHAR(50) REFERENCES test_results(id) ON DELETE CASCADE NOT NULL,
    subject VARCHAR(100) NOT NULL,
    recommended_grade INT NOT NULL,
    confidence_score NUMERIC(3,2) NOT NULL,
    strengths JSONB NOT NULL, -- Array of strings
    areas_to_improve JSONB NOT NULL, -- Array of strings
    suggested_next_steps JSONB NOT NULL -- Array of strings
);

-- Index for placement report link
CREATE INDEX idx_pr_result ON placement_recommendations(test_result_id);

-- 9. Cheating Flags Table
CREATE TABLE cheating_flags (
    id VARCHAR(50) PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    confidence_score INT NOT NULL,
    flags JSONB NOT NULL, -- Array of string warnings
    status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'reviewed', 'cleared'))
);

-- Index for cheats risk filter
CREATE INDEX idx_cf_status ON cheating_flags(status);

-- 10. Content Versions Table (For Content Management approvals)
CREATE TABLE content_versions (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    version INT NOT NULL,
    content TEXT NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL -- 'draft', 'approved', 'retired'
);

-- Index for content version tracking
CREATE INDEX idx_cv_question ON content_versions(question_id);

-- 11. User Activity Logs
CREATE TABLE user_activities (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for quick audit logs
CREATE INDEX idx_activities_user ON user_activities(user_id);
CREATE INDEX idx_activities_time ON user_activities(timestamp DESC);

-- 12. Units Table
CREATE TABLE units (
    id VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    grade_level INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

-- Index for unit lookups
CREATE INDEX idx_units_subject ON units(subject);

-- 13. Lessons Table
CREATE TABLE lessons (
    id VARCHAR(50) PRIMARY KEY,
    unit_id VARCHAR(50) REFERENCES units(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_num INT NOT NULL
);

-- Index for lesson lookups
CREATE INDEX idx_lessons_unit ON lessons(unit_id);

-- 14. Lesson Materials Table (Videos & Documents)
CREATE TABLE lesson_materials (
    id VARCHAR(50) PRIMARY KEY,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'document')),
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    details TEXT
);

-- Index for materials lookups
CREATE INDEX idx_materials_lesson ON lesson_materials(lesson_id);

-- 15. Platform Customizations Table (For website copy, text, images, styles)
CREATE TABLE platform_customizations (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 16. Student Teacher Enrollments Table (For student teacher enrollments)
CREATE TABLE student_teacher_enrollments (
    student_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (student_id, teacher_id, subject)
);

CREATE INDEX idx_ste_student ON student_teacher_enrollments(student_id);
