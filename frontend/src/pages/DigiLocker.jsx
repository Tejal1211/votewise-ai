import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

const DigiLocker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("idle");
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (
      query.has("status") ||
      query.has("sandbox") ||
      query.has("connected") ||
      location.pathname.endsWith("/consent")
    ) {
      setStatus("consent");
    }
  }, [location.search, location.pathname]);

  const startConnection = () => {
    window.location.href = `${API_URL}/api/digilocker/login`;
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/digilocker/profile`, {
        credentials: "include",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Unable to load profile.");
      }
      const data = await res.json();
      setProfile(data.profile);
      return data.profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const approveConsent = async () => {
    setLoading(true);
    setError("");
    try {
      const profileData = await fetchProfile();
      if (!profileData) {
        throw new Error("Please connect DigiLocker first.");
      }
      const res = await fetch(`${API_URL}/api/digilocker/documents`, {
        credentials: "include",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Failed to load DigiLocker documents.");
      }
      const data = await res.json();
      setDocuments(data.documents);
      setStatus("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async (docId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/digilocker/document/${docId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Unable to fetch document metadata.");
      }
      const data = await res.json();
      setSelectedDoc(data.document);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = async () => {
    const profileData = await fetchProfile();
    if (!profileData) return;
    sessionStorage.setItem("digilockerProfile", JSON.stringify(profileData));
    navigate("/eligibility?prefill=true");
  };

  return (
    <main id="main-content" className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="digilocker-heading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">🔐</span>
          <h1 id="digilocker-heading" className="section-title">DigiLocker Connect</h1>
          <p className="mt-2 text-gray-500">Securely retrieve your approved documents and auto-fill voter registration data.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6" role="alert">
            {error}
          </div>
        )}

        {status === "idle" && (
          <section className="card shadow-xl p-8 mb-8">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">Connect to DigiLocker</h2>
            <p className="text-gray-600 mb-6">Use DigiLocker to verify identity safely with masked Aadhaar, PAN and address proof.</p>
            <button
              className="btn-primary px-6 py-3"
              onClick={startConnection}
              aria-label="Connect to DigiLocker"
            >
              Connect DigiLocker
            </button>
            <p className="text-xs text-gray-400 mt-4">We only store session authorization tokens. No document data is permanently saved.</p>
          </section>
        )}

        {status === "consent" && (
          <section className="card shadow-xl p-8 mb-8">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">Approve access</h2>
            <p className="text-gray-600 mb-4">VoteWise AI needs your consent to fetch verified documents for voter registration assistance.</p>
            <div className="space-y-3 text-sm text-gray-700 mb-6 bg-gray-50 p-4 rounded-2xl">
              <p>• Access verified Aadhaar, PAN, Address Proof, and Birth Certificate.</p>
              <p>• Use data to auto-fill voter eligibility and registration forms.</p>
              <p>• Keep sensitive identifiers masked and session-bound.</p>
            </div>
            <label className="flex items-start gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1"
              />
              I consent to DigiLocker document access for voter verification and registration support.
            </label>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                className="btn-primary w-full sm:w-auto"
                onClick={approveConsent}
                disabled={!consentChecked || loading}
              >
                {loading ? "Loading documents..." : "Approve and Fetch Documents"}
              </button>
              <Link to="/dashboard" className="btn-secondary w-full sm:w-auto text-center">
                Go Back to Dashboard
              </Link>
            </div>
          </section>
        )}

        {status === "success" && (
          <section className="card shadow-xl p-8 mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">Documents Retrieved</h2>
                <p className="text-gray-600">Your DigiLocker-approved documents are available for review and verification.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" aria-hidden="true"></span>
                Verified Documents Connected
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {documents.map((doc) => (
                <article key={doc.id} className="rounded-3xl border border-gray-200 p-4 bg-white shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-primary-600 font-semibold">{doc.type}</p>
                      <p className="mt-1 font-semibold text-gray-900">{doc.description}</p>
                      <p className="mt-2 text-xs text-gray-500">{doc.issuedBy} • {doc.status}</p>
                    </div>
                    <button
                      onClick={() => viewDocument(doc.id)}
                      className="btn-secondary text-sm !px-4 !py-2"
                    >
                      View details
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {selectedDoc && (
              <div className="mt-8 rounded-3xl border border-primary-200 bg-primary-50 p-6">
                <h3 className="font-semibold text-gray-900">Document details</h3>
                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700">
                  <div><span className="font-medium">Type:</span> {selectedDoc.type}</div>
                  <div><span className="font-medium">Status:</span> {selectedDoc.status}</div>
                  <div><span className="font-medium">Number:</span> {selectedDoc.maskedNumber}</div>
                  <div><span className="font-medium">Issued by:</span> {selectedDoc.issuedBy}</div>
                  <div><span className="font-medium">Fetched:</span> {new Date(selectedDoc.downloadedAt).toLocaleString()}</div>
                </dl>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleAutoFill} className="btn-primary w-full sm:w-auto" disabled={loading}>
                {loading ? "Preparing form..." : "Auto-fill Eligibility Form"}
              </button>
              <Link to="/dashboard" className="btn-secondary w-full sm:w-auto text-center">
                Back to Dashboard
              </Link>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Masked Aadhaar", description: "Sensitive digits remain hidden.", icon: "🛡️" },
            { title: "Secure Consent", description: "Explicit user approval before data fetch.", icon: "✅" },
            { title: "Session-only Tokens", description: "No permanent secret storage.", icon: "🔒" },
            { title: "Auto-fill Support", description: "Verified data helps complete forms quickly.", icon: "⚡" },
          ].map((card) => (
            <div key={card.title} className="glass rounded-3xl p-5">
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default DigiLocker;
