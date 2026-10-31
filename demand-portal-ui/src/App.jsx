import React, { useState } from 'react';
import SSOLogin from './SSOLogin';
import DemandForm from './DemandForm';
import AdminDashboard from './AdminDashboard';
import AdminReportsDashboard from './AdminReportsDashboard';
import MasterDataGovernance from './MasterDataGovernance';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [lastSubmittedId, setLastSubmittedId] = useState('');

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === 'Demand Creation') {
      setView('form');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
    setLastSubmittedId('');
  };

  if (!currentUser) {
    return <SSOLogin onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'Portal Admin' || currentUser.role === 'Super Admin';
  const isSuperAdmin = currentUser.role === 'Super Admin' || currentUser.email === 'SuperAdmin@tigeranalytics.com';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-3 shadow-sm relative z-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          
          {/* Dual Branding */}
          <div className="flex items-center gap-4">
            <img 
              src="/tiger-logo.png" 
              alt="Tiger Analytics" 
              className="h-9 md:h-10 w-auto object-contain cursor-pointer"
            />
            <div className="h-7 w-[1.5px] bg-slate-200" />
            <img 
              src="/tiger-15th-logo.png" 
              alt="15 Years Powered by Ingenuity" 
              className="h-11 md:h-12 w-auto object-contain"
            />
          </div>

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-5">
            <div className="flex items-center px-4 py-1.5 rounded-full bg-white border border-[#00F0FF] shadow-sm">
              <span className="text-xs font-semibold text-[#0F172A] tracking-wide">
                {currentUser?.name || 'Karthikeyan Jayaprakash'}
              </span>
              <span className="mx-2 text-xs font-light text-slate-300">|</span>
              <span className="text-xs font-bold text-[#E01A8A]">
                {currentUser?.role || 'Portal Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] underline underline-offset-4 transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00F0FF] via-[#8F00FF] to-[#E01A8A] opacity-90" />
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-6 md:px-8 shadow-inner z-10 relative">
        <div className="max-w-[1400px] mx-auto flex gap-6">
          {!isAdmin && (
            <button
              onClick={() => setView('form')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                view === 'form'
                  ? 'border-[#E01A8A] text-[#E01A8A]'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Submit New Request
            </button>
          )}

          <button
            onClick={() => setView('dashboard')}
            className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              view === 'dashboard'
                ? 'border-[#E01A8A] text-[#E01A8A]'
                : 'border-transparent text-[#475569] hover:text-[#0F172A]'
            }`}
          >
            {isAdmin ? 'Admin / Partner Dashboard' : 'My Requests'}
          </button>

          {isAdmin && (
            <button
              onClick={() => setView('reports')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                view === 'reports'
                  ? 'border-[#E01A8A] text-[#E01A8A]'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Reports
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setView('master_data')}
              className={`py-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                view === 'master_data'
                  ? 'border-[#E01A8A] text-[#E01A8A]'
                  : 'border-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              <span>Master Data (Super Admin)</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-[#E01A8A] text-[#E01A8A] font-extrabold">RESTRICTED</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Workspace Canvas */}
      <main className="flex-1 overflow-y-auto relative">
        {view === 'form' && !isAdmin && (
          <div className="p-6 md:p-8">
            {lastSubmittedId && (
              <div className="max-w-5xl mx-auto mb-6 p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs flex justify-between items-center shadow-sm">
                <span>
                  <strong>Success!</strong> Request logged under Primary Key:{' '}
                  <code className="bg-emerald-100 px-2 py-0.5 rounded font-mono font-bold text-emerald-800">
                    {lastSubmittedId}
                  </code>
                </span>
                <button
                  onClick={() => setLastSubmittedId('')}
                  className="font-bold text-emerald-700 hover:text-emerald-950"
                >
                  ✕
                </button>
              </div>
            )}
            <DemandForm
              currentUser={currentUser}
              onSubmitted={(id) => {
                setLastSubmittedId(id);
                setView('dashboard');
              }}
            />
          </div>
        )}

        {view === 'dashboard' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {view === 'reports' && isAdmin && (
          <AdminReportsDashboard />
        )}

        {view === 'master_data' && isSuperAdmin && (
          <MasterDataGovernance currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}