const express = require("express");
const router = express.Router();
const { chat, eligibilityCheck } = require("../controllers/chatController");
const {
  getElectionTimeline,
  getDocumentChecklist,
  getMythsAndFacts,
  getWizardGuidance,
} = require("../controllers/remindersController");
const {
  digilockerLogin,
  digilockerCallback,
  digilockerProfile,
  digilockerDocuments,
  digilockerDocumentById,
  ocrExtract,
  faceMatch,
} = require("../controllers/digilockerController");
const {
  getBooths,
  getBoothById,
  getLiveStatus,
  getBoothDirections,
  getBestVoteTime,
  getAdminStats,
} = require("../controllers/boothController");
const { chatLimiter, adminLimiter } = require("../middleware/rateLimiter");
const { body, query, validationResult } = require("express-validator");

/**
 * Middleware to validate request and collect errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/chat",
  chatLimiter,
  [
    body("message").isString().trim().notEmpty().isLength({ max: 1000 }),
    body("language").optional().isIn(["en", "hi", "mr"]),
  ],
  validate,
  chat
);

router.post(
  "/eligibility",
  [body("age").isNumeric(), body("citizenship").isString().trim().notEmpty()],
  validate,
  eligibilityCheck
);

router.get("/digilocker/login", digilockerLogin);
router.get("/digilocker/callback", digilockerCallback);
router.get("/digilocker/profile", digilockerProfile);
router.get("/digilocker/documents", digilockerDocuments);
router.get("/digilocker/document/:id", digilockerDocumentById);
router.post("/ocr", [body("imageBase64").isString().notEmpty()], validate, ocrExtract);
router.post(
  "/face-match",
  [
    body("selfieBase64").isString().notEmpty(),
    body("idPhotoBase64").isString().notEmpty(),
    body("consent").isBoolean(),
  ],
  validate,
  faceMatch
);

router.get("/timeline", getElectionTimeline);
router.get("/documents", getDocumentChecklist);
router.get("/myths", getMythsAndFacts);

router.post(
  "/wizard",
  [
    body("age").isNumeric(),
    body("state").optional().isString().trim(),
    body("firstTimeVoter").optional().isIn(["yes", "no"]),
    body("needsAssistance").optional().isIn(["yes", "no"]),
  ],
  validate,
  getWizardGuidance
);

// Booth and Live Status Routes
router.get(
  "/booths",
  [
    query("lat").isFloat({ min: -90, max: 90 }),
    query("lng").isFloat({ min: -180, max: 180 }),
    query("radius").optional().isNumeric(),
  ],
  validate,
  getBooths
);
router.get("/booths/:id", getBoothById);
router.get("/live-status", getLiveStatus);
router.get(
  "/booth-directions",
  [
    query("originLat").isFloat({ min: -90, max: 90 }),
    query("originLng").isFloat({ min: -180, max: 180 }),
    query("destLat").isFloat({ min: -90, max: 90 }),
    query("destLng").isFloat({ min: -180, max: 180 }),
  ],
  validate,
  getBoothDirections
);
router.get("/best-vote-time", [query("boothId").notEmpty()], validate, getBestVoteTime);
router.get("/admin/stats", adminLimiter, getAdminStats);

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VoteWise AI API", timestamp: new Date().toISOString() });
});

module.exports = router;
