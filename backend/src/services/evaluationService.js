const {
  getBatchMetrics
} = require("./batchService");

const {
  getAuditLogs
} = require("./auditLogger");


// ======================================================
// EVALUATE RECOVERY BATCH
// ======================================================

function evaluateBatch() {

  const metrics =
    getBatchMetrics();

  const auditLogs =
    getAuditLogs();


  if (!metrics) {

    return {
      success: false,
      error:
        "No recovery batch found."
    };

  }


  // ====================================================
  // BASIC METRICS
  // ====================================================

  const revenueAtRisk =
    Number(
      metrics.total_revenue_at_risk || 0
    );

  const recoverableRevenue =
    Number(
      metrics.total_recoverable_revenue || 0
    );

  const recoveredRevenue =
    Number(
      metrics.recovered_revenue || 0
    );


  // ====================================================
  // RECOVERY RATE
  // ====================================================

  const recoveryRate =
    recoverableRevenue > 0
      ? (
          recoveredRevenue /
          recoverableRevenue
        ) * 100
      : 0;


  // ====================================================
  // AT-RISK RECOVERY RATE
  // ====================================================

  const riskRecoveryRate =
    revenueAtRisk > 0
      ? (
          recoveredRevenue /
          revenueAtRisk
        ) * 100
      : 0;


  // ====================================================
  // AI DECISION COUNTS
  // ====================================================

  let retryCount = 0;

  let reminderCount = 0;

  let humanReviewCount = 0;

  let stoppedCount = 0;

  let blockedCount = 0;

  let failedCount = 0;


  auditLogs.forEach(
    (log) => {

      const action =
        log.ai_decision;


      if (
        action ===
        "retryPayment"
      ) {

        retryCount++;

      }


      if (
        action ===
        "sendRecoveryReminder"
      ) {

        reminderCount++;

      }


      if (
        action ===
        "requestHumanReview"
      ) {

        humanReviewCount++;

      }


      if (
        action ===
        "stopRecovery"
      ) {

        stoppedCount++;

      }


      if (
        log.action_executed ===
        "BLOCKED"
      ) {

        blockedCount++;

      }


      if (
        log.result?.success ===
        false
      ) {

        failedCount++;

      }

    }
  );


  // ====================================================
  // AI DECISION COUNT
  // ====================================================

  const totalAIDecisions =
    auditLogs.filter(
      (log) =>
        log.ai_decision &&
        log.ai_decision !==
          "NO_ACTION"
    ).length;


  // ====================================================
  // AI CONFIDENCE
  // ====================================================

  const confidenceValues =
    auditLogs
      .map(
        (log) =>
          Number(
            log.ai_confidence
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );


  const averageConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce(
          (
            total,
            value
          ) =>
            total + value,
          0
        ) /
        confidenceValues.length
      : 0;


  // ====================================================
  // RECOVERY VALUE BY ACTION
  // ====================================================

  const recoveredByAction = {

    retryPayment:
      0,

    sendRecoveryReminder:
      0,

    requestHumanReview:
      0,

    stopRecovery:
      0

  };


  auditLogs.forEach(
    (log) => {

      if (
        log.result?.success &&
        Number(
          log.result?.recoveredAmount
        ) > 0
      ) {

        const action =
          log.ai_decision;


        if (
          Object.prototype.hasOwnProperty.call(
            recoveredByAction,
            action
          )
        ) {

          recoveredByAction[action] +=
            Number(
              log.result.recoveredAmount
            );

        }

      }

    }
  );


  // ====================================================
  // MONEY EFFICIENCY
  // ====================================================

  const unrecoveredRevenue =
    Math.max(
      recoverableRevenue -
        recoveredRevenue,
      0
    );


  // ====================================================
  // EVALUATION SUMMARY
  // ====================================================

  return {

    success:
      true,


    batch: {

      batch_id:
        metrics.batch_id,

      status:
        metrics.status

    },


    money: {

      revenue_at_risk:
        revenueAtRisk,

      recoverable_revenue:
        recoverableRevenue,

      recovered_revenue:
        recoveredRevenue,

      unrecovered_revenue:
        unrecoveredRevenue,

      recovery_rate:
        `${recoveryRate.toFixed(2)}%`,

      risk_recovery_rate:
        `${riskRecoveryRate.toFixed(2)}%`

    },


    decisions: {

      total:
        totalAIDecisions,

      retry:
        retryCount,

      reminders:
        reminderCount,

      human_review:
        humanReviewCount,

      stopped:
        stoppedCount,

      blocked:
        blockedCount,

      failed:
        failedCount

    },


    ai_quality: {

      average_confidence:
        `${(
          averageConfidence * 100
        ).toFixed(2)}%`,

      decisions_with_confidence:
        confidenceValues.length

    },


    recovered_by_action:
      recoveredByAction,


    audit_events:
      auditLogs.length

  };

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  evaluateBatch
};