const factors = [
  {
    id: "exec",
    label: "Executive sponsorship",
    description: "A senior buyer is actively engaged and tied to the business outcome.",
    weight: 20
  },
  {
    id: "multi",
    label: "Multithreading",
    description: "You have meaningful engagement across multiple stakeholders or functions.",
    weight: 16
  },
  {
    id: "budget",
    label: "Budget ownership",
    description: "The budget source, owner, and path to approval are understood.",
    weight: 18
  },
  {
    id: "procurement",
    label: "Procurement",
    description: "Procurement steps, timing, and commercial process are known and moving.",
    weight: 14
  },
  {
    id: "security",
    label: "Security / legal",
    description: "Security, legal, privacy, or compliance requirements are identified and progressing.",
    weight: 14
  },
  {
    id: "next",
    label: "Next-step discipline",
    description: "There is a specific, mutually agreed next step with an owner and date.",
    weight: 18
  }
];

const levels = [
  { value: 0, label: "0 — No evidence" },
  { value: 1, label: "1 — Weak / implied" },
  { value: 2, label: "2 — Confirmed" },
  { value: 3, label: "3 — Strong evidence" }
];

const questions = document.getElementById("questions");
const scoreEl = document.getElementById("score");
const gradeEl = document.getElementById("grade");
const summaryEl = document.getElementById("summary");
const meterFill = document.getElementById("meterFill");
const strengthsEl = document.getElementById("strengths");
const gapsEl = document.getElementById("gaps");
const resetBtn = document.getElementById("resetBtn");

function renderQuestions() {
  questions.innerHTML = "";

  factors.forEach((factor) => {
    const row = document.createElement("div");
    row.className = "question";

    const copy = document.createElement("div");
    copy.innerHTML = `
      <p class="question-title">${factor.label}</p>
      <p class="question-copy">${factor.description}</p>
    `;

    const select = document.createElement("select");
    select.id = factor.id;
    select.setAttribute("aria-label", factor.label);

    levels.forEach((level) => {
      const option = document.createElement("option");
      option.value = level.value;
      option.textContent = level.label;
      select.appendChild(option);
    });

    select.addEventListener("change", calculate);

    row.appendChild(copy);
    row.appendChild(select);
    questions.appendChild(row);
  });
}

function calculate() {
  let weighted = 0;
  const scored = factors.map((factor) => {
    const value = Number(document.getElementById(factor.id).value);
    weighted += (value / 3) * factor.weight;
    return { ...factor, value };
  });

  const score = Math.round(weighted);
  scoreEl.textContent = score;
  meterFill.style.width = `${score}%`;

  let grade = "Unqualified";
  let summary = "The opportunity has limited verified evidence. Treat coverage cautiously.";

  if (score >= 80) {
    grade = "High confidence";
    summary = "The deal has strong, cross-functional evidence and looks materially better than nominal pipeline coverage alone would suggest.";
  } else if (score >= 60) {
    grade = "Credible";
    summary = "There is meaningful deal evidence, but one or two enterprise execution gaps could still create forecast risk.";
  } else if (score >= 35) {
    grade = "Fragile";
    summary = "The opportunity has some support, but the evidence is uneven. Focus on converting assumptions into verified buyer actions.";
  }

  gradeEl.textContent = grade;
  summaryEl.textContent = summary;

  const strengths = [...scored]
    .filter((item) => item.value >= 2)
    .sort((a, b) => b.value - a.value || b.weight - a.weight)
    .slice(0, 3);

  const gaps = [...scored]
    .filter((item) => item.value <= 1)
    .sort((a, b) => a.value - b.value || b.weight - a.weight)
    .slice(0, 3);

  strengthsEl.innerHTML = strengths.length
    ? strengths.map((item) => `<li>${item.label}</li>`).join("")
    : "<li>None yet</li>";

  gapsEl.innerHTML = gaps.length
    ? gaps.map((item) => `<li>${item.label}</li>`).join("")
    : "<li>No major gaps</li>";
}

function resetCalculator() {
  factors.forEach((factor) => {
    document.getElementById(factor.id).value = "0";
  });
  calculate();
}

resetBtn.addEventListener("click", resetCalculator);

renderQuestions();
calculate();
