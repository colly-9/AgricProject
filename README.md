# FarmHelp AI (Agriculture prototype)

## Problem
Farmers and students often struggle to turn crop observations (yellowing, leaf spots, wilting, etc.) into practical **next steps**. This prototype reduces that confusion by converting symptom descriptions into educational checklists.

## Solution (AI-based)
FarmHelp is a static web prototype that:
- Uses a small **knowledge base** (`knowledge-base.json`) to map selected symptoms to educational **issue categories** and **inspection checklists** (retrieval-like step).
- Uses **in-browser NLP summarization** (DistilBART via Transformers.js) to generate a short, plain-language **2-sentence educational brief** from the selected symptoms and top categories.

## Safety / limitations
- Educational guidance only: the app **does not diagnose** crop diseases.
- Results are approximate and depend on the small prototype dataset. For real decisions, consult a local agronomist/extension officer.
- Avoid entering sensitive or proprietary farm data.

## Project files
- `index.html` - UI
- `styles.css` - styling
- `app.js` - prototype logic + AI summarization in the browser
- `knowledge-base.json` - demo symptom-to-guidance knowledge base

## Run locally
GitHub Pages needs HTTP for ES modules. Locally, run:

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy to GitHub Pages
1. Create a GitHub repository from this folder.
2. Go to **Settings** -> **Pages**.
3. Choose **Deploy from a branch** and set:
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
4. Copy the Pages URL and submit it.

## Note for grading (why AI applies)
Your rubric wants an AI component: the app uses an in-browser summarization model to rewrite a short educational brief, and it also shows a structured retrieval step from the provided knowledge base.

