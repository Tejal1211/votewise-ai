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

const chat = async (req, res) => {
  try {
    const { message, history = [], language = "en" } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: "Message too long." });
    }

    const langInstruction =
      language === "hi"
        ? " Please respond in Hindi."
        : language === "mr"
        ? " Please respond in Marathi."
        : " Please respond in English.";

    if (!genAI) {
      const fallback = generateFallbackReply(message, language);
      return res.json({ reply: fallback });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: ELECTION_SYSTEM_PROMPT + langInstruction
    });

    const formattedHistory = history
      .filter(msg => ["user", "model"].includes(msg.role))
      .map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

    // Start chat with existing history
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({
      error: "AI service temporarily unavailable. Please try again.",
    });
  }
};

const normalizeCitizenship = (value) => {
  if (!value) return "";
  const normalized = value.toString().trim().toLowerCase();
  if (["indian", "indian citizen", "citizen of india"].includes(normalized)) return "indian";
  if (["nri", "non-resident indian"].includes(normalized)) return "nri";
  if (["foreign", "foreign national"].includes(normalized)) return "foreign";
  if (["oci", "overseas citizen of india"].includes(normalized)) return "oci";
  return normalized;
};

const eligibilityCheck = async (req, res) => {
  try {
    const { age, citizenship, residencyYears } = req.body;

    const ageNum = parseInt(age);
    const resYears = parseFloat(residencyYears);
    const normalizedCitizenship = normalizeCitizenship(citizenship);

    let eligible = false;
    let reasons = [];
    let message = "";

    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      return res.status(400).json({ error: "Invalid age provided." });
    }

    if (ageNum >= 18) {
      reasons.push("✅ Age requirement met (18+)");
    } else {
      reasons.push(`❌ Must be 18+ to vote (you are ${ageNum})`);
    }

    if (normalizedCitizenship === "indian") {
      reasons.push("✅ Indian citizenship confirmed");
    } else {
      reasons.push("❌ Must be an Indian citizen to vote");
    }

    if (!isNaN(resYears) && resYears >= 0) {
      reasons.push("✅ Residency at current address noted");
    }

    eligible = ageNum >= 18 && normalizedCitizenship === "indian";

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
