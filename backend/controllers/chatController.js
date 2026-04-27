const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const ELECTION_SYSTEM_PROMPT = `You are VoteWise AI, an expert election education assistant. You help citizens understand:
- Voter registration process and eligibility
- Required documents for voting
- Different voting methods (in-person, postal, proxy)
- Election timelines and key dates
- How votes are counted
- NOTA (None of the Above) option
- Election myths vs facts
- Rights and responsibilities of voters

Focus primarily on Indian elections (Lok Sabha, Vidhan Sabha, local body elections) but can answer general election questions.
Be friendly, clear, and encouraging. Keep answers concise but complete. If asked about specific candidates or parties, remain neutral.
Always encourage civic participation and remind users to verify details with the Election Commission of India (eci.gov.in).`;

/**
 * Generates a fallback response when AI service is unavailable
 * @param {string} message - User input message
 * @param {string} language - User preferred language (en, hi, mr)
 * @returns {string} Fallback message
 */
const generateFallbackReply = (message, language) => {
  const normalized = message.trim().toLowerCase();
  if (normalized.includes("documents")) {
    return language === "hi"
      ? "DigiLocker से सत्यापित दस्तावेज़ प्राप्त करने के लिए, कृपया कनेक्ट करें और अनुरोध भेजें।"
      : language === "mr"
        ? "DigiLocker कनेक्ट करून पडताळलेली कागदपत्रे मिळवा."
        : "Please connect DigiLocker to retrieve verified documents and see registration guidance.";
  }
  if (normalized.includes("register") || normalized.includes("registration")) {
    return language === "hi"
      ? "भारतीय चुनावों में वोट करने के लिए, आपको 18 वर्ष से ऊपर होना चाहिए और अपने नाम को मतदाता सूची में पंजीकृत कराना चाहिए।"
      : language === "mr"
        ? "भारतीय निवडणुकीसाठी, तुम्ही 18 वर्षे किंवा त्याहून अधिक वयाचे असले पाहिजे आणि मतदार यादीत नाव नोंदणी करावी."
        : "To vote in India, you must be at least 18 years old and enrolled on the electoral roll for your current residential address.";
  }
  return language === "hi"
    ? "मैं चुनाव संबंधी प्रश्नों का उत्तर देने के लिए तैयार हूँ। कृपया एक सरल प्रश्न पूछें।"
    : language === "mr"
      ? "मी निवडणूक संबंधित प्रश्नांचे उत्तर देण्यासाठी तयार आहे. कृपया एक प्रश्न विचारा."
      : "I'm ready to help with election-related questions. Please ask a specific question.";
};

/**
 * Handles AI chat interactions using Google Gemini
 * @route POST /api/chat
 * @param {Object} req - Express request object
 * @param {string} req.body.message - User's chat message (max 1000 chars)
 * @param {Array} req.body.history - Previous chat messages for context
 * @param {string} req.body.language - Preferred response language (en, hi, mr)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reply from AI or fallback
 */
const chat = async (req, res) => {
  try {
    const { message, history = [], language = "en" } = req.body;

    // Validate message input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: "Message too long (max 1000 characters)." });
    }

    // Validate language parameter
    const validLanguages = ["en", "hi", "mr"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ error: `Invalid language. Supported: ${validLanguages.join(", ")}` });
    }

    // Validate history format
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "History must be an array." });
    }

    const langInstruction =
      language === "hi"
        ? " Please respond in Hindi."
        : language === "mr"
          ? " Please respond in Marathi."
          : " Please respond in English.";

    // Check if Gemini API is available
    if (!genAI) {
      console.warn("Gemini API not configured, using fallback response");
      const fallback = generateFallbackReply(message, language);
      return res.json({ reply: fallback, source: "fallback" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: ELECTION_SYSTEM_PROMPT + langInstruction,
    });

    // Filter and format history for API compatibility
    const formattedHistory = history
      .filter((msg) => msg && ["user", "model"].includes(msg.role))
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content || "" }],
      }));

    // Start chat with existing history
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ reply: response, source: "gemini" });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({
      error: "AI service temporarily unavailable. Please try again.",
      source: "error",
    });
  }
};

