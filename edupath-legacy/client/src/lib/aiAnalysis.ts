import { TestResult, Question, mockQuestions, mockTestResults, mockAllUsers } from './mockData';

/**
 * AI Analysis System for EduPath
 * Provides performance estimation, mistake analysis, and personalized guidance
 */

export interface PerformanceTrend {
  period: string;
  averageScore: number;
  testCount: number;
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
}

export interface MistakePattern {
  topic: string;
  subject: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  affectedQuestions: string[];
  recommendedFocus: string;
}

export interface PerformancePrediction {
  predictedScore: number;
  confidenceLevel: number;
  nextTestRecommendation: string;
  estimatedImprovement: number;
}

export interface StudentInsights {
  performanceTrends: PerformanceTrend[];
  mistakePatterns: MistakePattern[];
  prediction: PerformancePrediction;
  strengths: string[];
  weaknesses: string[];
  personalisedTips: string[];
  studyFocus: string[];
}

export interface PlatformInsights {
  mostMissedQuestions: Array<{
    questionId: string;
    questionText: string;
    subject: string;
    difficulty: string;
    missRate: number;
    studentCount: number;
  }>;
  commonMistakeTopics: MistakePattern[];
  subjectPerformance: Record<string, { averageScore: number; studentCount: number }>;
  difficultyAnalysis: Record<string, { averageScore: number; passRate: number }>;
}

/**
 * Analyze individual student performance trends
 */
export function analyzePerformanceTrends(studentId: string): PerformanceTrend[] {
  const studentResults = mockTestResults.filter(r => r.studentId === studentId);
  
  if (studentResults.length === 0) {
    return [];
  }

  // Sort by date
  const sorted = [...studentResults].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  // Group by week
  const trends: PerformanceTrend[] = [];
  const weeks = new Map<string, TestResult[]>();

  sorted.forEach(result => {
    const date = new Date(result.completedAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks.has(weekKey)) {
      weeks.set(weekKey, []);
    }
    weeks.get(weekKey)!.push(result);
  });

  let previousAvg = 0;
  weeks.forEach((results, weekKey) => {
    const avg = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    const trendPercentage = previousAvg ? ((avg - previousAvg) / previousAvg) * 100 : 0;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (trendPercentage > 5) trend = 'improving';
    else if (trendPercentage < -5) trend = 'declining';

    trends.push({
      period: new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      averageScore: Math.round(avg),
      testCount: results.length,
      trend,
      trendPercentage: Math.round(trendPercentage),
    });

    previousAvg = avg;
  });

  return trends;
}

/**
 * Identify common mistake patterns for a student
 */
