import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary-900 text-white mt-20" role="contentinfo">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">V</span>
            </div>
            <span className="font-display font-bold text-xl">
              VoteWise <span className="text-primary-300">AI</span>
            </span>
          </div>
          <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
            Empowering citizens with election knowledge. Built with ❤️ for democracy.
          </p>
          <p className="text-primary-400 text-xs mt-3">
            Data based on Election Commission of India guidelines. Always verify at eci.gov.in
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-primary-100 mb-3 text-sm uppercase tracking-wider">Learn</h3>
          <ul className="space-y-2">
            {[
              { to: "/eligibility", label: "Check Eligibility" },
              { to: "/timeline", label: "Election Timeline" },
              { to: "/documents", label: "Documents Needed" },
              { to: "/myths", label: "Myths vs Facts" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-primary-300 hover:text-white text-sm transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-primary-100 mb-3 text-sm uppercase tracking-wider">Resources</h3>
          <ul className="space-y-2">
            {[
              { href: "https://eci.gov.in", label: "Election Commission India" },
              { href: "https://voters.eci.gov.in", label: "Voter Registration" },
              { href: "https://nvsp.in", label: "NVSP Portal" },
            ].map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer"
                  className="text-primary-300 hover:text-white text-sm transition-colors">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-primary-400 text-sm">© 2024 VoteWise AI. All rights reserved.</p>
        <p className="text-primary-400 text-sm">Powered by Google Gemini AI & Firebase</p>
      </div>
    </div>
  </footer>
);

export default Footer;
