import React, { useState } from 'react';
import SSOLogin from './SSOLogin';
import DemandForm from './DemandForm';
import AdminDashboard from './AdminDashboard';
import AdminReportsDashboard from './AdminReportsDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('form');
  const [lastSubmittedId, setLastSubmittedId] = useState('');

  // Handle Role-Based Access Control on login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.user_type === 'admin' || user.role === 'Portal Admin') {
      setView('dashboard');
    } else {
      setView('form');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('form');
    setLastSubmittedId('');
  };

  if (!currentUser) {
    return <SSOLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.user_type === 'admin' || currentUser.role === 'Portal Admin';

  return (
    <div className="min-h-screen bg-[#05050A] flex flex-col font-sans text-white">
      {/* Top Navigation Header - 15-Year Anniversary Branding */}
      <header className="bg-[#05050A] border-b border-[#161224] px-6 md:px-8 py-3 shadow-2xl relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Official 15-Year Logo Asset */}
          <div className="flex items-center gap-3">
            <img 
              src="/tiger-15th-logo.png" 
              alt="Tiger Analytics 15 Years Powered by Ingenuity" 
              className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(224,26,138,0.35)]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/tiger-logo.png";
              }}
            />
          </div>

          {/* Right: User Identity Pill Badge & Sign Out */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center px-4 py-1.5 rounded-full bg-[#161224] border border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.35)]">
              <span className="text-xs font-semibold text-white tracking-wide">
                {isAdmin ? 'Admin' : (currentUser?.name || 'Karthikeyan Jayaprakash')}
              </span>
              <span className="mx-2 text-xs font-light text-[#00F0FF]/70">|</span>
              <span className="text-xs font-bold text-[#00F0FF]">
                {currentUser?.role || (isAdmin ? 'Portal Admin' : 'Demand Creation')}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Ambient Glow Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E01A8A] via-[#8F00FF] to-[#00F0FF] opacity-90" />
      </header>

      {/* Navigation Bar (Markup #14: Extends Admin Tabs to include Reports) */}
      <nav className="bg-[#0D0B18] border-b border-slate-800/80 px-6 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex gap-6">
          
          {/* Non-Admin Employee Tab */}
          {!isAdmin && (
            <button
              onClick={() => setView('form')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                view === 'form'
                  ? 'border-[#E01A8A] text-[#E01A8A]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Submit New Request
            </button>
          )}

          {/* Operational Ledger / Dashboard Tab */}
          <button
            onClick={() => setView('dashboard')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              view === 'dashboard'
                ? 'border-[#E01A8A] text-[#E01A8A]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {isAdmin ? 'Admin / Partner Dashboard' : 'My Requests'}
          </button>

          {/* Admin Reports Tab (Markup #14) */}
          {isAdmin && (
            <button
              onClick={() => setView('reports')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                view === 'reports'
                  ? 'border-[#E01A8A] text-[#E01A8A]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Reports
            </button>
          )}
        </div>
      </nav>

      {/* Main Workspace Canvas */}
      <main className="flex-1 p-6 md:p-8 bg-[#05050A]">
        {lastSubmittedId && !isAdmin && (
          <div className="max-w-5xl mx-auto mb-6 p-4 bg-emerald-950/70 text-emerald-200 border border-emerald-500/50 rounded-xl text-xs flex justify-between items-center shadow-lg">
            <span>
              <strong>Success!</strong> Request logged under Primary Key:{' '}
              <code className="bg-emerald-900/80 px-2 py-0.5 rounded font-mono font-bold text-emerald-100">
                {lastSubmittedId}
              </code>
            </span>
            <button
              onClick={() => setLastSubmittedId('')}
              className="font-bold text-emerald-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Router */}
        {view === 'form' && !isAdmin && (
          <DemandForm
            currentUser={currentUser}
            onSubmitted={(id) => {
              setLastSubmittedId(id);
              setView('dashboard');
            }}
          />
        )}

        {view === 'dashboard' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {view === 'reports' && isAdmin && (
          <AdminReportsDashboard />
        )}
      </main>
    </div>
  );
}