export function identifyMistakePatterns(studentId: string): MistakePattern[] {
  const studentResults = mockTestResults.filter(r => r.studentId === studentId);
  
  if (studentResults.length === 0) {
    return [];
  }

  const mistakeMap = new Map<string, { count: number; questions: string[] }>();

  studentResults.forEach(result => {
    result.weaknesses?.forEach(weakness => {
      const key = `${result.subject}-${weakness}`;
      if (!mistakeMap.has(key)) {
        mistakeMap.set(key, { count: 0, questions: [] });
      }
      const entry = mistakeMap.get(key)!;
      entry.count++;
      
      // Find related questions
      mockQuestions.forEach(q => {
        if (q.subject === result.subject && 
            q.text.toLowerCase().includes(weakness.toLowerCase())) {
          if (!entry.questions.includes(q.id)) {
            entry.questions.push(q.id);
          }
        }
      });
    });
  });

  const patterns: MistakePattern[] = [];
  mistakeMap.forEach((value, key) => {
    const [subject, topic] = key.split('-');
    const severity = value.count >= 3 ? 'high' : value.count === 2 ? 'medium' : 'low';
    
    patterns.push({
      topic,
      subject,
      frequency: value.count,
      severity,
      affectedQuestions: value.questions,
      recommendedFocus: `Focus on ${topic} in ${subject}. Review concepts and practice similar problems.`,
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

/**
 * Predict future performance based on trends
 */
export function predictFuturePerformance(studentId: string): PerformancePrediction {
  const studentResults = mockTestResults.filter(r => r.studentId === studentId);
  
  if (studentResults.length === 0) {
    return {
      predictedScore: 0,
      confidenceLevel: 0,
      nextTestRecommendation: 'Take your first test to establish a baseline.',
      estimatedImprovement: 0,
    };
  }

  const sorted = [...studentResults].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const recentScores = sorted.slice(-5).map(r => r.percentage);
  const averageRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  
  // Calculate trend
  const firstHalf = recentScores.slice(0, Math.ceil(recentScores.length / 2));
  const secondHalf = recentScores.slice(Math.ceil(recentScores.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const trend = secondAvg - firstAvg;

  // Predict next score (with diminishing returns)
  const predictedScore = Math.min(100, Math.round(averageRecent + trend * 0.5));
  const confidenceLevel = Math.min(0.95, 0.5 + (recentScores.length * 0.1));

  const estimatedImprovement = Math.round(trend);
  
  let nextTestRecommendation = 'Continue with tests at your current level.';
  if (predictedScore >= 85) {
    nextTestRecommendation = 'You\'re doing great! Try a harder test to challenge yourself.';
  } else if (predictedScore < 65) {
    nextTestRecommendation = 'Consider reviewing fundamentals before attempting harder tests.';
  }

  return {
    predictedScore,
    confidenceLevel,
    nextTestRecommendation,
    estimatedImprovement,
  };
}

/**
 * Generate personalized study tips based on performance
 */
export function generatePersonalisedTips(studentId: string): string[] {
  const trends = analyzePerformanceTrends(studentId);
  const patterns = identifyMistakePatterns(studentId);
  const results = mockTestResults.filter(r => r.studentId === studentId);

  const tips: string[] = [];

  // Trend-based tips
  if (trends.length > 0) {
    const latestTrend = trends[trends.length - 1];
    if (latestTrend.trend === 'improving') {
      tips.push('🚀 Great momentum! Keep up the consistent practice.');
    } else if (latestTrend.trend === 'declining') {
      tips.push('⚠️ Your scores are declining. Take a break and review fundamentals.');
    }
  }

  // Mistake pattern tips
  if (patterns.length > 0) {
    const topMistake = patterns[0];
    if (topMistake.severity === 'high') {
      tips.push(`🎯 Focus on ${topMistake.topic} - this is your biggest challenge area.`);
    }
  }

  // Time management tips
  const avgTimeTaken = results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length;
  const avgDuration = results.reduce((sum, r) => sum + (mockTests.find(t => t.id === r.testId)?.duration || 0), 0) / results.length;
  
  if (avgTimeTaken > avgDuration * 0.9) {
    tips.push('⏱️ You\'re using most of the available time. Practice speed without sacrificing accuracy.');
  } else if (avgTimeTaken < avgDuration * 0.5) {
    tips.push('⏱️ You\'re finishing early. Take more time to double-check your answers.');
  }

  // Subject-based tips
  const subjectScores = new Map<string, number[]>();
  results.forEach(r => {
    if (!subjectScores.has(r.subject)) {
      subjectScores.set(r.subject, []);
    }
    subjectScores.get(r.subject)!.push(r.percentage);
  });

  subjectScores.forEach((scores, subject) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 70) {
      tips.push(`📚 ${subject} needs attention. Consider extra practice sessions.`);
    }
  });

  // Consistency tips
  if (results.length >= 3) {
    const variance = calculateVariance(results.map(r => r.percentage));
    if (variance > 200) {
      tips.push('📊 Your scores are inconsistent. Focus on mastering core concepts.');
    }
  }

  return tips.slice(0, 5); // Return top 5 tips
}

/**
 * Get study focus areas based on performance
 */
export function getStudyFocusAreas(studentId: string): string[] {
  const patterns = identifyMistakePatterns(studentId);
  const results = mockTestResults.filter(r => r.studentId === studentId);

  const focusAreas: string[] = [];

  // Add high-severity mistake patterns
  patterns.filter(p => p.severity === 'high').forEach(p => {
    focusAreas.push(`${p.topic} (${p.subject})`);
  });

  // Add weak subjects
  const subjectScores = new Map<string, number[]>();
  results.forEach(r => {
    if (!subjectScores.has(r.subject)) {
      subjectScores.set(r.subject, []);
    }
    subjectScores.get(r.subject)!.push(r.percentage);
  });

  subjectScores.forEach((scores, subject) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg < 75 && !focusAreas.some(f => f.includes(subject))) {
      focusAreas.push(`${subject} Fundamentals`);
    }
  });

  return focusAreas.slice(0, 5);
}

/**
 * Analyze platform-wide patterns (most missed questions, common mistakes)
 */
export function analyzePlatformPatterns(): PlatformInsights {
  // Most missed questions
  const questionMissCount = new Map<string, { count: number; total: number; question: Question | undefined }>();

  mockTestResults.forEach(result => {
    const test = mockTests.find(t => t.id === result.testId);
    if (test) {
      test.questions.forEach(q => {
        if (!questionMissCount.has(q.id)) {
          questionMissCount.set(q.id, { count: 0, total: 0, question: q });
        }
        const entry = questionMissCount.get(q.id)!;
        entry.total++;
        
        // Check if student got it wrong (simplified check)
        if (result.weaknesses?.some(w => q.text.toLowerCase().includes(w.toLowerCase()))) {
          entry.count++;
        }
      });
    }
  });

  const mostMissedQuestions = Array.from(questionMissCount.values())
    .filter(q => q.question && q.total > 0)
    .map(q => ({
      questionId: q.question!.id,
      questionText: q.question!.text.substring(0, 60) + '...',
      subject: q.question!.subject,
      difficulty: q.question!.difficulty,
      missRate: Math.round((q.count / q.total) * 100),
      studentCount: q.total,
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 10);

  // Common mistake topics across platform
  const commonMistakes: MistakePattern[] = [];
  const topicMistakes = new Map<string, { count: number; subject: string }>();

  mockTestResults.forEach(result => {
    result.weaknesses?.forEach(weakness => {
      const key = `${result.subject}-${weakness}`;
      if (!topicMistakes.has(key)) {
        topicMistakes.set(key, { count: 0, subject: result.subject });
      }
      topicMistakes.get(key)!.count++;
    });
  });

  topicMistakes.forEach((value, key) => {
    const [subject, topic] = key.split('-');
    if (value.count >= 2) {
      commonMistakes.push({
        topic,
        subject,
        frequency: value.count,
        severity: value.count >= 5 ? 'high' : value.count >= 3 ? 'medium' : 'low',
        affectedQuestions: [],
        recommendedFocus: `Platform-wide issue: ${topic} in ${subject}`,
      });
    }
  });

  // Subject performance
  const subjectPerformance: Record<string, { averageScore: number; studentCount: number }> = {};
  const subjectScores = new Map<string, number[]>();

  mockTestResults.forEach(result => {
    if (!subjectScores.has(result.subject)) {
      subjectScores.set(result.subject, []);
    }
    subjectScores.get(result.subject)!.push(result.percentage);
  });

  subjectScores.forEach((scores, subject) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const uniqueStudents = new Set(mockTestResults.filter(r => r.subject === subject).map(r => r.studentId)).size;
    subjectPerformance[subject] = {
      averageScore: Math.round(avg),
      studentCount: uniqueStudents,
    };
  });

  // Difficulty analysis
  const difficultyAnalysis: Record<string, { averageScore: number; passRate: number }> = {};
  const difficultyScores = new Map<string, { scores: number[]; passed: number; total: number }>();

  mockTestResults.forEach(result => {
    const test = mockTests.find(t => t.id === result.testId);
    if (test) {
      const difficulty = test.difficulty;
      if (!difficultyScores.has(difficulty)) {
        difficultyScores.set(difficulty, { scores: [], passed: 0, total: 0 });
      }
      const entry = difficultyScores.get(difficulty)!;
      entry.scores.push(result.percentage);
      entry.total++;
      if (result.percentage >= test.passingScore) {
        entry.passed++;
      }
    }
  });

  difficultyScores.forEach((value, difficulty) => {
    const avg = value.scores.reduce((a, b) => a + b, 0) / value.scores.length;
    const passRate = (value.passed / value.total) * 100;
    difficultyAnalysis[difficulty] = {
      averageScore: Math.round(avg),
      passRate: Math.round(passRate),
    };
  });

  return {
    mostMissedQuestions,
    commonMistakeTopics: commonMistakes.sort((a, b) => b.frequency - a.frequency),
    subjectPerformance,
    difficultyAnalysis,
  };
}

/**
 * Get comprehensive student insights
 */
export function getStudentInsights(studentId: string): StudentInsights {
  return {
    performanceTrends: analyzePerformanceTrends(studentId),
    mistakePatterns: identifyMistakePatterns(studentId),
    prediction: predictFuturePerformance(studentId),
    strengths: getStudentStrengths(studentId),
    weaknesses: getStudentWeaknesses(studentId),
    personalisedTips: generatePersonalisedTips(studentId),
    studyFocus: getStudyFocusAreas(studentId),
  };
}

/**
 * Helper: Get student strengths
 */
function getStudentStrengths(studentId: string): string[] {
  const results = mockTestResults.filter(r => r.studentId === studentId);
  if (results.length === 0) {
    return ['Active Learning', 'Quiz Engagement'];
  }

  // Sort chronologically: oldest to newest
  const sortedResults = [...results].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const strengths = new Set<string>();
  const weaknesses = new Set<string>();

  sortedResults.forEach(r => {
    // Standardize casing
    r.strengths?.forEach(s => {
      const formatted = s.trim();
      if (formatted) {
        strengths.add(formatted);
        // Remove from weaknesses if it is now demonstrated as a strength
        weaknesses.delete(formatted);
      }
    });

    r.weaknesses?.forEach(w => {
      const formatted = w.trim();
      if (formatted) {
        weaknesses.add(formatted);
        // Remove from strengths if it is now shown as a weakness
        strengths.delete(formatted);
      }
    });
  });

  return Array.from(strengths).slice(0, 5);
}

/**
 * Helper: Get student weaknesses
 */
function getStudentWeaknesses(studentId: string): string[] {
  const results = mockTestResults.filter(r => r.studentId === studentId);
  
  // Find user details to suggest baseline weaknesses if none exist
  const user = mockAllUsers.find(u => u.id === studentId);
  const grade = user?.gradeLevel || 8;

  if (results.length === 0) {
    // Provide baseline focus areas for fresh profiles to kickstart training
    return grade <= 6 ? ['Fractions', 'Water Cycle'] : ['Algebra', 'Photosynthesis'];
  }

  // Sort chronologically: oldest to newest
  const sortedResults = [...results].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const strengths = new Set<string>();
  const weaknesses = new Set<string>();

  sortedResults.forEach(r => {
    r.strengths?.forEach(s => {
      const formatted = s.trim();
      if (formatted) {
        strengths.add(formatted);
        weaknesses.delete(formatted);
      }
    });

    r.weaknesses?.forEach(w => {
      const formatted = w.trim();
      if (formatted) {
        weaknesses.add(formatted);
        strengths.delete(formatted);
      }
    });
  });

  // Ensure fresh profiles with tests but no explicit weaknesses still have something to focus on
  const finalWeaknesses = Array.from(weaknesses);
  if (finalWeaknesses.length === 0) {
    return grade <= 6 ? ['Fractions'] : ['Algebra'];
  }

  return finalWeaknesses.slice(0, 5);
}

/**
 * Helper: Calculate variance for consistency analysis
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

// Import mockTests for time calculations
import { mockTests } from './mockData';
