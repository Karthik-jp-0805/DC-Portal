# Demand Management Portal - Source Code Context


---

## FILE: demand-portal-api\main.py

```
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
```


---

## FILE: demand-portal-ui\index.html

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demand Management Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```


---

## FILE: demand-portal-ui\package.json

```
{
  "name": "demand-portal-ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.6.1",
    "postcss": "^8.5.29",
    "tailwindcss": "^3.4.19",
    "vite": "^5.2.0"
  }
}

```


---

## FILE: demand-portal-ui\postcss.config.js

```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```


---

## FILE: demand-portal-ui\src\AdminDashboard.jsx

```
import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [newStatus, setNewStatus] = useState('Completed');
  const [reason, setReason] = useState('');

  const fetchDemands = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/demands', {
      headers: {
        'X-User-Type': currentUser.user_type,
        'X-User-Email': currentUser.email
      }
    })
      .then(res => res.json())
      .then(data => setRequests(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDemands(); }, [currentUser]);

  const handleUpdateStatus = async () => {
    if (!reason) return alert('Please enter a reason for updating the status.');
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/demands/${selectedReq.requirement_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason, updated_by: currentUser.name })
      });
      if (res.ok) {
        setSelectedReq(null);
        setReason('');
        fetchDemands();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // KPIs for PowerBI style dashboard
  const total = requests.length;
  const inProgress = requests.filter(r => r.overall_status === 'In Progress').length;
  const completed = requests.filter(r => r.overall_status === 'Completed').length;

  return (
    <div className="max-w-6xl mx-auto my-6 p-6 bg-white rounded-2xl shadow border border-slate-200 font-sans">
      
      {/* Dashboard Header */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Demand Request Dashboard</h2>
          <p className="text-xs text-slate-500">Live analytics for Requirement IDs and Status</p>
        </div>
      </div>

      {/* PowerBI Style KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Total Demands</h3>
          <p className="text-3xl font-black text-blue-900">{total}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">In Progress</h3>
          <p className="text-3xl font-black text-amber-900">{inProgress}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Completed</h3>
          <p className="text-3xl font-black text-emerald-900">{completed}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 py-8 text-center">Loading live data...</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-dashed">No demand requests logged yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-3">Req ID</th>
                <th className="p-3">Service Type</th>
                <th className="p-3">Project / Group</th>
                <th className="p-3">Requestor</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                {currentUser.user_type === 'admin' && <th className="p-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.requirement_id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-tiger-vivid">{r.requirement_id}</td>
                  <td className="p-3 font-semibold">{r.data.serviceRequired}</td>
                  <td className="p-3 text-slate-600">{r.data.projectName || r.data.newProjectName || 'N/A'}</td>
                  <td className="p-3">{r.data.clientRequestorName}</td>
                  <td className="p-3 text-slate-500">{r.submitted_at}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase tracking-wide ${r.overall_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.overall_status}
                    </span>
                  </td>
                  {currentUser.user_type === 'admin' && (
                    <td className="p-3">
                      <button onClick={() => setSelectedReq(r)} className="px-3 py-1.5 bg-slate-800 hover:bg-black text-white rounded text-[10px] font-bold transition">
                        Update
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Update Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Update Status: {selectedReq.requirement_id}</h3>
            <div>
              <label className="block text-xs font-bold mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-tiger-vivid">
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Audit Reason *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border rounded-lg text-xs h-20 focus:ring-2 focus:ring-tiger-vivid" placeholder="Mandatory explanation for status change..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedReq(null)} className="px-4 py-2 bg-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300">Cancel</button>
              <button onClick={handleUpdateStatus} className="px-4 py-2 bg-tiger-vivid text-white text-xs font-bold rounded-lg hover:bg-fuchsia-900 shadow">Save Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


---

## FILE: demand-portal-ui\src\App.jsx

```
import React, { useState } from 'react';
import SSOLogin from './SSOLogin';
import DemandForm from './DemandForm';
import AdminDashboard from './AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('form');
  const [lastSubmittedId, setLastSubmittedId] = useState('');

  if (!currentUser) {
    return <SSOLogin onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-blue-900 text-white shadow-md px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Demand Management Portal</h1>
          <p className="text-xs text-blue-200">Single Sign-On Verified: {currentUser.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-blue-800 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-700">
            Role: {currentUser.role}
          </span>
          <button onClick={() => setCurrentUser(null)} className="text-xs text-slate-300 hover:text-white font-medium underline">
            Sign Out
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setView('form')}
          className={`py-1 border-b-2 ${view === 'form' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500'}`}
        >
          Submit New Request
        </button>

        <button
          onClick={() => setView('dashboard')}
          className={`py-1 border-b-2 ${view === 'dashboard' ? 'border-blue-700 text-blue-900' : 'border-transparent text-slate-500'}`}
        >
          {currentUser.user_type === 'admin' ? 'Admin / Partner Dashboard' : 'My Requests Register'}
        </button>
      </div>

      <main className="flex-1 p-4">
        {lastSubmittedId && (
          <div className="max-w-4xl mx-auto mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex justify-between items-center">
            <span><strong>Success!</strong> Request logged under Primary Key: <code className="bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold">{lastSubmittedId}</code></span>
            <button onClick={() => setLastSubmittedId('')} className="font-bold text-emerald-900">âœ•</button>
          </div>
        )}

        {view === 'form' ? (
          <DemandForm
            currentUser={currentUser}
            onSubmitted={(id) => {
              setLastSubmittedId(id);
              setView('dashboard');
            }}
          />
        ) : (
          <AdminDashboard currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}
```


---

## FILE: demand-portal-ui\src\DemandForm.jsx

```
import React, { useState } from 'react';
import {
  DOMAINS, SERVICES, PROJECT_GROUPS, PROJECT_NAMES, DEMAND_TYPES,
  ROLES_LIST, STREAMS, PRIORITIES, PROBABILITIES, BILL_RATES,
  REPLACEMENT_REASONS, NEW_PROJECT_GROUPS, DELIVERY_PARTNERS, CLIENT_PARTNERS
} from './constants';

export default function DemandForm({ currentUser, onSubmitted }) {
  const [currentSection, setCurrentSection] = useState(1);
  const [historyStack, setHistoryStack] = useState([1]);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');

  const [formData, setFormData] = useState({
    requestorEmail: currentUser.email,
    domain: '', otherDomain: '', serviceRequired: '',
    projectGroup: '', projectName: '', clientRequestorName: currentUser.name, demandType: '',
    selectedRoles: [], otherRole: '', stream: '', primarySkills: '', secondarySkills: '',
    numPositions: '', jobDescriptionName: '',
    levelCounts: { A1: '', A2: '', L1: '', L2: '', M1: '', M2: '', ADPlus: '' },
    customerRequestedDate: '', customerExpectedFulfillmentDate: '', demandStartDate: '',
    demandEndDate: '', billingStartDate: '', priority: '', probability: '',
    billRate: '', otherBillRate: '', clientInterview: '', isSowActive: '', contractorAllowed: '',
    investmentBusinessCase: '', investmentFromDate: '', investmentToDate: '',
    replacementName: '', replacementEmpId: '', resourceIdentified: '',
    replacementReason: '', otherReplacementReason: '', additionalComments: '',
    newProjectCreationRequired: '',
    newProjectGroup: '', newProjectName: '', projectDescription: '', customer: '',
    currency: '', deliveryPartner: '', otherDeliveryPartner: '', clientPartner: '',
    otherClientPartner: '', techPartner: '', engineeringPartner: '', programType: '',
    billingType: '', projectTenure: '', sowApplicability: ''
  });

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  };

  const validateDates = () => {
    if (formData.customerRequestedDate && formData.demandStartDate) {
      const reqDate = new Date(formData.customerRequestedDate);
      const startDate = new Date(formData.demandStartDate);
      const diffDays = (startDate - reqDate) / (1000 * 3600 * 24);
      if (diffDays < 14) {
        setDateError('Demand Start Date must be at least 14 days after Customer Requested Date.');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  // Dynamic Google Form Routing Logic
  const handleNext = () => {
    if (currentSection === 2 && !validateDates()) return;

    let next = currentSection;

    if (currentSection === 1) {
      if (formData.serviceRequired === 'Dossier Project Creation') next = 5;
      else next = 2;
    } 
    else if (currentSection === 2) {
      if (formData.demandType.includes('Investment')) next = 3;
      else if (formData.demandType.includes('Replacement')) next = 4;
      else if (formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 3) {
      if (formData.demandType.includes('Replacement')) next = 4;
      else if (formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 4) {
      if (formData.newProjectCreationRequired === 'Yes' || formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 5) {
      return handleSubmit();
    }

    setHistoryStack(prev => [...prev, next]);
    setCurrentSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      setHistoryStack(updated);
      setCurrentSection(updated[updated.length - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      onSubmitted(result.requirement_id);
    } catch (err) {
      alert('Error submitting demand request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden font-sans">
      <div className="bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold">Demand / Project Code Creation Form</h2>
        <p className="text-blue-200 text-xs mt-1">Logged in as {currentUser.name} ({currentUser.email})</p>
      </div>

      <div className="p-8 space-y-6">
        {dateError && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold">{dateError}</div>}

        {/* SECTION 1 */}
        {currentSection === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 1 of 5: Demand/Project Code Creation Request</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Domain *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DOMAINS.map(d => (
                  <label key={d} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-slate-50 cursor-pointer text-xs">
                    <input type="radio" name="domain" value={d} checked={formData.domain === d} onChange={(e) => handleChange('domain', e.target.value)} />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
              {formData.domain === 'Other' && (
                <input type="text" placeholder="Please specify domain..." value={formData.otherDomain} onChange={(e) => handleChange('otherDomain', e.target.value)} className="mt-2 w-full p-2 border rounded-lg text-xs" />
              )}
            </div>

            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
              <p className="text-xs text-blue-900 font-medium">For raising demands in the system, kindly fill in the form.</p>
              <label className="block text-xs font-bold text-slate-800">Service Required *</label>
              <div className="space-y-2">
                {SERVICES.map(s => (
                  <label key={s} className="flex items-center gap-2 p-2 bg-white rounded-lg border cursor-pointer text-xs">
                    <input type="radio" name="serviceRequired" value={s} checked={formData.serviceRequired === s} onChange={(e) => handleChange('serviceRequired', e.target.value)} />
                    <span className="font-semibold text-slate-800">{s}</span>
                    {s === 'Dossier Project Creation' && <span className="text-slate-500 text-[10px]">(Routes to Section 5)</span>}
                    {s === 'Demand Creation' && <span className="text-slate-500 text-[10px]">(Routes to Section 2)</span>}
                    {s === 'Both' && <span className="text-slate-500 text-[10px]">(Full Pipeline)</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 */}
        {currentSection === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 2 of 5: Demand Creation Request</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Group *</label>
                <select value={formData.projectGroup} onChange={(e) => handleChange('projectGroup', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Project Group</option>
                  {PROJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name * (128 Options)</label>
                <select value={formData.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Project Name</option>
                  {PROJECT_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Requestor Name *</label>
                <input type="text" value={formData.clientRequestorName} onChange={(e) => handleChange('clientRequestorName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demand Type *</label>
                <select value={formData.demandType} onChange={(e) => handleChange('demandType', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Demand Type</option>
                  {DEMAND_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roles * (Choose multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded-lg bg-slate-50 text-xs">
                {ROLES_LIST.map(role => (
                  <label key={role} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={formData.selectedRoles.includes(role)} onChange={() => handleRoleToggle(role)} />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stream *</label>
                <select value={formData.stream} onChange={(e) => handleChange('stream', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Stream</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1"># of Positions *</label>
                <input type="number" value={formData.numPositions} onChange={(e) => handleChange('numPositions', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Count" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Skills *</label>
                <input type="text" value={formData.primarySkills} onChange={(e) => handleChange('primarySkills', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Python, Databricks..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Skills *</label>
                <input type="text" value={formData.secondarySkills} onChange={(e) => handleChange('secondarySkills', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="SQL, PowerBI..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Description Attachment *</label>
              <input type="file" onChange={(e) => handleChange('jobDescriptionName', e.target.files[0]?.name || '')} className="w-full text-xs p-2 border rounded-lg bg-slate-50" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested Date *</label>
                <input type="date" value={formData.customerRequestedDate} onChange={(e) => handleChange('customerRequestedDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demand Start Date *</label>
                <input type="date" value={formData.demandStartDate} onChange={(e) => handleChange('demandStartDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                <span className="text-[10px] text-amber-700">Must be â‰¥ 14 days after request date</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Start Date *</label>
                <input type="date" value={formData.billingStartDate} onChange={(e) => handleChange('billingStartDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 */}
        {currentSection === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 3 of 5: Investment Details</h3>
            <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">Applicable only for Investment demands.</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Investment - Business Case *</label>
              <textarea value={formData.investmentBusinessCase} onChange={(e) => handleChange('investmentBusinessCase', e.target.value)} className="w-full p-2 border rounded-lg text-xs h-20" placeholder="Business justification..." />
            </div>
          </div>
        )}

        {/* SECTION 4 */}
        {currentSection === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 4 of 5: Resource to be Replaced</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Name *</label>
                <input type="text" value={formData.replacementName} onChange={(e) => handleChange('replacementName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
                <input type="text" value={formData.replacementEmpId} onChange={(e) => handleChange('replacementEmpId', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Project Creation Required *</label>
              <div className="flex gap-4 text-xs font-semibold">
                {['Yes', 'No'].map(v => (
                  <label key={v} className="flex items-center gap-1">
                    <input type="radio" name="newProjReq" value={v} checked={formData.newProjectCreationRequired === v} onChange={(e) => handleChange('newProjectCreationRequired', e.target.value)} /> {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5 */}
        {currentSection === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 5 of 5: New Project Code Creation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Group_New *</label>
                <select value={formData.newProjectGroup} onChange={(e) => handleChange('newProjectGroup', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Group</option>
                  {NEW_PROJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name_New *</label>
                <input type="text" value={formData.newProjectName} onChange={(e) => handleChange('newProjectName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="PEPSICO_..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Partner *</label>
                <select value={formData.deliveryPartner} onChange={(e) => handleChange('deliveryPartner', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Delivery Partner</option>
                  {DELIVERY_PARTNERS.map(dp => <option key={dp} value={dp}>{dp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Partner *</label>
                <select value={formData.clientPartner} onChange={(e) => handleChange('clientPartner', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Client Partner</option>
                  {CLIENT_PARTNERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between border-t pt-5">
          {historyStack.length > 1 ? (
            <button type="button" onClick={handleBack} className="px-5 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300">â† Back</button>
          ) : <div />}
          
          <button type="button" onClick={handleNext} disabled={submitting} className="px-6 py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-blue-800">
            {submitting ? 'Submitting...' : currentSection === 5 ? 'Submit Final Request' : 'Next Step â†’'}
          </button>
        </div>
      </div>
    </div>
  );
}
```


---

## FILE: demand-portal-ui\src\index.css

```
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```


---

## FILE: demand-portal-ui\src\main.jsx

```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```


---

## FILE: demand-portal-ui\src\SSOLogin.jsx

```
import React, { useState } from 'react';

export default function SSOLogin({ onLoginSuccess }) {
  const [roleSelection, setRoleSelection] = useState('demand_creation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSSO = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Dynamically assign the prototype emails based on the dropdown selection (Markup #3 & #4)
    const email = roleSelection === 'demand_creation' ? 'Sample@tigeranalytics.com' : 'Admin001@tigeranalytics.com';
    const userType = roleSelection === 'demand_creation' ? 'employee' : 'admin';
    const stakeholderRole = roleSelection === 'admin_partner' ? 'Portal Admin' : 'Employee';

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/google-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_type: userType, stakeholder_role: stakeholderRole })
      });

      const data = await res.json();
      
      // Markup #5: Better error handling if backend isn't running
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');

      onLoginSuccess(data.user);
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError('Failed to connect to server. Please ensure your Python FastAPI backend is running on port 8000.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Markup #1: Blended Vivid Violet & Electric Violet Background
    <div className="min-h-screen bg-gradient-to-br from-tiger-vivid to-tiger-electric flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        
        <div className="p-8 text-center border-b border-slate-100">
          {/* Markup #1: Tiger Analytics Logo */}
          <img 
            src="/tiger-logo.png" 
            alt="Tiger Analytics" 
            className="h-16 mx-auto mb-4 object-contain" 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/200x60?text=Tiger+Analytics+Logo" }}
          />
          {/* Markup #2: Demand Management Portal name */}
          <h2 className="text-2xl font-bold text-slate-800">Demand Management Portal</h2>
          <p className="text-slate-500 text-xs mt-1">Single Sign-On Authentication</p>
        </div>

        <form onSubmit={handleSSO} className="p-8 space-y-6 bg-slate-50">
          {/* Markup #5: Failed to fetch visual warning */}
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 font-semibold shadow-sm">
              âš  {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Login Profile</label>
            {/* Markup #4: Dropdown instead of tabs & manual email */}
            <select
              value={roleSelection}
              onChange={(e) => setRoleSelection(e.target.value)}
              className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-tiger-vivid focus:border-tiger-vivid focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="demand_creation">Demand Creation (Sample@tigeranalytics.com)</option>
              <option value="admin_partner">Admin / Partner (Admin001@tigeranalytics.com)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-tiger-vivid hover:bg-fuchsia-900 text-white font-bold rounded-xl text-sm shadow-lg shadow-fuchsia-900/30 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
        </form>
      </div>
    </div>
  );
}
```


---

## FILE: demand-portal-ui\tailwind.config.js

```
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tiger: {
          vivid: '#792E95',
          electric: '#8F00FF'
        }
      }
    },
  },
  plugins: [],
}
```


---

## FILE: folder.md

```
# Demand Management Portal - Project Structure
+-- demand-portal-api
|   +-- .env
|   +-- main.py
|   \-- requirements.txt
+-- demand-portal-ui
|   +-- public
|   |   \-- tiger-logo.png
|   +-- src
|   |   +-- AdminDashboard.jsx
|   |   +-- App.jsx
|   |   +-- constants.js
|   |   +-- DemandForm.jsx
|   |   +-- index.css
|   |   +-- main.jsx
|   |   \-- SSOLogin.jsx
|   +-- index.html
|   +-- package.json
|   +-- package-lock.json
|   +-- postcss.config.js
|   \-- tailwind.config.js
+-- .gitignore
+-- README.md
\-- structure.txt

```


---

## FILE: README.md

```
"# DC-Portal" 

```

