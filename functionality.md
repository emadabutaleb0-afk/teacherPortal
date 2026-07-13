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
