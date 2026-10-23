import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "nadra_navigator.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Services table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        service_id TEXT PRIMARY KEY,
        title_en TEXT NOT NULL,
        title_ur TEXT NOT NULL,
        category TEXT NOT NULL,
        fee_normal INTEGER NOT NULL,
        fee_urgent INTEGER NOT NULL,
        fee_executive INTEGER NOT NULL,
        delivery_days_normal INTEGER NOT NULL,
        delivery_days_urgent INTEGER NOT NULL,
        delivery_days_executive INTEGER NOT NULL,
        online_eligible BOOLEAN NOT NULL,
        physical_visit_req BOOLEAN NOT NULL,
        summary_en TEXT,
        summary_ur TEXT
    );
    """)

    # 2. Document requirements table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS document_requirements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        doc_name_en TEXT NOT NULL,
        doc_name_ur TEXT NOT NULL,
        is_mandatory BOOLEAN NOT NULL,
        condition_rule TEXT,
        simple_explanation_en TEXT,
        simple_explanation_ur TEXT,
        FOREIGN KEY(service_id) REFERENCES services(service_id)
    );
    """)

    # 3. Journey steps table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS journey_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        step_title_en TEXT NOT NULL,
        step_title_ur TEXT NOT NULL,
        location_type TEXT NOT NULL,
        estimated_duration TEXT NOT NULL,
        bottleneck_risk_en TEXT,
        bottleneck_risk_ur TEXT,
        FOREIGN KEY(service_id) REFERENCES services(service_id)
    );
    """)

    # 4. NADRA Centers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS centers (
        center_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT NOT NULL,
        operating_hours TEXT NOT NULL,
        crowd_level TEXT NOT NULL,
        best_time_window TEXT NOT NULL,
        google_maps_query TEXT
    );
    """)

    # 5. Mock Application Tracking table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS application_tracking (
        tracking_id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        current_status TEXT NOT NULL,
        stage_number INTEGER NOT NULL,
        official_rejection_code TEXT,
        rejection_reason_raw TEXT,
        ai_action_advice_en TEXT,
        ai_action_advice_ur TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(service_id) REFERENCES services(service_id)
    );
    """)

    # 6. Form templates & validation rules table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS form_templates (
        template_id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        form_title TEXT NOT NULL,
        rules_json TEXT NOT NULL,
        FOREIGN KEY(service_id) REFERENCES services(service_id)
    );
    """)

    conn.commit()
    conn.close()
