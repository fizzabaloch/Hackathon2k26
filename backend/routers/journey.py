from fastapi import APIRouter
from database import get_db_connection

router = APIRouter(prefix="/api/v1", tags=["Journey Simulator & Form Doctor"])

@router.get("/journey/{service_id}")
def get_journey(service_id: str):
    conn = get_db_connection()
    steps = conn.execute(
        "SELECT * FROM journey_steps WHERE service_id = ? ORDER BY step_order ASC",
        (service_id,)
    ).fetchall()
    service = conn.execute(
        "SELECT title_en, title_ur FROM services WHERE service_id = ?", (service_id,)
    ).fetchone()
    conn.close()

    if not service:
        return {"status": "error", "message": "Service not found"}

    return {
        "status": "success",
        "service_id": service_id,
        "service_title": service["title_en"],
        "service_title_ur": service["title_ur"],
        "total_steps": len(steps),
        "steps": [
            {
                "step_number": s["step_order"],
                "title_en": s["step_title_en"],
                "title_ur": s["step_title_ur"],
                "location": s["location_type"],
                "duration": s["estimated_duration"],
                "risk_en": s["bottleneck_risk_en"],
                "risk_ur": s["bottleneck_risk_ur"],
                "has_risk": bool(s["bottleneck_risk_en"])
            }
            for s in steps
        ]
    }

class FormValidateBody:
    pass

from fastapi import Body
from typing import Dict, Any
import json, re

@router.post("/form-doctor/validate")
def validate_form(
    service_id: str = Body(...),
    fields: Dict[str, Any] = Body(...)
):
    conn = get_db_connection()
    template = conn.execute(
        "SELECT rules_json FROM form_templates WHERE service_id = ?", (service_id,)
    ).fetchone()
    conn.close()

    issues = []

    if template:
        rules_data = json.loads(template["rules_json"])
        # Get the rules list (could be nested)
        rules_list = []
        for key, val in rules_data.items():
            if isinstance(val, list):
                rules_list.extend(val)

        for rule in rules_list:
            field = rule.get("field")
            value = str(fields.get(field, "")).strip()

            # Regex check
            if "regex" in rule and value:
                if not re.match(rule["regex"], value):
                    issues.append({
                        "field": field,
                        "label": rule.get("label", field),
                        "severity": "ERROR",
                        "message_en": rule.get("error_en", "Invalid format"),
                        "message_ur": rule.get("error_ur", ""),
                    })

            # Min length check
            if "min_length" in rule and len(value) < rule["min_length"]:
                issues.append({
                    "field": field,
                    "label": rule.get("label", field),
                    "severity": "ERROR",
                    "message_en": rule.get("error_en", "Field too short"),
                    "message_ur": rule.get("error_ur", ""),
                })

            # Dependency check
            if "dependency" in rule:
                dep = rule["dependency"]
                trigger_value = fields.get(field, "")
                if str(trigger_value) == dep.get("if_value", ""):
                    dependent_field = dep.get("requires_field", "")
                    dependent_value = str(fields.get(dependent_field, "")).strip()
                    if not dependent_value:
                        issues.append({
                            "field": dependent_field,
                            "label": dep.get("requires_field", ""),
                            "severity": "BLOCKER",
                            "message_en": dep.get("error_en", "Required field missing"),
                            "message_ur": dep.get("error_ur", ""),
                        })

    # Always validate non-empty fields too
    for field_name, field_val in fields.items():
        if not str(field_val).strip() and field_name not in ["spouse_cnic"]:
            issues.append({
                "field": field_name,
                "label": field_name.replace("_", " ").title(),
                "severity": "WARNING",
                "message_en": f"{field_name.replace('_', ' ').title()} should not be empty.",
                "message_ur": "یہ خانہ خالی نہیں چھوڑنا چاہیے۔"
            })

    # Remove duplicates by field
    seen = set()
    unique_issues = []
    for issue in issues:
        if issue["field"] not in seen:
            seen.add(issue["field"])
            unique_issues.append(issue)

    return {
        "status": "success",
        "is_valid": len(unique_issues) == 0,
        "issue_count": len(unique_issues),
        "issues": unique_issues,
        "all_clear_message_en": "All fields look good! You are ready to visit the NADRA Center.",
        "all_clear_message_ur": "تمام خانے درست ہیں۔ آپ نادرا سنٹر جانے کے لیے تیار ہیں۔"
    }

