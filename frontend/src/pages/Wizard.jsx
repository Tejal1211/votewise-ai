import { useState } from "react";

const steps = [
  { id: 1, title: "Your Age", field: "age", type: "number", placeholder: "Enter your age", icon: "🎂" },
  { id: 2, title: "Your State", field: "state", type: "select", icon: "🗺️", options: ["Andhra Pradesh","Bihar","Delhi","Gujarat","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"] },
  { id: 3, title: "First-time voter?", field: "firstTime", type: "radio", icon: "🗳️", options: ["Yes, first time!", "No, voted before"] },
  { id: 4, title: "Need assistance?", field: "assistance", type: "radio", icon: "♿", options: ["No assistance needed", "Visual impairment", "Physical disability", "Elderly support needed"] },
];

const generateGuidance = (answers) => {
  const age = parseInt(answers.age);
  const isFirstTime = answers.firstTime === "Yes, first time!";
  const needsAssistance = answers.assistance !== "No assistance needed";
  const guidance = [];

  if (age < 18) {
    guidance.push({ icon: "⏳", title: "Not Yet Eligible", desc: `You need to be 18 years old to vote. You have ${18 - age} more year(s) to go. Stay informed!` });
  } else if (age >= 18 && age <= 25) {
    guidance.push({ icon: "🌟", title: "Young Voter", desc: "As a young voter, your voice matters most! Many policies directly affect your generation." });
  } else if (age >= 60) {
    guidance.push({ icon: "🏅", title: "Senior Voter", desc: "As a senior citizen, you have priority access at polling booths. You may also request postal ballot." });
  }

  if (isFirstTime) {
    guidance.push({
      icon: "📝",
      title: "Step 1: Register to Vote",
      desc: "Visit voters.eci.gov.in and fill Form 6 to register. You'll need your Aadhaar card, photo, and address proof.",
    });
    guidance.push({
      icon: "🪪",
      title: "Step 2: Get Your Voter ID",
      desc: "After registration, you'll receive your EPIC (Voter ID Card). It's free and essential.",
    });
    guidance.push({
      icon: "📍",
      title: "Step 3: Find Your Booth",
      desc: "Use the Voter Helpline app or voters.eci.gov.in to find your assigned polling station.",
    });
  } else {
    guidance.push({
      icon: "✅",
      title: "Verify Your Details",
      desc: "Check that your name, address, and photo are correct in the voter list. Update via Form 8 if needed.",
    });
  }

  if (needsAssistance) {
    guidance.push({
      icon: "♿",
      title: "Accessibility Support",
      desc: `${answers.assistance}: Polling stations have ramps and priority lanes. You can bring an escort and request assisted voting (Form 14A). Contact your booth officer in advance.`,
    });
  }

  if (answers.state) {
    guidance.push({
      icon: "🗺️",
      title: `Voting in ${answers.state}`,
      desc: `Voter Helpline: 1950. Visit ceoof${answers.state.toLowerCase().replace(/ /g, "")}.nic.in or the national ECI website for state-specific election schedules.`,
    });
  }

  guidance.push({
    icon: "📱",
    title: "Download Voter Helpline App",
    desc: "Install the 'Voter Helpline' app from Google Play for reminders, booth location, voter slip download, and complaints.",
  });

  return guidance;
};

const Wizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [guidance, setGuidance] = useState([]);

  const step = steps[currentStep];

  const handleNext = () => {
    if (!answers[step.field] && step.field !== "assistance") return;
    if (currentStep === steps.length - 1) {
      setGuidance(generateGuidance(answers));
      setDone(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => setCurrentStep((s) => s - 1);

  const reset = () => { setCurrentStep(0); setAnswers({}); setDone(false); setGuidance([]); };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (done) {
    return (
      <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="wizard-result-heading">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">🎯</span>
            <h1 id="wizard-result-heading" className="section-title mb-2">Your Personalized Guide</h1>
            <p className="text-gray-500 text-sm">Based on your profile, here's exactly what you need to do</p>
          </div>

          <div className="space-y-4">
            {guidance.map((g, i) => (
              <div key={i} className="card shadow-lg animate-fade-in flex gap-4 items-start" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl flex-shrink-0" aria-hidden="true">{g.icon}</div>
                <div>
                  <h2 className="font-semibold text-gray-900 mb-1">{g.title}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={reset} className="btn-secondary flex-1">Start Over</button>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-center">
              Register to Vote →
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="wizard-heading">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🎯</span>
          <h1 id="wizard-heading" className="section-title mb-2">Voting Wizard</h1>
          <p className="text-gray-500 text-sm">Answer {steps.length} quick questions for personalized guidance</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="card shadow-xl animate-fade-in">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block" aria-hidden="true">{step.icon}</span>
            <h2 className="font-display text-xl font-bold text-primary-900">{step.title}</h2>
          </div>

          {step.type === "number" && (
            <input
              type="number"
              min="1"
              max="120"
              value={answers[step.field] || ""}
              onChange={(e) => setAnswers({ ...answers, [step.field]: e.target.value })}
              className="input-field text-center text-2xl font-bold text-primary-700 mb-6"
              placeholder={step.placeholder}
              aria-label={step.title}
              autoFocus
            />
          )}

          {step.type === "select" && (
            <select
              value={answers[step.field] || ""}
              onChange={(e) => setAnswers({ ...answers, [step.field]: e.target.value })}
              className="input-field mb-6"
              aria-label={step.title}
            >
              <option value="">Select your state</option>
              {step.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {step.type === "radio" && (
            <div className="space-y-3 mb-6" role="radiogroup" aria-label={step.title}>
              {step.options.map((opt) => (
                <label key={opt} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${answers[step.field] === opt ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:border-primary-200"}`}>
                  <input
                    type="radio"
                    name={step.field}
                    value={opt}
                    checked={answers[step.field] === opt}
                    onChange={() => setAnswers({ ...answers, [step.field]: opt })}
                    className="accent-primary-600"
                  />
                  <span className="text-sm font-medium text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button onClick={handleBack} className="btn-secondary flex-1">← Back</button>
            )}
            <button
              onClick={handleNext}
              disabled={!answers[step.field]}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length - 1 ? "Generate My Guide 🎯" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Wizard;
