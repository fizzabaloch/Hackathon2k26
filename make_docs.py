import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# -------------------------------------------------------------
# 1. GENERATE DIAGRAMS USING MATPLOTLIB
# -------------------------------------------------------------

def create_architecture_diagram(filename='arch_diagram.png'):
    fig, ax = plt.subplots(figsize=(11, 6.5), dpi=300)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 6.5)
    ax.axis('off')

    # Color Palette
    c_bg = '#F8FAFC'
    c_fe = '#E0F2FE'  # Sky
    c_be = '#DCFCE7'  # Green
    c_ai = '#F3E8FF'  # Purple
    c_db = '#FEF3C7'  # Amber
    c_border_fe = '#0284C7'
    c_border_be = '#16A34A'
    c_border_ai = '#9333EA'
    c_border_db = '#D97706'

    # Background
    fig.patch.set_facecolor('white')

    # Title
    ax.text(5.5, 6.1, 'NADRA NAVIGATOR - HIGH LEVEL SYSTEM ARCHITECTURE', 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A', fontfamily='sans-serif')

    # Layer 1: Client / Frontend
    box_fe = patches.FancyBboxPatch((0.5, 4.0), 3.0, 1.7, boxstyle="round,pad=0.15", 
                                    fc=c_fe, ec=c_border_fe, lw=2)
    ax.add_patch(box_fe)
    ax.text(2.0, 5.4, 'PRESENTATION LAYER\n(React 18 + Vite + Tailwind)', 
            fontsize=10, fontweight='bold', ha='center', va='center', color='#0369A1')
    fe_items = "• Multilingual UI (EN / UR / Roman Urdu)\n• Interactive Journey Stepper\n• Dynamic Checklist & Form Doctor\n• Center Locator & Status Tracker"
    ax.text(0.7, 4.4, fe_items, fontsize=8, va='center', color='#0F172A')

    # Layer 2: API Gateway / Backend
    box_be = patches.FancyBboxPatch((4.0, 4.0), 3.0, 1.7, boxstyle="round,pad=0.15", 
                                    fc=c_be, ec=c_border_be, lw=2)
    ax.add_patch(box_be)
    ax.text(5.5, 5.4, 'APPLICATION LAYER\n(FastAPI / Python 3.10+)', 
            fontsize=10, fontweight='bold', ha='center', va='center', color='#15803D')
    be_items = "• RESTful API Endpoints\n• Deterministic Rules Engine\n• PDF/OCR Form Inspector\n• CORS & Rate Limiting Middleware"
    ax.text(4.2, 4.4, be_items, fontsize=8, va='center', color='#0F172A')

    # Layer 3: AI Engine
    box_ai = patches.FancyBboxPatch((7.5, 4.0), 3.0, 1.7, boxstyle="round,pad=0.15", 
                                    fc=c_ai, ec=c_border_ai, lw=2)
    ax.add_patch(box_ai)
    ax.text(9.0, 5.4, 'AI COGNITIVE ENGINE\n(Google Gemini / OpenAI)', 
            fontsize=10, fontweight='bold', ha='center', va='center', color='#7E22CE')
    ai_items = "• Semantic Intent Classifier\n• Multilingual Entity Extraction\n• Cryptic Rejection Explainer\n• Structured JSON Output Parser"
    ax.text(7.7, 4.4, ai_items, fontsize=8, va='center', color='#0F172A')

    # Layer 4: Data & Knowledge Base (Bottom)
    box_db = patches.FancyBboxPatch((1.5, 0.8), 8.0, 2.3, boxstyle="round,pad=0.15", 
                                    fc=c_db, ec=c_border_db, lw=2)
    ax.add_patch(box_db)
    ax.text(5.5, 2.7, 'DATA & VERIFIED KNOWLEDGE BASE LAYER (JSON / SQLite)', 
            fontsize=10, fontweight='bold', ha='center', color='#B45309')

    # Sub-databases inside DB Layer
    sub_dbs = [
        ("Official Rules KB", "Service eligibility, fees,\ntimelines & docs", 2.0),
        ("Form Schemas", "Field definitions,\nregex, validation rules", 4.3),
        ("Centers DB", "Addresses, 24/7 Mega,\nlat/long, rush metrics", 6.7),
        ("Mock Tracking", "Sample pipeline states &\nrejection reason codes", 8.8)
    ]
    for title, desc, x_pos in sub_dbs:
        sub_box = patches.FancyBboxPatch((x_pos - 0.95, 1.0), 1.9, 1.35, 
                                         boxstyle="round,pad=0.08", fc='white', ec='#F59E0B', lw=1.2)
        ax.add_patch(sub_box)
        ax.text(x_pos, 2.05, title, fontsize=8.5, fontweight='bold', ha='center', color='#92400E')
        ax.text(x_pos, 1.5, desc, fontsize=7.5, ha='center', va='center', color='#4B5563')

    # Arrows between components
    # FE <-> BE
    ax.annotate('', xy=(4.0, 4.85), xytext=(3.5, 4.85),
                arrowprops=dict(arrowstyle="<->", lw=2, color='#0284C7'))
    ax.text(3.75, 5.0, 'JSON / REST', fontsize=7, ha='center', fontweight='bold', color='#0284C7')

    # BE <-> AI
    ax.annotate('', xy=(7.5, 4.85), xytext=(7.0, 4.85),
                arrowprops=dict(arrowstyle="<->", lw=2, color='#9333EA'))
    ax.text(7.25, 5.0, 'Structured Prompt', fontsize=7, ha='center', fontweight='bold', color='#9333EA')

    # BE <-> Data Layer
    ax.annotate('', xy=(5.5, 3.1), xytext=(5.5, 4.0),
                arrowprops=dict(arrowstyle="<->", lw=2, color='#16A34A'))
    ax.text(5.6, 3.55, 'Query / Sync Rules', fontsize=7.5, fontweight='bold', color='#15803D')

    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight', dpi=300)
    plt.close()
    print(f"Saved: {filename}")


def create_erd_diagram(filename='erd_diagram.png'):
    fig, ax = plt.subplots(figsize=(12, 7.5), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    fig.patch.set_facecolor('white')

    ax.text(6.0, 7.1, 'NADRA NAVIGATOR - ENTITY RELATIONSHIP DIAGRAM (ERD)', 
            fontsize=13, fontweight='bold', ha='center', color='#0F172A', fontfamily='sans-serif')

    def draw_entity(x, y, w, h, title, pk_list, attr_list, header_color='#0D5C3A'):
        # Outer box
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08", 
                                     fc='#FFFFFF', ec='#64748B', lw=1.5)
        ax.add_patch(rect)
        # Header banner
        header = patches.Rectangle((x, y + h - 0.55), w, 0.55, fc=header_color, ec=header_color)
        ax.add_patch(header)
        ax.text(x + w/2.0, y + h - 0.28, title, fontsize=9, fontweight='bold', 
                ha='center', va='center', color='white')
        
        # Text entries
        curr_y = y + h - 0.8
        for pk in pk_list:
            ax.text(x + 0.15, curr_y, pk, fontsize=7.5, fontweight='bold', color='#B91C1C')
            curr_y -= 0.28
        for attr in attr_list:
            ax.text(x + 0.15, curr_y, attr, fontsize=7.2, color='#1E293B')
            curr_y -= 0.26

    # 1. SERVICE (Center hub)
    draw_entity(4.4, 4.0, 3.2, 2.6, 'SERVICE (Core Catalog)', 
                ['PK  service_id : VARCHAR(50)'],
                ['• title_en : VARCHAR(100)',
                 '• title_ur : VARCHAR(100)',
                 '• category : ENUM',
                 '• fee_normal / urgent / exec : INT',
                 '• delivery_days_normal : INT',
                 '• online_eligible : BOOLEAN',
                 '• physical_visit_req : BOOLEAN'],
                header_color='#047857')

    # 2. DOCUMENT_REQUIREMENT (Left Top)
    draw_entity(0.5, 4.2, 3.2, 2.4, 'DOCUMENT_REQUIREMENT',
                ['PK  doc_id : VARCHAR(50)', 'FK  service_id : VARCHAR(50)'],
                ['• doc_name_en : VARCHAR(120)',
                 '• doc_name_ur : VARCHAR(120)',
                 '• is_mandatory : BOOLEAN',
                 '• condition_rule : TEXT',
                 '• simple_explanation : TEXT'],
                header_color='#0369A1')

    # 3. JOURNEY_STEP (Right Top)
    draw_entity(8.3, 4.2, 3.2, 2.4, 'JOURNEY_STEP (Workflow)',
                ['PK  step_id : VARCHAR(50)', 'FK  service_id : VARCHAR(50)'],
                ['• step_order : INT',
                 '• step_title : VARCHAR(100)',
                 '• location_type : ENUM',
                 '• estimated_duration : VARCHAR(50)',
                 '• bottleneck_risk : TEXT'],
                header_color='#6D28D9')

    # 4. APPLICATION_TRACKING (Left Bottom)
    draw_entity(0.5, 0.8, 3.2, 2.6, 'APPLICATION_TRACKING (Mock)',
                ['PK  tracking_id : VARCHAR(50)', 'FK  service_id : VARCHAR(50)'],
                ['• applicant_masked : VARCHAR(100)',
                 '• current_status : ENUM',
                 '• official_rejection_code : VARCHAR(50)',
                 '• rejection_reason_raw : TEXT',
                 '• ai_action_advice : TEXT',
                 '• updated_at : TIMESTAMP'],
                header_color='#B45309')

    # 5. FORM_TEMPLATE (Right Bottom)
    draw_entity(8.3, 0.8, 3.2, 2.6, 'FORM_TEMPLATE (Validation)',
                ['PK  template_id : VARCHAR(50)', 'FK  service_id : VARCHAR(50)'],
                ['• form_title : VARCHAR(100)',
                 '• fields_schema : JSON',
                 '• required_signatures : VARCHAR(100)',
                 '• attestation_level : VARCHAR(100)',
                 '• sample_file_path : VARCHAR(255)'],
                header_color='#4338CA')

    # 6. CENTER (Bottom Center)
    draw_entity(4.4, 0.8, 3.2, 2.6, 'CENTER (Queue / Locator)',
                ['PK  center_id : VARCHAR(50)'],
                ['• center_name : VARCHAR(120)',
                 '• city : VARCHAR(50)',
                 '• category : ENUM(MEGA, EXEC, STD)',
                 '• operating_hours : VARCHAR(100)',
                 '• crowd_level : ENUM(LOW, MED, HIGH)',
                 '• best_time_window : VARCHAR(100)'],
                header_color='#0F766E')

    # Connecting Relationship Lines
    # Service to Document (1:N)
    ax.annotate('', xy=(3.7, 5.3), xytext=(4.4, 5.3),
                arrowprops=dict(arrowstyle="<-", lw=1.8, color='#0369A1'))
    ax.text(4.05, 5.4, '1 : N', fontsize=8, fontweight='bold', color='#0369A1')

    # Service to Journey_Step (1:N)
    ax.annotate('', xy=(8.3, 5.3), xytext=(7.6, 5.3),
                arrowprops=dict(arrowstyle="->", lw=1.8, color='#6D28D9'))
    ax.text(7.95, 5.4, '1 : N', fontsize=8, fontweight='bold', color='#6D28D9')

    # Service to Tracking (1:N)
    ax.annotate('', xy=(3.7, 2.1), xytext=(4.8, 4.0),
                arrowprops=dict(arrowstyle="<-", lw=1.8, color='#B45309'))
    ax.text(4.0, 3.0, '1 : N', fontsize=8, fontweight='bold', color='#B45309')

    # Service to Form_Template (1:1 / 1:N)
    ax.annotate('', xy=(8.3, 2.1), xytext=(7.2, 4.0),
                arrowprops=dict(arrowstyle="<-", lw=1.8, color='#4338CA'))
    ax.text(7.8, 3.0, '1 : N', fontsize=8, fontweight='bold', color='#4338CA')

    # Center to Service (M:N concept, standalone reference)
    ax.annotate('', xy=(6.0, 3.4), xytext=(6.0, 4.0),
                arrowprops=dict(arrowstyle="<->", lw=1.5, color='#0F766E', linestyle='dashed'))
    ax.text(6.1, 3.65, 'M : N Services', fontsize=7.5, color='#0F766E', fontweight='bold')

    plt.tight_layout()
    plt.savefig(filename, bbox_inches='tight', dpi=300)
    plt.close()
    print(f"Saved: {filename}")


create_architecture_diagram()
create_erd_diagram()

# -------------------------------------------------------------
# 2. GENERATE COMPREHENSIVE DOCX DOCUMENT
# -------------------------------------------------------------

doc = Document()

# Set page margins
sections = doc.sections
for s in sections:
    s.top_margin = Inches(1.0)
    s.bottom_margin = Inches(1.0)
    s.left_margin = Inches(1.0)
    s.right_margin = Inches(1.0)

# Colors
C_PRIMARY = RGBColor(13, 92, 58)    # Pakistan Emerald Green
C_SECONDARY = RGBColor(30, 41, 59) # Slate Navy
C_MUTED = RGBColor(100, 116, 139)   # Muted Grey

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def add_heading_styled(doc, text, level=1):
    h = doc.add_heading(text, level=level)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = C_PRIMARY
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
    elif level == 2:
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = C_SECONDARY
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
    elif level == 3:
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = C_PRIMARY
        h.paragraph_format.space_before = Pt(6)
        h.paragraph_format.space_after = Pt(2)
    return h

def add_callout(doc, text, title="CRITICAL REQUIREMENT"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    set_cell_background(cell, "F0FDF4") # subtle green tint
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(f"[{title}] ")
    r_title.bold = True
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = C_PRIMARY
    r_text = p.add_run(text)
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = C_SECONDARY
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# --- TITLE / COVER HEADER ---
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_p.paragraph_format.space_before = Pt(12)
title_p.paragraph_format.space_after = Pt(2)

title_run = title_p.add_run("NADRA NAVIGATOR\nSYSTEM DESIGN & ARCHITECTURE SPECIFICATION")
title_run.bold = True
title_run.font.size = Pt(22)
title_run.font.color.rgb = C_PRIMARY

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub_p.paragraph_format.space_after = Pt(18)
sub_run = sub_p.add_run("AI-Powered Public Service Guidance System | DITE Hackathon 2026-27 Edition\nTheme: Public Service | Duration: 5 Hours | Team Size: 3 Members")
sub_run.font.size = Pt(10.5)
sub_run.font.color.rgb = C_MUTED

# Metadata Table
meta_table = doc.add_table(rows=4, cols=2)
meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
meta_data = [
    ("Target Platform", "Responsive Web Application (React 18 + FastAPI + Gemini AI)"),
    ("Hackathon", "DITE Hackathon 2026-27 (Denning Institute of Tech & Entrepreneurship)"),
    ("Target Domain", "Public Service (NADRA Citizen Guidance & Application Simplifier)"),
    ("Authoring & Date", "NADRA Navigator Engineering Team — October 2026")
]
for i, (k, v) in enumerate(meta_data):
    c0 = meta_table.cell(i, 0)
    c1 = meta_table.cell(i, 1)
    c0.width = Inches(2.2)
    c1.width = Inches(4.3)
    set_cell_background(c0, "F8FAFC")
    p0 = c0.paragraphs[0]
    p1 = c1.paragraphs[0]
    r0 = p0.add_run(k)
    r0.bold = True
    r0.font.size = Pt(9)
    r1 = p1.add_run(v)
    r1.font.size = Pt(9)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

# --- 1. EXECUTIVE SUMMARY ---
add_heading_styled(doc, "1. Executive Summary & Problem Statement", level=1)
p_exec = doc.add_paragraph(
    "NADRA Navigator is an intelligent web-based citizen guidance engine engineered to solve one of the "
    "most ubiquitous pain points in Pakistan's public service ecosystem: navigating National Database and "
    "Registration Authority (NADRA) services. Millions of citizens annually experience delayed applications, "
    "unnecessary multiple center visits, and rejection due to obscure requirements, confusing government "
    "terminology, and lack of personalized preparation."
)
p_exec.runs[0].font.size = Pt(10)

p_exec2 = doc.add_paragraph(
    "Unlike generic conversational chatbots prone to hallucinations, NADRA Navigator combines semantic "
    "natural-language reasoning (supporting English, Urdu, and Roman Urdu) with a deterministic, verified "
    "rules engine. The platform translates ambiguous citizen dilemmas into structured, actionable visual journeys, "
    "dynamic document checklists, proactive form validation ('Form Doctor'), center queue intelligence, and "
    "rejection translation."
)
p_exec2.runs[0].font.size = Pt(10)

add_callout(doc, 
            "The system is designed purely as an informational and preparation guide. In strict compliance "
            "with PECA (Prevention of Electronic Crimes Act) and DITE Hackathon ethics, the application NEVER stores "
            "or requests real citizen biometric data, raw CNIC numbers, or private identity records. All tracking "
            "and forms use synthetic demo datasets modeled after official rules.",
            title="DATA PRIVACY & LEGAL COMPLIANCE")

# --- 2. 3-PERSON TASK & FEATURE ALLOCATION ---
add_heading_styled(doc, "2. 3-Person Team Allocation & Feature Division", level=1)
p_div = doc.add_paragraph(
    "To maximize output within the strict 5-hour hackathon window, the system's 6 core features are strictly "
    "divided into pairs across three engineering leads. This creates clear code boundaries and independent "
    "REST interfaces, eliminating merge bottlenecks."
)
p_div.runs[0].font.size = Pt(10)

team_table = doc.add_table(rows=4, cols=4)
team_table.alignment = WD_TABLE_ALIGNMENT.CENTER
headers = ["Team Member", "Assigned Features", "Core Technical Domain", "Deliverables"]
for j, h_text in enumerate(headers):
    cell = team_table.cell(0, j)
    set_cell_background(cell, "0D5C3A")
    p = cell.paragraphs[0]
    r = p.add_run(h_text)
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(255, 255, 255)

team_rows = [
    ("Member 1:\nAI & Discovery Lead",
     "• Feature 1: AI Case Resolver\n• Feature 2: Dynamic Document Checklist",
     "NLP Intent Classification, Multilingual Prompt Engineering, Pydantic Structured Output",
     "POST /api/resolve-case\nPOST /api/checklist\nQuery Intake & Checklist UI"),
    
    ("Member 2:\nInteractive & Form Lead",
     "• Feature 3: CNIC Journey Simulator\n• Feature 4: Government Form Doctor",
     "State Machine Visualizer, Regex & Cross-field Validation Engine, Bottleneck Badging",
     "GET /api/journey/simulate\nPOST /api/form-doctor/validate\nAnimated Stepper & Review Panel"),
    
    ("Member 3:\nOperations & Tracking Lead",
     "• Feature 5: Queue & Center Assistant\n• Feature 6: Tracker & Rejection Explainer",
     "Geographic Directory, Congestion Heuristics, Mock Tracking Pipeline, Vercel/Render Deploy",
     "GET /api/centers\nGET /api/track/{id}\nPOST /api/explain-rejection\nLive Cloud Deployment")
]

for i, row in enumerate(team_rows):
    for j, val in enumerate(row):
        cell = team_table.cell(i+1, j)
        set_cell_background(cell, "F8FAFC" if i % 2 == 0 else "FFFFFF")
        p = cell.paragraphs[0]
        r = p.add_run(val)
        r.font.size = Pt(8.5)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

# --- 3. SYSTEM ARCHITECTURE ---
add_heading_styled(doc, "3. System Architecture & Component Interaction", level=1)
p_arch = doc.add_paragraph(
    "The NADRA Navigator architecture follows a modern decoupled Client-Server model with a dedicated AI Reasoning "
    "Layer and an immutable Verified Knowledge Base. The diagram below illustrates the complete component topology:"
)
p_arch.runs[0].font.size = Pt(10)

if os.path.exists("arch_diagram.png"):
    doc.add_picture("arch_diagram.png", width=Inches(6.5))
    cap_p = doc.add_paragraph("Figure 1: High-Level System Architecture of NADRA Navigator")
    cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_run = cap_p.runs[0]
    cap_run.font.size = Pt(8.5)
    cap_run.font.italic = True
    cap_run.font.color.rgb = C_MUTED

add_heading_styled(doc, "3.1 Architectural Layers Breakdown", level=2)
layers_text = [
    ("Presentation Layer (Frontend): ", "Built using React 18, Vite, and Tailwind CSS. Employs Lucide icons, responsive flex/grid layouts, and state stores for managing current citizen context. Features dual English/Urdu script toggle and offline-tolerant state caching."),
    ("API Gateway & Application Layer (FastAPI): ", "High-performance Python asynchronous server. Exposes structured OpenAPI-compliant REST endpoints. Houses deterministic validation routines, routing logic, and Pydantic data schemas."),
    ("Cognitive AI Layer (LLM Pipeline): ", "Powered by Google Gemini 1.5/2.0 Flash (with OpenAI fallback). Utilizes strict system instructions and JSON Schema enforcement (`response_mime_type='application/json'`) to eliminate hallucinations and extract structured intent from Urdu/Roman Urdu queries."),
    ("Knowledge Base & Persistence Layer: ", "Lightweight, read-optimized JSON/SQLite repository containing official NADRA service regulations, center operating hours, form template rules, and mock tracking records.")
]
for title, desc in layers_text:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    r1 = p.add_run(title)
    r1.bold = True
    r1.font.size = Pt(9.5)
    r2 = p.add_run(desc)
    r2.font.size = Pt(9.5)

# --- 4. ENTITY RELATIONSHIP DIAGRAM & DATA SCHEMA ---
add_heading_styled(doc, "4. Entity-Relationship Model (ERD) & Data Schema", level=1)
p_erd = doc.add_paragraph(
    "The data model is optimized for rapid relational querying, procedural integrity, and zero persistence of "
    "sensitive citizen data. Below is the formal Entity-Relationship Diagram:"
)
p_erd.runs[0].font.size = Pt(10)

if os.path.exists("erd_diagram.png"):
    doc.add_picture("erd_diagram.png", width=Inches(6.5))
    cap_p2 = doc.add_paragraph("Figure 2: Formal Entity-Relationship Diagram (ERD) of Knowledge Base Entities")
    cap_p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap_run2 = cap_p2.runs[0]
    cap_run2.font.size = Pt(8.5)
    cap_run2.font.italic = True
    cap_run2.font.color.rgb = C_MUTED

add_heading_styled(doc, "4.1 Data Dictionary & Table Definitions", level=2)

entities_info = [
    ("Table: SERVICE (Core Service Catalog)", [
        ("service_id (PK)", "VARCHAR(50)", "Unique slug (e.g., 'first_time_cnic', 'cnic_renewal', 'cnic_modification')"),
        ("title_en / title_ur", "VARCHAR(120)", "Official bilingual service titles in English and Nastaliq Urdu"),
        ("category", "VARCHAR(50)", "Classification: IDENTITY_CARD | CHILD_REGISTRATION | FAMILY_RECORD"),
        ("fee_normal / urgent / exec", "INTEGER", "Official government statutory fees in PKR (e.g. 750 / 1500 / 2500)"),
        ("delivery_days_normal / urgent / exec", "INTEGER", "Standard fulfillment turnaround days (e.g. 30 / 15 / 7 days)"),
        ("online_eligible", "BOOLEAN", "True if service can be completed via Pak-ID portal without visiting center"),
        ("physical_visit_req", "BOOLEAN", "True if physical biometrics/attestation requires in-person presence")
    ]),
    ("Table: DOCUMENT_REQUIREMENT (Procedural Rules)", [
        ("doc_id (PK)", "VARCHAR(50)", "Unique document rule identifier (e.g. 'doc_parent_cnic')"),
        ("service_id (FK)", "VARCHAR(50)", "Foreign key referencing target service"),
        ("doc_name_en / doc_name_ur", "VARCHAR(120)", "Bilingual official document names"),
        ("is_mandatory", "BOOLEAN", "Whether the document is strictly required by NADRA regulations"),
        ("condition_rule", "TEXT", "Expression determining requirement (e.g. 'applicant_age < 18', 'status == MARRIED')"),
        ("simple_explanation", "TEXT", "Plain-language explanation simplifying legal terms for citizens")
    ]),
    ("Table: APPLICATION_TRACKING (Mock Status & Rejection Knowledge)", [
        ("tracking_id (PK)", "VARCHAR(50)", "Application reference token (e.g. 'TRK-9901', 'TRK-9902')"),
        ("service_id (FK)", "VARCHAR(50)", "Associated NADRA service"),
        ("current_status", "VARCHAR(50)", "State: SUBMITTED | IN_VERIFICATION | READY_FOR_PICKUP | REJECTED"),
        ("official_rejection_code", "VARCHAR(50)", "Cryptic NADRA internal error code (e.g. 'BIO-FAIL-R14')"),
        ("rejection_reason_raw", "TEXT", "Formal government rejection remark"),
        ("ai_action_advice", "TEXT", "AI-translated plain Urdu/English instructions explaining resolution steps")
    ])
]

for t_title, rows in entities_info:
    add_heading_styled(doc, t_title, level=3)
    tbl = doc.add_table(rows=len(rows)+1, cols=3)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for col_idx, col_name in enumerate(["Attribute Name", "Data Type", "Functional Description"]):
        c = tbl.cell(0, col_idx)
        set_cell_background(c, "1E293B")
        p = c.paragraphs[0]
        r = p.add_run(col_name)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)
    
    for r_idx, (col1, col2, col3) in enumerate(rows):
        c0, c1, c2 = tbl.cell(r_idx+1, 0), tbl.cell(r_idx+1, 1), tbl.cell(r_idx+1, 2)
        c0.width = Inches(2.0)
        c1.width = Inches(1.2)
        c2.width = Inches(3.3)
        set_cell_background(c0, "F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
        set_cell_background(c1, "F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
        set_cell_background(c2, "F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
        c0.paragraphs[0].add_run(col1).font.size = Pt(8)
        c1.paragraphs[0].add_run(col2).font.size = Pt(8)
        c2.paragraphs[0].add_run(col3).font.size = Pt(8)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# --- 5. REST API CONTRACT ---
add_heading_styled(doc, "5. RESTful API Contract & Data Exchange Specifications", level=1)
p_api = doc.add_paragraph(
    "All backend communications are governed by strict Pydantic models. Below are the key payload specifications "
    "for the core endpoints:"
)
p_api.runs[0].font.size = Pt(10)

api_examples = [
    ("POST /api/v1/resolve-case", 
     "Classifies raw citizen queries (Urdu/Roman Urdu/English) into verified NADRA service metadata.",
     """// Request Body
{
  "query": "Meri CNIC pe father ka naam ghalat hai aur meri shaadi ho chuki hai",
  "language": "roman_urdu"
}

// Response (200 OK)
{
  "status": "success",
  "identified_service": "cnic_modification",
  "service_title": "CNIC Modification / Correction",
  "confidence": 0.98,
  "extracted_entities": {
    "correction_type": "father_name",
    "marital_status": "married",
    "requires_nikahnama": true
  },
  "recommended_action": "Apply for Modification under Marital Status & Parental Correction.",
  "in_person_required": true
}"""),

    ("POST /api/v1/form-doctor/validate",
     "Executes static heuristic and cross-field checks against user-filled application fields.",
     """// Request Body
{
  "service_id": "cnic_modification",
  "fields": {
    "applicant_cnic": "42101-1234567-1",
    "marital_status": "Married",
    "spouse_cnic": "",
    "father_cnic": "42101-7654321-3"
  }
}

// Response (200 OK)
{
  "is_valid": false,
  "critical_errors": [
    {
      "field": "spouse_cnic",
      "severity": "BLOCKER",
      "message": "Spouse CNIC is missing while Marital Status is set to Married.",
      "ai_urdu_guidance": "Aap ne shaadi shuda muntakhab kiya hai magar shohar/biwi ka CNIC darj nahi kiya."
    }
  ]
}""")
]

for endpoint, summary, code_block in api_examples:
    add_heading_styled(doc, endpoint, level=2)
    p_desc = doc.add_paragraph(summary)
    p_desc.runs[0].font.size = Pt(9.5)
    
    # Code container
    tbl_code = doc.add_table(rows=1, cols=1)
    tbl_code.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_code.columns[0].width = Inches(6.5)
    c_code = tbl_code.cell(0, 0)
    set_cell_background(c_code, "0F172A") # dark slate
    p_c = c_code.paragraphs[0]
    p_c.paragraph_format.space_before = Pt(3)
    p_c.paragraph_format.space_after = Pt(3)
    r_code = p_c.add_run(code_block)
    r_code.font.name = 'Consolas'
    r_code.font.size = Pt(8)
    r_code.font.color.rgb = RGBColor(226, 232, 240)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

# --- 6. AI COGNITIVE PIPELINE & PROMPT DESIGN ---
add_heading_styled(doc, "6. AI Cognitive Pipeline & Prompt Engineering", level=1)
p_ai_exp = doc.add_paragraph(
    "To guarantee zero hallucination during live judging, the AI layer acts strictly as a semantic classifier "
    "and natural-language translator rather than generating procedural steps out of thin air. The model is "
    "constrained to choose from verified service slugs and predefined document schemas."
)
p_ai_exp.runs[0].font.size = Pt(10)

prompt_box = doc.add_table(rows=1, cols=1)
prompt_box.alignment = WD_TABLE_ALIGNMENT.CENTER
prompt_box.columns[0].width = Inches(6.5)
c_pbox = prompt_box.cell(0, 0)
set_cell_background(c_pbox, "F5F3FF") # light purple
p_pr = c_pbox.paragraphs[0]
p_pr.paragraph_format.space_before = Pt(4)
p_pr.paragraph_format.space_after = Pt(4)
r_pr_h = p_pr.add_run("SYSTEM PROMPT ARCHITECTURE (Gemini Structured Classification):\n")
r_pr_h.bold = True
r_pr_h.font.size = Pt(9)
r_pr_h.font.color.rgb = RGBColor(126, 34, 206)

prompt_text = (
    "You are the NADRA Navigator Legal Classifier. Your role is to analyze Pakistani citizen dilemmas in "
    "English, Urdu, or Roman Urdu and map them to one of four verified NADRA services: 'first_time_cnic', "
    "'cnic_renewal', 'cnic_modification', or 'crc_bform'.\n"
    "RULES:\n"
    "1. Never invent or hallucinate statutory requirements outside the provided knowledge base.\n"
    "2. If the user mentions marriage, father name mismatch, or address change, map to 'cnic_modification'.\n"
    "3. Extract all explicit and implicit entities (age, marital status, urgency, card loss).\n"
    "4. Return strictly valid JSON conforming to the CaseResolverSchema."
)
r_pr_b = p_pr.add_run(prompt_text)
r_pr_b.font.size = Pt(8.5)
r_pr_b.font.color.rgb = C_SECONDARY
doc.add_paragraph().paragraph_format.space_after = Pt(6)

# --- 7. HACKATHON 5-HOUR SPRINT & DEMO SCRIPT ---
add_heading_styled(doc, "7. 5-Hour Execution Roadmap & Demo Video Pitch", level=1)
p_sprint = doc.add_paragraph(
    "The DITE Hackathon imposes a hard 5-hour cutoff. The following phased schedule ensures deployment and "
    "video recording are completed well before the final buzzer:"
)
p_sprint.runs[0].font.size = Pt(10)

sprint_table = doc.add_table(rows=6, cols=3)
sprint_table.alignment = WD_TABLE_ALIGNMENT.CENTER
sprint_headers = ["Phase / Time", "Milestone Activities", "Responsible Members"]
for j, sh in enumerate(sprint_headers):
    c = sprint_table.cell(0, j)
    set_cell_background(c, "0D5C3A")
    p = c.paragraphs[0]
    r = p.add_run(sh)
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(255, 255, 255)

sprint_data = [
    ("Hour 1\n(00:00 - 01:00)", "Repository initialization, verified JSON knowledge base compilation, Pydantic schemas, and Vite React boilerplate setup.", "Entire Team"),
    ("Hour 2\n(01:00 - 02:00)", "Member 1 connects Gemini Case Resolver; Member 2 implements Journey Stepper; Member 3 loads Centers directory & Tracking endpoints.", "Parallel Execution"),
    ("Hour 3\n(02:00 - 03:00)", "Frontend-backend integration: Form Doctor validation UI, Dynamic Checklist, and Rejection Explainer card.", "Parallel Execution"),
    ("Hour 4\n(03:00 - 04:00)", "Cloud Deployment: Frontend to Vercel, Backend to Render/Railway. Verification in incognito window across multiple devices.", "Member 3 (Lead Deployer)"),
    ("Hour 5\n(04:00 - 05:00)", "Screen recording of 3-5 minute demo video, upload to Google Drive (public permissions), README completion, and Google Form submission.", "Entire Team")
]

for i, row in enumerate(sprint_data):
    for j, val in enumerate(row):
        c = sprint_table.cell(i+1, j)
        set_cell_background(c, "F8FAFC" if i % 2 == 0 else "FFFFFF")
        p = c.paragraphs[0]
        r = p.add_run(val)
        r.font.size = Pt(8.5)

doc.add_paragraph().paragraph_format.space_after = Pt(10)

add_heading_styled(doc, "7.1 Recommended 4-Minute Demo Video Pitch Script", level=2)
video_script = [
    ("0:00 - 0:30 (Hook & Problem): ", "Introduce team and DITE Public Service theme. Explain the problem: over 40% of NADRA visitors face avoidable rejection or repeated visits due to unclear guidelines."),
    ("0:30 - 1:30 (Features 1 & 2 Demo): ", "Input raw Roman Urdu dilemma: 'Meri shaadi ho gayi hai aur card pe husband ka naam lagwana hai'. Show AI resolving case to 'cnic_modification' and generating a personalized checklist with missing document alerts."),
    ("1:30 - 2:30 (Features 3 & 4 Demo): ", "Display visual Journey Simulator showing token, biometrics, and delivery stages with risk warnings. Switch to Form Doctor, demonstrate automated error flagging for missing spouse CNIC."),
    ("2:30 - 3:30 (Features 5 & 6 Demo): ", "Search Hyderabad Mega Center (24/7 hours and rush-hour indicator). Enter rejected tracking token 'TRK-9902' to show AI translating cryptic 'Rule 14 Biometric Mismatch' into clear next steps in Urdu."),
    ("3:30 - 4:00 (AI Role & Safety): ", "Highlight dual-engine architecture: AI for semantic parsing, deterministic rules for official policy. Emphasize compliance: zero real citizen PII stored.")
]
for timing, script in video_script:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r1 = p.add_run(timing)
    r1.bold = True
    r1.font.size = Pt(9)
    r1.font.color.rgb = C_PRIMARY
    r2 = p.add_run(script)
    r2.font.size = Pt(9)

# Save Document
output_filename = "NADRA_Navigator_System_Design_and_Architecture.docx"
doc.save(output_filename)
print(f"SUCCESS: Document successfully saved as '{output_filename}'")
