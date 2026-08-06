import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function BankLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Fetch matching active bank record by password (access_key column)
      const { data, error: fetchError } = await supabase
        .from('banks')
        .select('*')
        .eq('access_key', password.trim())
        .eq('status', 'ACTIVE')
        .single();

      if (fetchError || !data) {
        setError('Invalid or revoked password. Please check your credentials or contact system management.');
      } else {
        // Store bank session locally and redirect to the bank portal
        localStorage.setItem('bank_session', JSON.stringify(data));
        router.push('/bank/portal');
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-blue-500/20">
            🏛️
          </div>
          <h1 className="text-xl font-bold text-white">Partner Bank Portal</h1>
          <p className="text-xs text-slate-400">Enter your assigned Bank Password to access the portal</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Bank Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter bank login password..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono placeholder-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Incident Console'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Authorized Banking Client Access Only • Managed by ATM Dispatch Enterprise
          </p>
        </div>
      </div>
    </div>
  );
}