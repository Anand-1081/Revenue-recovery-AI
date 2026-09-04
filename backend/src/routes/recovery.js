const express = require("express");
const fs = require("fs");
const path = require("path");

const {
  analyzePayment
} = require("../services/aiAgent");

const {
  validateAction
} = require("../services/policyEngine");

const {
  executeRecoveryTool
} = require("../services/recoveryTools");


const {
  logAction,
  getAuditLogs,
  getAuditSummary
} = require("../services/auditLogger");
const {
  getBatch,
  saveBatch,
  recordRecovery,
  recordHumanReview,
  recordStoppedRecovery,
  recordFailedRecovery,
  getBatchMetrics
} = require("../services/batchService");

const {
  evaluateBatch
} = require("../services/evaluationService");

const router = express.Router();


// ======================================================
// FILE PATH
// ======================================================

const paymentsPath = path.join(
  __dirname,
  "../../data/payments.json"
);


// ======================================================
// PAYMENT HELPERS
// ======================================================

function getPayments() {

  return JSON.parse(
    fs.readFileSync(
      paymentsPath,
      "utf-8"
    )
  );

}


function savePayments(
  payments
) {

  fs.writeFileSync(
    paymentsPath,
    JSON.stringify(
      payments,
      null,
      2
    )
  );

}


// ======================================================
// GET RECOVERABLE PAYMENTS
// ======================================================

router.get(
  "/at-risk",
  (req, res) => {

    try {

      const payments =
        getPayments();


      const recoverable =
        payments.filter(
          (payment) =>

            payment.status ===
              "FAILED" &&

            (
              payment.retry_count < 2 ||
              payment.reminder_count < 3
            )
        );


      res.json({

        count:
          recoverable.length,

        payments:
          recoverable

      });

    } catch (error) {

      console.error(
        "At-risk error:",
        error
      );


      res.status(500).json({

        error:
          "Failed to load recoverable payments."

      });

    }

  }
);


// ======================================================
// ANALYZE SINGLE PAYMENT
// ======================================================

