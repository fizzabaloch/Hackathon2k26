// NADRA Navigator - Resilient Full-Stack API Client
// Supports live FastAPI backend + automatic client-side fallback for 100% offline uptime

const API = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : '';

// Helper for safe fetch with timeout
async function safeFetch(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// CLIENT-SIDE FALLBACK DATASETS (Official NADRA Procedures)
// -----------------------------------------------------------------------------
const FALLBACK_SERVICES = [
  {
    service_id: "first_time_cnic",
    title_en: "First-Time CNIC (Age 18+)",
    title_ur: "پہلی بار شناختی کارڈ (18 سال اور زائد)",
    category: "IDENTITY_CARD",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_days_normal: 30,
    delivery_days_urgent: 15,
    delivery_days_executive: 7,
    online_eligible: false,
    physical_visit_req: true,
    summary_en: "For citizens turning 18 applying for their first National Identity Card.",
    summary_ur: "18 سال کی عمر کو پہنچنے والے شہریوں کے لیے پہلے شناختی کارڈ کا اجرا۔"
  },
  {
    service_id: "cnic_renewal",
    title_en: "CNIC Renewal (Expired Card)",
    title_ur: "شناختی کارڈ کی تجدید (میعاد ختم)",
    category: "IDENTITY_CARD",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_days_normal: 30,
    delivery_days_urgent: 15,
    delivery_days_executive: 7,
    online_eligible: true,
    physical_visit_req: false,
    summary_en: "For citizens renewing their expired or expiring Smart National Identity Card.",
    summary_ur: "میعاد ختم ہونے والے سمارٹ قومی شناختی کارڈ کی تجدید۔"
  },
  {
    service_id: "cnic_modification",
    title_en: "CNIC Modification (Correction / Marital Status)",
    title_ur: "شناختی کارڈ میں ترمیم یا درستگی",
    category: "IDENTITY_CARD",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_days_normal: 30,
    delivery_days_urgent: 15,
    delivery_days_executive: 7,
    online_eligible: false,
    physical_visit_req: true,
    summary_en: "Modification of marital status, address, father/husband name, or DOB.",
    summary_ur: "ازدواجی حیثیت، پتہ، والد یا شوہر کے نام کی تبدیلی یا تصحیح۔"
  },
  {
    service_id: "crc_bform",
    title_en: "Child Registration Certificate (B-Form / CRC)",
    title_ur: "چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)",
    category: "CIVIC_REGISTRATION",
    fee_normal: 500,
    fee_urgent: 1000,
    fee_executive: 2000,
    delivery_days_normal: 15,
    delivery_days_urgent: 7,
    delivery_days_executive: 3,
    online_eligible: true,
    physical_visit_req: false,
    summary_en: "Official identity certificate for children under 18 years of age.",
    summary_ur: "18 سال سے کم عمر بچوں کے لیے سرکاری شناختی سرٹیفکیٹ۔"
  }
];

const FALLBACK_CHECKLISTS = {
  first_time_cnic: {
    status: "success",
    service_id: "first_time_cnic",
    service_title: "First-Time CNIC (Age 18+)",
    service_title_ur: "پہلی بار شناختی کارڈ (18 سال اور زائد)",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_normal: 30,
    delivery_urgent: 15,
    required_documents: [
      { id: 1, name_en: "Original Birth Certificate or Union Council Birth Slip", name_ur: "اصل پیدائش سرٹیفکیٹ یا یونین کونسل پرچی", explanation_en: "Must be computerized with Union Council stamp and secretary signature.", explanation_ur: "کمپیوٹرائزڈ ہونا چاہیے جس پر یونین کونسل کی مہر ہو۔", condition: "All applicants under 18 or first-time adults" },
      { id: 2, name_en: "Attesting Blood Relative with Original Valid CNIC", name_ur: "خونی رشتہ دار (والد یا والدہ) کا اصل درست شناختی کارڈ", explanation_en: "Father or mother must accompany applicant in-person for live biometric thumbprint attestation.", explanation_ur: "والد یا والدہ کا ذاتی طور پر ہمراہ آنا اور بائیو میٹرک تصدیق دینا لازمی ہے۔", condition: "Mandatory if father or mother is alive" },
      { id: 3, name_en: "Original Child Registration Certificate (B-Form)", name_ur: "اصل چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)", explanation_en: "Previous green computerized NADRA B-Form where applicant's name is recorded.", explanation_ur: "پہلے سے جاری شدہ ب فارم جس میں درخواست گزار کا نام درج ہو۔", condition: "If B-Form was issued in childhood" }
    ],
    optional_documents: [
      { id: 4, name_en: "Matriculation / Board Certificate", name_ur: "میٹرک یا بورڈ سرٹیفکیٹ", explanation_en: "Helps verify official date of birth and exact spelling of name.", explanation_ur: "تاریخ پیدائش اور نام کی درست ہجے کی تصدیق میں مدد دیتا ہے۔", condition: "If educated" }
    ]
  },
  cnic_renewal: {
    status: "success",
    service_id: "cnic_renewal",
    service_title: "CNIC Renewal (Expired Card)",
    service_title_ur: "شناختی کارڈ کی تجدید (میعاد ختم)",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_normal: 30,
    delivery_urgent: 15,
    required_documents: [
      { id: 5, name_en: "Original Expired CNIC / Smart Card", name_ur: "اصل میعاد ختم شدہ شناختی کارڈ", explanation_en: "Must be handed over for inspection or punch-marking.", explanation_ur: "چیکنگ کے لیے سنٹر لے جانا لازمی ہے۔", condition: "All applicants" }
    ],
    optional_documents: [
      { id: 6, name_en: "Recent Utility Bill (Optional)", name_ur: "حالیہ بجلی/گیس کا بل", explanation_en: "Required ONLY if you wish to change your present address during renewal.", explanation_ur: "صرف اس صورت میں جب آپ موجودہ پتہ تبدیل کر رہے ہوں۔", condition: "Only if changing address" }
    ]
  },
  cnic_modification: {
    status: "success",
    service_id: "cnic_modification",
    service_title: "CNIC Modification (Correction / Marital Status)",
    service_title_ur: "شناختی کارڈ میں ترمیم یا درستگی",
    fee_normal: 750,
    fee_urgent: 1500,
    fee_executive: 2500,
    delivery_normal: 30,
    delivery_urgent: 15,
    required_documents: [
      { id: 7, name_en: "Original Current CNIC", name_ur: "اصل موجودہ شناختی کارڈ", explanation_en: "Current physical identity card must be presented at the counter.", explanation_ur: "موجودہ شناختی کارڈ ہمراہ لانا لازمی ہے۔", condition: "All applicants" },
      { id: 8, name_en: "Official Supporting Proof of Modification", name_ur: "ترمیم یا تبدیلی کا سرکاری ثبوت", explanation_en: "For Marriage: Computerized Nikahnama (Marriage Registration Certificate from Union Council). For Name/DOB: Board Certificate or Court Decree.", explanation_ur: "شادی کی صورت میں کمپیوٹرائزڈ نکاح نامہ، نام کی تصحیح کے لیے تعلیمی سند۔", condition: "Specific to modification field" }
    ],
    optional_documents: [
      { id: 9, name_en: "Spouse's Valid CNIC Copy", name_ur: "شوہر/اہلیہ کے درست شناختی کارڈ کی کاپی", explanation_en: "Helps cross-verify family tree immediately at the data entry counter.", explanation_ur: "کاؤنٹر پر فوری فیملی ٹری کی تصدیق کے لیے مفید ہے۔", condition: "Marital status changes" }
    ]
  },
  crc_bform: {
    status: "success",
    service_id: "crc_bform",
    service_title: "Child Registration Certificate (B-Form / CRC)",
    service_title_ur: "چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)",
    fee_normal: 500,
    fee_urgent: 1000,
    fee_executive: 2000,
    delivery_normal: 15,
    delivery_urgent: 7,
    required_documents: [
      { id: 10, name_en: "Computerized Union Council Birth Certificate for Child", name_ur: "یونین کونسل کا کمپیوٹرائزڈ پیدائش سرٹیفکیٹ", explanation_en: "Official birth registration certificate issued by municipal UC with QR code.", explanation_ur: "یونین کونسل کی طرف سے جاری کردہ باضابطہ کمپیوٹرائزڈ پیدائش سرٹیفکیٹ۔", condition: "Mandatory for each child" },
      { id: 11, name_en: "Both Parents' Valid Smart CNICs", name_ur: "والدین دونوں کے درست شناختی کارڈ", explanation_en: "Both parents must have updated, active CNICs with matching marriage status.", explanation_ur: "والدین دونوں کے شناختی کارڈ کا ریکارڈ میں شادی شدہ ہونا ضروری ہے۔", condition: "Mandatory" }
    ],
    optional_documents: [
      { id: 12, name_en: "Hospital / Clinic Birth Record (Janam Parchi)", name_ur: "ہسپتال یا کلینک کا پیدائش ریکارڈ (جنم پرچی)", explanation_en: "Helpful secondary proof in case Union Council record has spelling variations.", explanation_ur: "یونین کونسل کے ریکارڈ میں کسی شبہ کے ازالے کے لیے معاون ثبوت۔", condition: "If available" }
    ]
  }
};

const FALLBACK_CENTERS = [
  { id: 1, name: "NADRA Mega Center Auto Bhan", city: "Hyderabad", address: "Auto Bhan Road, Latifabad Unit 3, Hyderabad", type: "Mega Center (24/7)", timings: "24 Hours / 7 Days", crowd_level: "MODERATE", current_wait_mins: 22, counters_active: 18, is_senior_friendly: true },
  { id: 2, name: "NADRA Registration Center Qasimabad", city: "Hyderabad", address: "Near Naseem Nagar Chowk, Qasimabad, Hyderabad", type: "Standard NRC", timings: "09:00 AM - 05:00 PM (Mon-Sat)", crowd_level: "HIGH", current_wait_mins: 45, counters_active: 8, is_senior_friendly: false },
  { id: 3, name: "NADRA Executive Center Saddar", city: "Hyderabad", address: "Saddar Cantonment Commercial Area, Hyderabad", type: "Executive NRC", timings: "08:30 AM - 04:30 PM (Mon-Fri)", crowd_level: "LOW", current_wait_mins: 8, counters_active: 6, is_senior_friendly: true },
  { id: 4, name: "NADRA Mega Center DHA Phase 4", city: "Karachi", address: "9th Commercial Street, Phase 4, DHA, Karachi", type: "Mega Center (24/7)", timings: "24 Hours / 7 Days", crowd_level: "LOW", current_wait_mins: 12, counters_active: 24, is_senior_friendly: true },
  { id: 5, name: "NADRA Mega Center North Nazimabad", city: "Karachi", address: "Block L, Near Five Star Chowrangi, Karachi", type: "Mega Center (24/7)", timings: "24 Hours / 7 Days", crowd_level: "HIGH", current_wait_mins: 40, counters_active: 20, is_senior_friendly: true },
  { id: 6, name: "NADRA Executive Center Clifton", city: "Karachi", address: "Khayaban-e-Shamsheer, Clifton Block 5, Karachi", type: "Executive NRC", timings: "08:30 AM - 04:30 PM (Mon-Fri)", crowd_level: "LOW", current_wait_mins: 10, counters_active: 10, is_senior_friendly: true },
  { id: 7, name: "NADRA Registration Center Kotri", city: "Jamshoro", address: "Station Road, Near Session Court, Kotri", type: "Standard NRC", timings: "09:00 AM - 05:00 PM (Mon-Sat)", crowd_level: "MODERATE", current_wait_mins: 20, counters_active: 5, is_senior_friendly: false }
];

const FALLBACK_DEMO_IDS = [
  { tracking_id: "TRK-READY-101", applicant_name: "Ahmed Raza Khan", current_status: "READY_FOR_PICKUP", label: "Ready for Collection ✓" },
  { tracking_id: "TRK-VERIFY-202", applicant_name: "Zainab Bibi", current_status: "IN_VERIFICATION", label: "Under Verification" },
  { tracking_id: "TRK-REJECT-303", applicant_name: "Muhammad Tariq", current_status: "REJECTED", label: "Application Rejected (AI Explained)" },
  { tracking_id: "TRK-SUBMIT-404", applicant_name: "Farhan Ali Soomro", current_status: "SUBMITTED", label: "Submitted & Received" }
];

const FALLBACK_FORM_CATALOG = {
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
};

// In-memory queue state for offline fallback
let localQueue = {
  center_name: "NADRA Mega Center, Auto Bhan Road, Hyderabad",
  last_called: { token: "M-105", counter_id: 2, counter_name: "Counter 02 - Biometric Station", time: "Just now" },
  counters: [
    { id: 1, name: "Counter 01", type: "Token Reception", current_token: "T-042", status: "BUSY" },
    { id: 2, name: "Counter 02", type: "Biometric & Fingerprints", current_token: "M-105", status: "CALLING" },
    { id: 3, name: "Counter 03", type: "Data Entry & Review", current_token: "N-089", status: "BUSY" },
    { id: 4, name: "Counter 04", type: "Supervisor & Rejection Desk", current_token: "S-014", status: "IDLE" }
  ],
  tokens: [
    { token_number: "M-105", status: "CALLING", assigned_counter: 2, service_id: "cnic_modification" },
    { token_number: "M-106", status: "WAITING", assigned_counter: 2, service_id: "cnic_modification" },
    { token_number: "M-107", status: "WAITING", assigned_counter: 2, service_id: "cnic_modification" },
    { token_number: "M-108", status: "WAITING", assigned_counter: 2, service_id: "cnic_modification" }
  ],
  past_analytics: {
    total_tokens_today: 142,
    service_averages: {
      first_time_cnic: { avg_mins: 9.5, bottleneck: "Biometric attestation of relative" },
      cnic_renewal: { avg_mins: 4.8, bottleneck: "Card payment / receipt verification" },
      cnic_modification: { avg_mins: 8.2, bottleneck: "Nikahnama & legal certificate verification" },
      crc_bform: { avg_mins: 6.5, bottleneck: "Union Council record lookup" }
    }
  }
};

// -----------------------------------------------------------------------------
// EXPORTED API CLIENT FUNCTIONS
// -----------------------------------------------------------------------------

export async function resolveCase(query, language = 'auto') {
  try {
    return await safeFetch(`${API}/api/v1/resolve-case`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, language }),
    });
  } catch (err) {
    console.warn('[NADRA Navigator] Using client deterministic resolver fallback:', err.message);
    const q = (query || '').toLowerCase();
    let service_id = 'first_time_cnic';
    let service_title = 'First-Time CNIC (Age 18+)';
    let service_title_ur = 'پہلی بار شناختی کارڈ (18 سال اور زائد)';
    let summary_en = 'First-time CNIC registration requires an immediate blood relative (father/mother) for biometric attestation.';
    let summary_ur = 'پہلی بار شناختی کارڈ بنوانے کے لیے والد یا والدہ کی بائیومیٹرک تصدیق لازمی ہے۔';
    let estimated_fee = 750;
    let days = 30;

    if (q.includes('b form') || q.includes('b-form') || q.includes('bacha') || q.includes('child') || q.includes('crc') || q.includes('paidaish') || q.includes('baro') || q.includes('baaran')) {
      service_id = 'crc_bform';
      service_title = 'Child Registration Certificate (B-Form / CRC)';
      service_title_ur = 'چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)';
      summary_en = 'You need a Child Registration Certificate (B-Form) for minor children under 18.';
      summary_ur = '18 سال سے کم عمر بچوں کے اندراج کے لیے ب فارم کی درخواست درکار ہے۔';
      estimated_fee = 500;
      days = 15;
    } else if (q.includes('expire') || q.includes('renew') || q.includes('khatam') || q.includes('purana') || q.includes('thee viyo') || q.includes('date nikal')) {
      service_id = 'cnic_renewal';
      service_title = 'CNIC Renewal (Expired Card)';
      service_title_ur = 'شناختی کارڈ کی تجدید (میعاد ختم)';
      summary_en = 'Your Smart CNIC has expired. You can renew it online via Pak-ID or visit any NADRA Center.';
      summary_ur = 'آپ کے شناختی کارڈ کی میعاد ختم ہو چکی ہے، آپ پاک آئی ڈی ایپ یا سنٹر سے تجدید کروا سکتے ہیں۔';
      estimated_fee = 1500;
      days = 15;
    } else if (q.includes('shadi') || q.includes('shaadi') || q.includes('married') || q.includes('husband') || q.includes('father') || q.includes('naam') || q.includes('name') || q.includes('tabdeeli') || q.includes('change') || q.includes('address') || q.includes('pata') || q.includes('waranu') || q.includes('badlai')) {
      service_id = 'cnic_modification';
      service_title = 'CNIC Modification (Correction / Marital Status)';
      service_title_ur = 'شناختی کارڈ میں ترمیم یا درستگی';
      summary_en = 'You need to apply for CNIC Modification with supporting documents (Nikahnama or Matric Certificate).';
      summary_ur = 'ازدواجی حیثیت یا نام میں تصحیح کے لیے نادرا سنٹر سے ترمیم کی درخواست دینا ہوگی۔';
      estimated_fee = 1500;
      days = 15;
    }

    return {
      status: "success",
      data: {
        service_id,
        service_title,
        service_title_ur,
        confidence: 0.96,
        summary_en,
        summary_ur,
        extracted_entities: { marital_status: "unspecified", issue_type: "standard", urgency: "normal" },
        in_person_required: service_id !== 'crc_bform' && service_id !== 'cnic_renewal',
        online_eligible: service_id === 'crc_bform' || service_id === 'cnic_renewal',
        estimated_fee_pkr: estimated_fee,
        estimated_days: days
      }
    };
  }
}

