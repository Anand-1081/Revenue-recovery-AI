# ⚡ RecoverAI

<p align="center">
  <img src="https://img.shields.io/badge/AI-Revenue%20Recovery-111827?style=for-the-badge&logo=google-gemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Track-3-6366f1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=111827" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<p align="center">
  <strong>AI Revenue Recovery Agent</strong>
</p>

<p align="center">
  <i>Detect revenue at risk. Decide the right intervention. Recover it safely.</i>
</p>

<p align="center">
  <a href="#-why-recoverai">Why RecoverAI</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-setup">Setup</a>
</p>

---

## 💡 Why RecoverAI?

Failed payments don't always mean lost customers.

Sometimes the payment failed because:

- the failure was temporary
- the customer has a strong payment history
- a previous retry already happened
- the customer needs to take an action
- the situation is too uncertain for automation

The real question isn't:

> **"Did the payment fail?"**

It's:

> **"What should the system safely do next?"**

That's where RecoverAI comes in.

---

# 🚀 What is RecoverAI?

**RecoverAI is an AI-powered revenue recovery agent that turns failed payments into measurable recovery opportunities.**

Instead of simply listing failed transactions, the agent:

```text
┌───────────────┐
│ Failed Payment│
└───────┬───────┘
        ↓
┌───────────────┐
│ Detect Risk   │
└───────┬───────┘
        ↓
┌───────────────┐
│ Analyze Data  │
└───────┬───────┘
        ↓
┌───────────────┐
│ Gemini Decides│
└───────┬───────┘
        ↓
┌───────────────┐
│ Policy Checks │
└───────┬───────┘
        ↓
┌───────────────┐
│ Execute Action│
└───────┬───────┘
        ↓
┌───────────────┐
│ Measure ₹     │
└───────────────┘
The core principle

AI recommends. Policy authorizes. Tools execute. Audit records. Metrics measure.

🎯 The Problem

Businesses lose revenue when payments fail.

Traditional systems often stop at:

Payment FAILED
        ↓
Show FAILED
        ↓
Done

RecoverAI adds an intelligent decision layer:

Payment FAILED
        ↓
Why did it fail?
        ↓
Is recovery still possible?
        ↓
What action is safest?
        ↓
Can the action be automated?
        ↓
Did we actually recover money?

The goal is simple:

Don't just detect lost revenue. Recover measurable revenue.

✨ What RecoverAI Does
Capability	What it does
🔎 Revenue Risk Detection	Finds failed payments that are still recoverable
🧠 AI Reasoning	Gemini analyzes payment and customer history
🎯 Action Selection	Selects the most appropriate recovery strategy
🛡️ Policy Enforcement	Deterministic rules validate AI decisions
⚙️ Recovery Execution	Executes bounded recovery tools
💰 Revenue Tracking	Measures actual recovered revenue
📋 Audit Trail	Records every important decision
📊 Batch Evaluation	Measures recovery performance across a batch
🧠 AI Recovery Actions

RecoverAI gives Gemini four possible actions.

01 — retryPayment

Used when a retry is reasonable.

Example:

Temporary Failure
       +
Strong Customer History
       +
Retry Available
       ↓
   RETRY PAYMENT
02 — sendRecoveryReminder

Used when the customer may need to take action.

Previous Retry
       +
Recovery Still Possible
       ↓
RECOVERY REMINDER
03 — requestHumanReview

Used when automation is uncertain or risky.

Unknown Failure
       +
Little Customer History
       ↓
 HUMAN REVIEW
04 — stopRecovery

Used when continuing automated recovery is no longer appropriate.

Limits Exhausted
       ↓
 STOP RECOVERY
🏗️ Architecture
                         ┌──────────────────────┐
                         │    React Dashboard   │
                         │                      │
                         │ Revenue • AI • Audit │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express Backend    │
                         │                      │
                         │ Recovery API         │
                         │ Batch Processing     │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
           ┌─────────────────┐             ┌─────────────────┐
           │    Gemini AI    │             │   Payment Data  │
           │                 │             │                 │
           │ Analyze         │             │ Payment State   │
           │ Decide          │             │ Customer History│
           │ Confidence      │             │ Failure Reason  │
           │ Risk            │             │ Retry State     │
           └────────┬────────┘             └─────────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │    Policy Engine    │
           │                     │
           │ Retry Limits        │
           │ Reminder Limits     │
           │ Risk Rules          │
           │ Validation          │
           └──────────┬──────────┘
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
       ┌──────────────┐  ┌────────────────┐
       │ Recovery     │  │ Human Review   │
       │ Tools        │  │ / Stop         │
       └──────┬───────┘  └────────────────┘
              │
              ▼
       ┌──────────────────┐
       │ Result + Audit   │
       │                  │
       │ Action           │
       │ Result           │
       │ Confidence       │
       │ Risk             │
       │ Timestamp        │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Revenue Metrics  │
       │                  │
       │ ₹ Recovered      │
       │ Recovery Rate    │
       │ Remaining Risk   │
       └──────────────────┘
🛡️ AI Safety Architecture

Gemini does not directly modify payment state.

Instead:

                 GEMINI
                    │
                    │ Recommendation
                    ▼
             ┌──────────────┐
             │    POLICY    │
             │    ENGINE    │
             └──────┬───────┘
                    │
             ┌──────┴──────┐
             │             │
          APPROVED       BLOCKED
             │             │
             ▼             ▼
       ┌───────────┐     STOP
       │  ACTION   │
       │   TOOL    │
       └─────┬─────┘
             │
             ▼
        PAYMENT STATE
Separation of responsibilities
Layer	Responsibility
🧠 Gemini	Reasoning & action selection
🛡️ Policy Engine	Safety & authorization
⚙️ Recovery Tools	Execution
📋 Audit Logger	Traceability
📊 Evaluation Service	Measurement
Why this matters

The AI can recommend an action.

It cannot bypass the backend's safety rules.

The backend remains the final authority.

🔐 Recovery Guardrails

RecoverAI uses bounded automation.

Retry protection
Maximum automatic retries
        ↓
          2
Reminder protection
Maximum recovery reminders
        ↓
          3
Additional safeguards
Only failed payments can enter recovery
Exact payment ID validation
Unknown actions are rejected
Invalid confidence values are rejected
Invalid risk levels are rejected
High-value situations receive additional caution
Uncertain cases can be escalated to humans
AI cannot bypass the policy engine
Recovery actions are bounded
Every decision is logged
💰 Revenue Recovery

RecoverAI focuses on business impact, not just AI output.

Revenue At Risk
       ↓
Recoverable Revenue
       ↓
Recovered Revenue
       ↓
Recovery Rate
Tracked metrics
Revenue at Risk
Recoverable Revenue
Recovered Revenue
Remaining Revenue
Recovery Rate
Human Review Revenue
Stopped Recovery Revenue
Failed Recovery Revenue
Recovery by Action
AI Confidence
AI Decision Count
The north-star metric
₹ Revenue Recovered
📋 Audit Trail

Every recovery decision creates an audit event.

An event can contain:

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
Execution Status

This makes every agent decision:

Explainable → Traceable → Reviewable

🧪 Demo

RecoverAI currently uses a controlled payment simulator so the complete workflow can be demonstrated safely.

Example
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
     ↓
   ALLOWED

↓

Recovery Tool

↓

SUCCESS

↓

₹1,499 RECOVERED

The simulator supports:

SUCCESS_ON_RETRY
SUCCESS_AFTER_REMINDER
FAIL_ON_RETRY
HUMAN_REVIEW

This allows the entire agent workflow to be demonstrated without using real customer payments.

🖥️ Dashboard

The dashboard brings the entire recovery operation into one place.

💰 Revenue
Revenue at Risk
Recoverable Revenue
Recovered Revenue
Recovery Rate
🧠 AI Decision Center
Selected Action
AI Reasoning
Confidence
Risk Level
🛡️ Safety
Policy Decision
Policy Reason
Blocked Actions
⚙️ Operations
Recoverable Payments
Batch Status
Recovery Results
📋 Audit
Complete Decision History
Execution Status
Recovery Amount
Timestamp
🔄 Recovery Lifecycle
┌──────────────────┐
│  FAILED PAYMENT  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ REVENUE AT RISK  │
└────────┬─────────┘
         ↓
┌────────────────────────┐
│ CUSTOMER + PAYMENT     │
│ ANALYSIS               │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│     GEMINI DECISION    │
└───────────┬────────────┘
            │
      ┌─────┼───────────────┐
      ↓     ↓               ↓
    Retry Reminder     Human Review
      │     │               │
      └─────┴───────┬───────┘
                    ↓
           ┌─────────────────┐
           │ POLICY ENGINE   │
           └────────┬────────┘
                    │
             ┌──────┴──────┐
             ↓             ↓
          BLOCKED       APPROVED
                           │
                           ▼
                  ┌────────────────┐
                  │ RECOVERY TOOL  │
                  └───────┬────────┘
                          ↓
                  ┌────────────────┐
                  │ ACTUAL RESULT  │
                  └───────┬────────┘
                          ↓
                ┌───────────────────┐
                │ AUDIT + METRICS   │
                └───────────────────┘
🧠 Why This Is an Agent

RecoverAI is more than an LLM chatbot.

The agent:

OBSERVE
   ↓
REASON
   ↓
DECIDE
   ↓
USE TOOL
   ↓
OBSERVE RESULT
   ↓
RECORD
   ↓
MEASURE IMPACT

It observes payment state, reasons about the situation, selects an action, uses recovery tools, operates under deterministic constraints, observes the result and measures the business impact.

The focus isn't just:

"What does the AI think?"

It's:

"What did the agent safely do, and how much revenue did it recover?"

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
Razorpay Test Mode — planned integration

The current prototype uses simulated recovery outcomes. Razorpay Test Mode can be connected as the payment execution layer.

📁 Project Structure
recover-ai/
│
├── backend/
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
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
🚀 Setup
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

Start:

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
🧪 Recovery Scenarios
Scenario	Expected Strategy
Temporary failure + strong history	🔄 Retry
Retry already attempted	🔔 Reminder
Unknown failure	👤 Human Review
Recovery limits exhausted	🛑 Stop
High-value + uncertain history	👤 Human Review
Invalid AI action	🚫 Block
Invalid payment ID	🚫 Block
📊 Evaluation

RecoverAI evaluates the recovery batch using:

Revenue At Risk
        ↓
Recoverable Revenue
        ↓
Recovered Revenue
        ↓
Recovery Rate

It also measures:

Total AI decisions
Retry decisions
Reminder decisions
Human review decisions
Stopped recoveries
Blocked decisions
Failed recovery attempts
Average AI confidence
Revenue recovered by action
🗺️ Roadmap
✅ Current
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
🔜 Next
 Razorpay Test Mode integration
 PostgreSQL / Supabase
 Payment webhooks
 Email / SMS recovery
 Adaptive retry timing
 Human review workflow
 Recovery strategy experiments
 Multilingual customer communication
🏆 Razorpay AI Buildathon
Track 3 — AI Revenue Recovery

Find revenue that's slipping away and win it back.

RecoverAI focuses on the complete loop:

DETECT
  ↓
DECIDE
  ↓
EXECUTE
  ↓
MEASURE

The key difference:

RecoverAI doesn't just identify failed payments. It makes a bounded recovery decision, executes only policy-approved actions, measures the revenue recovered, and records the complete decision trail.

👨‍💻 Author
Anand

Built with:

React
+
Node.js
+
Gemini