import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminEngineersPage() {
  const [name, setName] = useState('');
  const [engineerCode, setEngineerCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [engineers, setEngineers] = useState([]);
  const [fetchingEngineers, setFetchingEngineers] = useState(true);

  // Fetch all engineers
  const fetchEngineers = async () => {
    setFetchingEngineers(true);
    const { data, error } = await supabase
      .from('engineers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching engineers:', error.message);
    } else {
      setEngineers(data || []);
    }
    setFetchingEngineers(false);
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  // Register New Engineer
  const handleRegisterEngineer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formattedCode = engineerCode.trim().toUpperCase();

    try {
      const payload = {
        name: name.trim(),
        engineer_code: formattedCode,
        access_key: password.trim(), // Updated to match the access_key column to avoid schema cache conflicts
        status: 'ACTIVE',
      };

      const { error } = await supabase
        .from('engineers')
        .insert([payload]);

      if (error) {
        setErrorMessage(error.message);
      } else {
        const slug = formattedCode.toLowerCase();
        alert(`Engineer registered successfully!\nDashboard URL: /engineer/${slug}/dashboard`);

        setName('');
        setEngineerCode('');
        setPassword('');
        fetchEngineers();
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
        <h3 className="text-lg font-bold text-white mb-4">Register Field Engineer</h3>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
            Error: {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegisterEngineer} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Engineer ID / Code
            </label>
            <input
              type="text"
              value={engineerCode}
              onChange={(e) => setEngineerCode(e.target.value)}
              placeholder="e.g. ENG-001"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
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

          <div className="md:col-span-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Registering...' : '+ Add Engineer'}
            </button>
          </div>
        </form>
      </div>

      {/* ==================== ENGINEER DIRECTORY ==================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Active Field Engineers</h3>
          <button 
            onClick={fetchEngineers} 
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            ↻ Refresh List
          </button>
        </div>

        {fetchingEngineers ? (
          <p className="text-slate-400 text-xs text-center py-4">Loading engineers...</p>
        ) : engineers.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-4">No engineers registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {engineers.map((eng) => (
              <div 
                key={eng.id || eng.engineer_code} 
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{eng.name}</p>
                  <p className="text-slate-400 font-mono text-xs">
                    Code: <span className="text-blue-400 font-bold">{eng.engineer_code}</span>
                  </p>
                  {/* Password with multi-column fallback */}
                  <p className="text-slate-500 text-[10px] font-mono">
                    Password: <span className="text-slate-300 font-semibold">{eng.access_key || eng.password || eng.access_password || 'N/A'}</span>
                  </p>
                </div>
                <div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {eng.status || 'ACTIVE'}
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