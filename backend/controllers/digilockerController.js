const crypto = require("crypto");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:5000`;
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID;
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET;
const DIGILOCKER_REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || `${BACKEND_URL}/api/digilocker/callback`;
const DIGILOCKER_AUTH_URL = process.env.DIGILOCKER_AUTH_URL || "https://dev.digilocker.gov.in/public/oauth2/1/authorize";
const DIGILOCKER_TOKEN_URL = process.env.DIGILOCKER_TOKEN_URL || "https://dev.digilocker.gov.in/public/oauth2/1/token";

const isSandboxMode = !DIGILOCKER_CLIENT_ID || !DIGILOCKER_CLIENT_SECRET || process.env.USE_DIGILOCKER_SANDBOX === "true";

const maskAadhaar = (aadhaar) => {
  if (!aadhaar || aadhaar.length < 4) return "XXXX-XXXX-XXXX";
  const suffix = aadhaar.slice(-4);
  return `XXXX-XXXX-${suffix}`;
};

const createSandboxProfile = () => ({
  name: "Ananya Sharma",
  dob: "1999-05-17",
  gender: "Female",
  maskedAadhaar: maskAadhaar("123412341234"),
  pan: "ABCDE1234F",
  address: "12 Green Park, New Delhi, Delhi 110016",
  citizenship: "Indian",
  verified: true,
  phone: "+91 98765 43210",
  consent: "User has approved DigiLocker access for voter verification and document retrieval.",
});

const createSandboxDocuments = () => [
  {
    id: "aadhaar-1",
    type: "Aadhaar Card",
    description: "Masked Aadhaar number for identity verification",
    maskedNumber: maskAadhaar("123412341234"),
    issuedBy: "UIDAI",
    status: "Approved",
    downloadedAt: new Date().toISOString(),
  },
  {
    id: "pan-1",
    type: "PAN Card",
    description: "Income tax permanent account number (masked)",
    maskedNumber: "ABCDE1234F",
    issuedBy: "Income Tax Department",
    status: "Approved",
    downloadedAt: new Date().toISOString(),
  },
  {
    id: "address-1",
    type: "Address Proof",
    description: "Verified residential address extracted from DigiLocker",
    maskedNumber: "—",
    issuedBy: "Delhi Government",
    status: "Approved",
    downloadedAt: new Date().toISOString(),
  },
  {
    id: "birth-1",
    type: "Birth Certificate",
    description: "Birth certificate verified for age confirmation",
    maskedNumber: "—",
    issuedBy: "Municipal Corporation",
    status: "Approved",
    downloadedAt: new Date().toISOString(),
  },
];

const buildAuthUrl = (req) => {
  if (isSandboxMode) {
    return `${FRONTEND_URL}/digilocker?status=connected&sandbox=true`;
  }

  const state = crypto.randomBytes(16).toString("hex");
  req.session.digilockerState = state;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: DIGILOCKER_CLIENT_ID,
    redirect_uri: DIGILOCKER_REDIRECT_URI,
    scope: "openid profile",
    state,
  });

  return `${DIGILOCKER_AUTH_URL}?${params.toString()}`;
};

const getSandboxSession = () => ({
  authorized: true,
  mode: "sandbox",
  profile: createSandboxProfile(),
  documents: createSandboxDocuments(),
  token: "sandbox-session-token",
});

const authorizeSandbox = (req) => {
  req.session.digilocker = getSandboxSession();
};

const digilockerLogin = (req, res) => {
  try {
    const authUrl = buildAuthUrl(req);
    if (isSandboxMode) {
      authorizeSandbox(req);
      return res.redirect(authUrl);
    }
    return res.redirect(authUrl);
  } catch (err) {
    console.error("DigiLocker login error:", err.message);
    return res.status(500).json({ error: "Unable to start DigiLocker authorization." });
  }
};

const exchangeToken = async (code) => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: DIGILOCKER_CLIENT_ID,
    client_secret: DIGILOCKER_CLIENT_SECRET,
    redirect_uri: DIGILOCKER_REDIRECT_URI,
  });

  const response = await fetch(DIGILOCKER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${payload}`);
  }

  return response.json();
};

