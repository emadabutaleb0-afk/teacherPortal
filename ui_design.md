# Conceptual Front-End UI Design

The platform will have two distinct interfaces: one for the Teacher (Admin) and one for the Student. Both interfaces will support Arabic localization (RTL - Right to Left layout) as the primary display, given the target audience.

## 1. Teacher View (Admin Dashboard)

The teacher dashboard focuses on content management, student tracking, and financial oversight.

### 1.1 Sidebar Navigation
- **لوحة القيادة (Dashboard):** Overview of active students, recent payments, and AI insights.
- **المناهج (Curriculum):** Manage units, lessons, PDFs, and videos.
- **الاختبارات (Assessments):** Create and edit multiple-choice tests.
- **الطلاب (Students):** View student list, progress, and AI-predicted performance.
- **الماليات (Financials):** Generate coupons, view Fawry/Vodafone Cash transaction history.
- **الإعدادات (Settings):** Profile and platform settings.

### 1.2 Key Screens

**A. AI Insights Dashboard (لوحة القيادة)**
- **Top Metrics:** Total Revenue, Active Students, Average Test Score.
- **AI Visual Stats:** 
  - A predictive chart showing students at risk of falling behind based on recent test scores.
  - A bar chart highlighting the most frequently missed questions across all students (identifying topics that need re-teaching).
- **Recent Activity:** Feed of latest test completions and payments.

**B. Curriculum Builder (منشئ المنهج)**
- **Unit List:** Drag-and-drop interface to reorder units.
- **Lesson Editor:** 
  - Input fields for Title (AR/EN).
  - Media uploader for PDFs.
  - Text input for YouTube/Vimeo embed URLs.
  - Toggle switch for "Free Preview" (معاينة مجانية).

**C. Test Creator (منشئ الاختبارات)**
- **Question Form:** 
  - Rich text editor for the question.
  - Four input fields for options with radio buttons to select the correct answer.
  - Text area for "Explanation for Incorrect Answer" (شرح الإجابة الخاطئة).
- **Test Settings:** Duration, passing score, and linked unit.

**D. Financials & Coupons (الماليات والكوبونات)**
- **Coupon Generator:** Input for quantity and value, button to "Generate Batch". Displays a printable table of codes.
- **Transaction Table:** Lists Date, Student Name, Amount, Method (Vodafone Cash/Fawry/Coupon), and Status. Exportable to CSV.

---

## 2. Student View (Learning Portal)

The student interface is designed for focus, ease of navigation, and immediate feedback.

### 2.1 Top Navigation
- **Home (الرئيسية):** Course overview and progress.
- **My Wallet (محفظتي):** Recharge balance via Coupon, Fawry, or Vodafone Cash.
- **Profile (الملف الشخصي):** Settings and logout.

### 2.2 Key Screens

**A. Course Home & Progress (الرئيسية)**
- **Hero Section:** "Grade 12 English - 3rd Secondary" with an overall progress bar.
- **AI Recommendation Widget:** "Based on your last test, we recommend reviewing: *Past Continuous Tense*."
- **Unit List:** Accordion style. 
  - Locked units show a "Purchase (شراء)" button.
  - Unlocked units show lessons and tests.

**B. Lesson Viewer (عارض الدروس)**
- **Video Player:** Embedded responsive iframe for video lessons.
- **PDF Viewer:** Embedded PDF reader preventing easy downloads (if required), with full-screen option.
- **Navigation:** "Previous Lesson" and "Next Lesson" buttons.

**C. Testing Interface (واجهة الاختبار)**
- **Active Test:** 
  - Countdown timer at the top.
  - One question displayed at a time, or a clean scrolling list.
  - Clear "Submit" (تسليم) button.
- **Immediate Feedback Modal:**
  - Shows Score (e.g., 8/10).
  - Lists incorrect answers immediately below.
  - **Crucial Feature:** Displays the teacher's explanation for *why* the chosen answer was wrong and what the correct answer is.

**D. Payment & Checkout (الدفع)**
- **Checkout Modal:** Appears when clicking "Purchase" on a unit.
- **Payment Options:**
  1. **Enter Coupon Code:** Text input with "Apply" button.
  2. **Vodafone Cash:** Instructions to transfer to a specific number, input field for the student's phone number, and upload field for receipt screenshot (or automated API flow).
  3. **Fawry:** Generates a Fawry Pay Reference Number for the student to pay at a kiosk.
