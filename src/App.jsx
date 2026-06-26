import { useState, useCallback } from "react";

// ── Hardcoded seed questions from the NC DMV Handbook ─────────────────────
// These always work offline and serve as a guaranteed fallback
const SEED_QUESTIONS = [
  { question: "What is the legal blood alcohol concentration (BAC) limit for drivers 21 and older in NC?", options: ["0.04%", "0.06%", "0.08%", "0.10%"], correct: 2, explanation: "In NC, a BAC of 0.08% or higher means you are legally impaired. For commercial drivers the limit is 0.04%, and for drivers under 21 any BAC of 0.01% or more is a violation." },
  { question: "When must you stop for a school bus in NC?", options: ["Only if you are behind the bus", "When the stop arm is extended and lights are flashing, in both directions on undivided roads", "Only on two-lane roads", "Whenever the bus is parked at a curb"], correct: 1, explanation: "You must stop when a school bus has its stop sign extended and lights flashing. On divided highways with a median, only traffic behind the bus must stop." },
  { question: "What is the default speed limit in cities and towns in NC unless otherwise posted?", options: ["25 mph", "30 mph", "35 mph", "45 mph"], correct: 2, explanation: "The default speed limit in cities and towns in NC is 35 mph unless a different speed is posted." },
  { question: "How far from a fire hydrant are you prohibited from parking?", options: ["10 feet", "15 feet", "20 feet", "25 feet"], correct: 1, explanation: "NC law prohibits parking within 15 feet of a fire hydrant." },
  { question: "At a 4-way stop with two cars arriving at the same time, who goes first?", options: ["The car on the left", "The car on the right", "The car going straight", "The heavier vehicle"], correct: 1, explanation: "When two vehicles reach a 4-way stop simultaneously, you must yield to the vehicle on your right." },
  { question: "What does a flashing red traffic light mean?", options: ["Slow down and proceed with caution", "Stop completely, then proceed when safe", "The light is about to turn green", "Yield to cross traffic only"], correct: 1, explanation: "A flashing red light must be treated like a stop sign — come to a complete stop, then proceed when it is safe to do so." },
  { question: "What is the minimum following distance recommended under good driving conditions?", options: ["1 second", "2 seconds", "3 seconds", "4 seconds"], correct: 1, explanation: "The two-second rule applies: pick a fixed object, and when the car ahead passes it, count 'one-thousand-one, one-thousand-two.' Increase this in bad conditions." },
  { question: "What does a solid yellow center line on your side of the road mean?", options: ["You may pass when safe", "No passing allowed on your side", "The road is about to end", "Two-way traffic ahead"], correct: 1, explanation: "A solid yellow line on your side means no passing is allowed from your direction. You must stay behind it." },
  { question: "When driving at night, you must switch to low beams when within how many feet of an oncoming vehicle?", options: ["200 feet", "300 feet", "500 feet", "1000 feet"], correct: 2, explanation: "NC law requires switching to low beams within 500 feet of an oncoming vehicle, and within 200 feet when following another vehicle." },
  { question: "How long must a driver under 18 hold a learner permit before getting a provisional license?", options: ["6 months", "9 months", "12 months", "18 months"], correct: 2, explanation: "Under NC's Graduated Licensing law, drivers under 18 must hold a learner permit for at least 12 months before qualifying for a provisional license." },
  { question: "What is the minimum liability insurance required for NC drivers (per person/per accident/property damage)?", options: ["15/30/5", "25/50/15", "30/60/25", "50/100/50"], correct: 2, explanation: "NC requires minimum liability insurance of $30,000 per person, $60,000 per accident, and $25,000 for property damage (30/60/25)." },
  { question: "What shape and color is a YIELD sign?", options: ["Red octagon", "Red triangle", "Yellow diamond", "White rectangle"], correct: 1, explanation: "A yield sign is a red (and white) downward-pointing triangle. It means slow down and give the right-of-way to traffic in the intersection or roadway you are entering." },
  { question: "When may you legally pass another vehicle on the right?", options: ["Any time there is room", "Only on highways with 3+ lanes", "When the vehicle ahead is turning left and there is room on the right", "Never"], correct: 2, explanation: "You may pass on the right only when the vehicle ahead is turning left and sufficient pavement to the right allows safe passing." },
  { question: "How many supervised driving hours must a NC learner permit holder complete, including night hours?", options: ["30 hours, 5 at night", "45 hours, 5 at night", "60 hours, 10 at night", "60 hours, 15 at night"], correct: 2, explanation: "NC requires 60 hours of supervised driving practice, including at least 10 hours at night, before a provisional license can be issued." },
  { question: "Under the Move Over Law, what must you do when approaching a stopped emergency vehicle with lights on?", options: ["Honk and slow to 20 mph", "Move over one lane if safe, or slow to a safe speed if you cannot", "Stop completely until it moves", "Maintain speed but stay in your lane"], correct: 1, explanation: "NC's Move Over Law requires drivers to move over one lane when possible, or slow to a safe speed if lane change is not possible, when passing stopped emergency, tow, or highway maintenance vehicles with lights on." },
  { question: "What color are warning signs in NC?", options: ["Red", "Orange", "Yellow", "White"], correct: 2, explanation: "Warning signs are yellow with black text or symbols. They alert drivers to upcoming hazards like curves, hills, or intersections." },
  { question: "If your BAC is under 21 years old in NC, what BAC level is a violation?", options: ["0.08% or more", "0.04% or more", "0.02% or more", "0.01% or more"], correct: 3, explanation: "For drivers under 21, any BAC of 0.01% or more is a violation under NC's zero-tolerance policy for underage drinking and driving." },
  { question: "What does a yellow diamond-shaped sign indicate?", options: ["Regulatory information like speed limits", "Warning of a potential hazard ahead", "Construction zone", "A guide to services"], correct: 1, explanation: "Yellow diamond-shaped signs are warning signs that alert you to potential hazards ahead, such as curves, intersections, or hills." },
  { question: "How far before a turn must you signal in NC?", options: ["50 feet", "100 feet", "150 feet", "200 feet"], correct: 1, explanation: "NC law requires you to signal at least 100 feet before making a turn to alert other drivers of your intentions." },
  { question: "What should you do if your vehicle starts to hydroplane?", options: ["Brake firmly and steer left", "Accelerate to regain traction", "Ease off the gas and steer straight; do not brake suddenly", "Turn on hazard lights and stop immediately"], correct: 2, explanation: "When hydroplaning, ease off the accelerator and steer straight. Do not brake suddenly, as this can cause loss of control. Allow the car to slow naturally until tires regain contact." },
  { question: "At what distance must headlights be turned on in NC?", options: ["When visibility drops below 200 feet", "When visibility drops below 400 feet", "30 minutes after sunset", "Only at night"], correct: 1, explanation: "NC law requires headlights when visibility is less than 400 feet, from dusk to dawn, and whenever windshield wipers are in use." },
  { question: "How close to a railroad crossing may you not park?", options: ["15 feet", "25 feet", "50 feet", "100 feet"], correct: 2, explanation: "You must not park within 50 feet of a railroad crossing in North Carolina." },
  { question: "Refusing a breathalyzer test in NC results in:", options: ["A warning only", "An immediate 30-day revocation plus 12-month civil revocation", "A $500 fine only", "A court appearance but no immediate action"], correct: 1, explanation: "Under NC's implied consent law, refusing a breathalyzer causes an immediate 30-day license revocation, followed by a 12-month civil revocation." },
  { question: "What does a blue rectangular road sign indicate?", options: ["Regulatory rules", "Warning of hazard", "Services like food, gas, or lodging", "Construction zone ahead"], correct: 2, explanation: "Blue signs indicate motorist services such as food, gas, lodging, hospitals, and rest areas." },
  { question: "When is it legal to make a U-turn in a business district in NC?", options: ["Any time traffic is clear", "Only at intersections", "Never in a business district", "Only during daylight hours"], correct: 1, explanation: "U-turns in a business district are illegal unless you are at an intersection. Even at intersections, U-turns are only allowed where not prohibited by signs." },
];

