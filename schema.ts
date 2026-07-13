import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users (Manus OAuth) ─────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Portal Settings (White-label config / Portals) ──────────────────────────
export const portalSettings = mysqlTable("portal_settings", {
  id: int("id").autoincrement().primaryKey(),
  subdomain: varchar("subdomain", { length: 100 }).unique(),
  ownerOpenId: varchar("ownerOpenId", { length: 64 }),
  teacherName: varchar("teacherName", { length: 200 }).notNull().default("أستاذ أحمد محمود"),
  teacherBio: text("teacherBio"),
  subject: varchar("subject", { length: 100 }).notNull().default("اللغة الإنجليزية"),
  gradeLevel: varchar("gradeLevel", { length: 100 }).notNull().default("الصف الثالث الثانوي"),
  logoUrl: text("logoUrl"),
  primaryColor: varchar("primaryColor", { length: 20 }).default("#1e40af"),
  fawryMerchantCode: varchar("fawryMerchantCode", { length: 100 }),
  vodafoneCashNumber: varchar("vodafoneCashNumber", { length: 20 }),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).default("150.00"),
  fullCoursePrice: decimal("fullCoursePrice", { precision: 10, scale: 2 }).default("500.00"),
  semesterPrice: decimal("semesterPrice", { precision: 10, scale: 2 }).default("800.00"),
  sessionPrice: decimal("sessionPrice", { precision: 10, scale: 2 }).default("80.00"),
  termPrice: decimal("termPrice", { precision: 10, scale: 2 }).default("800.00"),
  liveRoomUrl: text("liveRoomUrl"),
  liveRoomEnabled: int("liveRoomEnabled").default(0),
  liveRoomTitle: varchar("liveRoomTitle", { length: 200 }).default("الحصة المباشرة"),
  welcomeMessage: text("welcomeMessage"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortalSettings = typeof portalSettings.$inferSelect;

// ─── Student Profiles ─────────────────────────────────────────────────────────
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  userId: int("userId").notNull(),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  parentPhone: varchar("parentPhone", { length: 20 }),
  schoolName: varchar("schoolName", { length: 200 }),
  gradeLevel: varchar("gradeLevel", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  suspendedAt: timestamp("suspendedAt"),
  suspendReason: text("suspendReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;

// ─── Units ────────────────────────────────────────────────────────────────────
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }).notNull(),
  description: text("description"),
  gradeLevel: varchar("gradeLevel", { length: 100 }).notNull().default("الصف الثالث الثانوي"),
  orderIndex: int("orderIndex").notNull().default(0),
  isPublished: boolean("isPublished").default(false).notNull(),
  isLivePass: boolean("isLivePass").default(false).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("150.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Unit = typeof units.$inferSelect;

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }),
  contentType: mysqlEnum("contentType", ["video", "pdf", "text"]).notNull().default("video"),
  videoUrl: text("videoUrl"),
  pdfUrl: text("pdfUrl"),
  pdfKey: text("pdfKey"),
  textContent: text("textContent"),
  isFreePreview: boolean("isFreePreview").default(false).notNull(),
  orderIndex: int("orderIndex").notNull().default(0),
  durationMinutes: int("durationMinutes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;

// ─── Tests ────────────────────────────────────────────────────────────────────
export const tests = mysqlTable("tests", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  titleEn: varchar("titleEn", { length: 300 }),
  durationMinutes: int("durationMinutes").notNull().default(30),
  passingScore: int("passingScore").notNull().default(50),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Test = typeof tests.$inferSelect;

// ─── Questions ────────────────────────────────────────────────────────────────
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctOption: mysqlEnum("correctOption", ["A", "B", "C", "D"]).notNull(),
  explanation: text("explanation"),
  points: int("points").notNull().default(1),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;

// ─── Test Results ─────────────────────────────────────────────────────────────
export const testResults = mysqlTable("test_results", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  testId: int("testId").notNull(),
  score: int("score").notNull().default(0),
  totalPoints: int("totalPoints").notNull().default(0),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull().default("0.00"),
  passed: boolean("passed").default(false).notNull(),
  answersJson: text("answersJson"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
});

export type TestResult = typeof testResults.$inferSelect;

// ─── Subscription Plans ───────────────────────────────────────────────────────
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  nameAr: varchar("nameAr", { length: 200 }).notNull(),
  planType: mysqlEnum("planType", ["semester", "session", "unit", "full_course"]).notNull(),
  priceEgp: decimal("priceEgp", { precision: 10, scale: 2 }).notNull(),
  durationDays: int("durationDays"),
  sessionsIncluded: int("sessionsIncluded"),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ─── Enrollments ──────────────────────────────────────────────────────────────
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  unitId: int("unitId"),
  planId: int("planId"),
  subscriptionType: mysqlEnum("subscriptionType", ["unit", "semester", "session", "full_course"]).default("unit").notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Enrollment = typeof enrollments.$inferSelect;

// ─── Coupons ──────────────────────────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  code: varchar("code", { length: 50 }).notNull().unique(),
  valueEgp: decimal("valueEgp", { precision: 10, scale: 2 }).notNull(),
  planType: mysqlEnum("planType", ["semester", "session", "unit", "full_course", "any"]).default("any").notNull(),
  unitId: int("unitId"),
  status: mysqlEnum("status", ["active", "redeemed", "expired"]).default("active").notNull(),
  redeemedByStudentId: int("redeemedByStudentId"),
  redeemedAt: timestamp("redeemedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  studentId: int("studentId").notNull(),
  unitId: int("unitId"),
  planId: int("planId"),
  subscriptionType: mysqlEnum("subscriptionType", ["unit", "semester", "session", "full_course"]).default("unit").notNull(),
  amountEgp: decimal("amountEgp", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["coupon", "fawry", "vodafone_cash", "manual"]).notNull(),
  referenceId: varchar("referenceId", { length: 200 }),
  couponId: int("couponId"),
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;

// ─── Video Watch Progress ─────────────────────────────────────────────────────────────────────────────
export const videoWatchProgress = mysqlTable("video_watch_progress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  lessonId: int("lessonId").notNull(),
  watchedPercent: decimal("watchedPercent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  totalWatchSeconds: int("totalWatchSeconds").notNull().default(0),
  lastWatchedAt: timestamp("lastWatchedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoWatchProgress = typeof videoWatchProgress.$inferSelect;

// ─── In-App Notifications ─────────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  portalId: int("portalId"),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["new_lesson", "live_lecture", "test_published", "general"]).notNull().default("general"),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  bodyAr: text("bodyAr"),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Lesson Materials ─────────────────────────────────────────────────────────
export const lessonMaterials = mysqlTable("lesson_materials", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  type: mysqlEnum("type", ["video", "pdf"]).notNull(),
  titleAr: varchar("titleAr", { length: 300 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LessonMaterial = typeof lessonMaterials.$inferSelect;
export type InsertLessonMaterial = typeof lessonMaterials.$inferInsert;
