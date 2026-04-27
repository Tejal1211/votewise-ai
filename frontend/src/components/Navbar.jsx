import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setDashboardOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: t("home") },
    { path: "/chat", label: t("chat") },
    { path: "/eligibility", label: t("eligibility") },
    { path: "/digilocker", label: "DigiLocker" },
    { path: "/booth-finder", label: "🗺️ Booth Finder" },
    { path: "/timeline", label: t("timeline") },
    { path: "/myths", label: t("myths") },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-primary-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-xl focus:border focus:border-primary-200 focus:font-bold"
      >
        Skip to main content
      </a>
      <nav
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/40 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="VoteWise AI Home"
          >
            <img src={logo} alt="VoteWise AI logo" className="w-10 h-10 rounded-xl shadow-lg shadow-primary-500/30" />
            <span className="font-display font-bold text-xl text-primary-900 hidden sm:block">
              VoteWise <span className="text-primary-500">AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDashboardOpen(!dashboardOpen)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    ["/dashboard", "/citizen-dashboard", "/admin-dashboard"].includes(location.pathname)
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                  }`}
                >
                  {t("dashboard")}
                  <svg className={`w-4 h-4 transition-transform ${dashboardOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dashboardOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setDashboardOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      📊 Personal Dashboard
                    </Link>
                    <Link
                      to="/citizen-dashboard"
                      onClick={() => setDashboardOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      📈 Citizen Dashboard
                    </Link>
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setDashboardOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                    >
                      🛡️ Admin Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white/80 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
              aria-label="Select language"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="mr">🇮🇳 MR</option>
            </select>

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-primary-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm !px-4 !py-2">
                  {t("login")}
                </Link>
                <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">
                  {t("signup")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-1">
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}></span>
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
              <span className={`block h-0.5 bg-gray-600 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/40 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path) ? "bg-primary-100 text-primary-700" : "text-gray-600 hover:bg-primary-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <div className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Dashboards
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50">
                  📊 Personal Dashboard
                </Link>
                <Link to="/citizen-dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50">
                  📈 Citizen Dashboard
                </Link>
                <Link to="/admin-dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50">
                  🛡️ Admin Dashboard
                </Link>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 pt-2 border-t border-gray-100">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                aria-label="Select language"
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 Hindi</option>
                <option value="mr">🇮🇳 Marathi</option>
              </select>
              {user ? (
                <button onClick={handleLogout} className="text-sm text-red-500 font-medium">
                  {t("logout")}
                </button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-primary text-sm !px-4 !py-2">
                  {t("login")}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Navbar;
