const fs = require("fs");
const path = require("path");

const auditPath = path.join(
  __dirname,
  "../../data/audit.json"
);


// ======================================================
// GET AUDIT LOGS
// ======================================================

function getAuditLogs() {

  if (!fs.existsSync(auditPath)) {
    return [];
  }

  try {

    return JSON.parse(
      fs.readFileSync(
        auditPath,
        "utf-8"
      )
    );

  } catch (error) {

    console.error(
      "Audit read error:",
      error
    );

    return [];

  }

}


// ======================================================
// SAVE AUDIT LOGS
// ======================================================

function saveAuditLogs(
  logs
) {

  fs.writeFileSync(
    auditPath,
    JSON.stringify(
      logs,
      null,
      2
    )
  );

}


// ======================================================
// LOG COMPLETE AGENT EXECUTION
// ======================================================

function logAction(
  data
) {

  const logs =
    getAuditLogs();


  const auditEvent = {

    event_id:
      `AUDIT-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,

    timestamp:
      new Date().toISOString(),

    // ----------------------------------------------
    // PAYMENT
    // ----------------------------------------------

    payment_id:
      data.payment_id || null,

    customer_id:
      data.customer_id || null,

    amount:
      Number(
        data.amount || 0
      ),

    failure_reason:
      data.failure_reason || null,


    // ----------------------------------------------
    // AI DECISION
    // ----------------------------------------------

    ai_decision:
      data.ai_decision || null,

    ai_reason:
      data.ai_reason || null,

    ai_confidence:
      data.ai_confidence ??
      null,

    ai_risk_level:
      data.ai_risk_level ||
      null,


    // ----------------------------------------------
    // POLICY
    // ----------------------------------------------

    policy_allowed:
      data.policy_allowed ??
      false,

    policy_reason:
      data.policy_reason ||
      null,


    // ----------------------------------------------
    // EXECUTION
    // ----------------------------------------------

    action_executed:
      data.action_executed ||
      null,


    // ----------------------------------------------
    // RESULT
    // ----------------------------------------------

    result:
      data.result || null,


    // ----------------------------------------------
    // RECOVERED MONEY
    // ----------------------------------------------

    recovered_amount:
      Number(
        data.result?.recoveredAmount ||
        0
      ),


    // ----------------------------------------------
    // EXECUTION STATUS
    // ----------------------------------------------

    execution_status:
      getExecutionStatus(
        data
      )

  };


  logs.push(
    auditEvent
  );


  saveAuditLogs(
    logs
  );


  return auditEvent;

}


// ======================================================
// EXECUTION STATUS
// ======================================================

function getExecutionStatus(
  data
) {

  if (
    data.action_executed ===
    "BLOCKED"
  ) {

    return "POLICY_BLOCKED";

  }


  if (
    data.action_executed ===
    "NO_ACTION"
  ) {

    return "AI_DECISION_REJECTED";

  }


  if (
    data.action_executed ===
    "ERROR"
  ) {

    return "PROCESSING_ERROR";

  }


  if (
    data.result?.success
  ) {

    return "RECOVERED";

  }


  if (
    data.action_executed ===
    "requestHumanReview"
  ) {

    return "HUMAN_REVIEW";

  }


  if (
    data.action_executed ===
    "stopRecovery"
  ) {

    return "STOPPED";

  }


  if (
    data.result?.success ===
    false
  ) {

    return "RECOVERY_FAILED";

  }


  return "COMPLETED";

}


// ======================================================
// GET AUDIT SUMMARY
// ======================================================

function getAuditSummary() {

  const logs =
    getAuditLogs();


  const summary = {

    total_events:
      logs.length,

    recovered:
      0,

    human_review:
      0,

    stopped:
      0,

    policy_blocked:
      0,

    failed:
      0,

    total_recovered_amount:
      0

  };


  logs.forEach(
    (log) => {

      switch (
        log.execution_status
      ) {

        case "RECOVERED":

          summary.recovered++;

          summary.total_recovered_amount +=
            Number(
              log.recovered_amount || 0
            );

          break;


        case "HUMAN_REVIEW":

          summary.human_review++;

          break;


        case "STOPPED":

          summary.stopped++;

          break;


        case "POLICY_BLOCKED":

          summary.policy_blocked++;

          break;


        case "RECOVERY_FAILED":

        case "PROCESSING_ERROR":

          summary.failed++;

          break;

      }

    }
  );


  return summary;

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  logAction,

  getAuditLogs,

  getAuditSummary

};