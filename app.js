import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

// Keep inference privacy-friendly: the model runs in the visitor's browser.
env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/distilbart-cnn-6-6";
const MIN_SELECTED_SYMPTOMS = 1;
const MAX_INPUT_CHARS_FOR_AI = 700;

const formEl = document.getElementById("symptom-form");
const statusEl = document.getElementById("status");
const summaryEl = document.getElementById("summary");
const shortlistEl = document.getElementById("shortlist");
const checklistEl = document.getElementById("checklist");
const escalateEl = document.getElementById("escalate");
const sourcesEl = document.getElementById("sources");

let summarizerPromise = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function getSelectedSymptoms() {
  const checked = formEl.querySelectorAll('input[name="symptoms"]:checked');
  return Array.from(checked).map((c) => c.value);
}

function wordWrapList(items) {
  return items.length
    ? items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")
    : `<li>None</li>`;
}

async function getSummarizer() {
  if (!summarizerPromise) {
    summarizerPromise = pipeline("summarization", MODEL_ID, {
      quantized: true,
    });
  }
  return summarizerPromise;
}

function buildAIBriefPrompt({ crop, plantPart, growthStage, selectedSymptoms, topCategoryNames }) {
  return (
    "You are an educational agronomy assistant. Do NOT diagnose disease. " +
    "Write a short plain-language brief for a farmer/student based on observations. " +
    "Use cautious wording like 'may' and 'often'. Avoid medical claims.\n\n" +
    `Crop: ${crop}\n` +
    `Affected part: ${plantPart}\n` +
    `Growth stage: ${growthStage}\n` +
    `Selected symptoms: ${selectedSymptoms.join(", ")}\n` +
    `Possible issue categories to consider (non-diagnostic): ${topCategoryNames.join(", ")}\n\n` +
    "Output requirements:\n" +
    "- 2 sentences max\n" +
    "- Mention that this is educational guidance and recommend confirming with a local agronomist/extension officer.\n"
  );
}

function formatDraftTopCategories(categories) {
  return categories.map((c) => c.name).filter(Boolean);
}

function getInputsFromForm() {
  const crop = document.getElementById("crop").value;
  const plantPart = document.getElementById("plant-part").value;
  const growthStage = document.getElementById("growth-stage").value;
  const selectedSymptoms = getSelectedSymptoms();
  const description = document.getElementById("description").value.trim();

  return { crop, plantPart, growthStage, selectedSymptoms, description };
}

function setDefaultOutput() {
  summaryEl.textContent = "Your guidance will appear here after you click “Get guidance”.";
  shortlistEl.innerHTML = "<li>No output yet.</li>";
  checklistEl.innerHTML = "<li>Pick symptoms on the left to generate a checklist.</li>";
  escalateEl.innerHTML = "<li>Uncertainty is high or symptoms are rapidly worsening.</li>";
  sourcesEl.textContent = "We will list the included extension-style documents here.";
}

function renderStructuredOutput({
  topCategories,
  checklist,
  escalateIf,
  sources
}) {
  // Possible issue categories
  shortlistEl.innerHTML = wordWrapList(topCategories.map((c) => c.name));

  // What to inspect next
  checklistEl.innerHTML = wordWrapList(checklist);

  // Escalate if...
  escalateEl.innerHTML = wordWrapList(escalateIf);

  // Sources
  sourcesEl.innerHTML = sources.length
    ? sources.map((s) => `<div>${escapeHtml(s)}</div>`).join("")
    : `<div>Prototype sources will appear here.</div>`;
}

