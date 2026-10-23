from fastapi import APIRouter
from pydantic import BaseModel
from ai_service import resolve_case_ai
from database import get_db_connection

router = APIRouter(prefix="/api/v1", tags=["Case Resolver & Checklist"])

class CaseQuery(BaseModel):
    query: str
    language: str = "auto"

@router.post("/resolve-case")
def resolve_case(body: CaseQuery):
    result = resolve_case_ai(body.query, body.language)
    return {"status": "success", "data": result}

@router.get("/checklist/{service_id}")
def get_checklist(service_id: str):
    conn = get_db_connection()
    docs = conn.execute(
        "SELECT * FROM document_requirements WHERE service_id = ?", (service_id,)
    ).fetchall()
    service = conn.execute(
        "SELECT * FROM services WHERE service_id = ?", (service_id,)
    ).fetchone()
    conn.close()

    if not service:
        return {"status": "error", "message": "Service not found"}

    required = []
    optional = []
    for d in docs:
        item = {
            "id": d["id"],
            "name_en": d["doc_name_en"],
            "name_ur": d["doc_name_ur"],
            "explanation_en": d["simple_explanation_en"],
            "explanation_ur": d["simple_explanation_ur"],
            "condition": d["condition_rule"]
        }
        if d["is_mandatory"]:
            required.append(item)
        else:
            optional.append(item)

    return {
        "status": "success",
        "service_id": service_id,
        "service_title": service["title_en"],
        "service_title_ur": service["title_ur"],
        "fee_normal": service["fee_normal"],
        "fee_urgent": service["fee_urgent"],
        "fee_executive": service["fee_executive"],
        "delivery_normal": service["delivery_days_normal"],
        "delivery_urgent": service["delivery_days_urgent"],
        "required_documents": required,
        "optional_documents": optional
    }

@router.get("/services")
def get_services():
    conn = get_db_connection()
    services = conn.execute("SELECT * FROM services").fetchall()
    conn.close()
    return {
        "status": "success",
        "services": [dict(s) for s in services]
    }