router.post(
  "/analyze/:paymentId",
  async (req, res) => {

    try {

      const paymentId =
        req.params.paymentId;


      let payments =
        getPayments();


      const payment =
        payments.find(
          (item) =>
            item.payment_id ===
            paymentId
        );


      // ------------------------------------------------
      // PAYMENT NOT FOUND
      // ------------------------------------------------

      if (!payment) {

        return res.status(404).json({

          error:
            "Payment not found."

        });

      }


      // ------------------------------------------------
      // ALREADY SUCCESSFUL
      // ------------------------------------------------

      if (
        payment.status ===
        "SUCCESS"
      ) {

        return res.status(400).json({

          error:
            "Payment has already been recovered."

        });

      }


      // ------------------------------------------------
      // CHECK RECOVERY ELIGIBILITY
      // ------------------------------------------------

      const recoverable =
        (
          payment.retry_count < 2 ||
          payment.reminder_count < 3
        );


      if (!recoverable) {

        return res.status(400).json({

          error:
            "Payment has exhausted all recovery limits."

        });

      }


      // ------------------------------------------------
      // AI ANALYSIS
      // ------------------------------------------------

      console.log(
        `Analyzing ${payment.payment_id}...`
      );


      const aiDecision =
        await analyzePayment(
          payment
        );


      // ------------------------------------------------
      // AI FAILURE
      // ------------------------------------------------

      if (
        aiDecision.type ===
          "AI_ERROR" ||
        aiDecision.type ===
          "NO_ACTION" ||
        aiDecision.type ===
          "INVALID_DECISION"
      ) {

        logAction({

          payment_id:
            payment.payment_id,

          customer_id:
            payment.customer_id,

          amount:
            payment.amount,

          failure_reason:
            payment.failure_reason,

          ai_decision:
            "NO_ACTION",

          ai_reason:
            aiDecision.message,

          ai_confidence:
            null,

          ai_risk_level:
            null,

          policy_allowed:
            false,

          policy_reason:
            aiDecision.message,

          action_executed:
            "NO_ACTION",

          result: {

            success:
              false,

            status:
              "AI_DECISION_REJECTED"

          }

        });


        return res.status(400).json({

          error:
            aiDecision.message,

          decision:
            aiDecision

        });

      }


      // ------------------------------------------------
      // AI DECISION DATA
      // ------------------------------------------------

      const action =
        aiDecision.name;


      const args =
        aiDecision.arguments ||
        {};


      const confidence =
        args.confidence;


      const riskLevel =
        args.riskLevel;


      const reason =
        args.reason;


      // ------------------------------------------------
      // POLICY VALIDATION
      // ------------------------------------------------

      const policy =
        validateAction(
          payment,
          action
        );


      // ------------------------------------------------
      // POLICY BLOCKED
      // ------------------------------------------------

      if (
        !policy.allowed
      ) {

        logAction({

          payment_id:
            payment.payment_id,

          customer_id:
            payment.customer_id,

          amount:
            payment.amount,

          failure_reason:
            payment.failure_reason,

          ai_decision:
            action,

          ai_reason:
            reason,

          ai_confidence:
            confidence,

          ai_risk_level:
            riskLevel,

          policy_allowed:
            false,

          policy_reason:
            policy.reason,

          action_executed:
            "BLOCKED",

          result: {

            success:
              false,

            status:
              "POLICY_BLOCKED"

          }

        });


        return res.status(403).json({

          error:
            "Recovery action blocked by policy.",

          payment_id:
            paymentId,

          ai_decision:
            action,

          confidence:
            confidence,

          risk_level:
            riskLevel,

          reason:
            reason,

          policy:
            policy

        });

      }


      // ------------------------------------------------
      // EXECUTE RECOVERY TOOL
      // ------------------------------------------------

      const toolResult =
        await executeRecoveryTool(
          action,
          payment,
          args
        );


      // ------------------------------------------------
      // UPDATE PAYMENT
      // ------------------------------------------------

      payments =
        getPayments();


      const paymentIndex =
        payments.findIndex(
          (item) =>
            item.payment_id ===
            paymentId
        );


      if (
        paymentIndex !== -1
      ) {

        payments[
          paymentIndex
        ] = toolResult.payment;

        savePayments(
          payments
        );

      }


      // ------------------------------------------------
      // RECORD RESULT IN BATCH
      // ------------------------------------------------

      if (
        toolResult.success &&
        Number(
          toolResult.recoveredAmount
        ) > 0
      ) {

        recordRecovery(
          paymentId,
          toolResult.recoveredAmount
        );

      } else if (
        action ===
        "requestHumanReview"
      ) {

        recordHumanReview(
          paymentId,
          payment.amount
        );

      } else if (
        action ===
        "stopRecovery"
      ) {

        recordStoppedRecovery(
          paymentId,
          payment.amount
        );

      } else if (
        !toolResult.success
      ) {

        recordFailedRecovery(
          paymentId,
          payment.amount
        );

      }


      // ------------------------------------------------
      // AUDIT LOG
      // ------------------------------------------------

      logAction({

        payment_id:
          payment.payment_id,

        customer_id:
          payment.customer_id,

        amount:
          payment.amount,

        failure_reason:
          payment.failure_reason,

        ai_decision:
          action,

        ai_reason:
          reason,

        ai_confidence:
          confidence,

        ai_risk_level:
          riskLevel,

        policy_allowed:
          true,

        policy_reason:
          policy.reason,

        action_executed:
          action,

        result:
          toolResult

      });


      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      return res.json({

        success:
          true,

        payment_id:
          paymentId,

        ai_decision:
          action,

        confidence:
          confidence,

        risk_level:
          riskLevel,

        reason:
          reason,

        policy:
          policy,

        result:
          toolResult,

        metrics:
          getBatchMetrics()

      });

    } catch (error) {

      console.error(
        "Recovery analysis error:",
        error
      );


      return res.status(500).json({

        error:
          "Failed to analyze payment.",

        details:
          error.message

      });

    }

  }
);


// ======================================================
// RUN FULL AI RECOVERY BATCH
// ======================================================

