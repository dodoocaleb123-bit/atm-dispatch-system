import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function EngineerDashboard() {
  const router = useRouter();
  const { id } = router.query; // Extracts engineer_code from URL (e.g. "eng-002")

  const [engineer, setEngineer] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch engineer profile using case-insensitive query on engineer_code
        const { data: engData, error: engError } = await supabase
          .from('engineers')
          .select('*')
          .ilike('engineer_code', id)
          .single();

        if (engError || !engData) {
          setErrorMsg('Engineer profile not found.');
          setLoading(false);
          return;
        }

        setEngineer(engData);

        // 2. Fetch service tickets assigned to this engineer (matching their UUID id)
        const { data: ticketData, error: ticketError } = await supabase
          .from('service_tickets')
          .select('*')
          .eq('assigned_engineer_id', engData.id)
          .order('created_at', { ascending: false });

        if (ticketError) {
          console.error('Error fetching tickets:', ticketError);
        } else {
          // Fetch related banks and ATMs to enrich ticket details
          const { data: bankData } = await supabase.from('banks').select('*');
          const { data: atmData } = await supabase.from('atms').select('*');

          const enrichedTickets = (ticketData || []).map(ticket => {
            const matchedBank = (bankData || []).find(b => b.id === ticket.bank_id);
            const matchedAtm = (atmData || []).find(a => a.id === ticket.atm_id);
            return {
              ...ticket,
              banks: matchedBank,
              atms: matchedAtm,
              description: ticket.fault_description
            };
          });

          setTickets(enrichedTickets);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setErrorMsg('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router.isReady, id]);

  const handleLogout = () => {
    router.push('/engineer/portal');
  };

  const handleResolveTicket = async (ticketId) => {
    const { error } = await supabase
      .from('service_tickets')
      .update({ 
        status: 'RESOLVED'
      })
      .eq('id', ticketId);

    if (!error) {
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t));
      setMessage('Work order successfully marked as resolved and submitted to CEO & Bank.');
      setTimeout(() => setMessage(''), 4000);
    } else {
      setMessage(`Error updating ticket: ${error.message}`);
    }
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

  // Calculate metrics
  const assignedCount = tickets.filter(t => t.status === 'ASSIGNED' || t.status === 'PENDING').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'COMPLETED').length;

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

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Assigned Tickets</p>
            <p className="text-2xl font-bold text-white">{assignedCount}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-amber-400">{inProgressCount}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-emerald-400">{completedCount}</p>
          </div>
        </div>

        {/* Dispatch Work Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Assigned Field Work Orders</h2>
            <span className="text-xs text-slate-500 font-mono">Real-time sync</span>
          </div>

          {tickets.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
              <p className="text-slate-500 text-xs">No active dispatch jobs currently assigned to {engineer.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      {ticket.atms?.serial_number || ticket.atms?.atm_serial || 'ATM Terminal'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                      ticket.status === 'RESOLVED' || ticket.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {ticket.status || 'ASSIGNED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">Bank: {ticket.banks?.name || ticket.banks?.bank_name || 'N/A'}</p>
                  <p className="text-xs text-slate-200">{ticket.description}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Location: {ticket.atms?.location_details}</p>

                  {ticket.status !== 'RESOLVED' && ticket.status !== 'COMPLETED' && (
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleResolveTicket(ticket.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-lg"
                      >
                        Mark as Resolved / Complete Work
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}