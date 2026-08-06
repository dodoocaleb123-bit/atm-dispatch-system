import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function EngineerManagement() {
  const [engineers, setEngineers] = useState([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEngineers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ENGINEER');
    if (!error && data) setEngineers(data);
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  const generatePassword = () => {
    const randomPass = 'Eng#' + Math.random().toString(36).slice(-8) + '!';
    setPassword(randomPass);
  };

  const handleAddEngineer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setCreatedCredentials(null);

    const res = await fetch('/api/admin/create-engineer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName, phoneNumber }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setCreatedCredentials({ email, password, fullName });
      setMessage('Account created! Login details dispatched to engineer.');
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      fetchEngineers();
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  const handleRemoveEngineer = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from the system?`)) return;

    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setMessage('Engineer removed from active staff roster.');
      fetchEngineers();
    } else {
      setMessage(`Delete Error: ${error.message}`);
    }
  };

  const availableCount = engineers.filter((e) => e.current_status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">ATM Guard Operations</h1>
              <p className="text-xs text-slate-400">Engineer Roster & Account Management</p>
            </div>
          </div>
          <Link
            href="/admin/dashboard"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-4 py-2 rounded-xl text-xs transition flex items-center space-x-2"
          >
            <span>← Back to Dispatch Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* KPI Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff Roster</p>
            <p className="text-2xl font-bold text-white mt-1">{engineers.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Available Engineers</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">On Duty / Dispatched</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{engineers.length - availableCount}</p>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        {/* Credentials Created Alert Card */}
        {createdCredentials && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center space-x-2">
              <span>✓ New Engineer Account Active</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-1">
              <p><strong>Name:</strong> {createdCredentials.fullName}</p>
              <p><strong>Email:</strong> {createdCredentials.email}</p>
              <p>
                <strong>Permanent Password:</strong>{' '}
                <code className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 font-mono">
                  {createdCredentials.password}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Add New Engineer Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-base font-bold text-white">Register New Field Engineer</h2>

          <form onSubmit={handleAddEngineer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Caleb Dodoo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="engineer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+233 50 000 0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Set Permanent Password
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter password or auto-generate"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs transition whitespace-nowrap"
                  >
                    ⚡ Auto-Generate
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Field Engineer'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Roster Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-white">Active Field Engineers</h2>
            <span className="text-xs text-slate-400">{engineers.length} Registered</span>
          </div>

          {engineers.length === 0 ? (
            <p className="p-6 text-slate-500 text-xs">No active field engineers registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {engineers.map((eng) => (
                    <tr key={eng.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-semibold text-white">{eng.full_name}</td>
                      <td className="p-4 text-slate-400 font-mono">{eng.email}</td>
                      <td className="p-4 text-slate-400">{eng.phone_number || 'N/A'}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            eng.current_status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          • {eng.current_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemoveEngineer(eng.id, eng.full_name)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg font-semibold transition"
                        >
                          Remove / Fire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}