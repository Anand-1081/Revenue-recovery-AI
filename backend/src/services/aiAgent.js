const {
  GoogleGenAI,
  Type
} = require("@google/genai");


// ======================================================
// GEMINI CLIENT
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


// ======================================================
// RECOVERY TOOLS
// ======================================================

const tools = [
  {
    functionDeclarations: [

      // ==================================================
      // RETRY PAYMENT
      // ==================================================

      {
        name: "retryPayment",

        description:
          "Retry a failed payment when the failure appears temporary or the customer has a strong successful payment history.",

        parameters: {
          type: Type.OBJECT,

          properties: {

            paymentId: {
              type: Type.STRING,
              description:
                "The exact payment ID supplied in the payment data."
            },

            reason: {
              type: Type.STRING,
              description:
                "Short explanation of why retrying is appropriate."
            },

            confidence: {
              type: Type.NUMBER,
              description:
                "Confidence score from 0 to 1 for this recovery decision."
            },

            riskLevel: {
              type: Type.STRING,
              description:
                "Risk level for the action: LOW, MEDIUM, or HIGH."
            }

          },

          required: [
            "paymentId",
            "reason",
            "confidence",
            "riskLevel"
          ]
        }
      },


      // ==================================================
      // RECOVERY REMINDER
      // ==================================================

      {
        name: "sendRecoveryReminder",

        description:
          "Send a recovery reminder when the customer may need to take action to complete payment.",

        parameters: {
          type: Type.OBJECT,

          properties: {

            paymentId: {
              type: Type.STRING,
              description:
                "The exact payment ID."
            },

            reason: {
              type: Type.STRING,
              description:
                "Short explanation for sending the reminder."
            },

            confidence: {
              type: Type.NUMBER,
              description:
                "Confidence score from 0 to 1 for this recovery decision."
            },

            riskLevel: {
              type: Type.STRING,
              description:
                "Risk level for the action: LOW, MEDIUM, or HIGH."
            }

          },

          required: [
            "paymentId",
            "reason",
            "confidence",
            "riskLevel"
          ]
        }
      },


      // ==================================================
      // HUMAN REVIEW
      // ==================================================

      {
        name: "requestHumanReview",

        description:
          "Send the payment for human review when automated recovery is uncertain, risky or inappropriate.",

        parameters: {
          type: Type.OBJECT,

          properties: {

            paymentId: {
              type: Type.STRING,
              description:
                "The exact payment ID."
            },

            reason: {
              type: Type.STRING,
              description:
                "Why human review is required."
            },

            confidence: {
              type: Type.NUMBER,
              description:
                "Confidence score from 0 to 1 for this recovery decision."
            },

            riskLevel: {
              type: Type.STRING,
              description:
                "Risk level for the action: LOW, MEDIUM, or HIGH."
            }

          },

          required: [
            "paymentId",
            "reason",
            "confidence",
            "riskLevel"
          ]
        }
      },


      // ==================================================
      // STOP RECOVERY
      // ==================================================

      {
        name: "stopRecovery",

        description:
          "Stop automated recovery when further recovery attempts are not appropriate or limits have been exhausted.",

        parameters: {
          type: Type.OBJECT,

          properties: {

            paymentId: {
              type: Type.STRING,
              description:
                "The exact payment ID."
            },

            reason: {
              type: Type.STRING,
              description:
                "Why recovery should stop."
            },

            confidence: {
              type: Type.NUMBER,
              description:
                "Confidence score from 0 to 1 for this recovery decision."
            },

            riskLevel: {
              type: Type.STRING,
              description:
                "Risk level for the action: LOW, MEDIUM, or HIGH."
            }

          },

          required: [
            "paymentId",
            "reason",
            "confidence",
            "riskLevel"
          ]
        }
      }

    ]
  }
];


// ======================================================
// VALIDATE AI DECISION
// ======================================================

