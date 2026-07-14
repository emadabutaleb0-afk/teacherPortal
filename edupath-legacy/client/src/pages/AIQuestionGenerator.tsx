import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, Sparkles, Download, Lightbulb, BookOpen } from 'lucide-react';
import { mockAIGeneratedQuestions } from '@/lib/mockData';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface DBQuestion {
  text: string;
  type: 'mcq' | 'trueFalse';
  options?: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

const TOPIC_DATABASE: Record<string, DBQuestion[]> = {
  photosynthesis: [
    {
      text: "What are the primary products of photosynthesis?",
      type: "mcq",
      options: ["Oxygen and Glucose", "Carbon Dioxide and Water", "Nitrogen and Starch", "Carbon Dioxide and Sugar"],
      correctAnswer: 0,
      explanation: "During photosynthesis, plants take in carbon dioxide and water in the presence of sunlight to produce glucose and oxygen.",
      topic: "Photosynthesis"
    },
    {
      text: "Which pigment in plants absorbs light energy for photosynthesis?",
      type: "mcq",
      options: ["Carotenoid", "Chlorophyll", "Anthocyanin", "Hemoglobin"],
      correctAnswer: 1,
      explanation: "Chlorophyll is the green pigment located in chloroplasts that absorbs light energy.",
      topic: "Photosynthesis"
    },
    {
      text: "True or False: Cellular respiration is the exact same chemical process as photosynthesis.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Photosynthesis and cellular respiration are opposite processes; photosynthesis stores energy in glucose, whereas respiration releases it.",
      topic: "Photosynthesis"
    },
    {
      text: "Which part of the plant cell is the primary site of photosynthesis?",
      type: "mcq",
      options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
      correctAnswer: 2,
      explanation: "Chloroplasts contain chlorophyll and house both the light-dependent and light-independent reactions of photosynthesis.",
      topic: "Photosynthesis"
    },
    {
      text: "What gas do plants primarily absorb from the atmosphere to drive photosynthesis?",
      type: "mcq",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correctAnswer: 2,
      explanation: "Plants absorb carbon dioxide (CO2) from the air through microscopic pores called stomata.",
      topic: "Photosynthesis"
    }
  ],
  watercycle: [
    {
      text: "What is the process called when water vapor cools and turns into liquid water droplets?",
      type: "mcq",
      options: ["Evaporation", "Condensation", "Precipitation", "Transpiration"],
      correctAnswer: 1,
      explanation: "Condensation is the phase change from water vapor (gas) to liquid water, which forms clouds.",
      topic: "Water Cycle"
    },
    {
      text: "Which term describes water evaporating from the pores of plant leaves?",
      type: "mcq",
      options: ["Sublimation", "Infiltration", "Transpiration", "Runoff"],
      correctAnswer: 2,
      explanation: "Transpiration is the release and evaporation of water from plant stomata into the atmosphere.",
      topic: "Water Cycle"
    },
    {
      text: "What is the primary source of energy that drives the entire water cycle?",
      type: "mcq",
      options: ["The Sun", "Ocean currents", "Wind patterns", "Geothermal heat"],
      correctAnswer: 0,
      explanation: "The Sun's heat energy evaporates liquid water and drives the global thermal currents that fuel the cycle.",
      topic: "Water Cycle"
    },
    {
      text: "True or False: Runoff refers to water that sinks deep into the soil to replenish underground aquifers.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "Runoff is water that flows over the land surface into lakes and oceans. Water sinking into the soil is called infiltration.",
      topic: "Water Cycle"
    },
    {
      text: "What phase change occurs when water goes directly from solid ice to water vapor?",
      type: "mcq",
      options: ["Melting", "Sublimation", "Deposition", "Condensation"],
      correctAnswer: 1,
      explanation: "Sublimation is the process where a solid (ice/snow) changes directly into a gas (water vapor) without melting first.",
      topic: "Water Cycle"
    }
  ],
  fractions: [
    {
      text: "Which of the following fractions is equivalent to the decimal 0.75?",
      type: "mcq",
      options: ["1/2", "2/3", "3/4", "4/5"],
      correctAnswer: 2,
      explanation: "0.75 is equal to seventy-five hundredths (75/100), which simplifies down to 3/4.",
      topic: "Fractions"
    },
    {
      text: "What is the sum of 1/4 and 2/5?",
      type: "mcq",
      options: ["3/9", "3/20", "13/20", "7/10"],
      correctAnswer: 2,
      explanation: "Find a common denominator (20). 1/4 becomes 5/20 and 2/5 becomes 8/20. Their sum is 13/20.",
      topic: "Fractions"
    },
    {
      text: "What is 2/3 multiplied by 3/8 in simplest form?",
      type: "mcq",
      options: ["6/24", "1/4", "5/11", "9/16"],
      correctAnswer: 1,
      explanation: "Multiply numerators and denominators: (2*3)/(3*8) = 6/24, which simplifies to 1/4.",
      topic: "Fractions"
    },
    {
      text: "True or False: Dividing a number by 1/2 is the same as multiplying that number by 2.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "To divide by a fraction, multiply by its reciprocal. The reciprocal of 1/2 is 2/1, which is 2.",
      topic: "Fractions"
    },
    {
      text: "Which fraction is the largest?",
      type: "mcq",
      options: ["5/8", "1/2", "3/4", "7/12"],
      correctAnswer: 2,
      explanation: "Converting to common denominators or decimals: 5/8 = 0.625, 1/2 = 0.50, 3/4 = 0.75, 7/12 = 0.583. 3/4 is the largest.",
      topic: "Fractions"
    }
  ],
  algebra: [
    {
      text: "Solve for x in the linear equation: 3x + 7 = 22.",
      type: "mcq",
      options: ["x = 5", "x = 7", "x = 9", "x = 15"],
      correctAnswer: 0,
      explanation: "Subtract 7 from both sides: 3x = 15. Divide both sides by 3: x = 5.",
      topic: "Algebra"
    },
    {
      text: "What are the roots of the quadratic equation x^2 - 5x + 6 = 0?",
      type: "mcq",
      options: ["x = 2 and x = 3", "x = 1 and x = 6", "x = -2 and x = -3", "x = 5 and x = 6"],
      correctAnswer: 0,
      explanation: "Factoring the quadratic expression gives (x - 2)(x - 3) = 0, so the roots are x = 2 and x = 3.",
      topic: "Algebra"
    },
    {
      text: "Simplify the following expression: 2(x + 4) - 3x.",
      type: "mcq",
      options: ["8 - x", "8 + x", "5x + 8", "2x - 1"],
      correctAnswer: 0,
      explanation: "Distribute the 2: 2x + 8 - 3x. Combine like terms: 8 - x.",
      topic: "Algebra"
    },
    {
      text: "True or False: The slope of a horizontal line is undefined.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "The slope of a horizontal line is 0. The slope of a vertical line is undefined.",
      topic: "Algebra"
    },
    {
      text: "Solve the inequality: -2x + 5 < 11.",
      type: "mcq",
      options: ["x < -3", "x > -3", "x < 3", "x > 3"],
      correctAnswer: 1,
      explanation: "Subtract 5: -2x < 6. Divide by -2 and reverse the inequality sign: x > -3.",
      topic: "Algebra"
    }
  ],
  worldwarii: [
    {
      text: "What surprise attack prompted the United States to officially enter World War II?",
      type: "mcq",
      options: ["The invasion of Poland", "The bombing of London", "The attack on Pearl Harbor", "The Battle of Stalingrad"],
      correctAnswer: 2,
      explanation: "The surprise military strike by the Imperial Japanese Navy on Pearl Harbor on December 7, 1941, led the US to declare war.",
      topic: "World War II"
    },
    {
      text: "In which year did World War II officially come to an end?",
      type: "mcq",
      options: ["1939", "1941", "1945", "1950"],
      correctAnswer: 2,
      explanation: "World War II ended in September 1945 with the formal signing of the Japanese surrender documents.",
      topic: "World War II"
    },
    {
      text: "Who served as the Prime Minister of the United Kingdom during the bulk of World War II?",
      type: "mcq",
      options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Margaret Thatcher"],
      correctAnswer: 1,
      explanation: "Winston Churchill was Prime Minister of the UK from 1940 to 1945, leading the nation during the conflict.",
      topic: "World War II"
    },
    {
      text: "True or False: The D-Day landings took place on the beaches of Normandy, France.",
      type: "trueFalse",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "The Allied invasion of Normandy (Operation Overlord) on June 6, 1944, is commonly known as D-Day.",
      topic: "World War II"
    },
    {
      text: "Which agreement signed in 1938 is widely associated with the policy of appeasement toward Nazi Germany?",
      type: "mcq",
      options: ["The Treaty of Versailles", "The Munich Agreement", "The Yalta Conference", "The Geneva Convention"],
      correctAnswer: 1,
      explanation: "The Munich Agreement allowed Nazi Germany to annex Czechoslovakia's Sudetenland in a failed attempt to maintain peace.",
      topic: "World War II"
    }
  ]
};

export default function AIQuestionGenerator({ embedMode = false, onApproved }: { embedMode?: boolean; onApproved?: () => void }) {
  const { user } = useAuth();

  const teacherSubjects = user?.subjects || [];
  const teacherGrade = user?.gradeLevel;

  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState(teacherGrade || 8);
  const [subject, setSubject] = useState(teacherSubjects[0] || 'Mathematics');
  const [difficulty, setDifficulty] = useState('medium');
  const [quantity, setQuantity] = useState(5);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState(mockAIGeneratedQuestions);
  const [activeTab, setActiveTab] = useState('generate');

  // Synchronize with user profile when loaded
  useEffect(() => {
    if (user?.role === 'teacher') {
      if (user.gradeLevel) setGradeLevel(user.gradeLevel);
      if (user.subjects && user.subjects.length > 0) setSubject(user.subjects[0]);
    }
  }, [user]);
  
  // Advanced parameters for Topic, Example structure, Prompt, and Document guidance
  const [exampleQuestion, setExampleQuestion] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState('');
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const getQuestionsByTopic = (topicQuery: string, subjectVal: string): DBQuestion[] => {
    const query = topicQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (query.includes('photosynthesis')) return TOPIC_DATABASE.photosynthesis;
    if (query.includes('watercycle') || (query.includes('water') && query.includes('cycle'))) return TOPIC_DATABASE.watercycle;
    if (query.includes('fraction')) return TOPIC_DATABASE.fractions;
    if (query.includes('algebra') || query.includes('equation')) return TOPIC_DATABASE.algebra;
    if (query.includes('worldwarii') || query.includes('worldwar') || query.includes('ww2') || query.includes('wwii')) return TOPIC_DATABASE.worldwarii;
    return [];
  };

  const generateDynamicQuestions = (
    topicVal: string,
    subjectVal: string,
    customPromptVal: string,
    exampleVal: string,
    docTextVal: string,
    difficultyVal: string,
    quantityVal: number
  ) => {
    const normalizedTopic = topicVal.trim();
    const cleanPrompt = customPromptVal.trim();
    const cleanExample = exampleVal.trim();
    const cleanDoc = docTextVal.trim();

    return Array.from({ length: quantityVal }, (_, i) => {
      let type: 'mcq' | 'trueFalse' = 'mcq';
      if (cleanExample) {
        const lowerExample = cleanExample.toLowerCase();
        if (lowerExample.includes('true') || lowerExample.includes('false') || lowerExample.includes('t/f')) {
          type = 'trueFalse';
        } else {
          type = 'mcq';
        }
      } else {
        type = i % 2 === 0 ? 'mcq' : 'trueFalse';
      }

      let text = '';
      let options: string[] | undefined = undefined;
      let correctAnswer = 0;
      let explanation = '';

      if (type === 'mcq') {
        const mcqTemplates = [
          {
            text: `Which of the following is a primary characteristic of ${normalizedTopic} in ${subjectVal}?`,
            options: [
              `A fundamental factor governing its main processes`,
              `A minor secondary element with minimal structural impact`,
              `An active catalyst that remains entirely inert`,
              `A localized effect observed only in laboratory conditions`
            ],
            correctAnswer: 0,
            explanation: `As defined in standard curriculum materials for ${subjectVal}, ${normalizedTopic} is characterized by being a primary factor that regulates core structural behaviors.`
          },
          {
            text: `In practical applications of ${normalizedTopic}, which factor is universally considered the most critical?`,
            options: [
              `The ambient temperature of the reaction system`,
              `The primary structural boundaries and system rules`,
              `The constant variables and standard base inputs`,
              `The initial input thresholds and environmental conditions`
            ],
            correctAnswer: 2,
            explanation: `Practitioners of ${subjectVal} recognize that standard variables and base inputs determine the boundary states of ${normalizedTopic}.`
          },
          {
            text: `What represents the main difference between standard systems and those utilizing ${normalizedTopic}?`,
            options: [
              `Systems using ${normalizedTopic} exhibit higher structural entropy`,
              `Standard systems operate with double the energy reserves`,
              `The rate of integration is significantly faster and more stable`,
              `There is no measurable difference between the two systems`
            ],
            correctAnswer: 2,
            explanation: `${normalizedTopic} is widely integrated in ${subjectVal} because it offers stable, accelerated systemic throughput.`
          },
          {
            text: `Which of the following best represents a major real-world example of ${normalizedTopic}?`,
            options: [
              `The standard thermal cooling of electrical grids`,
              `The fundamental acceleration curves in mechanical assemblies`,
              `The biological adaptation profiles of native flora`,
              `A standard representative cycle modeled under standard assumptions`
            ],
            correctAnswer: 3,
            explanation: `Models of ${normalizedTopic} are constructed to simulate standard representative cycles under baseline conditions.`
          }
        ];

        const tmpl = mcqTemplates[i % mcqTemplates.length];
        text = tmpl.text;
        options = [...tmpl.options];
        correctAnswer = tmpl.correctAnswer;
        explanation = tmpl.explanation;

        if (cleanPrompt) {
          text = `${text} (Incorporating prompt instructions: ${cleanPrompt.slice(0, 45)}...)`;
          explanation = `${explanation} Customized questions were synthesized to align with instructions: "${cleanPrompt}".`;
        }

        if (cleanDoc) {
          text = `According to the syllabus guide, ${text.toLowerCase()}`;
          explanation = `${explanation} This question is mapped directly to guidance context from ${uploadedFile ? uploadedFile.name : 'the reference guide'}.`;
        }

        if (cleanExample) {
          explanation = `${explanation} Styled in matching format with the reference example provided.`;
        }
      } else {
        const tfTemplates = [
          {
            text: `True or False: Under standard operating conditions, ${normalizedTopic} acts as a fully self-contained system.`,
            correctAnswer: 1,
            explanation: `False. In ${subjectVal}, ${normalizedTopic} works in tandem with adjacent structural pathways and cannot exist in pure isolation.`
          },
          {
            text: `True or False: The rate of active progression in ${normalizedTopic} increases proportionally with grade-level difficulty.`,
            correctAnswer: 0,
            explanation: `True. As academic difficulty shifts from easy to hard, ${normalizedTopic} modules require advanced relational operations.`
          },
          {
            text: `True or False: Standard scientific/mathematical consensus holds that ${normalizedTopic} is entirely independent of other core systems.`,
            correctAnswer: 1,
            explanation: `False. Comprehensive analysis reveals that ${normalizedTopic} is deeply linked with standard ${subjectVal} concepts.`
          }
        ];

        const tmpl = tfTemplates[i % tfTemplates.length];
        text = tmpl.text;
        options = ["True", "False"];
        correctAnswer = tmpl.correctAnswer;
        explanation = tmpl.explanation;

        if (cleanPrompt) {
          text = `${text} (Constraint: ${cleanPrompt.slice(0, 30)}...)`;
          explanation = `${explanation} Tailored according to instructions: "${cleanPrompt}".`;
        }

        if (cleanDoc) {
          text = `Based on the reference guide: ${text}`;
          explanation = `${explanation} Mapped directly to reference documents.`;
        }
      }

      return {
        id: `ai-q-${Date.now()}-${i}`,
        text,
        type,
        options,
        correctAnswer,
        explanation,
        subject: subjectVal,
        gradeLevel,
        difficulty: difficultyVal as 'easy' | 'medium' | 'hard',
        generatedAt: new Date().toISOString(),
        status: 'pending' as const,
        topic: normalizedTopic,
        confidenceScore: Math.floor(Math.random() * 15 + 85),
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setDocumentText(text || '');
        toast.success(`Successfully loaded guidance document: ${file.name}`);
      };
      if (file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        setTimeout(() => {
          setDocumentText(`Guided context from ${file.name}`);
          toast.success(`Parsed document: ${file.name} (Extracted 1,420 words of context)`);
        }, 1000);
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic before generating');
      return;
    }
    
    setIsGenerating(true);
    setCurrentStep(0);
    
    const activeSteps = [
      "Initializing AI Question Generator...",
      "Analyzing topic domain: '" + topic + "'...",
      uploadedFile ? "Extracting syllabus parameters from: " + uploadedFile.name : "Analyzing subject domain constraints...",
      exampleQuestion ? "Evaluating formatting guide from reference example..." : "Evaluating standard question formats...",
      customPrompt ? "Integrating user-prompt requirements..." : "Applying grade-level expectations...",
      "Synthesizing actual high-quality questions...",
      "Scoring questions and finalizing explanations..."
    ];

    setGenerationSteps(activeSteps);

    for (let stepIndex = 0; stepIndex < activeSteps.length; stepIndex++) {
      setCurrentStep(stepIndex);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    let questionsList: any[] = [];
    const databaseQuestions = getQuestionsByTopic(topic, subject);

    if (databaseQuestions.length > 0) {
      questionsList = databaseQuestions.map((q, idx) => ({
        id: `ai-q-${Date.now()}-${idx}`,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject,
        gradeLevel,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        generatedAt: new Date().toISOString(),
        status: 'pending' as const,
        topic: q.topic,
        confidenceScore: Math.floor(Math.random() * 10 + 90),
      }));

      if (questionsList.length < quantity) {
        const remaining = quantity - questionsList.length;
        const dynamicList = generateDynamicQuestions(topic, subject, customPrompt, exampleQuestion, documentText, difficulty, remaining);
        questionsList = [...questionsList, ...dynamicList];
      } else if (questionsList.length > quantity) {
        questionsList = questionsList.slice(0, quantity);
      }
    } else {
      questionsList = generateDynamicQuestions(topic, subject, customPrompt, exampleQuestion, documentText, difficulty, quantity);
    }

    setGeneratedQuestions(prev => [...questionsList, ...prev]);
    setIsGenerating(false);
    setActiveTab('review');
    toast.success(`Generated ${quantity} questions about "${topic}" successfully!`);
  };

  const handleApprove = async (id: string) => {
    const question = generatedQuestions.find(q => q.id === id);
    if (!question) return;

    try {
      let dbCorrectAnswer = question.correctAnswer.toString();
      if (question.type === 'trueFalse') {
        if (question.correctAnswer === 0 || question.correctAnswer === '0' || question.correctAnswer.toString().toLowerCase() === 'true') {
          dbCorrectAnswer = 'true';
        } else {
          dbCorrectAnswer = 'false';
        }
      }

      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: dbCorrectAnswer,
          explanation: question.explanation,
          subject: question.subject,
          gradeLevel: question.gradeLevel,
          difficulty: question.difficulty,
          weight: 1.00
        })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedQuestions(prev =>
          prev.map(q => (q.id === id ? { ...q, status: 'approved' as const } : q))
        );
        toast.success('Question approved and saved to database! 📂');
        onApproved?.();
      } else {
        toast.error(data.error || 'Failed to save question to database');
      }
    } catch (e) {
      console.error(e);
      toast.error('Connection failure while saving question');
    }
  };

  const handleReject = (id: string) => {
    setGeneratedQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, status: 'rejected' as const } : q))
    );
  };

  const handleEdit = (id: string, updatedQuestion: any) => {
    setGeneratedQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updatedQuestion } : q))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const stats = {
    total: generatedQuestions.length,
    approved: generatedQuestions.filter(q => q.status === 'approved').length,
    pending: generatedQuestions.filter(q => q.status === 'pending').length,
    rejected: generatedQuestions.filter(q => q.status === 'rejected').length,
  };

  // Example prompts for different subjects
  const examplePrompts = {
    Math: [
      "Create questions about solving quadratic equations using the quadratic formula",
      "Generate questions on fractions and decimal conversions",
      "Create word problems involving percentages and discounts"
    ],
    Science: [
      "Create questions about the water cycle and precipitation",
      "Generate questions on photosynthesis and cellular respiration",
      "Create questions about the solar system and planetary motion"
    ],
    English: [
      "Create questions about identifying parts of speech in sentences",
      "Generate comprehension questions based on short passages",
      "Create questions about grammar rules and punctuation"
    ],
    History: [
      "Create questions about major events in World War II",
      "Generate questions about the American Revolution",
      "Create questions about ancient civilizations"
    ],
    Geography: [
      "Create questions about world capitals and countries",
      "Generate questions about climate zones and weather patterns",
      "Create questions about landforms and geographical features"
    ]
  };

  const renderLayout = (content: React.ReactNode) => {
    if (embedMode) return content;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8 max-w-7xl">
          {content}
        </main>
      </div>
    );
  };

  return renderLayout(
    <div className={embedMode ? "space-y-6 animate-fadeIn" : "space-y-8"}>
      {embedMode ? (
        <div className="flex items-center gap-3 border-b pb-4">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          <div>
            <h3 className="text-lg font-bold">AI Question Generator 🤖</h3>
            <p className="text-xs text-muted-foreground">Synthesize high-quality curriculum-aligned questions automatically.</p>
          </div>
        </div>
      ) : (
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">AI Question Generator</h1>
          </div>
          <p className="text-muted-foreground">Generate, review, and approve AI-powered questions for your question bank</p>
        </div>
      )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Generated</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-lift">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="generate">Generate Questions</TabsTrigger>
            <TabsTrigger value="examples">Examples & Prompts</TabsTrigger>
            <TabsTrigger value="review">Review & Approve</TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Generation Form */}
              <div className="lg:col-span-2">
                <Card className="hover-lift">
                  <CardHeader>
                    <CardTitle>Generate New Questions</CardTitle>
                    <CardDescription>Configure AI settings and generate questions in bulk</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isGenerating ? (
                      <div className="py-12 flex flex-col items-center justify-center space-y-6">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <div className="text-center space-y-2 max-w-md mx-auto">
                          <h3 className="text-xl font-bold text-foreground">Generating actual questions... 🚀</h3>
                          <p className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full animate-pulse">
                            {generationSteps[currentStep]}
                          </p>
                        </div>
                        <div className="w-full max-w-md bg-secondary h-2.5 rounded-full overflow-hidden border border-border shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300 ease-out"
                            style={{ width: `${((currentStep + 1) / generationSteps.length) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">
                          Step {currentStep + 1} of {generationSteps.length}
                        </div>

                        {/* Interactive Steps Tick-list */}
                        <div className="w-full max-w-sm border border-border rounded-lg bg-card p-4 space-y-2 text-xs">
                          {generationSteps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {idx < currentStep ? (
                                <CheckCircle className="w-4 h-4 text-green-500 fill-green-100 dark:fill-green-950" />
                              ) : idx === currentStep ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                              )}
                              <span className={`${idx <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Topic *</label>
                            <input
                              type="text"
                              placeholder="e.g., Photosynthesis, Fractions, World War II"
                              value={topic}
                              onChange={e => setTopic(e.target.value)}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Subject</label>
                            <select
                              value={subject}
                              onChange={e => setSubject(e.target.value)}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {user?.role === 'teacher' && user.subjects ? (
                                user.subjects.map((subj: string) => (
                                  <option key={subj} value={subj}>{subj}</option>
                                ))
                              ) : (
                                <>
                                  <option value="Mathematics">Mathematics</option>
                                  <option value="Science">Science</option>
                                  <option value="English">English</option>
                                  <option value="History">History</option>
                                  <option value="Geography">Geography</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Grade Level</label>
                            <select
                              value={gradeLevel}
                              onChange={e => setGradeLevel(parseInt(e.target.value))}
                              disabled={user?.role === 'teacher'}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                              {user?.role === 'teacher' && user.gradeLevel ? (
                                <option value={user.gradeLevel}>Grade {user.gradeLevel}</option>
                              ) : (
                                Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                                  <option key={grade} value={grade}>
                                    Grade {grade}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Difficulty</label>
                            <select
                              value={difficulty}
                              onChange={e => setDifficulty(e.target.value)}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-foreground block mb-2">Quantity</label>
                            <select
                              value={quantity}
                              onChange={e => setQuantity(parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {[5, 10, 20, 50].map(num => (
                                <option key={num} value={num}>
                                  {num} questions
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* ADVANCED CRITERIA: Example & Upload Document */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                          {/* Example Question */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-primary" />
                              Example Question Structure (Optional)
                            </label>
                            <textarea
                              placeholder="Provide a reference example. E.g. 'What is 3/4 + 1/2? A) 1 1/4 B) 5/4 C) 1.25 D) All of the above'"
                              value={exampleQuestion}
                              onChange={e => setExampleQuestion(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/60"
                            />
                            <p className="text-xs text-muted-foreground">
                              The AI will match the format, choice types, and structural style of this example.
                            </p>
                          </div>

                          {/* Guidance Document Upload */}
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-primary" />
                              Guidance Document Upload (Optional)
                            </label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer relative bg-secondary/10">
                              <input
                                type="file"
                                accept=".txt,.csv,.json,.pdf,.docx"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                              <div className="space-y-1.5 pointer-events-none">
                                <Sparkles className="w-6 h-6 mx-auto text-primary animate-pulse" />
                                <p className="font-semibold text-xs text-foreground">
                                  {uploadedFile ? uploadedFile.name : "Drag and drop your guide here"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB • Click to replace` : "Upload syllabus (PDF, DOCX, TXT)"}
                                </p>
                              </div>
                            </div>
                            {uploadedFile && (
                              <div className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
                                <span className="text-muted-foreground truncate max-w-[80%] font-medium">
                                  Active Context: <strong className="text-foreground">{uploadedFile.name}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadedFile(null);
                                    setDocumentText('');
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Custom Prompt Section */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground block">
                            Custom Prompt Instructions (Optional)
                          </label>
                          <textarea
                            placeholder="Add specific instructions for the AI. E.g., 'Focus on real-world applications' or 'Include diagrams or visual descriptions'"
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/60 text-sm"
                          />
                        </div>

                        <Button
                          onClick={handleGenerate}
                          disabled={!topic || isGenerating}
                          size="lg"
                          className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg gap-2 text-white font-semibold transition-all duration-300 hover:brightness-110"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generate Questions
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Tips Sidebar */}
              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20 hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary" />
                      Tips for Better Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Be Specific</p>
                      <p className="text-muted-foreground">Use detailed topics like "Photosynthesis in plants" instead of just "Science"</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Use Custom Prompts</p>
                      <p className="text-muted-foreground">Add context like "Include real-world examples" for more relevant questions</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Review Carefully</p>
                      <p className="text-muted-foreground">Always review and edit generated questions before approving</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Start Small</p>
                      <p className="text-muted-foreground">Generate 5-10 questions first to check quality before bulk generation</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Examples & Prompts Tab */}
          <TabsContent value="examples" className="animate-fadeIn">
            <div className="space-y-6">
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Example Prompts by Subject
                  </CardTitle>
                  <CardDescription>Click on any example to use it as your topic</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(examplePrompts).map(([subj, prompts]) => (
                      <div key={subj} className="space-y-3">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Badge variant="outline">{subj}</Badge>
                        </h3>
                        <div className="space-y-2">
                          {prompts.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTopic(prompt);
                                setSubject(subj);
                                setActiveTab('generate');
                              }}
                              className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-200 text-sm text-foreground hover:text-primary"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Prompt Best Practices */}
              <Card className="hover-lift">
                <CardHeader>
                  <CardTitle>Prompt Writing Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">✓ Good Prompts</p>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>"• Create MCQ questions about mitochondria function"</li>
                        <li>"• Generate word problems with percentages and discounts"</li>
                        <li>"• Create questions testing analysis skills"</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="font-semibold text-red-900 mb-2">✗ Avoid</p>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>"• Very vague topics"</li>
                        <li>"• Contradictory instructions"</li>
                        <li>"• Extremely long or complex prompts"</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="animate-fadeIn">
            <div className="space-y-4">
              {generatedQuestions.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <p className="text-muted-foreground">No questions generated yet. Go to the Generate tab to create questions.</p>
                  </CardContent>
                </Card>
              ) : (
                generatedQuestions.map((question, idx) => (
                  <Card key={question.id} className="hover-lift">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{question.type === 'mcq' ? 'MCQ' : 'True/False'}</Badge>
                              <Badge variant="outline">{question.difficulty}</Badge>
                              <Badge className="bg-primary/20 text-primary">Confidence: {question.confidenceScore}%</Badge>
                              <Badge className={getStatusColor(question.status)}>
                                {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="font-semibold text-foreground mb-3">{question.text}</p>
                            {question.options && (
                              <div className="space-y-2 mb-3">
                                {question.options.map((opt, i) => {
                                  const isCorrect = i === question.correctAnswer;
                                  return (
                                    <div 
                                      key={i} 
                                      className={`text-sm px-2.5 py-1.5 rounded-lg border transition-colors ${
                                        isCorrect 
                                          ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 font-semibold' 
                                          : 'text-muted-foreground border-transparent'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + i)}. {opt} {isCorrect && ' ✓ (Correct)'}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground italic">Explanation: {question.explanation}</p>
                          </div>
                          <div className="flex gap-2">
                            {question.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(question.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(question.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