const TOPICS = [
  "Traffic Laws & Rules of the Road",
  "Road Signs & Pavement Markings",
  "Speed Limits & Following Distance",
  "Alcohol & DWI Laws",
  "Right-of-Way Rules",
  "Passing & Turning",
  "Parking Rules",
  "Emergency Situations",
  "Hazardous Driving Conditions",
  "Sharing the Road",
  "Graduated Licensing (Learner Permit)",
  "Vehicle Equipment & Insurance",
];

const HANDBOOK_SUMMARY = `NC DMV DRIVER HANDBOOK KEY RULES:
BAC limits: 0.08% age 21+, 0.04% commercial, 0.01% under-21. Refusing breathalyzer = 30-day + 12-month revocation.
Speed: 35 mph cities, 55 mph highways, 65-70 mph interstates. Pass stopped school bus = 5 pts.
Following distance: 2-second rule minimum. Signal 100 ft before turns.
Parking: 15 ft from hydrant, 20 ft from intersection, 50 ft from railroad crossing. No parking on bridges/tunnels.
Right of way: yield to right at uncontrolled intersections, first-to-stop at 4-way, always yield to pedestrians in crosswalks.
Passing: only on left, not in no-passing zones or within 100 ft of intersections/bridges/curves/railroad crossings.
Lights: low beams within 500 ft oncoming, 200 ft following. Headlights when visibility under 400 ft.
Signs: Red octagon=stop, red triangle=yield, yellow diamond=warning, orange=construction, blue=services, green=guide, brown=recreation.
Seat belts: required for all; driver responsible for passengers under 16. Child seat required under age 8 (unless 80+ lbs or 4'9"+).
School bus: stop when arm extended/lights flashing; divided highway = only traffic behind bus stops.
Learner permit: age 15+, hold 12 months, 60 hours supervised (10 at night). Provisional: no 9PM-5AM driving first 6 months.
Points: speeding 10 mph under = 2pts, over 10 mph = 3pts, reckless = 4pts, pass school bus = 5pts, 12pts in 3yrs = suspension.
Insurance required: 30/60/25 minimum. DWI penalties: Level 1 up to 2yrs jail $4000 fine; Level 2 up to 1yr $2000.
Hydroplaning: ease off gas, steer straight, don't brake hard. Skid: steer where you want front to go.
Move Over Law: move one lane or slow when passing stopped emergency/tow/maintenance vehicles.
Headlights required dusk to dawn and when wipers are on. Horn audible at 200 ft required.`;

