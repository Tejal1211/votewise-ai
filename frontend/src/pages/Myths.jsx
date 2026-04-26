import { useState } from "react";

const myths = [
  {
    myth: "Voting is compulsory in India",
    fact: "Voting is NOT compulsory in India. It is a right and civic duty, but there is no legal penalty for not voting.",
    verdict: false,
    category: "Participation",
    icon: "🗳️",
  },
  {
    myth: "Your vote is not secret — officials can see who you voted for",
    fact: "Your vote is completely SECRET. The EVM records votes without linking them to any voter. Secret ballot is a fundamental principle.",
    verdict: false,
    category: "Privacy",
    icon: "🔐",
  },
  {
    myth: "You need money or resources to vote",
    fact: "Voting is FREE. Polling stations are set up nearby, and on election day many areas provide free transport to booths.",
    verdict: false,
    category: "Access",
    icon: "💰",
  },
  {
    myth: "NRIs (Non-Resident Indians) cannot vote",
    fact: "NRIs CAN vote! The Representation of People (Amendment) Act 2010 allows NRIs to register and vote from their constituency in India.",
    verdict: false,
    category: "Eligibility",
    icon: "✈️",
  },
  {
    myth: "EVMs can be hacked or manipulated",
    fact: "EVMs are standalone devices with no internet/bluetooth connectivity. They undergo rigorous testing by technical experts and political parties before deployment.",
    verdict: false,
    category: "Technology",
    icon: "💻",
  },
  {
    myth: "You must vote at any polling station",
    fact: "You must vote at the specific polling station assigned to your registered address. Check your booth at voters.eci.gov.in",
    verdict: false,
    category: "Process",
    icon: "📍",
  },
  {
    myth: "NOTA means your vote is wasted",
    fact: "NOTA (None of the Above) is a valid vote that expresses dissatisfaction with all candidates. It counts toward total votes and is recorded officially.",
    verdict: false,
    category: "NOTA",
    icon: "❎",
  },
  {
    myth: "You can vote multiple times",
    fact: "Each voter can vote ONCE only. Your finger is marked with indelible ink that lasts several days to prevent double voting.",
    verdict: false,
    category: "Process",
    icon: "☝️",
  },
];

const Myths = () => {
  const [flipped, setFlipped] = useState({});
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(myths.map((m) => m.category))];
  const filtered = filter === "All" ? myths : myths.filter((m) => m.category === filter);

  const toggleFlip = (i) => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="myths-heading">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">💡</span>
          <h1 id="myths-heading" className="section-title mb-3">Myths vs Facts</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Tap each card to reveal the truth about common election misconceptions.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-primary-600 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
              }`}
              aria-pressed={filter === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtered.map((item, i) => (
            <article key={i} className="relative" style={{ perspective: "1000px" }}>
              <div
                className={`relative transition-transform duration-500 cursor-pointer`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "180px",
                }}
                onClick={() => toggleFlip(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleFlip(i)}
                tabIndex={0}
                role="button"
                aria-pressed={!!flipped[i]}
                aria-label={`${item.myth}. Click to reveal fact.`}
              >
                {/* Front — MYTH */}
                <div
                  className="absolute inset-0 glass rounded-2xl p-6 shadow-lg border-2 border-red-200 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                      <span className="text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Myth
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{item.category}</span>
                    </div>
                    <p className="text-gray-800 font-medium text-sm leading-relaxed">"{item.myth}"</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">👆 Tap to see the truth</p>
                </div>

                {/* Back — FACT */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border-2 border-emerald-300 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl" aria-hidden="true">✅</span>
                      <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Fact
                      </span>
                    </div>
                    <p className="text-emerald-800 text-sm leading-relaxed font-medium">{item.fact}</p>
                  </div>
                  <p className="text-xs text-emerald-500 mt-4 text-center">✓ Verified by Election Commission of India</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          All facts are based on information from the Election Commission of India.{" "}
          <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
            eci.gov.in
          </a>
        </p>
      </div>
    </main>
  );
};

export default Myths;
