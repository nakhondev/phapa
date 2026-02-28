const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const eventsRouter = require("./routes/events");
const donationsRouter = require("./routes/donations");
const envelopesRouter = require("./routes/envelopes");
const operatorsRouter = require("./routes/operators");
const incomeRouter = require("./routes/income");
const expensesRouter = require("./routes/expenses");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN
      ? process.env.ALLOWED_ORIGIN.split(",")
      : "*",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/envelopes", envelopesRouter);
app.use("/api/operators", operatorsRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expenses", expensesRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