async function handleSubmit({ knowledgeBase }) {
  const { crop, plantPart, growthStage, selectedSymptoms, description } = getInputsFromForm();

  if (!selectedSymptoms.length) {
    setStatus("Please select at least one symptom.");
    setDefaultOutput();
    return;
  }

  // Retrieval-style step: map symptoms -> categories (from local KB)
  const scores = new Map(); // categoryKey -> frequency
  for (const sym of selectedSymptoms) {
    const mapping = knowledgeBase.symptomMappings[sym];
    if (!mapping) continue;
    for (const key of mapping.categoryKeys) {
      scores.set(key, (scores.get(key) || 0) + 1);
    }
  }

  const sortedCategoryKeys = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const topCategoryKeys = sortedCategoryKeys.slice(0, 3);
  const topCategories = topCategoryKeys
    .map((k) => knowledgeBase.categories[k])
    .filter(Boolean);

  // Build checklist from union of category inspect items
  const checklist = unique(
    topCategories.flatMap((c) => c.inspect || []).map((s) => String(s))
  );

  // Build "escalate if" from union of category escalate items + general safety line
  const escalateIf = unique(
    topCategories
      .flatMap((c) => c.escalateIf || [])
      .map((s) => String(s))
      .concat([
        "If symptoms worsen quickly, spread widely, or you are unsure, contact a local agronomist/extension officer."
      ])
  );

  // Sources union
  const sources = unique(
    topCategories.flatMap((c) => c.sources || []).map((s) => String(s))
  );

  renderStructuredOutput({
    topCategories,
    checklist,
    escalateIf,
    sources
  });

  // AI step: produce a short 2-sentence educational brief
  setStatus("Loading summarization model (first time may take a while)...");

  let briefText = "";
  try {
    const summarizer = await getSummarizer();

    const topCategoryNames = topCategories.map((c) => c.name).slice(0, 3);
    const prompt = buildAIBriefPrompt({
      crop,
      plantPart,
      growthStage,
      selectedSymptoms,
      topCategoryNames,
    });

    // If user provided a longer description, we keep it for context in the prompt.
    const trimmedDesc = description ? description.slice(0, MAX_INPUT_CHARS_FOR_AI) : "";
    const fullPrompt = trimmedDesc ? `${prompt}\nExtra notes from the farmer: ${trimmedDesc}` : prompt;

    setStatus("Generating brief (in-browser AI)...");
    const result = await summarizer(fullPrompt, {
      max_length: 90,
      min_length: 30,
    });

    briefText =
      Array.isArray(result) && result[0]?.summary_text
        ? result[0].summary_text
        : typeof result?.summary_text === "string"
          ? result.summary_text
          : "";
  } catch (e) {
    console.warn("Summarization failed; showing fallback brief.", e);
  }

  // Fallback if AI fails
  if (!briefText) {
    briefText =
      "Based on your selected symptoms, consider several possible educational issue categories and check the listed next steps. " +
      "Confirm findings with a local agronomist/extension officer before taking major action.";
  }

  summaryEl.textContent = briefText;
  setStatus("Done. Review the checklist and confirm with local experts.");
}

async function loadKnowledgeBase() {
  const resp = await fetch("./knowledge-base.json");
  if (!resp.ok) throw new Error("Could not load knowledge-base.json");
  return await resp.json();
}

function loadSample() {
  document.getElementById("crop").value = "maize";
  document.getElementById("plant-part").value = "leaf";
  document.getElementById("growth-stage").value = "vegetative";

  const symptomValues = ["leaf-spots", "yellowing"];
  const checkboxes = formEl.querySelectorAll('input[name="symptoms"]');
  checkboxes.forEach((cb) => {
    cb.checked = symptomValues.includes(cb.value);
  });

  document.getElementById("description").value =
    "Some leaves show small brown spots and the tips look yellow. It seems to be spreading slowly over the last 2 weeks during humid weather.";

  setStatus("Sample loaded. Click “Get guidance”.");
}

async function init() {
  setDefaultOutput();
  setStatus("Ready.");

  let knowledgeBase = null;
  try {
    knowledgeBase = await loadKnowledgeBase();
  } catch (e) {
    console.error(e);
    setStatus("Could not load the knowledge base. Check that knowledge-base.json exists.");
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!knowledgeBase) return;

    // Basic UX: clear old status quickly
    setStatus("Working...");
    await handleSubmit({ knowledgeBase });
  });

  const loadSampleBtn = document.getElementById("load-sample");
  loadSampleBtn.addEventListener("click", loadSample);
}

init();

