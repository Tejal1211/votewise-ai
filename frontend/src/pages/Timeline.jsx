const timelineEvents = [
  {
    id: 1,
    date: "Jan 15, 2024",
    title: "Voter Registration Opens",
    desc: "Citizens can apply for new voter IDs or update existing records on the NVSP portal.",
    icon: "📝",
    color: "from-blue-500 to-indigo-500",
    status: "completed",
  },
  {
    id: 2,
    date: "Feb 28, 2024",
    title: "Registration Deadline",
    desc: "Last date to submit Form 6 (new registration) or Form 8 (corrections) online or at BLO.",
    icon: "⏰",
    color: "from-amber-500 to-orange-500",
    status: "completed",
  },
  {
    id: 3,
    date: "Mar 10, 2024",
    title: "Model Code of Conduct",
    desc: "Model Code of Conduct comes into effect. All political parties must follow election rules.",
    icon: "📋",
    color: "from-purple-500 to-pink-500",
    status: "completed",
  },
  {
    id: 4,
    date: "Mar 20, 2024",
    title: "Nomination Filing",
    desc: "Candidates file their nomination papers with the Returning Officer of their constituency.",
    icon: "🗂️",
    color: "from-teal-500 to-cyan-500",
    status: "completed",
  },
  {
    id: 5,
    date: "Mar 28, 2024",
    title: "Scrutiny of Nominations",
    desc: "Returning Officers scrutinize nomination papers for validity and completeness.",
    icon: "🔍",
    color: "from-violet-500 to-purple-500",
    status: "upcoming",
  },
  {
    id: 6,
    date: "Apr 19, 2024",
    title: "🗳️ Voting Day — Phase 1",
    desc: "Polling stations open from 7 AM to 6 PM. All eligible registered voters can cast their ballot.",
    icon: "🗳️",
    color: "from-primary-600 to-indigo-700",
    status: "voting",
    highlight: true,
  },
  {
    id: 7,
    date: "Jun 4, 2024",
    title: "Vote Counting",
    desc: "Electronic Voting Machine (EVM) votes are counted under the supervision of Election Commission officials.",
    icon: "🔢",
    color: "from-emerald-500 to-green-600",
    status: "upcoming",
  },
  {
    id: 8,
    date: "Jun 4, 2024",
    title: "Results Declaration",
    desc: "Final election results are announced. Winners are officially declared by Returning Officers.",
    icon: "🏆",
    color: "from-yellow-500 to-amber-600",
    status: "upcoming",
  },
];

const Timeline = () => (
  <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="timeline-heading">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <span className="text-5xl mb-4 block">📅</span>
        <h1 id="timeline-heading" className="section-title mb-3">Election Timeline</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Track every important date in the election process — from registration to results.
        </p>
      </div>

      <ol className="relative" aria-label="Election timeline">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-300 via-primary-400 to-primary-200" aria-hidden="true"></div>

        {timelineEvents.map((event, i) => (
          <li
            key={event.id}
            className={`relative flex gap-5 mb-8 animate-fade-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {/* Circle */}
            <div className="relative z-10 flex-shrink-0">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${event.color} flex items-center justify-center text-xl shadow-lg ${
                  event.highlight ? "ring-4 ring-primary-300 ring-offset-2" : ""
                }`}
                aria-hidden="true"
              >
                {event.icon}
              </div>
              {event.highlight && (
                <div className="absolute inset-0 rounded-full bg-primary-400/30 animate-ping" aria-hidden="true"></div>
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 glass rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow ${
                event.highlight ? "border-2 border-primary-300 bg-primary-50/80" : ""
              }`}
            >
              <time className="text-xs font-semibold text-primary-500 uppercase tracking-wider">{event.date}</time>
              <h2 className={`font-semibold text-base mt-0.5 mb-1.5 ${event.highlight ? "text-primary-800" : "text-gray-900"}`}>
                {event.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{event.desc}</p>

              {event.status === "completed" && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  ✅ Completed
                </span>
              )}
              {event.status === "voting" && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full">
                  🔴 Key Date
                </span>
              )}
              {event.status === "upcoming" && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  ⏳ Upcoming
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="glass rounded-2xl p-6 mt-6 text-center border border-amber-200 bg-amber-50/60">
        <p className="text-sm text-amber-800 font-medium">
          📢 Dates shown are for the 2024 Lok Sabha Elections. For state elections and precise dates, visit{" "}
          <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">
            eci.gov.in
          </a>
        </p>
      </div>
    </div>
  </main>
);

export default Timeline;
