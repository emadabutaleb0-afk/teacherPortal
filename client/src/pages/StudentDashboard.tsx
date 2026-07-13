import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { mockTests, mockTestResults, getTestsByGradeLevel, availableSubjects, availableGrades, Question, TestResult, mockEnrollments, mockAllUsers } from '@/lib/mockData';
import { BarChart3, BookOpen, TrendingUp, Clock, CheckCircle2, AlertCircle, Brain, Target, Lightbulb, TrendingDown, Atom, Compass, History, HelpCircle, ArrowRight, Video, File, ArrowUpRight, Loader2, Sparkles, CheckCircle, XCircle, GraduationCap, Calendar, Trophy, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getStudentInsights } from '@/lib/aiAnalysis';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { saveResultToDB, hydrateDatabaseState, unenrollStudent } from '@/lib/dbSync';
import { toast } from 'sonner';

const getSubjectIcon = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return <Brain className="w-3.5 h-3.5" />;
    case 'Science': return <Atom className="w-3.5 h-3.5" />;
    case 'Geography': return <Compass className="w-3.5 h-3.5" />;
    case 'History': return <History className="w-3.5 h-3.5" />;
    case 'English': return <BookOpen className="w-3.5 h-3.5" />;
    default: return <HelpCircle className="w-3.5 h-3.5" />;
  }
};

const getSubjectColor = (sub: string) => {
  switch (sub) {
    case 'Mathematics': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-800/40';
    case 'Science': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/40';
    case 'Geography': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/50 dark:border-sky-800/40';
    case 'History': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/40';
    case 'English': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-800/40';
    default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/40';
  }
};

interface RetrainingQuestion {
  id: string;
  text: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  subject: string;
  topic: string;
}

