import { useState, useEffect } from 'react';

// Dynamic mock state storage in memory to allow local mutations/queries to reflect changes
const mockState: Record<string, any> = {
  units: [
    { id: 1, titleAr: "Unit 1: General Grammar", titleEn: "Unit 1: General Grammar", descriptionAr: "Comprehensive study of tenses and conjunctions", descriptionEn: "Comprehensive study of tenses and conjunctions", price: "150.00", orderIndex: 1, isPublished: 1, gradeLevel: "الصف الثالث الثانوي", coverUrl: "/unit_1_grammar.png" },
    { id: 2, titleAr: "Unit 2: Reading & Comprehension", titleEn: "Unit 2: Reading & Comprehension", descriptionAr: "Speed reading skills and vocabulary extraction", descriptionEn: "Speed reading skills and vocabulary extraction", price: "150.00", orderIndex: 2, isPublished: 1, gradeLevel: "الصف الثالث الثانوي", coverUrl: "/unit_2_reading.png" },
    { id: 3, titleAr: "Unit 3: Writing & Essay Structure", titleEn: "Unit 3: Writing & Essay Structure", descriptionAr: "Mastering the art of essay writing", descriptionEn: "Mastering the art of essay writing", price: "150.00", orderIndex: 3, isPublished: 1, gradeLevel: "الصف الثالث الثانوي" },
    { id: 4, titleAr: "Unit 4: Advanced Vocabulary & Idioms", titleEn: "Unit 4: Advanced Vocabulary & Idioms", descriptionAr: "Expanding vocabulary with advanced terms and idioms", descriptionEn: "Expanding vocabulary with advanced terms and idioms", price: "150.00", orderIndex: 4, isPublished: 1, gradeLevel: "الصف الثالث الثانوي" }
  ],
  lessons: {
    1: [
      { id: 101, titleAr: "الدرس الأول: زمن المضارع التام", titleEn: "Lesson 1: Present Perfect Tense", videoUrl: "https://www.youtube.com/embed/553eeL1Dvho?si=au3qWafJVHc2L2Ai", orderIndex: 1, isPublished: 1, isFreePreview: true, unitId: 1 },
      { id: 102, titleAr: "الدرس الثاني: الماضي المستمر", titleEn: "Lesson 2: Past Continuous Tense", videoUrl: "https://www.youtube.com/embed/M7lc1UVf-VE", orderIndex: 2, isPublished: 1, isFreePreview: false, unitId: 1 }
    ],
    2: [
      { id: 201, titleAr: "الدرس الأول: تحليل النص", titleEn: "Lesson 1: Text Analysis", videoUrl: "https://www.youtube.com/embed/dJjSmTwfaXY?si=8PHrWsKKFmZWEiEG", orderIndex: 1, isPublished: 1, isFreePreview: true, unitId: 2 }
    ]
  },
  materials: {
    101: [
      { id: 1001, titleAr: "ملخص القواعد PDF", type: "pdf", url: "#", orderIndex: 1 },
      { id: 1002, titleAr: "تمارين وتدريبات", type: "exercise", url: "#", orderIndex: 2 }
    ]
  },
  tests: {
    1: [
      {
        id: 301,
        titleAr: "اختبار شامل على الوحدة الأولى: قواعد الأزمنة",
        titleEn: "Unit 1 Grammar Assessment: Tenses",
        durationMinutes: 30,
        passingScore: 60,
        unitId: 1,
        isPublished: 1,
        availableFrom: "2026-06-01T00:00",
        availableUntil: "2026-12-31T23:59"
      }
    ],
    2: [
      {
        id: 302,
        titleAr: "اختبار مهارات القراءة والاستيعاب",
        titleEn: "Unit 2 Reading & Comprehension Skills",
        durationMinutes: 20,
        passingScore: 50,
        unitId: 2,
        isPublished: 1,
        availableFrom: "2026-06-15T00:00",
        availableUntil: "2026-12-31T23:59"
      }
    ]
  },
  questions: {
    301: [
      {
        id: 401,
        testId: 301,
        questionText: "She _______ her homework before going out with her friends last night.",
        optionA: "finishes",
        optionB: "has finished",
        optionC: "had finished",
        optionD: "is finishing",
        correctOption: "C",
        explanation: "نستخدم الماضي التام (had + p.p) للتعبير عن حدث تم قبل حدث آخر في الماضي البسيط (went out).",
        points: 2,
        orderIndex: 1
      },
      {
        id: 402,
        testId: 301,
        questionText: "They _______ English for three years now and they really enjoy it.",
        optionA: "have been studying",
        optionB: "studied",
        optionC: "study",
        optionD: "will study",
        correctOption: "A",
        explanation: "نستخدم المضارع التام المستمر (have/has been + v-ing) لحدث بدأ في الماضي وما زال مستمراً حتى الحاضر.",
        points: 2,
        orderIndex: 2
      },
      {
        id: 403,
        testId: 301,
        questionText: "If he _______ harder, he would have passed that exam.",
        optionA: "studied",
        optionB: "studies",
        optionC: "has studied",
        optionD: "had studied",
        correctOption: "D",
        explanation: "هذه الحالة الثالثة من قاعدة If الشرطية (Past Perfect in if-clause -> would have + p.p in main clause).",
        points: 2,
        orderIndex: 3
      }
    ],
    302: [
      {
        id: 411,
        testId: 302,
        questionText: "What is the primary benefit of speed reading techniques?",
        optionA: "Memorizing every single letter",
        optionB: "Capturing word groups at a glance and minimizing subvocalization",
        optionC: "Translating words back into your native language",
        optionD: "Reading with your eyes closed",
        correctOption: "B",
        explanation: "Speed reading is optimized by reading blocks of words and reducing silent speech (subvocalization).",
        points: 2,
        orderIndex: 1
      },
      {
        id: 412,
        testId: 302,
        questionText: "To 'comprehend' a text means to _______.",
        optionA: "understand its meaning thoroughly",
        optionB: "write a review about it",
        optionC: "translate it literally",
        optionD: "copy it down on paper",
        correctOption: "A",
        explanation: "Comprehend is a synonym for understanding or grasping the meaning of something.",
        points: 2,
        orderIndex: 2
      }
    ]
  },
  settings: {
    id: 1,
    siteName: "منصة الأستاذ أحمد محمود",
    siteNameEn: "Mr. Ahmed Mahmoud English Platform",
    logoUrl: null,
    bannerUrl: null,
    liveRoomEnabled: 1,
    liveRoomUrl: "https://meet.google.com/abc-defg-hij",
    sessionPrice: 50,
    termPrice: 300,
    createdAt: Date.now()
  },
  transactions: [
    { id: 501, studentId: 801, amountEgp: 300, status: "success", paymentMethod: "vodafone_cash", referenceId: "TXN12345678", createdAt: Date.now() - 3600000 },
    { id: 502, studentId: 802, amountEgp: 300, status: "success", paymentMethod: "fawry", referenceId: "TXN87654321", createdAt: Date.now() - 7200000 },
    { id: 503, studentId: 803, amountEgp: 150, status: "success", paymentMethod: "vodafone_cash", referenceId: "TXN55443322", createdAt: Date.now() - 18000000 },
    { id: 504, studentId: 804, amountEgp: 300, status: "success", paymentMethod: "coupon", referenceId: "WELCOME20", createdAt: Date.now() - 86400000 },
    { id: 505, studentId: 805, amountEgp: 150, status: "pending", paymentMethod: "fawry", referenceId: "TXN99887766", createdAt: Date.now() - 172800000 }
  ],
  coupons: [
    { id: 601, code: "WELCOME20", amountEgp: 20, status: "active", createdAt: Date.now() }
  ],
  plans: [
    {
      id: 1,
      nameAr: "باقة الترم الأول كامل",
      planType: "semester",
      priceEgp: 300,
      durationDays: 90,
      sessionsIncluded: 24,
      description: "اشتراك شامل لجميع وحدات الفصل الدراسي الأول",
      isActive: true,
      createdAt: Date.now() - 86400000
    },
    {
      id: 2,
      nameAr: "باقة 4 جلسات مباشرة",
      planType: "session",
      priceEgp: 150,
      durationDays: 30,
      sessionsIncluded: 4,
      description: "حضور 4 جلسات تفاعلية مباشرة مع الأستاذ",
      isActive: true,
      createdAt: Date.now() - 172800000
    }
  ],
  notifications: [
    { id: 701, titleAr: "تمت إضافة وحدة جديدة", titleEn: "New Unit Added", bodyAr: "تم رفع الوحدة الثانية لمادة اللغة الإنجليزية", bodyEn: "Unit 2 has been successfully published", isRead: false, createdAt: Date.now() - 100000 },
    { id: 702, titleAr: "تفعيل البث المباشر", titleEn: "Live stream active", bodyAr: "محاضرة المراجعة المباشرة بدأت الآن", bodyEn: "Live revision lecture is starting now", isRead: false, createdAt: Date.now() - 500000 }
  ],
  studentsList: [
    {
      id: 801,
      nameAr: "أحمد محمود سالم",
      nameEn: "Ahmed Mahmoud Salem",
      gradeLevel: "الصف الثالث الثانوي",
      walletBalance: 150,
      isActive: true,
      phone: "01012345678",
      parentPhone: "01234567890",
      schoolName: "مدرسة المتفوقين"
    },
    {
      id: 802,
      nameAr: "سارة محمد علي",
      nameEn: "Sara Mohamed Ali",
      gradeLevel: "الصف الثالث الثانوي",
      walletBalance: 300,
      isActive: true,
      phone: "01123456789",
      parentPhone: "01198765432",
      schoolName: "مدرسة السلام الثانوية"
    },
    {
      id: 803,
      nameAr: "عمر خالد حسن",
      nameEn: "Omar Khaled Hassan",
      gradeLevel: "الصف الثالث الثانوي",
      walletBalance: 50,
      isActive: true,
      phone: "01234567891",
      parentPhone: "01298765431",
      schoolName: "مدرسة الحرية التجريبية"
    },
    {
      id: 804,
      nameAr: "يوسف إبراهيم سعد",
      nameEn: "Youssef Ibrahim Saad",
      gradeLevel: "الصف الثاني الثانوي",
      walletBalance: 200,
      isActive: true,
      phone: "01555555555",
      parentPhone: "01566666666",
      schoolName: "مدرسة النور"
    },
    {
      id: 805,
      nameAr: "ليلى عبد الله منصور",
      nameEn: "Laila Abdullah Mansour",
      gradeLevel: "الصف الأول الثانوي",
      walletBalance: 100,
      isActive: true,
      phone: "01099998888",
      parentPhone: "01077776666",
      schoolName: "مدرسة المعادي للبنات"
    },
    {
      id: 806,
      nameAr: "خالد عبد الله",
      nameEn: "Khaled Abdullah",
      gradeLevel: "الصف الثالث الثانوي",
      walletBalance: 150,
      isActive: true,
      phone: "01222223333",
      parentPhone: "01244445555",
      schoolName: "مدرسة التوفيقية"
    }
  ],
  studentProfile: {
    id: 801,
    nameAr: "طالب تجريبي",
    nameEn: "Demo Student",
    gradeLevel: "الصف الثالث الثانوي",
    walletBalance: 150,
    isActive: true
  },
  assignedTests: []
};

