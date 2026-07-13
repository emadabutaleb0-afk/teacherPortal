// Mock data for EduPath application

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin' | 'teacher' | 'superadmin';
  gradeLevel?: number;
  profileImage?: string;
  subjects?: string[];
  linkedStudents?: string[];
  linkedParents?: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  weight?: number; // for weighted scoring (default 1)
}

export interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: number;
  totalQuestions: number;
  duration: number; // in minutes
  passingScore: number;
  questions: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  isAdaptive?: boolean;
  isPlacementTest?: boolean;
  sections?: TestSection[];
  scheduledAt?: string;
}

export interface TestSection {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  duration?: number; // per section
}

export interface PlacementRecommendation {
  subject: string;
  recommendedGrade: number;
  confidenceScore: number;
  strengths: string[];
  areasToImprove: string[];
  suggestedNextSteps: string[];
}

export interface TestResult {
  id: string;
  studentId: string;
  testId: string;
  testTitle: string;
  subject: string;
  score: number;
  totalScore: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
  answers: Record<string, string | number>;
  strengths: string[];
  weaknesses: string[];
  placementRecommendation?: PlacementRecommendation;
  isPlacementTest?: boolean;
  flaggedQuestions?: string[];
}

export interface StudentDashboardData {
  user: User;
  availableTests: Test[];
  recentResults: TestResult[];
  progressOverview: {
    totalTestsTaken: number;
    averageScore: number;
    subjectPerformance: Record<string, { correct: number; total: number }>;
  };
  placementRecommendations?: PlacementRecommendation[];
}

export interface UserAccount extends User {
  status: 'active' | 'inactive';
  createdAt: string;
  linkedParents?: string[]; // parent IDs linked to this student
  linkedStudents?: string[]; // student IDs linked to this parent
}

export interface Enrollment {
  studentId: string;
  teacherId: string;
  subject: string;
  enrolledAt: string;
}

export const mockEnrollments: Enrollment[] = [];

// Centralized Subject & Grade registries for administrative customization
export const availableSubjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
export const availableGrades = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export function addSubject(subjName: string) {
  if (!availableSubjects.includes(subjName)) {
    availableSubjects.push(subjName);
    return true;
  }
  return false;
}

export function addGrade(gradeVal: number) {
  if (!availableGrades.includes(gradeVal)) {
    availableGrades.push(gradeVal);
    availableGrades.sort((a, b) => a - b);
    return true;
  }
  return false;
}

// Mock current user
export const mockCurrentUser: User = {
  id: 'student-001',
  name: 'Student Demo',
  email: 'user',
  role: 'student',
  gradeLevel: 8,
  profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  subjects: ['Mathematics', 'Science', 'English'],
};