const RETRAINING_QUESTIONS_DB: Record<string, RetrainingQuestion[]> = {
  photosynthesis: [
    {
      id: 'retrain-photo-1',
      text: "What are the primary products of photosynthesis?",
      type: "mcq",
      options: ["Oxygen and Glucose", "Carbon Dioxide and Water", "Nitrogen and Starch", "Carbon Dioxide and Sugar"],
      correctAnswer: 0,
      explanation: "During photosynthesis, plants convert carbon dioxide and water into glucose (sugar) and oxygen in the presence of light.",
      subject: "Science",
      topic: "Photosynthesis"
    },
    {
      id: 'retrain-photo-2',
      text: "Which pigment in plants absorbs light energy for photosynthesis?",
      type: "mcq",
      options: ["Carotenoid", "Chlorophyll", "Anthocyanin", "Hemoglobin"],
      correctAnswer: 1,
      explanation: "Chlorophyll is the green pigment located inside chloroplasts that absorbs sunlight to drive the reaction.",
      subject: "Science",
      topic: "Photosynthesis"
    },
    {
      id: 'retrain-photo-3',
      text: "Which cell organelle is the primary site where photosynthesis takes place?",
      type: "mcq",
      options: ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"],
      correctAnswer: 2,
      explanation: "Chloroplasts contain chlorophyll and house the light-dependent and light-independent stages of photosynthesis.",
      subject: "Science",
      topic: "Photosynthesis"
    },
    {
      id: 'retrain-photo-4',
      text: "True or False: Oxygen is a reactant absorbed by plants to drive photosynthesis.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False. Oxygen is a product of photosynthesis. Carbon dioxide is the gas reactant absorbed from the atmosphere.",
      subject: "Science",
      topic: "Photosynthesis"
    },
    {
      id: 'retrain-photo-5',
      text: "What represents the main source of energy fueling the photosynthesis process?",
      type: "mcq",
      options: ["Water nutrients", "Soil fertilizer", "Sunlight", "Ambient temperature"],
      correctAnswer: 2,
      explanation: "Sunlight provides the electromagnetic energy required to split water molecules and drive glucose synthesis.",
      subject: "Science",
      topic: "Photosynthesis"
    }
  ],
  fractions: [
    {
      id: 'retrain-frac-1',
      text: "Which fraction is equivalent to the decimal 0.75?",
      type: "mcq",
      options: ["1/2", "2/3", "3/4", "4/5"],
      correctAnswer: 2,
      explanation: "0.75 is seventy-five hundredths (75/100), which simplifies down to 3/4.",
      subject: "Mathematics",
      topic: "Fractions"
    },
    {
      id: 'retrain-frac-2',
      text: "What is the sum of 1/4 and 2/5?",
      type: "mcq",
      options: ["3/9", "3/20", "13/20", "7/10"],
      correctAnswer: 2,
      explanation: "To add fractions, find the least common denominator (20). 1/4 becomes 5/20 and 2/5 becomes 8/20. Their sum is 13/20.",
      subject: "Mathematics",
      topic: "Fractions"
    },
    {
      id: 'retrain-frac-3',
      text: "What is 2/3 multiplied by 3/8 in simplest form?",
      type: "mcq",
      options: ["6/24", "1/4", "5/11", "9/16"],
      correctAnswer: 1,
      explanation: "Multiply numerators and denominators: (2 * 3) / (3 * 8) = 6/24, which simplifies to 1/4.",
      subject: "Mathematics",
      topic: "Fractions"
    },
    {
      id: 'retrain-frac-4',
      text: "True or False: Dividing a number by 1/2 is mathematically equivalent to multiplying it by 2.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "True. To divide by a fraction, you multiply by its reciprocal. The reciprocal of 1/2 is 2.",
      subject: "Mathematics",
      topic: "Fractions"
    },
    {
      id: 'retrain-frac-5',
      text: "Which of the following fractions is the largest?",
      type: "mcq",
      options: ["5/8", "1/2", "3/4", "7/12"],
      correctAnswer: 2,
      explanation: "Converting to decimals: 5/8 = 0.625, 1/2 = 0.50, 3/4 = 0.75, 7/12 = 0.583. Therefore, 3/4 is the largest.",
      subject: "Mathematics",
      topic: "Fractions"
    }
  ],
  algebra: [
    {
      id: 'retrain-alg-1',
      text: "Solve for x in the linear equation: 3x + 7 = 22.",
      type: "mcq",
      options: ["x = 5", "x = 7", "x = 9", "x = 15"],
      correctAnswer: 0,
      explanation: "Subtract 7 from both sides: 3x = 15. Divide both sides by 3: x = 5.",
      subject: "Mathematics",
      topic: "Algebra"
    },
    {
      id: 'retrain-alg-2',
      text: "What are the roots of the quadratic equation x^2 - 5x + 6 = 0?",
      type: "mcq",
      options: ["x = 2 and x = 3", "x = 1 and x = 6", "x = -2 and x = -3", "x = 5 and x = 6"],
      correctAnswer: 0,
      explanation: "Factoring the quadratic expression yields (x - 2)(x - 3) = 0, so the roots are x = 2 and x = 3.",
      subject: "Mathematics",
      topic: "Algebra"
    },
    {
      id: 'retrain-alg-3',
      text: "Simplify the algebraic expression: 2(x + 4) - 3x.",
      type: "mcq",
      options: ["8 - x", "8 + x", "5x + 8", "2x - 1"],
      correctAnswer: 0,
      explanation: "Distribute the 2: 2x + 8 - 3x. Combining like terms results in 8 - x.",
      subject: "Mathematics",
      topic: "Algebra"
    },
    {
      id: 'retrain-alg-4',
      text: "True or False: The slope of a horizontal line is undefined.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False. A horizontal line has a slope of 0. A vertical line has an undefined slope.",
      subject: "Mathematics",
      topic: "Algebra"
    },
    {
      id: 'retrain-alg-5',
      text: "Solve the inequality: -2x + 5 < 11.",
      type: "mcq",
      options: ["x < -3", "x > -3", "x < 3", "x > 3"],
      correctAnswer: 1,
      explanation: "Subtract 5: -2x < 6. Divide by -2 and reverse the inequality sign: x > -3.",
      subject: "Mathematics",
      topic: "Algebra"
    }
  ],
  watercycle: [
    {
      id: 'retrain-water-1',
      text: "What is the process called when water vapor cools and turns back into liquid water droplets?",
      type: "mcq",
      options: ["Evaporation", "Condensation", "Precipitation", "Transpiration"],
      correctAnswer: 1,
      explanation: "Condensation occurs when water vapor cools down and changes phase into liquid water, forming clouds.",
      subject: "Science",
      topic: "Water Cycle"
    },
    {
      id: 'retrain-water-2',
      text: "Which term describes water evaporating directly from the pores of plant leaves?",
      type: "mcq",
      options: ["Sublimation", "Infiltration", "Transpiration", "Runoff"],
      correctAnswer: 2,
      explanation: "Transpiration is the process of water movement through a plant and its evaporation from aerial parts, such as leaves.",
      subject: "Science",
      topic: "Water Cycle"
    },
    {
      id: 'retrain-water-3',
      text: "What is the primary engine of energy that drives the global water cycle?",
      type: "mcq",
      options: ["The Sun", "Wind currents", "Tectonic shift", "Geothermal vents"],
      correctAnswer: 0,
      explanation: "The Sun warms the earth and oceans, causing water to evaporate and driving atmospheric currents.",
      subject: "Science",
      topic: "Water Cycle"
    },
    {
      id: 'retrain-water-4',
      text: "True or False: Runoff refers to water that sinks deep into the soil to replenish underground aquifers.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False. Runoff is water that flows over the surface of the ground. Water sinking into the soil is called infiltration or percolation.",
      subject: "Science",
      topic: "Water Cycle"
    },
    {
      id: 'retrain-water-5',
      text: "What phase change occurs when solid ice changes directly into water vapor?",
      type: "mcq",
      options: ["Melting", "Sublimation", "Deposition", "Condensation"],
      correctAnswer: 1,
      explanation: "Sublimation is the transition of a substance directly from the solid to the gas phase without passing through the liquid phase.",
      subject: "Science",
      topic: "Water Cycle"
    }
  ],
  worldwarii: [
    {
      id: 'retrain-ww2-1',
      text: "What surprise attack prompted the United States to officially enter World War II?",
      type: "mcq",
      options: ["The invasion of Poland", "The bombing of London", "The attack on Pearl Harbor", "The Battle of Stalingrad"],
      correctAnswer: 2,
      explanation: "The surprise military strike by the Imperial Japanese Navy on Pearl Harbor on December 7, 1941, led the US to declare war.",
      subject: "History",
      topic: "World War II"
    },
    {
      id: 'retrain-ww2-2',
      text: "In which year did World War II officially come to an end?",
      type: "mcq",
      options: ["1939", "1941", "1945", "1950"],
      correctAnswer: 2,
      explanation: "World War II ended in September 1945 with the formal signing of the Japanese surrender documents.",
      subject: "History",
      topic: "World War II"
    },
    {
      id: 'retrain-ww2-3',
      text: "Who served as the Prime Minister of the United Kingdom during the bulk of World War II?",
      type: "mcq",
      options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Margaret Thatcher"],
      correctAnswer: 1,
      explanation: "Winston Churchill was Prime Minister of the UK from 1940 to 1945, leading the nation during the conflict.",
      subject: "History",
      topic: "World War II"
    },
    {
      id: 'retrain-ww2-4',
      text: "True or False: The D-Day landings took place on the beaches of Normandy, France.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "True. The Allied invasion of Normandy (Operation Overlord) on June 6, 1944, is commonly known as D-Day.",
      subject: "History",
      topic: "World War II"
    },
    {
      id: 'retrain-ww2-5',
      text: "Which agreement signed in 1938 is widely associated with the policy of appeasement toward Nazi Germany?",
      type: "mcq",
      options: ["The Treaty of Versailles", "The Munich Agreement", "The Yalta Conference", "The Geneva Convention"],
      correctAnswer: 1,
      explanation: "The Munich Agreement allowed Nazi Germany to annex Czechoslovakia's Sudetenland in a failed attempt to maintain peace.",
      subject: "History",
      topic: "World War II"
    }
  ]
};

