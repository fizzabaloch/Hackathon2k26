import json
from database import get_db_connection, init_db

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM services")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # 1. SERVICES
    services_data = [
        (
            "first_time_cnic",
            "First-Time CNIC (Age 18+)",
            "پہلی بار شناختی کارڈ (18 سال اور زائد)",
            "IDENTITY_CARD",
            750, 1500, 2500,
            30, 15, 7,
            False, True,
            "For citizens turning 18 applying for their first National Identity Card.",
            "18 سال کی عمر کو پہنچنے والے شہریوں کے لیے پہلے شناختی کارڈ کا اجرا۔"
        ),
        (
            "cnic_renewal",
            "CNIC Renewal (Expired Card)",
            "شناختی کارڈ کی تجدید (میعاد ختم)",
            "IDENTITY_CARD",
            750, 1500, 2500,
            30, 15, 7,
            True, False,
            "For citizens renewing their expired or expiring Smart National Identity Card.",
            "میعاد ختم ہونے والے سمارٹ قومی شناختی کارڈ کی تجدید۔"
        ),
        (
            "cnic_modification",
            "CNIC Modification (Correction / Marital Status)",
            "شناختی کارڈ میں ترمیم یا درستگی",
            "IDENTITY_CARD",
            750, 1500, 2500,
            30, 15, 7,
            False, True,
            "Modification of marital status, address, father/husband name, or DOB.",
            "ازدواجی حیثیت، پتہ، والد یا شوہر کے نام کی تبدیلی یا تصحیح۔"
        ),
        (
            "crc_bform",
            "Child Registration Certificate (B-Form / CRC)",
            "چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)",
            "CHILD_REGISTRATION",
            500, 1000, 1500,
            15, 7, 3,
            True, False,
            "Official registration certificate for children under 18 years of age.",
            "18 سال سے کم عمر بچوں کے لیے باضابطہ رجسٹریشن دستاویز۔"
        )
    ]

    cursor.executemany("""
    INSERT INTO services VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, services_data)

    # 2. DOCUMENT REQUIREMENTS
    docs_data = [
        # First-time CNIC
        ("first_time_cnic", "Original Child Registration Certificate (B-Form)", "اصل ب فارم / سی آر سی", True, None, 
         "Proof of official child registration from Union Council/NADRA.", "یونین کونسل یا نادرا سے جاری کردہ اصل ب فارم۔"),
        ("first_time_cnic", "Original CNIC of Father or Mother", "والد یا والدہ کا اصل شناختی کارڈ", True, None,
         "At least one parent must accompany for biometric attestation, or their original CNIC is required.", "والد یا والدہ میں سے کسی ایک کی بائیومیٹرک تصدیق لازمی ہے۔"),
        ("first_time_cnic", "Matriculation Certificate / Educational Marksheet", "میٹرک کی سند یا تعلیمی مارک شیٹ", False, "recommended_for_dob_and_spelling",
         "Strongly recommended to verify exact birth date and father's name spelling.", "تاریخ پیدائش اور نام کے درست ہجے کی تصدیق کے لیے ضروری ہے۔"),
        ("first_time_cnic", "Blood Relative for In-Person Attestation", "خونی رشتہ دار برائے موقع پر تصدیق", True, None,
         "Father, mother, or real adult sibling with valid CNIC must be physically present at the counter.", "والد، والدہ یا سگا بھائی/بہن جس کا کارڈ درست ہو، کا ساتھ ہونا ضروری ہے۔"),

        # CNIC Renewal
        ("cnic_renewal", "Original Expired CNIC", "اصل میعاد ختم شدہ شناختی کارڈ", True, None,
         "Must be presented at the counter or destroyed upon receiving the new card.", "کاؤنٹر پر اصل کارڈ دکھانا اور نئے کارڈ کی وصولی پر پرانا کارڈ جمع کرانا ضروری ہے۔"),
        ("cnic_renewal", "Proof of Address (Utility Bill)", "یوٹیلیٹی بل (پتہ کی تبدیلی کی صورت میں)", False, "if_address_changed",
         "Only needed if you are changing your present or permanent address.", "صرف اس صورت میں درکار ہے اگر آپ رہائشی پتہ تبدیل کر رہے ہوں۔"),

        # CNIC Modification
        ("cnic_modification", "Original CNIC", "اصل شناختی کارڈ", True, None,
         "Your current existing CNIC.", "آپ کا موجودہ کارڈ۔"),
        ("cnic_modification", "Computerized Nikahnama / Marriage Certificate", "کمپیوٹرائزڈ نکاح نامہ", True, "if_marital_status_change",
         "Required to update marital status and add spouse name (Issued by Union Council).", "شادی کی صورت میں شوہر کا نام درج کروانے کے لیے نادرا تصدیق شدہ نکاح نامہ۔"),
        ("cnic_modification", "Spouse Valid CNIC Copy", "شریک حیات کے شناختی کارڈ کی کاپی", True, "if_marital_status_change",
         "Valid CNIC copy of husband/wife.", "شوہر یا بیوی کے شناختی کارڈ کی کاپی۔"),
        ("cnic_modification", "Supporting Proof for Name Correction", "نام کی درستگی کا ثبوت (تعلیمی سند یا پاسپورٹ)", True, "if_name_change",
         "Matric certificate or passport showing correct spelling.", "درست نام کی تصدیق کے لیے تعلیمی سند یا پاسپورٹ۔"),

        # CRC B-Form
        ("crc_bform", "Birth Certificate from Union Council", "یونین کونسل کا جاری کردہ برتھ سرٹیفکیٹ", True, None,
         "Computerized birth registration slip.", "یونین کونسل سے جاری شدہ کمپیوٹرائزڈ برتھ سلپ۔"),
        ("crc_bform", "Both Parents' Valid CNIC Copies", "والدین دونوں کے درست شناختی کارڈز", True, None,
         "Both father and mother must have valid, active CNICs in the NADRA database.", "والدین دونوں کے شناختی کارڈز کا ایکٹو ہونا ضروری ہے۔")
    ]

    cursor.executemany("""
    INSERT INTO document_requirements (service_id, doc_name_en, doc_name_ur, is_mandatory, condition_rule, simple_explanation_en, simple_explanation_ur)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, docs_data)

    # 3. JOURNEY STEPS
    steps_data = [
        # First-Time CNIC Journey
        ("first_time_cnic", 1, "Preparation & Document Assembly", "دستاویزات کی تیاری اور جمع آوری", "Home / Union Council", "1 Day",
         "Ensure both parents' CNICs are active and not expired.", "یقینی بنائیں کہ والدین کے شناختی کارڈز کی میعاد ختم نہ ہوئی ہو۔"),
        ("first_time_cnic", 2, "Token & Biometric Fingerprint Capture", "ٹوکن اور بائیومیٹرک فنگر پرنٹ کا اندراج", "NADRA Center Counter 1-2", "30-60 Mins",
         "Blood relative MUST be physically present to place thumbs on scanner.", "خونی رشتہ دار (والد/والدہ/بھائی) کا فنگر پرنٹ سکینر پر انگوٹھا لگانا لازمی ہے۔"),
        ("first_time_cnic", 3, "Digital Photography & Signature", "ڈیجیٹل تصویر اور دستخط", "NADRA Center Counter 3", "15 Mins",
         "Wear dark clothes without glasses for automated ICAO face matching.", "عینک اتار کر اور گہرے رنگ کے کپڑے پہن کر تصویر بنوائیں۔"),
        ("first_time_cnic", 4, "Data Entry & Citizen Printout Verification", "ڈیٹا کا اندراج اور پرنٹ آؤٹ کی جانچ", "NADRA Center Counter 4", "20 Mins",
         "Carefully check Urdu and English spellings of names before signing.", "فارم پر دستخط کرنے سے پہلے نام کے ہجے بغور چیک کریں۔"),
        ("first_time_cnic", 5, "Card Printing & Delivery", "کارڈ کی پرنٹنگ اور ترسیل", "Courier / Center Pickup", "7 to 30 Days",
         "Bring the original token receipt and old card (if applicable) for pickup.", "کارڈ وصول کرنے کے لیے اصل ٹوکن پرچی ساتھ لائیں۔"),

        # CNIC Renewal Journey
        ("cnic_renewal", 1, "Quick Eligibility Check", "اہلیت کی جانچ", "Online / Home", "5 Mins",
         "Check if your biometrics were registered within the last 10 years.", "چیک کریں کہ کیا آپ آن لائن تجدید کے اہل ہیں۔"),
        ("cnic_renewal", 2, "Token & Biometrics Renewal", "ٹوکن اور بائیومیٹرک تجدید", "NADRA Center / Pak-ID App", "20-40 Mins",
         "No blood relative is required for simple renewals.", "سادہ تجدید کے لیے کسی رشتہ دار کے ساتھ آنے کی ضرورت نہیں ہے۔"),
        ("cnic_renewal", 3, "Printing & SMS Notification", "پرنٹنگ اور ایس ایم ایس اطلاع", "NADRA HQ Islamabad", "7 to 30 Days",
         "You will receive an SMS from 8500 once your card is dispatched.", "کارڈ روانہ ہونے پر 8500 سے ایس ایم ایس موصول ہوگا۔"),

        # CNIC Modification Journey
        ("cnic_modification", 1, "Supporting Proof Preparation", "تصدیقی ثبوت کی تیاری", "Home", "1-2 Days",
         "Without a registered Nikahnama or Gazetted Officer Attestation, modification will be halted.", "نکاح نامہ یا گزٹڈ آفیسر کی تصدیق کے بغیر ترمیم کا عمل رک جائے گا۔"),
        ("cnic_modification", 2, "NADRA In-Person Verification", "نادرا سنٹر میں تصدیق", "NADRA Center", "1 Hour",
         "Spouse or original documents must be verified at the supervisor desk.", "سپر وائزر ڈیسک پر اصل کاغذات کی جانچ کی جائے گی۔"),
        ("cnic_modification", 3, "Card Re-issuance", "نئے کارڈ کا اجرا", "Courier / Center Pickup", "7 to 15 Days",
         "Surrender previous card upon receiving modified card.", "نیا کارڈ ملنے پر پرانا کارڈ واپس جمع ہوگا۔")
    ]

    cursor.executemany("""
    INSERT INTO journey_steps (service_id, step_order, step_title_en, step_title_ur, location_type, estimated_duration, bottleneck_risk_en, bottleneck_risk_ur)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, steps_data)

    # 4. CENTERS DATA
    centers_data = [
        ("hyd-mega-01", "NADRA Mega Center Hyderabad", "Hyderabad", "Auto Bhan Road, Latifabad Unit 3, Near Jamshoro Bypass", "MEGA_24_7", "24 Hours / 7 Days", "MODERATE", "11:00 PM - 06:00 AM", "NADRA Mega Center Hyderabad Auto Bhan Road"),
        ("hyd-reg-02", "NADRA Registration Center Latifabad", "Hyderabad", "Unit No. 7, Latifabad", "STANDARD", "09:00 AM - 05:00 PM (Mon-Fri)", "HIGH", "09:30 AM - 11:00 AM", "NADRA Office Latifabad Unit 7"),
        ("hyd-qsm-03", "NADRA Executive Office Qasimabad", "Hyderabad", "Main Qasimabad Road, Near Citizen Colony", "EXECUTIVE", "09:00 AM - 09:00 PM", "LOW", "01:00 PM - 04:00 PM", "NADRA Executive Center Qasimabad Hyderabad"),
        ("khi-mega-01", "NADRA Mega Center DHA Karachi", "Karachi", "Phase 1, Main Korangi Road, DHA", "MEGA_24_7", "24 Hours / 7 Days", "HIGH", "02:00 AM - 07:00 AM", "NADRA Mega Center DHA Karachi"),
        ("khi-mega-02", "NADRA Mega Center North Nazimabad", "Karachi", "Block A, Near Sakhi Hasan, North Nazimabad", "MEGA_24_7", "24 Hours / 7 Days", "MODERATE", "12:00 AM - 06:00 AM", "NADRA Mega Center North Nazimabad"),
        ("isb-blue-01", "NADRA Mega Center Blue Area", "Islamabad", "Fazl-e-Haq Road, Blue Area", "MEGA_24_7", "24 Hours / 7 Days", "LOW", "10:00 PM - 08:00 AM", "NADRA Mega Center Blue Area Islamabad"),
        ("lhr-mega-01", "NADRA Mega Center DHA Lahore", "Lahore", "Sector CCA, Phase 5, DHA", "MEGA_24_7", "24 Hours / 7 Days", "MODERATE", "01:00 AM - 07:00 AM", "NADRA Mega Center DHA Lahore")
    ]

    cursor.executemany("""
    INSERT INTO centers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, centers_data)

    # 5. MOCK APPLICATION TRACKING
    tracking_data = [
        (
            "TRK-READY-101",
            "cnic_renewal",
            "Ahmed Raza Khan",
            "READY_FOR_PICKUP",
            5,
            None,
            None,
            "Your Smart CNIC is printed and available at your chosen NADRA Center. Please bring your original token receipt to counter 6.",
            "آپ کا سمارٹ شناختی کارڈ پرنٹ ہو چکا ہے اور متعلقہ سنٹر پر دستیاب ہے۔ ٹوکن پرچی ساتھ لا کر کاؤنٹر 6 سے وصول کریں۔",
            "2026-10-22 14:30:00"
        ),
        (
            "TRK-VERIFY-202",
            "first_time_cnic",
            "Fatima Noor",
            "IN_VERIFICATION",
            3,
            None,
            None,
            "Application is undergoing automated family tree verification against mother's record. No action required currently.",
            "درخواست فیملی ٹری کی جانچ کے مرحلے میں ہے۔ فی الحال کسی کارروائی کی ضرورت نہیں ہے۔",
            "2026-10-21 09:15:00"
        ),
        (
            "TRK-REJECT-303",
            "first_time_cnic",
            "Bilal Tariq",
            "REJECTED",
            2,
            "BIO-FAIL-R14",
            "Biometric verification of blood relative failed against national database.",
            "What Happened: The fingerprint verification of the blood relative who attested your form failed against NADRA records. What to do: Visit the center with a different immediate blood relative (father, mother, or real adult brother/sister) along with their valid original CNIC.",
            "کیا مسئلہ ہوا: آپ کے فارم کی تصدیق کرنے والے خونی رشتہ دار کے انگوٹھے کا نشان نادرا ریکارڈ سے میچ نہیں ہوا۔ حل: کسی دوسرے قریبی خونی رشتہ دار (والد، والدہ یا سگا بھائی/بہن) کو اصل شناختی کارڈ کے ہمراہ سنٹر لے جائیں۔",
            "2026-10-22 11:45:00"
        ),
        (
            "TRK-SUBMIT-404",
            "cnic_modification",
            "Zainab Bibi",
            "SUBMITTED",
            1,
            None,
            None,
            "Application token accepted. Biometric data queued for data entry operator.",
            "درخواست کا ٹوکن جاری ہو چکا ہے اور ڈیٹا انٹری کے لیے قطار میں ہے۔",
            "2026-10-23 00:30:00"
        )
    ]

    cursor.executemany("""
    INSERT INTO application_tracking VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, tracking_data)

    # 6. FORM TEMPLATES (Rules for Form Doctor)
    form_rules = {
        "cnic_modification_rules": [
            {
                "field": "applicant_cnic",
                "label": "Applicant CNIC",
                "regex": r"^\d{5}-\d{7}-\d{1}$",
                "error_en": "CNIC must follow the 13-digit format: XXXXX-XXXXXXX-X",
                "error_ur": "شناختی کارڈ نمبر کا فارمیٹ 13 ہندسوں پر مشتمل ہونا لازمی ہے (XXXXX-XXXXXXX-X)"
            },
            {
                "field": "marital_status",
                "label": "Marital Status",
                "dependency": {
                    "if_value": "Married",
                    "requires_field": "spouse_cnic",
                    "error_en": "When Marital Status is 'Married', Spouse CNIC is strictly required.",
                    "error_ur": "شادی شدہ منتخب کرنے پر شوہر/بیوی کا شناختی کارڈ نمبر درج کرنا لازمی ہے۔"
                }
            },
            {
                "field": "father_name",
                "label": "Father Name",
                "min_length": 3,
                "error_en": "Father's name cannot be empty and must have at least 3 letters.",
                "error_ur": "والد کا نام کم از کم 3 حروف پر مشتمل ہونا چاہیے۔"
            }
        ]
    }

    cursor.execute("""
    INSERT INTO form_templates VALUES (?, ?, ?, ?)
    """, ("tpl_modification", "cnic_modification", "CNIC Modification / Correction Form", json.dumps(form_rules)))

    conn.commit()
    conn.close()
    print("Database seeded successfully with official NADRA records!")

if __name__ == "__main__":
    seed_database()
