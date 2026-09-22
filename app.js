(() => {
  "use strict";

  const signals = [
    {id:"exec", group:"STAKEHOLDER EVIDENCE", name:"Executive sponsorship",
     desc:"A senior buyer is actively engaged and tied to the business outcome.",
     next:"Get direct access to an executive sponsor and validate the business outcome they own."},
    {id:"multi", group:"STAKEHOLDER EVIDENCE", name:"Multithreading",
     desc:"You have meaningful engagement across multiple stakeholders or functions.",
     next:"Expand beyond the current contact and map the people who influence the decision."},
    {id:"budget", group:"COMMERCIAL EVIDENCE", name:"Budget ownership",
     desc:"The budget source, owner, and path to approval are understood.",
     next:"Confirm the budget source, owner, amount, and approval path."},
    {id:"proc", group:"COMMERCIAL EVIDENCE", name:"Procurement",
     desc:"Procurement steps, timing, and commercial process are known and moving.",
     next:"Map procurement steps and timing before the deal reaches verbal agreement."},
    {id:"legal", group:"EXECUTION EVIDENCE", name:"Security / legal",
     desc:"Security, legal, privacy, or compliance requirements are identified and progressing.",
     next:"Confirm the security and legal path, owners, and expected review timing."},
    {id:"next", group:"EXECUTION EVIDENCE", name:"Next-step discipline",
     desc:"There is a specific, mutually agreed next step with an owner and date.",
     next:"Create a dated, customer-owned next step before advancing the opportunity."}
  ];

  const labels = ["None","Weak","Partial","Verified"];
  const state = {};
  signals.forEach(s => state[s.id] = 0);

  const groupsEl = document.getElementById("groups");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const barEl = document.getElementById("bar");
  const diagnosisEl = document.getElementById("diagnosis");
  const strengthsEl = document.getElementById("strengths");
  const gapsEl = document.getElementById("gaps");
  const focusEl = document.getElementById("focus");

  function buildControls() {
    const groupNames = [...new Set(signals.map(s => s.group))];
    groupNames.forEach(groupName => {
      const group = document.createElement("div");
      group.className = "group";

      const title = document.createElement("div");
      title.className = "group-title";
      title.textContent = groupName;
      group.appendChild(title);

      signals.filter(s => s.group === groupName).forEach(signal => {
        const row = document.createElement("div");
        row.className = "signal";

        const name = document.createElement("div");
        name.className = "signal-name";
        name.textContent = signal.name;

        const desc = document.createElement("div");
        desc.className = "signal-desc";
        desc.textContent = signal.desc;

        const seg = document.createElement("div");
        seg.className = "seg";

        labels.forEach((label, value) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "choice" + (value === 0 ? " active" : "");
          button.dataset.id = signal.id;
          button.dataset.value = String(value);
          button.textContent = `${value} · ${label}`;
          seg.appendChild(button);
        });

        row.append(name, desc, seg);
        group.appendChild(row);
      });
      groupsEl.appendChild(group);
    });
  }

  function list(el, items, emptyText) {
    el.innerHTML = "";
    const values = items.length ? items : [emptyText];
    values.forEach(value => {
      const li = document.createElement("li");
      li.textContent = value;
      el.appendChild(li);
    });
  }

  function render() {
    const total = Object.values(state).reduce((sum, value) => sum + value, 0);
    const quality = Math.round((total / 18) * 100);

    scoreEl.textContent = String(quality);
    barEl.style.width = `${quality}%`;

    statusEl.textContent =
      quality >= 84 ? "STRONG" :
      quality >= 67 ? "QUALIFIED" :
      quality >= 45 ? "DEVELOPING" :
      quality >= 23 ? "EARLY" : "UNQUALIFIED";

    const strongest = [...signals]
      .sort((a,b) => state[b.id] - state[a.id])
      .filter(s => state[s.id] >= 2)
      .slice(0,3)
      .map(s => s.name);

    const gaps = [...signals]
      .sort((a,b) => state[a.id] - state[b.id])
      .filter(s => state[s.id] <= 1)
      .slice(0,3)
      .map(s => s.name);

    list(strengthsEl, strongest, "None yet");
    list(gapsEl, gaps, "No major evidence gaps");

    const stakeholder = state.exec + state.multi;
    const commercial = state.budget + state.proc;
    const execution = state.legal + state.next;

    if (quality === 0) {
      diagnosisEl.textContent = "There is not enough verified evidence yet to support confidence in this opportunity.";
    } else if (quality >= 84) {
      diagnosisEl.textContent = "This opportunity is supported by strong evidence across stakeholders, commercial process, and execution.";
    } else if (stakeholder >= 4 && commercial <= 2) {
      diagnosisEl.textContent = "This deal has stakeholder momentum, but commercial validation is lagging.";
    } else if (commercial >= 4 && stakeholder <= 2) {
      diagnosisEl.textContent = "The commercial path is taking shape, but stakeholder coverage is still too thin.";
    } else if (execution <= 2 && quality >= 45) {
      diagnosisEl.textContent = "Core deal evidence is developing, but execution risk could still disrupt timing.";
    } else if (quality >= 67) {
      diagnosisEl.textContent = "The opportunity has meaningful support, with a few evidence gaps still worth resolving.";
    } else if (quality >= 45) {
      diagnosisEl.textContent = "There are credible signals here, but the deal is not yet supported consistently enough for high confidence.";
    } else {
      diagnosisEl.textContent = "Some evidence exists, but the opportunity still relies heavily on assumptions rather than verified buying signals.";
    }

    const priorityOrder = ["exec","next","budget","proc","legal","multi"];
    const priority = priorityOrder
      .map(id => signals.find(s => s.id === id))
      .sort((a,b) => state[a.id] - state[b.id])[0];

    focusEl.textContent = quality >= 84
      ? "Protect the evidence: keep next steps customer-owned and revalidate the buying process as the deal advances."
      : priority.next;
  }

  groupsEl.addEventListener("click", event => {
    const button = event.target.closest(".choice");
    if (!button) return;

    const id = button.dataset.id;
    state[id] = Number(button.dataset.value);

    document.querySelectorAll(`.choice[data-id="${id}"]`).forEach(item => {
      item.classList.toggle("active", item === button);
    });
    render();
  });

  document.getElementById("reset").addEventListener("click", () => {
    signals.forEach(s => state[s.id] = 0);
    document.querySelectorAll(".choice").forEach(button => {
      button.classList.toggle("active", button.dataset.value === "0");
    });
    render();
  });

  buildControls();
  render();
})();