from fastapi import APIRouter, Query
from database import get_db_connection

router = APIRouter(prefix="/api/v1", tags=["Centers & Queue"])

@router.get("/centers")
def get_centers(city: str = Query(default=None)):
    conn = get_db_connection()
    if city:
        centers = conn.execute(
            "SELECT * FROM centers WHERE LOWER(city) = LOWER(?)", (city,)
        ).fetchall()
    else:
        centers = conn.execute("SELECT * FROM centers").fetchall()
    conn.close()

    crowd_badge = {
        "LOW": {"label": "Low Wait", "color": "green"},
        "MODERATE": {"label": "Moderate (30-45 min)", "color": "yellow"},
        "HIGH": {"label": "Long Wait (1-2 hrs)", "color": "red"}
    }

    results = []
    for c in centers:
        crowd_info = crowd_badge.get(c["crowd_level"], {"label": c["crowd_level"], "color": "gray"})
        
        # Hourly crowd profile for 24-hour visualization
        is_mega = c["category"] == "MEGA_24_7"
        is_exec = c["category"] == "EXECUTIVE"
        
        if is_mega:
            hourly_curve = [
                {"hour": "00:00 - 04:00", "traffic": 15, "level": "LOW", "color": "#10b981", "tip": "Best night window (Zero line)"},
                {"hour": "04:00 - 08:00", "traffic": 25, "level": "LOW", "color": "#10b981", "tip": "Fajr to morning calm"},
                {"hour": "08:00 - 12:00", "traffic": 88, "level": "HIGH", "color": "#ef4444", "tip": "Peak morning rush"},
                {"hour": "12:00 - 16:00", "traffic": 92, "level": "HIGH", "color": "#ef4444", "tip": "Maximum crowd & token waiting"},
                {"hour": "16:00 - 20:00", "traffic": 65, "level": "MODERATE", "color": "#f59e0b", "tip": "Evening wave"},
                {"hour": "20:00 - 00:00", "traffic": 35, "level": "LOW", "color": "#10b981", "tip": "Ideal family visit window"}
            ]
            facilities = ["24/7 Operations", "Wheelchair Ramp", "Air Conditioned Waiting Hall", "National Bank Counter", "Fast-Track Counter"]
        elif is_exec:
            hourly_curve = [
                {"hour": "09:00 - 12:00", "traffic": 40, "level": "MODERATE", "color": "#f59e0b", "tip": "Steady flow"},
                {"hour": "12:00 - 15:00", "traffic": 60, "level": "MODERATE", "color": "#f59e0b", "tip": "Lunch hour peak"},
                {"hour": "15:00 - 18:00", "traffic": 30, "level": "LOW", "color": "#10b981", "tip": "Fastest processing"},
                {"hour": "18:00 - 21:00", "traffic": 45, "level": "MODERATE", "color": "#f59e0b", "tip": "Evening executives"}
            ]
            facilities = ["VIP Lounge Seating", "Complimentary Refreshments", "Dedicated Processing Desks", "Card Payment Accepted"]
        else:
            hourly_curve = [
                {"hour": "09:00 - 11:00", "traffic": 85, "level": "HIGH", "color": "#ef4444", "tip": "Long morning lines"},
                {"hour": "11:00 - 14:00", "traffic": 95, "level": "HIGH", "color": "#ef4444", "tip": "Tokens reach daily ceiling"},
                {"hour": "14:00 - 17:00", "traffic": 50, "level": "MODERATE", "color": "#f59e0b", "tip": "Closing wrap-up"}
            ]
            facilities = ["Standard Biometric Stations", "General Waiting Area", "Fee Deposit Counter"]

        results.append({
            "center_id": c["center_id"],
            "name": c["name"],
            "city": c["city"],
            "address": c["address"],
            "category": c["category"],
            "category_label": {
                "MEGA_24_7": "Mega Center (24/7)",
                "EXECUTIVE": "Executive Center",
                "STANDARD": "Standard NRC"
            }.get(c["category"], c["category"]),
            "operating_hours": c["operating_hours"],
            "crowd_level": c["crowd_level"],
            "crowd_label": crowd_info["label"],
            "crowd_color": crowd_info["color"],
            "best_time": c["best_time_window"],
            "maps_query": c["google_maps_query"],
            "is_open_now": True if is_mega else True,
            "facilities": facilities,
            "hourly_curve": hourly_curve
        })

    return {
        "status": "success",
        "city_filter": city,
        "total": len(results),
        "centers": results
    }

@router.get("/cities")
def get_cities():
    conn = get_db_connection()
    cities = conn.execute("SELECT DISTINCT city FROM centers ORDER BY city").fetchall()
    conn.close()
    return {"status": "success", "cities": [c["city"] for c in cities]}
