import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function EngineerLogin() {
  const router = useRouter();
  const [engineerCode, setEngineerCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formattedCode = engineerCode.trim().toUpperCase();

      // 1. Fetch the engineer profile by code
      const { data: engineer, error } = await supabase
        .from('engineers')
        .select('*')
        .ilike('engineer_code', formattedCode)
        .single();

      if (engineer && !error) {
        // 2. Check password against access_password OR access_key fallback
        const validPassword = engineer.access_password || engineer.access_key;

        if (validPassword && validPassword === password.trim()) {
          // Save authenticated session locally (optional)
          localStorage.setItem(
            'engineer_session',
            JSON.stringify({ 
              engineer_code: engineer.engineer_code, 
              name: engineer.name,
              authenticated: true, 
              timestamp: new Date().toISOString() 
            })
          );

          // 3. Redirect to the dynamic engineer dashboard
          router.push(`/engineer/${engineer.engineer_code.toLowerCase()}/dashboard`);
          return;
        }
      }

      setErrorMsg('Invalid Engineer ID or Password.');
    } catch (err) {
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-blue-500/20">
            🛠️
          </div>
          <h1 className="text-xl font-bold text-white">Field Engineer Sign In</h1>
          <p className="text-xs text-slate-400">Enter your Engineer ID and Access Password</p>
        </div>

        {/* Dynamic Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Engineer ID / Code
            </label>
            <input
              type="text"
              value={engineerCode}
              onChange={(e) => setEngineerCode(e.target.value)}
              placeholder="e.g. ENG-001"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono placeholder-slate-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono placeholder-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Engineer Portal'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            ATM Servicing & Dispatch Management System • Field Dispatch Access
          </p>
        </div>
      </div>
    </div>
  );
}