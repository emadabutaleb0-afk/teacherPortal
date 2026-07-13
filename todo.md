# Educational Portal - Todo

## Phase 1: Database Schema & Seed Data
- [x] Design full schema: portal_settings, users, students, units, lessons, tests, questions, test_results, enrollments, coupons, transactions
- [x] Run all migrations
- [x] Seed portal_settings: teacher=أستاذ أحمد محمود, subject=English, grade=الصف الثالث الثانوي
- [x] Seed admin user (teacher) and 8 Arabic-named students
- [x] Seed 4 units of Grade 12 English curriculum (AR+EN titles)
- [x] Seed lessons under each unit (video + PDF types)
- [x] Seed tests with MCQ questions and explanations per unit
- [x] Seed sample test results for students
- [x] Seed sample transactions (coupon, Fawry, Vodafone Cash)
- [x] Seed coupon codes

## Phase 2: Global Layout & Auth
- [x] RTL Arabic CSS, Cairo/Tajawal font from Google Fonts
- [x] Professional color theme (deep blue + gold accent)
- [x] TeacherLayout with RTL sidebar
- [x] StudentLayout with RTL top nav
- [x] Role-based routing (admin → /teacher/*, user → /student/*)
- [x] Manus OAuth login page

## Phase 3: Teacher Dashboard
- [x] Stats cards: active students, total revenue, avg score, published units
- [x] Recent payments feed
- [x] AI insights: at-risk students list, top missed questions
- [x] Quick action buttons

## Phase 4: Curriculum Builder
- [x] Units list with order drag-and-drop
- [x] Add/edit/delete unit (AR+EN title, description)
- [x] Lessons list per unit
- [x] Add/edit lesson (type: video/PDF, embed URL, S3 PDF upload, free-preview toggle)
- [x] Publish/unpublish unit

## Phase 5: Test Creator
- [x] Tests list per unit
- [x] Create/edit test (title, duration, passing score)
- [x] Question editor (text, 4 options, correct answer, explanation)
- [x] Publish/unpublish test

## Phase 6: Student Management
- [x] Students list with search
- [x] Per-student detail: enrollments, test history, progress
- [x] Manual enrollment by teacher

## Phase 7: Student Learning Portal
- [x] Course home with progress bar
- [x] Unit accordion (locked/unlocked)
- [x] Lesson viewer (embedded video + PDF)
- [x] AI recommendation widget

## Phase 8: Test-Taking Interface
- [x] Test start screen
- [x] Countdown timer
- [x] Question display + answer selection
- [x] Submit + immediate feedback (score, wrong answers, explanations)

## Phase 9: Payment System
- [x] Coupon generation (batch)
- [x] Coupon redemption
- [x] Fawry conceptual flow
- [x] Vodafone Cash conceptual flow
- [x] Transaction log table + CSV export
- [x] Revenue summary cards

## Phase 10: AI Analytics
- [x] Most-missed questions bar chart
- [x] Student performance trend lines
- [x] At-risk prediction widget
- [x] AI insights via LLM

## Phase 11: Portal Settings (White-label)
- [x] Edit teacher name, subject, grade, bio
- [x] Upload portal logo
- [x] Set unit pricing
- [x] Payment method config (Fawry number, Vodafone number)

## Phase 12: Polish & Tests
- [x] Vitest tests for key procedures (auth.logout)
- [x] RTL audit across all pages
- [x] CSS @import ordering fix
- [x] Analytics page Recharts safe rendering
- [x] Checkpoint and delivery

## New Feature Requests (Round 2)
- [x] Fix /student/wallet page (create it)
- [x] Fix /student/profile page (create it)
- [x] Add sign-up / sign-in / registration screens
- [x] Redesign payment model: per-semester and per-session (not per-unit)
- [x] Student performance curves: best/worst students on analytics page
- [x] Per-student performance curve in student search panel
- [x] Teacher user management: add, suspend, activate students
- [x] Enrich frontend: hero visuals, illustrations, animations
- [x] Add StudentLayout with wallet/profile nav links

## Round 3 Features
- [x] Simplify wallet: session (80 EGP) + term (800 EGP) only, pulled from settings
- [x] Add sessionPrice + termPrice to portal_settings schema
- [x] Add liveRoomUrl to portal_settings schema
- [x] Lock white-label fields (teacher name, logo, subject, grade) to super-admin only
- [x] Teacher settings: split editable vs locked sections
- [x] Live lecture: banner with configurable Zoom/Meet/Teams URL shown on teacher dashboard and student home
- [x] Content protection: CSS anti-recording overlay on video player
- [x] Content protection: dynamic watermark with student name on video
- [x] Content protection: disable right-click on lesson page
- [x] Content protection: disable PDF download/print via CSS
- [x] Final checkpoint

## Round 4: Video Watch-Time Tracking
- [x] Add video_watch_progress table to schema
- [x] Run migration and update db helpers
- [x] Add tRPC procedures: reportWatchProgress, getVideoWatchStats
- [x] Enhance student Lesson page: YouTube iframe API tracking
- [x] Add video analytics section to teacher Analytics dashboard
- [x] TypeScript check, tests, checkpoint
- [x] Remove white-label section from teacher Settings page entirely (name, logo, subject, grade hidden from teacher)
- [x] Ensure updateWhiteLabel backend procedure rejects non-owner at API level

## Round 5: Multi-Grade Curriculum + Video Tracking
- [x] Add gradeLevel column to units table (migration)
- [x] Update units CRUD: grade selector on create/edit
- [x] Curriculum builder: grade filter tabs (all grades shown)
- [x] Student portal: show only units matching student's grade
- [x] Student profile: grade selection field
- [x] Video watch tracking: YouTube iframe API in Lesson page
- [x] Video watch analytics in teacher dashboard
- [x] Remove white-label section from teacher Settings entirely
- [x] Seed additional units for Grade 10 and Grade 11 as demo data
- [x] TypeScript check, tests, checkpoint

## Round 6: In-App Notification System
- [x] Add notifications table to schema (userId, type, title, body, isRead, link, createdAt)
- [x] Run migration
- [x] Add db helpers: createNotification, getNotificationsByUser, markNotificationRead, markAllRead
- [x] Add tRPC procedures: notifications.list, notifications.markRead, notifications.markAllRead
- [x] Add internal helper: notifyEnrolledStudents(type, title, body, link)
- [x] Wire lesson publish → auto-notify enrolled students
- [x] Wire live lecture toggle ON → auto-notify enrolled students
- [x] Build NotificationBell component (bell icon + unread badge + popover dropdown)
- [x] Add NotificationBell to StudentLayout header
- [x] Add NotificationBell to TeacherLayout sidebar header
- [x] Auto-refresh notifications every 30 seconds (polling)
- [x] TypeScript check, tests, checkpoint

## Round 7: Curriculum Builder Redesign + Materials Panel
- [x] Add lesson_materials table (lessonId, type: video|pdf, title, url, fileKey, orderIndex)
- [x] Run migration and add db helpers: addMaterial, getMaterialsByLesson, deleteMaterial
- [x] Add tRPC procedures: materials.add, materials.list, materials.delete, materials.uploadPdf
- [x] Unit form: replace title inputs with number dropdown (Unit 1-20) + single Arabic title field
- [x] Lesson form: replace title inputs with number dropdown (Lesson 1-30) + single Arabic title field
- [x] Remove content type selector from lesson form (materials panel handles it)
- [x] Add Materials panel inside expanded lesson row (collapsible)
- [x] Materials panel: list existing materials (video links + PDFs) with delete button
- [x] Materials panel: Add Video URL form (title + URL input)
- [x] Materials panel: Upload PDF form (file picker → S3 upload)
- [x] TypeScript check, tests, checkpoint

## Round 8: Live Lecture Pass Unit Type
- [x] Add isLivePass boolean column to units table, run migration
- [x] Seed a sample "حصص مباشرة - الصف الثالث الثانوي" Live Pass unit (price: 200 EGP)
- [x] Add isLivePass to units tRPC create/update/list procedures
- [x] Build student /student/live/:unitId page (live room join button, countdown, enrolled-only gate)
- [x] Update student unit card on Home to link to /student/live/:id for Live Pass units
- [x] Update teacher curriculum UI: unit form has "Live Pass" toggle; Live Pass units show live room URL field instead of lessons
- [x] TypeScript check, tests, checkpoint
