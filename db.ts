import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertNotification,
  coupons,
  enrollments,
  lessonMaterials,
  lessons,
  notifications,
  portalSettings,
  questions,
  studentProfiles,
  subscriptionPlans,
  testResults,
  tests,
  transactions,
  units,
  users,
  videoWatchProgress,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Portal Settings ──────────────────────────────────────────────────────────
export async function getPortalSettings(subdomain: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(portalSettings).where(eq(portalSettings.subdomain, subdomain)).limit(1);
  return result[0] ?? null;
}

export async function updatePortalSettings(portalId: number, data: Partial<typeof portalSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(portalSettings).set(data).where(eq(portalSettings.id, portalId));
}

// ─── Units ────────────────────────────────────────────────────────────────────
export async function getAllUnits(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.portalId, portalId)).orderBy(units.orderIndex);
}

export async function getUnitById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createUnit(data: typeof units.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(units).values(data);
  return result[0];
}

export async function updateUnit(id: number, data: Partial<typeof units.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(units).set(data).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(units).where(eq(units.id, id));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
export async function getLessonsByUnit(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.unitId, unitId)).orderBy(lessons.orderIndex);
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createLesson(data: typeof lessons.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(lessons).values(data);
  return result[0];
}

export async function updateLesson(id: number, data: Partial<typeof lessons.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessons).where(eq(lessons.id, id));
}

// ─── Tests ────────────────────────────────────────────────────────────────────
export async function getTestsByUnit(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tests).where(eq(tests.unitId, unitId));
}

export async function getTestById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tests).where(eq(tests.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createTest(data: typeof tests.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tests).values(data);
  return result[0];
}

export async function updateTest(id: number, data: Partial<typeof tests.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tests).set(data).where(eq(tests.id, id));
}

export async function deleteTest(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(tests).where(eq(tests.id, id));
}

// ─── Questions ────────────────────────────────────────────────────────────────
export async function getQuestionsByTest(testId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.testId, testId)).orderBy(questions.orderIndex);
}

export async function createQuestion(data: typeof questions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(questions).values(data);
  return result[0];
}

export async function updateQuestion(id: number, data: Partial<typeof questions.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(questions).set(data).where(eq(questions.id, id));
}

export async function deleteQuestion(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(questions).where(eq(questions.id, id));
}

// ─── Students ─────────────────────────────────────────────────────────────────
export async function getAllStudents(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentProfiles).where(eq(studentProfiles.portalId, portalId)).orderBy(studentProfiles.nameAr);
}

export async function getStudentByUserId(portalId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studentProfiles).where(and(eq(studentProfiles.userId, userId), eq(studentProfiles.portalId, portalId))).limit(1);
  return result[0] ?? null;
}

export async function upsertStudentProfile(portalId: number, userId: number, nameAr: string) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getStudentByUserId(portalId, userId);
  if (existing) return existing;
  await db.insert(studentProfiles).values({ portalId, userId, nameAr });
  return getStudentByUserId(portalId, userId);
}

// ─── Enrollments ──────────────────────────────────────────────────────────────
export async function getEnrollmentsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

export async function isStudentEnrolled(studentId: number, unitId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.unitId, unitId)))
    .limit(1);
  return result.length > 0;
}

export async function enrollStudent(studentId: number, unitId: number) {
  const db = await getDb();
  if (!db) return;
  const already = await isStudentEnrolled(studentId, unitId);
  if (!already) {
    await db.insert(enrollments).values({ studentId, unitId });
  }
}

// ─── Test Results ─────────────────────────────────────────────────────────────
export async function getTestResultsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testResults).where(eq(testResults.studentId, studentId)).orderBy(desc(testResults.completedAt));
}

export async function getTestResultsByTest(testId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testResults).where(eq(testResults.testId, testId)).orderBy(desc(testResults.completedAt));
}

export async function getAllTestResults(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: testResults.id,
      studentId: testResults.studentId,
      testId: testResults.testId,
      score: testResults.score,
      totalPoints: testResults.totalPoints,
      percentage: testResults.percentage,
      passed: testResults.passed,
      answersJson: testResults.answersJson,
      completedAt: testResults.completedAt,
    })
    .from(testResults)
    .innerJoin(studentProfiles, eq(testResults.studentId, studentProfiles.id))
    .where(eq(studentProfiles.portalId, portalId))
    .orderBy(desc(testResults.completedAt));
}

