import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

const getAgeFromDob = (dob) => {
  try {
    const birthDate = new Date(dob);
    const diffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  } catch {
    return "";
  }
};

const Eligibility = () => {
  const [form, setForm] = useState({ age: "", citizenship: "", residencyYears: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("prefill") === "true") {
      const saved = sessionStorage.getItem("digilockerProfile");
      if (saved) {
        const profile = JSON.parse(saved);
        setForm({
          age: getAgeFromDob(profile.dob).toString(),
          citizenship: "indian",
          residencyYears: "3",
        });
        setProfileLoaded(true);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.age || !form.citizenship) return setError("Please fill in all required fields.");
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Check failed. Please try again.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromDigiLocker = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/digilocker/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load DigiLocker data.");
      setForm({
        age: getAgeFromDob(data.profile.dob).toString(),
        citizenship: "indian",
        residencyYears: "3",
      });
      setProfileLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="eligibility-heading">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">✅</span>
          <h1 id="eligibility-heading" className="section-title mb-3">Eligibility Checker</h1>
          <p className="text-gray-500">Find out if you're eligible to vote in Indian elections</p>
        </div>

        <div className="card shadow-xl animate-fade-in space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 rounded-3xl bg-primary-50 border border-primary-100">
            <div>
              <p className="text-sm font-semibold text-primary-700">Auto-fill from DigiLocker</p>
              <p className="text-xs text-primary-600">Use connected DigiLocker data to complete the form quickly.</p>
            </div>
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto"
              onClick={loadFromDigiLocker}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load from DigiLocker"}
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-4 pb-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Age <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 21"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="citizenship" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Citizenship <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="citizenship"
                  value={form.citizenship}
                  onChange={(e) => setForm({ ...form, citizenship: e.target.value })}
                  className="input-field"
                  required
                  aria-required="true"
                >
                  <option value="">Select citizenship status</option>
                  <option value="indian">Indian Citizen</option>
                  <option value="nri">Non-Resident Indian (NRI)</option>
                  <option value="foreign">Foreign National</option>
                  <option value="oci">OCI Card Holder</option>
                </select>
              </div>

              <div>
                <label htmlFor="residency" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Years at Current Address
                </label>
                <input
                  id="residency"
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.residencyYears}
                  onChange={(e) => setForm({ ...form, residencyYears: e.target.value })}
                  className="input-field"
                  placeholder="e.g. 2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Checking...</>
              ) : "Check My Eligibility →"}
            </button>
          </form>
        </div>

        {result && (
          <div
            className={`mt-6 card shadow-xl animate-fade-in border-2 ${
              result.eligible ? "border-emerald-300 bg-emerald-50/80" : "border-red-300 bg-red-50/80"
            }`}
            role="region"
            aria-label="Eligibility result"
          >
            <div className="text-center mb-4 px-6 py-6">
              <span className="text-5xl">{result.eligible ? "🎉" : "❌"}</span>
              <h2 className={`font-display text-2xl font-bold mt-3 ${result.eligible ? "text-emerald-700" : "text-red-700"}`}>
                {result.eligible ? "You Are Eligible!" : "Not Yet Eligible"}
              </h2>
            </div>

            <ul className="space-y-2 mb-4 px-6">
              {result.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  {r}
                </li>
              ))}
            </ul>

            <p className={`text-sm font-medium p-3 rounded-xl mx-6 ${result.eligible ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {result.message}
            </p>

            {result.eligible && (
              <a
                href="https://voters.eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center mt-4 block mx-6"
              >
                Register to Vote at voters.eci.gov.in →
              </a>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "🎂", title: "Age 18+", desc: "Must be at least 18 years old on the qualifying date" },
            { icon: "🇮🇳", title: "Indian Citizen", desc: "Must be a citizen of India by birth or naturalization" },
            { icon: "🏠", title: "Registered Address", desc: "Must be registered at your current residential address" },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl p-4 text-center">
              <span className="text-2xl block mb-2" aria-hidden="true">{item.icon}</span>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Eligibility;
