import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CEOLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Executive authentication check
    if (password.trim() === '2357abcd') {
      // Save authenticated session state locally
      localStorage.setItem(
        'ceo_session',
        JSON.stringify({ role: 'CEO', authenticated: true, timestamp: new Date().toISOString() })
      );

      // Redirect directly to the CEO Command Center hub
      router.push('/admin/dashboard');
    } else {
      setError('Invalid Executive Access Code. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-purple-500/20">
            👔
          </div>
          <h1 className="text-xl font-bold text-white">CEO Portal Access</h1>
          <p className="text-xs text-slate-400">Enter master authorization code to open Executive Command Center</p>
        </div>

        {/* Dynamic Error Alert */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter CEO password..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-mono placeholder-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-md shadow-purple-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Authenticate as CEO'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            ATM Servicing & Dispatch Management System • Master Control Access
          </p>
        </div>
      </div>
    </div>
  );
}