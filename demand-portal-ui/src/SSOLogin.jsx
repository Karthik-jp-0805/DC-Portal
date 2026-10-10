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
              ⚠ {error}
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