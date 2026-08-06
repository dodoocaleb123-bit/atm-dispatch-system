import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Fetch tickets
    const { data: ticketData, error: ticketError } = await supabase
      .from('service_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (ticketError) {
      console.error('Ticket Fetch Error:', ticketError);
    }

    // Fetch engineers
    const { data: engData, error: engError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'ENGINEER');

    if (engError) {
      console.error('Engineer Fetch Error:', engError);
    }

    if (ticketData) setTickets(ticketData);
    if (engData) setEngineers(engData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignTicket = async (ticketId) => {
    const engineerId = selectedEngineer[ticketId];
    if (!engineerId) {
      alert('Please select an engineer first!');
      return;
    }

    const { error } = await supabase
      .from('service_tickets')
      .update({
        assigned_engineer_id: engineerId,
        status: 'ASSIGNED',
      })
      .eq('id', ticketId);

    if (!error) {
      setMessage('Ticket assigned to field engineer successfully!');
      fetchData();
    } else {
      setMessage(`Error: ${error.message}`);
    }
  };

  // Metrics
  const pendingCount = tickets.filter((t) => t.status === 'PENDING').length;
  const assignedCount = tickets.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter((t) => t.status === 'COMPLETED').length;

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
              <p className="text-xs text-slate-400">CEO & Operations Control Dashboard</p>
            </div>
          </div>
          <Link
            href="/admin/engineers"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-blue-600/20 flex items-center space-x-2"
          >
            <span>⚙️ Manage Field Engineers (Add / Fire) →</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* KPI Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fault Reports</p>
            <p className="text-2xl font-bold text-white mt-1">{tickets.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Unassigned / Pending</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Assigned / In Progress</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{assignedCount}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Jobs</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        {/* Tickets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white">Incoming ATM Fault Tickets</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select an available technician to dispatch to the ATM site</p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
            >
              <span>🔄 Refresh Stream</span>
            </button>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500 text-xs">Loading dispatch stream...</p>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-2xl">📡</p>
              <p className="text-slate-300 font-semibold text-sm">No Active Fault Reports</p>
              <p className="text-slate-500 text-xs">When banks submit faulty ATM reports, they will populate here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">ATM Serial / ID</th>
                    <th className="p-4">Issue Description</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Logged At</th>
                    <th className="p-4">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-semibold text-blue-400">
                        {t.atm_id || t.atm_serial || 'ATM Unit'}
                      </td>
                      <td className="p-4 text-slate-200 font-medium">
                        {t.issue_description || t.description || t.fault}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          {t.priority || 'CRITICAL'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            t.status === 'PENDING'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          • {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <select
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition"
                            onChange={(e) =>
                              setSelectedEngineer({ ...selectedEngineer, [t.id]: e.target.value })
                            }
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Assign Engineer
                            </option>
                            {engineers.map((eng) => (
                              <option key={eng.id} value={eng.id}>
                                {eng.full_name} ({eng.current_status})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignTicket(t.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-emerald-600/20 whitespace-nowrap"
                          >
                            Dispatch
                          </button>
                        </div>
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