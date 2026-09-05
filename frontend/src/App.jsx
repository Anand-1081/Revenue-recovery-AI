import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [metrics, setMetrics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedPayment, setSelectedPayment] =
    useState(null);

  // ==================================================
  // LOAD DASHBOARD
  // ==================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [
        metricsResponse,
        paymentsResponse,
        auditResponse
      ] = await Promise.all([
        fetch(`${API}/api/recovery/metrics`),
        fetch(`${API}/api/recovery/at-risk`),
        fetch(`${API}/api/recovery/audit`)
      ]);

      const metricsData =
        await metricsResponse.json();

      const paymentsData =
        await paymentsResponse.json();

      const auditData =
        await auditResponse.json();

      setMetrics(metricsData);

      setPayments(
        paymentsData.payments || []
      );

      setAuditLogs(
        Array.isArray(auditData)
          ? auditData
          : []
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  // ==================================================
  // RECOVER SINGLE PAYMENT
  // ==================================================

  const recoverPayment = async (
    paymentId
  ) => {

    try {

      setRecovering(true);
      setResult(null);

      const response =
        await fetch(
          `${API}/api/recovery/analyze/${paymentId}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Recovery failed"
        );
      }

      setResult(data);

      await loadDashboard();

    } catch (error) {

      console.error(
        "Recovery error:",
        error
      );

      setResult({
        error:
          error.message
      });

    } finally {

      setRecovering(false);

    }
  };


  // ==================================================
  // RUN BATCH RECOVERY
  // ==================================================

  const runBatchRecovery = async () => {

    try {

      setRecovering(true);
      setResult(null);

      const response =
        await fetch(
          `${API}/api/recovery/run-batch`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Batch recovery failed"
        );

      }

      setResult(data);

      await loadDashboard();

    } catch (error) {

      console.error(
        "Batch recovery error:",
        error
      );

      setResult({
        error:
          error.message
      });

    } finally {

      setRecovering(false);

    }
  };


  // ==================================================
  // RESET DEMO
  // ==================================================

  const resetDemo = async () => {

    try {

      setRecovering(true);
      setResult(null);

      const response =
        await fetch(
          `${API}/api/recovery/reset`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Reset failed"
        );

      }

      await loadDashboard();

      setResult({
        reset: true,
        message:
          "Demo successfully reset.",
        metrics:
          data.metrics
      });

    } catch (error) {

      console.error(
        "Reset error:",
        error
      );

      setResult({
        error:
          error.message
      });

    } finally {

      setRecovering(false);

    }
  };


  // ==================================================
  // FORMAT CURRENCY
  // ==================================================

  const formatCurrency = (
    amount = 0
  ) => {

    return `₹${Number(
      amount
    ).toLocaleString("en-IN")}`;

  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  // ==================================================
  // ACTION LABEL
  // ==================================================

  const getActionLabel = (
    action
  ) => {

    const labels = {

      retryPayment:
        "Retry Payment",

      sendRecoveryReminder:
        "Recovery Reminder",

      requestHumanReview:
        "Human Review",

      stopRecovery:
        "Recovery Stopped"

    };

    return (
      labels[action] ||
      action ||
      "No Action"
    );

  };


  // ==================================================
  // RECOVERY STAGE
  // ==================================================

  const getStageLabel = (
    stage
  ) => {

    const labels = {

      INITIAL_RETRY:
        "Initial recovery",

      RECOVERY_REMINDER:
        "Reminder stage",

      FINAL_REVIEW:
        "Final review"

    };

    return (
      labels[stage] ||
      "Recovery"
    );

  };


  // ==================================================
  // CONFIDENCE FORMAT
  // ==================================================

  const formatConfidence = (
    confidence
  ) => {

    if (
      confidence === null ||
      confidence === undefined
    ) {
      return "—";
    }

    return `${Math.round(
      Number(confidence) * 100
    )}%`;

  };


  // ==================================================
  // RISK CLASS
  // ==================================================

  const getRiskClass = (
    risk
  ) => {

    if (!risk) {
      return "risk-unknown";
    }

    return `risk-${String(
      risk
    ).toLowerCase()}`;

  };


  // ==================================================
  // RISK LABEL
  // ==================================================

  const getRiskLabel = (
    risk
  ) => {

    if (!risk) {
      return "Unknown Risk";
    }

    return `${risk} RISK`;

  };


  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {

    return (

      <div className="loading-screen">

        <div className="loading-card">

          <div className="logo-mark">
            R
          </div>

          <div className="loader"></div>

          <h2>
            Loading RecoverAI
          </h2>

          <p>
            Preparing your revenue
            recovery dashboard...
          </p>

        </div>

      </div>

    );

  }


  // ==================================================
  // MAIN UI
  // ==================================================

  return (

    <div className="app">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            R
          </div>

          <div>

            <h2>
              Recover<span>AI</span>
            </h2>

            <p>
              Revenue Intelligence
            </p>

          </div>

        </div>


        <nav className="navigation">

          <button className="nav-item active">

            <span className="nav-icon">
              ▦
            </span>

            Overview

          </button>


          <button className="nav-item">

            <span className="nav-icon">
              ₹
            </span>

            Revenue Recovery

          </button>


          <button className="nav-item">

            <span className="nav-icon">
              ◷
            </span>

            Activity

          </button>

        </nav>


        <div className="sidebar-bottom">

          <div className="ai-status">

            <div className="status-dot"></div>

            <div>

              <strong>
                AI Agent Online
              </strong>

              <span>
                Monitoring payments
              </span>

            </div>

          </div>


          <div className="version">
            RecoverAI v1.0
          </div>

        </div>

      </aside>


      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="main">

        {/* ==================================================
            TOPBAR
        ================================================== */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              REVENUE OPERATIONS
            </p>

            <h1>
              Recovery Overview
            </h1>

            <p className="subtitle">
              Monitor at-risk revenue and let
              AI recover eligible payments.
            </p>

          </div>


          <div className="topbar-actions">

            <button
              className="secondary-btn"
              onClick={resetDemo}
              disabled={recovering}
            >
              ↻ Reset Demo
            </button>


            <button
              className="primary-btn"
              onClick={runBatchRecovery}
              disabled={
                recovering ||
                metrics?.batch_status ===
                  "COMPLETED"
              }
            >

              <span className="button-icon">
                ✦
              </span>

              {recovering
                ? "AI is recovering..."
                : metrics?.batch_status ===
                  "COMPLETED"
                ? "✓ Batch Completed"
                : "Run AI Recovery"}

            </button>

          </div>

        </header>


        {/* ==================================================
            KPI CARDS
        ================================================== */}

        <section className="metrics-grid">

          <div className="metric-card">

            <div className="metric-top">

              <span>
                Revenue at Risk
              </span>

              <div className="metric-icon danger">
                ₹
              </div>

            </div>

            <strong>
              {formatCurrency(
                metrics?.revenue_at_risk
              )}
            </strong>

            <p>
              Failed payment value
            </p>

          </div>


          <div className="metric-card">

            <div className="metric-top">

              <span>
                Recoverable Revenue
              </span>

              <div className="metric-icon">
                ◈
              </div>

            </div>

            <strong>
              {formatCurrency(
                metrics?.recoverable_revenue
              )}
            </strong>

            <p>
              Eligible for recovery
            </p>

          </div>


          <div className="metric-card success-card">

            <div className="metric-top">

              <span>
                Revenue Recovered
              </span>

              <div className="metric-icon success">
                ✓
              </div>

            </div>

            <strong>
              {formatCurrency(
                metrics?.revenue_recovered
              )}
            </strong>

            <p>
              Successfully recovered
            </p>

          </div>


          <div className="metric-card">

            <div className="metric-top">

              <span>
                Recovery Rate
              </span>

              <div className="metric-icon">
                %
              </div>

            </div>

            <strong>
              {metrics?.recovery_rate ||
                "0.00%"}
            </strong>

            <p>
              Batch recovery performance
            </p>

          </div>

        </section>


        {/* ==================================================
            BATCH PANEL
        ================================================== */}

        <section className="batch-panel">

          <div className="batch-heading">

            <div>

              <div className="section-label">
                RECOVERY BATCH
              </div>

              <h2>
                {metrics?.batch_id ||
                  "BATCH-001"}
              </h2>

            </div>


            <span className="batch-badge">

              <span></span>

              {metrics?.batch_status ||
                "ACTIVE"}

            </span>

          </div>


          <div className="batch-stats">

            <div>

              <span>
                Remaining Revenue
              </span>

              <strong>
                {formatCurrency(
                  metrics?.remaining_revenue_at_risk
                )}
              </strong>

            </div>


            <div>

              <span>
                Payments Recovered
              </span>

              <strong>
                {metrics?.recovered_payments ||
                  0}
              </strong>

            </div>


            <div>

              <span>
                Batch Progress
              </span>

              <div className="progress-wrapper">

                <div className="progress-bar">

                  <div
                    style={{
                      width:
                        `${parseFloat(
                          metrics?.recovery_rate ||
                            "0"
                        )}%`
                    }}
                  ></div>

                </div>

                <span>
                  {metrics?.recovery_rate ||
                    "0.00%"}
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            AI DECISION CENTER
        ================================================== */}

        <section className="ai-center">

          <div className="ai-center-header">

            <div>

              <p className="section-label">
                INTELLIGENCE LAYER
              </p>

              <h2>
                AI Decision Center
              </h2>

              <p>
                RecoverAI evaluates the failure,
                customer history and recovery
                limits before taking action.
              </p>

            </div>


            <div className="ai-engine">

              <span className="ai-pulse"></span>

              Gemini Decision Engine

            </div>

          </div>


          {auditLogs.length === 0 ? (

            <div className="ai-empty">

              <div className="ai-empty-icon">
                ✦
              </div>

              <h3>
                Waiting for an AI decision
              </h3>

              <p>
                Run AI Recovery to see the
                agent's decisions here.
              </p>

            </div>

          ) : (

            <div className="decision-list">

              {[...auditLogs]
                .reverse()
                .slice(0, 5)
                .map(
                  (
                    log,
                    index
                  ) => (

                    <div
                      className="decision-card"
                      key={index}
                    >

                      {/* PAYMENT */}

                      <div className="decision-payment">

                        <div className="decision-icon">
                          ✦
                        </div>

                        <div>

                          <strong>
                            {log.payment_id}
                          </strong>

                          <span>
                            {formatCurrency(
                              log.amount
                            )}
                          </span>

                        </div>

                      </div>


                      {/* AI DECISION */}

                      <div className="decision-column">

                        <span className="decision-label">
                          AI DECISION
                        </span>

                        <strong>
                          {getActionLabel(
                            log.ai_decision
                          )}
                        </strong>

                      </div>


                      {/* REASONING */}

                      <div className="decision-reason">

                        <span className="decision-label">
                          REASONING
                        </span>

                        <p>
                          {log.ai_reason ||
                            "No reasoning recorded."}
                        </p>

                      </div>


                      {/* CONFIDENCE */}

                      <div className="decision-column">

                        <span className="decision-label">
                          CONFIDENCE
                        </span>

                        <div className="confidence-value">

                          <strong>
                            {formatConfidence(
                              log.ai_confidence
                            )}
                          </strong>

                          {log.ai_confidence !==
                            null &&
                            log.ai_confidence !==
                              undefined && (

                            <div className="confidence-bar">

                              <div
                                style={{
                                  width:
                                    `${Number(
                                      log.ai_confidence
                                    ) * 100}%`
                                }}
                              ></div>

                            </div>

                          )}

                        </div>

                      </div>


                      {/* RISK */}

                      <div className="decision-column">

                        <span className="decision-label">
                          RISK
                        </span>

                        <span
                          className={`risk-badge ${getRiskClass(
                            log.ai_risk_level
                          )}`}
                        >

                          {getRiskLabel(
                            log.ai_risk_level
                          )}

                        </span>

                      </div>


                      {/* POLICY */}

                      <div className="decision-column">

                        <span className="decision-label">
                          POLICY
                        </span>

                        <span
                          className={
                            log.policy_allowed
                              ? "policy-allowed"
                              : "policy-blocked"
                          }
                        >

                          {log.policy_allowed
                            ? "✓ Allowed"
                            : "× Blocked"}

                        </span>

                      </div>


                      {/* RESULT */}

                      <div className="decision-column">

                        <span className="decision-label">
                          RESULT
                        </span>

                        <span className="decision-result">

                          {log.result?.status ||
                            "—"}

                        </span>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </section>


        {/* ==================================================
            RESULT PANEL
        ================================================== */}

        {result && (

          <section className="result-panel">

            <div className="result-title">

              <div className="result-success-icon">

                {result.error
                  ? "!"
                  : "✓"}

              </div>


              <div>

                <p className="section-label">
                  RECOVERY RUN
                </p>

                <h2>

                  {result.error
                    ? "Recovery failed"
                    : result.message ||
                      "Recovery completed"}

                </h2>

              </div>


              <button
                className="close-result"
                onClick={() =>
                  setResult(null)
                }
              >
                ×
              </button>

            </div>


            {result.error ? (

              <div className="error-message">
                {result.error}
              </div>

            ) : (

              <>

                {/* ------------------------------------------
                    RESET RESULT
                ------------------------------------------ */}

                {result.reset &&
                  result.metrics && (

                    <div className="result-summary">

                      <div>

                        <span>
                          Batch
                        </span>

                        <strong>
                          Reset
                        </strong>

                      </div>


                      <div>

                        <span>
                          Revenue at Risk
                        </span>

                        <strong>
                          {formatCurrency(
                            result.metrics
                              .revenue_at_risk
                          )}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Recoverable
                        </span>

                        <strong>
                          {formatCurrency(
                            result.metrics
                              .recoverable_revenue
                          )}
                        </strong>

                      </div>

                    </div>

                  )}


                {/* ------------------------------------------
                    NORMAL RESULT METRICS
                ------------------------------------------ */}

                {!result.reset &&
                  result.metrics && (

                    <div className="result-summary">

                      <div>

                        <span>
                          Revenue Recovered
                        </span>

                        <strong>
                          {formatCurrency(
                            result.metrics
                              .recovered_revenue
                          )}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Recovery Rate
                        </span>

                        <strong>
                          {
                            result.metrics
                              .recovery_rate
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Remaining
                        </span>

                        <strong>
                          {formatCurrency(
                            result.metrics
                              .remaining_revenue
                          )}
                        </strong>

                      </div>

                    </div>

                  )}


                {/* ------------------------------------------
                    SINGLE PAYMENT AI RESULT
                ------------------------------------------ */}

                {result.ai_decision && (

                  <div className="single-ai-result">

                    <div>

                      <span>
                        AI Decision
                      </span>

                      <strong>
                        {getActionLabel(
                          result.ai_decision
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Confidence
                      </span>

                      <strong>
                        {formatConfidence(
                          result.confidence
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Risk
                      </span>

                      <span
                        className={`risk-badge ${getRiskClass(
                          result.risk_level
                        )}`}
                      >
                        {getRiskLabel(
                          result.risk_level
                        )}
                      </span>

                    </div>

                  </div>

                )}


                {/* ------------------------------------------
                    BATCH RESULTS
                ------------------------------------------ */}

                {result.results && (

                  <div className="batch-results">

                    <div className="table-header">

                      <span>
                        PAYMENT
                      </span>

                      <span>
                        AI ACTION
                      </span>

                      <span>
                        CONFIDENCE
                      </span>

                      <span>
                        RISK
                      </span>

                      <span>
                        RESULT
                      </span>

                    </div>


                    {result.results.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className="table-row"
                          key={
                            item.payment_id ||
                            index
                          }
                        >

                          <strong>
                            {
                              item.payment_id
                            }
                          </strong>


                          <span>
                            {getActionLabel(
                              item.action_executed
                            )}
                          </span>


                          <span>
                            {formatConfidence(
                              item.confidence
                            )}
                          </span>


                          <span>

                            <span
                              className={`risk-badge ${getRiskClass(
                                item.risk_level
                              )}`}
                            >
                              {getRiskLabel(
                                item.risk_level
                              )}
                            </span>

                          </span>


                          <span
                            className={
                              item.result
                                ?.success
                                ? "result-pill success"
                                : "result-pill"
                            }
                          >

                            {item.result
                              ?.status ||
                              item.status ||
                              "NO ACTION"}

                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </>

            )}

          </section>

        )}


        {/* ==================================================
            RECOVERABLE PAYMENTS
        ================================================== */}

        <section className="content-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                REVENUE AT RISK
              </p>

              <h2>
                Recoverable Payments
              </h2>

              <p>
                Failed payments eligible for
                automated recovery.
              </p>

            </div>


            <div className="payment-count">

              <strong>
                {payments.length}
              </strong>

              <span>
                eligible payments
              </span>

            </div>

          </div>


          {payments.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No recoverable payments
              </h3>

              <p>
                RecoverAI has processed all
                currently eligible payments.
              </p>

            </div>

          ) : (

            <div className="payment-table">

              <div className="payment-table-head">

                <span>
                  PAYMENT
                </span>

                <span>
                  CUSTOMER
                </span>

                <span>
                  FAILURE / STAGE
                </span>

                <span>
                  LIMITS
                </span>

                <span>
                  AMOUNT
                </span>

                <span>
                  ACTION
                </span>

              </div>


              {payments.map(
                (payment) => (

                  <div
                    className="payment-row"
                    key={
                      payment.payment_id
                    }
                  >

                    <div className="payment-reference">

                      <div className="payment-symbol">
                        ₹
                      </div>

                      <div>

                        <strong>
                          {payment.payment_id}
                        </strong>

                        <span>
                          {formatDate(
                            payment.created_at
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="customer-cell">

                      <strong>
                        {
                          payment.customer_id
                        }
                      </strong>

                      <span>
                        {
                          payment.previous_successful_payments
                        } previous successes
                      </span>

                    </div>


                    <div className="failure-cell">

                      <span className="failure-badge">
                        {
                          payment.failure_reason
                        }
                      </span>

                      <span className="recovery-stage">

                        {getStageLabel(
                          payment.recovery_stage
                        )}

                      </span>

                    </div>


                    <div className="limits">

                      <span>

                        Retry{" "}

                        <strong>
                          {
                            payment.retry_count
                          }
                          /2
                        </strong>

                      </span>


                      <span>

                        Reminder{" "}

                        <strong>
                          {
                            payment.reminder_count
                          }
                          /3
                        </strong>

                      </span>

                    </div>


                    <strong className="amount">

                      {formatCurrency(
                        payment.amount
                      )}

                    </strong>


                    <button
                      className="view-btn"
                      onClick={() =>
                        setSelectedPayment(
                          payment
                        )
                      }
                    >
                      View
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ==================================================
            AUDIT TRAIL
        ================================================== */}

        <section className="content-section">

          <div className="section-header">

            <div>

              <p className="section-label">
                TRANSPARENCY
              </p>

              <h2>
                Audit Trail
              </h2>

              <p>
                Every AI decision and recovery
                action is recorded.
              </p>

            </div>


            <div className="audit-count">

              {auditLogs.length} events

            </div>

          </div>


          {auditLogs.length === 0 ? (

            <div className="empty-state small">

              <p>
                No recovery actions have been
                executed yet.
              </p>

            </div>

          ) : (

            <div className="audit-list">

              {[...auditLogs]
                .reverse()
                .map(
                  (
                    log,
                    index
                  ) => (

                    <div
                      className="audit-row"
                      key={index}
                    >

                      <div className="audit-marker">
                        ✓
                      </div>


                      <div className="audit-content">

                        <div className="audit-top">

                          <div>

                            <strong>
                              {
                                log.payment_id
                              }
                            </strong>

                            <span>
                              {getActionLabel(
                                log.action_executed
                              )}
                            </span>

                          </div>


                          <time>
                            {formatDate(
                              log.timestamp
                            )}
                          </time>

                        </div>


                        <p>
                          {log.ai_reason ||
                            "No reason provided"}
                        </p>


                        <div className="audit-meta">

                          <span>

                            Amount:{" "}

                            <strong>
                              {formatCurrency(
                                log.amount
                              )}
                            </strong>

                          </span>


                          <span>

                            Confidence:{" "}

                            <strong>
                              {formatConfidence(
                                log.ai_confidence
                              )}
                            </strong>

                          </span>


                          <span>

                            Risk:{" "}

                            <strong
                              className={
                                getRiskClass(
                                  log.ai_risk_level
                                )
                              }
                            >
                              {log.ai_risk_level ||
                                "UNKNOWN"}
                            </strong>

                          </span>


                          <span>

                            Policy:{" "}

                            <strong>
                              {log.policy_allowed
                                ? "Allowed"
                                : "Blocked"}
                            </strong>

                          </span>

                        </div>

                      </div>

                    </div>

                  )
                )}

            </div>

          )}

        </section>

      </main>


      {/* ==================================================
          PAYMENT DRAWER
      ================================================== */}

      {selectedPayment && (

        <div
          className="drawer-overlay"
          onClick={() =>
            setSelectedPayment(null)
          }
        >

          <aside
            className="drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <p className="section-label">
                  PAYMENT DETAILS
                </p>

                <h2>
                  {
                    selectedPayment.payment_id
                  }
                </h2>

              </div>


              <button
                className="drawer-close"
                onClick={() =>
                  setSelectedPayment(null)
                }
              >
                ×
              </button>

            </div>


            <div className="drawer-amount">

              <span>
                Payment Amount
              </span>

              <strong>
                {formatCurrency(
                  selectedPayment.amount
                )}
              </strong>

              <span className="failed-label">
                ● Payment failed
              </span>

            </div>


            <div className="detail-list">

              <div>

                <span>
                  Customer
                </span>

                <strong>
                  {
                    selectedPayment.customer_id
                  }
                </strong>

              </div>


              <div>

                <span>
                  Failure Reason
                </span>

                <strong>
                  {
                    selectedPayment.failure_reason
                  }
                </strong>

              </div>


              <div>

                <span>
                  Recovery Stage
                </span>

                <strong>
                  {getStageLabel(
                    selectedPayment.recovery_stage
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Previous Successful Payments
                </span>

                <strong>
                  {
                    selectedPayment.previous_successful_payments
                  }
                </strong>

              </div>


              <div>

                <span>
                  Retry Attempts
                </span>

                <strong>
                  {
                    selectedPayment.retry_count
                  }
                  /2
                </strong>

              </div>


              <div>

                <span>
                  Recovery Reminders
                </span>

                <strong>
                  {
                    selectedPayment.reminder_count
                  }
                  /3
                </strong>

              </div>


              <div>

                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    selectedPayment.created_at
                  )}
                </strong>

              </div>

            </div>


            <div className="drawer-ai">

              <div className="drawer-ai-icon">
                ✦
              </div>

              <div>

                <strong>
                  AI Recovery
                </strong>

                <p>
                  RecoverAI will analyze this
                  payment and select the safest
                  available recovery action.
                </p>

              </div>

            </div>


            <button
              className="drawer-recover"
              disabled={recovering}
              onClick={() => {

                const paymentId =
                  selectedPayment.payment_id;

                setSelectedPayment(
                  null
                );

                recoverPayment(
                  paymentId
                );

              }}
            >

              {recovering
                ? "AI is recovering..."
                : "Run AI Recovery"}

            </button>

          </aside>

        </div>

      )}

    </div>

  );
}

export default App;