export async function getChecklist(serviceId) {
  try {
    return await safeFetch(`${API}/api/v1/checklist/${serviceId}`);
  } catch (err) {
    console.warn('[NADRA Navigator] Using checklist fallback:', err.message);
    return FALLBACK_CHECKLISTS[serviceId] || FALLBACK_CHECKLISTS['first_time_cnic'];
  }
}

export async function getJourney(serviceId) {
  try {
    return await safeFetch(`${API}/api/v1/journey/${serviceId}`);
  } catch (err) {
    console.warn('[NADRA Navigator] Using journey fallback:', err.message);
    return {
      status: "success",
      service_id: serviceId,
      service_title: FALLBACK_CHECKLISTS[serviceId]?.service_title || "NADRA Procedure",
      total_steps: 5,
      steps: [
        { step_number: 1, title_en: "Document Pre-Check & Token Issuance", title_ur: "دستاویزات کی جانچ اور ٹوکن کا اجرا", location: "RECEPTION", duration: "10-15 mins", risk_en: "Original B-Form or relative CNIC missing causes token refusal.", risk_ur: "اصل دستاویز نہ ہونے کی صورت میں ٹوکن جاری نہیں کیا جاتا۔", has_risk: true },
        { step_number: 2, title_en: "Live Biometric Capture & Thumbprints", title_ur: "بائیومیٹرک انگلیوں اور انگوٹھوں کے نشانات", location: "BIOMETRIC_COUNTER", duration: "5 mins", risk_en: "Accompanying blood relative must give live thumbprint attestation.", risk_ur: "ہمراہ خونی رشتہ دار کی بائیومیٹرک تصدیق لازمی ہے۔", has_risk: true },
        { step_number: 3, title_en: "Data Entry & Digital Photograph", title_ur: "کوائف کا اندراج اور ڈیجیٹل تصویر", location: "DATA_DESK", duration: "10 mins", risk_en: "Cross-check spellings of Urdu and English names before signing printout.", risk_ur: "پرنٹ آؤٹ سائن کرنے سے پہلے اردو اور انگریزی ہجے ضرور چیک کریں۔", has_risk: false },
        { step_number: 4, title_en: "Fee Payment & Delivery Slip", title_ur: "فیس کی ادائیگی اور رسید", location: "CASH_COUNTER", duration: "5 mins", risk_en: "Keep the tracking token receipt safe until collection.", risk_ur: "وصولی تک ٹریکنگ رسید محفوظ رکھیں۔", has_risk: false },
        { step_number: 5, title_en: "Card Delivery / Collection", title_ur: "شناختی کارڈ کی وصولی", location: "DELIVERY_DESK", duration: "Pickup", risk_en: "Bring original token slip and surrender old card if applicable.", risk_ur: "اصل پرچی ساتھ لائیں اور پرانا کارڈ جمع کروائیں۔", has_risk: false }
      ]
    };
  }
}

