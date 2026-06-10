import { defaultStages, roleTemplates, sampleCandidates } from "./data.js";
import { candidateSummary, clampScore, stageAverage, scoreToPercent } from "./scoring.js";

const storageKey = "cosmic-interview-scorecard-v1";
const currentSchemaVersion = 2;
const currentDefaultWeights = {
  "stage-1": 10,
  "stage-2": 25,
  "stage-3": 35,
  "stage-4": 30,
};
const app = document.querySelector("#app");

let state = loadState();
let selectedCandidateId = state.candidates[0]?.id;
let view = "scorecard";

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) return migrateSavedState(JSON.parse(saved));
  return { version: currentSchemaVersion, candidates: structuredClone(sampleCandidates) };
}

function saveState() {
  state.version = currentSchemaVersion;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function migrateSavedState(savedState) {
  if ((savedState.version || 1) < currentSchemaVersion) {
    savedState.candidates?.forEach((candidate) => {
      candidate.stages?.forEach((stage) => {
        if (stage.id in currentDefaultWeights) {
          stage.weight = currentDefaultWeights[stage.id];
        }
      });
    });
  }
  savedState.version = currentSchemaVersion;
  return savedState;
}

function selectedCandidate() {
  return state.candidates.find((candidate) => candidate.id === selectedCandidateId);
}

function formatPercent(value) {
  return value === null ? "Not scored" : `${Math.round(value)}%`;
}

function recommendationOptions(value) {
  return ["", "Strong Yes", "Yes", "Mixed", "No", "Needs Review"]
    .map((option) => {
      const label = option || "Use suggested recommendation";
      return `<option value="${option}" ${option === value ? "selected" : ""}>${label}</option>`;
    })
    .join("");
}

function roleTemplateOptions(value) {
  return ["", ...roleTemplates.map((template) => template.id)]
    .map((templateId) => {
      const template = roleTemplates.find((item) => item.id === templateId);
      const label = template?.name || "Choose a role template";
      return `<option value="${templateId}" ${templateId === value ? "selected" : ""}>${label}</option>`;
    })
    .join("");
}

function render() {
  const candidate = selectedCandidate();
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <small>Cosmic Partners</small>
          <h1>Interview Scorecard</h1>
        </div>
        <button class="primary" data-action="add-candidate">Add candidate</button>
        <div class="candidate-list">${state.candidates.map(renderCandidateCard).join("")}</div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div class="tabs">
            <button class="${view === "scorecard" ? "is-active" : ""}" data-view="scorecard">Scorecard</button>
            <button class="${view === "report" ? "is-active" : ""}" data-view="report">Report</button>
            <button class="${view === "comparison" ? "is-active" : ""}" data-view="comparison">Compare</button>
          </div>
          <button data-action="reset-sample">Reset sample data</button>
        </div>
        ${renderMainView(candidate)}
      </main>
    </div>
  `;
}

function renderMainView(candidate) {
  if (view === "comparison") return renderComparison();
  if (view === "report") return renderCandidateReport(candidate);
  return renderScorecard(candidate);
}

function renderCandidateCard(candidate) {
  const summary = candidateSummary(candidate);
  return `
    <button class="candidate-card ${candidate.id === selectedCandidateId ? "is-active" : ""}" data-select-candidate="${candidate.id}">
      <strong>${candidate.name}</strong>
      <span>${candidate.assessedRole} · ${formatPercent(summary.score)}</span>
      <span>${summary.recommendation}</span>
    </button>
  `;
}

function renderScorecard(candidate) {
  if (!candidate) return `<section class="panel"><div class="panel-body">Add a candidate to begin.</div></section>`;
  const summary = candidateSummary(candidate);
  return `
    ${renderMetrics(candidate, summary)}
    <div class="layout">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>${candidate.name}</h2>
            <div class="muted">${candidate.title}</div>
          </div>
          <button class="danger" data-action="remove-candidate">Remove</button>
        </div>
        <div class="panel-body">
          ${renderCandidateForm(candidate)}
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h3>Recommendation logic</h3></div>
        <div class="panel-body">${renderWarnings(summary)}</div>
      </section>
    </div>
        <div class="actions">
          <button class="primary" data-action="add-stage">Add stage</button>
          <button data-view="report">View report</button>
        </div>
    ${candidate.stages.map((stage) => renderStage(candidate, stage)).join("")}
  `;
}

function renderMetrics(candidate, summary) {
  return `
    <div class="metrics">
      <div class="metric"><span>Overall weighted score</span><strong>${formatPercent(summary.score)}</strong></div>
      <div class="metric"><span>Final recommendation</span><strong>${summary.recommendation}</strong></div>
      <div class="metric"><span>Critical concerns</span><strong>${summary.redFlags.length}</strong></div>
      <div class="metric"><span>Status</span><strong>${candidate.status}</strong></div>
    </div>
  `;
}

function renderCandidateForm(candidate) {
  return `
    <div class="form-grid">
      ${field("Name", "name", candidate.name)}
      ${field("Current role/title", "title", candidate.title)}
      ${field("LinkedIn or CV link", "link", candidate.link)}
      ${field("Role being assessed for", "assessedRole", candidate.assessedRole)}
      ${field("Client/company", "client", candidate.client)}
      ${field("Status", "status", candidate.status)}
      <label class="field">
        <span>Role template</span>
        <select data-candidate-field="roleTemplate">${roleTemplateOptions(candidate.roleTemplate || "")}</select>
      </label>
      <div class="field template-apply">
        <span>Template actions</span>
        <button data-action="apply-role-template">Apply template</button>
      </div>
      <label class="field">
        <span>Manual recommendation override</span>
        <select data-candidate-field="recommendationOverride">${recommendationOptions(candidate.recommendationOverride)}</select>
      </label>
      <label class="field full">
        <span>Notes summary</span>
        <textarea data-candidate-field="notesSummary">${candidate.notesSummary}</textarea>
      </label>
    </div>
  `;
}

function field(label, key, value) {
  return `
    <label class="field">
      <span>${label}</span>
      <input value="${escapeHtml(value)}" data-candidate-field="${key}" />
    </label>
  `;
}

function renderWarnings(summary) {
  if (!summary.redFlags.length) {
    return `<div class="warning success">No critical criteria are currently below the recommended threshold.</div>`;
  }
  return `
    <div class="warning-list">
      ${summary.redFlags
        .map(
          (flag) => `
            <div class="warning">
              Strong overall score checks should be reviewed: ${flag.criterionName} is below threshold in ${flag.stageName}
              (${flag.average.toFixed(1)} / 5).
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStage(candidate, stage) {
  const average = stageAverage(stage);
  const percent = scoreToPercent(average);
  return `
    <section class="panel stage" data-stage-id="${stage.id}">
      <div class="stage-head">
        <input value="${escapeHtml(stage.name)}" data-stage-field="name" aria-label="Stage name" />
        <input inputmode="numeric" pattern="[0-9]*" value="${stage.weight}" data-stage-field="weight" aria-label="Stage weighting" />
        <div class="stage-score">${formatPercent(percent)}</div>
        <button class="danger" data-action="remove-stage" data-stage-id="${stage.id}">Remove</button>
      </div>
      <div class="stage-body">
        <div class="muted">
          ${stage.reviewers.length} reviewer${stage.reviewers.length === 1 ? "" : "s"} ·
          stage weighting ${stage.weight}%
        </div>
        ${renderCriteriaEditor(stage)}
        ${stage.reviewers.map((reviewer) => renderReviewer(stage, reviewer)).join("")}
        <div class="actions">
          <button data-action="add-reviewer" data-stage-id="${stage.id}">Add reviewer</button>
        </div>
      </div>
    </section>
  `;
}

function renderCriteriaEditor(stage) {
  return `
    <div class="criteria-editor">
      <div class="criteria-editor-head">
        <strong>Criteria</strong>
        <span class="muted">${stage.criteria.length} item${stage.criteria.length === 1 ? "" : "s"}</span>
      </div>
      <div class="criteria-editor-list">
        ${stage.criteria
          .map(
            (criterion) => `
              <div class="criteria-editor-row" data-criterion-id="${criterion.id}">
                <input value="${escapeHtml(criterion.name)}" data-criterion-field="name" aria-label="Criterion name" />
                <label class="critical-toggle">
                  <input type="checkbox" ${criterion.critical ? "checked" : ""} data-criterion-field="critical" />
                  <span>Critical</span>
                </label>
                <button class="danger" data-action="remove-criterion" data-criterion-id="${criterion.id}">Remove</button>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="actions">
        <button data-action="add-criterion" data-stage-id="${stage.id}">Add criterion</button>
      </div>
    </div>
  `;
}

function renderReviewer(stage, reviewer) {
  return `
    <div class="reviewer" data-reviewer-id="${reviewer.id}">
      <div class="reviewer-title">
        <label class="field"><span>Reviewer name</span><input value="${escapeHtml(reviewer.name)}" data-reviewer-field="name" /></label>
        <label class="field"><span>Reviewer role</span><input value="${escapeHtml(reviewer.role)}" data-reviewer-field="role" /></label>
        <label class="field"><span>Date reviewed</span><input type="date" value="${reviewer.date}" data-reviewer-field="date" /></label>
        <label class="field">
          <span>Stage recommendation</span>
          <select data-reviewer-field="recommendation">${recommendationOptions(reviewer.recommendation)}</select>
        </label>
        <button class="danger" data-action="remove-reviewer" data-reviewer-id="${reviewer.id}">Remove</button>
      </div>
      <div class="criteria-grid">
        ${stage.criteria
          .map(
            (criterion) => `
              <label class="criterion">
                <span>
                  <strong>${criterion.name}</strong>
                  ${criterion.critical ? "<small>Critical</small>" : ""}
                </span>
                <input class="score-input" inputmode="numeric" pattern="[1-5]" value="${clampScore(reviewer.scores?.[criterion.id] ?? 3)}" data-score-criterion="${criterion.id}" aria-label="${criterion.name} score" />
              </label>
            `
          )
          .join("")}
      </div>
      <label class="field full"><span>Notes</span><textarea data-reviewer-field="notes">${reviewer.notes}</textarea></label>
    </div>
  `;
}

function renderComparison() {
  return `
    <section class="panel">
      <div class="panel-header">
        <h2>Candidate comparison</h2>
        <span class="muted">Side-by-side weighted score, stages, red flags and notes</span>
      </div>
      <div class="panel-body">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Weighted score</th>
              <th>Stage scores</th>
              <th>Critical criteria</th>
              <th>Red flags</th>
              <th>Reviewer notes</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            ${state.candidates.map(renderComparisonRow).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCandidateReport(candidate) {
  if (!candidate) {
    return `<section class="panel"><div class="panel-body">Add a candidate to build a report.</div></section>`;
  }

  const summary = candidateSummary(candidate);
  return `
    <section class="panel report">
      <div class="panel-header">
        <div>
          <h2>${candidate.name}</h2>
          <div class="muted">Candidate report · ${candidate.client}</div>
        </div>
        <div class="report-actions">
          <button class="primary" data-action="download-report">Download report</button>
          <button class="primary" data-action="print-report">Print / Save PDF</button>
          <button data-view="scorecard">Back to scorecard</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="report-hero">
          <div>
            <span>Overall weighted score</span>
            <strong>${formatPercent(summary.score)}</strong>
          </div>
          <div>
            <span>Final recommendation</span>
            <strong>${summary.recommendation}</strong>
          </div>
          <div>
            <span>Critical concerns</span>
            <strong>${summary.redFlags.length}</strong>
          </div>
        </div>

        <div class="report-grid">
          <div class="report-section">
            <h3>Candidate Details</h3>
            <dl>
              ${reportDetail("Current role", candidate.title)}
              ${reportDetail("Role assessed", candidate.assessedRole)}
              ${reportDetail("Client/company", candidate.client)}
              ${reportDetail("Status", candidate.status)}
              ${reportDetail("LinkedIn/CV", candidate.link ? `<a href="${escapeHtml(candidate.link)}" target="_blank" rel="noreferrer">${escapeHtml(candidate.link)}</a>` : "Not provided")}
            </dl>
          </div>

          <div class="report-section">
            <h3>Recommendation Rationale</h3>
            ${renderWarnings(summary)}
            <p class="report-notes">${escapeHtml(candidate.notesSummary || "No notes summary yet.")}</p>
          </div>
        </div>

        <div class="report-section">
          <h3>Stage Scores</h3>
          <div class="report-stage-list">
            ${summary.stageSummaries.map((stage) => renderReportStage(candidate, stage)).join("")}
          </div>
        </div>

        <div class="report-section">
          <h3>Reviewer Notes</h3>
          <div class="report-notes-list">
            ${candidate.stages.flatMap((stage) => stage.reviewers.map((reviewer) => renderReportReviewer(stage, reviewer))).join("") || "<p class=\"muted\">No reviewer notes yet.</p>"}
          </div>
        </div>
      </div>
    </section>
  `;
}

function reportDetail(label, value) {
  return `
    <div>
      <dt>${label}</dt>
      <dd>${value || "Not provided"}</dd>
    </div>
  `;
}

function renderReportStage(candidate, stageSummary) {
  const stage = candidate.stages.find((item) => item.id === stageSummary.id);
  const criticalCriteria = stage.criteria.filter((criterion) => criterion.critical);
  return `
    <article class="report-stage">
      <div>
        <strong>${stageSummary.name}</strong>
        <span class="muted">${stageSummary.reviewerCount} reviewer${stageSummary.reviewerCount === 1 ? "" : "s"} · ${stageSummary.weight}% weighting</span>
      </div>
      <span class="score-pill">${formatPercent(stageSummary.percent)}</span>
      <div class="report-stage-criteria">
        ${criticalCriteria.length ? criticalCriteria.map((criterion) => `<span>${criterion.name}</span>`).join("") : "<span>No critical criteria</span>"}
      </div>
    </article>
  `;
}

function renderReportReviewer(stage, reviewer) {
  return `
    <article class="report-note">
      <div>
        <strong>${reviewer.name}</strong>
        <span class="muted">${stage.name} · ${reviewer.role || "Reviewer"} · ${reviewer.date || "No date"}</span>
      </div>
      <span class="score-pill">${reviewer.recommendation || "Needs Review"}</span>
      <p>${escapeHtml(reviewer.notes || "No notes added.")}</p>
    </article>
  `;
}

function renderComparisonRow(candidate) {
  const summary = candidateSummary(candidate);
  return `
    <tr>
      <td><strong>${candidate.name}</strong><div class="muted">${candidate.assessedRole}<br />${candidate.client}</div></td>
      <td><span class="score-pill">${formatPercent(summary.score)}</span></td>
      <td>${summary.stageSummaries.map((stage) => `${stage.name}: ${formatPercent(stage.percent)}`).join("<br />")}</td>
      <td>${candidate.stages.flatMap((stage) => stage.criteria.filter((criterion) => criterion.critical).map((criterion) => criterion.name)).join("<br />")}</td>
      <td>${summary.redFlags.length ? summary.redFlags.map((flag) => `${flag.criterionName} (${flag.average.toFixed(1)})`).join("<br />") : "None"}</td>
      <td class="notes">${candidate.stages.flatMap((stage) => stage.reviewers.map((reviewer) => `${reviewer.name}: ${reviewer.notes}`)).join("<br /><br />")}</td>
      <td><strong>${summary.recommendation}</strong></td>
    </tr>
  `;
}

app.addEventListener("click", (event) => {
  const candidateButton = event.target.closest("[data-select-candidate]");
  if (candidateButton) {
    selectedCandidateId = candidateButton.dataset.selectCandidate;
    view = "scorecard";
    render();
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    view = viewButton.dataset.view;
    render();
    return;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const candidate = selectedCandidate();

  if (action === "print-report") {
    window.print();
    return;
  }
  if (action === "download-report") {
    downloadReport(candidate);
    return;
  }
  if (action === "add-candidate") addCandidate();
  if (action === "remove-candidate") removeCandidate(candidate.id);
  if (action === "reset-sample") resetSample();
  if (action === "apply-role-template") applyRoleTemplate(candidate);
  if (action === "add-stage") addStage(candidate);
  if (action === "remove-stage") removeStage(candidate, event.target.dataset.stageId);
  if (action === "add-criterion") addCriterion(candidate, event.target.dataset.stageId);
  if (action === "remove-criterion") removeCriterion(candidate, event.target.dataset.criterionId);
  if (action === "add-reviewer") addReviewer(candidate, event.target.dataset.stageId);
  if (action === "remove-reviewer") removeReviewer(candidate, event.target.dataset.reviewerId);

  saveState();
  render();
});

app.addEventListener("input", (event) => updateFromEvent(event, false));
app.addEventListener("change", (event) => updateFromEvent(event, true));

function updateFromEvent(event, shouldRender = true) {
  const candidate = selectedCandidate();
  if (!candidate) return;

  if (event.target.matches("[data-candidate-field]")) {
    candidate[event.target.dataset.candidateField] = event.target.value;
  }

  const stageEl = event.target.closest("[data-stage-id]");
  const stage = stageEl ? candidate.stages.find((item) => item.id === stageEl.dataset.stageId) : null;

  if (stage && event.target.matches("[data-stage-field]")) {
    const key = event.target.dataset.stageField;
    stage[key] = key === "weight" ? normalizeWeight(event.target.value) : event.target.value;
  }

  const criterionEl = event.target.closest("[data-criterion-id]");
  const criterion = criterionEl
    ? candidate.stages
        .flatMap((item) => item.criteria)
        .find((item) => item.id === criterionEl.dataset.criterionId)
    : null;

  if (criterion && event.target.matches("[data-criterion-field]")) {
    const key = event.target.dataset.criterionField;
    criterion[key] = key === "critical" ? event.target.checked : event.target.value;
  }

  const reviewerEl = event.target.closest("[data-reviewer-id]");
  const reviewer = reviewerEl
    ? candidate.stages.flatMap((item) => item.reviewers).find((item) => item.id === reviewerEl.dataset.reviewerId)
    : null;

  if (reviewer && event.target.matches("[data-reviewer-field]")) {
    reviewer[event.target.dataset.reviewerField] = event.target.value;
  }

  if (reviewer && event.target.matches("[data-score-criterion]")) {
    reviewer.scores[event.target.dataset.scoreCriterion] = clampScore(event.target.value);
  }

  saveState();
  if (shouldRender) render();
}

function addCandidate() {
  const candidate = {
    id: crypto.randomUUID(),
    name: "New candidate",
    title: "",
    link: "",
    assessedRole: "",
    client: "",
    status: "New",
    roleTemplate: "",
    recommendationOverride: "",
    notesSummary: "",
    stages: defaultStages.map((stage) => structuredClone(stage)).map((stage) => ({ ...stage, reviewers: [] })),
  };
  state.candidates.push(candidate);
  selectedCandidateId = candidate.id;
}

function removeCandidate(candidateId) {
  state.candidates = state.candidates.filter((candidate) => candidate.id !== candidateId);
  selectedCandidateId = state.candidates[0]?.id;
}

function resetSample() {
  localStorage.removeItem(storageKey);
  state = { version: currentSchemaVersion, candidates: structuredClone(sampleCandidates) };
  selectedCandidateId = state.candidates[0]?.id;
}

function addStage(candidate) {
  candidate.stages.push({
    id: crypto.randomUUID(),
    name: "New interview stage",
    weight: 0,
    criteria: [
      { id: crypto.randomUUID(), name: "Role fit", critical: true },
      { id: crypto.randomUUID(), name: "Evidence quality", critical: false },
      { id: crypto.randomUUID(), name: "Hiring confidence", critical: false },
    ],
    reviewers: [],
  });
}

function removeStage(candidate, stageId) {
  candidate.stages = candidate.stages.filter((stage) => stage.id !== stageId);
}

function addCriterion(candidate, stageId) {
  const stage = candidate.stages.find((item) => item.id === stageId);
  const criterion = {
    id: crypto.randomUUID(),
    name: "New criterion",
    critical: false,
  };
  stage.criteria.push(criterion);
  stage.reviewers.forEach((reviewer) => {
    reviewer.scores = reviewer.scores || {};
    reviewer.scores[criterion.id] = 3;
  });
}

function removeCriterion(candidate, criterionId) {
  candidate.stages.forEach((stage) => {
    const hasCriterion = stage.criteria.some((criterion) => criterion.id === criterionId);
    if (!hasCriterion) return;

    stage.criteria = stage.criteria.filter((criterion) => criterion.id !== criterionId);
    stage.reviewers.forEach((reviewer) => {
      delete reviewer.scores?.[criterionId];
    });
  });
}

function addReviewer(candidate, stageId) {
  const stage = candidate.stages.find((item) => item.id === stageId);
  stage.reviewers.push({
    id: crypto.randomUUID(),
    name: "New reviewer",
    role: "",
    date: new Date().toISOString().slice(0, 10),
    recommendation: "Needs Review",
    scores: Object.fromEntries(stage.criteria.map((criterion) => [criterion.id, 3])),
    notes: "",
  });
}

function removeReviewer(candidate, reviewerId) {
  candidate.stages.forEach((stage) => {
    stage.reviewers = stage.reviewers.filter((reviewer) => reviewer.id !== reviewerId);
  });
}

function applyRoleTemplate(candidate) {
  const template = roleTemplates.find((item) => item.id === candidate.roleTemplate);
  if (!template) return;

  const customStages = candidate.stages.filter((stage) => !template.stages.some((item) => item.id === stage.id));

  candidate.assessedRole = template.name;
  candidate.stages = [
    ...template.stages.map((templateStage) => {
      const existingStage = candidate.stages.find((stage) => stage.id === templateStage.id);
      return {
        ...(existingStage || {}),
        id: templateStage.id,
        name: existingStage?.name || defaultStages.find((stage) => stage.id === templateStage.id)?.name || "Interview stage",
        weight: templateStage.weight,
        criteria: structuredClone(templateStage.criteria),
        reviewers: (existingStage?.reviewers || []).map((reviewer) => ({
          ...reviewer,
          scores: Object.fromEntries(
            templateStage.criteria.map((criterion) => [
              criterion.id,
              reviewer.scores?.[criterion.id] ?? 3,
            ])
          ),
        })),
      };
    }),
    ...customStages,
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeWeight(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function downloadReport(candidate) {
  if (!candidate) return;

  const report = document.querySelector(".report")?.cloneNode(true);
  if (!report) return;

  report.querySelector(".report-actions")?.remove();

  const file = new Blob([buildStandaloneReportHtml(candidate, report.outerHTML)], {
    type: "text/html",
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(candidate.name)}-interview-report.html`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildStandaloneReportHtml(candidate, reportHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(candidate.name)} Interview Report</title>
    <style>${standaloneReportStyles()}</style>
  </head>
  <body>
    <main>${reportHtml}</main>
  </body>
</html>`;
}

function standaloneReportStyles() {
  return `
    :root {
      --bg: #000824;
      --panel: #071234;
      --line: rgb(104 150 251 / 26%);
      --muted: rgb(255 255 255 / 68%);
      --text: #ffffff;
      --accent: #6896fb;
      --accent-2: #ff6c43;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      background: linear-gradient(135deg, #000824 0%, #061234 52%, #000824 100%);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main { max-width: 1060px; margin: 0 auto; }
    a { color: var(--accent); }
    .panel {
      background: rgb(7 18 52 / 92%);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    .panel-header,
    .panel-body { padding: 24px; }
    .panel-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--line);
    }
    h2, h3 { margin: 0; }
    .muted { color: var(--muted); }
    .report-hero,
    .report-grid {
      display: grid;
      gap: 12px;
      margin-bottom: 16px;
    }
    .report-hero { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .report-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .report-hero > div,
    .report-section,
    .report-stage,
    .report-note,
    .warning {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgb(0 8 36 / 28%);
    }
    .report-hero > div,
    .report-section,
    .report-stage,
    .report-note,
    .warning { padding: 16px; }
    .report-hero span,
    dt {
      display: block;
      color: var(--muted);
      font-size: 13px;
    }
    .report-hero strong {
      display: block;
      margin-top: 6px;
      font-size: 28px;
    }
    .report-section { margin-bottom: 16px; }
    .report-section h3 { margin-bottom: 12px; font-size: 17px; }
    dl { display: grid; gap: 10px; margin: 0; }
    dd { margin: 3px 0 0; }
    .warning {
      border-color: rgb(255 108 67 / 54%);
      color: #fff0eb;
      background: rgb(255 108 67 / 12%);
    }
    .success {
      border-color: rgb(104 150 251 / 46%);
      color: #eef4ff;
      background: rgb(104 150 251 / 11%);
    }
    .report-notes,
    .report-note p {
      line-height: 1.45;
    }
    .report-stage-list,
    .report-notes-list {
      display: grid;
      gap: 12px;
    }
    .report-stage,
    .report-note {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
    }
    .report-stage strong,
    .report-note strong { display: block; }
    .score-pill {
      display: inline-flex;
      justify-content: center;
      min-width: 64px;
      padding: 4px 8px;
      border-radius: 999px;
      background: rgb(104 150 251 / 14%);
      color: var(--accent);
      font-weight: 800;
    }
    .report-stage-criteria {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .report-stage-criteria span {
      padding: 4px 8px;
      border: 1px solid rgb(255 108 67 / 38%);
      border-radius: 999px;
      color: #fff0eb;
      background: rgb(255 108 67 / 10%);
      font-size: 13px;
    }
    .report-note p {
      grid-column: 1 / -1;
      margin: 0;
      color: var(--muted);
    }
    @media (max-width: 760px) {
      body { padding: 16px; }
      .report-hero,
      .report-grid,
      .report-stage,
      .report-note { grid-template-columns: 1fr; }
    }
    @media print {
      body { background: #ffffff; color: #000824; }
      .panel,
      .report-hero > div,
      .report-section,
      .report-stage,
      .report-note,
      .warning { background: #ffffff; border-color: #d7ddea; }
      .muted, .report-note p, dt { color: #4d5871; }
      .warning, .report-stage-criteria span { color: #c94c2f; }
    }
  `;
}

function slugify(value) {
  return String(value || "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

render();
