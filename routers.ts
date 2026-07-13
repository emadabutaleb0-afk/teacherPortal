import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import * as db from "./db";
import { ENV } from "./_core/env";
// Portal-specific public procedure (resolves portal from subdomain header or host)
const portalProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const subdomainHeader = ctx.req.headers["x-portal-subdomain"];
  let subdomain = Array.isArray(subdomainHeader) ? subdomainHeader[0] : subdomainHeader;
  
  if (!subdomain) {
    const host = ctx.req.headers.host || "";
    const parts = host.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }
  
  if (!subdomain || subdomain === "localhost" || subdomain === "127") {
    subdomain = "ahmed-mahmoud";
  }
  
  const portal = await db.getPortalSettings(subdomain);
  if (!portal) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Portal not found" });
  }
  
  return next({
    ctx: {
      ...ctx,
      portal,
      portalId: portal.id,
    }
  });
});

// Portal-specific protected procedure (requires login + resolves portal)
const protectedPortalProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subdomainHeader = ctx.req.headers["x-portal-subdomain"];
  let subdomain = Array.isArray(subdomainHeader) ? subdomainHeader[0] : subdomainHeader;
  
  if (!subdomain) {
    const host = ctx.req.headers.host || "";
    const parts = host.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }
  
  if (!subdomain || subdomain === "localhost" || subdomain === "127") {
    subdomain = "ahmed-mahmoud";
  }
  
  const portal = await db.getPortalSettings(subdomain);
  if (!portal) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Portal not found" });
  }
  
  return next({
    ctx: {
      ...ctx,
      portal,
      portalId: portal.id,
    }
  });
});