export async function saveTestResult(data: typeof testResults.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(testResults).values(data);
  return result[0];
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export async function getAllCoupons(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).where(eq(coupons.portalId, portalId)).orderBy(desc(coupons.createdAt));
}

export async function getCouponByCode(portalId: number, code: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(coupons).where(and(eq(coupons.code, code), eq(coupons.portalId, portalId))).limit(1);
  return result[0] ?? null;
}

export async function createCoupons(codes: Array<typeof coupons.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(coupons).values(codes);
}

export async function redeemCoupon(couponId: number, studentId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(coupons)
    .set({ status: "redeemed", redeemedByStudentId: studentId, redeemedAt: new Date() })
    .where(eq(coupons.id, couponId));
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getAllTransactions(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.portalId, portalId)).orderBy(desc(transactions.createdAt));
}

export async function getTransactionsByStudent(portalId: number, studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(and(eq(transactions.studentId, studentId), eq(transactions.portalId, portalId))).orderBy(desc(transactions.createdAt));
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(transactions).values(data);
  return result[0];
}

export async function updateTransactionStatus(id: number, status: "pending" | "success" | "failed") {
  const db = await getDb();
  if (!db) return;
  await db.update(transactions).set({ status }).where(eq(transactions.id, id));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getRevenueStats(portalId: number) {
  const db = await getDb();
  if (!db) return { total: 0 };
  const totalResult = await db
    .select({ total: sql<number>`SUM(amountEgp)` })
    .from(transactions)
    .where(and(eq(transactions.status, "success"), eq(transactions.portalId, portalId)));
  const total = Number(totalResult[0]?.total ?? 0);
  return { total };
}

export async function getStudentCountStats(portalId: number) {
  const db = await getDb();
  if (!db) return { total: 0, active: 0 };
  const totalResult = await db.select({ count: sql<number>`COUNT(*)` }).from(studentProfiles).where(eq(studentProfiles.portalId, portalId));
  const activeResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(studentProfiles)
    .where(and(eq(studentProfiles.isActive, true), eq(studentProfiles.portalId, portalId)));
  return {
    total: Number(totalResult[0]?.count ?? 0),
    active: Number(activeResult[0]?.count ?? 0),
  };
}

export async function getAvgTestScore(portalId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ avg: sql<number>`AVG(percentage)` })
    .from(testResults)
    .innerJoin(studentProfiles, eq(testResults.studentId, studentProfiles.id))
    .where(eq(studentProfiles.portalId, portalId));
  return Math.round(Number(result[0]?.avg ?? 0));
}

// ─── Subscription Plans ──────────────────────────────────────────────────────────────
export async function getAllSubscriptionPlans(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(and(eq(subscriptionPlans.isActive, true), eq(subscriptionPlans.portalId, portalId)));
}

export async function getAllSubscriptionPlansAdmin(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.portalId, portalId));
}

export async function createSubscriptionPlan(data: typeof subscriptionPlans.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(subscriptionPlans).values(data);
  return result[0];
}

export async function updateSubscriptionPlan(id: number, data: Partial<typeof subscriptionPlans.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id));
}

// ─── Student Management ─────────────────────────────────────────────────────────────
export async function suspendStudent(studentId: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(studentProfiles).set({ isActive: false, suspendedAt: new Date(), suspendReason: reason }).where(eq(studentProfiles.id, studentId));
}

export async function activateStudent(studentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(studentProfiles).set({ isActive: true, suspendedAt: null, suspendReason: null }).where(eq(studentProfiles.id, studentId));
}

export async function updateStudentProfile(studentId: number, data: Partial<typeof studentProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(studentProfiles).set(data).where(eq(studentProfiles.id, studentId));
}

export async function createStudentProfile(data: typeof studentProfiles.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(studentProfiles).values(data);
  return getStudentByUserId(data.portalId!, data.userId);
}

export async function getAllUsersWithProfiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Subscription Enrollments ─────────────────────────────────────────────────────────
export async function enrollStudentInPlan(studentId: number, planId: number, durationDays?: number) {
  const db = await getDb();
  if (!db) return;
  const expiresAt = durationDays ? new Date(Date.now() + durationDays * 86400000) : undefined;
  await db.insert(enrollments).values({ studentId, planId, subscriptionType: 'semester', expiresAt });
}