const NUM_QUESTIONS = 25;
const PASS_SCORE = 80;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function generateAIQuestions(topic, count) {
  const topicLine = topic === "Mixed"
    ? `Generate ${count} varied multiple-choice questions covering different aspects of NC driving rules.`
    : `Generate ${count} multiple-choice questions focused on: ${topic}.`;

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are an NC DMV permit test generator. ${topicLine}

Use this reference material:
${HANDBOOK_SUMMARY}

Rules:
- Each question must have exactly 4 answer options
- Only one answer is correct
- Questions must be factual and based on NC law
- Do not repeat questions

Respond with ONLY a JSON array, nothing else. Format:
[{"question":"...","options":["choice1","choice2","choice3","choice4"],"correct":0,"explanation":"..."}]

The "correct" field is the 0-based index of the right answer in the options array.`
      }
    ]
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) throw new Error(data.error.message || "API error");

  const textBlock = data.content?.find(b => b.type === "text");
  if (!textBlock) throw new Error("No text in response");

  const raw = textBlock.text.trim();

  // Try multiple parse strategies
  // 1. Direct parse
  try { const r = JSON.parse(raw); if (Array.isArray(r) && r.length) return r; } catch(_) {}
  // 2. Strip fences
  try { const r = JSON.parse(raw.replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"")); if (Array.isArray(r) && r.length) return r; } catch(_) {}
  // 3. Extract [...] substring
  const s = raw.indexOf("["), e = raw.lastIndexOf("]");
  if (s !== -1 && e > s) {
    try { const r = JSON.parse(raw.slice(s, e+1)); if (Array.isArray(r) && r.length) return r; } catch(_) {}
  }

  throw new Error("Could not parse response: " + raw.slice(0, 100));
}

async function getQuestions(topic, count) {
  // Always try AI first, fall back to shuffled seeds
  try {
    const aiQs = await generateAIQuestions(topic, count);
    const valid = aiQs.filter(q =>
      q && typeof q.question === "string" && q.question.length > 5 &&
      Array.isArray(q.options) && q.options.length === 4 &&
      typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3
    );
    if (valid.length >= 5) return valid.slice(0, count);
    throw new Error("Not enough valid AI questions");
  } catch (aiErr) {
    console.warn("AI generation failed, using seed questions:", aiErr.message);
    return shuffle(SEED_QUESTIONS).slice(0, count);
  }
}

// ── Components ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 9,
        background: "linear-gradient(135deg, #003087 55%, #cc0000 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, color: "#fff", fontSize: 15, letterSpacing: -1,
      }}>NC</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>DMV Practice Test</div>
        <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>North Carolina Permit Exam</div>
      </div>
    </div>
  );
}

function ProgressBar({ current, total, correct }) {
  const pct = Math.round((current / total) * 100);
  const scorePct = current > 0 ? Math.round((correct / current) * 100) : 0;
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Question {current} of {total}</span>
        {current > 0 && (
          <span style={{ fontSize: 12, fontWeight: 700, color: scorePct >= PASS_SCORE ? "#16a34a" : "#dc2626" }}>
            {scorePct}% &mdash; {correct}/{current} correct
          </span>
        )}
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99, width: `${pct}%`,
          background: "linear-gradient(90deg, #003087, #cc0000)",
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

function Option({ label, text, state, onClick }) {
  const s = {
    default: { bg: "#fff", border: "#e2e8f0", color: "#1a1a2e", chip: "#f1f5f9", chipTxt: "#64748b" },
    selected: { bg: "#eff6ff", border: "#3b82f6", color: "#1e40af", chip: "#3b82f6", chipTxt: "#fff" },
    correct: { bg: "#f0fdf4", border: "#16a34a", color: "#15803d", chip: "#16a34a", chipTxt: "#fff" },
    wrong: { bg: "#fef2f2", border: "#dc2626", color: "#991b1b", chip: "#dc2626", chipTxt: "#fff" },
  }[state] || { bg: "#fff", border: "#e2e8f0", color: "#1a1a2e", chip: "#f1f5f9", chipTxt: "#64748b" };

  return (
    <button onClick={onClick} disabled={state !== "default" && state !== "selected"} style={{
      display: "flex", alignItems: "flex-start", gap: 12, width: "100%",
      padding: "13px 15px", marginBottom: 9, borderRadius: 12,
      background: s.bg, border: `2px solid ${s.border}`, color: s.color,
      cursor: state === "default" || state === "selected" ? "pointer" : "default",
      textAlign: "left", fontSize: 14, lineHeight: 1.5, fontFamily: "inherit",
      fontWeight: 500, transition: "all 0.15s",
    }}>
      <span style={{
        minWidth: 26, height: 26, borderRadius: 6, background: s.chip, color: s.chipTxt,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: 12, flexShrink: 0, marginTop: 1,
      }}>{label}</span>
      {text}
    </button>
  );
}

function Results({ correct, total, topic, onRetry, onHome }) {
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= PASS_SCORE;
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f8fafc, #e8eef7)", padding: 20,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 110, height: 110, borderRadius: "50%", margin: "0 auto 24px",
          background: passed ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#dc2626,#f87171)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: passed ? "0 8px 40px #16a34a55" : "0 8px 40px #dc262655",
          fontSize: 46,
        }}>{passed ? "🎉" : "📚"}</div>

        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1a1a2e", margin: "0 0 8px" }}>
          {passed ? "You Passed!" : "Keep Studying"}
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 28px" }}>
          {passed ? "Great work — you're ready for the real NC permit exam!" : `You need ${PASS_SCORE}% to pass. The real test also requires 80%.`}
        </p>

        <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 24px #0000000d", marginBottom: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 900, color: passed ? "#16a34a" : "#dc2626", lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 18 }}>{correct} correct out of {total}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Correct", val: correct, color: "#16a34a", bg: "#f0fdf4" },
              { label: "Incorrect", val: total - correct, color: "#dc2626", bg: "#fef2f2" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onHome} style={{
            flex: 1, padding: "14px 0", borderRadius: 12, border: "2px solid #e2e8f0",
            background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>← Home</button>
          <button onClick={onRetry} style={{
            flex: 2, padding: "14px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#003087,#1d4ed8)",
            color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Try Again →</button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home");
  const [topic, setTopic] = useState("Mixed");
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [usingSeeds, setUsingSeeds] = useState(false);

  const startQuiz = useCallback(async (t) => {
    setTopic(t);
    setScreen("loading");
    setIdx(0);
    setSelected(null);
    setRevealed(false);
    setCorrectCount(0);
    setUsingSeeds(false);

    let qs;
    try {
      const aiQs = await generateAIQuestions(t, NUM_QUESTIONS);
      const valid = aiQs.filter(q =>
        q && typeof q.question === "string" && q.question.length > 5 &&
        Array.isArray(q.options) && q.options.length === 4 &&
        typeof q.correct === "number" && q.correct >= 0 && q.correct <= 3
      );
      qs = valid.length >= 5 ? valid.slice(0, NUM_QUESTIONS) : null;
    } catch (_) { qs = null; }

    if (!qs) {
      qs = shuffle(SEED_QUESTIONS).slice(0, NUM_QUESTIONS);
      setUsingSeeds(true);
    }

    setQuestions(qs);
    setScreen("quiz");
  }, []);

  const q = questions[idx];

  const handleSelect = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.correct) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (idx + 1 >= questions.length) { setScreen("results"); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const optState = (i) => {
    if (!revealed) return selected === i ? "selected" : "default";
    if (i === q.correct) return "correct";
    if (i === selected) return "wrong";
    return "default";
  };

  // HOME
  if (screen === "home") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #f0f4ff 0%, #fef2f2 100%)", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 18px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <Logo />
          <div style={{ background: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#003087", border: "1px solid #e2e8f0" }}>2026 Edition</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg,#003087 0%,#1d4ed8 100%)",
          borderRadius: 22, padding: "32px 28px", marginBottom: 24, color: "#fff",
          boxShadow: "0 8px 40px #003087bb",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginBottom: 6, letterSpacing: 1 }}>AI-POWERED PRACTICE</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>NC Permit Test<br />Practice Exam</h1>
          <p style={{ fontSize: 13, opacity: 0.85, margin: "0 0 20px", lineHeight: 1.6 }}>
            {NUM_QUESTIONS} questions from the official NC DMV Driver Handbook. Score 80% or higher to pass — same as the real exam.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["📝", `${NUM_QUESTIONS} Questions`], ["⏱️", "~15 Min"], ["✅", "80% to Pass"]].map(([ic, lb]) => (
              <div key={lb} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                {ic} {lb}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => startQuiz("Mixed")} style={{
          width: "100%", padding: "17px 0", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg,#cc0000,#ef4444)",
          color: "#fff", fontWeight: 900, fontSize: 17, cursor: "pointer",
          fontFamily: "inherit", marginBottom: 18,
          boxShadow: "0 6px 24px #cc000055",
        }}>Start Full Practice Test →</button>

        <div style={{ background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 4px 20px #0000000d", border: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#374151", marginBottom: 14, letterSpacing: 0.5 }}>PRACTICE BY TOPIC</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TOPICS.map(t => (
              <button key={t} onClick={() => startQuiz(t)} style={{
                padding: "11px 13px", borderRadius: 10, border: "2px solid #e2e8f0",
                background: "#f8fafc", color: "#374151", fontWeight: 600, fontSize: 12,
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", lineHeight: 1.3,
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // LOADING
  if (screen === "loading") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f0f4ff,#fef2f2)", fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18, marginBottom: 24,
        background: "linear-gradient(135deg,#003087,#cc0000)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        animation: "pulse 1s ease-in-out infinite alternate",
      }}>📋</div>
      <style>{`@keyframes pulse{from{transform:scale(1)}to{transform:scale(1.1)}}`}</style>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", margin: "0 0 6px" }}>Generating Your Test…</h2>
      <p style={{ color: "#6b7280", fontSize: 13 }}>Creating {NUM_QUESTIONS} unique questions{topic !== "Mixed" ? ` on "${topic}"` : ""}</p>
    </div>
  );

  // RESULTS
  if (screen === "results") return (
    <Results correct={correctCount} total={questions.length} topic={topic}
      onRetry={() => startQuiz(topic)} onHome={() => setScreen("home")} />
  );

  // QUIZ
  if (!q) return null;
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "22px 18px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setScreen("home")} style={{
            background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", padding: 0,
          }}>← Exit</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {usingSeeds && (
              <div style={{ background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>
                Offline Mode
              </div>
            )}
            <div style={{ background: "#fff", borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: "#003087", border: "1px solid #e2e8f0" }}>
              {topic === "Mixed" ? "Full Test" : topic}
            </div>
          </div>
        </div>

        <ProgressBar current={idx + 1} total={questions.length} correct={correctCount} />

        <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px 20px", boxShadow: "0 4px 20px #0000000d", border: "1px solid #f1f5f9", marginBottom: 14 }}>
          <div style={{
            display: "inline-block", background: "linear-gradient(135deg,#003087,#1d4ed8)",
            color: "#fff", borderRadius: 7, padding: "2px 9px", fontSize: 11, fontWeight: 800, marginBottom: 16,
          }}>Q{idx + 1}</div>

          <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", lineHeight: 1.5, margin: "0 0 22px" }}>
            {q.question}
          </p>

          {["A","B","C","D"].map((lbl, i) => (
            <Option key={i} label={lbl} text={q.options[i]} state={optState(i)} onClick={() => handleSelect(i)} />
          ))}

          {revealed && (
            <div style={{
              marginTop: 14, padding: 14, borderRadius: 11,
              background: selected === q.correct ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${selected === q.correct ? "#bbf7d0" : "#fecaca"}`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4, color: selected === q.correct ? "#16a34a" : "#dc2626" }}>
                {selected === q.correct ? "✓ Correct!" : "✗ Incorrect — correct answer: " + ["A","B","C","D"][q.correct]}
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{q.explanation}</div>
            </div>
          )}
        </div>

        {revealed && (
          <button onClick={handleNext} style={{
            width: "100%", padding: "15px 0", borderRadius: 13, border: "none",
            background: "linear-gradient(135deg,#003087,#1d4ed8)",
            color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 18px #003087bb",
          }}>
            {idx + 1 >= questions.length ? "See Results →" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