# -----------------------------------------------------------------------------
# FEATURE 3: SMART QUEUE, TOKEN PARCHI & 7-SEGMENT LED COUNTER SIMULATOR
# -----------------------------------------------------------------------------
import datetime
import random

# Global in-memory queue state for live center simulation
QUEUE_STATE = {
    "center_name": "NADRA Mega Center, Auto Bhan Road, Hyderabad",
    "counters": [
        {"id": 1, "name": "Counter 1", "type": "Token Screening & Biometric", "current_token": "N-103", "officer": "Asad Ali", "status": "BUSY"},
        {"id": 2, "name": "Counter 2", "type": "Data Entry & Document Verification", "current_token": "M-105", "officer": "Zainab Bibi", "status": "BUSY"},
        {"id": 3, "name": "Counter 3", "type": "Fee Collection & Attestation", "current_token": "R-208", "officer": "Tariq Mehmood", "status": "CALLING"},
        {"id": 4, "name": "Counter 4", "type": "Final Review & Receipt Issuance", "current_token": "B-101", "officer": "Sana Khan", "status": "BUSY"},
    ],
    "last_called": {
        "token": "M-105",
        "counter_id": 2,
        "counter_name": "Counter 2 (Data Entry)",
        "called_at": "Just now"
    },
    "tokens": [
        {
            "token_number": "M-105",
            "applicant_name": "Hamza Abbasi",
            "phone": "0300-1234567",
            "service_id": "cnic_modification",
            "service_title": "CNIC Modification",
            "category_prefix": "M",
            "issued_at": "11:20 AM",
            "status": "BEING_SERVED",
            "counter_id": 2,
            "people_ahead": 0,
            "estimated_wait_minutes": 0
        },
        {
            "token_number": "M-106",
            "applicant_name": "Rabia Shah",
            "phone": "0333-9876543",
            "service_id": "cnic_modification",
            "service_title": "CNIC Modification",
            "category_prefix": "M",
            "issued_at": "11:28 AM",
            "status": "WAITING",
            "counter_id": 2,
            "people_ahead": 1,
            "estimated_wait_minutes": 8
        },
        {
            "token_number": "M-107",
            "applicant_name": "Fahad Mustafa",
            "phone": "0312-5551234",
            "service_id": "cnic_modification",
            "service_title": "CNIC Modification",
            "category_prefix": "M",
            "issued_at": "11:35 AM",
            "status": "WAITING",
            "counter_id": 2,
            "people_ahead": 2,
            "estimated_wait_minutes": 16
        }
    ],
    "past_analytics": {
        "cases_analyzed_today": 84,
        "avg_duration_minutes": 8.2,
        "service_averages": {
            "first_time_cnic": {"avg_mins": 11.4, "sample_size": 26, "bottleneck": "Parent biometric attestation delay"},
            "cnic_renewal": {"avg_mins": 5.1, "sample_size": 34, "bottleneck": "Quick photo capture; minimal delay"},
            "cnic_modification": {"avg_mins": 9.2, "sample_size": 18, "bottleneck": "Marriage Certificate & UC record verification"},
            "crc_bform": {"avg_mins": 7.0, "sample_size": 6, "bottleneck": "Hospital birth record verification"}
        }
    }
}

TOKEN_COUNTER = 108

from pydantic import BaseModel
from typing import Optional

class IssueTokenRequest(BaseModel):
    applicant_name: Optional[str] = "Shehri Applicant"
    phone: Optional[str] = "0300-0000000"
    service_id: Optional[str] = "cnic_modification"

class AdvanceQueueRequest(BaseModel):
    counter_id: Optional[int] = 2

@router.get("/queue/board")
def get_queue_board():
    return {
        "status": "success",
        "center_name": QUEUE_STATE["center_name"],
        "counters": QUEUE_STATE["counters"],
        "last_called": QUEUE_STATE["last_called"],
        "past_analytics": QUEUE_STATE["past_analytics"],
        "waiting_count": len([t for t in QUEUE_STATE["tokens"] if t["status"] == "WAITING"]),
        "active_tokens": QUEUE_STATE["tokens"]
    }

