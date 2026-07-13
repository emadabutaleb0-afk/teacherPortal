# Data Structure Recommendations

Here are the recommended data structures in JSON format for the educational portal. These schemas cover the core entities: Users (Teacher/Student), Curriculum (Units/Lessons), Content (Documents/Videos), Assessments (Tests/Questions/Results), and Financials (Payments/Coupons).

```json
{
  "users": {
    "type": "collection",
    "description": "Stores both teacher and student profiles",
    "schema": {
      "id": "uuid",
      "role": "enum(TEACHER, STUDENT)",
      "full_name_ar": "string",
      "email": "string",
      "password_hash": "string",
      "phone_number": "string",
      "created_at": "timestamp",
      "last_login": "timestamp",
      "status": "enum(ACTIVE, INACTIVE)"
    },
    "initial_data": [
      {
        "id": "t-1",
        "role": "TEACHER",
        "full_name_ar": "أستاذ أحمد محمود",
        "email": "ahmed.mahmoud@example.com",
        "phone_number": "01000000001",
        "status": "ACTIVE"
      },
      {
        "id": "s-1",
        "role": "STUDENT",
        "full_name_ar": "يوسف مصطفى",
        "email": "youssef.m@example.com",
        "phone_number": "01100000002",
        "status": "ACTIVE"
      },
      {
        "id": "s-2",
        "role": "STUDENT",
        "full_name_ar": "مريم حسن",
        "email": "mariam.h@example.com",
        "phone_number": "01200000003",
        "status": "ACTIVE"
      }
    ]
  },
  
  "curriculum_units": {
    "type": "collection",
    "description": "Top-level organization of the curriculum",
    "schema": {
      "id": "uuid",
      "title_en": "string",
      "title_ar": "string",
      "description": "string",
      "grade_level": "string",
      "subject": "string",
      "order": "integer",
      "is_published": "boolean"
    },
    "initial_data": [
      {
        "id": "u-1",
        "title_en": "Unit 1: Read All About It!",
        "title_ar": "الوحدة الأولى: اقرأ كل شيء عن ذلك!",
        "description": "Vocabulary and grammar focusing on past tenses and news reporting.",
        "grade_level": "Grade 12",
        "subject": "English",
        "order": 1,
        "is_published": true
      },
      {
        "id": "u-2",
        "title_en": "Unit 2: Her Story",
        "title_ar": "الوحدة الثانية: قصتها",
        "description": "Focus on women's achievements, comparative adjectives, and past perfect.",
        "grade_level": "Grade 12",
        "subject": "English",
        "order": 2,
        "is_published": true
      }
    ]
  },
  
  "lessons": {
    "type": "collection",
    "description": "Individual lessons within a unit",
    "schema": {
      "id": "uuid",
      "unit_id": "uuid (ref: curriculum_units)",
      "title_en": "string",
      "title_ar": "string",
      "order": "integer",
      "content_type": "enum(VIDEO, PDF, TEXT)",
      "content_url": "string",
      "is_free_preview": "boolean"
    },
    "initial_data": [
      {
        "id": "l-1",
        "unit_id": "u-1",
        "title_en": "Vocabulary: News Media",
        "title_ar": "المفردات: وسائل الإعلام",
        "order": 1,
        "content_type": "VIDEO",
        "content_url": "https://youtube.com/embed/example1",
        "is_free_preview": true
      },
      {
        "id": "l-2",
        "unit_id": "u-1",
        "title_en": "Grammar: Past Simple vs Past Continuous",
        "title_ar": "القواعد: الماضي البسيط مقابل الماضي المستمر",
        "order": 2,
        "content_type": "PDF",
        "content_url": "https://storage.example.com/pdfs/grammar_u1.pdf",
        "is_free_preview": false
      }
    ]
  },
  
  "tests": {
    "type": "collection",
    "description": "Assessments linked to units or lessons",
    "schema": {
      "id": "uuid",
      "unit_id": "uuid (ref: curriculum_units)",
      "lesson_id": "uuid (ref: lessons, optional)",
      "title_en": "string",
      "title_ar": "string",
      "duration_minutes": "integer",
      "passing_score": "integer",
      "is_published": "boolean"
    },
    "initial_data": [
      {
        "id": "test-1",
        "unit_id": "u-1",
        "title_en": "Unit 1 Quiz",
        "title_ar": "اختبار الوحدة الأولى",
        "duration_minutes": 30,
        "passing_score": 50,
        "is_published": true
      }
    ]
  },
  
  "questions": {
    "type": "collection",
    "description": "Multiple choice questions for tests",
    "schema": {
      "id": "uuid",
      "test_id": "uuid (ref: tests)",
      "question_text": "string",
      "options": "array of objects {id, text}",
      "correct_option_id": "string",
      "explanation_text": "string",
      "points": "integer"
    },
    "initial_data": [
      {
        "id": "q-1",
        "test_id": "test-1",
        "question_text": "While I ______ home, I saw an accident.",
        "options": [
          {"id": "opt-a", "text": "walked"},
          {"id": "opt-b", "text": "was walking"},
          {"id": "opt-c", "text": "had walked"},
          {"id": "opt-d", "text": "am walking"}
        ],
        "correct_option_id": "opt-b",
        "explanation_text": "We use the past continuous (was walking) for a longer background action that was interrupted by a shorter action in the past simple (saw).",
        "points": 1
      }
    ]
  },
  
  "test_results": {
    "type": "collection",
    "description": "Student attempts and scores",
    "schema": {
      "id": "uuid",
      "student_id": "uuid (ref: users)",
      "test_id": "uuid (ref: tests)",
      "score": "integer",
      "total_points": "integer",
      "answers": "array of objects {question_id, selected_option_id, is_correct}",
      "completed_at": "timestamp"
    },
    "initial_data": [
      {
        "id": "tr-1",
        "student_id": "s-1",
        "test_id": "test-1",
        "score": 1,
        "total_points": 1,
        "answers": [
          {
            "question_id": "q-1",
            "selected_option_id": "opt-b",
            "is_correct": true
          }
        ],
        "completed_at": "2026-06-24T10:00:00Z"
      }
    ]
  },
  
  "coupons": {
    "type": "collection",
    "description": "Pre-paid codes generated by teacher",
    "schema": {
      "id": "uuid",
      "code": "string",
      "value_egp": "number",
      "status": "enum(ACTIVE, REDEEMED)",
      "redeemed_by_student_id": "uuid (ref: users, optional)",
      "redeemed_at": "timestamp",
      "created_at": "timestamp"
    },
    "initial_data": [
      {
        "id": "coup-1",
        "code": "ENG12-XYZ987",
        "value_egp": 150.00,
        "status": "ACTIVE",
        "created_at": "2026-06-20T00:00:00Z"
      }
    ]
  },
  
  "transactions": {
    "type": "collection",
    "description": "Financial records for access purchases",
    "schema": {
      "id": "uuid",
      "student_id": "uuid (ref: users)",
      "amount_egp": "number",
      "payment_method": "enum(FAWRY, VODAFONE_CASH, COUPON)",
      "reference_id": "string",
      "status": "enum(PENDING, SUCCESS, FAILED)",
      "item_type": "enum(UNIT, FULL_COURSE)",
      "item_id": "uuid",
      "created_at": "timestamp"
    },
    "initial_data": [
      {
        "id": "txn-1",
        "student_id": "s-1",
        "amount_egp": 150.00,
        "payment_method": "VODAFONE_CASH",
        "reference_id": "VF-987654321",
        "status": "SUCCESS",
        "item_type": "UNIT",
        "item_id": "u-1",
        "created_at": "2026-06-21T14:30:00Z"
      }
    ]
  }
}
```
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
# Step-by-Step Functionality Breakdown