// Mock all users for admin management
export const mockAllUsers: UserAccount[] = [
  {
    id: 'superadmin-001',
    name: 'Super Admin',
    email: 'superadmin',
    role: 'superadmin',
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'teacher-001',
    name: 'Teacher Demo',
    email: 'teacher',
    role: 'teacher',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    subjects: ['Mathematics', 'Science', 'English'],
    gradeLevel: 8,
  },
  {
    id: 'student-001',
    name: 'Student Demo',
    email: 'user',
    role: 'student',
    gradeLevel: 8,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    linkedParents: ['parent-001'],
    subjects: ['Mathematics', 'Science', 'English'],
  },
  {
    id: 'student-002',
    name: 'Jordan Johnson',
    email: 'jordan.johnson@school.edu',
    role: 'student',
    gradeLevel: 6,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    linkedParents: ['parent-001'],
    subjects: ['Mathematics', 'Geography'],
  },
  {
    id: 'student-003',
    name: 'Casey Smith',
    email: 'casey.smith@school.edu',
    role: 'student',
    gradeLevel: 10,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    subjects: ['Science', 'History', 'English'],
  },
  {
    id: 'parent-001',
    name: 'parent',
    email: 'parent@edupath.com',
    role: 'parent',
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    linkedStudents: ['student-001', 'student-002'],
  },
  {
    id: 'parent-002',
    name: 'Michael Smith',
    email: 'michael.smith@email.com',
    role: 'parent',
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    linkedStudents: ['student-003'],
  },
  {
    id: 'admin-001',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@edupath.edu',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'admin-002',
    name: 'James Wilson',
    email: 'james.wilson@edupath.edu',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock questions database
const baseQuestions: Question[] = [
  {
    id: 'q-001',
    text: 'What is the capital of France?',
    type: 'mcq',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
    explanation: 'Paris is the capital and largest city of France.',
    subject: 'Geography',
    gradeLevel: 4,
    difficulty: 'easy',
    weight: 1,
  },
  {
    id: 'q-002',
    text: 'The Great Wall of China was built to protect against invasions from the north.',
    type: 'trueFalse',
    correctAnswer: 'true',
    explanation: 'The Great Wall was constructed over many centuries primarily to defend against invasions and raids from northern nomadic groups.',
    subject: 'History',
    gradeLevel: 5,
    difficulty: 'easy',
    weight: 1,
  },
  {
    id: 'q-003',
    text: 'What is the chemical symbol for Gold?',
    type: 'mcq',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    explanation: 'Au is the chemical symbol for Gold, derived from its Latin name "Aurum".',
    subject: 'Science',
    gradeLevel: 6,
    difficulty: 'medium',
    weight: 1.5,
  },
  {
    id: 'q-004',
    text: 'Which planet is known as the Red Planet?',
    type: 'mcq',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    explanation: 'Mars is called the Red Planet because of its reddish appearance due to iron oxide on its surface.',
    subject: 'Science',
    gradeLevel: 5,
    difficulty: 'easy',
    weight: 1,
  },
  {
    id: 'q-005',
    text: 'Photosynthesis is the process by which plants convert sunlight into chemical energy.',
    type: 'trueFalse',
    correctAnswer: 'true',
    explanation: 'Photosynthesis is indeed the process where plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
    subject: 'Science',
    gradeLevel: 6,
    difficulty: 'medium',
    weight: 1.5,
  },
  {
    id: 'q-006',
    text: 'What is 15% of 200?',
    type: 'mcq',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    explanation: '15% of 200 = (15/100) × 200 = 30',
    subject: 'Mathematics',
    gradeLevel: 6,
    difficulty: 'easy',
    weight: 1,
  },
  {
    id: 'q-007',
    text: 'Solve for x: 2x + 5 = 13',
    type: 'mcq',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2,
    explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
    subject: 'Mathematics',
    gradeLevel: 7,
    difficulty: 'medium',
    weight: 1.5,
  },
  {
    id: 'q-008',
    text: 'The mitochondria is the powerhouse of the cell.',
    type: 'trueFalse',
    correctAnswer: 'true',
    explanation: 'Mitochondria is responsible for producing ATP, which provides energy for cellular functions.',
    subject: 'Science',
    gradeLevel: 8,
    difficulty: 'medium',
    weight: 1.5,
  },
  {
    id: 'q-009',
    text: 'Which of the following is a prime number?',
    type: 'mcq',
    options: ['24', '35', '37', '48'],
    correctAnswer: 2,
    explanation: '37 is a prime number as it is only divisible by 1 and itself.',
    subject: 'Mathematics',
    gradeLevel: 7,
    difficulty: 'medium',
    weight: 1.5,
  },
  {
    id: 'q-010',
    text: 'What is the derivative of x²?',
    type: 'mcq',
    options: ['x', '2x', 'x/2', '2'],
    correctAnswer: 1,
    explanation: 'The derivative of x² is 2x using the power rule of differentiation.',
    subject: 'Mathematics',
    gradeLevel: 12,
    difficulty: 'hard',
    weight: 2,
  },
];

// Programmatically generate questions to match the 50 seeded questions in PostgreSQL
const generatedMockQuestions = [...baseQuestions];
const extraSubjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
const extraDifficulties = ['easy', 'medium', 'hard'] as const;

const extraMathTemplates = [
  { text: 'Solve for x: Ax + B = C', expl: 'Subtract B and then divide by A.', diff: 'medium' },
  { text: 'What is A% of B?', expl: 'Multiply B by A/100.', diff: 'easy' },
  { text: 'If a triangle has angles 90° and A°, what is the third angle?', expl: 'The sum of angles in a triangle is 180°.', diff: 'easy' },
  { text: 'Calculate the derivative of Ax³', expl: 'Use power rule: 3 * A * x².', diff: 'hard' },
  { text: 'What is the value of A² - B²?', expl: 'It factors into (A - B)(A + B).', diff: 'medium' }
];

const extraScienceTemplates = [
  { text: 'Which planet is known as the red planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1, expl: 'Mars is red due to iron oxide.', diff: 'easy' },
  { text: 'Water boils at 100°C under normal atmospheric pressure.', type: 'trueFalse', answer: 'true', expl: '100°C is the boiling point under standard conditions.', diff: 'easy' },
  { text: 'What is the chemical symbol for A?', options: ['Au', 'Ag', 'Fe', 'Cu'], answer: 0, expl: 'A represents Gold (Au) in this template.', diff: 'medium' },
  { text: 'The atomic number of Carbon is A.', options: ['6', '8', '12', '16'], answer: 0, expl: 'Carbon has 6 protons.', diff: 'medium' },
  { text: 'Light travels faster than sound in a vacuum.', type: 'trueFalse', answer: 'true', expl: 'Light travels at ~300,000 km/s while sound cannot travel in a vacuum.', diff: 'easy' }
];

const extraGeographyTemplates = [
  { text: 'What is the capital of A?', options: ['London', 'Paris', 'Berlin', 'Rome'], answer: 1, expl: 'Paris is the capital of France.', diff: 'easy' },
  { text: 'The Amazon River is the longest river in South America.', type: 'trueFalse', answer: 'true', expl: 'It is the largest by volume and longest in South America.', diff: 'easy' },
  { text: 'Which is the smallest continent by land area?', options: ['Europe', 'Australia', 'Antarctica', 'South America'], answer: 1, expl: 'Australia is the smallest.', diff: 'medium' },
  { text: 'Mount Everest is the highest mountain peak in the world.', type: 'trueFalse', answer: 'true', expl: 'Peak sits at 8,848 meters.', diff: 'easy' }
];

const extraHistoryTemplates = [
  { text: 'In which year did the United States declare independence?', options: ['1492', '1776', '1789', '1812'], answer: 1, expl: 'The Declaration of Independence was signed on July 4, 1776.', diff: 'easy' },
  { text: 'The Magna Carta was signed in the year 1215.', type: 'trueFalse', answer: 'true', expl: 'King John signed the Magna Carta at Runnymede in June 1215.', diff: 'medium' },
  { text: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'], answer: 2, expl: 'George Washington served as the first president from 1789 to 1797.', diff: 'easy' }
];

const extraEnglishTemplates = [
  { text: 'Identify the verb in the sentence: "The dog barked loudly."', options: ['The', 'dog', 'barked', 'loudly'], answer: 2, expl: '"Barked" is the action word, which makes it a verb.', diff: 'easy' },
  { text: 'A synonym for the word "happy" is "joyful".', type: 'trueFalse', answer: 'true', expl: 'Happy and joyful have the same basic meaning.', diff: 'easy' },
  { text: 'Which of the following is an example of a proper noun?', options: ['city', 'london', 'London', 'river'], answer: 2, expl: 'Proper nouns refer to specific names and are always capitalized (e.g., "London").', diff: 'medium' }
];

while (generatedMockQuestions.length < 55) {
  const idx = generatedMockQuestions.length;
  const id = `q-gen-${idx + 1}`;
  const subject = extraSubjects[idx % extraSubjects.length];
  const difficulty = extraDifficulties[idx % extraDifficulties.length];
  const gradeLevel = Math.floor(Math.random() * 9) + 4;

  let qText = '';
  let qType: 'mcq' | 'trueFalse' = 'mcq';
  let options: string[] | undefined = undefined;
  let correctAnswer: string | number = '';
  let explanation = '';

  if (subject === 'Mathematics') {
    const temp = extraMathTemplates[idx % extraMathTemplates.length];
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
    const templates = subject === 'Science' ? extraScienceTemplates :
                      subject === 'Geography' ? extraGeographyTemplates :
                      subject === 'History' ? extraHistoryTemplates :
                      subject === 'English' ? extraEnglishTemplates :
                      extraScienceTemplates;

    const temp = templates[idx % templates.length];
    qText = temp.text.replace('A', 'France');
    qType = temp.type as 'mcq' | 'trueFalse' || 'mcq';
    options = temp.options;
    correctAnswer = temp.answer !== undefined ? temp.answer : 'true';
    explanation = temp.expl;
  }

  generatedMockQuestions.push({
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

export const mockQuestions = generatedMockQuestions;

// Mock placement recommendations
export const mockPlacementRecommendations: PlacementRecommendation[] = [
  {
    subject: 'Mathematics',
    recommendedGrade: 9,
    confidenceScore: 0.92,
    strengths: ['Algebra', 'Percentages', 'Problem-solving'],
    areasToImprove: ['Word problems', 'Geometry'],
    suggestedNextSteps: ['Practice geometry concepts', 'Work on multi-step word problems'],
  },
  {
    subject: 'Science',
    recommendedGrade: 8,
    confidenceScore: 0.85,
    strengths: ['Biology', 'Planetary science'],
    areasToImprove: ['Chemistry', 'Physics formulas'],
    suggestedNextSteps: ['Review chemical reactions', 'Practice force and motion problems'],
  },
];

// Mock tests
export const mockTests: Test[] = [
  {
    id: 'test-001',
    title: 'Geography Basics',
    description: 'Test your knowledge of world capitals and major landmarks.',
    subject: 'Geography',
    gradeLevel: 4,
    totalQuestions: 5,
    duration: 15,
    passingScore: 60,
    difficulty: 'easy',
    questions: mockQuestions.filter(q => q.subject === 'Geography' && q.gradeLevel <= 4),
  },
  {
    id: 'test-002',
    title: 'Science Fundamentals',
    description: 'Explore basic concepts in biology, chemistry, and physics.',
    subject: 'Science',
    gradeLevel: 6,
    totalQuestions: 8,
    duration: 30,
    passingScore: 65,
    difficulty: 'medium',
    questions: mockQuestions.filter(q => q.subject === 'Science' && q.gradeLevel <= 6),
  },
  {
    id: 'test-003',
    title: 'Mathematics Challenge',
    description: 'Challenge yourself with algebra and problem-solving questions.',
    subject: 'Mathematics',
    gradeLevel: 7,
    totalQuestions: 6,
    duration: 25,
    passingScore: 70,
    difficulty: 'medium',
    questions: mockQuestions.filter(q => q.subject === 'Mathematics' && q.gradeLevel <= 7),
  },
  {
    id: 'test-004',
    title: 'Advanced Calculus',
    description: 'Test your understanding of derivatives, integrals, and advanced concepts.',
    subject: 'Mathematics',
    gradeLevel: 12,
    totalQuestions: 10,
    duration: 45,
    passingScore: 75,
    difficulty: 'hard',
    questions: mockQuestions.filter(q => q.subject === 'Mathematics' && q.gradeLevel <= 12),
  },
  {
    id: 'test-005',
    title: 'AI Smart-Guidance Placement Assessment',
    description: 'Advanced AI-guided adaptive assessment that instantly maps your strengths and tailors a custom genius learning path.',
    subject: 'Mathematics',
    gradeLevel: 6,
    totalQuestions: 15,
    duration: 40,
    passingScore: 60,
    difficulty: 'medium',
    isAdaptive: true,
    isPlacementTest: true,
    questions: mockQuestions.filter(q => q.subject === 'Mathematics'),
    sections: [
      {
        id: 'section-1',
        name: 'Basic Arithmetic',
        description: 'Warm up with basic arithmetic concepts',
        questions: mockQuestions.filter(q => q.subject === 'Mathematics' && q.difficulty === 'easy'),
        duration: 10,
      },
      {
        id: 'section-2',
        name: 'Algebra & Problem Solving',
        description: 'Test your algebraic thinking',
        questions: mockQuestions.filter(q => q.subject === 'Mathematics' && q.difficulty === 'medium'),
        duration: 20,
      },
      {
        id: 'section-3',
        name: 'Advanced Concepts',
        description: 'Challenge yourself with harder problems',
        questions: mockQuestions.filter(q => q.subject === 'Mathematics' && q.difficulty === 'hard'),
        duration: 10,
      },
    ],
  },
];

// Mock test results with placement recommendations
export const mockTestResults: TestResult[] = [
  {
    id: 'result-001',
    studentId: 'student-001',
    testId: 'test-001',
    testTitle: 'Geography Basics',
    subject: 'Geography',
    score: 4,
    totalScore: 5,
    percentage: 80,
    timeTaken: 12,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-001': 1 },
    strengths: ['Capital cities', 'Landmarks'],
    weaknesses: ['Regional geography'],
  },
  {
    id: 'result-002',
    studentId: 'student-001',
    testId: 'test-002',
    testTitle: 'Science Fundamentals',
    subject: 'Science',
    score: 6,
    totalScore: 8,
    percentage: 75,
    timeTaken: 28,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-003': 2, 'q-004': 1 },
    strengths: ['Biology', 'Planetary science'],
    weaknesses: ['Chemistry concepts'],
  },
  {
    id: 'result-003',
    studentId: 'student-001',
    testId: 'test-003',
    testTitle: 'Mathematics Challenge',
    subject: 'Mathematics',
    score: 5,
    totalScore: 6,
    percentage: 83,
    timeTaken: 22,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-006': 2, 'q-007': 2 },
    strengths: ['Algebra', 'Percentages'],
    weaknesses: ['Word problems'],
    isPlacementTest: false,
  },
  {
    id: 'result-004',
    studentId: 'student-001',
    testId: 'test-005',
    testTitle: 'Math Placement Test',
    subject: 'Mathematics',
    score: 12,
    totalScore: 15,
    percentage: 80,
    timeTaken: 38,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-006': 2, 'q-007': 2, 'q-009': 2 },
    strengths: ['Algebra', 'Problem-solving'],
    weaknesses: ['Advanced calculus'],
    isPlacementTest: true,
    placementRecommendation: {
      subject: 'Mathematics',
      recommendedGrade: 9,
      confidenceScore: 0.92,
      strengths: ['Algebra', 'Percentages', 'Problem-solving'],
      areasToImprove: ['Word problems', 'Geometry'],
      suggestedNextSteps: ['Practice geometry concepts', 'Work on multi-step word problems'],
    },
    flaggedQuestions: ['q-009'],
  },
];

// Mock parent data
export const mockParentUser: User = {
  id: 'parent-001',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  role: 'parent',
};

export const mockLinkedStudents: User[] = [
  {
    id: 'student-001',
    name: 'Alex Johnson',
    email: 'alex.johnson@school.edu',
    role: 'student',
    gradeLevel: 8,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    subjects: ['Mathematics', 'Science', 'English'],
  },
  {
    id: 'student-002',
    name: 'Jordan Johnson',
    email: 'jordan.johnson@school.edu',
    role: 'student',
    gradeLevel: 6,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    subjects: ['Mathematics', 'Geography'],
  },
];

// Mock admin data
export const mockAdminUser: User = {
  id: 'admin-001',
  name: 'Dr. Emily Chen',
  email: 'emily.chen@edupath.edu',
  role: 'admin',
};

export const mockAdminStats = {
  totalStudents: 1250,
  totalTests: 42,
  totalQuestions: 523,
  averageScore: 72.5,
  activeStudentsToday: 342,
};

// Helper function to get tests by grade level
export function getTestsByGradeLevel(gradeLevel: number): Test[] {
  return mockTests.filter(test => test.gradeLevel <= gradeLevel);
}

// Helper function to get questions by filters
export function getQuestionsByFilters(
  gradeLevel?: number,
  subject?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question[] {
  return mockQuestions.filter(q => {
    if (gradeLevel && q.gradeLevel > gradeLevel) return false;
    if (subject && q.subject !== subject) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    return true;
  });
}

// Helper function to randomize array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to calculate adaptive difficulty
export function getAdaptiveDifficulty(
  currentScore: number,
  totalQuestions: number,
  currentQuestionIndex: number
): 'easy' | 'medium' | 'hard' {
  const accuracy = currentScore / (currentQuestionIndex || 1);
  
  if (accuracy >= 0.8) return 'hard';
  if (accuracy >= 0.6) return 'medium';
  return 'easy';
}

// Helper function to get next adaptive question
export function getNextAdaptiveQuestion(
  allQuestions: Question[],
  answeredQuestions: string[],
  currentDifficulty: 'easy' | 'medium' | 'hard'
): Question | undefined {
  const unanswered = allQuestions.filter(q => !answeredQuestions.includes(q.id));
  const byDifficulty = unanswered.filter(q => q.difficulty === currentDifficulty);
  
  if (byDifficulty.length > 0) {
    return byDifficulty[Math.floor(Math.random() * byDifficulty.length)];
  }
  
  return unanswered[0];
}

// Helper function to calculate weighted score
export function calculateWeightedScore(
  answers: Record<string, string | number>,
  questions: Question[]
): { score: number; totalWeight: number } {
  let score = 0;
  let totalWeight = 0;

  questions.forEach((q, idx) => {
    const weight = q.weight || 1;
    totalWeight += weight;

    if (idx.toString() in answers && answers[idx.toString()] === q.correctAnswer) {
      score += weight;
    }
  });

  return { score, totalWeight };
}

// Helper function to generate placement recommendation
export function generatePlacementRecommendation(
  percentage: number,
  subject: string,
  currentGrade: number,
  strengths: string[],
  weaknesses: string[]
): PlacementRecommendation {
  let recommendedGrade = currentGrade;
  let confidenceScore = 0;

  if (percentage >= 85) {
    recommendedGrade = Math.min(12, currentGrade + 2);
    confidenceScore = 0.95;
  } else if (percentage >= 75) {
    recommendedGrade = Math.min(12, currentGrade + 1);
    confidenceScore = 0.90;
  } else if (percentage >= 60) {
    recommendedGrade = currentGrade;
    confidenceScore = 0.85;
  } else if (percentage >= 45) {
    recommendedGrade = Math.max(4, currentGrade - 1);
    confidenceScore = 0.80;
  } else {
    recommendedGrade = Math.max(4, currentGrade - 2);
    confidenceScore = 0.75;
  }

  return {
    subject,
    recommendedGrade,
    confidenceScore,
    strengths,
    areasToImprove: weaknesses,
    suggestedNextSteps: [
      `Review ${weaknesses[0] || 'foundational concepts'}`,
      `Practice with Grade ${recommendedGrade} level materials`,
      `Take the placement test again after 2 weeks of practice`,
    ],
  };
}

// New interfaces for gamification and advanced features

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StudentLevel {
  level: number;
  xp: number;
  nextLevelXp: number;
  totalXp: number;
}

export interface StudentStreak {
  currentStreak: number;
  longestStreak: number;
  lastTestDate: string;
}

export interface StudentStats {
  studentId: string;
  totalTestsTaken: number;
  averageScore: number;
  totalXp: number;
  level: StudentLevel;
  streak: StudentStreak;
  achievements: Achievement[];
  subjectMastery: Record<string, number>; // subject -> percentage
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  gradeLevel: number;
  totalXp: number;
  level: number;
  averageScore: number;
  testsTaken: number;
  streak: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'test_available' | 'result_ready' | 'achievement' | 'streak_reminder' | 'system';
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ProgressEntry {
  date: string;
  testId: string;
  testTitle: string;
  subject: string;
  score: number;
  percentage: number;
}

export interface StudentProgress {
  studentId: string;
  progressHistory: ProgressEntry[];
  goals: LearningGoal[];
}

export interface LearningGoal {
  id: string;
  subject: string;
  targetPercentage: number;
  deadline: string;
  achieved: boolean;
  currentPercentage: number;
}

export interface TestReview {
  testId: string;
  testTitle: string;
  completedAt: string;
  score: number;
  percentage: number;
  questions: QuestionReview[];
}

export interface QuestionReview {
  questionId: string;
  question: Question;
  studentAnswer: string | number;
  isCorrect: boolean;
  explanation: string;
}

export interface AdminAnalytics {
  totalTestsTaken: number;
  averageScore: number;
  activeUsers: number;
  dailyActiveUsers: number;
  questionMetrics: QuestionMetric[];
  engagementMetrics: EngagementMetric;
}

export interface QuestionMetric {
  questionId: string;
  questionText: string;
  passRate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timesAnswered: number;
  averageTimeSpent: number;
}

export interface EngagementMetric {
  testsPerDay: number;
  averageSessionDuration: number;
  returnRate: number;
  completionRate: number;
}

// Mock leaderboard data
export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    studentId: 'student-001',
    studentName: 'Alex Johnson',
    gradeLevel: 8,
    totalXp: 4850,
    level: 12,
    averageScore: 94,
    testsTaken: 28,
    streak: 15,
  },
  {
    rank: 2,
    studentId: 'student-003',
    studentName: 'Jordan Johnson',
    gradeLevel: 6,
    totalXp: 4320,
    level: 11,
    averageScore: 91,
    testsTaken: 25,
    streak: 12,
  },
  {
    rank: 3,
    studentId: 'student-005',
    studentName: 'Casey Williams',
    gradeLevel: 8,
    totalXp: 3890,
    level: 10,
    averageScore: 88,
    testsTaken: 22,
    streak: 8,
  },
  {
    rank: 4,
    studentId: 'student-007',
    studentName: 'Morgan Lee',
    gradeLevel: 7,
    totalXp: 3450,
    level: 9,
    averageScore: 85,
    testsTaken: 20,
    streak: 6,
  },
  {
    rank: 5,
    studentId: 'student-009',
    studentName: 'Taylor Brown',
    gradeLevel: 8,
    totalXp: 3120,
    level: 8,
    averageScore: 82,
    testsTaken: 18,
    streak: 5,
  },
];

// Mock achievements
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-001',
    name: 'Perfect Score',
    description: 'Score 100% on a test',
    icon: '⭐',
    rarity: 'epic',
    unlockedAt: '2026-04-15',
  },
  {
    id: 'ach-002',
    name: '5-Day Streak',
    description: 'Complete tests for 5 consecutive days',
    icon: '🔥',
    rarity: 'rare',
    unlockedAt: '2026-04-10',
  },
  {
    id: 'ach-003',
    name: 'Speed Demon',
    description: 'Complete a test in half the allocated time',
    icon: '⚡',
    rarity: 'rare',
  },
  {
    id: 'ach-004',
    name: 'Subject Master',
    description: 'Achieve 90%+ average in a subject',
    icon: '🏆',
    rarity: 'legendary',
    unlockedAt: '2026-04-08',
  },
  {
    id: 'ach-005',
    name: 'First Steps',
    description: 'Complete your first test',
    icon: '🎯',
    rarity: 'common',
    unlockedAt: '2026-03-20',
  },
];

// Mock student stats
export const mockStudentStats: StudentStats = {
  studentId: 'student-001',
  totalTestsTaken: 28,
  averageScore: 94,
  totalXp: 4850,
  level: {
    level: 12,
    xp: 850,
    nextLevelXp: 1000,
    totalXp: 4850,
  },
  streak: {
    currentStreak: 15,
    longestStreak: 20,
    lastTestDate: '2026-05-08',
  },
  achievements: mockAchievements,
  subjectMastery: {
    Mathematics: 96,
    English: 92,
    Science: 94,
    History: 88,
    Geography: 90,
  },
};

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'student-001',
    type: 'test_available',
    title: 'New Test Available',
    message: 'A new Mathematics test is now available for Grade 8 students.',
    icon: '📝',
    read: false,
    createdAt: '2026-05-08T10:30:00Z',
    actionUrl: '/student-dashboard',
  },
  {
    id: 'notif-002',
    userId: 'student-001',
    type: 'result_ready',
    title: 'Test Results Ready',
    message: 'Your English test results are now available. You scored 92%!',
    icon: '✅',
    read: false,
    createdAt: '2026-05-07T15:45:00Z',
    actionUrl: '/results/test-005',
  },
  {
    id: 'notif-003',
    userId: 'student-001',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You unlocked the "Subject Master" achievement in Mathematics!',
    icon: '🏆',
    read: true,
    createdAt: '2026-05-06T12:00:00Z',
  },
  {
    id: 'notif-004',
    userId: 'student-001',
    type: 'streak_reminder',
    title: 'Keep Your Streak Going!',
    message: 'You have a 15-day streak! Complete a test today to keep it alive.',
    icon: '🔥',
    read: true,
    createdAt: '2026-05-08T08:00:00Z',
  },
];

// Mock progress history
export const mockProgressHistory: ProgressEntry[] = [
  { date: '2026-05-08', testId: 'test-001', testTitle: 'Math Basics', subject: 'Mathematics', score: 94, percentage: 94 },
  { date: '2026-05-07', testId: 'test-005', testTitle: 'English Literature', subject: 'English', score: 92, percentage: 92 },
  { date: '2026-05-06', testId: 'test-003', testTitle: 'Science Fundamentals', subject: 'Science', score: 88, percentage: 88 },
  { date: '2026-05-05', testId: 'test-002', testTitle: 'Advanced Math', subject: 'Mathematics', score: 96, percentage: 96 },
  { date: '2026-05-04', testId: 'test-004', testTitle: 'World History', subject: 'History', score: 85, percentage: 85 },
  { date: '2026-05-03', testId: 'test-001', testTitle: 'Math Basics', subject: 'Mathematics', score: 90, percentage: 90 },
  { date: '2026-05-02', testId: 'test-006', testTitle: 'Geography Essentials', subject: 'Geography', score: 87, percentage: 87 },
  { date: '2026-05-01', testId: 'test-005', testTitle: 'English Literature', subject: 'English', score: 89, percentage: 89 },
];

// Mock learning goals
export const mockLearningGoals: LearningGoal[] = [
  {
    id: 'goal-001',
    subject: 'Mathematics',
    targetPercentage: 95,
    deadline: '2026-06-01',
    achieved: false,
    currentPercentage: 94,
  },
  {
    id: 'goal-002',
    subject: 'English',
    targetPercentage: 90,
    deadline: '2026-05-25',
    achieved: true,
    currentPercentage: 92,
  },
  {
    id: 'goal-003',
    subject: 'Science',
    targetPercentage: 85,
    deadline: '2026-06-15',
    achieved: false,
    currentPercentage: 88,
  },
];

// Mock admin analytics
export const mockAdminAnalytics: AdminAnalytics = {
  totalTestsTaken: 1243,
  averageScore: 87.5,
  activeUsers: 342,
  dailyActiveUsers: 156,
  questionMetrics: [
    {
      questionId: 'q-001',
      questionText: 'What is the capital of France?',
      passRate: 98,
      difficulty: 'easy',
      timesAnswered: 245,
      averageTimeSpent: 12,
    },
    {
      questionId: 'q-002',
      questionText: 'Solve: 2x + 5 = 15',
      passRate: 85,
      difficulty: 'medium',
      timesAnswered: 189,
      averageTimeSpent: 45,
    },
    {
      questionId: 'q-003',
      questionText: 'Explain photosynthesis in detail',
      passRate: 62,
      difficulty: 'hard',
      timesAnswered: 134,
      averageTimeSpent: 120,
    },
  ],
  engagementMetrics: {
    testsPerDay: 3.6,
    averageSessionDuration: 28,
    returnRate: 0.72,
    completionRate: 0.89,
  },
};


// AI-Powered Features Data Structures

export interface AIGeneratedQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  subject: string;
  gradeLevel: number;
  difficulty: 'easy' | 'medium' | 'hard';
  generatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  topic: string;
  confidenceScore: number; // 0-100
}

export interface PerformancePattern {
  id: string;
  studentId: string;
  pattern: string;
  description: string;
  frequency: number;
  affectedTopics: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AIInsight {
  id: string;
  studentId: string;
  type: 'strength' | 'weakness' | 'recommendation';
  title: string;
  description: string;
  relatedTopics: string[];
  actionItems: string[];
  generatedAt: string;
}

export interface AdaptiveTestConfig {
  id: string;
  studentId: string;
  focusAreas: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  estimatedDuration: number;
  reasonForSelection: string[];
}

export interface CheatDetectionFlag {
  id: string;
  testId: string;
  studentId: string;
  flagType: 'unusual_speed' | 'score_jump' | 'pattern_anomaly' | 'timing_inconsistency';
  confidenceScore: number; // 0-100
  reasoning: string;
  flaggedAt: string;
  status: 'pending' | 'reviewed' | 'confirmed' | 'dismissed';
}

export interface DifficultyCalibration {
  id: string;
  questionId: string;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
  passRate: number; // percentage
  recommendation: string;
  reasoning: string;
}

// Mock AI-Generated Questions
export const mockAIGeneratedQuestions: AIGeneratedQuestion[] = [
  {
    id: 'ai-q-1',
    text: 'What is the process by which plants convert sunlight into chemical energy?',
    type: 'mcq',
    options: ['Photosynthesis', 'Respiration', 'Fermentation', 'Oxidation'],
    correctAnswer: 0,
    explanation: 'Photosynthesis is the process where plants use sunlight, water, and carbon dioxide to create glucose and oxygen.',
    subject: 'Science',
    gradeLevel: 7,
    difficulty: 'medium',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    topic: 'Plant Biology',
    confidenceScore: 92,
  },
  {
    id: 'ai-q-2',
    text: 'The mitochondria is often called the "powerhouse of the cell" because it produces ATP.',
    type: 'trueFalse',
    correctAnswer: 1,
    explanation: 'True. Mitochondria generates ATP (adenosine triphosphate) through cellular respiration, which provides energy for cellular functions.',
    subject: 'Science',
    gradeLevel: 8,
    difficulty: 'medium',
    generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    topic: 'Cell Biology',
    confidenceScore: 88,
  },
  {
    id: 'ai-q-3',
    text: 'Which of the following is a prime number?',
    type: 'mcq',
    options: ['15', '21', '29', '35'],
    correctAnswer: 2,
    explanation: '29 is a prime number because it is only divisible by 1 and itself. 15=3×5, 21=3×7, 35=5×7 are all composite.',
    subject: 'Math',
    gradeLevel: 6,
    difficulty: 'easy',
    generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    topic: 'Number Theory',
    confidenceScore: 95,
  },
];

// Mock Performance Patterns
export const mockPerformancePatterns: PerformancePattern[] = [
  {
    id: 'pattern-1',
    studentId: 'student-1',
    pattern: 'Word Problem Struggle',
    description: 'Student consistently struggles with multi-step word problems requiring reading comprehension and mathematical reasoning.',
    frequency: 8,
    affectedTopics: ['Algebra', 'Geometry', 'Word Problems'],
    severity: 'high',
  },
  {
    id: 'pattern-2',
    studentId: 'student-1',
    pattern: 'Grammar Strength',
    description: 'Student demonstrates strong understanding of grammar rules and sentence structure across all test attempts.',
    frequency: 12,
    affectedTopics: ['Grammar', 'Punctuation', 'Sentence Structure'],
    severity: 'low',
  },
  {
    id: 'pattern-3',
    studentId: 'student-1',
    pattern: 'Time Management Issues',
    description: 'Student frequently runs out of time on tests, leaving questions unanswered despite having the knowledge.',
    frequency: 5,
    affectedTopics: ['All Subjects'],
    severity: 'medium',
  },
];

// Mock AI Insights
export const mockAIInsights: AIInsight[] = [
  {
    id: 'insight-1',
    studentId: 'student-1',
    type: 'weakness',
    title: 'Struggling with Algebraic Expressions',
    description: 'Analysis of your recent tests shows you have difficulty simplifying algebraic expressions and solving equations with multiple variables.',
    relatedTopics: ['Algebra', 'Variables', 'Equations'],
    actionItems: [
      'Practice simplifying expressions with 2-3 variables',
      'Review the order of operations (PEMDAS)',
      'Work through step-by-step equation solving',
    ],
    generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'insight-2',
    studentId: 'student-1',
    type: 'strength',
    title: 'Excellent Reading Comprehension',
    description: 'Your reading comprehension scores are consistently high. You excel at understanding main ideas and inferring meaning from context.',
    relatedTopics: ['Reading', 'Comprehension', 'Inference'],
    actionItems: [
      'Continue practicing with complex texts',
      'Help peers with reading strategies',
      'Explore advanced literature topics',
    ],
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'insight-3',
    studentId: 'student-1',
    type: 'recommendation',
    title: 'Personalized Learning Path',
    description: 'Based on your performance, we recommend focusing on foundational algebra concepts before moving to advanced topics.',
    relatedTopics: ['Algebra', 'Foundations'],
    actionItems: [
      'Complete the "Algebra Basics" module',
      'Take 3 practice tests on linear equations',
      'Schedule a tutoring session on variables',
    ],
    generatedAt: new Date().toISOString(),
  },
];

// Mock Adaptive Test Configs
export const mockAdaptiveTestConfigs: AdaptiveTestConfig[] = [
  {
    id: 'adaptive-1',
    studentId: 'student-1',
    focusAreas: ['Algebra', 'Word Problems', 'Equations'],
    difficulty: 'medium',
    questionCount: 15,
    estimatedDuration: 30,
    reasonForSelection: [
      'Student has shown weakness in algebraic expressions',
      'Recent performance indicates need for word problem practice',
      'Medium difficulty recommended based on current level',
    ],
  },
];

// Mock Cheat Detection Flags
export const mockCheatDetectionFlags: CheatDetectionFlag[] = [
  {
    id: 'cheat-flag-1',
    testId: 'test-1',
    studentId: 'student-5',
    flagType: 'unusual_speed',
    confidenceScore: 78,
    reasoning: 'Student completed 20-question test in 8 minutes (avg 24 seconds per question). Previous average: 2-3 minutes per question.',
    flaggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: 'cheat-flag-2',
    testId: 'test-2',
    studentId: 'student-6',
    flagType: 'score_jump',
    confidenceScore: 65,
    reasoning: 'Student scored 45% on last 3 tests, then 92% on this test. Significant improvement without pattern of gradual increase.',
    flaggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'reviewed',
  },
];

// Mock Difficulty Calibrations
export const mockDifficultyCalibrations: DifficultyCalibration[] = [
  {
    id: 'calib-1',
    questionId: 'q-15',
    currentDifficulty: 'hard',
    suggestedDifficulty: 'medium',
    passRate: 72,
    recommendation: 'Move to Medium difficulty',
    reasoning: 'Pass rate of 72% suggests this question is easier than intended for "hard" difficulty. Medium difficulty questions typically have 40-60% pass rate.',
  },
  {
    id: 'calib-2',
    questionId: 'q-22',
    currentDifficulty: 'easy',
    suggestedDifficulty: 'medium',
    passRate: 35,
    recommendation: 'Move to Medium difficulty',
    reasoning: 'Pass rate of 35% is too low for "easy" difficulty. Question may be ambiguous or require clarification.',
  },
];

// Mock Study Assistant Responses
export const mockStudyAssistantResponses = [
  {
    topic: 'Photosynthesis',
    response: 'Great question! Photosynthesis is how plants make their own food using sunlight. Think of it like this: plants are like little solar panels! They take in sunlight, water from the soil, and carbon dioxide from the air. Then they create glucose (sugar for energy) and release oxygen as a byproduct. That oxygen is what we breathe! The process happens in two main stages: the light-dependent reactions (which need sunlight) and the light-independent reactions (which can happen in darkness). Would you like me to explain either of these in more detail?',
  },
  {
    topic: 'Fractions',
    response: 'Fractions can be tricky, but here\'s an easy way to think about them: A fraction is just a part of a whole. The number on top (numerator) tells you how many parts you have, and the number on the bottom (denominator) tells you how many equal parts the whole is divided into. For example, 3/4 means you have 3 out of 4 equal pieces. To add fractions, you need the same denominator (bottom number). If they\'re different, find a common denominator first. Want to try a practice problem?',
  },
  {
    topic: 'Essay Writing',
    response: 'Writing a great essay starts with a strong thesis statement - that\'s your main idea in one or two sentences. Then organize your thoughts into paragraphs: introduction, body paragraphs (each with one main idea), and conclusion. Each body paragraph should have evidence or examples supporting your thesis. Remember: topic sentence, supporting details, and a concluding sentence for each paragraph. Start with an outline before writing - it\'s like a roadmap for your essay! What topic are you writing about?',
  },
];


// Advanced Admin Features Data

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  details: string;
}

export interface PlatformSettings {
  testDuration: number;
  testQuestionCount: number;
  passingThreshold: number;
  scoringMethod: 'weighted' | 'equal';
  allowRetakes: boolean;
  retakesAllowed: number;
  showAnswersAfterTest: boolean;
  enableAdaptiveDifficulty: boolean;
  gradeMapping: { [key: number]: string };
}

export interface ContentVersion {
  id: string;
  questionId: string;
  version: number;
  content: string;
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'approved' | 'retired';
}

export interface FlaggedContent {
  id: string;
  contentId: string;
  contentType: 'question' | 'test' | 'user';
  reason: string;
  flaggedBy: string;
  flaggedAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  resolution?: string;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'students' | 'parents' | 'admins';
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface BrandSettings {
  platformName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  footerText: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  status: 'active' | 'revoked';
  permissions: string[];
}

// Mock data for advanced admin features
export const mockUserActivities: UserActivity[] = [
  {
    id: '1',
    userId: 'student1',
    action: 'test_completed',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    details: 'Completed Math Placement Test - Score: 85%',
  },
  {
    id: '2',
    userId: 'student2',
    action: 'login',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    details: 'Logged in from Chrome on Windows',
  },
  {
    id: '3',
    userId: 'admin1',
    action: 'question_created',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    details: 'Created 5 new Math questions',
  },
  {
    id: '4',
    userId: 'student3',
    action: 'test_started',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    details: 'Started English Reading Test',
  },
];

export const mockPlatformSettings: PlatformSettings = {
  testDuration: 15,
  testQuestionCount: 20,
  passingThreshold: 70,
  scoringMethod: 'weighted',
  allowRetakes: true,
  retakesAllowed: 3,
  showAnswersAfterTest: true,
  enableAdaptiveDifficulty: true,
  gradeMapping: {
    4: 'Grade 4',
    5: 'Grade 5',
    6: 'Grade 6',
    7: 'Grade 7',
    8: 'Grade 8',
    9: 'Grade 9',
    10: 'Grade 10',
    11: 'Grade 11',
    12: 'Grade 12',
  },
};

export const mockContentVersions: ContentVersion[] = [
  {
    id: '1',
    questionId: 'q1',
    version: 2,
    content: 'What is 2 + 2?',
    createdBy: 'admin1',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'approved',
  },
  {
    id: '2',
    questionId: 'q1',
    version: 1,
    content: 'What is the sum of 2 and 2?',
    createdBy: 'admin1',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'retired',
  },
];

export const mockFlaggedContent: FlaggedContent[] = [
  {
    id: '1',
    contentId: 'q5',
    contentType: 'question',
    reason: 'Ambiguous wording - multiple correct answers',
    flaggedBy: 'teacher1',
    flaggedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: '2',
    contentId: 'student2',
    contentType: 'user',
    reason: 'Suspicious test completion pattern - completed 10 tests in 2 hours',
    flaggedBy: 'admin1',
    flaggedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'reviewed',
    resolution: 'Investigated - student was using study materials',
  },
];

export const mockSystemLogs: SystemLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    level: 'info',
    message: 'User login successful',
    details: 'User: emily.chen@edupath.edu',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    level: 'warning',
    message: 'High server load detected',
    details: 'CPU usage: 85%, Memory usage: 72%',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    level: 'info',
    message: 'Backup completed successfully',
    details: 'Backup size: 2.3 GB',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Math Placement Test Available',
    content: 'We have launched a new advanced Math placement test for grades 9-12. All students are encouraged to take it.',
    audience: 'students',
    createdBy: 'admin1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'published',
  },
  {
    id: '2',
    title: 'System Maintenance Scheduled',
    content: 'The platform will be under maintenance on Saturday from 2 AM to 4 AM UTC.',
    audience: 'all',
    createdBy: 'admin1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'published',
  },
];

export const mockBrandSettings: BrandSettings = {
  platformName: 'EduPath',
  logoUrl: '/logo.png',
  primaryColor: '#2563eb',
  secondaryColor: '#10b981',
  customDomain: 'edutest-qva2upeq.manus.space',
  footerText: '© 2026 EduPath. All rights reserved.',
};

export const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Mobile App Integration',
    key: 'sk_live_abc123def456',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'active',
    permissions: ['read_tests', 'read_results', 'submit_answers'],
  },
  {
    id: '2',
    name: 'Analytics Dashboard',
    key: 'sk_live_xyz789uvw012',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'active',
    permissions: ['read_analytics', 'read_reports'],
  },
];

