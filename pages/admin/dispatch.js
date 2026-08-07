import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDispatchPage() {
  const [tickets, setTickets] = useState([]);
  const [engineers, setEngineers] = useState([]); // 👈 Live engineers from Supabase
  const [loading, setLoading] = useState(true);
  const [selectedEngineers, setSelectedEngineers] = useState({});

  // 1. Fetch both Tickets and Engineers on load
  const fetchData = async () => {
    setLoading(true);

    // Fetch Tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch Engineers dynamically from DB
    const { data: engineersData, error: engineersError } = await supabase
      .from('engineers')
      .select('*')
      .eq('status', 'ACTIVE'); // Only pull active engineers!

    if (ticketsError) console.error('Error fetching tickets:', ticketsError);
    if (engineersError) console.error('Error fetching engineers:', engineersError);

    setTickets(ticketsData || []);
    setEngineers(engineersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Track selected engineer per ticket row
  const handleSelectChange = (ticketId, engineerCode) => {
    setSelectedEngineers((prev) => ({
      ...prev,
      [ticketId]: engineerCode,
    }));
  };

  // 3. Dispatch Ticket Action
  const handleDispatch = async (ticketId) => {
    const assignedEngineerCode = selectedEngineers[ticketId];

    if (!assignedEngineerCode) {
      alert('Please select an engineer first!');
      return;
    }

    const { error } = await supabase
      .from('tickets')
      .update({
        assigned_engineer: assignedEngineerCode,
        status: 'ASSIGNED',
      })
      .eq('id', ticketId);

    if (error) {
      alert(`Dispatch failed: ${error.message}`);
    } else {
      alert(`Ticket assigned to ${assignedEngineerCode} successfully!`);
      fetchData(); // Refresh ticket list
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Table & Dashboard markup */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">ATM Guard Operations - Dispatch Control</h1>
          <button
            onClick={fetchData}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            ↻ Refresh Stream
          </button>
        </div>

        {/* Tickets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">ATM Serial / ID</th>
                <th className="p-4">Issue Description</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-400">
                    Loading dispatch data...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-slate-500">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-950/50">
                    <td className="p-4 font-mono text-blue-400">{ticket.id.slice(0, 8)}...</td>
                    <td className="p-4">{ticket.description || 'Hardware / Network Fault'}</td>
                    <td className="p-4 font-bold text-red-400">{ticket.priority || 'CRITICAL'}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center space-x-2">
                      {/* DYNAMIC ENGINEER SELECT DROPDOWN */}
                      <select
                        value={selectedEngineers[ticket.id] || ticket.assigned_engineer || ''}
                        onChange={(e) => handleSelectChange(ticket.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Assign Engineer</option>

                        {/* Maps directly through real database engineers */}
                        {engineers.map((eng) => (
                          <option key={eng.id} value={eng.engineer_code}>
                            {eng.name} ({eng.engineer_code})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleDispatch(ticket.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg font-bold text-xs transition"
                      >
                        Dispatch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}