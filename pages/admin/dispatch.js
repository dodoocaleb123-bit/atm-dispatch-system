import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDispatch() {
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [atms, setAtms] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch all dispatch data for admins
  useEffect(() => {
    const loadDispatchData = async () => {
      setLoading(true);
      try {
        // Fetch all tickets with related bank, atm, and engineer info
        const { data: ticketData, error: ticketErr } = await supabase
          .from('tickets')
          .select('*, banks(*), atms(*), engineers(*)')
          .order('created_at', { ascending: false });

        if (ticketErr) console.error('Error fetching tickets:', ticketErr);
        else setTickets(ticketData || []);

        // Fetch engineers for assignment dropdowns
        const { data: engData, error: engErr } = await supabase.from('engineers').select('*');
        if (engErr) console.error('Error fetching engineers:', engErr);
        else setEngineers(engData || []);

      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDispatchData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 p-8">Loading Admin Dispatch Console...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8 font-sans">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">CEO Dispatch & Incident Control</h1>
          <p className="text-xs text-slate-400 font-mono">Manage system-wide ATM fault tickets and engineer assignments</p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
        >
          Back to Admin Dashboard
        </button>
      </header>

      {message && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
          {message}
        </div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">All System Incidents</h2>
        {tickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs italic">
            No incident reports found in the system.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {ticket.atms?.atm_serial || 'ATM Terminal'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ticket.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Bank: {ticket.banks?.name || ticket.banks?.bank_name || 'N/A'}</p>
                <p className="text-xs text-slate-200">{ticket.description}</p>
                <p className="text-[11px] text-slate-400 font-mono">Location: {ticket.atms?.location_details}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}