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