function validateAIDecision(
  decision,
  payment
) {

  // ----------------------------------------------------
  // Decision exists
  // ----------------------------------------------------

  if (!decision) {

    return {
      valid: false,
      reason:
        "AI returned no decision."
    };
  }


  // ----------------------------------------------------
  // Must be a function call
  // ----------------------------------------------------

  if (
    decision.type !==
    "FUNCTION_CALL"
  ) {

    return {
      valid: false,
      reason:
        "AI did not return a recovery function call."
    };
  }


  // ----------------------------------------------------
  // Allowed actions
  // ----------------------------------------------------

  const allowedActions = [
    "retryPayment",
    "sendRecoveryReminder",
    "requestHumanReview",
    "stopRecovery"
  ];


  if (
    !allowedActions.includes(
      decision.name
    )
  ) {

    return {
      valid: false,
      reason:
        "AI returned an unknown recovery action."
    };
  }


  const args =
    decision.arguments || {};


  // ----------------------------------------------------
  // Payment ID
  // ----------------------------------------------------

  if (!args.paymentId) {

    return {
      valid: false,
      reason:
        "AI did not provide a payment ID."
    };
  }


  if (
    args.paymentId !==
    payment.payment_id
  ) {

    return {
      valid: false,
      reason:
        "AI returned a different payment ID."
    };
  }


  // ----------------------------------------------------
  // Reason
  // ----------------------------------------------------

  if (
    !args.reason ||
    typeof args.reason !==
      "string" ||
    args.reason.trim().length === 0
  ) {

    return {
      valid: false,
      reason:
        "AI did not provide a valid recovery reason."
    };
  }


  // ----------------------------------------------------
  // Confidence
  // ----------------------------------------------------

  if (
    typeof args.confidence !==
      "number" ||
    args.confidence < 0 ||
    args.confidence > 1
  ) {

    return {
      valid: false,
      reason:
        "AI returned an invalid confidence score."
    };
  }


  // ----------------------------------------------------
  // Risk level
  // ----------------------------------------------------

  const allowedRiskLevels = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];


  if (
    !allowedRiskLevels.includes(
      args.riskLevel
    )
  ) {

    return {
      valid: false,
      reason:
        "AI returned an invalid risk level."
    };
  }


  // ----------------------------------------------------
  // Retry limit
  // ----------------------------------------------------

  if (
    decision.name ===
      "retryPayment" &&
    payment.retry_count >= 2
  ) {

    return {
      valid: false,
      reason:
        "AI attempted retry after retry limit."
    };
  }


  // ----------------------------------------------------
  // Reminder limit
  // ----------------------------------------------------

  if (
    decision.name ===
      "sendRecoveryReminder" &&
    payment.reminder_count >= 3
  ) {

    return {
      valid: false,
      reason:
        "AI attempted reminder after reminder limit."
    };
  }


  // ----------------------------------------------------
  // Validation successful
  // ----------------------------------------------------

  return {
    valid: true,
    reason:
      "AI decision passed validation."
  };
}


// ======================================================
// ANALYZE PAYMENT
// ======================================================