@router.post("/queue/issue-token")
def issue_token(req: IssueTokenRequest):
    global TOKEN_COUNTER
    TOKEN_COUNTER += 1
    
    applicant_name = req.applicant_name or "Shehri Applicant"
    phone = req.phone or "0300-0000000"
    service_id = req.service_id or "cnic_modification"
    
    prefix_map = {
        "first_time_cnic": "N",
        "cnic_renewal": "R",
        "cnic_modification": "M",
        "crc_bform": "B"
    }
    title_map = {
        "first_time_cnic": "First-Time CNIC (Age 18+)",
        "cnic_renewal": "CNIC Renewal (Expired Card)",
        "cnic_modification": "CNIC Modification (Correction / Marital)",
        "crc_bform": "Child B-Form / CRC Registration"
    }
    
    prefix = prefix_map.get(service_id, "T")
    token_no = f"{prefix}-{TOKEN_COUNTER}"
    
    # Calculate queue position & AI estimate from past users
    waiting_same_service = [t for t in QUEUE_STATE["tokens"] if t["status"] == "WAITING" and t["category_prefix"] == prefix]
    people_ahead = len(waiting_same_service) + 1
    
    analytics = QUEUE_STATE["past_analytics"]["service_averages"].get(service_id, {"avg_mins": 8.0, "bottleneck": "General queue"})
    avg_per_person = analytics["avg_mins"]
    estimated_wait = int(round(people_ahead * avg_per_person))
    
    token_data = {
        "token_number": token_no,
        "applicant_name": applicant_name,
        "phone": phone,
        "service_id": service_id,
        "service_title": title_map.get(service_id, "General NADRA Service"),
        "category_prefix": prefix,
        "issued_at": datetime.datetime.now().strftime("%I:%M %p"),
        "status": "WAITING",
        "counter_id": 2 if prefix == "M" else 1,
        "people_ahead": people_ahead,
        "estimated_wait_minutes": max(4, estimated_wait),
        "ai_explanation": f"Based on previous {analytics.get('sample_size', 20)} citizens treated today, average counter time is {avg_per_person} mins. Expected delay factor: {analytics.get('bottleneck', 'Normal processing')}."
    }
    
    QUEUE_STATE["tokens"].append(token_data)
    
    return {
        "status": "success",
        "message": f"Token {token_no} successfully generated!",
        "token": token_data,
        "board": {
            "center_name": QUEUE_STATE["center_name"],
            "counters": QUEUE_STATE["counters"],
            "last_called": QUEUE_STATE["last_called"]
        }
    }

@router.post("/queue/advance")
def advance_queue(req: Optional[AdvanceQueueRequest] = None):
    counter_id = req.counter_id if req and req.counter_id else 2
    # Find matching counter
    target_counter = next((c for c in QUEUE_STATE["counters"] if c["id"] == counter_id), QUEUE_STATE["counters"][1])
    
    # Pick next waiting token
    waiting_tokens = [t for t in QUEUE_STATE["tokens"] if t["status"] == "WAITING"]
    
    if waiting_tokens:
        next_token = waiting_tokens[0]
        next_token["status"] = "BEING_SERVED"
        next_token["people_ahead"] = 0
        next_token["estimated_wait_minutes"] = 0
        
        # Update others
        for t in waiting_tokens[1:]:
            t["people_ahead"] = max(0, t["people_ahead"] - 1)
            t["estimated_wait_minutes"] = max(2, t["estimated_wait_minutes"] - 7)
            
        target_counter["current_token"] = next_token["token_number"]
        target_counter["status"] = "CALLING"
        
        QUEUE_STATE["last_called"] = {
            "token": next_token["token_number"],
            "counter_id": target_counter["id"],
            "counter_name": target_counter["name"],
            "applicant_name": next_token["applicant_name"],
            "called_at": datetime.datetime.now().strftime("%I:%M:%S %p")
        }
        called_token_info = next_token
    else:
        # Generate random advance token
        prefix = random.choice(["N", "M", "R", "B"])
        num = random.randint(110, 199)
        rnd_token = f"{prefix}-{num}"
        target_counter["current_token"] = rnd_token
        target_counter["status"] = "CALLING"
        QUEUE_STATE["last_called"] = {
            "token": rnd_token,
            "counter_id": target_counter["id"],
            "counter_name": target_counter["name"],
            "applicant_name": "Citizen " + str(num),
            "called_at": datetime.datetime.now().strftime("%I:%M:%S %p")
        }
        called_token_info = {"token_number": rnd_token, "applicant_name": "Citizen " + str(num)}
        
    return {
        "status": "success",
        "last_called": QUEUE_STATE["last_called"],
        "counters": QUEUE_STATE["counters"],
        "called_token": called_token_info
    }

