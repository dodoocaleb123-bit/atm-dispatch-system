import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function BankDashboard() {
  const router = useRouter();
  const { slug } = router.query;

  const [bank, setBank] = useState(null);
  const [atms, setAtms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  // Form states restricted strictly to 2 inputs: Selected ATM & Fault Description
  const [selectedAtmId, setSelectedAtmId] = useState('');
  const [faultDescription, setFaultDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!slug) return;

    const loadBankAndData = async () => {
      setLoading(true);
      try {
        // Fetch all banks to match the slug parameter
        const { data: banksData, error: bankErr } = await supabase.from('banks').select('*');
        if (bankErr) throw bankErr;

        const targetSlug = decodeURIComponent(slug).trim().toLowerCase();
        const matchedBank = (banksData || []).find((b) => {
          const bSlug = (b.slug || '').toString().trim().toLowerCase();
          const bCode = (b.code || '').toString().trim().toLowerCase();
          const bAltCode = (b.alt_code || '').toString().trim().toLowerCase();
          const bName = (b.name || b.bank_name || '').toString().trim().toLowerCase();

          return (
            bSlug === targetSlug ||
            bCode === targetSlug ||
            bAltCode === targetSlug ||
            bName.includes(targetSlug)
          );
        });

        if (matchedBank) {
          setBank(matchedBank);

          // Fetch only the ATMs assigned to this bank's ID
          const { data: atmData, error: atmErr } = await supabase
            .from('atms')
            .select('*')
            .eq('bank_id', matchedBank.id);

          if (atmErr) console.error('Error fetching ATMs:', atmErr);
          else setAtms(atmData || []);

          // Fetch reported tickets/faults for this bank's ATMs
          const { data: ticketData, error: ticketErr } = await supabase
            .from('tickets')
            .select('*, atms(*), engineers(*)')
            .eq('bank_id', matchedBank.id);

          if (!ticketErr) setTickets(ticketData || []);
        } else {
          setDebugInfo(`Bank handle "${targetSlug}" does not exist in the database.`);
        }
      } catch (err) {
        setDebugInfo(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadBankAndData();
  }, [slug]);

  // Handle filing a report with just the 2 specified requirements
  const handleFileReport = async (e) => {
    e.preventDefault();
    if (!selectedAtmId || !faultDescription) {
      setMessage('Please select an ATM and enter a fault description.');
      return;
    }

    const { error } = await supabase.from('tickets').insert([
      {
        bank_id: bank.id,
        atm_id: selectedAtmId,
        description: faultDescription,
        status: 'Pending',
      },
    ]);

    if (!error) {
      setMessage('Fault ticket successfully generated and sent to CEO Dispatch!');
      setSelectedAtmId('');
      setFaultDescription('');
      
      // Refresh tickets
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, atms(*), engineers(*)')
        .eq('bank_id', bank.id);
      if (ticketData) setTickets(ticketData);
    } else {
      setMessage(`Error filing report: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 p-8">Loading Bank Portal...</div>;
  }

  if (!bank) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <h1 className="text-xl font-bold text-red-400">Bank Not Found</h1>
        <p className="text-xs text-slate-400 mt-2 font-mono">{debugInfo}</p>
      </div>
    );
  }

  const bankName = bank.name || bank.bank_name || 'Partner Bank';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8 font-sans">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">{bankName} — Portal</h1>
          <p className="text-xs text-slate-400 font-mono">Report ATM faults and track assigned maintenance tickets</p>
        </div>
        <button
          onClick={() => router.push('/bank/login')}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
        >
          Logout
        </button>
      </header>

      {message && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
          {message}
        </div>
      )}

      {/* Streamlined 2-Field Fault Reporting Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">File an ATM Fault Report</h2>
        <form onSubmit={handleFileReport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Select ATM (Assigned to {bankName})
            </label>
            <select
              value={selectedAtmId}
              onChange={(e) => setSelectedAtmId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose an ATM Terminal --</option>
              {atms.map((atm) => (
                <option key={atm.id} value={atm.id}>
                  {atm.atm_serial || `ATM ID: ${atm.id}`} — {atm.location_details}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Fault Description
            </label>
            <textarea
              value={faultDescription}
              onChange={(e) => setFaultDescription(e.target.value)}
              placeholder="Describe the issue (e.g., card reader jammed, cash dispenser error)..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-md"
          >
            Submit Fault Ticket to CEO Dispatch
          </button>
        </form>
      </div>

      {/* Ticket History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Reported Tickets & Status</h2>
        {tickets.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs italic">
            No fault reports have been submitted yet.
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