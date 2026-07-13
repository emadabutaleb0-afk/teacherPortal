# Teacher Manual — Egyptian English Learning Portal
**Version 1.0 · June 2026**

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Logging In](#2-logging-in)
3. [Dashboard (لوحة القيادة)](#3-dashboard)
4. [Curriculum Builder (المنهج الدراسي)](#4-curriculum-builder)
5. [Tests (الاختبارات)](#5-tests)
6. [Student Management (الطلاب)](#6-student-management)
7. [Payments & Subscriptions (المدفوعات)](#7-payments--subscriptions)
8. [Analytics & Reports (التحليلات والتقارير)](#8-analytics--reports)
9. [Settings (الإعدادات)](#9-settings)
10. [In-App Notifications (الإشعارات)](#10-in-app-notifications)
11. [Live Lecture Pass (البث المباشر)](#11-live-lecture-pass)
12. [Content Protection](#12-content-protection)
13. [Quick Reference — Common Tasks](#13-quick-reference)

---

## 1. System Overview

The portal is a fully Arabic, RTL-first learning management system designed specifically for Egyptian secondary-school English teachers. It covers the complete workflow from publishing curriculum content to collecting payments and tracking student performance.

### Feature Summary

| Feature | What It Does |
|---------|-------------|
| **Curriculum Builder** | Create units and lessons per grade, attach video links and PDF files |
| **Test Creator** | Build MCQ tests with explanations, set pass marks and timers |
| **Student Management** | View, add, suspend, and enroll students manually |
| **Payment System** | Accept Fawry, Vodafone Cash, and coupon codes; track all revenue |
| **Analytics** | Charts for performance trends, most-missed questions, at-risk students |
| **AI Insights** | GPT-powered recommendations for the teacher and each student |
| **Live Lecture Pass** | Sell a paid "live pass" unit; students join your Zoom/Meet session |
| **Notifications** | Auto-alert enrolled students when a lesson is published or live starts |
| **Content Protection** | Anti-recording overlay, student watermark, right-click disabled |
| **Settings** | Customize portal identity, prices, payment numbers, welcome message |

---

## 2. Logging In

The portal uses **Manus OAuth** — there are no separate usernames or passwords to remember.

**Steps:**
1. Navigate to the portal URL (e.g. `https://engportal-vasxkdjs.manus.space`)
2. Click **"تسجيل الدخول"** on the sign-in page
3. You are redirected to the Manus login page — sign in with your Manus account
4. On first login the system recognises you as the **admin (teacher)** automatically because your Manus account is the portal owner
5. You land on the Teacher Dashboard at `/teacher`

> **Note:** Students log in the same way. The system assigns the `admin` role to the portal owner and the `user` role to everyone else. To promote a student to admin, use the Database panel → `users` table → change their `role` to `admin`.

---

## 3. Dashboard

**Path:** `/teacher`

The dashboard gives you a real-time snapshot of the portal.

### Stats Cards (top row)

| Card | Meaning |
|------|---------|
| **الطلاب النشطون** | Number of students who have at least one active enrollment |
| **إجمالي الإيرادات** | Sum of all successful payment transactions in EGP |
| **متوسط الدرجات** | Average test score across all students and all tests |
| **الوحدات المنشورة** | Number of units currently visible to students |

### Recent Payments Feed
Shows the last 5 transactions with student name, unit, amount, and payment method.

### AI Insights Panel
Powered by GPT. Click **"تحديث التوصيات"** to generate:
- A list of **at-risk students** (low scores or no activity)
- The **most commonly missed questions** across all tests
- A narrative summary with actionable suggestions

### Quick Actions
Buttons that jump directly to: Add Unit, Add Test, View Students, Go to Settings.

### Live Lecture Banner
If the live room is enabled in Settings, a red banner appears at the top of the dashboard with the meeting link. Click it to join your own session for a quick check.

---

## 4. Curriculum Builder

**Path:** `/teacher/curriculum`

This is where you build and organise all learning content.

### 4.1 Understanding the Structure

```
Grade Level (e.g. الصف الثالث الثانوي)
  └── Unit 1: داخل عالم الرعاية
        ├── Lesson 1: القراءة — يومي في حياة ممرضة
        │     ├── Video material (YouTube link)
        │     └── PDF material (uploaded file)
        ├── Lesson 2: المفردات
        └── ...
```

### 4.2 Grade Filter Tabs
At the top of the page, tabs show all grade levels that have units. Click a tab to filter the list. The **"الكل"** tab shows all grades at once.

### 4.3 Creating a Unit

1. Click **"+ إضافة وحدة جديدة"** (top-right button)
2. Fill in the form:

| Field | Description |
|-------|-------------|
| **الصف الدراسي** | Select the grade from the dropdown (e.g. الصف الثالث الثانوي) |
| **رقم الوحدة** | Select the unit number (1–20) from the dropdown |
| **عنوان الوحدة بالعربية** | Type the Arabic title (e.g. داخل عالم الرعاية) |
| **وصف الوحدة** | Optional short description shown to students |
| **السعر (جنيه)** | Price students pay to enroll in this unit |
| **باقة حصص مباشرة** | Toggle ON if this unit is a Live Lecture Pass (no lessons — students go directly to the live room) |
| **نشر للطلاب فور الحفظ** | Toggle ON to make the unit immediately visible to students |

3. Click **"إنشاء الوحدة"**

> **Tip:** Leave "نشر" OFF while you are still adding lessons. Publish only when the unit is ready.

### 4.4 Editing or Deleting a Unit

- Click the **pencil icon** (✏️) on any unit row to open the edit form
- Click the **red trash icon** (🗑️) to delete — this also deletes all lessons inside
- The **published/draft badge** on each row shows the current visibility status

### 4.5 Expanding a Unit to See Its Lessons

Click anywhere on a unit row (or the chevron ▼) to expand the lessons panel below it.

### 4.6 Creating a Lesson

1. Expand the target unit
2. Click **"+ درس جديد"**
3. Fill in the lesson form:

| Field | Description |
|-------|-------------|
| **رقم الدرس** | Select the lesson number (1–30) from the dropdown |
| **عنوان الدرس بالعربية** | Type the Arabic lesson title |
| **رابط الفيديو الرئيسي** | Optional: paste a YouTube embed URL (e.g. `https://www.youtube.com/embed/XXXX`) |
| **المدة (دقيقة)** | Estimated lesson duration in minutes |
| **معاينة مجانية** | Toggle ON to let students preview this lesson without paying |

4. Click **"إنشاء الدرس"**

### 4.7 Adding Materials to a Lesson (Videos & PDFs)

Each lesson has a dedicated **Materials Panel** for attaching multiple resources.

1. Expand the unit → find the lesson row
2. Click the **"المواد"** button (paperclip icon) on the lesson row
3. The Materials Panel expands inline below the lesson

**To add a video link:**
1. Type the video title in Arabic in the first field
2. Paste the YouTube embed URL in the second field
3. Click the **+** button

**To upload a PDF:**
1. Type the PDF title in Arabic
2. Click the file picker and select a `.pdf` file from your computer
3. The file uploads automatically to secure cloud storage (S3)
4. A confirmation toast appears when done

**To delete a material:**
- Click the red trash icon next to any material in the list

> **Note:** Materials are visible to enrolled students at the bottom of each lesson page.

### 4.8 Publishing a Unit

Toggle **"نشر للطلاب"** ON in the unit edit form, or use the published/draft badge on the unit row. When a unit is published, enrolled students receive an automatic in-app notification.

---

## 5. Tests

**Path:** `/teacher/tests`

### 5.1 Selecting a Unit

Use the **"اختر الوحدة"** dropdown at the top to load the tests for that unit.

### 5.2 Creating a Test

1. Select a unit from the dropdown
2. Click **"+ اختبار جديد"**
3. Fill in:

| Field | Description |
|-------|-------------|
| **عنوان الاختبار** | Test name shown to students |
| **المدة (دقيقة)** | Time limit; the student sees a countdown timer |
| **درجة النجاح (%)** | Minimum percentage to pass (e.g. 60) |
| **نشر الاختبار** | Toggle ON to make it visible to enrolled students |

4. Click **"إنشاء الاختبار"**

### 5.3 Adding Questions

1. Click the **"الأسئلة"** button on any test card to open the question editor
2. Click **"+ سؤال جديد"**
3. Fill in:

| Field | Description |
|-------|-------------|
| **نص السؤال** | The question text (supports Arabic and English) |
| **الخيار أ / ب / ج / د** | The four answer options |
| **الإجابة الصحيحة** | Select which option (أ, ب, ج, or د) is correct |
| **الشرح** | Optional explanation shown to students after they answer |

4. Click **"حفظ السؤال"**
5. Repeat for all questions

### 5.4 Editing or Deleting Questions

- Click the **pencil icon** on any question to edit it
- Click the **trash icon** to delete it permanently

### 5.5 Publishing a Test

Toggle **"نشر الاختبار"** ON in the test edit form. Only enrolled students can see and take published tests.

### 5.6 Viewing Results

Student results are visible in the **Analytics** page and in each student's profile in the **Students** page.

---

## 6. Student Management

**Path:** `/teacher/students`

### 6.1 Overview Cards

| Card | Meaning |
|------|---------|
| **إجمالي الطلاب** | Total registered student accounts |
| **نشطون** | Students with `active` status |
| **موقوفون** | Students with `suspended` status |

### 6.2 Searching for a Student

Type a name, school name, or phone number in the search box. The list filters in real time.

### 6.3 Adding a Student Manually

1. Click **"+ إضافة طالب"**
2. Fill in:
   - Arabic name, phone number, school name, grade level
3. Click **"إضافة الطالب"**

> The student will need to log in via Manus OAuth to access their account. The profile you create here is linked to their account on first login.

### 6.4 Viewing a Student's Profile

Click on any student row in the list. The right panel shows:
- **Personal info:** name, phone, school, grade
- **Enrollments:** which units they are subscribed to
- **Test history:** all test attempts with scores, pass/fail, and date
- **Performance chart:** score trend over time

### 6.5 Enrolling a Student Manually

1. Open the student's profile (click their row)
2. Click **"تسجيل في وحدة"**
3. Select the unit from the dropdown
4. Click **"تأكيد التسجيل"**

This is useful when a student pays cash in person and you need to grant access immediately.

### 6.6 Suspending or Activating a Student

On any student row:
- Click the **red suspend icon** (🚫) to suspend — the student loses access to all content
- Click the **green activate icon** (✅) to restore access

---

## 7. Payments & Subscriptions

**Path:** `/teacher/payments`

### 7.1 Overview Cards

| Card | Meaning |
|------|---------|
| **إجمالي الإيرادات** | Total revenue from all successful transactions |
| **كوبونات نشطة** | Number of unused coupon codes currently available |
| **معاملات معلقة** | Transactions awaiting manual confirmation |
| **باقات متاحة** | Number of active subscription plans |

### 7.2 Transactions Tab

Shows a full log of every payment with:
- Student name, unit/plan, amount, payment method, reference number, date, status

**To export:** Click **"تصدير CSV"** to download the full transaction log as a spreadsheet.

### 7.3 Subscription Plans Tab

Shows the current session price (حصة واحدة) and term price (ترم كامل) pulled from Settings. These are the prices students see on their Wallet page.

### 7.4 Coupons Tab

**To generate coupon codes:**
1. Click **"+ باقة جديدة"**
2. Enter:
   - Number of codes to generate (e.g. 10)
   - Discount type: percentage or fixed amount
   - Discount value
   - Expiry date (optional)
   - Which unit the coupon applies to (or "all units")
3. Click **"توليد الكوبونات"**

The system generates unique codes (e.g. `G12-UNIT2-7H8`). Share these with students who pay in person. Students enter the code on their Wallet page to unlock the unit.

**To view existing coupons:** Click the **"كوبونات"** tab on the Payments page to see all codes with their status (used / unused / expired).

### 7.5 Payment Methods

Students can pay via:

| Method | How It Works |
|--------|-------------|
| **Fawry** | Student pays at any Fawry outlet using your merchant code (set in Settings) |
| **Vodafone Cash** | Student transfers to your Vodafone Cash number (set in Settings) |
| **Coupon Code** | Student enters a code you gave them |
| **Manual** | You enroll the student directly from the Students page (zero-cost transaction) |

---

## 8. Analytics & Reports

**Path:** `/teacher/analytics`

### 8.1 Performance Overview

- **متوسط الدرجات** — overall average score across all students
- **معدل النجاح** — percentage of test attempts that passed
- **أعلى درجة** — highest individual score recorded

### 8.2 Most-Missed Questions Chart

A horizontal bar chart showing the questions that the highest percentage of students answered incorrectly. Use this to identify topics that need more classroom attention.

### 8.3 Student Performance Trends

A line chart showing average scores over time. Useful for tracking whether the class is improving after each unit.

### 8.4 Best and Worst Students

Two ranked lists showing:
- Top 5 students by average score
- Bottom 5 students by average score (at-risk candidates)

### 8.5 Per-Student Performance Curve

Click on any student name in the Students page to see their individual score trend chart.

### 8.6 Video Watch Analytics

A section showing:
- Which lessons have the highest watch completion rates
- Which students have not watched any videos

### 8.7 AI Insights

Click **"تحديث التوصيات"** to ask the AI for:
- A narrative summary of class performance
- Specific students who need intervention
- Suggested topics to revisit in the next session

---

## 9. Settings

**Path:** `/teacher/settings`

### 9.1 Portal Identity (White Label)

> This section is restricted to the **portal owner** (super-admin). Regular teachers cannot change these fields.

| Field | Description |
|-------|-------------|
| **اسم المعلم** | Displayed in the sidebar, login page, and student portal |
| **المادة الدراسية** | Subject name (e.g. اللغة الإنجليزية) |
| **الصف الدراسي الافتراضي** | Default grade shown on the login page |

Click **"حفظ هوية المنصة"** to save.

### 9.2 Content & Welcome Message

| Field | Description |
|-------|-------------|
| **رسالة الترحيب** | Shown on the student login page |
| **نبذة عن المعلم** | Short bio shown on the landing page |

### 9.3 Subscription Prices

| Field | Description |
|-------|-------------|
| **سعر الحصة الواحدة (جنيه)** | Price for a single-session subscription |
| **سعر الترم الكامل (جنيه)** | Price for a full-term subscription |

Changes take effect immediately on the student Wallet page.

### 9.4 Payment Methods Configuration

| Field | Description |
|-------|-------------|
| **كود تاجر فوري** | Your Fawry merchant code — students use this at Fawry outlets |
| **رقم فودافون كاش** | Your Vodafone Cash phone number |
| **ملاحظة الدفع** | Custom instructions shown to students on the payment page |

### 9.5 Live Lecture Room (غرفة البث)

| Field | Description |
|-------|-------------|
| **رابط غرفة البث** | Paste your Zoom, Google Meet, or YouTube Live URL |
| **تفعيل البث المباشر** | Toggle ON to start the live session |

**When you toggle ON:**
- A red "🔴 بث مباشر الآن" banner appears on the teacher dashboard and student home page
- All enrolled students receive an instant in-app notification
- Students with a Live Lecture Pass unit see a red "انضم للبث" button on their home page

**When you toggle OFF:**
- The banner disappears
- The live room page shows "لا يوجد بث مباشر الآن"

---

## 10. In-App Notifications

The notification bell (🔔) appears in the top bar of both the teacher and student interfaces.

### How Notifications Work

| Trigger | Who Gets Notified |
|---------|------------------|
| Teacher publishes a unit | All students enrolled in that unit |
| Teacher publishes a lesson | All students enrolled in the parent unit |
| Teacher enables live room | All students with any active enrollment |

### For the Teacher

- The bell shows a red badge with the count of unread notifications
- Click the bell to open the dropdown list
- Each notification shows its type icon, title, and time
- Click **"تعليم الكل كمقروء"** to clear all badges at once

### For Students

Students see the same bell in their top navigation bar. Clicking a notification takes them directly to the relevant lesson or live room page.

> Notifications refresh automatically every 30 seconds — no manual reload needed.

---

## 11. Live Lecture Pass

A **Live Lecture Pass** is a special paid unit that gives enrolled students access to your live sessions instead of recorded lessons.

### Setting Up a Live Lecture Pass Unit

1. Go to **Curriculum** → click **"+ إضافة وحدة جديدة"**
2. Choose the grade, unit number, and write a title (e.g. "حصص مباشرة - الصف الثالث الثانوي")
3. Set the price (e.g. 200 EGP)
4. Toggle **"باقة حصص مباشرة"** ON (the red section)
5. Toggle **"نشر للطلاب"** ON
6. Click **"إنشاء الوحدة"**

The unit appears in the curriculum with a **🔴 بث مباشر** badge. When expanded, it shows a Live Pass info panel instead of a lessons list.

### Starting a Live Session

1. Go to **Settings → غرفة البث**
2. Paste your Zoom / Google Meet / YouTube Live link
3. Toggle **"تفعيل البث المباشر"** ON
4. All enrolled students receive a notification immediately

### Student Experience

- Students who paid for the Live Pass unit see a red **"🔴 انضم للبث"** button on their home page
- Clicking it opens the `/student/live/:id` page
- If the live room is active, a large **"انضم للحصة المباشرة الآن"** button appears
- If the live room is off, the page shows a waiting screen with tips

### Ending a Live Session

Toggle **"تفعيل البث المباشر"** OFF in Settings. The join button disappears for students.

---

## 12. Content Protection

The portal includes built-in protections to prevent unauthorised copying of lesson content.

| Protection | How It Works |
|-----------|-------------|
| **Anti-recording overlay** | A semi-transparent overlay covers the video player, making screen recordings less useful |
| **Student watermark** | The student's name appears as a faint watermark on the video player |
| **Right-click disabled** | Right-clicking on lesson pages is blocked to prevent "Save as" |
| **PDF print/download blocked** | CSS rules prevent students from printing or downloading embedded PDFs |

> These protections reduce casual copying but are not a substitute for legal copyright protection.

---

## 13. Quick Reference — Common Tasks

| Task | Steps |
|------|-------|
| **Publish a new unit** | Curriculum → Add Unit → fill form → toggle "نشر" ON → Save |
| **Add a lesson video** | Curriculum → expand unit → click "المواد" on lesson → paste YouTube URL → click + |
| **Upload a PDF** | Curriculum → expand unit → click "المواد" on lesson → type title → pick file |
| **Create a test** | Tests → select unit → "+ اختبار جديد" → add questions |
| **Generate coupons** | Payments → Coupons tab → "+ باقة جديدة" → set discount → generate |
| **Enroll a student manually** | Students → click student → "تسجيل في وحدة" → select unit → confirm |
| **Suspend a student** | Students → click red suspend icon on student row |
| **Start a live session** | Settings → Live Room → paste URL → toggle ON |
| **View revenue** | Payments → Transactions tab → check إجمالي الإيرادات card |
| **Export payment data** | Payments → "تصدير CSV" button |
| **Check at-risk students** | Analytics → AI Insights → click "تحديث التوصيات" |
| **Change prices** | Settings → أسعار الاشتراك → update values → save |

---

*This manual covers the portal as of version 6f29abd8 (June 2026). For technical support, contact the portal administrator.*
