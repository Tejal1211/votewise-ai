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
    body("message").isString().trim().escape().notEmpty().isLength({ max: 1000 }),
    body("language").optional().trim().escape().isIn(["en", "hi", "mr"]),
  ],
  validate,
  chat
);

router.post(
  "/eligibility",
  [
    body("age").isNumeric().trim().escape(),
    body("citizenship").isString().trim().escape().notEmpty(),
    body("residencyYears").optional().isNumeric().trim().escape(),
  ],
  validate,
  eligibilityCheck
);

router.get("/digilocker/login", digilockerLogin);
router.get("/digilocker/callback", digilockerCallback);
router.get("/digilocker/profile", digilockerProfile);
router.get("/digilocker/documents", digilockerDocuments);
router.get("/digilocker/document/:id", [param("id").isString().trim().escape().notEmpty()], validate, digilockerDocumentById);
router.post(
  "/ocr",
  [body("imageBase64").isString().notEmpty().trim().escape()],
  validate,
  ocrExtract
);
router.post(
  "/face-match",
  [
    body("selfieBase64").isString().notEmpty().trim().escape(),
    body("idPhotoBase64").isString().notEmpty().trim().escape(),
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
    body("age").isNumeric().trim().escape(),
    body("state").optional().isString().trim().escape(),
    body("firstTimeVoter").optional().trim().escape().isIn(["yes", "no"]),
    body("needsAssistance").optional().trim().escape().isIn(["yes", "no"]),
  ],
  validate,
  getWizardGuidance
);

// Booth and Live Status Routes
router.get(
  "/booths",
  [
    query("lat").isFloat({ min: -90, max: 90 }).trim().escape(),
    query("lng").isFloat({ min: -180, max: 180 }).trim().escape(),
    query("radius").optional().isNumeric().trim().escape(),
  ],
  validate,
  getBooths
);
router.get("/booths/:id", [param("id").isString().trim().escape().notEmpty()], validate, getBoothById);
router.get("/live-status", [query("boothId").optional().trim().escape(), query("regionId").optional().trim().escape()], validate, getLiveStatus);
router.get(
  "/booth-directions",
  [
    query("originLat").isFloat({ min: -90, max: 90 }).trim().escape(),
    query("originLng").isFloat({ min: -180, max: 180 }).trim().escape(),
    query("destLat").isFloat({ min: -90, max: 90 }).trim().escape(),
    query("destLng").isFloat({ min: -180, max: 180 }).trim().escape(),
  ],
  validate,
  getBoothDirections
);
router.get("/best-vote-time", [query("boothId").notEmpty().trim().escape()], validate, getBestVoteTime);
router.get("/admin/stats", adminLimiter, getAdminStats);

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "VoteWise AI API", timestamp: new Date().toISOString() });
});

module.exports = router;
