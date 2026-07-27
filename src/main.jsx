import React from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  Droplets,
  Moon,
  Plus,
  Salad,
  Sparkles,
  Sun,
  Sunrise,
  Trash2,
  UploadCloud,
  Utensils,
  X
} from "lucide-react";
import { DAY_NAMES, EXAMS, TIMETABLE, TIPS } from "./data";
import { makeSupabaseClient } from "./supabaseClient";
import { formatDate, getDaysUntil, getTodayIndex, todayKey } from "./utils";
import "./styles.css";

const STORAGE_PREFIX = "cat1_planner";
const emptyJournal = { struggled: "", overcame: "", carryForward: "" };
const defaultCare = {
  waterLiters: 0,
  sleep: false,
  wakeupTime: "",
  morningFoodAte: false,
  afternoonFoodAte: false,
  eveningFoodAte: false,
  morningFood: "",
  afternoonFood: "",
  eveningFood: ""
};
const defaultStudyMinutes = {
  study_chem: 0,
  study_eng: 0,
  study_calc: 0,
  study_be: 0,
  study_py: 0,
  study_morning_minutes: 0
};
const subjectFields = [
  { key: "study_chem", label: "Chemistry", color: "#ef6461", targetMinutes: 600 },
  { key: "study_eng", label: "English", color: "#f4b942", targetMinutes: 600 },
  { key: "study_calc", label: "Calculus", color: "#39a0ed", targetMinutes: 600 },
  { key: "study_be", label: "Basic Engineering", color: "#42c79b", targetMinutes: 600 },
  { key: "study_py", label: "Python", color: "#9b7ede", targetMinutes: 600 }
];
const loopReminders = [
  { title: "Drink water", detail: "Small sips through the day" },
  { title: "Eat breakfast", detail: "Study starts better with food" },
  { title: "Morning study", detail: "Use the freshest focus first" },
  { title: "Lunch check", detail: "Do not skip the afternoon meal" },
  { title: "Evening review", detail: "Close the loop gently" },
  { title: "Sleep prep", detail: "Keep the last hour light" }
];

function toSqlTime(value) {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
}

function clampNumber(value, min, max) {
  const next = Number(value || 0);
  return Math.min(max, Math.max(min, Number.isFinite(next) ? next : min));
}

function minutesFromLog(log, key) {
  return Number(log?.[key] || 0);
}

function getProgressRows(studyMinutes, logHistory) {
  const today = todayKey();
  const historyWithoutToday = logHistory.filter((log) => log.date !== today);

  return subjectFields.map((subject) => {
    const historyMinutes = historyWithoutToday.reduce((sum, log) => sum + minutesFromLog(log, subject.key), 0);
    const totalMinutes = historyMinutes + minutesFromLog(studyMinutes, subject.key);
    const pct = Math.min(100, Math.floor((totalMinutes / subject.targetMinutes) * 100));

    return {
      ...subject,
      pct,
      totalMinutes
    };
  });
}

function useToast() {
  const [toast, setToast] = React.useState({ message: "", visible: false });

  const showToast = React.useCallback((message) => {
    setToast({ message, visible: true });
    window.setTimeout(() => setToast({ message: "", visible: false }), 4200);
  }, []);

  return [toast, showToast];
}

function Toast({ toast }) {
  return <div className={`toast ${toast.visible ? "is-visible" : ""}`}>{toast.message}</div>;
}

function getTodayExam() {
  return EXAMS.find((exam) => exam.date === todayKey());
}

