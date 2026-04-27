// Mock data for election dates (in a real app, this would come from a database or API)
// Updated for 2026 election cycle
const ELECTION_DATES = {
  registrationOpens: "2026-02-01",
  registrationCloses: "2026-02-15",
  nominationOpens: "2026-03-01",
  nominationCloses: "2026-03-10",
  votingDay: "2026-04-15",
  countingDay: "2026-04-16",
  resultDay: "2026-04-17",
};

// Get election timeline
const getElectionTimeline = async (req, res) => {
  try {
    const timeline = [
      {
        id: 1,
        title: "Voter Registration Opens",
        date: ELECTION_DATES.registrationOpens,
        description: "Start registering to vote at your local election office",
        status: "upcoming",
      },
      {
        id: 2,
        title: "Voter Registration Closes",
        date: ELECTION_DATES.registrationCloses,
        description: "Last day to register for upcoming elections",
        status: "upcoming",
      },
      {
        id: 3,
        title: "Nomination Period Opens",
        date: ELECTION_DATES.nominationOpens,
        description: "Candidates can file their nominations",
        status: "upcoming",
      },
      {
        id: 4,
        title: "Nomination Period Closes",
        date: ELECTION_DATES.nominationCloses,
        description: "Last day for candidate nominations",
        status: "upcoming",
      },
      {
        id: 5,
        title: "Election Day",
        date: ELECTION_DATES.votingDay,
        description: "Cast your vote at your polling station",
        status: "upcoming",
      },
      {
        id: 6,
        title: "Vote Counting",
        date: ELECTION_DATES.countingDay,
        description: "Election results are tabulated",
        status: "upcoming",
      },
      {
        id: 7,
        title: "Results Announced",
        date: ELECTION_DATES.resultDay,
        description: "Final election results are declared",
        status: "upcoming",
      },
    ];

    res.json({ timeline });
  } catch (err) {
    console.error("Timeline error:", err.message);
    res.status(500).json({ error: "Failed to fetch election timeline" });
  }
};

// Get document checklist
const getDocumentChecklist = async (req, res) => {
  try {
    const checklist = [
      {
        id: 1,
        title: "Identity Proof",
        description: "Aadhaar Card, Voter ID, Passport, or Driving License",
        required: true,
        completed: false,
      },
      {
        id: 2,
        title: "Address Proof",
        description: "Utility bill, bank statement, or rental agreement",
        required: true,
        completed: false,
      },
      {
        id: 3,
        title: "Age Proof",
        description: "Birth certificate, school certificate, or passport",
        required: true,
        completed: false,
      },
      {
        id: 4,
        title: "Voter Slip",
        description: "Previous election voter slip (if available)",
        required: false,
        completed: false,
      },
      {
        id: 5,
        title: "Recent Photograph",
        description: "Passport-size color photograph",
        required: true,
        completed: false,
      },
    ];

    res.json({ checklist });
  } catch (err) {
    console.error("Checklist error:", err.message);
    res.status(500).json({ error: "Failed to fetch document checklist" });
  }
};

// Get myths and facts
const getMythsAndFacts = async (req, res) => {
  try {
    const myths = [
      {
        id: 1,
        myth: "Voting is compulsory in India",
        fact: "Voting is not compulsory in India. It's a right, not an obligation.",
        category: "rights",
      },
      {
        id: 2,
        myth: "You need money to vote",
        fact: "Voting is completely free. No fees or bribes required.",
        category: "costs",
      },
      {
        id: 3,
        myth: "Your vote is public and can be traced",
        fact: "Indian elections use Electronic Voting Machines (EVMs) with VVPAT. Your vote remains completely anonymous.",
        category: "privacy",
      },
      {
        id: 4,
        myth: "Only educated people can vote",
        fact: "Anyone who is 18+ and an Indian citizen can vote, regardless of education level.",
        category: "eligibility",
      },
      {
        id: 5,
        myth: "You can vote from anywhere in India",
        fact: "You must vote from your registered constituency. You cannot vote from any polling station.",
        category: "process",
      },
      {
        id: 6,
        myth: "NOTA means your vote is wasted",
        fact: "NOTA (None of the Above) is a valid choice that helps improve election quality.",
        category: "nota",
      },
    ];

    res.json({ myths });
  } catch (err) {
    console.error("Myths error:", err.message);
    res.status(500).json({ error: "Failed to fetch myths and facts" });
  }
};

// Get wizard guidance based on user inputs
const getWizardGuidance = async (req, res) => {
  try {
    const { age, state, firstTimeVoter, needsAssistance } = req.body;

    let guidance = {
      steps: [],
      recommendations: [],
      resources: [],
    };

    const ageNum = parseInt(age);

    // Age-based guidance
    if (ageNum < 18) {
      guidance.steps.push({
        title: "Wait for Eligibility",
        description: `You will be eligible to vote in ${18 - ageNum} years. Stay informed about elections!`,
        action: "Learn about voting rights",
      });
    } else if (ageNum >= 18 && ageNum <= 25) {
      guidance.recommendations.push(
        "As a young voter, your participation is crucial for India's future!"
      );
    } else if (ageNum >= 60) {
      guidance.recommendations.push("Senior citizens get priority assistance at polling stations.");
      guidance.recommendations.push(
        "You may be eligible for postal voting if mobility is an issue."
      );
    }

    // First-time voter guidance
    if (firstTimeVoter === "yes") {
      guidance.steps.push({
        title: "Check Voter Registration",
        description: "Visit voters.eci.gov.in to check if you're already registered",
        action: "Verify registration",
      });
      guidance.steps.push({
        title: "Register if Needed",
        description: "Fill Form 6 at your local election office if not registered",
        action: "Register to vote",
      });
      guidance.steps.push({
        title: "Collect EPIC Card",
        description: "Your Elector's Photo Identity Card (EPIC) will be delivered by post",
        action: "Wait for EPIC card",
      });
    } else {
      guidance.steps.push({
        title: "Verify Registration",
        description: "Confirm your details are correct on the electoral roll",
        action: "Check voter list",
      });
      guidance.steps.push({
        title: "Update Details if Changed",
        description: "Fill Form 8 if your address or other details have changed",
        action: "Update information",
      });
    }

    // State-specific guidance
    if (state) {
      guidance.resources.push({
        title: `${state} Chief Electoral Officer`,
        description: `Contact your state election office for ${state}-specific guidance`,
        url: `https://eci.gov.in/`,
      });
    }

    // Assistance needs
    if (needsAssistance === "yes") {
      guidance.recommendations.push(
        "You can request assistance under Rule 49MA of the Conduct of Election Rules, 1961"
      );
      guidance.recommendations.push("Bring a companion who can help you vote");
      guidance.steps.push({
        title: "Request Assistance",
        description: "Inform polling officials about your assistance needs",
        action: "Get help at polling station",
      });
    }

    // Common steps for all eligible voters
    if (ageNum >= 18) {
      guidance.steps.push({
        title: "Find Your Polling Station",
        description: "Use the Election Commission website to locate your polling station",
        action: "Locate polling station",
      });
      guidance.steps.push({
        title: "Vote on Election Day",
        description: "Bring your EPIC card and ID proof to your polling station",
        action: "Cast your vote",
      });
    }

    res.json(guidance);
  } catch (err) {
    console.error("Wizard error:", err.message);
    res.status(500).json({ error: "Failed to generate voting guidance" });
  }
};

module.exports = {
  getElectionTimeline,
  getDocumentChecklist,
  getMythsAndFacts,
  getWizardGuidance,
};