This section details the logical flow and system actions for the core features of the educational portal.

## 1. Content Management (Uploading & Curriculum Creation)

The teacher manages the curriculum through a structured hierarchy: Units contain Lessons and Tests.

1.  **Unit Creation:** The teacher initiates the process by creating a Unit, specifying the title (e.g., "Unit 1: Read All About It!"), description, and grade level. The system generates a unique Unit ID and saves the metadata to the database.
2.  **Lesson Addition:** Within a Unit, the teacher adds lessons. For each lesson, they select the content type (Video or PDF).
3.  **Media Handling:** 
    *   **PDFs:** The teacher uploads a PDF file. The front-end sends the file to the backend, which stores it in cloud storage (e.g., AWS S3 or Supabase Storage) and saves the returned URL in the lesson record.
    *   **Videos:** Instead of hosting heavy video files, the teacher provides a YouTube or Vimeo embed URL. The system validates the URL format and saves it.
4.  **Publishing:** Once a unit is complete, the teacher toggles the "Published" status, making it visible to students on the platform.

## 2. Test Creation and Management

The assessment engine allows the teacher to evaluate student comprehension.

1.  **Test Initialization:** The teacher creates a new test, linking it to a specific Unit. They define parameters such as the duration in minutes and the minimum passing score.
2.  **Question Authoring:** The teacher adds questions to the test. For each question, they input the question text and four possible options.
3.  **Answer Key & Feedback:** Crucially, the teacher selects the correct option and provides a detailed explanation for why the other options are incorrect or why the correct one is right. This explanation is saved alongside the question data.
4.  **Test Activation:** The test is saved and becomes available to students who have unlocked the corresponding unit.

