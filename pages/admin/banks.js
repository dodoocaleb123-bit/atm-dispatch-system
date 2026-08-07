import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AddBankModal({ onBankCreated }) {
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegisterBank = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage('');

  try {
    // Exact column match with your Supabase table schema
    const { data, error } = await supabase
  .from('banks')
  .insert([
    {
      name: bankName,
      bank_code: bankCode.trim().toUpperCase(), // 👈 Make sure key is 'bank_code'
      access_key: password,                    // 👈 Make sure key is 'access_key'
      status: 'ACTIVE',
    },
  ])
  .select();

    if (error) {
      setErrorMessage(error.message);
    } else {
      const generatedSlug = bankCode.trim().toLowerCase();
      alert(`Bank created successfully!\nLogin URL: /bank/${generatedSlug}/dashboard`);
      setBankName('');
      setBankCode('');
      setPassword('');
      if (onBankCreated) onBankCreated();
    }
  } catch (err) {
    setErrorMessage(err.message || 'An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-2xl mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">Register New Partner Bank</h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
          Error: {errorMessage}
        </div>
      )}

      <form onSubmit={handleRegisterBank} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
            Bank Name
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. CBG Bank Limited"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
            Bank Code / Acronym
          </label>
          <input
            type="text"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            placeholder="e.g. CBG"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
            Bank Login Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g. cbg2026"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="md:col-span-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2"
          >
            {loading ? 'Registering Bank...' : '+ Register Partner Bank'}
          </button>
        </div>
      </form>
    </div>
  );
}