# -----------------------------------------------------------------------------
# FEATURE 4: AI FORM DOCTOR & SECTION-BY-SECTION FORM EXPLAINER
# -----------------------------------------------------------------------------
class FormAuditRequest(BaseModel):
    form_id: Optional[str] = "form_1"
    sample_type: Optional[str] = "complete" # "complete", "missing_stamp", "blurry"
    custom_notes: Optional[str] = ""

@router.post("/form-doctor/audit-document")
def audit_form_document(req: FormAuditRequest):
    form_id = req.form_id or "form_1"
    sample_type = req.sample_type or "complete"

    form_catalog = {
        "form_1": {
            "title_en": "NADRA Form-1 (National Registration Form)",
            "title_ur": "نادرا فارم-1 (قومی رجسٹریشن فارم)",
            "purpose_en": "Mandatory official application form required for all first-time adult CNIC and Smart NIC applicants.",
            "purpose_ur": "تمام بالغ شہریوں کے پہلے شناختی کارڈ کے اندراج کے لیے لازمی سرکاری درخواست فارم۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Applicant Particulars",
                    "title_ur": "حصہ اول: درخواست گزار کی ذاتی معلومات",
                    "instructions_en": "Write your full name, father's name, and date of birth in BLOCK CAPITALS. Spellings must match your Matriculation Certificate or Union Council Birth Certificate 100%.",
                    "instructions_ur": "اپنا پورا نام، والد کا نام اور تاریخ پیدائش کیپیٹل حروف میں لکھیں۔ ہجے میٹرک کی سند یا برتھ سرٹیفکیٹ سے ہو بہو ملنا ضروری ہیں۔",
                    "common_mistake": "Writing abbreviations (e.g. 'MD' instead of 'Muhammad')."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Blood Relative Attestation",
                    "title_ur": "حصہ دوم: خونی رشتہ دار کی تصدیق",
                    "instructions_en": "Must be signed by father, mother, or real adult brother/sister with their valid 13-digit CNIC number. They must accompany you to the center for live biometric attestation.",
                    "instructions_ur": "والد، والدہ یا حقیقی بالغ بھائی/بہن کے دستخط اور درست 13 ہندسوں کا شناختی کارڈ نمبر لازمی ہے۔ ان کا بائیومیٹرک کے لیے ساتھ جانا ضروری ہے۔",
                    "common_mistake": "Un-attested cousin or distant relative signing."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Gazetted Officer Attestation (Grade 17+)",
                    "title_ur": "حصہ سوم: مجاز افسر (گریڈ 17 یا زائد) کی تصدیق",
                    "instructions_en": "Must have an official ink stamp and signature from a Grade 17+ officer (Government School Headmaster, Medical Officer, Magistrate, or Assistant Commissioner). Stamp must clearly state Officer Name, CNIC, and Department.",
                    "instructions_ur": "گریڈ 17 یا زائد کے سرکاری افسر (ہیڈ ماسٹر، ڈاکٹر، مجسٹریٹ وغیرہ) کی سرکاری مہر اور دستخط۔ مہر پر افسر کا نام، شناختی کارڈ نمبر اور محکمہ واضح ہونا چاہیے۔",
                    "common_mistake": "Faint stamp without officer's CNIC number."
                }
            ]
        },
        "b_form": {
            "title_en": "RG-2 Form (Child Registration Certificate / B-Form)",
            "title_ur": "آر جی-2 فارم (چائلڈ رجسٹریشن / ب فارم)",
            "purpose_en": "Official registration document for registering children under 18 years of age.",
            "purpose_ur": "18 سال سے کم عمر تمام بچوں کی باضابطہ رجسٹریشن کا سرکاری فارم۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Child Birth Record & UC Registration",
                    "title_ur": "حصہ اول: بچے کی تفصیلات اور برتھ سرٹیفکیٹ",
                    "instructions_en": "Child's full name, gender, and date of birth must be copied exactly from Union Council Computerized Birth Certificate (CBMC).",
                    "instructions_ur": "یونین کونسل کے کمپیوٹرائزڈ برتھ سرٹیفکیٹ کے عین مطابق بچے کا نام، جنس اور تاریخ پیدائش درج کریں۔",
                    "common_mistake": "Using unofficial manual hospital birth slips."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Parents CNIC Verification & Marriage Status",
                    "title_ur": "حصہ دوم: والدین کے شناختی کارڈ کی تصدیق اور شادی کا اندراج",
                    "instructions_en": "Both Father and Mother must hold valid Smart CNICs. In NADRA's family tree database, both parents must already be registered as 'Married' to each other.",
                    "instructions_ur": "والد اور والدہ دونوں کے درست شناختی کارڈز۔ نادرا کے فیملی ریکارڈ میں دونوں کا باہم شادی شدہ ہونا لازمی ہے۔",
                    "common_mistake": "Mother's CNIC still displaying unmarried status or father's name."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Parent Presence & Biometric Attestation",
                    "title_ur": "حصہ سوم: والدین کی حاضری اور بائیومیٹرک تصدیق",
                    "instructions_en": "At least one parent (Father or Mother) must be physically present at the counter for biometric fingerprint attestation of the child's record.",
                    "instructions_ur": "بچے کے ریکارڈ کی بائیومیٹرک تصدیق کے لیے والد یا والدہ میں سے کسی ایک کا کاؤنٹر پر بنفس نفیس حاضر ہونا لازمی ہے۔",
                    "common_mistake": "Sending child with uncle, aunt, or neighbor without legal guardianship decree."
                }
            ]
        },
        "cnic_modification": {
            "title_en": "CNIC Modification & Correction Application Form",
            "title_ur": "شناختی کارڈ ترمیم اور تبدیلی کوائف فارم",
            "purpose_en": "Application for updating marital status, spouse name, home address, or typographical errors.",
            "purpose_ur": "ازدواجی حیثیت، شوہر کا نام، پتہ یا ہجے درست کروانے کے لیے نادرا فارم۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Existing Record vs Target Amendment",
                    "title_ur": "حصہ اول: موجودہ کوائف بمقابلہ مطلوبہ درستگی",
                    "instructions_en": "State your 13-digit CNIC number and specify exactly which field is being corrected (e.g. Marital Status Single ➔ Married, or adding Husband's Name).",
                    "instructions_ur": "اپنا 13 ہندسوں کا شناختی کارڈ نمبر لکھیں اور واضح کریں کہ کس خانے میں کیا تبدیلی درکار ہے (مثلاً غیر شادی شدہ سے شادی شدہ)۔",
                    "common_mistake": "Incomplete target amendment field."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Union Council MRC / Educational Proof",
                    "title_ur": "حصہ دوم: یونین کونسل نکاح سرٹیفکیٹ یا تعلیمی سند",
                    "instructions_en": "Provide official Union Council Marriage Registration Certificate (MRC) for spouse addition, or Board Matriculation Sanad for name/DOB spelling corrections.",
                    "instructions_ur": "شادی کی صورت میں یونین کونسل کا کمپیوٹرائزڈ نکاح نامہ (MRC) یا نام درستگی کے لیے بورڈ کی میٹرک سند۔",
                    "common_mistake": "Attaching manual hand-written Nikahnama without Union Council seal."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Applicant Legal Undertaking & Affidavit",
                    "title_ur": "حصہ سوم: درخواست گزار کا قانونی بیان حلفی",
                    "instructions_en": "Applicant must sign the legal declaration certifying that all supporting documents are genuine and no legal dispute exists.",
                    "instructions_ur": "درخواست گزار کا دستخط شدہ بیان حلفی کہ فراہم کردہ تمام دستاویزات اصلی ہیں اور کوئی قانونی تنازعہ موجود نہیں۔",
                    "common_mistake": "Signature mismatch with existing NADRA biometric signature."
                }
            ]
        },
        "frc": {
            "title_en": "FRC (Family Registration Certificate) Form",
            "title_ur": "فیملی رجسٹریشن سرٹیفکیٹ (FRC) فارم",
            "purpose_en": "Official government certificate establishing your biological family lineage (By Birth or By Marriage).",
            "purpose_ur": "سرکاری خاندانی شجرہ اور قانونی خونی رشتوں کی تصدیق کی باضابطہ دستاویز۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: FRC Category Tree Selection",
                    "title_ur": "حصہ اول: خاندانی کیٹیگری کا انتخاب",
                    "instructions_en": "Choose whether you require FRC 'By Birth' (Parents & Siblings) or 'By Marriage' (Self, Spouse & Children).",
                    "instructions_ur": "منتخب کریں کہ پیدائشی خاندان (والدین و بہن بھائی) کی FRC درکار ہے یا ازدواجی (بیوی و بچے)۔",
                    "common_mistake": "Mixing both categories on a single certificate."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Member 13-Digit CNIC Verification",
                    "title_ur": "حصہ دوم: تمام فیملی ممبرز کے درست شناختی کارڈز",
                    "instructions_en": "All adult family members must have valid Smart CNICs. Children under 18 must have computerized B-Forms.",
                    "instructions_ur": "تمام بالغ افراد کے درست سمارٹ شناختی کارڈز اور 18 سال سے کم عمر بچوں کے ب فارم لازمی ہیں۔",
                    "common_mistake": "Unregistered siblings causing family tree mismatch."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Head of Family Biometric Authorization",
                    "title_ur": "حصہ سوم: سربراہ خاندان کی بائیومیٹرک تصدیق",
                    "instructions_en": "The applicant or legal head of family must verify biometric thumb impression before FRC printout.",
                    "instructions_ur": "درخواست گزار یا سربراہ خاندان کا بائیومیٹرک انگوٹھے کا نشان تصدیق کے لیے درکار ہے۔",
                    "common_mistake": "Applying without biological relationship link in NADRA database."
                }
            ]
        },
        "nicop": {
            "title_en": "NICOP (National Identity Card for Overseas Pakistanis)",
            "title_ur": "نائیکوپ (سمندر پار پاکستانیوں کے لیے شناختی کارڈ)",
            "purpose_en": "For Pakistani citizens residing abroad, dual nationals, or those traveling on work visas.",
            "purpose_ur": "بیرون ملک مقیم پاکستانیوں اور دہری شہریت کے حامل شہریوں کے لیے خصوصی شناختی کارڈ۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Foreign Residency & Passport Credentials",
                    "title_ur": "حصہ اول: غیر ملکی رہائش اور پاسپورٹ کی تفصیلات",
                    "instructions_en": "Provide valid foreign passport number, visa copy, or permanent residence permit (Iqama, Green Card, PR).",
                    "instructions_ur": "درست غیر ملکی پاسپورٹ نمبر، اقامہ، یا مستقل رہائشی پرمٹ کی کاپی درج کریں۔",
                    "common_mistake": "Expired foreign visa or invalid country code."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Pakistani Heritage & Relative Linkage",
                    "title_ur": "حصہ دوم: پاکستانی شہریت یا والدین کا ثبوت",
                    "instructions_en": "Parent or grandparent valid CNIC/NICOP number to prove Pakistani nationality.",
                    "instructions_ur": "والدین یا دادا/دادی کا درست شناختی کارڈ نمبر بطور ثبوتِ شہریت۔",
                    "common_mistake": "Missing lineage records in central citizen database."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Embassy / Mission Attestation",
                    "title_ur": "حصہ سوم: سفارت خانہ یا مجاز مہر کی تصدیق",
                    "instructions_en": "Attestation by Pakistani Embassy, Consulate General, or Notary Public in host country.",
                    "instructions_ur": "متعلقہ ملک میں پاکستانی سفارت خانے، قونصل خانے یا نوٹری پبلک کی سرکاری تصدیق۔",
                    "common_mistake": "Un-attested foreign documents."
                }
            ]
        },
        "lost_cnic": {
            "title_en": "Loss / Duplicate CNIC Undertaking Form",
            "title_ur": "شناختی کارڈ گمشدگی کا بیان حلفی فارم",
            "purpose_en": "Mandatory undertaking affidavit required when applying for duplicate card due to loss or theft.",
            "purpose_ur": "شناختی کارڈ گم یا چوری ہونے کی صورت میں ڈپلیکیٹ کے اجرا کے لیے لازمی حلف نامہ۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Lost Card Particulars & Loss Circumstances",
                    "title_ur": "حصہ اول: گمشدہ کارڈ کی تفصیلات اور وقوعہ",
                    "instructions_en": "Enter your lost 13-digit CNIC, approximate date, city, and location where card was lost.",
                    "instructions_ur": "اپنا گمشدہ 13 ہندسوں کا کارڈ نمبر، اندازاً تاریخ اور شہر درج کریں۔",
                    "common_mistake": "Incorrect CNIC digit sequence."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Police Roznamcha / Report Number",
                    "title_ur": "حصہ دوم: پولیس روزنامچہ رپورٹ نمبر",
                    "instructions_en": "State the local police station name and daily diary (Roznamcha) report number if filed.",
                    "instructions_ur": "متعلقہ تھانے کا نام اور روزنامچہ رپورٹ نمبر درج کریں۔",
                    "common_mistake": "Leaving police diary field empty."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Indemnity Declaration & Non-Misuse Oath",
                    "title_ur": "حصہ سوم: قانونی بیان حلفی اور دستخط",
                    "instructions_en": "Solemn declaration that lost card was not mortgaged, pledged, or misused, and will be surrendered if found.",
                    "instructions_ur": "حلفیہ اقرار کہ کارڈ رہن نہیں رکھا گیا اور ملنے پر فوری نادرا میں جمع کروایا جائے گا۔",
                    "common_mistake": "Signature differing from original registration record."
                }
            ]
        },
        "deceased_cancel": {
            "title_en": "Deceased Citizen CNIC Cancellation Form",
            "title_ur": "وفات پانے والے شہری کے کارڈ کی منسوخی کا فارم",
            "purpose_en": "Official legal surrender and cancellation form required following the death of a citizen.",
            "purpose_ur": "کسی بھی شہری کے انتقال کے بعد ان کے کارڈ کی باضابطہ منسوخی اور ڈیتھ سرٹیفکیٹ کا اجرا۔",
            "sections": [
                {
                    "section_id": "sec_a",
                    "title_en": "Section A: Deceased Citizen Bio-Data",
                    "title_ur": "حصہ اول: مرحوم/مرحومہ کی ذاتی تفصیلات",
                    "instructions_en": "Deceased CNIC number, full name, date and cause of death.",
                    "instructions_ur": "مرحوم کا شناختی کارڈ نمبر، تاریخِ وفات اور وجہ۔",
                    "common_mistake": "Date of death mismatch with cemetery/graveyard certificate."
                },
                {
                    "section_id": "sec_b",
                    "title_en": "Section B: Union Council Computerized Death Certificate",
                    "title_ur": "حصہ دوم: یونین کونسل کا کمپیوٹرائزڈ ڈیتھ سرٹیفکیٹ",
                    "instructions_en": "Official Computerized Death Certificate issued by Union Council / Cantonment Board.",
                    "instructions_ur": "یونین کونسل یا کنٹونمنٹ بورڈ سے جاری شدہ باضابطہ کمپیوٹرائزڈ ڈیتھ سرٹیفکیٹ۔",
                    "common_mistake": "Hospital manual discharge slip without Union Council DMC."
                },
                {
                    "section_id": "sec_c",
                    "title_en": "Section C: Immediate Blood Heir Biometric Attestation",
                    "title_ur": "حصہ سوم: قریبی وارث کے دستخط اور فنگر پرنٹ",
                    "instructions_en": "Must be surrendered and signed by legal heir (Son, Daughter, Spouse, or Parent) with original CNIC.",
                    "instructions_ur": "قریبی خونی وارث (بیٹا، بیٹی، شریک حیات یا والد) کی حاضری اور بائیومیٹرک تصدیق۔",
                    "common_mistake": "Application by distant non-blood relative without succession certificate."
                }
            ]
        }
    }

    form_info = form_catalog.get(form_id, form_catalog["form_1"])

    # Simulate realistic inspection results depending on the sample uploaded
    if sample_type == "missing_stamp":
        score = 62
        verdict = "NEEDS_FIXING"
        passed_checks = [
            "Text legibility and document resolution: High (300 DPI)",
            "Applicant Name & Father Name clearly printed in Block Letters",
            "CNIC 13-digit format valid"
        ]
        defect_alerts = [
            {
                "field": "Section C: Gazetted Officer Stamp",
                "severity": "CRITICAL BLOCKER",
                "message_en": "Attestation stamp or signature missing in Section C. Counter clerk will immediately reject this form.",
                "message_ur": "حصہ سوم میں مجاز افسر کی مہر یا دستخط غائب ہے۔ نادرا کاؤنٹر سے فارم مسترد کر دیا جائے گا۔",
                "fix_en": "Take the printed Form-1 to any Grade 17+ Government Officer (e.g. Principal of Government College, Medical Officer, or Magistrate) to sign and stamp.",
                "fix_ur": "فارم-1 کو کسی بھی گریڈ 17 سرکاری افسر (ہیڈ ماسٹر، سول ہسپتال کے ڈاکٹر، یا مجسٹریٹ) سے تصدیق کروا کر مہر لگوائیں۔"
            }
        ]
    elif sample_type == "blurry":
        score = 45
        verdict = "REJECT"
        passed_checks = [
            "Form template identified as NADRA Form-1"
        ]
        defect_alerts = [
            {
                "field": "Document Image Quality",
                "severity": "HIGH",
                "message_en": "Document scan is blurry, shadowed, or cropped at corners. OCR scanner failed to read serial barcode.",
                "message_ur": "دستاویز کی تصویر دھندلی ہے یا کونے کٹے ہوئے ہیں۔ نادرا کا خودکار سکینر اسے ریڈ نہیں کر سکے گا۔",
                "fix_en": "Place form flat on a table under bright daylight and take a sharp, straight overhead photo without glare.",
                "fix_ur": "فارم کو ہموار میز پر رکھ کر اچھی روشنی میں سیدھی واضح تصویر کھینچیں۔"
            }
        ]
    else: # Complete / All Clear
        score = 96
        verdict = "READY_FOR_COUNTER"
        passed_checks = [
            "Text clarity & contrast: 100% sharp and legible",
            "Applicant name matching NADRA national phonetic guidelines",
            "Blood relative CNIC verified in active citizen database",
            "Grade 17+ Gazetted Officer official seal & CNIC clearly visible",
            "No cross-field contradictions detected between Sections A & B"
        ]
        defect_alerts = []

    return {
        "status": "success",
        "form_id": form_id,
        "form_title_en": form_info["title_en"],
        "form_title_ur": form_info["title_ur"],
        "purpose_en": form_info["purpose_en"],
        "purpose_ur": form_info["purpose_ur"],
        "sections": form_info["sections"],
        "readiness_score": score,
        "verdict": verdict,
        "passed_checks": passed_checks,
        "defect_alerts": defect_alerts,
        "acceptance_probability": "Very High (98%)" if score > 80 else "Low (High Risk of Rejection)",
        "doctor_advice_en": "Your form satisfies all NADRA Section 14 statutory guidelines. Bring your original documents along with this attested form." if score > 80 else "Please rectify the flagged attestation defect before arriving at the center to prevent token cancellation.",
        "doctor_advice_ur": "آپ کا فارم نادرا کے تمام قانونی تقاضے پورے کرتا ہے۔ اصل دستاویزات ساتھ لے کر کاؤنٹر پر تشریف لے جائیں۔" if score > 80 else "کاؤنٹر پر جانے سے پہلے نشاندہی کی گئی خامی کو درست کروائیں تاکہ آپ کا ٹوکن کینسل نہ ہو۔"
    }
