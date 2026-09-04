const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const paymentsPath = path.join(
  __dirname,
  "../../data/payments.json"
);

router.get("/", (req, res) => {
  const payments = JSON.parse(
    fs.readFileSync(paymentsPath, "utf-8")
  );

  res.json(payments);
});

module.exports = router;