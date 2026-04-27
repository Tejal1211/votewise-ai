require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const { apiLimiter } = require("./middleware/rateLimiter");
const apiRoutes = require("./routes/api");

// Environment validation
const validateEnvironment = () => {
  const requiredEnvVars = ["SESSION_SECRET"];
  const missingEnvVars = [];

  // Check required environment variables based on NODE_ENV
  if (process.env.NODE_ENV === "production") {
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        missingEnvVars.push(envVar);
      }
    });

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables for production: ${missingEnvVars.join(", ")}`
      );
    }
  }

  // Warn about development defaults
  if (process.env.NODE_ENV !== "production" && !process.env.SESSION_SECRET) {
    console.warn("⚠️  WARNING: SESSION_SECRET not configured. Using development default.");
  }

  // Validate FRONTEND_URL if set
  if (process.env.FRONTEND_URL) {
    try {
      new URL(process.env.FRONTEND_URL);
    } catch (err) {
      console.warn("⚠️  WARNING: FRONTEND_URL is not a valid URL:", process.env.FRONTEND_URL);
    }
  }

  console.log(`✅ Environment validation passed (NODE_ENV: ${process.env.NODE_ENV || "development"})`);
};

try {
  validateEnvironment();
} catch (err) {
  console.error("❌ Environment validation failed:", err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-session-secret";

// Security middleware
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://maps.gstatic.com", "https://*.googleapis.com"],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://generativelanguage.googleapis.com",
        ],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler with structured logging
app.use((err, req, res, _next) => {
  const errorId = Date.now().toString(36);
  const errorLog = {
    id: errorId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status: err.status || 500,
    message: err.message,
  };

  if (process.env.NODE_ENV === "production") {
    console.error("❌ Error [" + errorId + "]:", err.message);
  } else {
    console.error("❌ Error details:", errorLog);
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    errorId: process.env.NODE_ENV === "production" ? errorId : undefined,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ VoteWise AI API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
