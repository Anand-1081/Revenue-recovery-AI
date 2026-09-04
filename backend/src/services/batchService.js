const fs = require("fs");
const path = require("path");

const batchPath = path.join(
  __dirname,
  "../../data/recoveryBatch.json"
);


// ======================================================
// GET BATCH
// ======================================================

function getBatch() {

  if (!fs.existsSync(batchPath)) {
    return null;
  }

  return JSON.parse(
    fs.readFileSync(
      batchPath,
      "utf-8"
    )
  );
}


// ======================================================
// SAVE BATCH
// ======================================================

function saveBatch(
  batch
) {

  fs.writeFileSync(
    batchPath,
    JSON.stringify(
      batch,
      null,
      2
    )
  );

}


// ======================================================
// RECORD SUCCESSFUL RECOVERY
// ======================================================

function recordRecovery(
  paymentId,
  amount
) {

  const batch =
    getBatch();

  if (!batch) {
    return null;
  }


  // Prevent duplicate revenue counting.

  const alreadyRecovered =
    batch.recovered_payments.some(
      (item) =>
        item.payment_id ===
        paymentId
    );


  if (
    alreadyRecovered
  ) {

    return batch;

  }


  batch.recovered_revenue +=
    Number(amount);


  batch.recovered_payments.push({

    payment_id:
      paymentId,

    amount:
      Number(amount),

    recovered_at:
      new Date().toISOString()

  });


  updateBatchStatus(
    batch
  );


  saveBatch(
    batch
  );


  return batch;
}


// ======================================================
// RECORD HUMAN REVIEW
// ======================================================

function recordHumanReview(
  paymentId,
  amount
) {

  const batch =
    getBatch();

  if (!batch) {
    return null;
  }


  const alreadyAdded =
    batch.human_review_payments.some(
      (item) =>
        item.payment_id ===
        paymentId
    );


  if (
    alreadyAdded
  ) {

    return batch;

  }


  batch.human_review_payments.push({

    payment_id:
      paymentId,

    amount:
      Number(amount),

    created_at:
      new Date().toISOString()

  });


  updateBatchStatus(
    batch
  );


  saveBatch(
    batch
  );


  return batch;
}


// ======================================================
// RECORD STOPPED RECOVERY
// ======================================================

function recordStoppedRecovery(
  paymentId,
  amount
) {

  const batch =
    getBatch();

  if (!batch) {
    return null;
  }


  const alreadyAdded =
    batch.stopped_payments.some(
      (item) =>
        item.payment_id ===
        paymentId
    );


  if (
    alreadyAdded
  ) {

    return batch;

  }


  batch.stopped_payments.push({

    payment_id:
      paymentId,

    amount:
      Number(amount),

    stopped_at:
      new Date().toISOString()

  });


  updateBatchStatus(
    batch
  );


  saveBatch(
    batch
  );


  return batch;
}


// ======================================================
// RECORD FAILED RECOVERY
// ======================================================

function recordFailedRecovery(
  paymentId,
  amount
) {

  const batch =
    getBatch();

  if (!batch) {
    return null;
  }


  const alreadyAdded =
    batch.failed_payments.some(
      (item) =>
        item.payment_id ===
        paymentId
    );


  if (
    alreadyAdded
  ) {

    return batch;

  }


  batch.failed_payments.push({

    payment_id:
      paymentId,

    amount:
      Number(amount),

    failed_at:
      new Date().toISOString()

  });


  updateBatchStatus(
    batch
  );


  saveBatch(
    batch
  );


  return batch;
}


// ======================================================
// UPDATE BATCH STATUS
// ======================================================

function updateBatchStatus(
  batch
) {

  const recovered =
    Number(
      batch.recovered_revenue || 0
    );


  const recoverable =
    Number(
      batch.total_recoverable_revenue || 0
    );


  batch.remaining_revenue =
    Math.max(
      recoverable -
        recovered,
      0
    );


  // ----------------------------------------------
  // ALL RECOVERABLE REVENUE RECOVERED
  // ----------------------------------------------

  if (
    batch.remaining_revenue ===
    0
  ) {

    batch.status =
      "COMPLETED";

    return;

  }


  // ----------------------------------------------
  // CHECK WHETHER THERE ARE STILL PAYMENTS
  // THAT CAN BE AUTOMATICALLY PROCESSED
  // ----------------------------------------------

  const recoveredCount =
    batch.recovered_payments.length;

  const humanReviewCount =
    batch.human_review_payments.length;

  const stoppedCount =
    batch.stopped_payments.length;

  const failedCount =
    batch.failed_payments.length;


  const terminalCount =
    recoveredCount +
    humanReviewCount +
    stoppedCount +
    failedCount;


  const totalRecoverablePayments =
    Number(
      batch.total_recoverable_payments ||
      0
    );


  // ----------------------------------------------
  // EVERYTHING HAS BEEN PROCESSED
  // ----------------------------------------------

  if (
    totalRecoverablePayments > 0 &&
    terminalCount >=
      totalRecoverablePayments
  ) {

    batch.status =
      "COMPLETED_WITH_UNRECOVERED";

    return;

  }


  batch.status =
    "ACTIVE";
}


// ======================================================
// GET BATCH METRICS
// ======================================================

function getBatchMetrics() {

  const batch =
    getBatch();

  if (!batch) {
    return null;
  }


  const recoverableRevenue =
    Number(
      batch.total_recoverable_revenue ||
      0
    );


  const recoveredRevenue =
    Number(
      batch.recovered_revenue ||
      0
    );


  const recoveryRate =
    recoverableRevenue > 0
      ? (
          (
            recoveredRevenue /
            recoverableRevenue
          ) *
          100
        ).toFixed(2)
      : "0.00";


  const humanReviewRevenue =
    (
      batch.human_review_payments ||
      []
    ).reduce(
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


  const stoppedRevenue =
    (
      batch.stopped_payments ||
      []
    ).reduce(
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


  const failedRecoveryRevenue =
    (
      batch.failed_payments ||
      []
    ).reduce(
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


  return {

    batch_id:
      batch.batch_id,

    total_revenue_at_risk:
      Number(
        batch.total_revenue_at_risk ||
        0
      ),

    total_recoverable_revenue:
      recoverableRevenue,

    recovered_revenue:
      recoveredRevenue,

    remaining_revenue:
      Number(
        batch.remaining_revenue ||
        0
      ),

    recovery_rate:
      `${recoveryRate}%`,

    recovered_payments:
      batch.recovered_payments ||
      [],

    recovered_payment_count:
      (
        batch.recovered_payments ||
        []
      ).length,

    human_review_payments:
      batch.human_review_payments ||
      [],

    human_review_count:
      (
        batch.human_review_payments ||
        []
      ).length,

    human_review_revenue:
      humanReviewRevenue,

    stopped_payments:
      batch.stopped_payments ||
      [],

    stopped_count:
      (
        batch.stopped_payments ||
        []
      ).length,

    stopped_revenue:
      stoppedRevenue,

    failed_payments:
      batch.failed_payments ||
      [],

    failed_count:
      (
        batch.failed_payments ||
        []
      ).length,

    failed_recovery_revenue:
      failedRecoveryRevenue,

    status:
      batch.status

  };
}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

  getBatch,

  saveBatch,

  recordRecovery,

  recordHumanReview,

  recordStoppedRecovery,

  recordFailedRecovery,

  getBatchMetrics

};