router.post(
  "/run-batch",
  async (req, res) => {

    try {

      let payments =
        getPayments();


      // ------------------------------------------------
      // FIND ELIGIBLE PAYMENTS
      // ------------------------------------------------

      const recoverablePayments =
        payments.filter(
          (payment) =>

            payment.status ===
              "FAILED" &&

            (
              payment.retry_count < 2 ||
              payment.reminder_count < 3
            )
        );


      // ------------------------------------------------
      // NOTHING TO PROCESS
      // ------------------------------------------------

      if (
        recoverablePayments.length ===
        0
      ) {

        return res.json({

          success:
            true,

          message:
            "No recoverable payments remain.",

          processed:
            0,

          results:
            [],

          metrics:
            getBatchMetrics()

        });

      }


      const results = [];


      // ------------------------------------------------
      // PROCESS PAYMENTS ONE BY ONE
      // ------------------------------------------------

      for (
        const payment
        of recoverablePayments
      ) {

        console.log(
          `\nProcessing ${payment.payment_id}...`
        );


        try {

          // ==========================================
          // AI ANALYSIS
          // ==========================================

          const aiDecision =
            await analyzePayment(
              payment
            );


          // ==========================================
          // AI FAILURE
          // ==========================================

          if (
            aiDecision.type ===
              "AI_ERROR" ||
            aiDecision.type ===
              "NO_ACTION" ||
            aiDecision.type ===
              "INVALID_DECISION"
          ) {

            logAction({

              payment_id:
                payment.payment_id,

              customer_id:
                payment.customer_id,

              amount:
                payment.amount,

              failure_reason:
                payment.failure_reason,

              ai_decision:
                "NO_ACTION",

              ai_reason:
                aiDecision.message,

              ai_confidence:
                null,

              ai_risk_level:
                null,

              policy_allowed:
                false,

              policy_reason:
                aiDecision.message,

              action_executed:
                "NO_ACTION",

              result: {

                success:
                  false,

                status:
                  "AI_DECISION_REJECTED"

              }

            });


            results.push({

              payment_id:
                payment.payment_id,

              action_executed:
                "NO_ACTION",

              confidence:
                null,

              risk_level:
                null,

              reason:
                aiDecision.message,

              result: {

                success:
                  false,

                status:
                  "AI_DECISION_REJECTED"

              }

            });


            continue;

          }


          // ==========================================
          // AI DATA
          // ==========================================

          const action =
            aiDecision.name;


          const args =
            aiDecision.arguments ||
            {};


          const confidence =
            args.confidence;


          const riskLevel =
            args.riskLevel;


          const reason =
            args.reason;


          // ==========================================
          // POLICY ENGINE
          // ==========================================

          const policy =
            validateAction(
              payment,
              action
            );


          // ==========================================
          // POLICY BLOCK
          // ==========================================

          if (
            !policy.allowed
          ) {

            logAction({

              payment_id:
                payment.payment_id,

              customer_id:
                payment.customer_id,

              amount:
                payment.amount,

              failure_reason:
                payment.failure_reason,

              ai_decision:
                action,

              ai_reason:
                reason,

              ai_confidence:
                confidence,

              ai_risk_level:
                riskLevel,

              policy_allowed:
                false,

              policy_reason:
                policy.reason,

              action_executed:
                "BLOCKED",

              result: {

                success:
                  false,

                status:
                  "POLICY_BLOCKED"

              }

            });


            results.push({

              payment_id:
                payment.payment_id,

              action_executed:
                "BLOCKED",

              confidence:
                confidence,

              risk_level:
                riskLevel,

              reason:
                reason,

              result: {

                success:
                  false,

                status:
                  "POLICY_BLOCKED"

              }

            });


            continue;

          }


          // ==========================================
          // EXECUTE RECOVERY TOOL
          // ==========================================

          const toolResult =
            await executeRecoveryTool(
              action,
              payment,
              args
            );


          // ==========================================
          // UPDATE PAYMENT DATA
          // ==========================================

          payments =
            getPayments();


          const paymentIndex =
            payments.findIndex(
              (item) =>
                item.payment_id ===
                payment.payment_id
            );


          if (
            paymentIndex !== -1
          ) {

            payments[
              paymentIndex
            ] = toolResult.payment;

            savePayments(
              payments
            );

          }


          // ==========================================
          // RECORD BATCH RESULT
          // ==========================================

          if (
            toolResult.success &&
            Number(
              toolResult.recoveredAmount
            ) > 0
          ) {

            recordRecovery(
              payment.payment_id,
              toolResult.recoveredAmount
            );

          } else if (
            action ===
            "requestHumanReview"
          ) {

            recordHumanReview(
              payment.payment_id,
              payment.amount
            );

          } else if (
            action ===
            "stopRecovery"
          ) {

            recordStoppedRecovery(
              payment.payment_id,
              payment.amount
            );

          } else if (
            !toolResult.success
          ) {

            recordFailedRecovery(
              payment.payment_id,
              payment.amount
            );

          }


          // ==========================================
          // AUDIT
          // ==========================================

          logAction({

            payment_id:
              payment.payment_id,

            customer_id:
              payment.customer_id,

            amount:
              payment.amount,

            failure_reason:
              payment.failure_reason,

            ai_decision:
              action,

            ai_reason:
              reason,

            ai_confidence:
              confidence,

            ai_risk_level:
              riskLevel,

            policy_allowed:
              true,

            policy_reason:
              policy.reason,

            action_executed:
              action,

            result:
              toolResult

          });


          // ==========================================
          // STORE RESULT
          // ==========================================

          results.push({

            payment_id:
              payment.payment_id,

            action_executed:
              action,

            confidence:
              confidence,

            risk_level:
              riskLevel,

            reason:
              reason,

            result:
              toolResult

          });


        } catch (paymentError) {

          // ==========================================
          // INDIVIDUAL PAYMENT ERROR
          // ==========================================

          console.error(

            `Failed processing ${payment.payment_id}:`,
            paymentError

          );


          try {

            recordFailedRecovery(
              payment.payment_id,
              payment.amount
            );

          } catch (
            batchError
          ) {

            console.error(
              "Failed to record batch error:",
              batchError
            );

          }


          logAction({

            payment_id:
              payment.payment_id,

            customer_id:
              payment.customer_id,

            amount:
              payment.amount,

            failure_reason:
              payment.failure_reason,

            ai_decision:
              "PROCESSING_ERROR",

            ai_reason:
              paymentError.message,

            ai_confidence:
              null,

            ai_risk_level:
              "HIGH",

            policy_allowed:
              false,

            policy_reason:
              "Payment processing failed.",

            action_executed:
              "ERROR",

            result: {

              success:
                false,

              status:
                "PROCESSING_ERROR",

              error:
                paymentError.message

            }

          });


          results.push({

            payment_id:
              payment.payment_id,

            action_executed:
              "ERROR",

            confidence:
              null,

            risk_level:
              "HIGH",

            reason:
              paymentError.message,

            result: {

              success:
                false,

              status:
                "PROCESSING_ERROR",

              error:
                paymentError.message

            }

          });

        }

      }


      // ------------------------------------------------
      // FINAL METRICS
      // ------------------------------------------------

      const metrics =
        getBatchMetrics();


      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      return res.json({

        success:
          true,

        message:
          "AI recovery batch completed.",

        processed:
          recoverablePayments.length,

        results:
          results,

        metrics:
          metrics

      });


    } catch (error) {

      console.error(
        "Batch recovery error:",
        error
      );


      return res.status(500).json({

        error:
          "Failed to run recovery batch.",

        details:
          error.message

      });

    }

  }
);


