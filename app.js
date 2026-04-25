import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

// Keep inference privacy-friendly: the model runs in the visitor's browser.
env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = "Xenova/distilbart-cnn-6-3";
const MIN_SELECTED_SYMPTOMS = 1;
const MAX_INPUT_CHARS_FOR_AI = 700;
const TOP_CATEGORIES_LIMIT = 3;
const AI_OUTPUT_MAX_LENGTH = 90;
const AI_OUTPUT_MIN_LENGTH = 30;

// Sample configuration for demo
const SAMPLE_CONFIG = {
  crop: "maize",
  plantPart: "leaf",
  growthStage: "vegetative",
  symptoms: ["leaf-spots", "yellowing"],
  description: "Some leaves show small brown spots and the tips look yellow. It seems to be spreading slowly over the last 2 weeks during humid weather."
};

const LOCAL_KNOWLEDGE_BASE = {
  symptomMappings: {
    yellowing: {
      labels: ["Yellowing", "Chlorosis"],
      categoryKeys: ["nutrient-or-water-stress", "general-plant-stress", "check-soil-and-drainage"]
    },
    "leaf-spots": {
      labels: ["Leaf spots / lesions"],
      categoryKeys: ["leaf-spot-complex", "humidity-and-splash-risk", "sanitation-and-spread-control"]
    },
    wilting: {
      labels: ["Wilting / drooping"],
      categoryKeys: ["water-and-root-stress", "heat-stress-and-irrigation", "check-for-root-problems"]
    },
    powdery: {
      labels: ["Powdery coating"],
      categoryKeys: ["powdery-mildew-group", "airflow-and-humidity-management", "early-action"]
    },
    holes: {
      labels: ["Holes / chewing"],
      categoryKeys: ["insect-feeding-damage", "scouting-and-traps", "protect-and-prevent"]
    },
    curling: {
      labels: ["Leaf curling"],
      categoryKeys: ["stress-or-pest-associated-curl", "underside-scouting", "environmental-drift-and-stress-check"]
    },
    stunting: {
      labels: ["Stunting / poor growth"],
      categoryKeys: ["growth-retardation-check", "nutrition-soil-and-planting-quality", "early-infestation-or-conditions"]
    },
    "wilting-early": {
      labels: ["Early wilting"],
      categoryKeys: ["water-and-root-stress", "check-for-root-problems", "urgent-scouting"]
    }
  },
  categories: {
    "nutrient-or-water-stress": {
      name: "Nutrient or water-related stress (possible)",
      inspect: [
        "Is yellowing more on older leaves, newer leaves, or both?",
        "Are symptoms uniform across the field or patchy?",
        "Check soil moisture and drainage in affected spots."
      ],
      escalateIf: ["Rapid spreading across many plants, or severe loss of vigor."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "general-plant-stress": {
      name: "General plant stress (possible)",
      inspect: [
        "Look for patterns: edges vs center, older vs newer leaves, and within-row vs between-row.",
        "Note when symptoms started relative to weather changes or management actions."
      ],
      escalateIf: ["You cannot find a simple agronomic explanation after basic checks."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "check-soil-and-drainage": {
      name: "Soil moisture and drainage check (possible)",
      inspect: [
        "After watering/rain, does water stay pooled or drain quickly?",
        "Is the affected area low-lying or near compacted spots?"
      ],
      escalateIf: ["Repeated waterlogging or rapid decline despite adjustments."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "leaf-spot-complex": {
      name: "Leaf spot complex (possible group)",
      inspect: [
        "Do spots have clear patterns (size/shape/color) and do they spread over time?",
        "Check leaf undersides and compare healthy vs affected areas.",
        "Note humidity conditions and whether overhead irrigation is used."
      ],
      escalateIf: ["Spreading quickly, severe defoliation, or repeated outbreaks year after year."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "humidity-and-splash-risk": {
      name: "Humidity and splash risk (possible driver)",
      inspect: [
        "Is the problem worse in low-airflow areas or after frequent rains?",
        "Does the irrigation method wet the foliage?"
      ],
      escalateIf: ["Continued worsening despite reducing leaf wetness."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "sanitation-and-spread-control": {
      name: "Sanitation and spread control (possible steps)",
      inspect: [
        "Are lesions clustered in specific rows/areas?",
        "Is there evidence of rapid spread after management events?"
      ],
      escalateIf: ["Widespread spread with significant yield impact."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "water-and-root-stress": {
      name: "Water and root stress (possible)",
      inspect: [
        "Wilting occurs at midday and improves in the evening, or it persists?",
        "Check soil moisture at root depth.",
        "If safe, inspect roots for rot or poor development."
      ],
      escalateIf: ["Persistent wilting that does not recover, or suspected root rot."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "heat-stress-and-irrigation": {
      name: "Heat stress and irrigation timing (possible driver)",
      inspect: [
        "Are symptoms worst during peak heat hours?",
        "Are affected plants near shade differences or irrigation differences?"
      ],
      escalateIf: ["Symptoms persist despite appropriate moisture management."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "check-for-root-problems": {
      name: "Root problem check (possible)",
      inspect: [
        "Look for root discoloration, poor root growth, or dead roots (if safe to inspect).",
        "Assess whether plants are waterlogged or extremely dry."
      ],
      escalateIf: ["Major root damage, rapid plant loss, or widespread persistent wilting."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "powdery-mildew-group": {
      name: "Powdery mildew group (possible)",
      inspect: [
        "Is there a white powdery coating on leaf surfaces?",
        "Is the powdery coating limited to upper leaves or spread across the plant?"
      ],
      escalateIf: ["Rapid worsening under humid conditions despite good airflow."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "airflow-and-humidity-management": {
      name: "Airflow and humidity management (possible)",
      inspect: [
        "Check whether air is moving freely around the plants.",
        "Look for wet foliage or dew that persists for long periods."
      ],
      escalateIf: ["Humidity remains high and symptoms continue despite ventilation improvements."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "early-action": {
      name: "Early action monitoring (possible)",
      inspect: [
        "Note whether symptoms appear in small patches or spread quickly.",
        "Use simple observations before applying any treatment."
      ],
      escalateIf: ["Symptoms spread rapidly or do not improve with basic care."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "insect-feeding-damage": {
      name: "Insect feeding damage (possible)",
      inspect: [
        "Look for chewing marks, frass, or insect bodies on plants.",
        "Compare affected plants to nearby healthy ones."
      ],
      escalateIf: ["Damage is severe or insects appear in large numbers."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "scouting-and-traps": {
      name: "Scouting and traps (possible)",
      inspect: [
        "Use simple traps or regular scouting to monitor pest activity.",
        "Check the underside of leaves and stems."
      ],
      escalateIf: ["Pests are found in high numbers or damage increases rapidly."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "protect-and-prevent": {
      name: "Protect and prevent (possible)",
      inspect: [
        "Assess whether pests can be excluded with nets or barriers.",
        "Look for entry points or nearby pest hotspots."
      ],
      escalateIf: ["Pest pressure remains high despite preventive measures."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "stress-or-pest-associated-curl": {
      name: "Stress or pest-associated curl (possible)",
      inspect: [
        "Check leaf undersides for pests or egg clusters.",
        "Note whether curling appears on new growth or older leaves."
      ],
      escalateIf: ["Curling continues and is accompanied by additional symptoms."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "underside-scouting": {
      name: "Underside scouting (possible)",
      inspect: [
        "Look under leaves for pests, eggs or mildew.",
        "Compare symptom patterns on upper and lower leaf surfaces."
      ],
      escalateIf: ["Pests or disease signs are found on many leaves."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "environmental-drift-and-stress-check": {
      name: "Environmental drift and stress check (possible)",
      inspect: [
        "Consider nearby sprayed fields or weather shifts.",
        "Note whether symptoms started after a heatwave, spray event, or storm."
      ],
      escalateIf: ["Symptoms coincide with known environmental stress and worsen quickly."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "growth-retardation-check": {
      name: "Growth retardation check (possible)",
      inspect: [
        "Compare plant height and vigor to healthy nearby plants.",
        "Check soil fertility and planting quality."
      ],
      escalateIf: ["Poor growth persists despite improved basic care."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "nutrition-soil-and-planting-quality": {
      name: "Nutrition, soil, and planting quality (possible)",
      inspect: [
        "Review soil, fertilizer, and planting depth conditions.",
        "Inspect for uneven emergence or nutrient deficiency signs."
      ],
      escalateIf: ["Nutrient or soil issues persist after basic adjustments."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "early-infestation-or-conditions": {
      name: "Early infestation or conditions (possible)",
      inspect: [
        "Look for small damage spots that may spread.",
        "Note whether the problem appears in isolated patches."
      ],
      escalateIf: ["The situation spreads quickly or becomes difficult to manage."],
      sources: ["Local extension guidance (replace with your sources)."]
    },
    "urgent-scouting": {
      name: "Urgent scouting (possible)",
      inspect: [
        "Inspect affected plants immediately to gauge severity.",
        "Check whether nearby plants are also showing symptoms."
      ],
      escalateIf: ["Symptoms worsen fast or affect many plants quickly."],
      sources: ["Local extension guidance (replace with your sources)."]
    }
  }
};

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

function getInputsFromForm() {
  const crop = document.getElementById("crop").value;
  const plantPart = document.getElementById("plant-part").value;
  const growthStage = document.getElementById("growth-stage").value;
  const selectedSymptoms = getSelectedSymptoms();
  const description = document.getElementById("description").value.trim();

  return { crop, plantPart, growthStage, selectedSymptoms, description };
}

/**
 * Validates form inputs to ensure required fields are set
 */
function validateFormInputs(inputs) {
  if (!inputs.crop || inputs.crop === "") {
    throw new Error("Please select a crop type.");
  }
  if (!inputs.plantPart || inputs.plantPart === "") {
    throw new Error("Please select a plant part.");
  }
  if (!inputs.growthStage || inputs.growthStage === "") {
    throw new Error("Please select a growth stage.");
  }
  if (!inputs.selectedSymptoms || inputs.selectedSymptoms.length === 0) {
    throw new Error("Please select at least one symptom.");
  }
  return true;
}

/**
 * Extracts text from AI summarizer result with proper type checking
 */
function extractSummarizerText(result) {
  if (Array.isArray(result) && result[0]?.summary_text) {
    return result[0].summary_text;
  }
  if (typeof result?.summary_text === "string") {
    return result.summary_text;
  }
  return "";
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
  const inputs = getInputsFromForm();
  const { crop, plantPart, growthStage, selectedSymptoms, description } = inputs;

  // Validate all required inputs
  try {
    validateFormInputs(inputs);
  } catch (error) {
    setStatus(error.message);
    setDefaultOutput();
    return;
  }

  // Retrieval-style step: map symptoms -> categories (from local KB)
  // Score categories by frequency of matching symptoms
  const scores = new Map(); // categoryKey -> frequency count
  for (const sym of selectedSymptoms) {
    const mapping = knowledgeBase.symptomMappings[sym];
    if (!mapping) continue;
    for (const key of mapping.categoryKeys) {
      scores.set(key, (scores.get(key) || 0) + 1);
    }
  }

  // Sort categories by score (highest first) and get top matches
  const sortedCategoryKeys = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const topCategoryKeys = sortedCategoryKeys.slice(0, TOP_CATEGORIES_LIMIT);
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
      max_length: AI_OUTPUT_MAX_LENGTH,
      min_length: AI_OUTPUT_MIN_LENGTH,
    });

    briefText = extractSummarizerText(result);
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
  showPage("results");
}

async function loadKnowledgeBase() {
  try {
    const resp = await fetch("./knowledge-base.json");
    if (!resp.ok) {
      throw new Error("Could not load knowledge-base.json");
    }
    return await resp.json();
  } catch (error) {
    console.warn("Could not load knowledge base from file; using built-in fallback.", error);
    setStatus("Using built-in knowledge base fallback. Submit again to see results.");
    return LOCAL_KNOWLEDGE_BASE;
  }
}

/**
 * Loads sample data for demonstration purposes
 */
function loadSample() {
  document.getElementById("crop").value = SAMPLE_CONFIG.crop;
  document.getElementById("plant-part").value = SAMPLE_CONFIG.plantPart;
  document.getElementById("growth-stage").value = SAMPLE_CONFIG.growthStage;

  // Set sample symptoms
  const checkboxes = formEl.querySelectorAll('input[name="symptoms"]');
  checkboxes.forEach((cb) => {
    cb.checked = SAMPLE_CONFIG.symptoms.includes(cb.value);
  });

  document.getElementById("description").value = SAMPLE_CONFIG.description;

  setStatus("Sample loaded. Click “Get guidance”.");
}

// ============= PAGE NAVIGATION =============
/**
 * Shows a specific page and hides all others
 */
function showPage(pageName) {
  // Hide all pages
  const allPages = document.querySelectorAll(".page");
  allPages.forEach((page) => page.classList.remove("active"));

  // Show the selected page
  const selectedPage = document.getElementById(`page-${pageName}`);
  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Update nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.dataset.page === pageName) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Scroll to top
  window.scrollTo(0, 0);
}

// ============= WAIT POPUP FUNCTION==========
/*function showWaitMessage() {
  const popup = document.createElement("div");
  popup.textContent = "Loading Crop Guide... please wait ⏳";
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#0e2d4c";
  popup.style.color = "white";
  popup.style.padding = "12px 20px";
  popup.style.borderRadius = "8px";
  popup.style.zIndex = "9999";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2000);
}*/

function showWaitMessage(text = "Analyzing crop... please wait ⏳") {
  const popup = document.createElement("div");
  popup.id = "wait-popup";
  popup.textContent = text;

  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.left = "50%";
  popup.style.transform = "translateX(-50%)";
  popup.style.background = "#0e2d4c";
  popup.style.color = "white";
  popup.style.padding = "12px 20px";
  popup.style.borderRadius = "8px";
  popup.style.zIndex = "9999";
  popup.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";

  document.body.appendChild(popup);
}

function removeWaitMessage() {
  const popup = document.getElementById("wait-popup");
  if (popup) popup.remove();
}

/**
 * Sets up navigation button event listeners
 */
function setupNavigation() {
  // Get all navigation buttons (both nav-link and CTA buttons)
  const navButtons = document.querySelectorAll("[data-page]");
  
  navButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const pageName = button.dataset.page;
      
      // If it was a nav link, close mobile menu if open
      if (pageName == "guide") {
        showWaitMessage();
      }
      setTimeout(() => {
        showPage(pageName);
      }, 300) //small delay to allow wait message to appear before navigation
      
      if (button.classList.contains("nav-link")) {
        const menu = document.querySelector(".navbar-menu");
        const hamburger = document.querySelector(".hamburger");
        if (menu) menu.classList.remove("active");
        if (hamburger) hamburger.classList.remove("active");
      }
    });
  });

  // Setup hamburger menu toggle
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector(".navbar-menu");
  
  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
  }
}

async function init() {
  setDefaultOutput();
  setStatus("Ready.");

  // Setup navigation
  setupNavigation();

  // Setup popups
  document.getElementById('header-popup').style.display = 'block';
  document.getElementById('aside-popup').style.display = 'block';

  document.querySelectorAll('.close-popup').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'none';
    });
  });

  // Reappear every 10 minutes
  setInterval(() => {
    document.getElementById('header-popup').style.display = 'block';
    document.getElementById('aside-popup').style.display = 'block';
  }, 600000);

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

    showWaitMessage("Analyzing crop... please wait ⏳");

    // Basic UX: clear old status quickly
    setStatus("Working...");
    await handleSubmit({ knowledgeBase });

    removeWaitMessage();//remove after processing
  });

  const loadSampleBtn = document.getElementById("load-sample");
  loadSampleBtn.addEventListener("click", loadSample);
}

init();