export async function hasActiveSemesterEnrollment(studentId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.subscriptionType, 'semester')))
    .limit(1);
  return result.length > 0;
}

// ─── Grade-Filtered Units ────────────────────────────────────────────────────────────────────
export async function getUnitsByGrade(portalId: number, gradeLevel: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(and(eq(units.portalId, portalId), eq(units.gradeLevel, gradeLevel))).orderBy(units.orderIndex);
}

export async function getDistinctGradeLevels(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ gradeLevel: units.gradeLevel }).from(units).where(eq(units.portalId, portalId)).orderBy(units.gradeLevel);
  return result.map(r => r.gradeLevel);
}

// ─── Video Watch Progress ─────────────────────────────────────────────────────────────────────────────
export async function upsertVideoWatchProgress(studentId: number, lessonId: number, watchedPercent: number, totalWatchSeconds: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(videoWatchProgress)
    .where(and(eq(videoWatchProgress.studentId, studentId), eq(videoWatchProgress.lessonId, lessonId)))
    .limit(1);
  if (existing.length > 0) {
    // Only update if new progress is higher
    const currentPercent = Number(existing[0].watchedPercent);
    if (watchedPercent > currentPercent) {
      await db.update(videoWatchProgress)
        .set({ watchedPercent: String(watchedPercent), totalWatchSeconds, lastWatchedAt: new Date() })
        .where(and(eq(videoWatchProgress.studentId, studentId), eq(videoWatchProgress.lessonId, lessonId)));
    }
  } else {
    await db.insert(videoWatchProgress).values({ studentId, lessonId, watchedPercent: String(watchedPercent), totalWatchSeconds });
  }
}

export async function getVideoWatchByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoWatchProgress).where(eq(videoWatchProgress.studentId, studentId));
}

export async function getVideoWatchByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoWatchProgress).where(eq(videoWatchProgress.lessonId, lessonId));
}

export async function getAllVideoWatchProgress(portalId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: videoWatchProgress.id,
      studentId: videoWatchProgress.studentId,
      lessonId: videoWatchProgress.lessonId,
      watchedPercent: videoWatchProgress.watchedPercent,
      totalWatchSeconds: videoWatchProgress.totalWatchSeconds,
      lastWatchedAt: videoWatchProgress.lastWatchedAt,
      createdAt: videoWatchProgress.createdAt,
    })
    .from(videoWatchProgress)
    .innerJoin(studentProfiles, eq(videoWatchProgress.studentId, studentProfiles.id))
    .where(eq(studentProfiles.portalId, portalId))
    .orderBy(desc(videoWatchProgress.lastWatchedAt));
}

// ─── Notifications ───────────────────────────────────────────────────────────────────────────────
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function createNotificationsForAllStudents(
  portalId: number,
  type: InsertNotification["type"],
  titleAr: string,
  bodyAr: string,
  link?: string
) {
  const db = await getDb();
  if (!db) return;
  // Get all active student user IDs
  const studentUsers = await db
    .select({ userId: studentProfiles.userId })
    .from(studentProfiles)
    .where(and(eq(studentProfiles.isActive, true), eq(studentProfiles.portalId, portalId)));
  if (studentUsers.length === 0) return;
  const rows: InsertNotification[] = studentUsers.map((s) => ({
    portalId,
    userId: s.userId,
    type,
    titleAr,
    bodyAr,
    link: link ?? null,
  }));
  await db.insert(notifications).values(rows);
}

export async function getNotificationsByUserId(portalId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.portalId, portalId)))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(portalId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false), eq(notifications.portalId, portalId)));
}

export async function getUnreadNotificationCount(portalId: number, userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false), eq(notifications.portalId, portalId)));
  return Number(result[0]?.count ?? 0);
}

// ─── Lesson Materials ─────────────────────────────────────────────────────────
export async function getMaterialsByLessonId(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lessonMaterials)
    .where(eq(lessonMaterials.lessonId, lessonId))
    .orderBy(lessonMaterials.orderIndex, lessonMaterials.createdAt);
}

export async function addLessonMaterial(data: typeof lessonMaterials.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(lessonMaterials).values(data);
}

export async function deleteLessonMaterial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessonMaterials).where(eq(lessonMaterials.id, id));
}

export async function getLessonMaterialById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(lessonMaterials).where(eq(lessonMaterials.id, id)).limit(1);
  return rows[0] ?? null;
}
