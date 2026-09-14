const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

const PORT = 5000;
const FASTAPI_URL = "http://127.0.0.1:8000";

app.use(cors());
app.use(express.json());

// Request logging and request ID middleware
app.use((req, res, next) => {
  const requestId = `REQ-${Date.now()}`;

  req.requestId = requestId;

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | ${requestId}`
  );

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js gateway is running",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

// Test middleware
app.post("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Request successfully passed through Node.js middleware",
    receivedData: req.body,
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

// Forward travel request to FastAPI
app.post("/api/plan", async (req, res) => {
  try {
    const response = await axios.post(
      `${FASTAPI_URL}/api/plan`,
      req.body
    );

    res.status(response.status).json({
      success: true,
      gateway: "Node.js",
      requestId: req.requestId,
      data: response.data,
    });
  } catch (error) {
    console.error("FastAPI request failed:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        gateway: "Node.js",
        requestId: req.requestId,
        error: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      gateway: "Node.js",
      requestId: req.requestId,
      error: "Unable to connect to FastAPI backend",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js gateway running at http://localhost:${PORT}`);
});