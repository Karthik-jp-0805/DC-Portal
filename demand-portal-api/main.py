from fastapi import FastAPI, Header, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

app = FastAPI(
    title="Demand Management Portal API",
    version="2.0.0",
    description="Backend API for Demand Management Portal Prototype"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Database for Prototype
SUBMISSIONS_DB: List[Dict[str, Any]] = []

class SSOLoginRequest(BaseModel):
    email: str
    user_type: str  # "employee" or "admin"
    stakeholder_role: Optional[str] = "Portal Admin"  # "Portal Admin", "Delivery Partner", "Client Partner"

class StatusUpdateRequest(BaseModel):
    status: str
    reason: str
    updated_by: str

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "database_records": len(SUBMISSIONS_DB)}

# Mock Google SSO Authentication
# Replace the existing sso_login block with this:
@app.post("/api/v1/auth/google-sso")
async def google_sso_login(payload: SSOLoginRequest):
    # Updated to accept tigeranalytics.com for the prototype
    if not payload.email.endswith("@tigeranalytics.com") and not payload.email.endswith("@pepsico.com"):
        raise HTTPException(status_code=400, detail="Must sign in with authorized company email")
    
    user_name = payload.email.split("@")[0].replace(".", " ").title()
    
    if payload.user_type == "admin":
        role = payload.stakeholder_role or "Portal Admin"
    else:
        role = "Demand Creation" # Updated role name
        
    return {
        "status": "authenticated",
        "token": f"mock_jwt_{uuid.uuid4().hex[:8]}",
        "user": {
            "email": payload.email,
            "name": user_name,
            "role": role,
            "user_type": payload.user_type
        }
    }

# Submit Demand Request
@app.post("/api/v1/demands")
async def create_demand_submission(payload: Dict[str, Any]):
    req_number = f"REQ-2026-{len(SUBMISSIONS_DB) + 1001}"
    
    submission_entry = {
        "requirement_id": req_number,
        "submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "overall_status": "Submitted",
        "demand_status": "In Progress" if payload.get("serviceRequired") in ["Demand Creation", "Both"] else "N/A",
        "project_code_status": "In Progress" if payload.get("serviceRequired") in ["Dossier Project Creation", "Both"] else "N/A",
        "data": payload,
        "history": [
            {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Submitted",
                "actor": payload.get("clientRequestorName", "Requestor"),
                "reason": "Initial submission generated via portal."
            }
        ]
    }
    
    SUBMISSIONS_DB.insert(0, submission_entry)
    return {
        "status": "success",
        "requirement_id": req_number,
        "message": f"Demand request logged under Primary Key {req_number}"
    }

# Get Submissions (Filtered by RBAC)
@app.get("/api/v1/demands")
async def list_demands(
    x_user_type: Optional[str] = Header(default="employee"),
    x_user_email: Optional[str] = Header(default="")
):
    if x_user_type == "admin":
        return {"status": "success", "count": len(SUBMISSIONS_DB), "data": SUBMISSIONS_DB}
    else:
        # Filter only requests submitted by this employee email
        user_requests = [
            req for req in SUBMISSIONS_DB 
            if req["data"].get("requestorEmail") == x_user_email or x_user_email == ""
        ]
        return {"status": "success", "count": len(user_requests), "data": user_requests}

# Update Request Status (Admin / Delivery Partner / Client Partner)
@app.patch("/api/v1/demands/{req_id}/status")
async def update_demand_status(req_id: str, payload: StatusUpdateRequest):
    for req in SUBMISSIONS_DB:
        if req["requirement_id"] == req_id:
            req["overall_status"] = payload.status
            req["history"].insert(0, {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": payload.status,
                "actor": payload.updated_by,
                "reason": payload.reason
            })
            return {"status": "success", "message": f"Status updated to {payload.status} for {req_id}"}
    raise HTTPException(status_code=404, detail="Requirement ID not found")