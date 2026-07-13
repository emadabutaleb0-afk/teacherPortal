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
