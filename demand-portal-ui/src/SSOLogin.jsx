import React, { useState } from 'react';

export default function SSOLogin({ onLoginSuccess }) {
  const [roleSelection, setRoleSelection] = useState('demand_creation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSSO = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = roleSelection === 'demand_creation' ? 'Sample@tigeranalytics.com' : 'Admin001@tigeranalytics.com';
    const userType = roleSelection === 'demand_creation' ? 'employee' : 'admin';
    const stakeholderRole = roleSelection === 'admin_partner' ? 'Portal Admin' : 'Demand Creation';
    const name = roleSelection === 'demand_creation' ? 'Karthikeyan Jayaprakash' : 'Portal Admin';

    try {
      const res = await fetch('/api/v1/auth/google-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_type: userType, stakeholder_role: stakeholderRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');

      onLoginSuccess(data.user || { email, user_type: userType, role: stakeholderRole, name });
    } catch (err) {
      onLoginSuccess({
        email,
        user_type: userType,
        role: stakeholderRole,
        name
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Ambient Faded Wave Orbs */}
      <div 
        className="absolute -left-48 top-1/4 w-[650px] h-[650px] rounded-full bg-[#FCE7F3]/70 blur-[130px] pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute -right-48 bottom-1/4 w-[650px] h-[650px] rounded-full bg-[#ECFEFF]/80 blur-[130px] pointer-events-none" 
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-[#F1F5F9]/60 blur-[120px] pointer-events-none" 
        aria-hidden="true"
      />

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl border border-[#00F0FF] shadow-[0_10px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.05),0_0_25px_rgba(0,240,255,0.2)] overflow-hidden transition-all duration-300">
        
        <div className="pt-8 pb-5 px-8 text-center">
          
          {/* Dual Logos - Perfectly Matched Scale and Pure White Integration */}
          <div className="flex items-center justify-center gap-4 mb-5">
            <img 
              src="/tiger-logo.png" 
              alt="Tiger Analytics" 
              className="h-10 md:h-11 w-auto object-contain bg-transparent"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/140x36/FFFFFF/0F172A?text=Tiger+Analytics";
              }}
            />

            <div className="h-8 w-[1.5px] bg-slate-200" />

            <img 
              src="/tiger-15th-logo.png" 
              alt="15 Years Powered by Ingenuity" 
              className="h-13 md:h-14 w-auto object-contain bg-white mix-blend-multiply"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/110x36/FFFFFF/E01A8A?text=15+Years";
              }}
            />
          </div>

          <div className="h-[2px] w-3/4 mx-auto bg-gradient-to-r from-[#00F0FF] via-[#8F00FF]/40 to-[#E01A8A] rounded-full mb-6 opacity-80" />

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
                className="w-full p-3.5 bg-white border border-slate-300 hover:border-[#00F0FF] focus:border-[#00F0FF] text-[#0F172A] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00F0FF]/20 focus:outline-none transition cursor-pointer appearance-none pr-10 shadow-sm"
              >
                <option value="demand_creation" className="bg-white text-[#0F172A]">
                  Demand Creation (Sample@tigeranalytics.com)
                </option>
                <option value="admin_partner" className="bg-white text-[#0F172A]">
                  Admin / Partner (Admin001@tigeranalytics.com)
                </option>
              </select>
              
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E01A8A] via-[#C91780] to-[#8F00FF] hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-[0_0_20px_rgba(224,26,138,0.4)] hover:shadow-[0_0_28px_rgba(224,26,138,0.6)] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
        </form>

      </div>
    </div>
  );
}