// ======================================================
// RESET DEMO
// ======================================================

router.post(
  "/reset",
  (req, res) => {

    try {

      const payments =
        getPayments();


      // ------------------------------------------------
      // RESTORE ORIGINAL PAYMENT STATE
      // ------------------------------------------------

      payments.forEach(
        (payment) => {

          payment.status =
            payment.original_status;

          payment.failure_reason =
            payment.original_failure_reason;

          payment.retry_count =
            payment.original_retry_count;

          payment.reminder_count =
            payment.original_reminder_count;

          payment.recovered_by_ai =
            false;

        }
      );


      savePayments(
        payments
      );


      // ------------------------------------------------
      // FAILED PAYMENTS
      // ------------------------------------------------

      const failedPayments =
        payments.filter(
          (payment) =>
            payment.status ===
            "FAILED"
        );


      // ------------------------------------------------
      // REVENUE AT RISK
      // ------------------------------------------------

      const totalRevenueAtRisk =
        failedPayments.reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount
            ),
          0
        );


      // ------------------------------------------------
      // RECOVERABLE PAYMENTS
      // ------------------------------------------------

      const recoverablePayments =
        failedPayments.filter(
          (payment) =>

            payment.retry_count < 2 ||
            payment.reminder_count < 3
        );


      // ------------------------------------------------
      // RECOVERABLE REVENUE
      // ------------------------------------------------

      const recoverableRevenue =
        recoverablePayments.reduce(
          (
            total,
            payment
          ) =>
            total +
            Number(
              payment.amount
            ),
          0
        );


      // ------------------------------------------------
      // CREATE NEW BATCH
      // ------------------------------------------------

      const newBatch = {

        batch_id:
          `BATCH-${Date.now()}`,

        created_at:
          new Date().toISOString(),

        total_revenue_at_risk:
          totalRevenueAtRisk,

        total_recoverable_revenue:
          recoverableRevenue,

        total_recoverable_payments:
          recoverablePayments.length,

        recovered_revenue:
          0,

        remaining_revenue:
          recoverableRevenue,

        recovered_payments:
          [],

        human_review_payments:
          [],

        stopped_payments:
          [],

        failed_payments:
          [],

        status:
          "ACTIVE"

      };


      saveBatch(
        newBatch
      );


      // ------------------------------------------------
      // CLEAR AUDIT LOG
      // ------------------------------------------------

      const auditPath =
        path.join(
          __dirname,
          "../../data/audit.json"
        );


      fs.writeFileSync(
        auditPath,
        JSON.stringify(
          [],
          null,
          2
        )
      );


      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      return res.json({

        success:
          true,

        message:
          "Demo successfully reset.",

        metrics: {

          revenue_at_risk:
            totalRevenueAtRisk,

          recoverable_revenue:
            recoverableRevenue,

          total_recoverable_payments:
            recoverablePayments.length,

          recovered_revenue:
            0,

          remaining_revenue:
            recoverableRevenue,

          recovery_rate:
            "0.00%",

          human_review_count:
            0,

          human_review_revenue:
            0,

          stopped_count:
            0,

          stopped_revenue:
            0,

          failed_count:
            0,

          failed_recovery_revenue:
            0

        }

      });


    } catch (error) {

      console.error(
        "Reset error:",
        error
      );


      return res.status(500).json({

        error:
          "Failed to reset demo.",

        details:
          error.message

      });

    }

  }
);


