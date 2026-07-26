export const EXAMS = [
  { subject: "Applied Chemistry", code: "BACHY105", slot: "B2+TB2", date: "2026-08-10", time: "02:00 PM - 03:30 PM", color: "#ef6461", priority: 1 },
  { subject: "Multivariable Calculus", code: "BAMAT101", slot: "E2+TE2", date: "2026-08-13", time: "02:00 PM - 03:30 PM", color: "#39a0ed", priority: 2 },
  { subject: "Technical English", code: "BAENG101", slot: "F2+TF2", date: "2026-08-14", time: "02:00 PM - 03:30 PM", color: "#f4b942", priority: 1 },
  { subject: "Basic Engineering", code: "BAEEE101", slot: "G2+TG2", date: "2026-08-16", time: "02:00 PM - 03:30 PM", color: "#42c79b", priority: 3 }
];

export const TIMETABLE = {
  0: {
    classes: [
      { time: "08:00 - 09:40", name: "Multivariable Calculus", meta: "ELA · L1+L2 · PRP119", tag: "ELA" },
      { time: "03:00 - 03:50", name: "Technical English Communication", meta: "ETH · F2+TF2 · PRP112", tag: "ETH" },
      { time: "05:00 - 05:50", name: "Applied Chemistry", meta: "ETH · B2+TB2 · PRP112", tag: "ETH" },
      { time: "06:00 - 06:50", name: "Basic Engineering", meta: "ETH · G2+TG2 · PRP112", tag: "ETH" }
    ],
    study: [
      { time: "06:00 - 08:00", subject: "Applied Chemistry", task: "Revision + Previous year problems", duration: "2h", priority: 1 },
      { time: "10:00 - 12:00", subject: "Technical English", task: "Grammar + Writing practice", duration: "2h", priority: 1 },
      { time: "01:00 - 03:00", subject: "Multivariable Calculus", task: "Problem solving: Differential equations", duration: "2h", priority: 2 },
      { time: "04:00 - 05:00", subject: "Applied Chemistry", task: "Quick review of formulas", duration: "1h", priority: 1 },
      { time: "07:00 - 08:30", subject: "Technical English", task: "Vocabulary + Reading comprehension", duration: "1.5h", priority: 1 },
      { time: "08:30 - 09:30", subject: "Basic Engineering", task: "Light review of concepts", duration: "1h", priority: 3 }
    ]
  },
  1: {
    classes: [
      { time: "11:40 - 01:20", name: "Problem Solving using Python", meta: "LO · L15+L16+L29+L30 · PRP118", tag: "LO" },
      { time: "02:00 - 02:50", name: "Multivariable Calculus", meta: "ETH · E2+TE2 · PRP112", tag: "ETH" },
      { time: "05:00 - 05:50", name: "Technical English Communication", meta: "ETH · F2+TF2 · PRP112", tag: "ETH" }
    ],
    study: [
      { time: "07:00 - 09:00", subject: "Applied Chemistry", task: "Organic chemistry + Numericals", duration: "2h", priority: 1 },
      { time: "09:00 - 11:00", subject: "Technical English", task: "Essay writing + Error correction", duration: "2h", priority: 1 },
      { time: "03:00 - 05:00", subject: "Applied Chemistry", task: "Lab concepts + Equations", duration: "2h", priority: 1 },
      { time: "06:00 - 07:30", subject: "Technical English", task: "Previous CAT papers", duration: "1.5h", priority: 1 }
    ]
  },
  2: {
    classes: [
      { time: "09:51 - 11:30", name: "Applied Chemistry", meta: "ELA · L21+L22 · PRPG07", tag: "ELA" },
      { time: "03:00 - 03:50", name: "Applied Chemistry", meta: "ETH · B2+TB2 · PRP112", tag: "ETH" },
      { time: "04:00 - 04:50", name: "Basic Engineering", meta: "ETH · G2+TG2 · PRP112", tag: "ETH" },
      { time: "05:00 - 05:50", name: "Multivariable Calculus", meta: "ETH · E2+TE2 · PRP112", tag: "ETH" }
    ],
    study: [
      { time: "07:00 - 09:00", subject: "Technical English", task: "Reading comprehension + Vocabulary", duration: "2h", priority: 1 },
      { time: "11:30 - 01:00", subject: "Applied Chemistry", task: "Physical chemistry problems", duration: "1.5h", priority: 1 },
      { time: "02:00 - 03:00", subject: "Multivariable Calculus", task: "Partial derivatives practice", duration: "1h", priority: 2 },
      { time: "06:00 - 08:00", subject: "Applied Chemistry", task: "Inorganic chemistry revision", duration: "2h", priority: 1 }
    ]
  },
  3: {
    classes: [
      { time: "08:00 - 09:40", name: "Technical English Communication", meta: "ELA · L13+L14 · PRP554", tag: "ELA" },
      { time: "09:51 - 11:30", name: "Problem Solving using Python", meta: "LO · L15+L16+L29+L30 · PRP118", tag: "LO" },
      { time: "04:00 - 04:50", name: "Technical English Communication", meta: "ETH · F2+TF2 · PRP112", tag: "ETH" }
    ],
    study: [
      { time: "06:00 - 08:00", subject: "Applied Chemistry", task: "Chemical bonding + Periodic table", duration: "2h", priority: 1 },
      { time: "10:00 - 12:00", subject: "Technical English", task: "Grammar rules + Sentence correction", duration: "2h", priority: 1 },
      { time: "01:00 - 03:00", subject: "Multivariable Calculus", task: "Multiple integrals + Vector calculus", duration: "2h", priority: 2 },
      { time: "03:00 - 04:00", subject: "Basic Engineering", task: "Engineering mechanics basics", duration: "1h", priority: 3 },
      { time: "05:00 - 06:30", subject: "Technical English", task: "Mock test practice", duration: "1.5h", priority: 1 }
    ]
  },
  4: {
    classes: [
      { time: "09:51 - 11:30", name: "Basic Engineering", meta: "ELA · L9+L10 · TT344", tag: "ELA" },
      { time: "02:00 - 02:50", name: "Applied Chemistry", meta: "ETH · B2+TB2 · PRP112", tag: "ETH" },
      { time: "03:00 - 03:50", name: "Basic Engineering", meta: "ETH · G2+TG2 · PRP112", tag: "ETH" },
      { time: "04:00 - 04:50", name: "Multivariable Calculus", meta: "ETH · E2+TE2 · PRP112", tag: "ETH" }
    ],
    study: [
      { time: "07:00 - 09:00", subject: "Applied Chemistry", task: "Electrochemistry + Numericals", duration: "2h", priority: 1 },
      { time: "11:30 - 01:00", subject: "Technical English", task: "Report writing + Formal letters", duration: "1.5h", priority: 1 },
      { time: "05:00 - 07:00", subject: "Applied Chemistry", task: "Revision of weak topics", duration: "2h", priority: 1 },
      { time: "07:00 - 08:00", subject: "Basic Engineering", task: "Circuit diagrams review", duration: "1h", priority: 3 }
    ]
  },
  5: {
    classes: [],
    study: [
      { time: "08:00 - 12:00", subject: "Applied Chemistry", task: "Full syllabus revision + PYQs", duration: "4h", priority: 1 },
      { time: "01:00 - 04:00", subject: "Technical English", task: "Complete mock test + Analysis", duration: "3h", priority: 1 },
      { time: "05:00 - 07:00", subject: "Multivariable Calculus", task: "Difficult problems + Formula sheet", duration: "2h", priority: 2 },
      { time: "07:30 - 08:30", subject: "Basic Engineering", task: "Key concepts + Diagrams", duration: "1h", priority: 3 }
    ]
  },
  6: {
    classes: [],
    study: [
      { time: "08:00 - 11:00", subject: "Technical English", task: "Weak areas + Extra practice", duration: "3h", priority: 1 },
      { time: "12:00 - 03:00", subject: "Applied Chemistry", task: "Mock test + Error analysis", duration: "3h", priority: 1 },
      { time: "04:00 - 06:00", subject: "Multivariable Calculus", task: "Revision + Quick formulas", duration: "2h", priority: 2 },
      { time: "06:30 - 07:30", subject: "Problem Solving (Python)", task: "Code practice + Logic building", duration: "1h", priority: 3 }
    ]
  }
};

