import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function BankManagement() {
  const [banks, setBanks] = useState([]);
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBanks = async () => {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setBanks(data);
    if (error) console.error(error);
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleAddBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.from('banks').insert([
      {
        name: bankName.trim(),
        bank_code: bankCode.toUpperCase().trim(),
        access_key: password.trim(), // Stores the generated password as access credential
        status: 'ACTIVE',
      },
    ]);

    setLoading(false);

    if (!error) {
      setMessage(`Partner Bank onboarded successfully! Registered Password: ${password.trim()}`);
      setBankName('');
      setBankCode('');
      setPassword('');
      fetchBanks();
    } else {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleRemoveBank = async (id, name) => {
    if (!confirm(`Are you sure you want to terminate partnership with ${name}?`)) return;

    const { error } = await supabase.from('banks').delete().eq('id', id);

    if (!error) {
      setMessage(`Partnership with ${name} terminated.`);
      fetchBanks();
    } else {
      setMessage(`Error removing bank: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
              👔
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">CEO Partner Bank Management</h1>
              <p className="text-xs text-slate-400">Onboard & Manage Client Bank Credentials</p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            ← Back to Operations Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {message && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-mono">
            {message}
          </div>
        )}

        {/* Add Bank Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-base font-bold text-white">Register New Partner Bank</h2>
          <form onSubmit={handleAddBank} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Absa Bank Ghana"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Bank Code / Acronym
              </label>
              <input
                type="text"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="e.g. ABSA"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition uppercase font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Bank Login Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set bank password..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition font-mono"
                required
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-md shadow-purple-600/20 disabled:opacity-50"
              >
                {loading ? 'Adding...' : '➕ Register Partner Bank'}
              </button>
            </div>
          </form>
        </div>

        {/* Banks Directory Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Active Banking Partnerships ({banks.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4">Bank Name</th>
                  <th className="p-4">Bank Code</th>
                  <th className="p-4">Assigned Password</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {banks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{b.name}</td>
                    <td className="p-4 font-mono text-purple-400 font-semibold">{b.bank_code}</td>
                    <td className="p-4 font-mono text-slate-300 bg-slate-950/60 px-3 py-1 rounded border border-slate-800/80 inline-block my-2">
                      {b.access_key}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        • {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleRemoveBank(b.id, b.name)}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition"
                      >
                        🗑️ Terminate Partnership
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}