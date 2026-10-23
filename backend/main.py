import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from seed_data import seed_database
from routers import case_resolver, journey, centers, tracker

# Auto-seed database on startup
seed_database()

app = FastAPI(
    title="NADRA Navigator API",
    description="AI-Powered NADRA Service & Application Guide | DITE Hackathon 2026-27",
    version="1.0.0"
)

# CORS - Allow frontend (Vercel) to reach backend (Render)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers
app.include_router(case_resolver.router)
app.include_router(journey.router)
app.include_router(centers.router)
app.include_router(tracker.router)

@app.get("/")
def root():
    return {
        "project": "NADRA Navigator",
        "tagline": "AI-Powered NADRA Service & Application Guide",
        "hackathon": "DITE Hackathon 2026-27 | Public Service Theme",
        "status": "operational",
        "ai_engine": "Google Gemini (gemini-flash-lite-latest)",
        "endpoints": {
            "resolve_case": "POST /api/v1/resolve-case",
            "checklist": "GET /api/v1/checklist/{service_id}",
            "journey": "GET /api/v1/journey/{service_id}",
            "form_doctor": "POST /api/v1/form-doctor/validate",
            "centers": "GET /api/v1/centers?city=Hyderabad",
            "tracker": "GET /api/v1/track/{tracking_id}",
            "demo_ids": "GET /api/v1/demo-tracking-ids"
        }
    }

@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "message": "NADRA Navigator backend is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
