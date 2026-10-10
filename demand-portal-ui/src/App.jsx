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
            <button onClick={() => setLastSubmittedId('')} className="font-bold text-emerald-900">✕</button>
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