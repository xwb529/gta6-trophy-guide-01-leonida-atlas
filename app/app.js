// Leonida Trophy Atlas — an offline guide & tracker for the 55 GTA VI PS5 trophies.
// Progress lives in localStorage on this machine, exports to a JSON file and imports
// back. The trophy names/descriptions/grades are the official PlayStation list; every
// guide is this app's own words and names its sources beside it.

const STORAGE_KEY = "leonida-trophy-atlas-v1";
const KINDS = ["all", "story", "activities", "collectibles", "economy", "completion", "platinum"];
const GRADES = ["all", "platinum", "gold", "silver", "bronze"];

let trophies = [];
let earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
let spoilerSafe = false;
let onlyMissing = false;
let kindFilter = "all";
let gradeFilter = "all";
let query = "";
let view = "checklist";
let selectedId = null;

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function isHiddenStory(t) {
  return spoilerSafe && t.kind === "story" && !earned.has(t.id);
}

function displayName(t) {
  return isHiddenStory(t) ? "Hidden story trophy" : t.name;
}

function displayDescription(t) {
  return isHiddenStory(t) ? "Spoiler-safe mode: this story trophy's name and description stay hidden until you earn it." : t.description;
}

function matches(t) {
  if (kindFilter !== "all" && t.kind !== kindFilter) return false;
  if (gradeFilter !== "all" && t.grade !== gradeFilter) return false;
  if (onlyMissing && earned.has(t.id)) return false;
  if (view === "missables" && !t.missable) return false;
  if (query) {
    const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
  }
  return true;
}

function progressHtml() {
  const done = earned.size;
  const pct = Math.round((done / trophies.length) * 100);
  return `<div class="progress"><div class="bar"><div class="fill" style="width:${pct}%"></div></div>
    <p>${done} of ${trophies.length} earned · ${pct}% · Platinum ${earned.has(1) ? "earned" : "pending"}</p></div>`;
}

function trophyRow(t) {
  const checked = earned.has(t.id) ? "checked" : "";
  const miss = t.missable ? `<span class="flag">missable — check the guide</span>` : "";
  return `<li class="trophy grade-${t.grade} ${selectedId === t.id ? "selected" : ""}" data-id="${t.id}">
    <label><input type="checkbox" data-check="${t.id}" ${checked}>
    <span class="grade">${t.grade}</span>
    <span class="tname">${displayName(t)}</span></label>
    <p class="tdesc">${displayDescription(t)}</p>
    <p class="tmeta">${t.kind} · ${t.stageTitle} ${miss}</p>
    <button type="button" data-guide="${t.id}">Guide &amp; sources</button>
  </li>`;
}

function roadmapHtml() {
  const stages = [...new Set(trophies.map((t) => t.stage))].sort((a, b) => a - b);
  return stages
    .map((s) => {
      const items = trophies.filter((t) => t.stage === s);
      const done = items.filter((t) => earned.has(t.id)).length;
      return `<section class="stage"><h3>${items[0].stageTitle} — ${done}/${items.length}</h3>
      <p>${stageAdvice(s)}</p><ul>${items.map((t) => `<li>${earned.has(t.id) ? "✓" : "○"} ${displayName(t)} (${t.grade})${t.missable ? " — missable, read its guide first" : ""}</li>`).join("")}</ul></section>`;
    })
    .join("");
}

function stageAdvice(s) {
  return {
    1: "Play the campaign in order. Keep a manual save at the start of each chapter — the choice-based trophy in this stage is why.",
    2: "Free-roam moments with your partner and at named places. Quick wins; sweep them whenever a story mission drops you nearby.",
    3: "Start every stranger strand you meet and try every activity type once; the named strand finales each carry their own trophy.",
    4: "The long counts. Work them region by region alongside everything else instead of grinding them at the end.",
    5: "The money loop: rob, launder, spend, buy. Strand finales and vaults feed it fastest.",
    6: "Burn down whatever the in-game 100% counter still wants; the platinum follows automatically.",
  }[s];
}

function detailHtml(t) {
  if (!t) return `<p class="hint">Pick “Guide &amp; sources” on any trophy to read how to earn it, in this guide's own words, with its sources named.</p>`;
  return `<h3>${displayName(t)} <span class="grade">${t.grade}</span></h3>
    <p class="tdesc">${displayDescription(t)}</p>
    ${t.missable ? `<p class="flag">Flagged missable in this guide — the flag is inferred from the official description; read before passing story decision points and keep a manual save.</p>` : ""}
    <p>${isHiddenStory(t) ? "Earn this trophy to reveal its guide in spoiler-safe mode." : t.guide}</p>
    <h4>Sources</h4><ul>${t.sources.map((s) => `<li>${s}</li>`).join("")}</ul>`;
}

function render() {
  $("progress").innerHTML = progressHtml();
  const list = trophies.filter(matches);
  if (view === "roadmap") {
    $("list").innerHTML = roadmapHtml();
  } else {
    $("list").innerHTML = list.length
      ? `<ul class="trophies">${list.map(trophyRow).join("")}</ul>`
      : `<p class="hint">No trophies match these filters.</p>`;
  }
  const sel = trophies.find((t) => t.id === selectedId);
  $("detail").innerHTML = detailHtml(sel);
  document.querySelectorAll("[data-check]").forEach((box) => {
    box.addEventListener("change", () => {
      const id = Number(box.getAttribute("data-check"));
      if (box.checked) earned.add(id); else earned.delete(id);
      save();
      render();
    });
  });
  document.querySelectorAll("[data-guide]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedId = Number(btn.getAttribute("data-guide"));
      render();
    });
  });
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...earned] }, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "leonida-trophy-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  file.text().then((text) => {
    const data = JSON.parse(text);
    earned = new Set((data.earned ?? []).filter((id) => trophies.some((t) => t.id === id)));
    save();
    render();
  });
}

async function boot() {
  const doc = await (await fetch("data/trophies.json")).json();
  trophies = doc.trophies ?? doc;
  $("kind").innerHTML = KINDS.map((k) => `<option value="${k}">${k}</option>`).join("");
  $("grade").innerHTML = GRADES.map((g) => `<option value="${g}">${g}</option>`).join("");
  $("kind").addEventListener("change", () => { kindFilter = $("kind").value; render(); });
  $("grade").addEventListener("change", () => { gradeFilter = $("grade").value; render(); });
  $("search").addEventListener("input", () => { query = $("search").value; render(); });
  $("spoiler").addEventListener("change", () => { spoilerSafe = $("spoiler").checked; render(); });
  $("missing").addEventListener("change", () => { onlyMissing = $("missing").checked; render(); });
  $("export").addEventListener("click", exportProgress);
  $("import-file").addEventListener("change", () => {
    const f = $("import-file").files && $("import-file").files[0];
    if (f) importProgress(f);
  });
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      view = btn.getAttribute("data-view");
      document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("active", b === btn));
      render();
    });
  });
  render();
}

boot();