function getNextExam() {
  const today = new Date(`${todayKey()}T00:00:00`);
  return [...EXAMS].filter((exam) => new Date(`${exam.date}T23:59:59`) >= today).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function getDayPlan(todayExam, nextExam) {
  if (todayExam) {
    return {
      mode: "exam_day",
      wakeup: "06:00",
      headline: `${todayExam.subject} exam day`,
      guidance: "Do the main revision in the morning, eat a steady breakfast, and keep the final hour light.",
      morningPlan: [
        { time: "06:20 - 07:10", title: "Formula and definitions pass", detail: todayExam.subject },
        { time: "07:20 - 08:10", title: "Past mistakes review", detail: "Only solved examples and weak spots" },
        { time: "08:10 - 08:30", title: "Pack and reset", detail: "Hall ticket, stationery, water, snack" }
      ]
    };
  }

  return {
    mode: "normal_day",
    wakeup: nextExam && getDaysUntil(nextExam.date) <= 3 ? "06:15" : "06:45",
    headline: nextExam ? `${nextExam.subject} is next` : "Steady study day",
    guidance: "Eat well today, drink water steadily, and keep the study blocks focused instead of stretched.",
    morningPlan: [
      { time: "After wake-up", title: "Breakfast first", detail: "Do not start deep work hungry." },
      { time: "Morning block", title: "One hard topic", detail: nextExam ? nextExam.subject : "Highest priority subject" },
      { time: "Before noon", title: "Quick checkpoint", detail: "Mark what is done and what needs help." }
    ]
  };
}

function ThemeToggle() {
  const [theme, setTheme] = React.useState(() => document.documentElement.dataset.theme || "light");

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(`${STORAGE_PREFIX}_theme`, next);
    setTheme(next);
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
      title={theme === "dark" ? "Switch to day mode" : "Switch to night mode"}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

// The nearest exam, sized like it matters. The rule under it fills as the day approaches.
function HeroCountdown({ exam }) {
  const [days, setDays] = React.useState(() => getDaysUntil(exam.date));

  React.useEffect(() => {
    const interval = window.setInterval(() => setDays(getDaysUntil(exam.date)), 60000);
    return () => window.clearInterval(interval);
  }, [exam.date]);

  const urgency = Math.min(100, Math.max(4, Math.round((1 - Math.min(days, 30) / 30) * 100)));

  return (
    <div className="hero-countdown" style={{ "--accent": exam.color }}>
      <div className="countdown-figure">
        <strong>{days}</strong>
        <span>{days === 1 ? "day" : "days"}</span>
      </div>
      <div className="countdown-meta">
        <span className="countdown-subject">{exam.subject}</span>
        <p className="countdown-when">
          {formatDate(exam.date)} · {exam.time} · {exam.slot}
        </p>
        <div className="urgency-rule">
          <div className="urgency-fill" style={{ width: `${urgency}%` }} />
        </div>
      </div>
    </div>
  );
}

function AppShell({ children, nextExam }) {
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-top">
          <div className="hero-copy">
            <p className="eyebrow">CAT1 prep companion</p>
            <h1>Study, eat, hydrate, repeat.</h1>
            <p className="hero-date">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <ThemeToggle />
        </div>
        {nextExam && <HeroCountdown exam={nextExam} />}
      </header>
      {children}
    </main>
  );
}

// Everything logged today, readable in one pass before you scroll.
function GlanceStrip({ care, studyMinutes, checkpoints }) {
  const totalMinutes = Object.values(studyMinutes).reduce((sum, value) => sum + Number(value || 0), 0);
  const mealsCount = [care.morningFoodAte, care.afternoonFoodAte, care.eveningFoodAte].filter(Boolean).length;
  const doneCount = checkpoints.filter((checkpoint) => checkpoint.done).length;

  const items = [
    { label: "Studied", value: `${totalMinutes}m`, met: totalMinutes >= 120 },
    { label: "Water", value: `${Number(care.waterLiters).toFixed(1)}L`, met: care.waterLiters >= 2.5 },
    { label: "Meals", value: `${mealsCount}/3`, met: mealsCount === 3 },
    { label: "Sleep", value: care.sleep ? "Logged" : "—", met: care.sleep },
    { label: "Checkpoints", value: `${doneCount}/${checkpoints.length}`, met: checkpoints.length > 0 && doneCount === checkpoints.length }
  ];

  return (
    <section className="glance-strip" aria-label="Today at a glance">
      {items.map((item) => (
        <div className={`glance-item ${item.met ? "is-met" : ""}`} key={item.label}>
          <span className="section-label">{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}

function ReminderLoop() {
  return (
    <section className="reminder-rail" aria-label="Daily reminder loop">
      {loopReminders.map((item) => (
        <article className="reminder-pill" key={item.title}>
          <strong>{item.title}</strong>
          <span>{item.detail}</span>
        </article>
      ))}
    </section>
  );
}

function TodayPlan({ todayExam, nextExam }) {
  const plan = getDayPlan(todayExam, nextExam);

  return (
    <section className="today-grid">
      <article className="focus-card main-focus">
        <div className="panel-title">
          <Sunrise size={19} />
          Morning Plan
        </div>
        <h2>{plan.headline}</h2>
        <p>{plan.guidance}</p>
        <div className="wake-row">
          <span>Recommended wake-up</span>
          <strong>{plan.wakeup} AM</strong>
        </div>
      </article>
      <article className="focus-card">
        <div className="panel-title">
          <BookOpen size={19} />
          {todayExam ? "Exam Morning Study" : "Care Reminder"}
        </div>
        <div className="mini-plan">
          {plan.morningPlan.map((item) => (
            <div className="mini-plan-row" key={`${item.time}-${item.title}`}>
              <span>{item.time}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function CountdownCard({ exam }) {
  const [days, setDays] = React.useState(() => getDaysUntil(exam.date));

  React.useEffect(() => {
    const interval = window.setInterval(() => setDays(getDaysUntil(exam.date)), 60000);
    return () => window.clearInterval(interval);
  }, [exam.date]);

  return (
    <article className="countdown-card" style={{ "--accent": exam.color }}>
      <div className="countdown-subject">{exam.subject}</div>
      <div className="countdown-number">
        {days}
        <span className="muted-label">{days === 1 ? "day left" : "days left"}</span>
      </div>
      <div className="countdown-date">
        {formatDate(exam.date)} · {exam.slot}
      </div>
    </article>
  );
}

function CareTracker({ care, setCare }) {
  const mealItems = [
    { key: "morning", label: "Morning", placeholder: "Breakfast / fruit / milk" },
    { key: "afternoon", label: "Afternoon", placeholder: "Lunch" },
    { key: "evening", label: "Evening", placeholder: "Snack / dinner" }
  ];

  function update(key, value) {
    setCare((current) => ({ ...current, [key]: value }));
  }

  function addWater(amount) {
    setCare((current) => ({
      ...current,
      waterLiters: clampNumber(Number(current.waterLiters) + amount, 0, 8)
    }));
  }

  return (
    <section className="panel care-panel" id="care-panel">
      <div className="panel-title">
        <Salad size={18} />
        Food, Water, Sleep
      </div>
      <div className="care-grid">
        <div className="water-card">
          <div className="water-top">
            <Droplets size={24} />
            <div>
              <span className="section-label">Water today</span>
              <strong>{Number(care.waterLiters).toFixed(1)} L</strong>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="0.25"
            value={care.waterLiters}
            onChange={(event) => update("waterLiters", clampNumber(event.target.value, 0, 8))}
          />
          <input
            type="number"
            min="0"
            max="8"
            step="0.25"
            value={care.waterLiters}
            onChange={(event) => update("waterLiters", clampNumber(event.target.value, 0, 8))}
            aria-label="Water liters"
          />
          <div className="quick-actions" aria-label="Quick water actions">
            <button onClick={() => addWater(0.25)}>+250 ml</button>
            <button onClick={() => addWater(0.5)}>+500 ml</button>
            <button onClick={() => update("waterLiters", 0)}>Reset</button>
          </div>
        </div>

        <div className="sleep-card" id="sleep-check">
          <label>
            <span>Actual wake-up time</span>
            <input type="time" value={care.wakeupTime} onChange={(event) => update("wakeupTime", event.target.value)} />
          </label>
          <button className={`toggle-card ${care.sleep ? "checked" : ""}`} onClick={() => update("sleep", !care.sleep)}>
            <Moon size={20} />
            <span>{care.sleep ? "Slept enough" : "Mark sleep done"}</span>
          </button>
        </div>
      </div>

      <div className="meal-grid">
        {mealItems.map((meal) => {
          const ateKey = `${meal.key}FoodAte`;
          const noteKey = `${meal.key}Food`;
          return (
            <article className={`meal-card ${care[ateKey] ? "checked" : ""}`} key={meal.key}>
              <div className="meal-heading">
                <Utensils size={18} />
                <div>
                  <strong>{meal.label}</strong>
                  <span>{care[ateKey] ? "Logged as eaten" : "Waiting to log"}</span>
                </div>
              </div>
              <button className="meal-toggle" onClick={() => update(ateKey, !care[ateKey])}>
                {care[ateKey] ? "Undo eaten" : "Mark eaten"}
              </button>
              <label>
                Meal notes
                <input value={care[noteKey]} onChange={(event) => update(noteKey, event.target.value)} placeholder={meal.placeholder} />
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MinuteStepper({ label, value, onChange, highlight }) {
  const amount = Number(value || 0);

  function setMinutes(nextValue) {
    onChange(clampNumber(nextValue, 0, 999));
  }

  return (
    <div className={`minute-stepper ${highlight ? "highlight" : ""}`}>
      <div>
        <span>{label}</span>
        <strong>{amount} min</strong>
      </div>
      <div className="stepper-controls">
        <button aria-label={`Subtract 15 minutes from ${label}`} onClick={() => setMinutes(amount - 15)}>
          -15
        </button>
        <input
          type="number"
          min="0"
          step="5"
          value={amount}
          onChange={(event) => setMinutes(event.target.value)}
          aria-label={`${label} minutes`}
        />
        <button aria-label={`Add 15 minutes to ${label}`} onClick={() => setMinutes(amount + 15)}>
          +15
        </button>
      </div>
    </div>
  );
}

function StudyMinutes({ studyMinutes, setStudyMinutes, todayExam }) {
  function update(key, value) {
    setStudyMinutes((current) => ({ ...current, [key]: clampNumber(value, 0, 999) }));
  }

  return (
    <section className="panel" id="study-panel">
      <div className="panel-title">
        <Clock size={18} />
        Study Minutes
      </div>
      <div className={`morning-study ${todayExam ? "exam" : ""}`}>
        <MinuteStepper
          label={todayExam ? `Morning: ${todayExam.subject}` : "Morning focus time"}
          value={studyMinutes.study_morning_minutes}
          onChange={(value) => update("study_morning_minutes", value)}
          highlight={Boolean(todayExam)}
        />
      </div>
      <div className="study-input-grid">
        {subjectFields.map((field) => (
          <MinuteStepper key={field.key} label={field.label} value={studyMinutes[field.key]} onChange={(value) => update(field.key, value)} />
        ))}
      </div>
    </section>
  );
}

function Timetable({ dayIndex, setDayIndex }) {
  const day = TIMETABLE[dayIndex];

  return (
    <section className="panel">
      <div className="panel-title">
        <CalendarDays size={18} />
        Timetable and Study Plan
      </div>
      <div className="tabs">
        {DAY_NAMES.map((dayName, index) => (
          <button key={dayName} className={dayIndex === index ? "active" : ""} onClick={() => setDayIndex(index)}>
            {dayName}
          </button>
        ))}
      </div>

      {day.classes.length > 0 && (
        <>
          <p className="section-label">Classes</p>
          <div className="row-stack">
            {day.classes.map((item) => (
              <div className="class-row" key={`${item.time}-${item.name}`}>
                <span className="row-time">
                  <Clock size={14} />
                  {item.time}
                </span>
                <div className="row-main">
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
                <span className="tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="plan-heading">
        <p className="section-label spaced">Recommended Study Plan</p>
        <p>
          If the allotted time is not suitable, move the same study duration to another free slot today. If it still cannot fit, add it to
          carry-forward before submitting the day.
        </p>
      </div>
      <div className="row-stack">
        {day.study.map((item) => (
          <div className={`study-row priority-${item.priority}`} key={`${item.time}-${item.subject}-${item.task}`}>
            <span className="row-time">{item.time}</span>
            <div className="row-main">
              <strong>{item.subject}</strong>
              <span>{item.task}</span>
            </div>
            <span className="duration">{item.duration}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TipPanel() {
  const [index, setIndex] = React.useState(() => Math.floor(Math.random() * TIPS.length));
  const tip = TIPS[index];

  return (
    <section className="panel tip-panel">
      <button className="panel-title title-button" onClick={() => setIndex((index + 1) % TIPS.length)}>
        <Sparkles size={18} />
        Small Nudge
      </button>
      <p>
        <strong>{tip.title}:</strong> {tip.text}
      </p>
    </section>
  );
}

function Checkpoints({ checkpoints, setCheckpoints }) {
  const [input, setInput] = React.useState("");

  function addCheckpoint() {
    const text = input.trim();
    if (!text) return;
    setCheckpoints((current) => [...current, { id: crypto.randomUUID(), text, done: false }]);
    setInput("");
  }

  return (
    <section className="panel">
      <div className="panel-title">
        <Check size={18} />
        Today&apos;s Checkpoints
      </div>
      <div className="checkpoint-list">
        {checkpoints.length === 0 && <p className="empty-text">Add 2 or 3 realistic wins for today.</p>}
        {checkpoints.map((checkpoint) => (
          <div className="checkpoint-item" key={checkpoint.id}>
            <input
              type="checkbox"
              checked={checkpoint.done}
              onChange={() =>
                setCheckpoints((current) =>
                  current.map((item) => (item.id === checkpoint.id ? { ...item, done: !item.done } : item))
                )
              }
            />
            <span className={checkpoint.done ? "done" : ""}>{checkpoint.text}</span>
            <button
              className="icon-button"
              aria-label="Remove checkpoint"
              title="Remove checkpoint"
              onClick={() => setCheckpoints((current) => current.filter((item) => item.id !== checkpoint.id))}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="add-row">
        <input
          value={input}
          placeholder="Add a checkpoint"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addCheckpoint();
          }}
        />
        <button className="icon-button primary" aria-label="Add checkpoint" title="Add checkpoint" onClick={addCheckpoint}>
          <Plus size={18} />
        </button>
      </div>
    </section>
  );
}

function ProgressPanel({ studyMinutes, logHistory }) {
  const progressRows = getProgressRows(studyMinutes, logHistory);

  return (
    <section className="panel">
      <div className="panel-title">
        <BarChart3 size={18} />
        Logged Study Progress
      </div>
      <p className="progress-note">Based only on study minutes she has logged. Target: 600 minutes per subject.</p>
      <div className="progress-list">
        {progressRows.map((data) => (
          <div className="progress-row" key={data.key}>
            <span>{data.label}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${data.pct}%`, backgroundColor: data.color }} />
            </div>
            <strong>{data.pct}%</strong>
            <em>{data.totalMinutes} / {data.targetMinutes} min</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function Journal({ journal, setJournal, onSaveDraft }) {
  function updateField(key, value) {
    setJournal((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="panel">
      <div className="panel-title">
        <UploadCloud size={18} />
        Daily Reflection
      </div>
      <label>
        What challenged you most today?
        <textarea value={journal.struggled} onChange={(event) => updateField("struggled", event.target.value)} />
      </label>
      <label>
        What helped you move through it?
        <textarea value={journal.overcame} onChange={(event) => updateField("overcame", event.target.value)} />
      </label>
      <label>
        What should carry forward tomorrow?
        <textarea value={journal.carryForward} onChange={(event) => updateField("carryForward", event.target.value)} />
      </label>
      <div className="actions">
        <button className="ghost-button" onClick={onSaveDraft}>
          Save Draft
        </button>
      </div>
    </section>
  );
}

function SaveBar({ onSubmit, isSubmitting }) {
  return (
    <section className="save-bar">
      <div className="save-bar-copy">
        <strong>Finish today</strong>
        <span>Saves care, study minutes, checkpoints, and reflection together.</span>
      </div>
      <button className="primary-button" onClick={onSubmit} disabled={isSubmitting}>
        <UploadCloud size={17} />
        {isSubmitting ? "Submitting..." : "Submit Full Day"}
      </button>
    </section>
  );
}

function getFloatingReminder(care, studyMinutes, todayExam) {
  const hour = new Date().getHours();
  const studied = Object.values(studyMinutes).reduce((sum, value) => sum + Number(value || 0), 0);

  if (hour < 6) {
    return { type: "Sleep", title: "Sleep time", message: "Rest matters more than one more tired page.", targetId: "sleep-check", cta: "Mark sleep" };
  }
  if (hour < 8) {
    return { type: "Wake", title: "Start gently", message: "Log wake-up, drink water, then breakfast.", targetId: "care-panel", cta: "Open care" };
  }
  if (hour < 10 && !care.morningFoodAte) {
    return { type: "Eat", title: "Breakfast first", message: "Mark morning food before deep study.", targetId: "care-panel", cta: "Log breakfast" };
  }
  if (hour < 12) {
    return {
      type: "Study",
      title: todayExam ? "Exam morning focus" : "Morning study block",
      message: todayExam ? `Add minutes for ${todayExam.subject}.` : "Add the study minutes right after the session.",
      targetId: "study-panel",
      cta: "Add study"
    };
  }
  if (hour < 14 && !care.afternoonFoodAte) {
    return { type: "Eat", title: "Lunch check", message: "A proper lunch protects the evening study block.", targetId: "care-panel", cta: "Log lunch" };
  }
  if (hour < 17 && studied < 60) {
    return { type: "Study", title: "Study window", message: "Pick one subject and add minutes when done.", targetId: "study-panel", cta: "Add minutes" };
  }
  if (hour < 19 && care.waterLiters < 2) {
    return { type: "Water", title: "Hydration catch-up", message: "Add water now so the night feels easier.", targetId: "care-panel", cta: "Add water" };
  }
  if (hour < 21 && !care.eveningFoodAte) {
    return { type: "Eat", title: "Evening food", message: "Log snack or dinner before the final review.", targetId: "care-panel", cta: "Log evening" };
  }
  return { type: "Sleep", title: "Wind down", message: "Stop heavy topics. Pack for tomorrow and sleep.", targetId: "sleep-check", cta: "Sleep check" };
}

function FloatingCoach({ care, studyMinutes, todayExam }) {
  const [, setTick] = React.useState(0);
  const [isOpen, setIsOpen] = React.useState(() => sessionStorage.getItem(`${STORAGE_PREFIX}_coach_hidden`) !== "1");

  React.useEffect(() => {
    const interval = window.setInterval(() => setTick((tick) => tick + 1), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const reminder = getFloatingReminder(care, studyMinutes, todayExam);

  function goToTarget() {
    document.getElementById(reminder.targetId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggle(next) {
    setIsOpen(next);
    sessionStorage.setItem(`${STORAGE_PREFIX}_coach_hidden`, next ? "0" : "1");
  }

  if (!isOpen) {
    return (
      <button className="coach-reopen" onClick={() => toggle(true)} title="Show the reminder">
        <Sparkles size={16} />
        <span>{reminder.title}</span>
      </button>
    );
  }

  return (
    <aside className="floating-coach" aria-live="polite">
      <button className="coach-close" onClick={() => toggle(false)} aria-label="Hide reminder" title="Hide reminder">
        <X size={15} />
      </button>
      <span className="coach-type">{reminder.type}</span>
      <strong>{reminder.title}</strong>
      <p>{reminder.message}</p>
      <button onClick={goToTarget}>{reminder.cta}</button>
    </aside>
  );
}

function StudentApp() {
  const [client] = React.useState(() => makeSupabaseClient());
  const [dayIndex, setDayIndex] = React.useState(getTodayIndex);
  const [care, setCare] = React.useState(defaultCare);
  const [studyMinutes, setStudyMinutes] = React.useState(defaultStudyMinutes);
  const [logHistory, setLogHistory] = React.useState([]);
  const [checkpoints, setCheckpoints] = React.useState([]);
  const [journal, setJournal] = React.useState(emptyJournal);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toast, showToast] = useToast();
  const todayExam = getTodayExam();
  const nextExam = getNextExam();

  React.useEffect(() => {
    const savedCheckpoints = localStorage.getItem(`${STORAGE_PREFIX}_checkpoints_${todayKey()}`);
    const savedCare = localStorage.getItem(`${STORAGE_PREFIX}_care_${todayKey()}`);
    const savedStudy = localStorage.getItem(`${STORAGE_PREFIX}_study_${todayKey()}`);
    const savedDraft = localStorage.getItem(`${STORAGE_PREFIX}_journal_draft`);

    if (savedCheckpoints) setCheckpoints(JSON.parse(savedCheckpoints));
    if (savedCare) setCare({ ...defaultCare, ...JSON.parse(savedCare) });
    if (savedStudy) setStudyMinutes({ ...defaultStudyMinutes, ...JSON.parse(savedStudy) });
    if (savedDraft) setJournal(JSON.parse(savedDraft));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_checkpoints_${todayKey()}`, JSON.stringify(checkpoints));
  }, [checkpoints]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_care_${todayKey()}`, JSON.stringify(care));
  }, [care]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}_study_${todayKey()}`, JSON.stringify(studyMinutes));
  }, [studyMinutes]);

  React.useEffect(() => {
    async function loadToday() {
      if (!client) return;

      const [{ data: log }, { data: savedCheckpoints }, { data: savedLogs }] = await Promise.all([
        client.from("daily_logs").select("*").eq("date", todayKey()).maybeSingle(),
        client.from("checkpoints").select("*").eq("date", todayKey()).order("created_at", { ascending: true }),
        client
          .from("daily_logs")
          .select("date, study_chem, study_eng, study_calc, study_be, study_py")
          .order("date", { ascending: false })
          .limit(90)
      ]);

      if (savedLogs) {
        setLogHistory(savedLogs);
      }

      if (log) {
        setJournal({
          struggled: log.struggled || "",
          overcame: log.overcame || "",
          carryForward: log.carry_forward || ""
        });
        setCare({
          waterLiters: Number(log.water_liters || log.water || 0),
          sleep: Boolean(log.sleep),
          wakeupTime: log.wakeup_time || "",
          morningFoodAte: Boolean(log.food_morning_ate),
          afternoonFoodAte: Boolean(log.food_afternoon_ate),
          eveningFoodAte: Boolean(log.food_evening_ate),
          morningFood: log.food_morning || "",
          afternoonFood: log.food_afternoon || "",
          eveningFood: log.food_evening || ""
        });
        setStudyMinutes({
          study_chem: log.study_chem || 0,
          study_eng: log.study_eng || 0,
          study_calc: log.study_calc || 0,
          study_be: log.study_be || 0,
          study_py: log.study_py || 0,
          study_morning_minutes: log.study_morning_minutes || 0
        });
      }

      if (savedCheckpoints?.length) {
        setCheckpoints(savedCheckpoints.map((item) => ({ id: item.id, text: item.topic, done: item.completed })));
      }
    }

    loadToday().catch((networkError) => {
      showToast(`Working offline: ${networkError.message}`);
    });
  }, [client, showToast]);

  function saveDraft() {
    localStorage.setItem(`${STORAGE_PREFIX}_journal_draft`, JSON.stringify(journal));
    showToast("Reflection draft saved.");
  }

  async function submitDay() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await saveDay();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveDay() {
    const plan = getDayPlan(todayExam, nextExam);
    const mealsCount = [care.morningFoodAte, care.afternoonFoodAte, care.eveningFoodAte].filter(Boolean).length;
    const payload = {
      date: todayKey(),
      struggled: journal.struggled,
      overcame: journal.overcame,
      carry_forward: journal.carryForward,
      water: care.waterLiters >= 2.5 ? 1 : 0,
      water_liters: care.waterLiters,
      sleep: care.sleep ? 1 : 0,
      meals: mealsCount,
      food_morning_ate: care.morningFoodAte,
      food_afternoon_ate: care.afternoonFoodAte,
      food_evening_ate: care.eveningFoodAte,
      food_morning: care.morningFood,
      food_afternoon: care.afternoonFood,
      food_evening: care.eveningFood,
      wakeup_time: toSqlTime(care.wakeupTime),
      recommended_wakeup_time: toSqlTime(plan.wakeup),
      day_mode: plan.mode,
      morning_plan: plan.guidance,
      checkpoints: `${checkpoints.filter((checkpoint) => checkpoint.done).length}/${checkpoints.length}`,
      ...studyMinutes
    };

    // Keep the day locally before touching the network so a failed sync never loses it.
    localStorage.setItem(`${STORAGE_PREFIX}_journal_${todayKey()}`, JSON.stringify(payload));
    setLogHistory((current) => [payload, ...current.filter((log) => log.date !== todayKey())]);
    localStorage.removeItem(`${STORAGE_PREFIX}_journal_draft`);

    if (!client) {
      showToast("Day saved locally.");
      return;
    }

    try {
      const { error } = await client.from("daily_logs").upsert(payload, { onConflict: "date" });
      if (error) {
        showToast(`Saved locally. Sync failed: ${error.message}`);
        return;
      }

      const checkpointPayload = checkpoints.map((checkpoint) => ({
        date: todayKey(),
        subject: "General",
        topic: checkpoint.text,
        completed: checkpoint.done
      }));

      if (checkpointPayload.length > 0) {
        const { error: checkpointError } = await client
          .from("checkpoints")
          .upsert(checkpointPayload, { onConflict: "date,topic" });

        if (checkpointError) {
          showToast(`Daily log synced, but checkpoints failed: ${checkpointError.message}`);
          return;
        }
      }

      showToast("Day submitted and synced.");
    } catch (networkError) {
      // supabase-js throws (rather than returning { error }) when the request never reaches the server.
      showToast(`Saved locally. Could not reach the server: ${networkError.message}`);
    }
  }

  return (
    <React.StrictMode>
      <AppShell nextExam={nextExam}>
        <GlanceStrip care={care} studyMinutes={studyMinutes} checkpoints={checkpoints} />
        <TodayPlan todayExam={todayExam} nextExam={nextExam} />
        <section className="countdown-grid">
          {EXAMS.map((exam) => (
            <CountdownCard exam={exam} key={exam.code} />
          ))}
        </section>
        <div className="dashboard-grid">
          <CareTracker care={care} setCare={setCare} />
          <StudyMinutes studyMinutes={studyMinutes} setStudyMinutes={setStudyMinutes} todayExam={todayExam} />
        </div>
        <Timetable dayIndex={dayIndex} setDayIndex={setDayIndex} />
        <div className="dashboard-grid">
          <Checkpoints checkpoints={checkpoints} setCheckpoints={setCheckpoints} />
          <ProgressPanel studyMinutes={studyMinutes} logHistory={logHistory} />
        </div>
        <ReminderLoop />
        <TipPanel />
        <Journal journal={journal} setJournal={setJournal} onSaveDraft={saveDraft} />
        <FloatingCoach care={care} studyMinutes={studyMinutes} todayExam={todayExam} />
        <SaveBar onSubmit={submitDay} isSubmitting={isSubmitting} />
        <Toast toast={toast} />
      </AppShell>
    </React.StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<StudentApp />);
