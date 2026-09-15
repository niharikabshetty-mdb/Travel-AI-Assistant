const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const { MongoClient } = require("mongodb");

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

require("dotenv").config();

const app = express();

const PORT = 5000;
const FASTAPI_URL = "http://127.0.0.1:8000";

// =====================================================
// Firebase Admin
// =====================================================

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

// =====================================================
// MongoDB
// =====================================================

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME || "travel_ai_assistant";

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Add it to node-gateway/.env"
  );
}

const mongoClient = new MongoClient(MONGODB_URI);

let database;

let tripsCollection;

// Connect to MongoDB when the server starts
async function connectToMongoDB() {
  try {
    await mongoClient.connect();

    database = mongoClient.db(MONGODB_DB_NAME);

    tripsCollection = database.collection("trips");

    await database.command({ ping: 1 });

    console.log(
      `MongoDB connected successfully to database: ${MONGODB_DB_NAME}`
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  }
}

// =====================================================
// Express Middleware
// =====================================================

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

// =====================================================
// Firebase Authentication Middleware
// =====================================================

async function authenticateUser(req, res, next) {
  try {
    const authorizationHeader =
      req.headers.authorization;

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

    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    req.user = decodedToken;

    console.log(
      `Authenticated user: ${
        decodedToken.email || decodedToken.uid
      }`
    );

    next();
  } catch (error) {
    console.error(
      "Firebase authentication failed:",
      error.message
    );

    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token",
      requestId: req.requestId,
    });
  }
}

// =====================================================
// Health Check
// =====================================================

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js gateway is running",
    mongodb: database ? "connected" : "not connected",
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// MongoDB Test Endpoint
// =====================================================

app.get("/api/test-db", authenticateUser, async (req, res) => {
  try {
    const collections =
      await database.listCollections().toArray();

    res.json({
      success: true,
      message: "MongoDB connection is working",
      database: MONGODB_DB_NAME,
      collections: collections.map(
        (collection) => collection.name
      ),
      user: {
        uid: req.user.uid,
        email: req.user.email || null,
      },
      requestId: req.requestId,
    });
  } catch (error) {
    console.error(
      "MongoDB test failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      error: "MongoDB test failed",
      requestId: req.requestId,
    });
  }
});

// =====================================================
// Firebase Authentication Test
// =====================================================

app.post(
  "/api/test-auth",
  authenticateUser,
  (req, res) => {
    res.json({
      success: true,
      message:
        "Firebase authentication verified successfully",
      user: {
        uid: req.user.uid,
        email: req.user.email || null,
      },
      requestId: req.requestId,
    });
  }
);

// =====================================================
// AI Travel Planning + Save Trip
// =====================================================

app.post(
  "/api/plan",
  authenticateUser,
  async (req, res) => {
    try {
      console.log(
        `Creating travel plan for user: ${
          req.user.email || req.user.uid
        }`
      );

      // Send the request to FastAPI
      const response = await axios.post(
        `${FASTAPI_URL}/api/plan`,
        req.body
      );

      const travelData = response.data;

      // Save the generated trip in MongoDB
      const tripDocument = {
        userId: req.user.uid,
        userEmail: req.user.email || null,

        destination: req.body.destination,
        days: req.body.days,
        travelers: req.body.travelers,
        interests: req.body.interests || [],

        itinerary: travelData.itinerary,

        createdAt: new Date(),
      };

      const savedTrip =
        await tripsCollection.insertOne(tripDocument);

      console.log(
        `Trip saved to MongoDB with ID: ${savedTrip.insertedId}`
      );

      // Send the itinerary back to the frontend
      res.status(200).json({
        success: true,
        gateway: "Node.js",
        authenticated: true,

        user: {
          uid: req.user.uid,
          email: req.user.email || null,
        },

        tripId: savedTrip.insertedId,

        requestId: req.requestId,

        data: travelData,
      });
    } catch (error) {
      console.error(
        "Travel planning failed:",
        error.message
      );

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
        error:
          "Unable to generate or save the travel itinerary.",
      });
    }
  }
);

// =====================================================
// Start Server
// =====================================================

async function startServer() {
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(
      `Node.js gateway running at http://localhost:${PORT}`
    );

    console.log(
      "Firebase Admin authentication enabled"
    );
  });
}

startServer();