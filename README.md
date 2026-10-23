# NADRA Navigator 🇵🇰

> **AI-Powered NADRA Service & Application Guide**  
> DITE Hackathon 2026-27 | Theme: **Public Service** | Duration: 5 Hours

---

## 🏆 Project Summary

NADRA Navigator turns a confusing government procedure into a **personalized journey** — from *"What do I need?"* to *"What happens next?"*

Millions of Pakistani citizens experience avoidable NADRA rejections, repeated center visits, and confusion over documentation. NADRA Navigator uses Google Gemini AI to understand citizen problems in **Urdu, Roman Urdu, and English**, and maps them to verified official NADRA procedures.

---

## 👥 Team — DITE Hackathon 2026-27

| Role | Member Name |
|------|-------------|
| **Team Leader** | **Fizza Baloch** |
| **Core Engineer / Researcher** | **Aleena Memon** |
| **Core Engineer / Designer** | **Fiza Nizamani** |

**Repository:** [https://github.com/fizzabaloch/Hackathon2k26](https://github.com/fizzabaloch/Hackathon2k26)

---

## 🎯 Theme

**Public Service** — Document & form assistant, government service navigator.

## 📋 Problem Statement

Over 40% of NADRA center visitors experience delays or rejections due to unclear documentation requirements, confusing government terminology, and lack of personalized guidance. Citizens spend hours in queue only to be sent back home.

---

## 🤖 How AI Is Used

**Model:** Google Gemini (`gemini-flash-lite-latest` via REST API)

| Feature | AI Role |
|---------|---------|
| Case Resolver | Semantic intent classification from Urdu/Roman Urdu/English → structured NADRA service JSON |
| Rejection Explainer | Translates cryptic NADRA rejection codes (e.g. `BIO-FAIL-R14`) into plain Urdu & English with step-by-step remediation |
| Form Doctor | AI-backed field explanation + deterministic cross-field contradiction engine |

**AI Architecture:** Dual-mode — Google Gemini for LLM inference with a high-precision deterministic rules engine as fallback (ensures zero downtime for judges even if API quota is hit).

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Custom CSS (Denning Navy/Gold theme) |
| Backend | Python 3.12 + FastAPI + Uvicorn |
| Database | SQLite (auto-seeded on startup) |
| AI | Google Gemini API (gemini-flash-lite-latest) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 6 Core Features

1. **🤖 AI Case Resolver** — Natural language → classified NADRA service (Urdu/Roman Urdu/English)
2. **📋 Document Checklist** — Personalized checklist with interactive check-off states
3. **🗺️ Journey Simulator** — Visual step-by-step stepper with bottleneck risk warnings
4. **🩺 Form Doctor** — Field-level validation and cross-field contradiction detection
5. **📍 Center Finder** — NADRA center directory with crowd level indicators
6. **📡 App Tracker** — Status pipeline + AI-translated rejection explanations

---

## ⚙️ Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🌐 Deployment

- **Frontend:** Vercel — connect GitHub repo, set root to `/frontend`, add `VITE_API_BASE_URL`
- **Backend:** Render — connect GitHub repo, set root to `/backend`, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📚 Data Sources & Credits

- NADRA official service procedures: [nadra.gov.pk](https://www.nadra.gov.pk)
- NADRA center locations: Official NADRA website
- Application tracking: Synthetic demo data (no real citizen PII used)
- React, FastAPI, Google Gemini — respective official documentation

---

## ⚠️ Privacy & Ethics

- **No real citizen PII is stored or requested**
- All tracking IDs and form data are synthetic demo data
- Guidance is based on official NADRA public procedures
- This tool is NOT affiliated with or endorsed by NADRA

---

*Built at DITE Hackathon 2026-27 — Organised by TECHGEN, Denning Institute of Technology & Entrepreneurship, Hyderabad*