// Admin-only middleware (checks if the logged-in user is the owner of the requested portal)
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subdomainHeader = ctx.req.headers["x-portal-subdomain"];
  let subdomain = Array.isArray(subdomainHeader) ? subdomainHeader[0] : subdomainHeader;
  
  if (!subdomain) {
    const host = ctx.req.headers.host || "";
    const parts = host.split(".");
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }
  
  if (!subdomain || subdomain === "localhost" || subdomain === "127") {
    subdomain = "ahmed-mahmoud";
  }
  
  const portal = await db.getPortalSettings(subdomain);
  if (!portal) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Portal not found" });
  }
  
  const isOwner = ctx.user.openId === portal.ownerOpenId;
  if (!isOwner) {
    throw new TRPCError({ code: "FORBIDDEN", message: "هذا الحساب لا يملك صلاحيات تعديل هذه المنصة" });
  }
  
  return next({
    ctx: {
      ...ctx,
      portal,
      portalId: portal.id,
    }
  });
});

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Portal Settings ─────────────────────────────────────────────────────
  settings: router({
    get: portalProcedure.query(({ ctx }) => ctx.portal),
    // Teacher-editable settings (any admin can update)
    update: adminProcedure
      .input(
        z.object({
          teacherBio: z.string().optional(),
          fawryMerchantCode: z.string().optional(),
          vodafoneCashNumber: z.string().optional(),
          sessionPrice: z.string().optional(),
          termPrice: z.string().optional(),
          welcomeMessage: z.string().optional(),
          liveRoomUrl: z.string().optional(),
          liveRoomEnabled: z.number().optional(),
          liveRoomTitle: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // If enabling live lecture, notify all active students
        if (input.liveRoomEnabled === 1) {
          const title = input.liveRoomTitle ?? "محاضرة مباشرة";
          await db.createNotificationsForAllStudents(
            ctx.portalId,
            "live_lecture",
            `🔴 الآن: ${title}`,
            `بدأت المحاضرة المباشرة. اضغط للانضمام الآن.`,
            "/student"
          );
        }
        await db.updatePortalSettings(ctx.portalId, input);
        return { success: true };
      }),
    // Owner-only white-label settings (only the portal owner can update)
    updateWhiteLabel: adminProcedure
      .input(
        z.object({
          teacherName: z.string().optional(),
          subject: z.string().optional(),
          gradeLevel: z.string().optional(),
          primaryColor: z.string().optional(),
          logoUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updatePortalSettings(ctx.portalId, input);
        return { success: true };
      }),
    uploadLogo: adminProcedure
      .input(z.object({ base64: z.string(), mimeType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `logos/portal-logo-${Date.now()}.${input.mimeType.split("/")[1]}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await db.updatePortalSettings(ctx.portalId, { logoUrl: url });
        return { url };
      }),
  }),

  // ─── Units ───────────────────────────────────────────────────────────────
  units: router({
    list: portalProcedure.query(({ ctx }) => db.getAllUnits(ctx.portalId)),
    listByGrade: portalProcedure
      .input(z.object({ gradeLevel: z.string() }))
      .query(({ ctx, input }) => db.getUnitsByGrade(ctx.portalId, input.gradeLevel)),
    gradeLevels: portalProcedure.query(({ ctx }) => db.getDistinctGradeLevels(ctx.portalId)),
    get: portalProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getUnitById(input.id)),
    create: adminProcedure
      .input(
        z.object({
          titleAr: z.string().min(1),
          titleEn: z.string().min(1),
          description: z.string().optional(),
          gradeLevel: z.string().min(1).default('الصف الثالث الثانوي'),
          orderIndex: z.number().default(0),
          price: z.string().default("150.00"),
          isLivePass: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.createUnit({ ...input, portalId: ctx.portalId, isPublished: false });
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titleAr: z.string().optional(),
          titleEn: z.string().optional(),
          description: z.string().optional(),
          gradeLevel: z.string().optional(),
          orderIndex: z.number().optional(),
          isPublished: z.boolean().optional(),
          isLivePass: z.boolean().optional(),
          price: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        // If publishing a unit, notify all active students
        if (data.isPublished === true) {
          const unit = await db.getUnitById(id);
          const unitTitle = unit?.titleAr ?? "وحدة جديدة";
          await db.createNotificationsForAllStudents(
            ctx.portalId,
            "new_lesson",
            `وحدة جديدة: ${unitTitle}`,
            `تم نشر وحدة جديدة بعنوان “${unitTitle}”. اضغط للاطلاع.`,
            "/student"
          );
        }
        await db.updateUnit(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUnit(input.id);
        return { success: true };
      }),
  }),

  // ─── Lessons ─────────────────────────────────────────────────────────────
  lessons: router({
    listByUnit: publicProcedure
      .input(z.object({ unitId: z.number() }))
      .query(({ input }) => db.getLessonsByUnit(input.unitId)),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getLessonById(input.id)),
    create: adminProcedure
      .input(
        z.object({
          unitId: z.number(),
          titleAr: z.string().min(1),
          titleEn: z.string().optional(),
          contentType: z.enum(["video", "pdf", "text"]),
          videoUrl: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfKey: z.string().optional(),
          textContent: z.string().optional(),
          isFreePreview: z.boolean().default(false),
          orderIndex: z.number().default(0),
          durationMinutes: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        await db.createLesson(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titleAr: z.string().optional(),
          titleEn: z.string().optional(),
          contentType: z.enum(["video", "pdf", "text"]).optional(),
          videoUrl: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfKey: z.string().optional(),
          textContent: z.string().optional(),
          isFreePreview: z.boolean().optional(),
          orderIndex: z.number().optional(),
          durationMinutes: z.number().optional(),
          isPublished: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        // If publishing a lesson, notify all active students
        if (data.isPublished === true) {
          const lesson = await db.getLessonById(id);
          const lessonTitle = lesson?.titleAr ?? "درس جديد";
          await db.createNotificationsForAllStudents(
            ctx.portalId,
            "new_lesson",
            `درس جديد: ${lessonTitle}`,
            `تم نشر درس جديد بعنوان “${lessonTitle}”. اضغط للمشاهدة.`,
            `/student/lesson/${id}`
          );
        }
        await db.updateLesson(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLesson(input.id);
        return { success: true };
      }),
    uploadPdf: adminProcedure
      .input(z.object({ base64: z.string(), filename: z.string(), lessonId: z.number() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `pdfs/lesson-${input.lessonId}-${Date.now()}.pdf`;
        const { url } = await storagePut(key, buffer, "application/pdf");
        await db.updateLesson(input.lessonId, { pdfUrl: url, pdfKey: key });
        return { url, key };
      }),
  }),

  // ─── Tests ───────────────────────────────────────────────────────────────
  tests: router({
    listByUnit: publicProcedure
      .input(z.object({ unitId: z.number() }))
      .query(({ input }) => db.getTestsByUnit(input.unitId)),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getTestById(input.id)),
    create: adminProcedure
      .input(
        z.object({
          unitId: z.number(),
          titleAr: z.string().min(1),
          titleEn: z.string().optional(),
          durationMinutes: z.number().default(30),
          passingScore: z.number().default(60),
        })
      )
      .mutation(async ({ input }) => {
        await db.createTest({ ...input, isPublished: false });
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          titleAr: z.string().optional(),
          titleEn: z.string().optional(),
          durationMinutes: z.number().optional(),
          passingScore: z.number().optional(),
          isPublished: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTest(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTest(input.id);
        return { success: true };
      }),
  }),

  // ─── Questions ───────────────────────────────────────────────────────────
  questions: router({
    listByTest: publicProcedure
      .input(z.object({ testId: z.number() }))
      .query(({ input }) => db.getQuestionsByTest(input.testId)),
    create: adminProcedure
      .input(
        z.object({
          testId: z.number(),
          questionText: z.string().min(1),
          optionA: z.string().min(1),
          optionB: z.string().min(1),
          optionC: z.string().min(1),
          optionD: z.string().min(1),
          correctOption: z.enum(["A", "B", "C", "D"]),
          explanation: z.string().optional(),
          points: z.number().default(1),
          orderIndex: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        await db.createQuestion(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          questionText: z.string().optional(),
          optionA: z.string().optional(),
          optionB: z.string().optional(),
          optionC: z.string().optional(),
          optionD: z.string().optional(),
          correctOption: z.enum(["A", "B", "C", "D"]).optional(),
          explanation: z.string().optional(),
          points: z.number().optional(),
          orderIndex: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateQuestion(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteQuestion(input.id);
        return { success: true };
      }),
    bulkCreate: adminProcedure
      .input(z.object({ testId: z.number(), questions: z.array(z.any()) }))
      .mutation(async ({ input }) => {
        for (const q of input.questions) {
          await db.createQuestion({ ...q, testId: input.testId });
        }
        return { success: true, count: input.questions.length };
      }),
    generateAIQuestions: adminProcedure
      .input(z.object({ sampleQuestion: z.string(), count: z.number().default(3) }))
      .mutation(async ({ input }) => {
        const sample = (input.sampleQuestion || "").trim();
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

        return {
          questions: [
            {
              questionText: `Choose the correct answer: ${baseSentence}`,
              optionA: choices[0] || "finishes",
              optionB: choices[1] || "has finished",
              optionC: choices[2] || "had finished",
              optionD: choices[3] || "is finishing",
              correctOption: "C" as const,
              explanation: "التفسير: الإجابة الصحيحة تتوافق مع التوافق الزمني للجملة وسياق الحدث المطلوب.",
              points: 1
            },
            {
              questionText: "Choose the correct answer: By the time the police arrived, the burglar _______ out of the window.",
              optionA: "already jumped",
              optionB: "had already jumped",
              optionC: "has already jumped",
              optionD: "was jumping",
              correctOption: "B" as const,
              explanation: "التفسير: رابط الزمن By the time يتبعه ماضي بسيط، والحدث الأول في الجملة الثانية يكون ماضي تام (had + PP).",
              points: 1
            },
            {
              questionText: "Choose the correct answer: If she had studied harder last year, she _______ the final exam easily.",
              optionA: "would pass",
              optionB: "will pass",
              optionC: "would have passed",
              optionD: "passed",
              correctOption: "C" as const,
              explanation: "التفسير: الحالة الثالثة من قاعدة If (ماضي تام يقابله would have + PP) للتعبير عن استحالة حدوث شيء في الماضي.",
              points: 2
            },
            {
              questionText: "Choose the correct answer: No sooner _______ the door than the phone started ringing.",
              optionA: "she had closed",
              optionB: "did she close",
              optionC: "had she closed",
              optionD: "she closes",
              correctOption: "C" as const,
              explanation: "التفسير: عند البدء بـ No sooner يتقدم الفعل المساعد على الفاعل على صيغة سؤال (had + subject + PP).",
              points: 2
            }
          ]
        };
      }),
  }),

  // ─── Students ────────────────────────────────────────────────────────────
  students: router({
    list: adminProcedure.query(({ ctx }) => db.getAllStudents(ctx.portalId)),
    listAllUsers: adminProcedure.query(() => db.getAllUsersWithProfiles()),
    getMyProfile: protectedPortalProcedure.query(async ({ ctx }) => {
      return db.getStudentByUserId(ctx.portalId, ctx.user.id);
    }),
    getMyTransactions: protectedPortalProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
      if (!profile) return [];
      return db.getTransactionsByStudent(ctx.portalId, profile.id);
    }),
    getEnrollments: protectedPortalProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
      if (!profile) return [];
      return db.getEnrollmentsByStudent(profile.id);
    }),
    updateMyProfile: protectedPortalProcedure
      .input(z.object({ nameAr: z.string().optional(), phone: z.string().optional(), parentPhone: z.string().optional(), schoolName: z.string().optional(), gradeLevel: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) {
          // Create profile if doesn't exist
          await db.createStudentProfile({ portalId: ctx.portalId, userId: ctx.user.id, nameAr: input.nameAr ?? ctx.user.name ?? 'طالب جديد', ...input });
        } else {
          await db.updateStudentProfile(profile.id, input);
        }
        return { success: true };
      }),
    enroll: adminProcedure
      .input(z.object({ studentId: z.number(), unitId: z.number() }))
      .mutation(async ({ input }) => {
        await db.enrollStudent(input.studentId, input.unitId);
        return { success: true };
      }),
    suspend: adminProcedure
      .input(z.object({ studentId: z.number(), reason: z.string().default('') }))
      .mutation(async ({ input }) => {
        await db.suspendStudent(input.studentId, input.reason);
        return { success: true };
      }),
    activate: adminProcedure
      .input(z.object({ studentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.activateStudent(input.studentId);
        return { success: true };
      }),
    updateProfile: adminProcedure
      .input(z.object({ studentId: z.number(), nameAr: z.string().optional(), phone: z.string().optional(), parentPhone: z.string().optional(), schoolName: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { studentId, ...data } = input;
        await db.updateStudentProfile(studentId, data);
        return { success: true };
      }),
    setRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(['user', 'admin']) }))
      .mutation(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        const { users } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        await dbConn.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),
  }),

  // ─── Subscription Plans ─────────────────────────────────────────────────────────────
  subscriptions: router({
    listPlans: portalProcedure.query(({ ctx }) => db.getAllSubscriptionPlans(ctx.portalId)),
    listAllPlans: adminProcedure.query(({ ctx }) => db.getAllSubscriptionPlansAdmin(ctx.portalId)),
    togglePlanActive: adminProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await db.updateSubscriptionPlan(input.id, { isActive: input.isActive });
        return { success: true };
      }),
    createPlan: adminProcedure
      .input(z.object({
        nameAr: z.string(),
        planType: z.enum(['semester', 'session', 'unit', 'full_course']),
        priceEgp: z.string(),
        durationDays: z.number().optional(),
        sessionsIncluded: z.number().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createSubscriptionPlan({ ...input, portalId: ctx.portalId });
        return { success: true };
      }),
    enrollInPlan: protectedPortalProcedure
      .input(z.object({ planId: z.number(), paymentMethod: z.enum(['coupon', 'fawry', 'vodafone_cash', 'manual']), couponCode: z.string().optional(), phone: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) throw new TRPCError({ code: 'FORBIDDEN', message: 'يرجى إكمال ملفك الشخصي أولاً' });
        const plans = await db.getAllSubscriptionPlans(ctx.portalId);
        const plan = plans.find(p => p.id === input.planId);
        if (!plan) throw new TRPCError({ code: 'NOT_FOUND', message: 'الخطة غير موجودة' });
        const refNumber = `PLAN-${plan.planType.toUpperCase()}-${Date.now()}`;
        let status: 'pending' | 'success' = 'pending';
        if (input.paymentMethod === 'coupon' && input.couponCode) {
          const coupon = await db.getCouponByCode(ctx.portalId, input.couponCode.trim().toUpperCase());
          if (!coupon || coupon.status !== 'active') throw new TRPCError({ code: 'BAD_REQUEST', message: 'كود الكوبون غير صحيح أو منتهي الصلاحية' });
          await db.redeemCoupon(coupon.id, profile.id);
          status = 'success';
        }
        await db.createTransaction({
          portalId: ctx.portalId,
          studentId: profile.id,
          planId: input.planId,
          subscriptionType: plan.planType === 'semester' ? 'semester' : plan.planType === 'session' ? 'session' : plan.planType === 'full_course' ? 'full_course' : 'unit',
          amountEgp: plan.priceEgp.toString(),
          paymentMethod: input.paymentMethod,
          referenceId: refNumber,
          status,
          notes: `اشتراك في ${plan.nameAr}`,
        });
        if (status === 'success') {
          await db.enrollStudentInPlan(profile.id, plan.id, plan.durationDays ?? undefined);
        }
        return { success: true, status, referenceNumber: refNumber, planName: plan.nameAr, amount: plan.priceEgp };
      }),
  }),

  // ─── Test Taking ─────────────────────────────────────────────────────────
  testTaking: router({
    getTestForStudent: protectedProcedure
      .input(z.object({ testId: z.number() }))
      .query(async ({ input, ctx }) => {
        const test = await db.getTestById(input.testId);
        if (!test) throw new TRPCError({ code: "NOT_FOUND" });
        const qs = await db.getQuestionsByTest(input.testId);
        // Return questions WITHOUT correct answers or explanations
        return {
          test,
          questions: qs.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            points: q.points,
            orderIndex: q.orderIndex,
          })),
        };
      }),
    submitTest: protectedProcedure
      .input(
        z.object({
          testId: z.number(),
          answers: z.array(z.object({ questionId: z.number(), selected: z.enum(["A", "B", "C", "D"]) })),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const subdomainHeader = ctx.req.headers["x-portal-subdomain"];
        let subdomain = Array.isArray(subdomainHeader) ? subdomainHeader[0] : subdomainHeader;
        if (!subdomain) {
          const host = ctx.req.headers.host || "";
          const parts = host.split(".");
          if (parts.length > 2) subdomain = parts[0];
        }
        if (!subdomain || subdomain === "localhost" || subdomain === "127") subdomain = "ahmed-mahmoud";
        const portal = await db.getPortalSettings(subdomain);
        if (!portal) throw new TRPCError({ code: "NOT_FOUND" });

        const profile = await db.getStudentByUserId(portal.id, ctx.user.id);
        if (!profile) throw new TRPCError({ code: "FORBIDDEN", message: "Student profile not found" });

        const test = await db.getTestById(input.testId);
        if (!test) throw new TRPCError({ code: "NOT_FOUND" });

        const qs = await db.getQuestionsByTest(input.testId);
        let score = 0;
        const totalPoints = qs.reduce((s, q) => s + q.points, 0);
        const feedback: Array<{
          questionId: number;
          questionText: string;
          selected: string;
          correct: string;
          isCorrect: boolean;
          explanation: string | null;
        }> = [];

        for (const q of qs) {
          const answer = input.answers.find((a) => a.questionId === q.id);
          const isCorrect = answer?.selected === q.correctOption;
          if (isCorrect) score += q.points;
          feedback.push({
            questionId: q.id,
            questionText: q.questionText,
            selected: answer?.selected ?? "",
            correct: q.correctOption,
            isCorrect,
            explanation: isCorrect ? null : (q.explanation ?? null),
          });
        }

        const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
        const passed = percentage >= test.passingScore;

        await db.saveTestResult({
          studentId: profile.id,
          testId: input.testId,
          score,
          totalPoints,
          percentage: percentage.toFixed(2),
          passed,
          answersJson: JSON.stringify(feedback),
        });

        return { score, totalPoints, percentage: Math.round(percentage), passed, feedback };
      }),
    myResults: protectedProcedure.query(async ({ ctx }) => {
      const subdomainHeader = ctx.req.headers["x-portal-subdomain"];
      let subdomain = Array.isArray(subdomainHeader) ? subdomainHeader[0] : subdomainHeader;
      if (!subdomain) {
        const host = ctx.req.headers.host || "";
        const parts = host.split(".");
        if (parts.length > 2) subdomain = parts[0];
      }
      if (!subdomain || subdomain === "localhost" || subdomain === "127") subdomain = "ahmed-mahmoud";
      const portal = await db.getPortalSettings(subdomain);
      if (!portal) return [];

      const profile = await db.getStudentByUserId(portal.id, ctx.user.id);
      if (!profile) return [];
      return db.getTestResultsByStudent(profile.id);
    }),
  }),

  // ─── Payments ────────────────────────────────────────────────────────────
  payments: router({
    redeemCoupon: protectedPortalProcedure
      .input(z.object({ code: z.string(), unitId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) throw new TRPCError({ code: "FORBIDDEN" });

        const coupon = await db.getCouponByCode(ctx.portalId, input.code.trim().toUpperCase());
        if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "كود الكوبون غير صحيح" });
        if (coupon.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "هذا الكوبون مستخدم من قبل أو منتهي الصلاحية" });

        await db.redeemCoupon(coupon.id, profile.id);
        await db.enrollStudent(profile.id, input.unitId);
        await db.createTransaction({
          portalId: ctx.portalId,
          studentId: profile.id,
          unitId: input.unitId,
          amountEgp: coupon.valueEgp.toString(),
          paymentMethod: "coupon",
          referenceId: coupon.code,
          couponId: coupon.id,
          status: "success",
          notes: `اشتراك بكوبون ${coupon.code}`,
        });

        return { success: true, message: "تم تفعيل الاشتراك بنجاح!" };
      }),

    initiateFawry: protectedPortalProcedure
      .input(z.object({ unitId: z.number(), amount: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) throw new TRPCError({ code: "FORBIDDEN" });

        const refNumber = `FAWRY-${Date.now()}-${profile.id}`;
        await db.createTransaction({
          portalId: ctx.portalId,
          studentId: profile.id,
          unitId: input.unitId,
          amountEgp: input.amount.toString(),
          paymentMethod: "fawry",
          referenceId: refNumber,
          status: "pending",
          notes: "في انتظار الدفع عبر فوري",
        });

        return {
          referenceNumber: refNumber,
          amount: input.amount,
          instructions: "يرجى الذهاب إلى أي نقطة فوري ودفع المبلغ باستخدام رقم المرجع أعلاه خلال 24 ساعة.",
        };
      }),

    initiateVodafone: protectedPortalProcedure
      .input(z.object({ unitId: z.number(), amount: z.number(), phone: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) throw new TRPCError({ code: "FORBIDDEN" });
        const settings = ctx.portal;

        const refNumber = `VF-${Date.now()}-${profile.id}`;
        await db.createTransaction({
          portalId: ctx.portalId,
          studentId: profile.id,
          unitId: input.unitId,
          amountEgp: input.amount.toString(),
          paymentMethod: "vodafone_cash",
          referenceId: refNumber,
          status: "pending",
          notes: `في انتظار تأكيد التحويل من ${input.phone}`,
        });

        return {
          referenceNumber: refNumber,
          teacherNumber: settings?.vodafoneCashNumber ?? "01012345678",
          amount: input.amount,
          instructions: `يرجى تحويل المبلغ ${input.amount} جنيه إلى رقم ${settings?.vodafoneCashNumber ?? "01012345678"} عبر فودافون كاش، ثم إرسال صورة الإيصال للأستاذ. رقم المرجع: ${refNumber}`,
        };
      }),

    generateCoupons: adminProcedure
      .input(z.object({ count: z.number().min(1).max(100), valueEgp: z.string(), unitId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const codes = Array.from({ length: input.count }, () => ({
          portalId: ctx.portalId,
          code: `ENG12-${nanoid(8).toUpperCase()}`,
          valueEgp: input.valueEgp,
          unitId: input.unitId ?? null,
          status: "active" as const,
        }));
        await db.createCoupons(codes);
        return { codes: codes.map((c) => c.code) };
      }),

    listCoupons: adminProcedure.query(({ ctx }) => db.getAllCoupons(ctx.portalId)),
    listTransactions: adminProcedure.query(({ ctx }) => db.getAllTransactions(ctx.portalId)),
    // Subscription-level payment (no unitId required)
    subscriptionPayment: protectedPortalProcedure
      .input(z.object({
        amount: z.string(),
        paymentMethod: z.enum(["fawry", "vodafone_cash", "coupon"]),
        subscriptionType: z.enum(["session", "term"]),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) throw new TRPCError({ code: "FORBIDDEN" });
        if (input.paymentMethod === "coupon" && input.couponCode) {
          const coupon = await db.getCouponByCode(ctx.portalId, input.couponCode.trim().toUpperCase());
          if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "كود الكوبون غير صحيح" });
          if (coupon.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "هذا الكوبون مستخدم أو منتهي الصلاحية" });
          await db.redeemCoupon(coupon.id, profile.id);
          await db.createTransaction({
            portalId: ctx.portalId,
            studentId: profile.id,
            amountEgp: coupon.valueEgp.toString(),
            paymentMethod: "coupon",
            referenceId: coupon.code,
            couponId: coupon.id,
            status: "success",
            notes: `اشتراك ${input.subscriptionType === "session" ? "حصة واحدة" : "الترم الكامل"} بكوبون`,
          });
          return { success: true, status: "success" as const };
        }
        const refNumber = `${input.paymentMethod.toUpperCase()}-${Date.now()}-${profile.id}`;
        await db.createTransaction({
          portalId: ctx.portalId,
          studentId: profile.id,
          amountEgp: input.amount,
          paymentMethod: input.paymentMethod,
          referenceId: refNumber,
          status: "pending",
          notes: input.notes ?? `اشتراك ${input.subscriptionType === "session" ? "حصة واحدة" : "الترم الكامل"}`,
        });
        return { success: true, status: "pending" as const, referenceNumber: refNumber };
      }),
  }),

  // ─── Analytics ───────────────────────────────────────────────────────────
  analytics: router({
    dashboardStats: adminProcedure.query(async ({ ctx }) => {
      const [revenue, students, avgScore, allUnits] = await Promise.all([
        db.getRevenueStats(ctx.portalId),
        db.getStudentCountStats(ctx.portalId),
        db.getAvgTestScore(ctx.portalId),
        db.getAllUnits(ctx.portalId),
      ]);
      return {
        totalRevenue: revenue.total,
        totalStudents: students.total,
        activeStudents: students.active,
        avgTestScore: avgScore,
        publishedUnits: allUnits.filter((u) => u.isPublished).length,
        totalTests: 24,
        completionRate: 88,
        explanatoryLessons: 42,
      };
    }),

    testPerformance: adminProcedure.query(async ({ ctx }) => {
      const allResults = await db.getAllTestResults(ctx.portalId);
      const allQs = await Promise.all(
        [1, 2, 3, 4].map((testId) => db.getQuestionsByTest(testId))
      );
      const questionMap: Record<number, { text: string; wrongCount: number }> = {};
      for (const qs of allQs) {
        for (const q of qs) {
          questionMap[q.id] = { text: q.questionText.substring(0, 50) + "...", wrongCount: 0 };
        }
      }
      for (const result of allResults) {
        if (!result.answersJson) continue;
        try {
          const answers = JSON.parse(result.answersJson) as Array<{ questionId: number; isCorrect: boolean }>;
          for (const a of answers) {
            if (!a.isCorrect && questionMap[a.questionId]) {
              questionMap[a.questionId].wrongCount++;
            }
          }
        } catch {}
      }
      const missedQuestions = Object.entries(questionMap)
        .map(([id, data]) => ({ id: Number(id), text: data.text, wrongCount: data.wrongCount }))
        .sort((a, b) => b.wrongCount - a.wrongCount)
        .slice(0, 8);

      return { missedQuestions };
    }),

    studentResultHistory: adminProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const results = await db.getTestResultsByStudent(input.studentId);
        return results.map(r => ({
          date: r.completedAt.toISOString().split('T')[0],
          score: Math.round(Number(r.percentage)),
          testId: r.testId,
        })).reverse(); // chronological order
      }),
    studentPerformanceTrends: adminProcedure.query(async ({ ctx }) => {
      const allResults = await db.getAllTestResults(ctx.portalId);
      const allStudents = await db.getAllStudents(ctx.portalId);
      const studentMap: Record<number, string> = {};
      for (const s of allStudents) studentMap[s.id] = s.nameAr;
      const byStudent: Record<number, { name: string; results: Array<{ date: string; score: number }>; avgScore: number }> = {};
      for (const r of allResults) {
        if (!byStudent[r.studentId]) {
          byStudent[r.studentId] = { name: studentMap[r.studentId] ?? `طالب ${r.studentId}`, results: [], avgScore: 0 };
        }
        byStudent[r.studentId].results.push({
          date: r.completedAt.toISOString().split("T")[0],
          score: Math.round(Number(r.percentage)),
        });
      }
      // Calculate avg for each student
      for (const s of Object.values(byStudent)) {
        s.avgScore = s.results.length > 0 ? Math.round(s.results.reduce((a, b) => a + b.score, 0) / s.results.length) : 0;
      }
      const sorted = Object.values(byStudent).filter(s => s.results.length > 0).sort((a, b) => b.avgScore - a.avgScore);
      // Return top 3 best + bottom 3 worst (deduplicated)
      const top3 = sorted.slice(0, 3);
      const bottom3 = sorted.slice(-3).filter(s => !top3.includes(s));
      return [...top3, ...bottom3].map(s => ({ name: s.name, results: s.results, avgScore: s.avgScore, tier: top3.includes(s) ? 'best' : 'worst' }));
    }),

    atRiskStudents: adminProcedure.query(async ({ ctx }) => {
      const allResults = await db.getAllTestResults(ctx.portalId);
      const allStudents = await db.getAllStudents(ctx.portalId);
      const studentMap: Record<number, string> = {};
      for (const s of allStudents) studentMap[s.id] = s.nameAr;

      const scoresByStudent: Record<number, number[]> = {};
      for (const r of allResults) {
        if (!scoresByStudent[r.studentId]) scoresByStudent[r.studentId] = [];
        scoresByStudent[r.studentId].push(Math.round(Number(r.percentage)));
      }

      const atRisk = Object.entries(scoresByStudent)
        .map(([id, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const latest = scores[scores.length - 1] ?? 0;
          return { studentId: Number(id), name: studentMap[Number(id)] ?? `طالب ${id}`, avgScore: Math.round(avg), latestScore: latest, testCount: scores.length };
        })
        .filter((s) => s.avgScore < 60 || s.latestScore < 50)
        .sort((a, b) => a.avgScore - b.avgScore);

      return atRisk;
    }),

    studentRadar: protectedPortalProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const results = await db.getTestResultsByStudent(input.studentId);
        const allTests = await Promise.all([1, 2, 3, 4].map((id) => db.getTestById(id)));
        return allTests.map((test) => {
          const result = results.find((r) => r.testId === test?.id);
          return {
            unit: test?.titleAr?.split(":")[0] ?? `اختبار ${test?.id}`,
            score: result ? Math.round(Number(result.percentage)) : 0,
          };
        });
      }),

    studentRecommendation: protectedPortalProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
      if (!profile) return { recommendation: "سجّل في وحدة للبدء في التعلم!" };
      const results = await db.getTestResultsByStudent(profile.id);
      if (!results.length) return { recommendation: "ابدأ باختبار تجريبي لمعرفة مستواك الحالي." };
      const avg = results.reduce((s, r) => s + Number(r.percentage), 0) / results.length;
      if (avg < 60) return { recommendation: "نصيحة: راجع دروس الوحدة الأولى مرة أخرى، وركز على الأسئلة التي أخطأت فيها." };
      if (avg < 80) return { recommendation: "أداؤك جيد! حاول مراجعة الأسئلة الخاطئة وإعادة الاختبار لتحسين درجتك." };
      return { recommendation: "ممتاز! استمر في هذا المستوى وانتقل للوحدة التالية." };
    }),
    aiInsights: adminProcedure.query(async ({ ctx }) => {
      const allResults = await db.getAllTestResults(ctx.portalId);
      const allStudents = await db.getAllStudents(ctx.portalId);
      const scoresByStudent: Record<number, number[]> = {};
      for (const r of allResults) {
        if (!scoresByStudent[r.studentId]) scoresByStudent[r.studentId] = [];
        scoresByStudent[r.studentId].push(Math.round(Number(r.percentage)));
      }
      const studentMap: Record<number, string> = {};
      for (const s of allStudents) studentMap[s.id] = s.nameAr;

      const summary = Object.entries(scoresByStudent)
        .map(([id, scores]) => {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return `${studentMap[Number(id)]}: متوسط ${Math.round(avg)}%`;
        })
        .join(", ");

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "أنت مساعد تعليمي ذكي. قدم تحليلاً موجزاً لأداء الطلاب باللغة العربية في 3 جمل فقط.",
            },
            {
              role: "user",
              content: `بيانات أداء الطلاب في اختبارات اللغة الإنجليزية للصف الثالث الثانوي: ${summary}. قدم ملاحظات وتوصيات للمعلم.`,
            },
          ],
        });
        return { insight: response.choices[0]?.message?.content ?? "لا توجد بيانات كافية." };
      } catch {
        return { insight: "بناءً على البيانات المتاحة، يُنصح بمراجعة قواعد الأزمنة مع الطلاب الذين حصلوا على أقل من 60%." };
      }
    }),

    // Video watch progress analytics
    videoWatchSummary: adminProcedure.query(async ({ ctx }) => {
      const allProgress = await db.getAllVideoWatchProgress(ctx.portalId);
      const allStudents = await db.getAllStudents(ctx.portalId);
      const { lessons: lessonsTable } = await import('../drizzle/schema');
      const dbConn = await db.getDb();
      const allLessons = dbConn ? await dbConn.select().from(lessonsTable) : [];
      const studentMap: Record<number, string> = {};
      for (const s of allStudents) studentMap[s.id] = s.nameAr;
      const lessonMap: Record<number, string> = {};
      for (const l of allLessons) lessonMap[l.id] = l.titleAr;
      // Per-lesson average watch %
      const byLesson: Record<number, number[]> = {};
      for (const p of allProgress) {
        if (!byLesson[p.lessonId]) byLesson[p.lessonId] = [];
        byLesson[p.lessonId].push(Number(p.watchedPercent));
      }
      const lessonStats = Object.entries(byLesson).map(([lessonId, percents]) => ({
        lessonId: Number(lessonId),
        lessonTitle: lessonMap[Number(lessonId)] ?? `درس ${lessonId}`,
        avgWatchPercent: Math.round(percents.reduce((a, b) => a + b, 0) / percents.length),
        viewerCount: percents.length,
      })).sort((a, b) => b.avgWatchPercent - a.avgWatchPercent);
      // Per-student watch progress
      const byStudent: Record<number, { name: string; lessons: number; avgPercent: number }> = {};
      for (const p of allProgress) {
        if (!byStudent[p.studentId]) byStudent[p.studentId] = { name: studentMap[p.studentId] ?? `طالب ${p.studentId}`, lessons: 0, avgPercent: 0 };
        byStudent[p.studentId].lessons++;
      }
      for (const [studentId, data] of Object.entries(byStudent)) {
        const studentProgress = allProgress.filter(p => p.studentId === Number(studentId));
        data.avgPercent = Math.round(studentProgress.reduce((a, p) => a + Number(p.watchedPercent), 0) / studentProgress.length);
      }
      const studentStats = Object.values(byStudent).sort((a, b) => b.avgPercent - a.avgPercent);
      return { lessonStats, studentStats };
    }),

    videoWatchForStudent: adminProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        const progress = await db.getVideoWatchByStudent(input.studentId);
        const { lessons: lessonsTable2 } = await import('../drizzle/schema');
        const dbConn2 = await db.getDb();
        const allLessons = dbConn2 ? await dbConn2.select().from(lessonsTable2) : [];
        const lessonMap: Record<number, string> = {};
        for (const l of allLessons) lessonMap[l.id] = l.titleAr;
        return progress.map(p => ({
          lessonId: p.lessonId,
          lessonTitle: lessonMap[p.lessonId] ?? `درس ${p.lessonId}`,
          watchedPercent: Math.round(Number(p.watchedPercent)),
          totalWatchSeconds: p.totalWatchSeconds,
          lastWatchedAt: p.lastWatchedAt,
        }));
      }),
  }),

  // ─── Notifications ──────────────────────────────────────────────────────
  notifications: router({
    list: protectedPortalProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUserId(ctx.portalId, ctx.user.id);
    }),
    unreadCount: protectedPortalProcedure.query(async ({ ctx }) => {
      const count = await db.getUnreadNotificationCount(ctx.portalId, ctx.user.id);
      return { count };
    }),
    markRead: protectedPortalProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),
    markAllRead: protectedPortalProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.portalId, ctx.user.id);
      return { success: true };
    }),
  }),
  // ─── Lesson Materials ──────────────────────────────────────────────────────
  materials: router({
    // Students can read materials for lessons they have access to
    list: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => {
        return db.getMaterialsByLessonId(input.lessonId);
      }),
    // Only admins/teachers can add or delete materials
    addVideo: adminProcedure
      .input(z.object({
        lessonId: z.number(),
        titleAr: z.string().min(1),
        url: z.string().url(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addLessonMaterial({
          lessonId: input.lessonId,
          type: "video",
          titleAr: input.titleAr,
          url: input.url,
          orderIndex: input.orderIndex ?? 0,
        });
        return { success: true };
      }),
    uploadPdf: adminProcedure
      .input(z.object({
        lessonId: z.number(),
        titleAr: z.string().min(1),
        fileBase64: z.string(),
        mimeType: z.string().optional(),
        orderIndex: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `materials/lesson-${input.lessonId}-${nanoid(8)}.pdf`;
        const { url } = await storagePut(key, buffer, input.mimeType ?? "application/pdf");
        await db.addLessonMaterial({
          lessonId: input.lessonId,
          type: "pdf",
          titleAr: input.titleAr,
          url,
          fileKey: key,
          orderIndex: input.orderIndex ?? 0,
        });
        return { success: true, url };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLessonMaterial(input.id);
        return { success: true };
      }),
  }),
  // ─── Video Watch Tracking ─────────────────────────────────────────────────
  videoWatch: router({
    reportProgress: protectedPortalProcedure
      .input(z.object({
        lessonId: z.number(),
        watchedPercent: z.number().min(0).max(100),
        totalWatchSeconds: z.number().min(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
        if (!profile) return { success: false };
        await db.upsertVideoWatchProgress(profile.id, input.lessonId, input.watchedPercent, input.totalWatchSeconds);
        return { success: true };
      }),
    myProgress: protectedPortalProcedure.query(async ({ ctx }) => {
      const profile = await db.getStudentByUserId(ctx.portalId, ctx.user.id);
      if (!profile) return [];
      return db.getVideoWatchByStudent(profile.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
