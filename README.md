# ⚡ RecoverAI

<p align="center">
  <strong>AI Revenue Recovery Agent</strong>
</p>

<p align="center">
  Detect revenue at risk. Decide the right intervention. Recover it safely.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Track-3%20AI%20Revenue%20Recovery-black?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge" />
</p>

---

## 💡 What is RecoverAI?

**RecoverAI is an AI-powered revenue recovery agent that turns failed payments into recovery opportunities.**

Instead of simply reporting failed payments, RecoverAI:

```text
Detect
   ↓
Understand
   ↓
Decide
   ↓
Validate
   ↓
Execute
   ↓
Measure

The agent analyzes payment failures, customer history, retry limits and payment value before selecting the safest recovery action.

AI recommends. Backend authorizes. Backend executes.

🎯 The Problem

Failed payments represent revenue that a business expected to receive but didn't.

The difficult part isn't detecting:

"This payment failed."

The difficult part is deciding:

"What should we do next?"

Blindly retrying can annoy customers, waste payment attempts and create risky automation.

RecoverAI introduces an intelligent recovery layer between payment failure and recovery execution.

✨ What RecoverAI Does
Capability	Description
🔎 Revenue Risk Detection	Finds failed payments that are still recoverable
🧠 AI Reasoning	Gemini analyzes payment and customer history
🎯 Action Selection	Chooses the safest recovery strategy
🛡 Policy Enforcement	Deterministic backend rules validate AI decisions
⚙️ Recovery Execution	Executes bounded recovery tools
💰 Revenue Tracking	Measures actual recovered revenue
📋 Audit Trail	Records every decision and execution
📊 Batch Evaluation	Measures recovery performance across a batch
🧠 AI Recovery Actions

RecoverAI gives the AI four possible actions.

retryPayment

Used when a retry appears reasonable.

Example:

Temporary failure
+
Strong payment history
+
Retry limit available
=
Retry
sendRecoveryReminder

Used when the customer may need to take action.

Previous retry attempted
+
Recovery still possible
=
Recovery Reminder
requestHumanReview

Used when automation is uncertain or risky.

Unknown failure
+
Little customer history
=
Human Review
stopRecovery

Used when continuing automated recovery is no longer appropriate.

Recovery limits exhausted
=
Stop
🏗️ Architecture
                         ┌─────────────────────┐
                         │   React Dashboard   │
                         │                     │
                         │ Revenue • AI • Audit│
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Backend   │
                         │                     │
                         │  Recovery API       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌─────────────────┐   ┌─────────────────┐
                │    Gemini AI    │   │   Payment Data  │
                │                 │   │                 │
                │ Analyze         │   │ payments.json   │
                │ Decide          │   │ batch data      │
                │ Confidence      │   │ audit data      │
                │ Risk            │   └─────────────────┘
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Policy Engine  │
                │                 │
                │ Retry limits    │
                │ Reminder limits │
                │ Risk rules      │
                └────────┬────────┘
                         │
                  ┌──────┴──────┐
                  │             │
                  ▼             ▼
          ┌──────────────┐ ┌──────────────┐
          │ Recovery     │ │ Human Review │
          │ Tools        │ │ / Stop       │
          └──────┬───────┘ └──────────────┘
                 │
                 ▼
          ┌─────────────────┐
          │ Revenue Metrics │
          │                 │
          │ ₹ Recovered     │
          │ Recovery Rate   │
          │ Remaining Risk  │
          └─────────────────┘
🛡️ AI Safety Model

RecoverAI does not allow Gemini to directly modify payment data.

Instead:

Gemini
  │
  │ Recommendation
  ▼
Policy Engine
  │
  │ Approved?
  ├─────────────── No ───────► Block
  │
  ▼ Yes
Recovery Tool
  │
  ▼
Payment State

This creates a controlled agent architecture where:

Layer	Responsibility
🧠 Gemini	Reasoning
🛡️ Policy Engine	Safety & authorization
⚙️ Recovery Tools	Execution
📋 Audit Logger	Traceability
📊 Evaluation Service	Measurement
🔐 Recovery Guardrails

RecoverAI uses bounded automation.

Retry limit
Maximum: 2 retries
Reminder limit
Maximum: 3 reminders
Additional safeguards
Failed payments only
Exact payment ID validation
Unknown actions rejected
Invalid AI confidence rejected
Invalid risk levels rejected
High-value situations receive additional caution
Uncertain cases can be escalated to humans
AI cannot bypass backend policy
📊 Revenue Recovery

The system measures actual outcomes instead of only counting AI decisions.

Core metrics
Revenue at Risk
        ↓
Recoverable Revenue
        ↓
Recovered Revenue
        ↓
Recovery Rate

RecoverAI also tracks:

Unrecovered revenue
Human review revenue
Stopped recovery revenue
Failed recovery revenue
Recovery by action
AI confidence
AI decision count
The objective

Don't just detect lost revenue. Recover measurable revenue.

🧾 Audit Trail

Every recovery decision produces an audit event.

Each event can contain:

Payment ID
Customer ID
Amount
Failure Reason

AI Decision
AI Reason
AI Confidence
AI Risk Level

Policy Decision
Policy Reason

Executed Action
Execution Result
Recovered Amount

Timestamp

This makes the agent's behavior explainable and traceable.

🧪 Demo Dataset

RecoverAI currently uses a controlled payment simulation so the complete recovery workflow can be demonstrated safely.

Example:

P001
₹1,499
INSUFFICIENT_FUNDS
8 previous successful payments
0 retries

          ↓

Gemini

          ↓

retryPayment

          ↓

Policy Engine
ALLOWED

          ↓

Recovery Tool

          ↓

SUCCESS

          ↓

₹1,499 RECOVERED

The simulator supports different outcomes such as:

SUCCESS_ON_RETRY
SUCCESS_AFTER_REMINDER
FAIL_ON_RETRY
HUMAN_REVIEW

This allows the entire agent workflow to be demonstrated without using real customer payments.

🖥️ Dashboard

The RecoverAI dashboard provides a single view of:

Revenue
Revenue at risk
Recoverable revenue
Revenue recovered
Recovery rate
AI
Selected action
Reasoning
Confidence
Risk level
Safety
Policy decision
Policy reason
Blocked actions
Operations
Recoverable payments
Batch status
Recovery results
Audit
Complete decision history
Execution status
Recovery amount
Timestamp
🛠️ Tech Stack
Frontend
React
Vite
CSS
Backend
Node.js
Express
AI
Google Gemini API
@google/genai
Storage
JSON
Payment Integration
Razorpay Test Mode

The current prototype uses simulated recovery outcomes. Razorpay integration can be connected as the payment execution layer.

📁 Project Structure
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
├── frontend/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
🚀 Getting Started
1. Clone
git clone YOUR_REPOSITORY_URL
cd recover-ai
2. Backend
cd backend
npm install

Create:

backend/.env

Add:

GEMINI_API_KEY=your_gemini_api_key

Start the backend:

npm run dev

Backend:

http://localhost:5000
3. Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
🔌 API
Method	Endpoint	Purpose
GET	/api/payments	Get payment data
GET	/api/recovery/at-risk	Get recoverable payments
POST	/api/recovery/analyze/:paymentId	Analyze & recover one payment
POST	/api/recovery/run-batch	Run AI recovery batch
POST	/api/recovery/reset	Reset demo
GET	/api/recovery/metrics	Get recovery metrics
GET	/api/recovery/evaluation	Evaluate batch
GET	/api/recovery/audit	Get audit trail
GET	/api/recovery/audit/summary	Get audit summary
🔄 Recovery Lifecycle
FAILED PAYMENT
      │
      ▼
REVENUE AT RISK
      │
      ▼
CUSTOMER + PAYMENT ANALYSIS
      │
      ▼
GEMINI DECISION
      │
      ├── Retry
      ├── Reminder
      ├── Human Review
      └── Stop
      │
      ▼
POLICY VALIDATION
      │
      ├── BLOCKED
      │
      └── APPROVED
              │
              ▼
        RECOVERY TOOL
              │
              ▼
       ACTUAL OUTCOME
              │
              ▼
        AUDIT + METRICS
🧠 Why This Is an Agent

RecoverAI is more than an LLM chatbot.

The agent:

Observes payment state.
Reasons about the situation.
Selects an action.
Uses available recovery tools.
Operates under deterministic constraints.
Observes the result.
Records the outcome.
Measures the business impact.

The focus is therefore not just:

"What does the AI think?"

but:

"What did the agent safely do, and how much revenue did it recover?"

🗺️ Roadmap
Current
 Failed payment detection
 Gemini decision making
 Function calling
 Confidence scoring
 Risk classification
 Policy engine
 Recovery tools
 Batch processing
 Revenue metrics
 Audit trail
 Batch evaluation
 Recovery simulation
Next
 Razorpay Test Mode integration
 PostgreSQL/Supabase
 Payment webhooks
 Email/SMS recovery
 Adaptive retry timing
 Human review workflow
 Recovery strategy experiments
 Multilingual customer communication
🏆 Buildathon

Built for:

Razorpay AI Buildathon

Track 3 — AI Revenue Recovery

Find revenue that's slipping away and win it back.

RecoverAI focuses on the complete loop:

Detect → Decide → Execute → Measure
👨‍💻 Author

Anand

Built with:

React + Node.js + Gemini