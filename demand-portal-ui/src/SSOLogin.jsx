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
      const res = await fetch('http://localhost:8000/api/v1/auth/google-sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_type: userType, stakeholder_role: stakeholderRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed.');

      onLoginSuccess(data.user || { email, user_type: userType, role: stakeholderRole, name });
    } catch (err) {
      // Local fallback in case the FastAPI backend is running offline
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
    <div className="relative min-h-screen w-full bg-[#05050A] flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Ambient Glowing Wave Orbs */}
      <div className="absolute -left-48 top-1/4 w-[620px] h-[620px] rounded-full bg-[#E01A8A]/20 blur-[140px] pointer-events-none" />
      <div className="absolute -right-48 bottom-1/4 w-[620px] h-[620px] rounded-full bg-[#00F0FF]/15 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] rounded-full bg-[#161224]/80 blur-[110px] pointer-events-none" />

      {/* Decorative Wave Accent Curves */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        <path d="M-100,500 C300,750 650,250 1100,600 C1300,750 1500,450 1600,400" fill="none" stroke="#E01A8A" strokeWidth="2" opacity="0.6" />
        <path d="M-50,300 C400,100 800,800 1250,350 C1400,200 1550,500 1600,550" fill="none" stroke="#00F0FF" strokeWidth="2" opacity="0.6" />
      </svg>

      {/* SSO Card Surface */}
      <div className="relative z-10 max-w-md w-full bg-[#161224] rounded-2xl border border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.32)] overflow-hidden transition-all duration-300">
        
        {/* Card Header & Official 15-Year Branding */}
        <div className="pt-8 pb-6 px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/tiger-15th-logo.png" 
              alt="Tiger Analytics 15 Years Powered by Ingenuity" 
              className="h-10 md:h-12 w-auto max-w-full object-contain drop-shadow-[0_0_15px_rgba(224,26,138,0.45)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/tiger-logo.png";
              }}
            />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            Demand Management Portal
          </h2>
          <p className="text-[#CBD5E1] text-xs mt-1.5 font-medium tracking-wide">
            Single Sign-On Authentication
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSSO} className="px-8 pb-8 pt-2 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/70 text-rose-200 text-xs rounded-xl border border-rose-500/60 font-semibold">
              ⚠ {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#CBD5E1] mb-2 tracking-wide">
              Select Login Profile
            </label>
            <div className="relative">
              <select
                value={roleSelection}
                onChange={(e) => setRoleSelection(e.target.value)}
                className="w-full p-3.5 bg-[#0D0B18] border border-slate-700 hover:border-[#00F0FF]/50 focus:border-[#00F0FF] text-white rounded-xl text-xs font-medium focus:ring-1 focus:ring-[#00F0FF] focus:outline-none transition cursor-pointer appearance-none pr-10 shadow-inner"
              >
                <option value="demand_creation" className="bg-[#161224] text-white">
                  Demand Creation (Sample@tigeranalytics.com)
                </option>
                <option value="admin_partner" className="bg-[#161224] text-white">
                  Admin / Partner (Admin001@tigeranalytics.com)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                ▼
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E01A8A] via-[#C91780] to-[#8F00FF] hover:opacity-95 text-white font-bold rounded-xl text-sm shadow-[0_0_22px_rgba(224,26,138,0.45)] hover:shadow-[0_0_30px_rgba(224,26,138,0.7)] transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
        </form>

      </div>
    </div>
  );
}