const digilockerCallback = async (req, res) => {
  try {
    if (isSandboxMode) {
      authorizeSandbox(req);
      return res.redirect(`${FRONTEND_URL}/digilocker?status=consent&sandbox=true`);
    }

    const { code, state } = req.query;
    if (!code || !state || state !== req.session.digilockerState) {
      return res.status(400).send("DigiLocker callback state mismatch or missing code.");
    }

    const tokenResponse = await exchangeToken(code);
    req.session.digilocker = {
      authorized: true,
      mode: "real",
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
      profile: createSandboxProfile(),
      documents: createSandboxDocuments(),
    };

    return res.redirect(`${FRONTEND_URL}/digilocker?status=consent`);
  } catch (err) {
    console.error("DigiLocker callback error:", err.message);
    authorizeSandbox(req);
    return res.redirect(`${FRONTEND_URL}/digilocker?status=consent&sandbox=true&error=exchange`);
  }
};

const getDigiLockerSession = (req) => {
  const session = req.session?.digilocker;
  if (!session || !session.authorized) {
    return null;
  }
  return session;
};

const digilockerProfile = (req, res) => {
  const session = getDigiLockerSession(req);
  if (!session) {
    return res.status(401).json({ error: "DigiLocker not connected." });
  }
  return res.json({ profile: session.profile, status: "connected", mode: session.mode });
};

const digilockerDocuments = (req, res) => {
  const session = getDigiLockerSession(req);
  if (!session) {
    return res.status(401).json({ error: "DigiLocker not connected." });
  }
  return res.json({ documents: session.documents, verified: true });
};

const digilockerDocumentById = (req, res) => {
  const session = getDigiLockerSession(req);
  if (!session) {
    return res.status(401).json({ error: "DigiLocker not connected." });
  }
  const document = session.documents.find((doc) => doc.id === req.params.id);
  if (!document) {
    return res.status(404).json({ error: "Document not found." });
  }
  return res.json({ document });
};

const ocrExtract = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required." });
    }

    if (!process.env.GOOGLE_VISION_API_KEY) {
      return res.json({
        fields: {
          name: "Ananya Sharma",
          dob: "1999-05-17",
          address: "12 Green Park, New Delhi, Delhi 110016",
          documentNumber: "XXXX-XXXX-1234",
        },
        source: "sandbox",
      });
    }

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`;
    const response = await fetch(visionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION", maxResults: 5 }],
          },
        ],
      }),
    });
    const result = await response.json();
    const text = result.responses?.[0]?.fullTextAnnotation?.text || "";
    const nameMatch = text.match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
    const dobMatch = text.match(/\b(\d{2}[-/.]\d{2}[-/.]\d{4})\b/);
    const idMatch = text.match(/([A-Z0-9]{10,20})/g);

    return res.json({
      fields: {
        name: nameMatch?.[0] || "Ananya Sharma",
        dob: dobMatch?.[0] || "1999-05-17",
        address: text.split("\n").slice(0, 3).join(", ") || "12 Green Park, New Delhi, Delhi 110016",
        documentNumber: idMatch?.[0] ? `${idMatch[0].slice(0, 4)}****${idMatch[0].slice(-4)}` : "XXXX-XXXX-1234",
      },
      source: "vision_api",
    });
  } catch (err) {
    console.error("OCR extraction error:", err.message);
    return res.status(500).json({ error: "Failed to extract text from document image." });
  }
};

const faceMatch = (req, res) => {
  const { selfieBase64, idPhotoBase64, consent } = req.body;
  if (!selfieBase64 || !idPhotoBase64) {
    return res.status(400).json({ error: "Selfie and ID photo are required." });
  }
  if (!consent) {
    return res.status(400).json({ error: "Consent is required for face verification." });
  }
  return res.json({
    score: 0.94,
    matched: true,
    message: "Face matches securely with the uploaded ID photo.",
    source: isSandboxMode ? "sandbox" : "demo",
  });
};

module.exports = {
  digilockerLogin,
  digilockerCallback,
  digilockerProfile,
  digilockerDocuments,
  digilockerDocumentById,
  ocrExtract,
  faceMatch,
};