const queryListeners = new Set<() => void>();

export const invalidateMockQueries = () => {
  queryListeners.forEach((listener) => listener());
};

const createMockQuery = (path: string[]) => {
  return {
    useQuery: (input?: any, options?: any) => {
      const [namespace, method] = path;
      const [tick, setTick] = useState(0);

      useEffect(() => {
        const handler = () => setTick(t => t + 1);
        queryListeners.add(handler);
        return () => {
          queryListeners.delete(handler);
        };
      }, []);

      // Local state mapping
      let data: any = undefined;
      
      if (namespace === 'settings') {
        data = mockState.settings;
      } else if (namespace === 'units') {
        if (method === 'gradeLevels') {
          const unitGrades = mockState.units.map((u: any) => u.gradeLevel);
          const studentGrades = mockState.studentsList.map((s: any) => s.gradeLevel);
          data = Array.from(new Set([...unitGrades, ...studentGrades])).filter(Boolean);
        } else {
          data = mockState.units;
        }
      } else if (namespace === 'lessons') {
        if (method === 'listFreePreview') {
          // Return all lessons marked as free preview, enriched with unit info
          const allLessons = Object.entries(mockState.lessons).flatMap(([unitId, lessons]: [string, any]) => {
            const unit = mockState.units.find((u: any) => u.id === Number(unitId));
            return (lessons as any[]).filter((l: any) => l.isFreePreview).map((l: any) => ({
              ...l,
              unitId: Number(unitId),
              unitTitleAr: unit?.titleAr ?? '',
              unitTitleEn: unit?.titleEn ?? '',
            }));
          });
          data = allLessons;
        } else {
          const uId = input?.unitId;
          data = uId ? (mockState.lessons[uId] || []) : Object.values(mockState.lessons).flat();
        }
      } else if (namespace === 'materials') {
        const lId = input?.lessonId;
        data = lId ? (mockState.materials[lId] || []) : [];
      } else if (namespace === 'tests') {
        if (method === 'get') {
          const testId = Number(input?.id);
          data = Object.values(mockState.tests).flat().find((t: any) => t.id === testId);
        } else if (method === 'getAssignedStudents') {
          const testId = Number(input?.testId);
          const list = mockState.assignedTests || [];
          data = list.filter((a: any) => a.testId === testId).map((a: any) => a.studentId);
        } else if (method === 'getMyAssignedTests') {
          const myId = 801;
          const list = mockState.assignedTests || [];
          const myAssignedTestIds = list.filter((a: any) => a.studentId === myId).map((a: any) => a.testId);
          data = Object.values(mockState.tests).flat().filter((t: any) => myAssignedTestIds.includes(t.id));
        } else {
          const uId = input?.unitId;
          data = uId ? (mockState.tests[uId] || []) : Object.values(mockState.tests).flat();
        }
      } else if (namespace === 'questions') {
        const tId = input?.testId;
        data = tId ? (mockState.questions[tId] || []) : [];
      } else if (namespace === 'students') {
        if (method === 'getMyProfile') {
          data = mockState.studentProfile;
        } else if (method === 'list') {
          data = mockState.studentsList;
        } else if (method === 'getEnrollments') {
          data = [{ id: 1, unitId: 1 }];
        } else if (method === 'getMyTransactions') {
          data = (mockState.transactions || []).filter((t: any) => t.studentId === 801);
        }
      } else if (namespace === 'testTaking') {
        if (method === 'myResults') {
          data = [
            { id: 901, unitId: 1, testId: 301, score: 4, totalPoints: 4, percentage: "100.00", passed: true }
          ];
        }
      } else if (namespace === 'notifications') {
        if (method === 'unreadCount') {
          data = { count: mockState.notifications.filter((n: any) => !n.isRead).length };
        } else if (method === 'list') {
          data = mockState.notifications;
        }
      } else if (namespace === 'payments' && method === 'listTransactions') {
        data = mockState.transactions;
      } else if (namespace === 'payments' && method === 'listCoupons') {
        data = mockState.coupons;
      } else if (namespace === 'subscriptions') {
        if (method === 'listAllPlans') {
          data = mockState.plans;
        } else if (method === 'listPlans') {
          data = mockState.plans.filter((p: any) => p.isActive !== false);
        }
      } else if (namespace === 'analytics') {
        const currentLang = localStorage.getItem("lang") || "ar";
        const grade = input?.gradeLevel;
        const isFiltered = grade && grade !== 'all';

        if (method === 'studentRecommendation') {
          data = {
            recommendation: currentLang === "ar" 
              ? "مجهود رائع! ينصح بالبدء في الوحدة الثانية للتركيز على مهارات القراءة واستخراج المعاني الجديدة."
              : "Great job! It is recommended to start Unit 2 to focus on reading comprehension and vocabulary extraction."
          };
        } else if (method === 'dashboardStats') {
          const studList = isFiltered ? mockState.studentsList.filter((s: any) => s.gradeLevel === grade) : mockState.studentsList;
          const studIds = new Set(studList.map((s: any) => s.id));
          const txns = isFiltered ? mockState.transactions.filter((t: any) => studIds.has(t.studentId)) : mockState.transactions;
          const totalRev = txns.filter((t: any) => t.status === 'success').reduce((sum: any, t: any) => sum + t.amountEgp, 0);
          const totalStud = studList.length;
          const pubUnits = mockState.units.filter((u: any) => u.isPublished && (!isFiltered || u.gradeLevel === grade)).length;
          data = {
            totalRevenue: totalRev > 0 ? totalRev : (isFiltered ? (grade === "الصف الثالث الثانوي" ? 750 : 450) : 1200),
            totalStudents: totalStud,
            avgTestScore: isFiltered ? (grade === "الصف الثالث الثانوي" ? 88 : grade === "الصف الثاني الثانوي" ? 82 : 79) : 86,
            publishedUnits: pubUnits,
            totalTests: isFiltered ? 8 : 24,
            completionRate: isFiltered ? 91 : 88,
            activeStudents: isFiltered ? totalStud : 12,
            explanatoryLessons: isFiltered ? 14 : 42,
          };
        } else if (method === 'aiInsights') {
          if (isFiltered) {
            if (grade === "الصف الثالث الثانوي") {
              data = { insight: currentLang === "en" ? "3rd Secondary students show high proficiency in Tenses (88%) but require practice on Advanced Deductive Reading." : "طلاب الصف الثالث الثانوي يظهرون تفوقاً في قواعد الأزمنة (88%) ولكنهم بحاجة لمزيد من التدريب على الاستنتاج المتقدم في نصوص القراءة." };
            } else if (grade === "الصف الثاني الثانوي") {
              data = { insight: currentLang === "en" ? "2nd Secondary students are making steady progress in Vocabulary, with a slight dip in Conditional Sentences." : "طلاب الصف الثاني الثانوي يحرزون تقدماً مستقراً في المفردات، مع وجود بعض الملاحظات في قاعدة الجمل الشرطية." };
            } else {
              data = { insight: currentLang === "en" ? "1st Secondary students are adapting well to the foundational grammar curriculum." : "طلاب الصف الأول الثانوي يتأقلمون بشكل جيد مع منهج القواعد الأساسي للمرحلة الثانوية." };
            }
          } else {
            data = {
              insight: currentLang === "en" 
                ? "Students are performing exceptionally well in Present Perfect Tense (88% success), but show difficulty in Past Continuous and Irregular Verbs. Recommendation: Provide focused bite-sized interactive quizzes on irregular past participles." 
                : "أداء الطلاب ممتاز في قاعدة المضارع التام (نسبة نجاح 88%)، ولكن يلاحظ وجود صعوبة في قاعدة الماضي المستمر والأفعال الشاذة. التوصية: تخصيص اختبارات قصيرة تركز على تصريف الأفعال الشاذة."
            };
          }
        } else if (method === 'testPerformance') {
          if (grade === "الصف الثالث الثانوي") {
            data = {
              missedQuestions: currentLang === "en" ? [
                { id: "Q1: Past Participle of 'go'", wrongCount: 14 },
                { id: "Q4: If Conditional Type 2", wrongCount: 11 },
                { id: "Q2: Since vs For usage", wrongCount: 8 }
              ] : [
                { id: "سؤال 1: تصريف الفعل 'go'", wrongCount: 14 },
                { id: "سؤال 4: قاعدة If الحالة الثانية", wrongCount: 11 },
                { id: "سؤال 2: استخدام Since و For", wrongCount: 8 }
              ]
            };
          } else if (grade === "الصف الثاني الثانوي") {
            data = {
              missedQuestions: currentLang === "en" ? [
                { id: "Q3: Passive Voice rules", wrongCount: 7 },
                { id: "Q6: Modals of Deduction", wrongCount: 5 }
              ] : [
                { id: "سؤال 3: قواعد المبني للمجهول", wrongCount: 7 },
                { id: "سؤال 6: الأفعال الناقصة للاستنتاج", wrongCount: 5 }
              ]
            };
          } else if (isFiltered) {
            data = {
              missedQuestions: currentLang === "en" ? [
                { id: "Q1: Basic Subject-Verb agreement", wrongCount: 4 }
              ] : [
                { id: "سؤال 1: التوافق الأساسي بين الفاعل والفعل", wrongCount: 4 }
              ]
            };
          } else {
            data = {
              missedQuestions: currentLang === "en" ? [
                { id: "Q1: Past Participle of 'go'", wrongCount: 14 },
                { id: "Q4: If Conditional Type 2", wrongCount: 11 },
                { id: "Q2: Since vs For usage", wrongCount: 8 },
                { id: "Q5: Present Perfect vs Past Simple", wrongCount: 6 },
                { id: "Q3: Relative Pronouns (who/which)", wrongCount: 4 }
              ] : [
                { id: "سؤال 1: تصريف الفعل 'go'", wrongCount: 14 },
                { id: "سؤال 4: قاعدة If الحالة الثانية", wrongCount: 11 },
                { id: "سؤال 2: استخدام Since و For", wrongCount: 8 },
                { id: "سؤال 5: المضارع التام مقابل الماضي البسيط", wrongCount: 6 },
                { id: "سؤال 3: ضمائر الوصل (who/which)", wrongCount: 4 }
              ]
            };
          }
        } else if (method === 'studentPerformanceTrends') {
          const allTrends = [
            {
              name: currentLang === "en" ? "Ahmed Salem" : "أحمد محمود سالم", grade: "الصف الثالث الثانوي",
              tier: "best",
              avgScore: 94,
              results: [ { date: "2026-05-10", score: 90 }, { date: "2026-05-20", score: 95 }, { date: "2026-06-01", score: 92 }, { date: "2026-06-15", score: 98 } ]
            },
            {
              name: currentLang === "en" ? "Sara Mohamed" : "سارة محمد علي", grade: "الصف الثالث الثانوي",
              tier: "best",
              avgScore: 91,
              results: [ { date: "2026-05-10", score: 85 }, { date: "2026-05-20", score: 90 }, { date: "2026-06-01", score: 94 }, { date: "2026-06-15", score: 95 } ]
            },
            {
              name: currentLang === "en" ? "Omar Khaled" : "عمر خالد حسن", grade: "الصف الثالث الثانوي",
              tier: "worst",
              avgScore: 54,
              results: [ { date: "2026-05-10", score: 62 }, { date: "2026-05-20", score: 55 }, { date: "2026-06-01", score: 50 }, { date: "2026-06-15", score: 48 } ]
            },
            {
              name: currentLang === "en" ? "Youssef Saad" : "يوسف إبراهيم سعد", grade: "الصف الثاني الثانوي",
              tier: "worst",
              avgScore: 58,
              results: [ { date: "2026-05-10", score: 50 }, { date: "2026-05-20", score: 60 }, { date: "2026-06-01", score: 55 }, { date: "2026-06-15", score: 66 } ]
            },
            {
              name: currentLang === "en" ? "Laila Mansour" : "ليلى عبد الله منصور", grade: "الصف الأول الثانوي",
              tier: "best",
              avgScore: 89,
              results: [ { date: "2026-05-10", score: 80 }, { date: "2026-05-20", score: 85 }, { date: "2026-06-01", score: 90 }, { date: "2026-06-15", score: 94 } ]
            }
          ];
          data = isFiltered ? allTrends.filter(t => t.grade === grade) : allTrends;
        } else if (method === 'atRiskStudents') {
          const allRisk = [
            { studentId: 803, name: currentLang === "en" ? "Omar Khaled" : "عمر خالد حسن", grade: "الصف الثالث الثانوي", testCount: 4, avgScore: 54, latestScore: 48 },
            { studentId: 804, name: currentLang === "en" ? "Youssef Saad" : "يوسف إبراهيم سعد", grade: "الصف الثاني الثانوي", testCount: 4, avgScore: 58, latestScore: 66 }
          ];
          data = isFiltered ? allRisk.filter(r => r.grade === grade) : allRisk;
        } else if (method === 'videoWatchSummary') {
          const allLessonStats = [
            { lessonId: 101, grade: "الصف الثالث الثانوي", lessonTitle: currentLang === "en" ? "Lesson 1: Present Perfect Tense" : "الدرس الأول: زمن المضارع التام", viewerCount: 14, avgWatchPercent: 92 },
            { lessonId: 102, grade: "الصف الثالث الثانوي", lessonTitle: currentLang === "en" ? "Lesson 2: Past Continuous Tense" : "الدرس الثاني: الماضي المستمر", viewerCount: 12, avgWatchPercent: 75 },
            { lessonId: 201, grade: "الصف الثالث الثانوي", lessonTitle: currentLang === "en" ? "Lesson 1: Text Analysis" : "الدرس الأول: تحليل النصوص", viewerCount: 10, avgWatchPercent: 84 },
            { lessonId: 301, grade: "الصف الثاني الثانوي", lessonTitle: currentLang === "en" ? "Lesson 1: Conditional Sentences" : "الدرس الأول: الجمل الشرطية", viewerCount: 8, avgWatchPercent: 81 },
            { lessonId: 401, grade: "الصف الأول الثانوي", lessonTitle: currentLang === "en" ? "Lesson 1: Basics of Grammar" : "الدرس الأول: أساسيات القواعد", viewerCount: 6, avgWatchPercent: 88 }
          ];
          const allStudentStats = [
            { name: currentLang === "en" ? "Ahmed Salem" : "أحمد محمود سالم", grade: "الصف الثالث الثانوي", lessons: 3, avgPercent: 95 },
            { name: currentLang === "en" ? "Sara Mohamed" : "سارة محمد علي", grade: "الصف الثالث الثانوي", lessons: 3, avgPercent: 90 },
            { name: currentLang === "en" ? "Khaled Abdullah" : "خالد عبد الله", grade: "الصف الثالث الثانوي", lessons: 2, avgPercent: 85 },
            { name: currentLang === "en" ? "Omar Khaled" : "عمر خالد حسن", grade: "الصف الثالث الثانوي", lessons: 2, avgPercent: 45 },
            { name: currentLang === "en" ? "Youssef Saad" : "يوسف إبراهيم سعد", grade: "الصف الثاني الثانوي", lessons: 2, avgPercent: 55 },
            { name: currentLang === "en" ? "Laila Mansour" : "ليلى عبد الله منصور", grade: "الصف الأول الثانوي", lessons: 2, avgPercent: 91 }
          ];
          data = {
            lessonStats: isFiltered ? allLessonStats.filter(l => l.grade === grade) : allLessonStats,
            studentStats: isFiltered ? allStudentStats.filter(s => s.grade === grade) : allStudentStats
          };
        } else {
          data = {
            totalRevenue: 1200,
            studentCount: 15,
            activeCount: 12,
            avgTestScore: 86,
            missedQuestions: [],
            studentPerformanceTrends: [],
            atRiskStudents: [],
            aiInsights: "أداء الطلاب ممتاز بشكل عام، ينصح بالتركيز على حروف الجر والروابط."
          };
        }
      }

      return { data, isLoading: false, isSuccess: true, refetch: () => {} };
    },
    useMutation: (options?: any) => {
      return {
        mutate: (variables: any) => {
          const [namespace, method] = path;
          console.log(`[Mock tRPC Mutation] Executed ${path.join('.')}`, variables);
          
          if (namespace === 'auth' && method === 'logout') {
            localStorage.clear();
            if (options?.onSuccess) options.onSuccess();
            return;
          }

          if (namespace === 'settings' && method === 'update') {
            Object.assign(mockState.settings, variables);
            if (options?.onSuccess) options.onSuccess(mockState.settings);
            return;
          }

          if (namespace === 'units') {
            if (method === 'create') {
              const newUnit = {
                id: Date.now(),
                titleAr: variables.titleAr,
                titleEn: variables.titleEn,
                descriptionAr: variables.description,
                descriptionEn: variables.description,
                price: variables.price,
                orderIndex: variables.orderIndex,
                isPublished: variables.isPublished ? 1 : 0,
                gradeLevel: variables.gradeLevel,
                isLivePass: variables.isLivePass,
              };
              mockState.units.push(newUnit);
              if (options?.onSuccess) options.onSuccess(newUnit);
              return;
            }
            if (method === 'update') {
              const index = mockState.units.findIndex((u: any) => u.id === variables.id);
              if (index !== -1) {
                mockState.units[index] = {
                  ...mockState.units[index],
                  titleAr: variables.titleAr,
                  titleEn: variables.titleEn,
                  descriptionAr: variables.description,
                  descriptionEn: variables.description,
                  price: variables.price,
                  orderIndex: variables.orderIndex,
                  isPublished: variables.isPublished ? 1 : 0,
                  gradeLevel: variables.gradeLevel,
                  isLivePass: variables.isLivePass,
                };
                if (options?.onSuccess) options.onSuccess(mockState.units[index]);
              }
              return;
            }
            if (method === 'delete') {
              mockState.units = mockState.units.filter((u: any) => u.id !== variables.id);
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
          }

          if (namespace === 'lessons') {
            if (method === 'create') {
              if (!mockState.lessons[variables.unitId]) {
                mockState.lessons[variables.unitId] = [];
              }
              const newLesson = {
                id: Date.now(),
                unitId: variables.unitId,
                titleAr: variables.titleAr,
                titleEn: variables.titleEn,
                videoUrl: variables.videoUrl,
                durationMinutes: variables.durationMinutes,
                isFreePreview: variables.isFreePreview,
                orderIndex: variables.orderIndex,
                isPublished: 1,
              };
              mockState.lessons[variables.unitId].push(newLesson);
              if (options?.onSuccess) options.onSuccess(newLesson);
              return;
            }
            if (method === 'update') {
              const unitId = variables.unitId;
              if (mockState.lessons[unitId]) {
                const idx = mockState.lessons[unitId].findIndex((l: any) => l.id === variables.id);
                if (idx !== -1) {
                  mockState.lessons[unitId][idx] = {
                    ...mockState.lessons[unitId][idx],
                    titleAr: variables.titleAr,
                    titleEn: variables.titleEn,
                    videoUrl: variables.videoUrl,
                    durationMinutes: variables.durationMinutes,
                    isFreePreview: variables.isFreePreview,
                    orderIndex: variables.orderIndex,
                  };
                  if (options?.onSuccess) options.onSuccess(mockState.lessons[unitId][idx]);
                }
              }
              return;
            }
            if (method === 'delete') {
              Object.keys(mockState.lessons).forEach((uId) => {
                mockState.lessons[uId] = mockState.lessons[uId].filter((l: any) => l.id !== variables.id);
              });
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
          }

          if (namespace === 'students') {
            if (method === 'create') {
              const newStudent = {
                id: Date.now(),
                nameAr: variables.nameAr,
                nameEn: variables.nameAr,
                gradeLevel: variables.gradeLevel || "الصف الثالث الثانوي",
                walletBalance: 0,
                isActive: true,
                phone: variables.phone || "",
                parentPhone: variables.parentPhone || "",
                schoolName: variables.schoolName || ""
              };
              mockState.studentsList.push(newStudent);
              if (options?.onSuccess) options.onSuccess(newStudent);
              return;
            }
            if (method === 'suspend') {
              const student = mockState.studentsList.find((s: any) => s.id === variables.studentId);
              if (student) {
                student.isActive = false;
              }
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
            if (method === 'activate') {
              const student = mockState.studentsList.find((s: any) => s.id === variables.studentId);
              if (student) {
                student.isActive = true;
              }
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
          }

          if (namespace === 'payments') {
            if (method === 'generateCoupons') {
              const codes: string[] = [];
              const count = Number(variables.count || 1);
              const val = Number(variables.valueEgp || 0);
              for (let i = 0; i < count; i++) {
                const randomCode = "CPN-" + Math.random().toString(36).substring(2, 8).toUpperCase();
                codes.push(randomCode);
                mockState.coupons.push({
                  id: Date.now() + i,
                  code: randomCode,
                  valueEgp: val,
                  amountEgp: val,
                  status: "active",
                  createdAt: Date.now(),
                });
              }
              if (options?.onSuccess) options.onSuccess({ codes });
              return;
            }
            if (method === 'subscriptionPayment') {
              if (variables.paymentMethod === 'coupon') {
                const code = variables.couponCode;
                const foundCoupon = mockState.coupons.find((c: any) => c.code === code);
                if (!foundCoupon) {
                  if (options?.onError) {
                    options.onError(new Error("كود الكوبون غير صالح أو غير موجود"));
                  }
                  return;
                }
                if (foundCoupon.status !== 'active') {
                  if (options?.onError) {
                    options.onError(new Error("هذا الكوبون تم استخدامه مسبقاً أو غير نشط"));
                  }
                  return;
                }
                foundCoupon.status = "redeemed";
                foundCoupon.redeemedAt = Date.now();
              }

              const newTxn = {
                id: Date.now(),
                studentId: 801,
                amountEgp: Number(variables.amount || 0),
                paymentMethod: variables.paymentMethod,
                referenceId: variables.couponCode || "TXN-" + Date.now(),
                status: "success",
                createdAt: Date.now(),
              };
              if (!mockState.transactions) {
                mockState.transactions = [];
              }
              mockState.transactions.push(newTxn);

              if (options?.onSuccess) options.onSuccess(newTxn);
              return;
            }
          }

          if (namespace === 'subscriptions') {
            if (method === 'createPlan') {
              if (!mockState.plans) {
                mockState.plans = [];
              }
              const newPlan = {
                id: Date.now(),
                nameAr: variables.nameAr,
                planType: variables.planType,
                priceEgp: Number(variables.priceEgp || 0),
                durationDays: Number(variables.durationDays || 30),
                sessionsIncluded: Number(variables.sessionsIncluded || 1),
                description: variables.description || "",
                isActive: true,
                createdAt: Date.now(),
              };
              mockState.plans.push(newPlan);
              if (options?.onSuccess) options.onSuccess(newPlan);
              return;
            }
            if (method === 'togglePlanActive') {
              const plan = mockState.plans.find((p: any) => p.id === variables.id);
              if (plan) {
                plan.isActive = variables.isActive;
              }
              if (options?.onSuccess) options.onSuccess(plan);
              return;
            }
          }

          if (namespace === 'tests') {
            if (method === 'create') {
              const uId = variables.unitId;
              if (!mockState.tests[uId]) {
                mockState.tests[uId] = [];
              }
              const newTest = {
                id: Date.now(),
                unitId: uId,
                titleAr: variables.titleAr,
                titleEn: variables.titleEn,
                durationMinutes: Number(variables.durationMinutes || 30),
                passingScore: Number(variables.passingScore || 60),
                isPublished: variables.isPublished ? 1 : 0,
                availableFrom: variables.availableFrom || null,
                availableUntil: variables.availableUntil || null,
              };
              mockState.tests[uId].push(newTest);
              if (options?.onSuccess) options.onSuccess(newTest);
              return;
            }
            if (method === 'update') {
              let found: any = null;
              Object.keys(mockState.tests).forEach((uId) => {
                const idx = mockState.tests[uId].findIndex((t: any) => t.id === variables.id);
                if (idx !== -1) {
                  mockState.tests[uId][idx] = {
                    ...mockState.tests[uId][idx],
                    titleAr: variables.titleAr,
                    titleEn: variables.titleEn,
                    durationMinutes: Number(variables.durationMinutes || 30),
                    passingScore: Number(variables.passingScore || 60),
                    isPublished: variables.isPublished ? 1 : 0,
                    availableFrom: variables.availableFrom || null,
                    availableUntil: variables.availableUntil || null,
                  };
                  found = mockState.tests[uId][idx];
                }
              });
              if (options?.onSuccess) options.onSuccess(found);
              return;
            }
            if (method === 'assignToStudents') {
              const testId = Number(variables.testId);
              const studentIds = variables.studentIds || [];
              if (!mockState.assignedTests) {
                mockState.assignedTests = [];
              }
              mockState.assignedTests = mockState.assignedTests.filter((a: any) => a.testId !== testId);
              studentIds.forEach((sId: number) => {
                mockState.assignedTests.push({
                  studentId: sId,
                  testId: testId,
                  assignedAt: Date.now()
                });
              });
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
            if (method === 'delete') {
              Object.keys(mockState.tests).forEach((uId) => {
                mockState.tests[uId] = mockState.tests[uId].filter((t: any) => t.id !== variables.id);
              });
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
          }

          if (namespace === 'questions') {
            if (method === 'create') {
              const tId = variables.testId;
              if (!mockState.questions[tId]) {
                mockState.questions[tId] = [];
              }
              const newQ = {
                id: Date.now(),
                testId: tId,
                questionText: variables.questionText,
                optionA: variables.optionA,
                optionB: variables.optionB,
                optionC: variables.optionC,
                optionD: variables.optionD,
                correctOption: variables.correctOption,
                explanation: variables.explanation || "",
                points: Number(variables.points || 1),
                orderIndex: Number(variables.orderIndex || 0),
              };
              mockState.questions[tId].push(newQ);
              if (options?.onSuccess) options.onSuccess(newQ);
              return;
            }
            if (method === 'bulkCreate') {
              const tId = variables.testId;
              if (!mockState.questions[tId]) {
                mockState.questions[tId] = [];
              }
              const newQuestions = (variables.questions || []).map((q: any, idx: number) => ({
                id: Date.now() + idx,
                testId: tId,
                questionText: q.questionText,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctOption: q.correctOption,
                explanation: q.explanation || "",
                points: Number(q.points || 1),
                orderIndex: (mockState.questions[tId].length) + idx + 1,
              }));
              mockState.questions[tId].push(...newQuestions);
              if (options?.onSuccess) options.onSuccess({ count: newQuestions.length });
              return;
            }
            if (method === 'update') {
              let found: any = null;
              Object.keys(mockState.questions).forEach((tId) => {
                const idx = mockState.questions[tId].findIndex((q: any) => q.id === variables.id);
                if (idx !== -1) {
                  mockState.questions[tId][idx] = {
                    ...mockState.questions[tId][idx],
                    questionText: variables.questionText,
                    optionA: variables.optionA,
                    optionB: variables.optionB,
                    optionC: variables.optionC,
                    optionD: variables.optionD,
                    correctOption: variables.correctOption,
                    explanation: variables.explanation || "",
                    points: Number(variables.points || 1),
                    orderIndex: Number(variables.orderIndex || 0),
                  };
                  found = mockState.questions[tId][idx];
                }
              });
              if (options?.onSuccess) options.onSuccess(found);
              return;
            }
            if (method === 'delete') {
              Object.keys(mockState.questions).forEach((tId) => {
                mockState.questions[tId] = mockState.questions[tId].filter((q: any) => q.id !== variables.id);
              });
              if (options?.onSuccess) options.onSuccess({ success: true });
              return;
            }
            if (method === 'generateAIQuestions') {
              const sample = (variables.sampleQuestion || "").trim();
              let baseSentence = sample;
              let choices = ["finishes", "has finished", "had finished", "is finishing"];

              const match = sample.match(/(.*?)\(([^\)]+)\)(.*)/);
              if (match) {
                baseSentence = (match[1] + match[3]).trim();
                const parts = match[2].split(",").map((s: string) => s.trim()).filter(Boolean);
                if (parts.length >= 4) {
                  choices = parts.slice(0, 4);
                } else if (parts.length > 0) {
                  choices = [parts[0], parts[1] || "has finished", parts[2] || "had finished", parts[3] || "is finishing"];
                }
              }

              const res = {
                questions: [
                  {
                    questionText: `Choose the correct answer: ${baseSentence}`,
                    optionA: choices[0] || "finishes",
                    optionB: choices[1] || "has finished",
                    optionC: choices[2] || "had finished",
                    optionD: choices[3] || "is finishing",
                    correctOption: "C",
                    explanation: "التفسير: الإجابة الصحيحة تتوافق مع التوافق الزمني للجملة وسياق الحدث المطلوب.",
                    points: 1
                  },
                  {
                    questionText: "Choose the correct answer: By the time the police arrived, the burglar _______ out of the window.",
                    optionA: "already jumped",
                    optionB: "had already jumped",
                    optionC: "has already jumped",
                    optionD: "was jumping",
                    correctOption: "B",
                    explanation: "التفسير: رابط الزمن By the time يتبعه ماضي بسيط، والحدث الأول في الجملة الثانية يكون ماضي تام (had + PP).",
                    points: 1
                  },
                  {
                    questionText: "Choose the correct answer: If she had studied harder last year, she _______ the final exam easily.",
                    optionA: "would pass",
                    optionB: "will pass",
                    optionC: "would have passed",
                    optionD: "passed",
                    correctOption: "C",
                    explanation: "التفسير: الحالة الثالثة من قاعدة If (ماضي تام يقابله would have + PP) للتعبير عن استحالة حدوث شيء في الماضي.",
                    points: 2
                  },
                  {
                    questionText: "Choose the correct answer: No sooner _______ the door than the phone started ringing.",
                    optionA: "she had closed",
                    optionB: "did she close",
                    optionC: "had she closed",
                    optionD: "she closes",
                    correctOption: "C",
                    explanation: "التفسير: عند البدء بـ No sooner يتقدم الفعل المساعد على الفاعل على صيغة سؤال (had + subject + PP).",
                    points: 2
                  }
                ]
              };
              if (options?.onSuccess) options.onSuccess(res);
              return;
            }
          }

          if (namespace === 'testTaking' && method === 'submitTest') {
            const tId = Number(variables.testId);
            const answersArray = variables.answers || [];
            const userAnswers: Record<number, string> = {};
            answersArray.forEach((a: any) => {
              userAnswers[a.questionId] = a.selected;
            });

            const testQuestions = mockState.questions[tId] || [];
            const testObj: any = Object.values(mockState.tests).flat().find((t: any) => t.id === tId) || {};
            const passingScore = Number(testObj.passingScore || 60);

            let correctCount = 0;
            const feedback = testQuestions.map((q: any) => {
              const selected = userAnswers[q.id] || "";
              const isCorrect = selected === q.correctOption;
              if (isCorrect) correctCount++;

              return {
                questionId: q.id,
                questionText: q.questionText,
                selectedOption: selected,
                selectedOptionText: q[`option${selected}` as keyof typeof q] || "لم يتم تحديد إجابة",
                correctOption: q.correctOption,
                correctOptionText: q[`option${q.correctOption}` as keyof typeof q] || "",
                isCorrect,
                explanation: q.explanation || "",
              };
            });

            const totalQuestions = testQuestions.length;
            const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            const isPassed = percentage >= passingScore;

            const res = {
              isPassed,
              percentage,
              correctCount,
              totalQuestions,
              feedback,
            };

            if (options?.onSuccess) options.onSuccess(res);
            return;
          }

          if (options?.onSuccess) {
            options.onSuccess({ success: true, ...variables });
          }
        },
        mutateAsync: async (variables: any) => {
          console.log(`[Mock tRPC Async Mutation] Executed ${path.join('.')}`, variables);
          return { success: true, ...variables };
        },
        isLoading: false
      };
    }
  };
};

const makeUtilsProxy = (): any => {
  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      if (prop === 'invalidate' || prop === 'invalidateQueries') {
        return () => { invalidateMockQueries(); };
      }
      return new Proxy(() => {}, handler);
    }
  };
  return new Proxy(() => {}, handler);
};

const makeProxy = (path: string[] = []): any => {
  return new Proxy(() => {}, {
    get(target, prop: string) {
      if (prop === 'useQuery' || prop === 'useMutation') {
        return createMockQuery(path)[prop];
      }
      if (prop === 'useUtils') {
        return () => makeUtilsProxy();
      }
      if (prop === 'invalidate') {
        return () => { invalidateMockQueries(); };
      }
      return makeProxy([...path, prop]);
    }
  });
};

export const trpc = makeProxy();
