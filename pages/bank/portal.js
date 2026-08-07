import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function BankLogin() {
  const router = useRouter();
  const [bankCode, setBankCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const formattedCode = bankCode.trim().toUpperCase();

      // 1. Fetch bank record by Bank Code
      const { data: bank, error } = await supabase
        .from('banks')
        .select('*')
        .or(`bank_code.ilike.${formattedCode},acronym.ilike.${formattedCode}`)
        .maybeSingle();

      if (bank && !error) {
        // 2. Validate password against access_password OR access_key fallback
        const validPassword = bank.access_password || bank.access_key;

        if (validPassword && validPassword === password.trim()) {
          const slug = (bank.bank_code || bank.acronym || bank.slug).toLowerCase();
          // 🚀 Route directly straight to bank dashboard
          router.push(`/bank/${slug}/dashboard`);
          return;
        }
      }

      setErrorMsg('Invalid Bank Code or Password.');
    } catch (err) {
      setErrorMsg('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-3">
            🏛️
          </div>
          <h1 className="text-xl font-bold text-white">Bank Partner Sign In</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your dashboard</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Bank Code / Acronym
            </label>
            <input
              type="text"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="e.g. CBG"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Authenticating...' : 'Access Bank Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}