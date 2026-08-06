import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function EngineerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const fetchAssignedTickets = async () => {
    setLoading(true);

    // Get currently authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/engineer/login');
      return;
    }

    setUserEmail(user.email);

    // Fetch tickets assigned to this engineer
    const { data, error } = await supabase
      .from('service_tickets')
      .select('*')
      .eq('assigned_engineer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setMessage('');
    const { error } = await supabase
      .from('service_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (!error) {
      setMessage(`Ticket status updated to ${newStatus}!`);
      fetchAssignedTickets();
    } else {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/engineer/login');
  };

  // Metrics
  const activeCount = tickets.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Engineer Work Console</h1>
              <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-none">
                {userEmail || 'Field Service Tech'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Active Jobs</p>
            <p className="text-2xl font-bold text-white mt-1">{activeCount}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Completed</p>
            <p className="text-2xl font-bold text-white mt-1">{completedCount}</p>
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        {/* Dispatch Jobs List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Your Assigned Tickets</h2>
            <button
              onClick={fetchAssignedTickets}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm py-4">Loading assigned tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="text-slate-300 font-semibold text-sm">No Active Assignments</p>
              <p className="text-slate-500 text-xs">
                You currently have no pending dispatch tickets. New assignments from the CEO will appear here.
              </p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      ATM Unit: {t.atm_id || t.atm_serial || 'Standard Terminal'}
                    </span>
                    <h3 className="text-base font-semibold text-white mt-1">
                      {t.issue_description || t.fault || 'Reported ATM Fault'}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      t.status === 'ASSIGNED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    • {t.status}
                  </span>
                </div>

                {/* Priority / Details */}
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span className="bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 text-red-400 font-semibold">
                    Priority: {t.priority || 'CRITICAL'}
                  </span>
                  <span>Logged: {new Date(t.created_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-3">
                  {t.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'IN_PROGRESS')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-md shadow-blue-600/20"
                    >
                      ▶ Start Repair Job
                    </button>
                  )}

                  {t.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(t.id, 'COMPLETED')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-xs transition shadow-md shadow-emerald-600/20"
                    >
                      ✓ Mark Job Completed
                    </button>
                  )}

                  {t.status === 'COMPLETED' && (
                    <div className="w-full text-center py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      Task Finished & Resolved
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}