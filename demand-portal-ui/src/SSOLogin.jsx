import React, { useState } from 'react';

export default function SSOLogin({ onLoginSuccess }) {
  const [roleSelection, setRoleSelection] = useState('admin_partner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSSO = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let email = '';
    let userType = '';
    let stakeholderRole = '';
    let name = '';

    if (roleSelection === 'demand_creation') {
      email = 'Sample@tigeranalytics.com';
      userType = 'employee';
      stakeholderRole = 'Demand Creation';
      name = 'Karthikeyan Jayaprakash';
    } else if (roleSelection === 'admin_partner') {
      email = 'Admin001@tigeranalytics.com';
      userType = 'admin';
      stakeholderRole = 'Portal Admin';
      name = 'Portal Admin';
    } else {
      email = 'SuperAdmin@tigeranalytics.com';
      userType = 'admin';
      stakeholderRole = 'Super Admin';
      name = 'Super Admin (Master Data)';
    }

    try {
      const res = await fetch('/api/v1/auth/google-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_type: userType, stakeholder_role: stakeholderRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');

      onLoginSuccess(data.user || { email, user_type: userType, role: stakeholderRole, name });
    } catch {
      // Local fallback for offline simulation
      onLoginSuccess({ email, user_type: userType, role: stakeholderRole, name });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl border border-[#00F0FF] shadow-lg overflow-hidden">
        
        <div className="pt-8 pb-5 px-8 text-center">
          {/* Dual Logos */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <img 
              src="/tiger-logo.png" 
              alt="Tiger Analytics" 
              className="h-10 w-auto object-contain"
            />
            <div className="h-8 w-[1.5px] bg-slate-200" />
            <img 
              src="/tiger-15th-logo.png" 
              alt="15 Years" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="h-[2px] w-3/4 mx-auto bg-gradient-to-r from-[#00F0FF] via-[#8F00FF]/40 to-[#E01A8A] rounded-full mb-6" />

          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Demand Management Portal
          </h2>
          <p className="text-[#475569] text-xs mt-1.5 font-medium tracking-wide">
            Single Sign-On Authentication
          </p>
        </div>

        <form onSubmit={handleSSO} className="px-8 pb-8 pt-2 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-semibold shadow-sm">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#0F172A] mb-2 tracking-wide">
              Select Login Profile
            </label>
            <div className="relative">
              <select
                value={roleSelection}
                onChange={(e) => setRoleSelection(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-300 hover:border-[#00F0FF] focus:border-[#00F0FF] text-[#0F172A] rounded-xl text-xs font-medium outline-none transition cursor-pointer pr-10 shadow-sm"
              >
                <option value="demand_creation">
                  Demand Creation (Sample@tigeranalytics.com)
                </option>
                <option value="admin_partner">
                  Admin / Partner (Admin001@tigeranalytics.com)
                </option>
                <option value="super_admin">
                  Super Admin (Master Data Governance)
                </option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E01A8A] via-[#C91780] to-[#8F00FF] hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
        </form>

      </div>
    </div>
  );
}