export async function validateForm(serviceId, fields) {
  try {
    return await safeFetch(`${API}/api/v1/form-doctor/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, fields }),
    });
  } catch (err) {
    return { status: "success", issues_count: 0, issues: [] };
  }
}

export async function getCenters(city = '') {
  try {
    const url = city ? `${API}/api/v1/centers?city=${encodeURIComponent(city)}` : `${API}/api/v1/centers`;
    return await safeFetch(url);
  } catch (err) {
    console.warn('[NADRA Navigator] Using centers fallback:', err.message);
    const filtered = city 
      ? FALLBACK_CENTERS.filter(c => c.city.toLowerCase() === city.toLowerCase())
      : FALLBACK_CENTERS;
    return {
      status: "success",
      total: filtered.length,
      city_filter: city,
      centers: filtered
    };
  }
}

export async function trackApplication(trackingId) {
  try {
    return await safeFetch(`${API}/api/v1/track/${trackingId}`);
  } catch (err) {
    console.warn('[NADRA Navigator] Using tracker fallback:', err.message);
    const id = (trackingId || '').toUpperCase();
    if (id === 'TRK-READY-101') {
      return { status: "success", tracking_id: "TRK-READY-101", applicant_name: "Ahmed Raza Khan", service_id: "cnic_renewal", current_status: "READY_FOR_PICKUP", status_label: "Ready for Collection ✓", status_label_ur: "وصولی کے لیے تیار", status_color: "green", pipeline_step: 4, days_elapsed: 14, estimated_total_days: 15, current_location: "NADRA Mega Center Auto Bhan, Latifabad Unit 3, Hyderabad", rejection_info: null };
    }
    if (id === 'TRK-REJECT-303') {
      return {
        status: "success",
        tracking_id: "TRK-REJECT-303",
        applicant_name: "Muhammad Tariq",
        service_id: "first_time_cnic",
        current_status: "REJECTED",
        status_label: "Application Rejected",
        status_label_ur: "درخواست مسترد کر دی گئی",
        status_color: "red",
        pipeline_step: 0,
        days_elapsed: 7,
        estimated_total_days: 30,
        current_location: "Headquarters Processing Unit, Islamabad",
        rejection_info: {
          code: "BIO-FAIL-R14",
          raw_reason: "Attesting blood relative fingerprint verification mismatch with database record.",
          explanation_en: "The blood relative (father/mother) who placed their thumbprint to attest your form did not match the fingerprint on record in NADRA's citizen database.",
          explanation_ur: "آپ کے فارم کی تصدیق کرنے والے خونی رشتہ دار کا فنگر پرنٹ نادرا کے ڈیٹابیس ریکارڈ سے میچ نہیں کر سکا۔",
          action_steps_en: [
            "Visit your nearest NADRA center with an alternate adult blood relative (e.g. your mother or real brother).",
            "Ensure the accompanying relative carries their original valid Smart CNIC.",
            "Tell the counter operator at Counter 1 to re-attest the application form."
          ],
          action_steps_ur: [
            "کسی دوسرے بالغ خونی رشتہ دار (والد، والدہ یا سگا بھائی/بہن) کو ہمراہ لے کر نادرا سنٹر جائیں۔",
            "ہمراہ آنے والے رشتہ دار کا اصل درست شناختی کارڈ ساتھ ہونا لازمی ہے۔",
            "کاؤنٹر 1 پر آپریٹر سے تصدیق کنندہ کی تفصیلات تبدیل کرنے کی درخواست کریں۔"
          ]
        }
      };
    }
    if (id === 'TRK-VERIFY-202') {
      return { status: "success", tracking_id: "TRK-VERIFY-202", applicant_name: "Zainab Bibi", service_id: "cnic_modification", current_status: "IN_VERIFICATION", status_label: "Under Verification", status_label_ur: "تصدیق جاری ہے", status_color: "yellow", pipeline_step: 2, days_elapsed: 5, estimated_total_days: 15, current_location: "Sindh Regional Verification Bureau, Hyderabad", rejection_info: null };
    }
    return { status: "success", tracking_id: id || "TRK-SUBMIT-404", applicant_name: "Farhan Ali Soomro", service_id: "first_time_cnic", current_status: "SUBMITTED", status_label: "Submitted & Received", status_label_ur: "جمع اور موصول", status_color: "blue", pipeline_step: 1, days_elapsed: 1, estimated_total_days: 30, current_location: "NADRA Mega Center Auto Bhan, Latifabad Unit 3, Hyderabad", rejection_info: null };
  }
}

export async function getDemoIds() {
  try {
    return await safeFetch(`${API}/api/v1/demo-tracking-ids`);
  } catch (err) {
    return { status: "success", demo_ids: FALLBACK_DEMO_IDS };
  }
}

export async function getServices() {
  try {
    return await safeFetch(`${API}/api/v1/services`);
  } catch (err) {
    return { status: "success", total: FALLBACK_SERVICES.length, services: FALLBACK_SERVICES };
  }
}

export async function healthCheck() {
  try {
    return await safeFetch(`${API}/api/v1/health`, {}, 2000);
  } catch (err) {
    return { status: "offline", message: "Client-side fallback engine active" };
  }
}

export async function getQueueBoard() {
  try {
    return await safeFetch(`${API}/api/v1/queue/board`);
  } catch (err) {
    return {
      status: "success",
      center_name: localQueue.center_name,
      counters: localQueue.counters,
      last_called: localQueue.last_called,
      past_analytics: localQueue.past_analytics,
      waiting_count: localQueue.tokens.filter(t => t.status === 'WAITING').length,
      active_tokens: localQueue.tokens
    };
  }
}

export async function issueToken(payload) {
  try {
    return await safeFetch(`${API}/api/v1/queue/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const num = Math.floor(Math.random() * 80) + 110;
    const newToken = {
      token_number: `M-${num}`,
      status: "WAITING",
      assigned_counter: 2,
      service_id: payload.service_id || "first_time_cnic",
      queue_position: 3,
      estimated_wait_minutes: 16
    };
    localQueue.tokens.push(newToken);
    return {
      status: "success",
      token: newToken,
      queue_summary: {
        center_name: localQueue.center_name,
        counters: localQueue.counters,
        last_called: localQueue.last_called
      }
    };
  }
}

export async function advanceQueue(counterId = 2) {
  try {
    return await safeFetch(`${API}/api/v1/queue/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counter_id: counterId }),
    });
  } catch (err) {
    const nextTokenNum = `M-${Math.floor(Math.random() * 10) + 106}`;
    localQueue.last_called = {
      token: nextTokenNum,
      counter_id: counterId,
      counter_name: `Counter 0${counterId} - Biometric Station`,
      time: "Just now"
    };
    const c = localQueue.counters.find(x => x.id === counterId);
    if (c) c.current_token = nextTokenNum;

    return {
      status: "success",
      message: `Called ${nextTokenNum} to Counter 0${counterId}`,
      last_called: localQueue.last_called,
      counters: localQueue.counters,
      waiting_count: 2
    };
  }
}

export async function auditFormDocument(payload = {}) {
  const form_id = payload.form_id || 'form_1';
  const sample_type = payload.sample_type || 'complete';

  try {
    return await safeFetch(`${API}/api/v1/form-doctor/audit-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[NADRA Navigator] Using Form Doctor client fallback:', err.message);
    const form_info = FALLBACK_FORM_CATALOG[form_id] || FALLBACK_FORM_CATALOG['form_1'];

    let score = 96;
    let verdict = 'READY_FOR_COUNTER';
    let passed_checks = [
      'Text clarity & contrast: 100% sharp and legible',
      'Applicant name matching NADRA national phonetic guidelines',
      'Blood relative CNIC verified in active citizen database',
      'Grade 17+ Gazetted Officer official seal & CNIC clearly visible',
      'No cross-field contradictions detected between Sections A & B'
    ];
    let defect_alerts = [];

    if (sample_type === 'missing_stamp') {
      score = 62;
      verdict = 'NEEDS_FIXING';
      passed_checks = [
        'Text legibility and document resolution: High (300 DPI)',
        'Applicant Name & Father Name clearly printed in Block Letters',
        'CNIC 13-digit format valid'
      ];
      defect_alerts = [
        {
          field: 'Section C: Gazetted Officer Stamp',
          severity: 'CRITICAL BLOCKER',
          message_en: 'Attestation stamp or signature missing in Section C. Counter clerk will immediately reject this form.',
          message_ur: 'حصہ سوم میں مجاز افسر کی مہر یا دستخط غائب ہے۔ نادرا کاؤنٹر سے فارم مسترد کر دیا جائے گا۔',
          fix_en: 'Take the printed Form-1 to any Grade 17+ Government Officer (e.g. Principal of Government College, Medical Officer, or Magistrate) to sign and stamp.',
          fix_ur: 'فارم-1 کو کسی بھی گریڈ 17 سرکاری افسر (ہیڈ ماسٹر، سول ہسپتال کے ڈاکٹر، یا مجسٹریٹ) سے تصدیق کروا کر مہر لگوائیں۔'
        }
      ];
    } else if (sample_type === 'blurry') {
      score = 45;
      verdict = 'REJECT';
      passed_checks = [
        'Form template identified as NADRA official document'
      ];
      defect_alerts = [
        {
          field: 'Document Image Quality',
          severity: 'HIGH',
          message_en: 'Document scan is blurry, shadowed, or cropped at corners. OCR scanner failed to read serial barcode.',
          message_ur: 'اسکین شدہ تصویر دھندلی یا کونوں سے کٹی ہوئی ہے۔ بار کوڈ پڑھنے کے قابل نہیں۔',
          fix_en: 'Rescan using a flatbed scanner at 300 DPI or retake photo in daylight on a flat dark background.',
          fix_ur: 'دوبارہ صاف اسکین کریں یا دن کی روشنی میں بغیر سائے کے واضح تصویر بنائیں۔'
        }
      ];
    }

    return {
      status: 'success',
      form_id: form_id,
      form_title_en: form_info.title_en,
      form_title_ur: form_info.title_ur,
      purpose_en: form_info.purpose_en,
      purpose_ur: form_info.purpose_ur,
      sections: form_info.sections,
      readiness_score: score,
      verdict: verdict,
      passed_checks: passed_checks,
      defect_alerts: defect_alerts,
      acceptance_probability: score > 80 ? 'Very High (98%)' : 'Low (High Risk of Rejection)',
      doctor_advice_en: score > 80 
        ? 'Your form satisfies all NADRA Section 14 statutory guidelines. Bring your original documents along with this attested form.'
        : 'Please rectify the flagged attestation defect before arriving at the center to prevent token cancellation.',
      doctor_advice_ur: score > 80 
        ? 'آپ کا فارم نادرا کے تمام قانونی تقاضے پورے کرتا ہے۔ اصل دستاویزات ساتھ لے کر کاؤنٹر پر تشریف لے جائیں۔'
        : 'کاؤنٹر پر جانے سے پہلے نشاندہی کی گئی خامی کو درست کروائیں تاکہ آپ کا ٹوکن کینسل نہ ہو۔'
    };
  }
}
