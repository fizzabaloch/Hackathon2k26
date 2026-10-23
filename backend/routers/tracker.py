from fastapi import APIRouter
from database import get_db_connection
from ai_service import explain_rejection_ai

router = APIRouter(prefix="/api/v1", tags=["Tracker & Rejection Explainer"])

STATUS_LABELS = {
    "SUBMITTED": {"label": "Submitted & Received", "label_ur": "جمع اور موصول", "step": 1, "color": "blue"},
    "IN_VERIFICATION": {"label": "Under Verification", "label_ur": "تصدیق جاری ہے", "step": 2, "color": "yellow"},
    "IN_PRINTING": {"label": "Card Being Printed", "label_ur": "کارڈ پرنٹ ہو رہا ہے", "step": 3, "color": "purple"},
    "READY_FOR_PICKUP": {"label": "Ready for Collection ✓", "label_ur": "وصولی کے لیے تیار", "step": 4, "color": "green"},
    "REJECTED": {"label": "Application Rejected", "label_ur": "درخواست مسترد کر دی گئی", "step": 0, "color": "red"}
}

PIPELINE = [
    {"step": 1, "title": "Submitted", "title_ur": "جمع"},
    {"step": 2, "title": "Under Verification", "title_ur": "زیر تصدیق"},
    {"step": 3, "title": "Printing", "title_ur": "پرنٹنگ"},
    {"step": 4, "title": "Ready for Pickup", "title_ur": "وصولی کے لیے تیار"},
]

@router.get("/track/{tracking_id}")
def track_application(tracking_id: str):
    conn = get_db_connection()
    record = conn.execute(
        "SELECT * FROM application_tracking WHERE tracking_id = ?",
        (tracking_id.upper(),)
    ).fetchone()
    conn.close()

    if not record:
        return {
            "status": "not_found",
            "message": f"Tracking ID '{tracking_id}' not found. For demo, use: TRK-READY-101, TRK-VERIFY-202, TRK-REJECT-303, TRK-SUBMIT-404"
        }

    status_info = STATUS_LABELS.get(record["current_status"], {"label": record["current_status"], "step": 0, "color": "gray", "label_ur": ""})
    is_rejected = record["current_status"] == "REJECTED"

    rejection_info = None
    if is_rejected and record["official_rejection_code"]:
        # Use pre-computed or AI-generated explanation
        if record["ai_action_advice_en"]:
            rejection_info = {
                "code": record["official_rejection_code"],
                "raw_reason": record["rejection_reason_raw"],
                "explanation_en": record["ai_action_advice_en"],
                "explanation_ur": record["ai_action_advice_ur"]
            }
        else:
            ai_result = explain_rejection_ai(
                record["official_rejection_code"],
                record["rejection_reason_raw"],
                record["applicant_name"]
            )
            rejection_info = {
                "code": record["official_rejection_code"],
                "raw_reason": record["rejection_reason_raw"],
                "ai_explanation": ai_result
            }

    return {
        "status": "success",
        "tracking_id": record["tracking_id"],
        "applicant_name": record["applicant_name"],
        "service_id": record["service_id"],
        "current_status": record["current_status"],
        "status_label": status_info["label"],
        "status_label_ur": status_info.get("label_ur", ""),
        "status_color": status_info["color"],
        "current_step": status_info["step"],
        "pipeline": PIPELINE,
        "is_rejected": is_rejected,
        "rejection_info": rejection_info,
        "updated_at": record["updated_at"]
    }

@router.get("/demo-tracking-ids")
def get_demo_ids():
    return {
        "status": "success",
        "demo_ids": [
            {"id": "TRK-READY-101", "label": "Approved & Ready for Pickup", "color": "green"},
            {"id": "TRK-VERIFY-202", "label": "Under Verification (Processing)", "color": "yellow"},
            {"id": "TRK-REJECT-303", "label": "Rejected – Biometric Mismatch", "color": "red"},
            {"id": "TRK-SUBMIT-404", "label": "Newly Submitted", "color": "blue"},
        ]
    }