const generateFallbackQuestions = (topicName: string): RetrainingQuestion[] => {
  const subject = topicName.includes('Calculus') || topicName.includes('Geometry') || topicName.includes('Math') || topicName.includes('Algebra') || topicName.includes('Fraction') ? 'Mathematics' : 'Science';
  return [
    {
      id: `fallback-1-${Date.now()}`,
      text: `Which of the following is a primary characteristic of ${topicName}?`,
      type: 'mcq',
      options: [
        `It represents a core foundational principle of the subject`,
        `It is a secondary factor that has no structural impact`,
        `It is a temporary state observed only in laboratory conditions`,
        `It has been disproven by modern academic research`
      ],
      correctAnswer: 0,
      explanation: `By definition in standard learning syllabus guides, ${topicName} is studied as a key foundational concept.`,
      subject,
      topic: topicName
    },
    {
      id: `fallback-2-${Date.now()}`,
      text: `True or False: Mastered understanding of ${topicName} is highly recommended before advancing to higher-level concepts.`,
      type: 'trueFalse',
      options: ['True', 'False'],
      correctAnswer: 0,
      explanation: `True. Building a strong conceptual foundation in ${topicName} ensures subsequent lessons are easier to grasp.`,
      subject,
      topic: topicName
    },
    {
      id: `fallback-3-${Date.now()}`,
      text: `When analyzing problems relating to ${topicName}, what step should a student take first?`,
      type: 'mcq',
      options: [
        `Identify the given variables and establish the system boundary`,
        `Skip reading the instructions and write down a guess`,
        `Search for calculator shortcuts to bypass mathematical reasoning`,
        `Assume the question is incorrect and request a replacement`
      ],
      correctAnswer: 0,
      explanation: `Systematic problem-solving requires identifying the inputs and rules of ${topicName} first.`,
      subject,
      topic: topicName
    },
    {
      id: `fallback-4-${Date.now()}`,
      text: `True or False: Under standard operating guidelines, ${topicName} works completely independently of other concepts in the curriculum.`,
      type: 'trueFalse',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: `False. In educational paths, ${topicName} is integrated with adjacent subjects and principles.`,
      subject,
      topic: topicName
    },
    {
      id: `fallback-5-${Date.now()}`,
      text: `What represents the main goal of completing practice quizzes on ${topicName}?`,
      type: 'mcq',
      options: [
        `To memorize answers for specific exam questions`,
        `To reinforce conceptual understanding and build analytical muscle`,
        `To satisfy parent and teacher completion requirements`,
        `To pass time during standard independent study periods`
      ],
      correctAnswer: 1,
      explanation: `Practice quizzes are designed to cement structural mastery of ${topicName} and enhance problem-solving agility.`,
      subject,
      topic: topicName
    }
  ];
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const insights = user ? getStudentInsights(user.id) : null;

  if (!user || user.role !== 'student') {
    navigate('/login');
    return null;
  }

  const [selectedSubject, setSelectedSubject] = useState('All');

  // AI Retraining States
  const [isRetrainingOpen, setIsRetrainingOpen] = useState(false);
  const [retrainingTopic, setRetrainingTopic] = useState('');
  const [retrainingQuestions, setRetrainingQuestions] = useState<RetrainingQuestion[]>([]);
  const [retrainingIndex, setRetrainingIndex] = useState(0);
  const [retrainingAnswers, setRetrainingAnswers] = useState<Record<string, string | number>>({});
  const [isRetrainingSubmitted, setIsRetrainingSubmitted] = useState(false);
  const [isSubmittingRetraining, setIsSubmittingRetraining] = useState(false);

  // Trigger retraining session
  const handleStartRetraining = (topic: string) => {
    const normTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '');
    let questionsList: RetrainingQuestion[] = [];
    
    if (normTopic.includes('photosynthesis')) {
      questionsList = RETRAINING_QUESTIONS_DB.photosynthesis;
    } else if (normTopic.includes('fraction')) {
      questionsList = RETRAINING_QUESTIONS_DB.fractions;
    } else if (normTopic.includes('algebra')) {
      questionsList = RETRAINING_QUESTIONS_DB.algebra;
    } else if (normTopic.includes('watercycle') || (normTopic.includes('water') && normTopic.includes('cycle'))) {
      questionsList = RETRAINING_QUESTIONS_DB.watercycle;
    } else if (normTopic.includes('worldwar') || normTopic.includes('wwii') || normTopic.includes('ww2')) {
      questionsList = RETRAINING_QUESTIONS_DB.worldwarii;
    } else {
      questionsList = generateFallbackQuestions(topic);
    }

    setRetrainingTopic(topic);
    setRetrainingQuestions(questionsList);
    setRetrainingIndex(0);
    setRetrainingAnswers({});
    setIsRetrainingSubmitted(false);
    setIsRetrainingOpen(true);
  };

  const handleRetrainingAnswer = (value: string | number) => {
    setRetrainingAnswers(prev => ({
      ...prev,
      [retrainingIndex.toString()]: value
    }));
  };

  const handleSubmitRetraining = async () => {
    const unanswered = retrainingQuestions.filter((_, i) => !(i.toString() in retrainingAnswers));
    if (unanswered.length > 0) {
      toast.error(`Please answer all ${unanswered.length} remaining question(s)`);
      return;
    }

    setIsSubmittingRetraining(true);

    let score = 0;
    retrainingQuestions.forEach((q, i) => {
      const userAnswer = retrainingAnswers[i.toString()];
      if (userAnswer.toString().toLowerCase() === q.correctAnswer.toString().toLowerCase()) {
        score++;
      }
    });

    const percentage = Math.round((score / retrainingQuestions.length) * 100);
    const passed = percentage >= 80;

    const newResult: TestResult = {
      id: `retrain-${Date.now()}`,
      studentId: user.id,
      testId: `retrain-${retrainingTopic.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      testTitle: `AI Retraining: ${retrainingTopic}`,
      subject: retrainingQuestions[0]?.subject || 'General',
      score,
      totalScore: retrainingQuestions.length,
      percentage,
      timeTaken: Math.floor(Math.random() * 60) + 90,
      completedAt: new Date().toISOString(),
      answers: retrainingAnswers,
      strengths: passed ? [retrainingTopic] : [],
      weaknesses: passed ? [] : [retrainingTopic],
      isPlacementTest: false
    };

    try {
      const ok = await saveResultToDB(newResult);
      if (ok) {
        toast.success(passed 
          ? `Congratulations! You mastered "${retrainingTopic}" (${percentage}%)!` 
          : `Retraining completed. Keep practicing "${retrainingTopic}" (${percentage}%).`
        );
        setIsRetrainingSubmitted(true);
        await hydrateDatabaseState();
      } else {
        toast.error('Failed to submit retraining quiz results to the database.');
      }
    } catch (e) {
      console.error('Retraining submission error:', e);
      toast.error('Submission encountered an error.');
    } finally {
      setIsSubmittingRetraining(false);
    }
  };

  const [dashboardEnrollments, setDashboardEnrollments] = useState<any[]>([]);

  useEffect(() => {
    setDashboardEnrollments(mockEnrollments.filter(e => e.studentId === user.id));
  }, [user.id, mockEnrollments.length]);

  const handleDashboardUnenroll = async (teacherId: string, subject: string) => {
    try {
      const success = await unenrollStudent(user.id, teacherId, subject);
      if (success) {
        setDashboardEnrollments(mockEnrollments.filter(e => e.studentId === user.id));
        toast.success(`Successfully unenrolled from ${subject}.`);
      } else {
        toast.error('Failed to unenroll.');
      }
    } catch (e) {
      toast.error('An error occurred.');
    }
  };

  // Curriculum States
  const [curriculumUnits, setCurriculumUnits] = useState<any[]>([]);
  const [curriculumLessons, setCurriculumLessons] = useState<any[]>([]);
  const [curriculumMaterials, setCurriculumMaterials] = useState<Record<string, any[]>>({});
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCurriculum = async () => {
      const subjectToFetch = selectedSubject === 'All' 
        ? (user.subjects?.[0] || 'Mathematics')
        : selectedSubject;
      
      setIsLoadingCurriculum(true);
      try {
        const unitsRes = await fetch(`/api/units?subject=${subjectToFetch}&gradeLevel=${user.gradeLevel}`);
        const unitsData = await unitsRes.json();
        setCurriculumUnits(unitsData);

        if (unitsData.length > 0) {
          setExpandedUnits({ [unitsData[0].id]: true });
        } else {
          setExpandedUnits({});
        }

        const allLessons: any[] = [];
        const materialsMap: Record<string, any[]> = {};

        for (const unit of unitsData) {
          const lessonsRes = await fetch(`/api/lessons?unitId=${unit.id}`);
          const lessonsData = await lessonsRes.json();
          allLessons.push(...lessonsData);

          for (const lesson of lessonsData) {
            const matRes = await fetch(`/api/lessons/${lesson.id}/materials`);
            const matData = await matRes.json();
            materialsMap[lesson.id] = matData;
          }
        }
        setCurriculumLessons(allLessons);
        setCurriculumMaterials(materialsMap);
      } catch (err) {
        console.error('Error fetching student curriculum:', err);
      } finally {
        setIsLoadingCurriculum(false);
      }
    };

    if (user && user.role === 'student') {
      fetchCurriculum();
    }
  }, [selectedSubject, user.gradeLevel, user.role, user.subjects]);

  const availableTests = mockTests.filter(test => {
    if (test.isPlacementTest) return false;
    
    const isRegisteredGrade = test.gradeLevel === user.gradeLevel;
    const isRegisteredSubject = !user.subjects || user.subjects.length === 0 || user.subjects.includes(test.subject);
    if (!isRegisteredGrade || !isRegisteredSubject) return false;

    const matchesSubject = selectedSubject === 'All' || test.subject === selectedSubject;
    return matchesSubject;
  });

  const recentResults = mockTestResults.filter(r => r.studentId === user.id).slice(0, 5);
  const averageScore = recentResults.length > 0
    ? Math.round(recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length)
    : 0;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar />

      <main className="pb-16">
        {/* Banner Section (Clean Minimalist Banner) */}
        <div className="relative h-44 bg-gradient-to-r from-primary/15 via-blue-500/5 to-emerald-500/10 dark:from-primary/10 dark:via-blue-950/20 dark:to-emerald-950/15 border-b border-border/60 overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
          
          <div className="container flex items-center relative z-10 text-left w-full justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back, {user.name}! 👋</h1>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-primary" /> Grade {user.gradeLevel} Student • Keep pushing your potential!
              </p>
            </div>
            
            {/* Quick Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-background/60 dark:bg-card/50 px-3.5 py-2 rounded-2xl border border-border/50 shadow-sm">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse-subtle" />
              <div className="text-left leading-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Streak</span>
                <span className="text-sm font-bold text-foreground">5 Days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8 space-y-8">
          {/* AI Insights & Recommendations (Stunning Panel) */}
          {insights && (insights.performanceTrends.length > 0 || insights.personalisedTips.length > 0) && (
            <div className="bg-gradient-to-r from-primary/[0.04] via-emerald-500/[0.03] to-indigo-500/[0.04] dark:from-primary/5 dark:to-emerald-500/5 rounded-3xl p-6 border border-primary/25 dark:border-white/5 shadow-sm space-y-5">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Brain className="w-5 h-5 animate-pulse-subtle" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">AI Insights & Adaptive Calibration</h2>
                  <p className="text-xs text-muted-foreground">Real-time learning suggestions based on your chronological performance.</p>
                </div>
              </div>
              
              {/* Three Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Predicted Next Score */}
                <Card className="border-border/60 bg-card/65 dark:bg-card/40 hover-lift rounded-2xl">
                  <CardContent className="p-5 text-left flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Predicted Score</span>
                        <span className="text-3xl font-extrabold text-primary tracking-tight">{insights.prediction.predictedScore}%</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Target className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Progress value={insights.prediction.predictedScore} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground leading-normal">{insights.prediction.nextTestRecommendation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Card */}
                {insights.performanceTrends.length > 0 && (
                  <Card className="border-border/60 bg-card/65 dark:bg-card/40 hover-lift rounded-2xl">
                    <CardContent className="p-5 text-left flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Performance Trend</span>
                          <span className="text-2xl font-bold tracking-tight flex items-center gap-1.5">
                            {insights.performanceTrends[insights.performanceTrends.length - 1].averageScore}%
                            {insights.performanceTrends[insights.performanceTrends.length - 1].trend === 'improving' ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : insights.performanceTrends[insights.performanceTrends.length - 1].trend === 'declining' ? (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            ) : (
                              <BarChart3 className="w-5 h-5 text-blue-500" />
                            )}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <Trophy className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/40">
                        <span className="text-xs font-semibold text-foreground">
                          {insights.performanceTrends[insights.performanceTrends.length - 1].trend === 'improving'
                            ? '📈 Scores are increasing!'
                            : insights.performanceTrends[insights.performanceTrends.length - 1].trend === 'declining'
                            ? '📉 Scores are declining.'
                            : '➡️ Consistent standings'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Focus Areas Card */}
                <Card className="border-border/60 bg-card/65 dark:bg-card/40 hover-lift rounded-2xl">
                  <CardContent className="p-5 text-left flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Focus Points</span>
                        <span className="text-3xl font-extrabold text-amber-500 tracking-tight">{insights.studyFocus.length} Topics</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="space-y-1.5 border-t border-border/40 pt-2.5">
                      {insights.studyFocus.slice(0, 2).map((focus, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block flex-shrink-0" />
                          {focus}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Mastery Profile */}
              <Card className="border-primary/20 bg-background/50 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 text-left p-5 bg-muted/10 border-b border-border/40">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-primary" />
                    Interactive Topic Weakness Retraining
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Isolate and master curriculum gaps. Select any focus area below to launch an instant retraining practice session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="space-y-3.5 text-left">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Mastered Topics ({insights.strengths.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {insights.strengths.length > 0 ? (
                          insights.strengths.map((str, idx) => (
                            <Badge key={idx} variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 hover:bg-emerald-500/20 text-xs px-2.5 py-1 font-semibold rounded-xl flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              {str}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No strengths logged. Complete tests to build your mastery profile!</p>
                        )}
                      </div>
                    </div>

                    {/* Focus areas (removes hardcoded orange background) */}
                    <div className="space-y-3.5 text-left">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Focus Topics ({insights.weaknesses.length})
                      </h3>
                      <div className="space-y-2">
                        {insights.weaknesses.length > 0 ? (
                          insights.weaknesses.map((weak, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/50 dark:bg-card/45 shadow-sm transition-all hover:border-amber-300">
                              <div className="flex items-center gap-2 min-w-0 pr-3">
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block flex-shrink-0 animate-pulse" />
                                <span className="text-sm font-semibold text-foreground truncate">{weak}</span>
                              </div>
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-8 px-3 rounded-xl shadow shadow-amber-500/10 hover-lift flex items-center gap-1"
                                onClick={() => handleStartRetraining(weak)}
                              >
                                <Target className="w-3.5 h-3.5" />
                                Train Weakness
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">Amazing! No topic gaps detected. Keep it up!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personalized Tips */}
              {insights.personalisedTips.length > 0 && (
                <div className="p-4 bg-background/40 dark:bg-card/30 rounded-2xl border border-border/60 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Lightbulb className="w-4 h-4 text-amber-500" /> Suggested Study Strategy:</p>
                    <p className="text-xs text-muted-foreground truncate max-w-2xl">{insights.personalisedTips[0]}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold h-8 rounded-xl border-border/85 hover:bg-muted/30 whitespace-nowrap active-scale"
                    onClick={() => navigate('/ai/performance-analysis')}
                  >
                    View Detailed Performance Analysis
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* KPI Dashboard Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border border-border/75 hover:shadow-md hover:border-accent/40 hover-lift rounded-2xl text-left">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tests Taken</span>
                  <span className="text-2xl font-extrabold text-foreground">{recentResults.length} Assessments</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border/75 hover:shadow-md hover:border-primary/40 hover-lift rounded-2xl text-left">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Average Accuracy</span>
                  <span className="text-2xl font-extrabold text-foreground">{averageScore}%</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border/75 hover:shadow-md hover:border-amber-500/40 hover-lift rounded-2xl text-left">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Available Quizzes</span>
                  <span className="text-2xl font-extrabold text-foreground">{availableTests.length} Total</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <BookOpen className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border/75 hover:shadow-md hover:border-emerald-500/40 hover-lift rounded-2xl text-left">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Goal Streak</span>
                  <span className="text-2xl font-extrabold text-foreground">5 Days 🔥</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Flame className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Columns (Syllabus, Recommended, Teacher links) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Diagnostic Placement CTA Banner */}
              <Card className="border border-accent bg-accent/[0.04] dark:bg-accent/[0.02] shadow-sm rounded-2xl">
                <CardContent className="p-5 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-foreground text-sm flex items-center gap-1"><Sparkles className="w-4.5 h-4.5 text-accent animate-pulse-subtle" /> Calibrate Level standings</p>
                      <p className="text-xs text-muted-foreground leading-normal max-w-md">Determine your optimal starting levels and skill strengths with our adaptive diagnostic placement test.</p>
                    </div>
                    <Button onClick={() => navigate('/test-enhanced/test-005')} className="bg-accent hover:bg-accent/95 text-white rounded-xl text-xs font-bold shadow-md shadow-accent/10 hover-lift shrink-0">
                      Start Placement Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Enrolled Teachers & Subject Assignments */}
              <Card className="bg-card border border-border/75 shadow-sm rounded-2xl text-left overflow-hidden">
                <CardHeader className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/10">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <GraduationCap className="w-4.5 h-4.5 text-primary" />
                      Class Teachers & Subject Enrollments
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Monitor active learning links assigned for your class.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/teachers')}
                    className="text-xs font-semibold h-8 border-border/85 rounded-xl hover:bg-muted/30"
                  >
                    Browse Directory <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                  {dashboardEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {dashboardEnrollments.map((enroll) => {
                        const teacher = mockAllUsers.find(u => u.id === enroll.teacherId);
                        const avatarSeed = encodeURIComponent(teacher?.name || 'teacher');
                        const avatarUrl = teacher?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
                        return (
                          <Card key={`${enroll.teacherId}-${enroll.subject}`} className="bg-background/60 dark:bg-card/45 border border-border/80 flex flex-col justify-between p-4 space-y-3 rounded-2xl hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3">
                              <img 
                                src={avatarUrl} 
                                alt={teacher?.name || 'Teacher'} 
                                className="w-10 h-10 rounded-full border border-primary/20 bg-background object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-foreground truncate leading-snug">{teacher?.name || 'Teacher Demo'}</h4>
                                <Badge variant="outline" className={`flex items-center gap-1 w-fit mt-1 h-5 px-2.5 text-[9px] font-bold border ${getSubjectColor(enroll.subject)}`}>
                                  {getSubjectIcon(enroll.subject)}
                                  {enroll.subject}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                              <span>Enrolled: {new Date(enroll.enrolledAt).toLocaleDateString()}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDashboardUnenroll(enroll.teacherId, enroll.subject)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2 h-7 text-[10px] font-bold rounded-lg"
                              >
                                Unenroll
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-border rounded-2xl space-y-3 bg-muted/10">
                      <GraduationCap className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                      <p className="font-bold text-muted-foreground text-xs">No active class enrollments</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
                        Link profiles with class teachers to unlock custom quizzes and report evaluations.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/teachers')}
                        className="text-xs h-8 border-border/85 rounded-xl hover:bg-muted/30"
                      >
                        Enroll with Instructor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommended next assessments library */}
              <Card className="bg-card border border-border/75 shadow-sm rounded-2xl text-left overflow-hidden">
                <CardHeader className="p-5 flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/10">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Target className="w-4.5 h-4.5 text-primary" />
                      Recommended Next Assessments
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Curated quiz selections assigned for your registered courses.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:underline font-bold flex items-center gap-0.5 text-xs rounded-xl"
                    onClick={() => navigate('/tests')}
                  >
                    Library Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {availableTests.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableTests.slice(0, 2).map((test) => (
                        <Card key={test.id} className="hover:shadow-md transition-all border border-border/80 flex flex-col justify-between overflow-hidden bg-background/50 dark:bg-card/45 hover-lift rounded-2xl">
                          <div className={`h-1 w-full bg-gradient-to-r ${
                            test.subject === 'Mathematics' ? 'from-indigo-500 to-indigo-600' :
                            test.subject === 'Science' ? 'from-emerald-500 to-emerald-600' :
                            test.subject === 'Geography' ? 'from-sky-500 to-sky-600' :
                            test.subject === 'History' ? 'from-amber-500 to-amber-600' :
                            'from-rose-500 to-rose-600'
                          }`} />
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Badge variant="outline" className={`flex items-center gap-1 h-5 px-2 text-[9px] font-bold border ${getSubjectColor(test.subject)}`}>
                                  {getSubjectIcon(test.subject)}
                                  {test.subject}
                                </Badge>
                                <span className="text-[9px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{test.difficulty}</span>
                              </div>
                              <h4 className="font-bold text-sm text-foreground line-clamp-1">{test.title}</h4>
                              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{test.description}</p>
                            </div>
                            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" /> {test.duration} mins
                              </span>
                              <Button 
                                size="sm" 
                                className="h-7 text-[10px] px-2.5 font-bold bg-primary hover:bg-primary/95 text-white rounded-lg hover-lift shadow shadow-primary/10"
                                onClick={() => test.isAdaptive ? navigate(`/test-enhanced/${test.id}`) : navigate(`/test/${test.id}`)}
                              >
                                Start Quiz
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs bg-muted/10">
                      No recommended quizzes logged for your active subjects.
                    </div>
                  )}
                  
                  <div className="pt-1.5">
                    <Button
                      onClick={() => navigate('/tests')}
                      className="w-full font-bold bg-gradient-to-r from-primary via-blue-600 to-emerald-500 hover:opacity-95 text-white shadow-md shadow-primary/10 flex items-center justify-center gap-2 h-10.5 rounded-xl hover-lift transition-all"
                    >
                      📚 Access All Available Tests in Syllabus Library
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Learning path curriculum syllabus structure */}
              <Card className="bg-card border border-border/75 shadow-sm rounded-2xl text-left overflow-hidden">
                <CardHeader className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 bg-muted/10">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <BookOpen className="w-4.5 h-4.5 text-primary" />
                      Curriculum Path Syllabus
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Explore units, course modules, and download materials mapped for Grade {user.gradeLevel}.
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject:</span>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-muted border border-border/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground font-medium"
                    >
                      <option value="All">All Subjects</option>
                      {(user.subjects && user.subjects.length > 0 ? user.subjects : availableSubjects).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {isLoadingCurriculum ? (
                    <div className="py-12 text-center text-muted-foreground animate-pulse text-sm">
                      Loading syllabus details...
                    </div>
                  ) : curriculumUnits.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-border rounded-2xl space-y-2 bg-muted/10">
                      <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                      <p className="font-bold text-muted-foreground text-xs">No active syllabus modules mapped</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-normal">
                        Class teachers have not configured lesson units for this subject under Grade {user.gradeLevel}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {curriculumUnits.map((unit) => {
                        const unitLessons = curriculumLessons.filter(l => l.unitId === unit.id);
                        const isExpanded = expandedUnits[unit.id];

                        return (
                          <div key={unit.id} className="border border-border/70 rounded-xl overflow-hidden bg-background/50">
                            <div 
                              className="flex items-center justify-between p-3.5 bg-muted/20 border-b border-border/60 cursor-pointer hover:bg-muted/35 transition-colors"
                              onClick={() => setExpandedUnits(prev => ({ ...prev, [unit.id]: !prev[unit.id] }))}
                            >
                              <div className="flex-1 text-left min-w-0 pr-4">
                                <h4 className="font-bold text-sm text-foreground truncate leading-snug">{unit.name}</h4>
                                <p className="text-[11px] text-muted-foreground line-clamp-1">{unit.description}</p>
                              </div>
                              <div className="flex items-center gap-2.5 flex-shrink-0">
                                <Badge variant="outline" className="text-[9px] bg-background/60 font-semibold px-2 py-0.5 rounded-lg">
                                  {unitLessons.length} Lessons
                                </Badge>
                                <span className="text-sm font-bold text-muted-foreground">{isExpanded ? '−' : '+'}</span>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-3 space-y-3 bg-card/40">
                                {unitLessons.length === 0 ? (
                                  <p className="text-xs text-muted-foreground text-center py-2">No active lessons assigned.</p>
                                ) : (
                                  unitLessons.map((lesson) => {
                                    const lessonMats = curriculumMaterials[lesson.id] || [];
                                    const isLessonExpanded = expandedLessons[lesson.id];

                                    return (
                                      <div key={lesson.id} className="border border-border/70 rounded-xl bg-background/45 overflow-hidden text-left">
                                        <div 
                                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                                          onClick={() => setExpandedLessons(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                                        >
                                          <div className="text-left min-w-0 pr-4">
                                            <p className="font-bold text-xs text-foreground truncate leading-snug">
                                              Lesson {lesson.orderNum}: {lesson.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">{lesson.description}</p>
                                          </div>
                                          <span className="text-[10px] font-bold text-muted-foreground">{isLessonExpanded ? '▲' : '▼'}</span>
                                        </div>

                                        {isLessonExpanded && (
                                          <div className="p-3 border-t border-border/60 bg-muted/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                            {lessonMats.length === 0 ? (
                                              <p className="text-[10px] text-muted-foreground col-span-2 text-center py-1">No learning resources uploaded yet.</p>
                                            ) : (
                                              lessonMats.map((mat) => (
                                                <div key={mat.id} className="p-3 border border-border/70 rounded-xl bg-card flex items-start gap-3 hover:shadow-sm transition-shadow text-left">
                                                  <div className="mt-0.5">
                                                    {mat.type === 'video' ? (
                                                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                                        <Video className="w-3.5 h-3.5" />
                                                      </div>
                                                    ) : (
                                                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                                        <File className="w-3.5 h-3.5" />
                                                      </div>
                                                    )}
                                                  </div>
                                                  <div className="flex-1 min-w-0 text-left">
                                                    <p className="font-bold text-xs truncate leading-snug text-foreground">{mat.title}</p>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1">{mat.details || 'Study resources details'}</p>
                                                    <a 
                                                      href={mat.url} 
                                                      target={mat.url.startsWith('data:') ? undefined : "_blank"} 
                                                      download={mat.url.startsWith('data:') ? mat.title : undefined}
                                                      rel="noopener noreferrer" 
                                                      className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-primary hover:underline mt-2"
                                                    >
                                                      {mat.url.startsWith('data:') ? 'Download File' : 'Access study guide'} <ArrowUpRight className="w-3 h-3" />
                                                    </a>
                                                  </div>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Recent Results & Performance tracking */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Standings</h2>
              </div>
              
              <div className="space-y-3">
                {recentResults.length > 0 ? (
                  recentResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="hover-lift hover:shadow-md cursor-pointer border border-border/75 rounded-2xl overflow-hidden bg-card"
                      onClick={() => result.isPlacementTest ? navigate('/placement-report') : navigate(`/results/${result.id}`)}
                    >
                      <CardContent className="p-4 space-y-3 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm text-foreground leading-snug line-clamp-1">{result.testTitle}</p>
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mt-0.5">{result.subject}</span>
                          </div>
                          
                          {/* Percentage Badge */}
                          <Badge 
                            variant="outline" 
                            className={`rounded-lg text-[10px] font-bold px-2 py-0.5 border ${
                              result.percentage >= 80 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50' 
                                : result.percentage >= 60 
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50' 
                                : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-200/50'
                            }`}
                          >
                            {result.percentage}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                            <span>Score: {result.score}/{result.totalScore} questions</span>
                            <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                          </div>
                          <Progress value={result.percentage} className="h-1.5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs bg-muted/5 space-y-2">
                    <Trophy className="w-8 h-8 mx-auto text-muted-foreground/30" />
                    <p className="font-semibold text-muted-foreground">No recent standings logged</p>
                    <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">Standings will build dynamically after submitting quizzes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Retraining Modal (Confetti design & micro-interactions) */}
      <Dialog open={isRetrainingOpen} onOpenChange={setIsRetrainingOpen}>
        <DialogContent className="max-w-xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden p-0 gap-0 animate-scale-in">
          <DialogHeader className="bg-gradient-to-r from-primary/[0.08] via-emerald-500/[0.04] to-transparent p-5 border-b border-border/60 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-bold tracking-tight">AI Weakness Retraining Hub</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Personalized calibration practice: <strong className="text-foreground">{retrainingTopic}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {retrainingQuestions.length > 0 && (
            <div className="p-6 space-y-5">
              {!isRetrainingSubmitted ? (
                <>
                  {/* Progress Indicators */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Question {retrainingIndex + 1} of {retrainingQuestions.length}</span>
                      <span>{Math.round(((retrainingIndex + 1) / retrainingQuestions.length) * 100)}% Complete</span>
                    </div>
                    <Progress value={((retrainingIndex + 1) / retrainingQuestions.length) * 100} className="h-1.5" />
                  </div>

                  {/* Question */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground leading-snug text-left">
                      {retrainingQuestions[retrainingIndex].text}
                    </h3>
                    
                    {/* Option Choices */}
                    <RadioGroup
                      value={retrainingAnswers[retrainingIndex.toString()]?.toString() || ''}
                      onValueChange={handleRetrainingAnswer}
                      className="space-y-2"
                    >
                      {retrainingQuestions[retrainingIndex].type === 'trueFalse' ? (
                        ['True', 'False'].map((option) => (
                          <div
                            key={option}
                            onClick={() => handleRetrainingAnswer(option.toLowerCase())}
                            className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer active-scale ${
                              retrainingAnswers[retrainingIndex.toString()] === option.toLowerCase()
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                                : 'border-border/80 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem value={option.toLowerCase()} id={`retrain-opt-${option}`} className="pointer-events-none" />
                            <Label htmlFor={`retrain-opt-${option}`} className="flex-1 cursor-pointer font-semibold text-sm text-foreground text-left leading-none">
                              {option}
                            </Label>
                          </div>
                        ))
                      ) : (
                        retrainingQuestions[retrainingIndex].options?.map((option, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleRetrainingAnswer(idx.toString())}
                            className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer active-scale ${
                              retrainingAnswers[retrainingIndex.toString()] === idx.toString()
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                                : 'border-border/80 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem value={idx.toString()} id={`retrain-opt-${idx}`} className="pointer-events-none" />
                            <Label htmlFor={`retrain-opt-${idx}`} className="flex-1 cursor-pointer font-semibold text-sm text-foreground text-left leading-tight">
                              {option}
                            </Label>
                          </div>
                        ))
                      )}
                    </RadioGroup>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border/60 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setRetrainingIndex(prev => Math.max(0, prev - 1))}
                      disabled={retrainingIndex === 0}
                      className="font-bold text-xs h-10 px-4 rounded-xl border-border/80 hover:bg-muted/30"
                    >
                      Previous
                    </Button>

                    {retrainingIndex < retrainingQuestions.length - 1 ? (
                      <Button
                        onClick={() => setRetrainingIndex(prev => prev + 1)}
                        className="flex-1 font-bold text-xs h-10 bg-primary hover:bg-primary/95 text-white rounded-xl hover-lift shadow shadow-primary/10"
                      >
                        Next Question
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitRetraining}
                        disabled={isSubmittingRetraining}
                        className="flex-1 font-bold text-xs h-10 bg-primary hover:bg-primary/95 text-white rounded-xl hover-lift shadow shadow-primary/15 flex items-center justify-center gap-1.5"
                      >
                        {isSubmittingRetraining ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing Standings...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Submit Retraining Answers
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                /* Results Screen */
                <div className="space-y-6">
                  {(() => {
                    const score = retrainingQuestions.filter((q, i) => {
                      const ans = retrainingAnswers[i.toString()];
                      return ans !== undefined && ans.toString().toLowerCase() === q.correctAnswer.toString().toLowerCase();
                    }).length;
                    const pct = Math.round((score / retrainingQuestions.length) * 100);
                    const passed = pct >= 80;

                    return (
                      <div className={`p-5 rounded-2xl border text-center space-y-3 ${
                        passed 
                          ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-amber-500/[0.04] border-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-card shadow border border-border/60">
                          {passed ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                          )}
                        </div>
                        <h3 className="font-extrabold text-base text-foreground">
                          {passed ? 'Topic Mastered! 🎉' : 'Keep Reviewing! 💪'}
                        </h3>
                        <p className="text-xs text-muted-foreground font-semibold">
                          Evaluation Score: <span className="text-foreground font-bold">{score} / {retrainingQuestions.length}</span> ({pct}%)
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          {passed 
                            ? `Fantastic work! This subject topic has been added to your strengths list and cleared from focus areas.` 
                            : `You need at least 80% accuracy to resolve this focus area. Review the detailed explanations below to improve.`
                          }
                        </p>
                      </div>
                    );
                  })()}

                  {/* Detail Reviews List */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Detailed Review</h4>
                    {retrainingQuestions.map((q, i) => {
                      const userAns = retrainingAnswers[i.toString()];
                      const isCorrect = userAns !== undefined && userAns.toString().toLowerCase() === q.correctAnswer.toString().toLowerCase();
                      
                      let userAnsText = '';
                      let correctAnsText = '';
                      
                      if (q.type === 'trueFalse') {
                        userAnsText = userAns === 'true' ? 'True' : 'False';
                        correctAnsText = q.correctAnswer.toString().toLowerCase() === 'true' || q.correctAnswer === 0 || q.correctAnswer.toString() === '0' ? 'True' : 'False';
                      } else {
                        userAnsText = q.options?.[parseInt(userAns?.toString() || '0')] || '';
                        correctAnsText = q.options?.[parseInt(q.correctAnswer.toString())] || '';
                      }

                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-border/85 bg-background space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Question {i+1}</span>
                            {isCorrect ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 text-[9px] font-bold h-5">Correct</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-200/50 text-[9px] font-bold h-5">Incorrect</Badge>
                            )}
                          </div>
                          
                          <p className="text-xs font-semibold text-foreground text-left leading-normal">{q.text}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-left">
                            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                              <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Your Selection</span>
                              <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>{userAnsText || '(Skipped)'}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                              <span className="text-[9px] text-muted-foreground font-semibold uppercase block">Correct Option</span>
                              <span className="text-emerald-600 font-bold">{correctAnsText}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-primary/[0.03] text-[11px] text-muted-foreground leading-relaxed border border-primary/10 text-left">
                            <strong className="text-foreground block mb-0.5">💡 AI Explanation:</strong>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <DialogFooter className="pt-4 border-t border-border/60">
                    <Button 
                      onClick={() => setIsRetrainingOpen(false)}
                      className="w-full font-bold text-xs h-10 bg-primary hover:bg-primary/95 text-white rounded-xl"
                    >
                      Close & Refresh Dashboard
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
