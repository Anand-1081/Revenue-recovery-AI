// ======================================================
// RECOVERAI POLICY ENGINE
// ======================================================
//
// Gemini recommends an action.
// This file decides whether that action is actually allowed.
//
// AI = reasoning
// Policy Engine = safety
// Recovery Tool = execution
//
// ======================================================


// ======================================================
// CONSTANTS
// ======================================================

const MAX_RETRIES = 2;
const MAX_REMINDERS = 3;


// Payments above this amount require more caution.
// We do not automatically block them, but we can prevent
// aggressive automated recovery in uncertain situations.
const HIGH_VALUE_THRESHOLD = 4000;


// ======================================================
// VALIDATE RECOVERY ACTION
// ======================================================

function validateAction(
  payment,
  action
) {

  // ----------------------------------------------------
  // BASIC PAYMENT VALIDATION
  // ----------------------------------------------------

  if (!payment) {

    return {
      allowed: false,
      reason:
        "Payment data is missing."
    };

  }


  if (!payment.payment_id) {

    return {
      allowed: false,
      reason:
        "Payment ID is missing."
    };

  }


  // ----------------------------------------------------
  // ONLY FAILED PAYMENTS CAN ENTER RECOVERY
  // ----------------------------------------------------

  if (
    payment.status !==
    "FAILED"
  ) {

    return {
      allowed: false,
      reason:
        "Only failed payments can enter recovery."
    };

  }


  // ----------------------------------------------------
  // RETRY PAYMENT
  // ----------------------------------------------------

  if (
    action ===
    "retryPayment"
  ) {

    // Never retry a payment that has already
    // reached the maximum retry count.

    if (
      payment.retry_count >=
      MAX_RETRIES
    ) {

      return {
        allowed: false,
        reason:
          `Retry blocked. Maximum of ${MAX_RETRIES} retries reached.`
      };

    }


    // Make sure the failure is something for which
    // an automated retry can reasonably be considered.

    const retryableFailures = [
      "INSUFFICIENT_FUNDS",
      "BANK_DECLINED",
      "TIMEOUT"
    ];


    if (
      !retryableFailures.includes(
        payment.failure_reason
      )
    ) {

      return {
        allowed: false,
        reason:
          "This failure type is not approved for automated retry."
      };

    }


    // Unknown failures should never be blindly retried.

    if (
      payment.failure_reason ===
      "UNKNOWN"
    ) {

      return {
        allowed: false,
        reason:
          "Unknown failures require human review instead of automatic retry."
      };

    }


    // ------------------------------------------------
    // HIGH VALUE + WEAK HISTORY
    // ------------------------------------------------

    if (
      Number(payment.amount) >=
        HIGH_VALUE_THRESHOLD &&
      Number(
        payment.previous_successful_payments
      ) <= 1
    ) {

      return {
        allowed: false,
        reason:
          "High-value payment with limited customer history requires human review."
      };

    }


    return {
      allowed: true,
      reason:
        `Retry ${payment.retry_count + 1} of ${MAX_RETRIES} is permitted.`
    };

  }


  // ----------------------------------------------------
  // RECOVERY REMINDER
  // ----------------------------------------------------

  if (
    action ===
    "sendRecoveryReminder"
  ) {

    if (
      payment.reminder_count >=
      MAX_REMINDERS
    ) {

      return {
        allowed: false,
        reason:
          `Reminder blocked. Maximum of ${MAX_REMINDERS} reminders reached.`
      };

    }


    // A reminder is safer than another retry when
    // retry attempts have already been used.

    if (
      payment.retry_count >=
      MAX_RETRIES
    ) {

      return {
        allowed: true,
        reason:
          "Retry limit reached. Recovery reminder is permitted as the next recovery step."
      };

    }


    return {
      allowed: true,
      reason:
        `Recovery reminder ${payment.reminder_count + 1} of ${MAX_REMINDERS} is permitted.`
    };

  }


  // ----------------------------------------------------
  // HUMAN REVIEW
  // ----------------------------------------------------

  if (
    action ===
    "requestHumanReview"
  ) {

    return {
      allowed: true,
      reason:
        "Human review is always permitted when automated recovery is uncertain."
    };

  }


  // ----------------------------------------------------
  // STOP RECOVERY
  // ----------------------------------------------------

  if (
    action ===
    "stopRecovery"
  ) {

    return {
      allowed: true,
      reason:
        "Recovery can be safely stopped."
    };

  }


  // ----------------------------------------------------
  // UNKNOWN ACTION
  // ----------------------------------------------------

  return {
    allowed: false,
    reason:
      "Unknown recovery action."
  };

}


// ======================================================
// CHECK WHETHER PAYMENT IS STILL RECOVERABLE
// ======================================================

function isRecoverable(
  payment
) {

  if (!payment) {
    return false;
  }


  if (
    payment.status !==
    "FAILED"
  ) {

    return false;

  }


  const retryAvailable =
    payment.retry_count <
    MAX_RETRIES;


  const reminderAvailable =
    payment.reminder_count <
    MAX_REMINDERS;


  return (
    retryAvailable ||
    reminderAvailable
  );

}


// ======================================================
// GET RECOVERY STAGE
// ======================================================

function getRecoveryStage(
  payment
) {

  if (!payment) {
    return "UNKNOWN";
  }


  if (
    payment.retry_count <
    MAX_RETRIES
  ) {

    return "INITIAL_RETRY";

  }


  if (
    payment.reminder_count <
    MAX_REMINDERS
  ) {

    return "RECOVERY_REMINDER";

  }


  return "FINAL_REVIEW";

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  validateAction,

  isRecoverable,

  getRecoveryStage,

  MAX_RETRIES,

  MAX_REMINDERS

};