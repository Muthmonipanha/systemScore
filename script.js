// Simple dashboard logic: calculate, store, retrieve
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

function getScoresFromForm() {
  const s = [1, 2, 3, 4, 5].map((i) => {
    const el = qs("#s" + i);
    return el && el.value !== "" ? Number(el.value) : null;
  });
  return s;
}

function validateScores(scores) {
  for (const v of scores) {
    if (v === null || Number.isNaN(v) || v < 0 || v > 100) return false;
  }
  return true;
}

function gradeFromAverage(avg) {
  if (avg >= 90) return "A+";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B";
  if (avg >= 60) return "C";
  if (avg >= 50) return "D";
  return "F";
}

function isPass(scores) {
  // pass when no subject <40
  return scores.every((v) => v >= 40);
}

function calculate() {
  const scores = getScoresFromForm();
  const out = qs("#result");
  if (!validateScores(scores)) {
    out.innerHTML = `<div class="small" style="color:var(--danger)">Please enter five valid scores (0-100).</div>`;
    return null;
  }
  const total = scores.reduce((a, b) => a + b, 0);
  const avg = +(total / scores.length).toFixed(2);
  const pass = isPass(scores);
  const grade = gradeFromAverage(avg);
  out.innerHTML = `
    <div><strong>Total:</strong> ${total}</div>
    <div><strong>Average:</strong> ${avg}</div>
    <div><strong>Status:</strong> <span style="color:${
      pass ? "var(--success)" : "var(--danger)"
    }">${pass ? "Pass" : "Fail"}</span></div>
    <div><strong>Grade:</strong> ${grade}</div>
  `;
  return {
    scores,
    total,
    avg,
    pass,
    grade,
    student: qs("#studentName").value.trim() || null,
  };
}

// Storage
const STORAGE_KEY = "studentScores";
function loadStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}
function saveStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function saveCurrent() {
  const res = calculate();
  if (!res) return;
  const list = loadStored();
  const ts = new Date().toISOString();
  list.push({ id: ts, ...res });
  saveStored(list);
  renderStored();
  // switch to retrieve panel so the user sees saved records immediately
  document
    .querySelectorAll(".menu-item")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.target === "retrieve")
    );
  showPanel("retrieve");
  alert("Saved successfully.");
}

function renderStored() {
  const container = qs("#storedList");
  const list = loadStored();
  const storeContainer = qs("#storeList");
  if (list.length === 0) {
    container.innerHTML = '<div class="small">No saved records.</div>';
    if (storeContainer)
      storeContainer.innerHTML = '<div class="small">No saved records.</div>';
    return;
  }
  container.innerHTML = "";
  // show most recent in Store panel
  if (storeContainer) {
    const recent = list[list.length - 1];
    storeContainer.innerHTML = `<div class="card"><div><strong>${
      recent.student || "—"
    }</strong> <div class="small">${new Date(recent.id).toLocaleString()}</div>
      <div class="small">Avg: ${recent.avg} • ${
      recent.pass ? "Pass" : "Fail"
    } • Grade: ${recent.grade}</div></div></div>`;
  }
  list
    .slice()
    .reverse()
    .forEach((record) => {
      const el = document.createElement("div");
      el.className = "card";
      const left = document.createElement("div");
      left.innerHTML = `<div><strong>${
        record.student || "—"
      }</strong> <span class="small">(${new Date(
        record.id
      ).toLocaleString()})</span></div>
      <div class="small">Avg: ${record.avg} • ${
        record.pass ? "Pass" : "Fail"
      } • Grade: ${record.grade}</div>`;
      const right = document.createElement("div");
      right.className = "record-actions";
      const loadBtn = document.createElement("button");
      loadBtn.textContent = "Load";
      loadBtn.onclick = () => loadRecord(record.id);
      const viewBtn = document.createElement("button");
      viewBtn.textContent = "View";
      viewBtn.onclick = () => alert(JSON.stringify(record, null, 2));
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = () => deleteRecord(record.id);
      right.append(loadBtn, viewBtn, delBtn);
      el.append(left, right);
      container.appendChild(el);
    });
}

function loadRecord(id) {
  const list = loadStored();
  const rec = list.find((r) => r.id === id);
  if (!rec) {
    alert("Record not found");
    return;
  }
  // fill form
  qs("#studentName").value = rec.student || "";
  rec.scores.forEach((v, i) => {
    qs(`#s${i + 1}`).value = v;
  });
  document
    .querySelectorAll(".menu-item")
    .forEach((b) =>
      b.classList.toggle("active", b.dataset.target === "calculator")
    );
  showPanel("calculator");
  calculate();
}

function deleteRecord(id) {
  if (!confirm("Delete this record?")) return;
  const list = loadStored().filter((r) => r.id !== id);
  saveStored(list);
  renderStored();
}

// UI interactions
qsa(".menu-item").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    qsa(".menu-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    showPanel(btn.dataset.target);
  })
);

function showPanel(id) {
  qsa(".panel").forEach((p) => p.classList.toggle("active", p.id === id));
}

qs("#calcBtn").addEventListener("click", calculate);
qs("#saveBtn").addEventListener("click", saveCurrent);

// responsive sidebar
qs("#toggleBtn").addEventListener("click", () => {
  qs("#sidebar").classList.toggle("open");
});

// init
document.addEventListener("DOMContentLoaded", () => {
  renderStored();
});
