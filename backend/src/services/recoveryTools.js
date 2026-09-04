const fs = require("fs");
const path = require("path");

const paymentsPath = path.join(
  __dirname,
  "../../data/payments.json"
);


// ======================================================
// PAYMENT DATA
// ======================================================

function getPayments() {
  return JSON.parse(
    fs.readFileSync(
      paymentsPath,
      "utf-8"
    )
  );
}


function savePayments(payments) {
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
// RETRY PAYMENT
// ======================================================

function retryPayment(payment) {

  console.log(
    `Retrying payment ${payment.payment_id}`
  );

  const payments = getPayments();

  const currentPayment =
    payments.find(
      (p) =>
        p.payment_id ===
        payment.payment_id
    );


  if (!currentPayment) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason: "Payment not found"
    };
  }


  if (
    currentPayment.status !==
    "FAILED"
  ) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason:
        "Payment is not in failed state."
    };
  }


  if (
    currentPayment.retry_count >= 2
  ) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason:
        "Maximum retry limit reached."
    };
  }


  // Increase retry count
  currentPayment.retry_count += 1;


  // ------------------------------------------
  // SIMULATED OUTCOME
  // ------------------------------------------

  const outcome =
    currentPayment.simulation_outcome;


  if (
    outcome ===
    "SUCCESS_ON_RETRY"
  ) {

    currentPayment.status =
      "SUCCESS";

    currentPayment.failure_reason =
      null;

    currentPayment.recovered_by_ai =
      true;

    savePayments(payments);


    return {
      success: true,
      status: "SUCCESS",
      recovered_amount:
        currentPayment.amount,
      payment:
        currentPayment,
      reason:
        "Payment successfully recovered on retry."
    };
  }


  savePayments(payments);


  return {
    success: false,
    status: "FAILED",
    recovered_amount: 0,
    payment:
      currentPayment,
    reason:
      "Payment retry did not succeed."
  };
}


// ======================================================
// SEND RECOVERY REMINDER
// ======================================================

function sendRecoveryReminder(payment) {

  console.log(
    `Sending recovery reminder for ${payment.payment_id}`
  );

  const payments = getPayments();

  const currentPayment =
    payments.find(
      (p) =>
        p.payment_id ===
        payment.payment_id
    );


  if (!currentPayment) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason: "Payment not found"
    };
  }


  if (
    currentPayment.status !==
    "FAILED"
  ) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason:
        "Payment is not in failed state."
    };
  }


  if (
    currentPayment.reminder_count >= 3
  ) {
    return {
      success: false,
      status: "FAILED",
      recovered_amount: 0,
      reason:
        "Maximum reminder limit reached."
    };
  }


  // Increase reminder count
  currentPayment.reminder_count += 1;


  // ------------------------------------------
  // SIMULATED OUTCOME
  // ------------------------------------------

  const outcome =
    currentPayment.simulation_outcome;


  if (
    outcome ===
    "SUCCESS_AFTER_REMINDER"
  ) {

    currentPayment.status =
      "SUCCESS";

    currentPayment.failure_reason =
      null;

    currentPayment.recovered_by_ai =
      true;

    savePayments(payments);


    return {
      success: true,
      status: "SUCCESS",
      recovered_amount:
        currentPayment.amount,
      payment:
        currentPayment,
      reason:
        "Customer completed payment after recovery reminder."
    };
  }


  savePayments(payments);


  return {
    success: true,
    status: "REMINDER_SENT",
    recovered_amount: 0,
    payment:
      currentPayment,
    reason:
      "Recovery reminder sent successfully."
  };
}


// ======================================================
// HUMAN REVIEW
// ======================================================

function requestHumanReview(
  payment,
  reason
) {

  console.log(
    `Human review requested for ${payment.payment_id}`
  );


  return {
    success: true,
    status: "HUMAN_REVIEW",
    recovered_amount: 0,
    reason:
      reason ||
      "Automated recovery requires human review."
  };
}


// ======================================================
// STOP RECOVERY
// ======================================================

function stopRecovery(
  payment,
  reason
) {

  console.log(
    `Stopping recovery for ${payment.payment_id}`
  );


  return {
    success: true,
    status: "RECOVERY_STOPPED",
    recovered_amount: 0,
    reason:
      reason ||
      "Recovery stopped safely."
  };
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  retryPayment,
  sendRecoveryReminder,
  requestHumanReview,
  stopRecovery
};