// Programmatically expand all client-side records to exactly 100 entries each to satisfy the global 100-entry database request
export function expandSimulatedDatabaseTo100() {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Matthew', 'Lisa', 'Daniel', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
  const subjects = ['Mathematics', 'Science', 'Geography', 'History', 'English'];
  const difficulties = ['easy', 'medium', 'hard'] as const;

  // 1. Expand mockAllUsers to 100
  const studentIds: string[] = [];
  const parentIds: string[] = [];
  mockAllUsers.forEach(u => {
    if (u.role === 'student') studentIds.push(u.id);
    if (u.role === 'parent') parentIds.push(u.id);
  });

  while (mockAllUsers.length < 100) {
    const idx = mockAllUsers.length;
    const id = `user-gen-${idx + 1}`;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${idx}@school.edu`;
    const role = Math.random() > 0.4 ? 'student' : (Math.random() > 0.5 ? 'parent' : 'admin');
    const gradeLevel = role === 'student' ? Math.floor(Math.random() * 9) + 4 : undefined;

    mockAllUsers.push({
      id,
      name,
      email,
      role,
      gradeLevel,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`,
      status: 'active',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
    } as any);

    if (role === 'student') studentIds.push(id);
    if (role === 'parent') parentIds.push(id);
  }

  // Ensure relationship mapping has at least 100 mapped pairs internally
  for (let i = 0; i < 100; i++) {
    const student = mockAllUsers.find(u => u.id === studentIds[i % studentIds.length]);
    const parent = mockAllUsers.find(u => u.id === parentIds[Math.floor(Math.random() * parentIds.length)]);
    if (student && parent) {
      if (!student.linkedParents) student.linkedParents = [];
      if (!student.linkedParents.includes(parent.id)) student.linkedParents.push(parent.id);
      if (!parent.linkedStudents) parent.linkedStudents = [];
      if (!parent.linkedStudents.includes(student.id)) parent.linkedStudents.push(student.id);
    }
  }

  // 2. Expand mockQuestions to 100
  while (mockQuestions.length < 100) {
    const idx = mockQuestions.length;
    const id = `q-gen-${idx + 1}`;
    const subject = subjects[idx % subjects.length];
    const difficulty = difficulties[idx % difficulties.length];
    const gradeLevel = Math.floor(Math.random() * 9) + 4;
    mockQuestions.push({
      id,
      text: `Solve conceptual diagnostic question number ${idx + 1} for ${subject} Grade ${gradeLevel}`,
      type: 'mcq',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Core concept assessment explanation.',
      subject,
      gradeLevel,
      difficulty,
      weight: difficulty === 'easy' ? 1.00 : (difficulty === 'medium' ? 1.50 : 2.00)
    });
  }

  // 3. Expand mockTests to 100
  while (mockTests.length < 100) {
    const idx = mockTests.length;
    const id = `test-gen-${idx + 1}`;
    const subject = subjects[idx % subjects.length];
    const grade = Math.floor(Math.random() * 9) + 4;
    const diff = difficulties[idx % difficulties.length];
    mockTests.push({
      id,
      title: `${subject} Diagnostic Quiz ${idx + 1}`,
      description: `Evaluate key curriculum parameters for ${subject} Grade ${grade}.`,
      subject,
      gradeLevel: grade,
      totalQuestions: 10,
      duration: 30,
      passingScore: 70,
      difficulty: diff,
      isAdaptive: idx % 8 === 0,
      isPlacementTest: idx % 15 === 0,
      questions: mockQuestions.filter(q => q.subject === subject).slice(0, 10)
    });
  }

  // 4. Expand mockTestResults to 100
  while (mockTestResults.length < 100) {
    const idx = mockTestResults.length;
    const id = `result-gen-${idx + 1}`;
    const studentId = studentIds[idx % studentIds.length];
    const test = mockTests[idx % mockTests.length];
    const score = Math.floor(Math.random() * 4) + 7;
    const percentage = score * 10;

    mockTestResults.push({
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
      strengths: ['Analytical Reasoning', 'Core Concepts'],
      weaknesses: ['Advanced Formulas'],
      isPlacementTest: test.isPlacementTest
    });
  }

  // 5. Expand mockCheatDetectionFlags to 100
  const flagTypes = ['unusual_speed', 'score_jump', 'multiple_ip', 'tab_switch'];
  while (mockCheatDetectionFlags.length < 100) {
    const idx = mockCheatDetectionFlags.length;
    const id = `cheat-flag-${idx + 1}`;
    const student = mockAllUsers.find(u => u.id === studentIds[idx % studentIds.length]);
    const test = mockTests[idx % mockTests.length];
    mockCheatDetectionFlags.push({
      id,
      studentId: student?.id || 'student-001',
      studentName: student?.name || 'Casey Smith',
      testId: test.id,
      testName: test.title,
      flagType: flagTypes[idx % flagTypes.length],
      confidenceScore: Math.floor(Math.random() * 35) + 60,
      reasoning: 'Rapid answer timing patterns flagged by AI detection parameters.',
      flaggedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      status: idx % 3 === 0 ? 'pending' : (idx % 3 === 1 ? 'reviewed' : 'cleared')
    } as any);
  }

  // 6. Expand mockContentVersions to 100
  while (mockContentVersions.length < 100) {
    const idx = mockContentVersions.length;
    const id = `version-${idx + 1}`;
    const q = mockQuestions[idx % mockQuestions.length];
    mockContentVersions.push({
      id,
      questionId: q.id,
      version: Math.floor(Math.random() * 3) + 1,
      content: `Updated diagnostic question text validation number ${idx + 1}`,
      createdBy: 'Dr. Emily Chen',
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      status: idx % 2 === 0 ? 'approved' : 'draft'
    });
  }

  // 7. Expand mockUserActivities to 100
  const actions = ['login', 'test_started', 'test_completed', 'question_created', 'flag_reviewed'];
  const details = [
    'Logged in successfully from desktop chrome browser',
    'Started diagnostic subject quiz',
    'Completed placement assessment exam',
    'Created new questions in Mathematics subject',
    'Marked suspicious cheating alert as cleared'
  ];
  while (mockUserActivities.length < 100) {
    const idx = mockUserActivities.length;
    const id = `act-gen-${idx + 1}`;
    const userItem = mockAllUsers[idx % mockAllUsers.length];
    mockUserActivities.push({
      id,
      userId: userItem.id,
      action: actions[idx % actions.length],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 4) * 24 * 60 * 60 * 1000),
      details: details[idx % details.length]
    });
  }
}