## 3. Student Testing and Immediate Feedback

The student experience focuses on assessment and immediate learning correction.

1.  **Test Execution:** A student initiates a test. The system fetches the questions (without the correct answers or explanations) and starts a countdown timer on the client side.
2.  **Submission:** The student selects their answers and submits the test. The payload containing the student's choices is sent to the backend.
3.  **Grading:** The backend compares the student's choices against the correct answers stored in the database. It calculates the total score and identifies incorrect answers.
4.  **Feedback Delivery:** The backend responds with the final score and a detailed breakdown. For every incorrect answer, the system displays the teacher's pre-written explanation, providing immediate, contextual feedback to the student. The result is permanently logged in the student's profile.

## 4. Payment Processing and Access Control

The portal monetizes content through a multi-channel payment approach, tailored for the Egyptian market.

### Flow A: Coupon Codes (Offline to Online)
1.  **Generation:** The teacher generates a batch of unique, random alphanumeric coupon codes (e.g., 50 codes worth 150 EGP each) via the admin dashboard. These are saved in the database with an "ACTIVE" status.
2.  **Distribution:** The teacher prints these codes and sells them physically to students (e.g., in a classroom or tutoring center).
3.  **Redemption:** The student enters the code on the portal. The system verifies the code's existence and "ACTIVE" status.
4.  **Access Granted:** Upon successful verification, the system marks the coupon as "REDEEMED", links it to the student's ID, and unlocks the requested unit.

### Flow B: Conceptual Fawry Integration
1.  **Initiation:** The student selects Fawry as the payment method for a unit.
2.  **API Call:** The backend calls the FawryPay API, passing the item details, amount, and a unique merchant reference ID.
3.  **Reference Number:** Fawry returns a unique Payment Reference Number. The portal displays this number to the student with instructions to pay at any Fawry POS machine within a specified timeframe (e.g., 24 hours). The transaction is logged as "PENDING".
4.  **Webhook/Callback:** Once the student pays at the POS, Fawry sends a server-to-server webhook notification to the portal's backend.
5.  **Fulfillment:** The backend receives the webhook, verifies the signature, updates the transaction status to "SUCCESS", and unlocks the unit for the student.

