# RecoverAI

### AI Revenue Recovery Agent

RecoverAI is an AI-powered revenue recovery system that detects failed payments, analyzes customer and payment history, chooses the safest recovery action, and executes a bounded recovery workflow.

The system is designed around a simple principle:

> AI recommends. Backend authorizes. Backend executes.

---

## Problem

Failed payments create revenue leakage.

A payment may fail because of:

- Insufficient funds
- Bank decline
- Payment timeout
- Unknown payment failure

Manually deciding what to do for every failed payment is slow and inconsistent.

RecoverAI automates this decision process while keeping strict backend controls around the AI.

---

## How It Works

```text
Failed Payment
      ↓
Revenue at Risk Detection
      ↓
Gemini AI Analysis
      ↓
Recovery Decision
      ↓
Policy Engine
      ↓
Recovery Tool
      ↓
Payment Updated
      ↓
Audit Trail
      ↓
Revenue Metrics
AI Recovery Actions

The AI can select exactly one action:

1. Retry Payment

Used when a payment failure appears temporary or the customer has a strong successful payment history.

2. Send Recovery Reminder

Used when the customer may need to take action to complete payment.

3. Request Human Review

Used when the situation is uncertain or risky.

4. Stop Recovery

Used when further automated recovery is not appropriate.

Safety Architecture

Gemini does not directly control the payment system.

The architecture separates reasoning from execution.

                 ┌─────────────────┐
                 │   Failed Payment│
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │   Gemini AI     │
                 │    Reasoning    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │  Policy Engine  │
                 │     Safety      │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Recovery Tools  │
                 │   Execution     │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │   Audit Trail   │
                 └─────────────────┘

This prevents the AI from directly executing an unsafe action.

Recovery Limits

RecoverAI uses bounded recovery rules.

Maximum retries
2 retries
Maximum reminders
3 reminders

Payments that reach these limits cannot continue automated recovery.

High-value or uncertain payments can also be sent for human review.

AI Confidence

Every AI decision includes a confidence score between:

0.00 → 1.00

The dashboard displays the confidence associated with the AI decision.

Risk Level

Every AI decision also contains a risk level:

LOW
MEDIUM
HIGH

Examples:

LOW

Strong customer history + temporary failure + recovery limit available.

MEDIUM

Some uncertainty or limited customer history.

HIGH

Unknown failure, unusual situation, or insufficient history.

Batch Recovery

RecoverAI can process multiple recoverable payments in one batch.

For every payment:

Analyze
   ↓
Decide
   ↓
Validate
   ↓
Execute
   ↓
Record

The batch produces metrics such as:

Revenue at risk
Recoverable revenue
Revenue recovered
Remaining revenue
Recovery rate
Human review count
Stopped recoveries
Failed recoveries
Audit Trail

Every recovery decision is recorded.

The audit trail contains information such as:

Payment ID
Customer ID
Amount
Failure reason
AI decision
AI reasoning
AI confidence
AI risk level
Policy decision
Policy reason
Executed action
Recovery result
Recovered amount
Execution status
Timestamp

This makes the recovery process explainable and traceable.

Evaluation

RecoverAI evaluates the recovery batch using measurable outcomes.

Important metrics include:

Revenue At Risk
Recoverable Revenue
Recovered Revenue
Unrecovered Revenue
Recovery Rate
Risk Recovery Rate
Average AI Confidence
Recovery By Action

The goal is not simply to detect failed payments.

The goal is to demonstrate:

How much revenue was actually recovered.

Technology Stack
Frontend
React
Vite
CSS
Backend
Node.js
Express
AI
Google Gemini API
Data
JSON during prototype stage
Payments
Razorpay Test Mode can be integrated later
Project Structure
recover-ai/
│
├── backend/
│   │
│   ├── data/
│   │   ├── payments.json
│   │   ├── audit.json
│   │   └── recoveryBatch.json
│   │
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── routes/
│   │   │   ├── payments.js
│   │   │   └── recovery.js
│   │   │
│   │   └── services/
│   │       ├── aiAgent.js
│   │       ├── recoveryTools.js
│   │       ├── policyEngine.js
│   │       ├── auditLogger.js
│   │       ├── batchService.js
│   │       └── evaluationService.js
│   │
│   ├── .env
│   └── package.json
│
└── frontend/
    │
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    │
    ├── package.json
    └── vite.config.js
Running Locally
1. Clone the repository
git clone YOUR_REPOSITORY_URL
cd recover-ai
2. Install backend dependencies
cd backend
npm install
3. Create .env
GEMINI_API_KEY=your_gemini_api_key

Never commit .env to GitHub.

4. Start backend
npm run dev

Backend:

http://localhost:5000
5. Start frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
API Endpoints
Payments
GET /api/payments

Returns payment data.

At-risk payments
GET /api/recovery/at-risk

Returns recoverable failed payments.

Analyze payment
POST /api/recovery/analyze/:paymentId

Runs Gemini analysis and executes the approved recovery action.

Run recovery batch
POST /api/recovery/run-batch

Processes all currently recoverable payments.

Reset demo
POST /api/recovery/reset

Restores the demo dataset and clears previous recovery results.

Metrics
GET /api/recovery/metrics

Returns revenue recovery metrics.

Evaluation
GET /api/recovery/evaluation

Evaluates batch performance.

Audit trail
GET /api/recovery/audit

Returns detailed audit events.

Audit summary
GET /api/recovery/audit/summary

Returns summarized audit statistics.

Important Design Principle

RecoverAI intentionally does not allow the AI model to directly modify payment data.

The AI only produces a structured decision.

The backend then:

Validates the AI response.
Checks recovery policy.
Executes the permitted tool.
Updates payment state.
Records the result.
Updates revenue metrics.
Writes an audit event.

This creates a controlled agent architecture rather than an unrestricted AI automation.

Future Improvements

Potential production extensions include:

Razorpay Test Mode integration
PostgreSQL/Supabase persistence
Real payment failure webhooks
Customer communication channels
Email/SMS recovery
Adaptive retry timing
B2B receivables recovery
Promise-to-pay tracking
Multilingual recovery messages
Human review dashboard
Recovery strategy experimentation
Buildathon Track

Built for:

Razorpay AI Buildathon — Track 3: AI Revenue Recovery

The project focuses on finding revenue at risk, deciding the appropriate intervention, executing bounded recovery actions, and measuring recovered revenue.