// ======================================================
// AUDIT TRAIL
// ======================================================

router.get(
  "/audit",
  (req, res) => {

    try {

      const logs =
        getAuditLogs();


      res.json(
        logs
      );

    } catch (error) {

      console.error(
        "Audit error:",
        error
      );


      res.status(500).json({

        error:
          "Failed to load audit trail."

      });

    }

  }
);


// ======================================================
// METRICS
// ======================================================

router.get(
  "/metrics",
  (req, res) => {

    try {

      const batch =
        getBatch();


      if (!batch) {

        return res.status(404).json({

          error:
            "Recovery batch not found."

        });

      }


      const metrics =
        getBatchMetrics();


      res.json({

        // --------------------------------------------
        // MONEY
        // --------------------------------------------

        revenue_at_risk:
          metrics.total_revenue_at_risk,

        recoverable_revenue:
          metrics.total_recoverable_revenue,

        revenue_recovered:
          metrics.recovered_revenue,

        remaining_revenue_at_risk:
          metrics.remaining_revenue,

        recovery_rate:
          metrics.recovery_rate,


        // --------------------------------------------
        // PAYMENT COUNTS
        // --------------------------------------------

        recoverable_payments:
          metrics.total_recoverable_payments,

        recovered_payments:
          metrics.recovered_payment_count,

        human_review_count:
          metrics.human_review_count,

        stopped_count:
          metrics.stopped_count,

        failed_count:
          metrics.failed_count,


        // --------------------------------------------
        // HUMAN REVIEW
        // --------------------------------------------

        human_review_revenue:
          metrics.human_review_revenue,


        // --------------------------------------------
        // STOPPED
        // --------------------------------------------

        stopped_revenue:
          metrics.stopped_revenue,


        // --------------------------------------------
        // FAILED
        // --------------------------------------------

        failed_recovery_revenue:
          metrics.failed_recovery_revenue,


        // --------------------------------------------
        // BATCH
        // --------------------------------------------

        batch_id:
          metrics.batch_id,

        batch_status:
          metrics.status

      });

    } catch (error) {

      console.error(
        "Metrics error:",
        error
      );


      res.status(500).json({

        error:
          "Failed to load recovery metrics."

      });

    }

  }
);


// ======================================================
// EXPORT ROUTER
// ======================================================
// ======================================================
// BATCH EVALUATION
// ======================================================

router.get(
  "/evaluation",
  (req, res) => {

    try {

      const evaluation =
        evaluateBatch();


      if (
        !evaluation.success
      ) {

        return res.status(404).json(
          evaluation
        );

      }


      return res.json(
        evaluation
      );

    } catch (error) {

      console.error(
        "Evaluation error:",
        error
      );


      return res.status(500).json({

        error:
          "Failed to evaluate recovery batch.",

        details:
          error.message

      });

    }

  }
);
// ======================================================
// AUDIT SUMMARY
// ======================================================

router.get(
  "/audit/summary",
  (req, res) => {

    try {

      const summary =
        getAuditSummary();

      return res.json(
        summary
      );

    } catch (error) {

      console.error(
        "Audit summary error:",
        error
      );

      return res.status(500).json({

        error:
          "Failed to generate audit summary."

      });

    }

  }
);
module.exports = router;