async function analyzePayment(
  payment
) {

  const prompt = `

You are RecoverAI, an AI revenue recovery agent.

Your job is to analyze ONE failed payment and select
the safest and most appropriate recovery action.

You have four available actions:

1. retryPayment
2. sendRecoveryReminder
3. requestHumanReview
4. stopRecovery

You MUST choose exactly ONE action.


==================================================
PAYMENT DATA
==================================================

${JSON.stringify(
  payment,
  null,
  2
)}


==================================================
DECISION FRAMEWORK
==================================================

Consider ALL of the following:

- failure_reason
- retry_count
- reminder_count
- previous_successful_payments
- amount
- customer history
- recovery limits

Do not make your decision from the failure reason alone.


==================================================
INSUFFICIENT FUNDS
==================================================

If retry_count is 0:

- A retry can be appropriate.
- Prefer retry when the customer has previous
  successful payments.

If retry_count is 1:

- Do not blindly retry again.
- Prefer a recovery reminder.

If retry_count >= 2:

- Never retry.
- Consider reminder, human review or stop.


==================================================
BANK DECLINED
==================================================

If the customer has a strong payment history:

- A cautious retry can be considered if
  retry_count < 2.

If the customer has little or no successful history:

- Prefer human review.

If retry_count is already 1:

- Consider a recovery reminder rather than
  another aggressive retry.

If retry_count >= 2:

- Never retry.


==================================================
TIMEOUT
==================================================

A timeout may be temporary.

If retry_count < 2:

- Retry can be appropriate.

If retry_count is 1:

- Consider whether another retry is reasonable.
- A recovery reminder may be safer.

If retry_count >= 2:

- Never retry.


==================================================
UNKNOWN FAILURE
==================================================

Unknown failures are uncertain.

Do NOT blindly retry an unknown failure.

Prefer:

requestHumanReview

unless there is a strong reason to safely stop.


==================================================
CUSTOMER HISTORY
==================================================

Use previous_successful_payments as a signal.

0 previous successful payments:

- Low confidence.
- Be conservative.

1-2 previous successful payments:

- Limited history.
- Avoid aggressive automation.

3-5 previous successful payments:

- Moderate confidence.

6+ previous successful payments:

- Strong historical relationship.
- A recovery attempt may be more reasonable.


==================================================
PAYMENT AMOUNT
==================================================

Higher-value payments deserve more caution.

For unusual or uncertain high-value payments,
human review may be preferable.


==================================================
RECOVERY LIMITS
==================================================

Maximum retries:

2

Maximum reminders:

3

Never exceed these limits.


==================================================
CONFIDENCE
==================================================

Return a confidence score between 0 and 1.

Examples:

0.90 - 1.00
Very strong evidence.

0.75 - 0.89
Strong evidence.

0.50 - 0.74
Moderate evidence.

0.25 - 0.49
Weak evidence.

0.00 - 0.24
Very uncertain.


==================================================
RISK LEVEL
==================================================

Use exactly one:

LOW
MEDIUM
HIGH

LOW:

- Clear recovery opportunity.
- Strong customer history.
- Temporary failure.
- Within recovery limits.

MEDIUM:

- Some uncertainty.
- Limited customer history.
- Recovery is possible but not strongly supported.

HIGH:

- Unknown failure.
- Very limited customer history.
- Unusual situation.
- Human review is more appropriate.


==================================================
SAFETY RULES
==================================================

1. Choose exactly ONE action.

2. Never retry when retry_count >= 2.

3. Never send a reminder when reminder_count >= 3.

4. Never invent customer information.

5. Use only the supplied payment data.

6. paymentId MUST exactly match the supplied payment.

7. Always provide a concise reason.

8. Do not attempt actions outside the available tools.

9. The backend policy engine is the final authority.

10. Never claim that a recovery action guarantees payment success.

11. Prefer safe recovery over aggressive recovery.

12. When uncertain, request human review.

13. Confidence MUST be between 0 and 1.

14. riskLevel MUST be LOW, MEDIUM or HIGH.


==================================================
EXPECTED OUTPUT
==================================================

Call exactly ONE of the available recovery tools.

The tool arguments MUST contain:

paymentId
reason
confidence
riskLevel

Do not return multiple actions.

Do not return plain text instead of a tool call.


==================================================

Now analyze the payment and choose the safest
recovery action.

`;


  try {

    console.log(
      `Sending ${payment.payment_id} to Gemini...`
    );


    // --------------------------------------------------
    // Gemini request
    // --------------------------------------------------

    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.7-flash",

        contents:
          prompt,

        config: {
          tools
        }

      });


    // --------------------------------------------------
    // Find function call
    // --------------------------------------------------

    const parts =
      response
        .candidates?.[0]
        ?.content?.parts ||
      [];


    const functionCallPart =
      parts.find(
        (part) =>
          part.functionCall
      );


    // --------------------------------------------------
    // No function call
    // --------------------------------------------------

    if (
      !functionCallPart
    ) {

      return {

        type:
          "NO_ACTION",

        message:
          response.text ||
          "AI did not select a recovery action."

      };
    }


    // --------------------------------------------------
    // Extract function call
    // --------------------------------------------------

    const functionCall =
      functionCallPart
        .functionCall;


    const decision = {

      type:
        "FUNCTION_CALL",

      name:
        functionCall.name,

      arguments:
        functionCall.args ||
        {}

    };


    // --------------------------------------------------
    // Validate decision
    // --------------------------------------------------

    const validation =
      validateAIDecision(
        decision,
        payment
      );


    if (
      !validation.valid
    ) {

      console.warn(

        `AI decision rejected for ${payment.payment_id}: ${validation.reason}`

      );


      return {

        type:
          "INVALID_DECISION",

        message:
          validation.reason,

        original_decision:
          decision

      };
    }


    // --------------------------------------------------
    // Log AI decision
    // --------------------------------------------------

    console.log(
      `AI selected ${decision.name} for ${payment.payment_id}`
    );

    console.log(
      `Confidence: ${decision.arguments.confidence}`
    );

    console.log(
      `Risk: ${decision.arguments.riskLevel}`
    );


    return decision;


  } catch (error) {

    console.error(
      "Gemini error:",
      error
    );


    return {

      type:
        "AI_ERROR",

      message:
        error.message ||
        "Gemini analysis failed."

    };
  }
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  analyzePayment,

  validateAIDecision

};