/**
 * Normalizes citizenship input to standard values
 * @param {string} value - Raw citizenship string
 * @returns {string} Normalized value (indian, nri, foreign, oci)
 */
const normalizeCitizenship = (value) => {
  if (!value) return "";
  const normalized = value.toString().trim().toLowerCase();
  if (["indian", "indian citizen", "citizen of india"].includes(normalized)) return "indian";
  if (["nri", "non-resident indian"].includes(normalized)) return "nri";
  if (["foreign", "foreign national"].includes(normalized)) return "foreign";
  if (["oci", "overseas citizen of india"].includes(normalized)) return "oci";
  return normalized;
};

/**
 * Performs basic eligibility check for Indian elections with comprehensive validation
 * @route POST /api/eligibility
 * @param {Object} req - Express request object
 * @param {number} req.body.age - User's age (0-120)
 * @param {string} req.body.citizenship - Citizenship type (indian, nri, oci, foreign)
 * @param {number} req.body.residencyYears - Years of residency at current address (optional)
 * @param {Object} res - Express response object
 * @returns {Object} JSON with eligibility status, reasons, and message
 */
const eligibilityCheck = async (req, res) => {
  try {
    const { age, citizenship, residencyYears } = req.body;

    // Validate age input
    if (age === undefined || age === null) {
      return res.status(400).json({ error: "Age is required." });
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return res.status(400).json({
        error: "Invalid age. Must be a number between 0 and 120.",
      });
    }

    // Validate citizenship input
    if (!citizenship || typeof citizenship !== "string") {
      return res.status(400).json({
        error: "Citizenship is required and must be a string.",
      });
    }

    const normalizedCitizenship = normalizeCitizenship(citizenship);
    if (!normalizedCitizenship) {
      return res.status(400).json({
        error: "Invalid citizenship. Accepted values: indian, nri, oci, foreign.",
      });
    }

    // Validate residency if provided
    let resYears = NaN;
    if (residencyYears !== undefined && residencyYears !== null) {
      resYears = parseFloat(residencyYears);
      if (isNaN(resYears) || resYears < 0) {
        return res.status(400).json({
          error: "Invalid residency years. Must be a non-negative number.",
        });
      }
    }

    const reasons = [];
    let eligible = false;

    // Age check (mandatory)
    if (ageNum >= 18) {
      reasons.push("✅ Age requirement met (18+)");
    } else {
      reasons.push(`❌ Must be 18+ to vote (you are ${ageNum})`);
    }

    // Citizenship check (mandatory)
    if (normalizedCitizenship === "indian") {
      reasons.push("✅ Indian citizenship confirmed");
    } else {
      reasons.push(`❌ Must be an Indian citizen to vote (your citizenship: ${normalizedCitizenship})`);
    }

    // Residency check (informational)
    if (!isNaN(resYears) && resYears >= 0) {
      reasons.push(`✅ Residency at current address noted (${resYears} years)`);
    } else if (residencyYears !== undefined && residencyYears !== null) {
      reasons.push("⚠️ Residency information unclear");
    }

    // Overall eligibility determination
    eligible = ageNum >= 18 && normalizedCitizenship === "indian";

    let message = "";
    if (eligible) {
      message =
        "🎉 You are eligible to vote in Indian elections! Make sure you are registered on the Electoral Roll. Check your name at voters.eci.gov.in";
    } else {
      message =
        "You are currently not eligible to vote. Check back when you meet all eligibility criteria.";
    }

    res.json({ eligible, reasons, message });
  } catch (err) {
    console.error("Eligibility error:", err.message);
    res.status(500).json({ error: "Server error during eligibility check." });
  }
};

module.exports = { chat, eligibilityCheck };
