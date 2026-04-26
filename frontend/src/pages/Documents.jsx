import { useState } from "react";

const documentGroups = [
  {
    title: "Identity Proof (Any One)",
    icon: "🪪",
    color: "from-blue-500 to-indigo-500",
    docs: [
      { id: "voter_id", label: "Voter ID Card (EPIC)", required: true, note: "Most preferred — issued by Election Commission" },
      { id: "aadhar", label: "Aadhaar Card", required: false, note: "Accepted as supplementary ID" },
      { id: "passport", label: "Indian Passport", required: false, note: "Valid passport accepted" },
      { id: "dl", label: "Driving Licence", required: false, note: "With photo, issued by RTO" },
      { id: "pan", label: "PAN Card", required: false, note: "Accepted with photo" },
    ],
  },
  {
    title: "Address Proof (If needed)",
    icon: "🏠",
    color: "from-emerald-500 to-teal-500",
    docs: [
      { id: "utility", label: "Utility Bills (Electricity/Water/Gas)", required: false, note: "Not older than 3 months" },
      { id: "bank_stmt", label: "Bank Statement / Passbook", required: false, note: "With address, recent" },
      { id: "ration", label: "Ration Card", required: false, note: "With photo" },
      { id: "rent_agree", label: "Registered Rent Agreement", required: false, note: "If renting" },
    ],
  },
  {
    title: "On Voting Day",
    icon: "🗳️",
    color: "from-amber-500 to-orange-500",
    docs: [
      { id: "voter_slip", label: "Voter Information Slip", required: true, note: "Issued by Election Commission before election" },
      { id: "photo_id", label: "Photo ID (any accepted)", required: true, note: "Mandatory to carry to polling station" },
    ],
  },
];

const Documents = () => {
  const [checked, setChecked] = useState({});

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const allDocs = documentGroups.flatMap((g) => g.docs);
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((checkedCount / allDocs.length) * 100);

  return (
    <main className="min-h-screen mesh-bg pt-20 px-4 pb-16" aria-labelledby="docs-heading">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">📋</span>
          <h1 id="docs-heading" className="section-title mb-3">Document Checklist</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Make sure you have the right documents before heading to the polling booth.
          </p>
        </div>

        {/* Progress */}
        <div className="card shadow-lg mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Your Progress</span>
            <span className="text-sm font-bold text-primary-600">{checkedCount}/{allDocs.length} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bg-gradient-to-r from-primary-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{progress === 100 ? "✅ You're ready to vote!" : "Keep checking items as you gather them"}</p>
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {documentGroups.map((group) => (
            <section key={group.title} className="card shadow-lg animate-fade-in" aria-labelledby={`group-${group.title}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center text-xl shadow-md`} aria-hidden="true">
                  {group.icon}
                </div>
                <h2 id={`group-${group.title}`} className="font-semibold text-gray-900">{group.title}</h2>
              </div>

              <ul className="space-y-3" role="list">
                {group.docs.map((doc) => (
                  <li key={doc.id}>
                    <label
                      htmlFor={doc.id}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        checked[doc.id] ? "bg-emerald-50 border border-emerald-200" : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        id={doc.id}
                        type="checkbox"
                        checked={!!checked[doc.id]}
                        onChange={() => toggle(doc.id)}
                        className="mt-0.5 w-4 h-4 rounded accent-primary-600 cursor-pointer"
                        aria-describedby={`${doc.id}-note`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${checked[doc.id] ? "line-through text-gray-400" : "text-gray-800"}`}>
                            {doc.label}
                          </span>
                          {doc.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Required</span>
                          )}
                        </div>
                        <p id={`${doc.id}-note`} className="text-xs text-gray-400 mt-0.5">{doc.note}</p>
                      </div>
                      {checked[doc.id] && <span className="text-emerald-500 text-lg" aria-label="Checked">✓</span>}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <button
          onClick={() => setChecked({})}
          className="btn-secondary w-full mt-6 text-sm"
          aria-label="Reset all checkboxes"
        >
          Reset Checklist
        </button>
      </div>
    </main>
  );
};

export default Documents;
