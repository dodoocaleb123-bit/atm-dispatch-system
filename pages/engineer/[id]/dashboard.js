import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function EngineerDashboard() {
  const router = useRouter();
  const { id } = router.query; // Extracts engineer_code from URL (e.g. "eng-001")

  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Wait until router is ready and id is available
    if (!router.isReady || !id) return;

    const fetchEngineerProfile = async () => {
      setLoading(true);
      try {
        // Case-insensitive query to find engineer profile
        const { data, error } = await supabase
          .from('engineers')
          .select('*')
          .ilike('engineer_code', id)
          .single();

        if (error || !data) {
          setErrorMsg('Engineer profile not found.');
        } else {
          setEngineer(data);
        }
      } catch (err) {
        setErrorMsg('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEngineerProfile();
  }, [router.isReady, id]);

  const handleLogout = () => {
    router.push('/engineer/portal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading Engineer Dashboard...
      </div>
    );
  }

  if (errorMsg || !engineer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm text-center space-y-4 shadow-xl">
          <p className="text-red-400 text-xs font-semibold">{errorMsg || 'Engineer not found'}</p>
          <button
            onClick={() => router.push('/engineer/portal')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
          >
            Back to Portal Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header / Profile Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-2xl">
              🛠️
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{engineer.name}</h1>
              <p className="text-xs text-slate-400 font-mono">
                Engineer ID: <span className="text-blue-400 font-bold">{engineer.engineer_code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {engineer.status || 'ACTIVE'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Assigned Tickets</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-amber-400">0</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-emerald-400">0</p>
          </div>
        </div>

        {/* Dispatch Work Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Assigned Field Work Orders</h2>
            <span className="text-xs text-slate-500 font-mono">Real-time sync</span>
          </div>

          <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
            <p className="text-slate-500 text-xs">No active dispatch jobs currently assigned to {engineer.name}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}