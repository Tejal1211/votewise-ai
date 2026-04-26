import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../services/firebase";

const API_URL = import.meta.env.VITE_API_URL || "";

const Dashboard = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [reminderForm, setReminderForm] = useState({ title: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [digilockerStatus, setDigilockerStatus] = useState(null);
  const [digilockerDocs, setDigilockerDocs] = useState([]);
  const [digilockerLoading, setDigilockerLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) setUserData(snap.data());
      } catch (e) {
        console.error("Error fetching user data:", e);
      } finally {
        setLoading(false);
      }
    };

    const fetchDigiLockerStatus = async () => {
      try {
        const [profileRes, docsRes] = await Promise.all([
          fetch(`${API_URL}/api/digilocker/profile`, { credentials: "include" }),
          fetch(`${API_URL}/api/digilocker/documents`, { credentials: "include" }),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setDigilockerStatus(profileData);
        }
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDigilockerDocs(docsData.documents || []);
        }
      } catch (e) {
        console.warn("DigiLocker dashboard fetch failed:", e.message);
      } finally {
        setDigilockerLoading(false);
      }
    };

    fetchUser();
    fetchDigiLockerStatus();
  }, [user]);

  const addReminder = async (e) => {
    e.preventDefault();
    if (!reminderForm.title || !reminderForm.date) return;
    setSaving(true);
    try {
      const reminder = { id: Date.now().toString(), ...reminderForm };
      await updateDoc(doc(db, "users", user.uid), { reminders: arrayUnion(reminder) });
      setUserData((prev) => ({ ...prev, reminders: [...(prev?.reminders || []), reminder] }));
      setReminderForm({ title: "", date: "" });
      setMsg("Reminder saved!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to save reminder.");
    } finally {
      setSaving(false);
    }
  };

  const removeReminder = async (reminder) => {
    try {
      await updateDoc(doc(db, "users", user.uid), { reminders: arrayRemove(reminder) });
      setUserData((prev) => ({
        ...prev,
        reminders: prev.reminders.filter((r) => r.id !== reminder.id),
      }));
    } catch {
      setMsg("Failed to remove reminder.");
    }
  };

  const quickLinks = [
    { to: "/chat", icon: "🤖", title: "AI Chat", desc: "Ask election questions", color: "from-blue-500 to-indigo-500" },
    { to: "/eligibility", icon: "✅", title: "Check Eligibility", desc: "Verify your status", color: "from-emerald-500 to-teal-500" },
    { to: "/digilocker", icon: "🔐", title: "DigiLocker", desc: "Connect verified documents", color: "from-cyan-500 to-sky-600" },
    { to: "/documents", icon: "📋", title: "Documents", desc: "Checklist ready", color: "from-amber-500 to-orange-500" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen mesh-bg pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="dashboard-heading">
      <div className="max-w-5xl mx-auto">
        {/* Welcome header */}
        <div className="flex items-center gap-4 mb-10 animate-fade-in">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 id="dashboard-heading" className="font-display text-2xl font-bold text-primary-900">
              Welcome back, {user.displayName || user.email?.split("@")[0]}! 👋
            </h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <span className="inline-flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full mt-1">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span> Voter in Progress
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <section aria-labelledby="quicklinks-heading" className="mb-10">
          <h2 id="quicklinks-heading" className="font-semibold text-gray-800 mb-4 text-lg">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center text-2xl mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`} aria-hidden="true">
                  {link.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{link.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card shadow-xl mb-10 p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg text-gray-900">DigiLocker Verification</h2>
              <p className="text-sm text-gray-500">Connected DigiLocker documents are used to verify your voter registration status.</p>
            </div>
            <Link
              to="/digilocker"
              className="btn-primary w-full md:w-auto text-center"
            >
              {digilockerLoading ? "Checking status..." : digilockerStatus ? "View connected documents" : "Connect DigiLocker"}
            </Link>
          </div>

          {!digilockerLoading && digilockerStatus && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Status</p>
                <p className="mt-2 font-semibold text-emerald-900">Connected</p>
                <p className="text-sm text-emerald-700 mt-1">Mode: {digilockerStatus.mode}</p>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">Verified documents</p>
                <p className="mt-2 font-semibold text-gray-900">{digilockerDocs.length} available</p>
                <p className="text-sm text-gray-500 mt-1">Aadhaar, PAN, Address Proof, Birth Certificate</p>
              </div>
            </div>
          )}

          {!digilockerLoading && !digilockerStatus && (
            <div className="mt-6 rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Your DigiLocker is not connected yet. Connect to securely fetch verified documents for voter registration.
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reminders */}
          <section className="card shadow-lg animate-fade-in" aria-labelledby="reminders-heading">
            <h2 id="reminders-heading" className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">⏰</span> Election Reminders
            </h2>

            <form onSubmit={addReminder} className="space-y-3 mb-5">
              <input
                type="text"
                placeholder="Reminder title (e.g. Check voter list)"
                value={reminderForm.title}
                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                className="input-field text-sm"
                aria-label="Reminder title"
                required
              />
              <input
                type="date"
                value={reminderForm.date}
                onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                className="input-field text-sm"
                aria-label="Reminder date"
                required
              />
              <button type="submit" disabled={saving} className="btn-primary w-full text-sm disabled:opacity-60">
                {saving ? "Saving..." : "+ Add Reminder"}
              </button>
              {msg && <p className="text-xs text-center text-emerald-600 font-medium">{msg}</p>}
            </form>

            {userData?.reminders?.length > 0 ? (
              <ul className="space-y-2" role="list" aria-label="Your reminders">
                {[...(userData.reminders || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).map((r) => (
                  <li key={r.id} className="flex items-center justify-between bg-primary-50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-primary-600">{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                    </div>
                    <button
                      onClick={() => removeReminder(r)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                      aria-label={`Remove reminder: ${r.title}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No reminders yet. Add one above!</p>
            )}
          </section>

          {/* Progress */}
          <section className="card shadow-lg animate-fade-in animate-delay-100" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">📊</span> Your Voter Journey
            </h2>

            <div className="space-y-4">
              {[
                { label: "Account Created", done: true, icon: "✅" },
                { label: "Profile Completed", done: !!(user.displayName), icon: user.displayName ? "✅" : "⬜" },
                { label: "Eligibility Checked", done: false, icon: "⬜", link: "/eligibility" },
                { label: "Documents Ready", done: false, icon: "⬜", link: "/documents" },
                { label: "Voter ID Applied", done: false, icon: "⬜", link: "https://voters.eci.gov.in" },
                { label: "Ready to Vote!", done: false, icon: "🗳️" },
              ].map((step) => (
                <div key={step.label} className={`flex items-center gap-3 p-3 rounded-xl ${step.done ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <span className="text-lg flex-shrink-0" aria-hidden="true">{step.icon}</span>
                  <span className={`text-sm flex-1 ${step.done ? "text-emerald-700 font-medium" : "text-gray-600"}`}>{step.label}</span>
                  {!step.done && step.link && (
                    step.link.startsWith("http") ? (
                      <a href={step.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">Do it →</a>
                    ) : (
                      <Link to={step.link} className="text-xs text-primary-600 hover:underline">Do it →</Link>
                    )
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
