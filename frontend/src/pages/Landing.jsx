import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "🤖",
    titleKey: "feature1Title",
    descKey: "feature1Desc",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: "✅",
    titleKey: "feature2Title",
    descKey: "feature2Desc",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: "📅",
    titleKey: "Election Timeline",
    descKey: "Visual timeline of all key election dates",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: "📋",
    titleKey: "Document Checklist",
    descKey: "Interactive checklist for required documents",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: "🎯",
    titleKey: "Voting Wizard",
    descKey: "Personalized 4-step voter journey generator",
    color: "from-rose-500 to-red-600",
  },
  {
    icon: "💡",
    titleKey: "Myths vs Facts",
    descKey: "Flip-card UI debunking common election myths",
    color: "from-cyan-500 to-blue-500",
  },
];

const stats = [
  { value: "900M+", label: "Eligible Voters in India" },
  { value: "543", label: "Lok Sabha Constituencies" },
  { value: "18+", label: "Voting Age" },
  { value: "100%", label: "Free & Fair Process" },
];

const Landing = () => {
  const { t } = useLang();
  const { user } = useAuth();

  return (
    <main className="min-h-screen mesh-bg pt-16">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-24"
        aria-labelledby="hero-heading"
      >
        {/* Background blobs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-primary-200 animate-fade-in">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
            Powered by Google Gemini AI & Firebase
          </div>

          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-primary-900 leading-tight mb-6 animate-fade-in animate-delay-100"
          >
            {t("heroTitle")}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-indigo-600">
              {t("heroSubtitle")}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in animate-delay-200">
            {t("heroDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animate-delay-300">
            <Link
              to={user ? "/chat" : "/signup"}
              className="btn-primary text-base !px-8 !py-4 shadow-xl shadow-primary-500/25"
            >
              {t("getStarted")} →
            </Link>
            <Link
              to="/eligibility"
              className="btn-secondary text-base !px-8 !py-4"
            >
              {t("checkEligibility")}
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in animate-delay-400">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl py-5 px-4 shadow-md">
                <div className="font-display text-2xl font-bold text-primary-700">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        aria-labelledby="features-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 id="features-heading" className="section-title mb-4">
              Everything You Need to Vote Smart
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From first-time voters to seasoned citizens — VoteWise AI guides everyone through the democratic process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <article
                key={f.title}
                className="card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{t(f.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(f.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Call to action">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-800 to-indigo-900 p-12 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="relative">
              <span className="text-4xl mb-4 block">🗳️</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Your Vote Is Your Voice
              </h2>
              <p className="text-primary-200 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of first-time voters who learned the election process with VoteWise AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={user ? "/wizard" : "/signup"}
                  className="bg-white text-primary-700 font-semibold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:-translate-y-0.5"
                >
                  Start Your Voter Journey →
                </Link>
                <Link
                  to="/chat"
                  className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                >
                  Ask AI Assistant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Landing;