export const TIPS = [
  { title: "Active recall", text: "Close your book and write down everything you remember about a topic. Check what you missed." },
  { title: "Pomodoro technique", text: "Study for 25 minutes, then take a 5-minute break. After 4 cycles, take a 15-minute break." },
  { title: "Spaced repetition", text: "Review difficult topics after 1 day, 3 days, and 7 days to move them to long-term memory." },
  { title: "Teach someone", text: "Explain a concept aloud as if teaching a friend. If you get stuck, that is your weak spot." },
  { title: "Sleep consolidates memory", text: "A good night's sleep after studying helps your brain store information better." },
  { title: "Hydration affects focus", text: "Even mild dehydration can reduce concentration. Keep a water bottle at your desk." },
  { title: "Interleaving subjects", text: "Switch between Chemistry and English rather than doing one subject for 4 hours straight." },
  { title: "Practice old papers", text: "CAT1 often repeats question patterns. Solve at least 3 previous year papers per subject." },
  { title: "Mind maps", text: "Draw connections between concepts. Visual memory is stronger than text memory." },
  { title: "Start with the hardest", text: "Tackle Chemistry or English first when your energy is highest." },
  { title: "Write, do not just read", text: "Taking notes by hand improves retention compared to typing or just reading." }
];

export const SUBJECT_PROGRESS = {
  "Applied Chemistry": { pct: 35, color: "#ef6461" },
  "Technical English": { pct: 40, color: "#f4b942" },
  "Multivariable Calculus": { pct: 50, color: "#39a0ed" },
  "Basic Engineering": { pct: 55, color: "#42c79b" },
  "Problem Solving (Python)": { pct: 60, color: "#9b7ede" }
};

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
