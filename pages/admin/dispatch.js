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
        // Query the correct table: service_tickets
        const { data: ticketData, error: ticketErr } = await supabase
          .from('service_tickets')
          .select('*')
          .order('created_at', { ascending: false });

        if (ticketErr) {
          console.error('Error fetching service tickets:', ticketErr);
        } else {
          // Fetch related banks, atms, and engineers
          const { data: bankData } = await supabase.from('banks').select('*');
          const { data: atmData } = await supabase.from('atms').select('*');
          const { data: engData } = await supabase.from('engineers').select('*');

          const enrichedTickets = (ticketData || []).map(ticket => {
            const matchedBank = (bankData || []).find(b => b.id === ticket.bank_id);
            const matchedAtm = (atmData || []).find(a => a.id === ticket.atm_id);
            const matchedEng = (engData || []).find(e => e.id === ticket.assigned_engineer_id);
            return {
              ...ticket,
              banks: matchedBank,
              atms: matchedAtm,
              engineers: matchedEng,
              description: ticket.fault_description // map schema column
            };
          });

          setTickets(enrichedTickets);
          setEngineers(engData || []);
        }
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
                    {ticket.atms?.serial_number || ticket.atms?.atm_serial || 'ATM Terminal'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {ticket.status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-semibold">Bank: {ticket.banks?.name || ticket.banks?.bank_name || 'N/A'}</p>
                <p className="text-xs text-slate-200">{ticket.description}</p>
                <p className="text-[11px] text-slate-400 font-mono">Location: {ticket.atms?.location_details}</p>

                {/* Engineer Assignment Section */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <select
                    className="w-full sm:w-auto flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ticket.assigned_engineer_id || ''}
                    onChange={async (e) => {
                      const selectedEngId = e.target.value;
                      const engineerIdToSave = selectedEngId === '' ? null : selectedEngId;
                      
                      // Update the ticket in Supabase
                      const { error } = await supabase
                        .from('service_tickets')
                        .update({ 
                          assigned_engineer_id: engineerIdToSave, 
                          status: engineerIdToSave ? 'ASSIGNED' : 'PENDING',
                          assigned_at: engineerIdToSave ? new Date().toISOString() : null
                        })
                        .eq('id', ticket.id);

                      if (!error) {
                        const matchedEng = engineers.find(eng => eng.id === engineerIdToSave);
                        // Refresh local state and show feedback message
                        setTickets(tickets.map(t => t.id === ticket.id ? { 
                          ...t, 
                          assigned_engineer_id: engineerIdToSave, 
                          engineers: matchedEng || null,
                          status: engineerIdToSave ? 'ASSIGNED' : 'PENDING' 
                        } : t));
                        setMessage('Engineer assignment successfully updated.');
                      } else {
                        setMessage(`Error assigning engineer: ${error.message}`);
                      }
                    }}
                  >
                    <option value="">-- Select Engineer to Assign --</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.name || eng.full_name || eng.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}