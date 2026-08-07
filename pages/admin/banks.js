import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminBanksPage() {
  // --- Form State ---
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- Banks List State ---
  const [banks, setBanks] = useState([]);
  const [fetchingBanks, setFetchingBanks] = useState(true);

  // 1. Fetch Banks Function
  const fetchBanks = async () => {
    setFetchingBanks(true);
    const { data, error } = await supabase
      .from('banks')
      .select('*');

    if (error) {
      console.error('Error fetching banks:', error.message);
    } else {
      setBanks(data || []);
    }
    setFetchingBanks(false);
  };

  // 2. Fetch banks on initial page load
  useEffect(() => {
    fetchBanks();
  }, []);

  // 3. Handle Form Submission
  const handleRegisterBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formattedCode = bankCode.trim().toUpperCase();

    if (!formattedCode) {
      setErrorMessage('Bank Code is required.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: bankName.trim(),
        bank_code: formattedCode,
        access_key: password.trim(),
        status: 'ACTIVE',
      };

      const { data, error } = await supabase
        .from('banks')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase Insert Error:', error);
        setErrorMessage(error.message);
      } else {
        const generatedSlug = formattedCode.toLowerCase();
        alert(`Bank created successfully!\nLogin URL: /bank/${generatedSlug}/dashboard`);

        // Clear input fields
        setBankName('');
        setBankCode('');
        setPassword('');

        // Refresh the bank list dynamically!
        fetchBanks();
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-8 text-white">
      {/* ==================== FORM SECTION ==================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
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

      {/* ==================== REGISTERED BANKS LIST ==================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Registered Partner Banks</h3>
          <button 
            onClick={fetchBanks} 
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            ↻ Refresh List
          </button>
        </div>

        {fetchingBanks ? (
          <p className="text-slate-400 text-xs py-4 text-center">Loading registered banks...</p>
        ) : banks.length === 0 ? (
          <p className="text-slate-500 text-xs py-4 text-center">No banks registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {banks.map((bank) => (
              <div
                key={bank.id || bank.bank_code}
                className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{bank.name}</p>
                  <p className="text-slate-400 font-mono text-xs">Code: <span className="text-purple-400 font-bold">{bank.bank_code}</span></p>
                  <p className="text-slate-500 text-[10px] font-mono">Access Key: {bank.access_key}</p>
                </div>
                <div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {bank.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}