### Flow C: Conceptual Vodafone Cash Integration
1.  **Initiation:** The student selects Vodafone Cash.
2.  **API Call:** The backend calls the payment gateway API (e.g., Paymob or a direct Vodafone Cash API if available to the merchant) to initiate a wallet transaction.
3.  **OTP/PIN Prompt:** The API triggers a push notification or SMS to the student's Vodafone number, requesting them to enter their wallet PIN to authorize the deduction.
4.  **Confirmation:** Upon successful PIN entry by the user, the gateway sends a success callback to the portal's backend.
5.  **Fulfillment:** The backend updates the transaction to "SUCCESS" and grants access to the unit. *(Note: If direct API is unavailable, a manual fallback involves the student transferring funds to the teacher's number and uploading a screenshot for manual approval by the teacher).*
# Deno Implementation Strategy

Given the requirement to use Deno (`run_javascript`), the backend architecture should focus on modularity, utilizing standard web APIs (which Deno supports natively), and keeping dependencies minimal. We will use standard `Request` and `Response` objects to handle HTTP traffic.

## 1. Architecture Overview

The application will be structured around a central HTTP server that routes requests to specific handler functions based on the URL path and HTTP method. Data persistence will conceptually use a lightweight database accessible via HTTP or a Deno-compatible driver (e.g., Supabase/PostgreSQL via REST, or Deno KV for simpler state).

Key modules:
*   **Router:** Directs traffic to the correct controller.
*   **Controllers:** Handle specific business logic (Auth, Courses, Tests, Payments).
*   **Services:** Interact with external APIs (Fawry, Vodafone Cash).
*   **Database Interface:** Manages data retrieval and storage.

## 2. Core Server Setup

Deno's native HTTP server is highly performant and straightforward to set up.

```javascript
// server.js
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleTestSubmission } from "./controllers/tests.js";
import { handleCouponRedemption } from "./controllers/payments.js";

const PORT = 8000;

const handler = async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Route: Submit Test
    if (path === "/api/tests/submit" && method === "POST") {
      return await handleTestSubmission(req);
    }
    
    // Route: Redeem Coupon
    if (path === "/api/payments/redeem" && method === "POST") {
      return await handleCouponRedemption(req);
    }

    // Default 404
    return new Response(JSON.stringify({ error: "Not Found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

console.log(`Server running on http://localhost:${PORT}`);
serve(handler, { port: PORT });
```

## 3. Test Submission and Feedback Logic

This module handles the grading of student tests and returning the immediate feedback, including the teacher's explanations.

```javascript
// controllers/tests.js

// Mock database function
async function getTestQuestionsFromDB(testId) {
  // In reality, fetch from DB. Returning mock data matching our schema.
  return [
    {
      id: "q-1",
      correct_option_id: "opt-b",
      explanation_text: "We use the past continuous (was walking) for a longer background action.",
      points: 1
    }
  ];
}

export async function handleTestSubmission(req) {
  const body = await req.json();
  const { testId, studentId, answers } = body;
  // answers format: [{ question_id: "q-1", selected_option_id: "opt-a" }]

  const questions = await getTestQuestionsFromDB(testId);
  let totalScore = 0;
  const feedback = [];

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.question_id);
    if (!question) continue;

    const isCorrect = question.correct_option_id === answer.selected_option_id;
    
    if (isCorrect) {
      totalScore += question.points;
      feedback.push({
        question_id: question.id,
        is_correct: true
      });
    } else {
      feedback.push({
        question_id: question.id,
        is_correct: false,
        correct_option_id: question.correct_option_id,
        explanation: question.explanation_text // Immediate feedback provided here
      });
    }
  }

  // TODO: Save result to test_results table in DB

  return new Response(JSON.stringify({
    success: true,
    score: totalScore,
    total_possible: questions.reduce((sum, q) => sum + q.points, 0),
    feedback: feedback
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
```

## 4. Payment Integration Strategy (Coupons & API)

This section demonstrates handling offline coupon redemption and outlines the conceptual approach for API-based payments using Deno's native `fetch`.

```javascript
// controllers/payments.js

// Mock database functions
async function getCouponFromDB(code) {
  if (code === "ENG12-XYZ987") {
    return { id: "coup-1", status: "ACTIVE", value_egp: 150 };
  }
  return null;
}

async function markCouponRedeemedInDB(couponId, studentId) {
  // Update DB logic here
  return true;
}

async function unlockUnitForStudentInDB(studentId, unitId) {
  // Insert into access/transactions table
  return true;
}

export async function handleCouponRedemption(req) {
  const body = await req.json();
  const { code, studentId, unitId } = body;

  const coupon = await getCouponFromDB(code);

  if (!coupon) {
    return new Response(JSON.stringify({ error: "Invalid coupon code" }), { status: 400 });
  }

  if (coupon.status !== "ACTIVE") {
    return new Response(JSON.stringify({ error: "Coupon already redeemed" }), { status: 400 });
  }

  // Transactional operations (should ideally be a DB transaction)
  await markCouponRedeemedInDB(coupon.id, studentId);
  await unlockUnitForStudentInDB(studentId, unitId);

  return new Response(JSON.stringify({ 
    success: true, 
    message: "Unit unlocked successfully",
    value_applied: coupon.value_egp
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

// Conceptual Fawry Integration Wrapper
export async function createFawryCharge(amount, studentInfo, itemId) {
  const FAWRY_API_URL = "https://atfawry.com/ECommerceWeb/Fawry/payments/charge";
  const MERCHANT_CODE = "YOUR_MERCHANT_CODE";
  const SECURE_KEY = "YOUR_SECURE_KEY";
  const refNumber = `REF-${Date.now()}`;

  // Fawry requires a specific signature generation (usually SHA256)
  // const signature = generateFawrySignature(MERCHANT_CODE, refNumber, amount, SECURE_KEY);

  const payload = {
    merchantCode: MERCHANT_CODE,
    merchantRefNum: refNumber,
    customerProfileId: studentInfo.id,
    customerMobile: studentInfo.phone,
    customerEmail: studentInfo.email,
    amount: amount,
    currencyCode: "EGP",
    chargeItems: [{ itemId: itemId, description: "English Unit", price: amount, quantity: 1 }],
    // signature: signature
  };

  try {
    const response = await fetch(FAWRY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    return await response.json();
  } catch (error) {
    console.error("Fawry API Error:", error);
    throw error;
  }
}
```