// Automatically seed simulated database on startup
expandSimulatedDatabaseTo100();

// -------------------------------------------------------------
// Teacher Dashboard & Curriculum Hierarchy definitions
// -------------------------------------------------------------

export interface Unit {
  id: string;
  subject: string;
  gradeLevel: number;
  name: string;
  description: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  name: string;
  description: string;
  orderNum: number;
}

export interface LessonMaterial {
  id: string;
  lessonId: string;
  type: 'video' | 'document';
  title: string;
  url: string;
  details?: string;
}

export const mockUnits: Unit[] = [
  { id: 'unit-001', subject: 'Mathematics', gradeLevel: 8, name: 'Algebraic Foundations', description: 'Understanding variables, expressions, and basic properties of algebra.' },
  { id: 'unit-002', subject: 'Mathematics', gradeLevel: 8, name: 'Linear Equations', description: 'Solving linear equations and graphing coordinate systems.' },
  { id: 'unit-003', subject: 'Science', gradeLevel: 8, name: 'Chemical Reactions', description: 'Exploring atomic bonds, chemical formulas, and equation balancing.' },
];

export const mockLessons: Lesson[] = [
  { id: 'lesson-001', unitId: 'unit-001', name: 'Variables & Expressions', description: 'Learn how to translate word problems into algebraic expressions.', orderNum: 1 },
  { id: 'lesson-002', unitId: 'unit-001', name: 'Distributive Property', description: 'Master expanding and factoring algebraic products.', orderNum: 2 },
  { id: 'lesson-003', unitId: 'unit-002', name: 'Solving 1-Step Equations', description: 'Using inverse operations to find the value of x.', orderNum: 1 },
  { id: 'lesson-004', unitId: 'unit-003', name: 'Atoms & Molecules', description: 'Understanding the building blocks of matter.', orderNum: 1 },
];

export const mockLessonMaterials: LessonMaterial[] = [
  { id: 'material-001', lessonId: 'lesson-001', type: 'video', title: 'English Grammar: Nouns and Verbs', url: 'https://www.youtube.com/embed/m7Yx3gC0kIM', details: 'A comprehensive video lesson explaining nouns and verbs.' },
  { id: 'material-002', lessonId: 'lesson-001', type: 'document', title: 'Variables Cheat Sheet PDF', url: '#', details: 'Printable overview of variables terminology.' },
  { id: 'material-003', lessonId: 'lesson-004', type: 'video', title: 'English Grammar: Adjectives and Adverbs', url: 'https://www.youtube.com/embed/_bU5F7dJ7qg', details: 'Introduction to adjectives and adverbs.' },
];

