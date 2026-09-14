const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const app = express();

const PORT = 5000;
const FASTAPI_URL = "http://127.0.0.1:8000";

// --------------------------------------------------
// Firebase Admin initialization
// --------------------------------------------------

const serviceAccountPath = path.join(
  __dirname,
  "serviceAccountKey.json"
);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
}

const adminAuth = getAuth();

// --------------------------------------------------
// Basic middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
  const requestId = `REQ-${Date.now()}`;

  req.requestId = requestId;

  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | ${requestId}`
  );

  next();
});

// --------------------------------------------------
// Firebase authentication middleware
// --------------------------------------------------

async function authenticateUser(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        requestId: req.requestId,
      });
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication format",
        requestId: req.requestId,
      });
    }

    const idToken = authorizationHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    req.user = decodedToken;

    console.log(
      `Authenticated user: ${decodedToken.email || decodedToken.uid}`
    );

    next();
  } catch (error) {
    console.error("Firebase authentication failed:", error.message);

    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token",
      requestId: req.requestId,
    });
  }
}

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js gateway is running",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// Protected test endpoint
// --------------------------------------------------

app.post("/api/test-auth", authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: "Firebase authentication verified successfully",
    user: {
      uid: req.user.uid,
      email: req.user.email || null,
    },
    requestId: req.requestId,
  });
});

// --------------------------------------------------
// Protected travel planning endpoint
// --------------------------------------------------

app.post("/api/plan", authenticateUser, async (req, res) => {
  try {
    console.log(
      `Creating travel plan for user: ${
        req.user.email || req.user.uid
      }`
    );

    const response = await axios.post(
      `${FASTAPI_URL}/api/plan`,
      req.body
    );

    res.status(response.status).json({
      success: true,
      gateway: "Node.js",
      authenticated: true,
      user: {
        uid: req.user.uid,
        email: req.user.email || null,
      },
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

    return res.status(500).json({
      success: false,
      gateway: "Node.js",
      requestId: req.requestId,
      error: "Unable to connect to FastAPI backend",
    });
  }
});

// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Node.js gateway running at http://localhost:${PORT}`);
  console.log("Firebase Admin authentication enabled");
});