require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dns = require("dns")
dns.setServers(['8.8.8.8' ,'1.1.1.1'])

const paymentRoutes = require("./routes/payments");
const recoveryRoutes = require("./routes/recovery");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "RecoverAI backend is running"
  });
});

app.use("/api/payments", paymentRoutes);
app.use("/api/recovery", recoveryRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`RecoverAI server running on http://localhost:${PORT}`);
});