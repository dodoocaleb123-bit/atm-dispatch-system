import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function BankDashboard() {
  const router = useRouter();
  const { slug } = router.query;

  const [bank, setBank] = useState(null);
  const [atms, setAtms] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedAtm, setSelectedAtm] = useState('');
  const [priority, setPriority] = useState('CRITICAL');
  const [faultDescription, setFaultDescription] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const fetchDashboardData = async (currentBank) => {
    try {
      const bankCode = currentBank.bank_code || currentBank.slug || slug;

      // 1. Fetch ATMs associated with this bank
      const { data: atmData, error: atmError } = await supabase.from('atms').select('*');
      if (atmError) console.error('ATM Fetch Error:', atmError.message);

      const bankAtms = (atmData || []).filter(a => 
        (a.bank_code && a.bank_code.toString().toLowerCase() === bankCode.toLowerCase()) ||
        a.bank_id === currentBank.id
      );
      setAtms(bankAtms);

      const atmSerials = bankAtms.map(a => a.serial_number || a.atm_serial || a.id);

      // 2. Fetch service tickets for this bank
      const { data: ticketData, error: ticketError } = await supabase
        .from('service_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketError) console.error('Ticket Fetch Error:', ticketError.message);

      const bankTickets = (ticketData || []).filter(t => 
        (t.bank_code && t.bank_code.toString().toLowerCase() === bankCode.toLowerCase()) ||
        t.bank_id === currentBank.id ||
        atmSerials.includes(t.atm_serial) ||
        atmSerials.includes(t.atm_id)
      );

      setTickets(bankTickets);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const targetSlug = slug ? slug.toString().trim().toLowerCase() : '';

    if (!targetSlug) {
      setDebugInfo('No bank route identifier found.');
      setLoading(false);
      return;
    }

    const loadBankBySlug = async () => {
      setLoading(true);
      try {
        // Fetch all banks and safely match in JS to avoid any column filter errors
        const { data: banks, error } = await supabase.from('banks').select('*');

        if (error) {
          setDebugInfo(`Database query error: ${error.message}`);
          setLoading(false);
          return;
        }

        const matchedBank = (banks || []).find(b => {
          const bSlug = (b.slug || '').toString().toLowerCase();
          const bCode = (b.bank_code || '').toString().toLowerCase();
          return bSlug === targetSlug || bCode === targetSlug;
        });

        if (matchedBank) {
          setBank(matchedBank);
          await fetchDashboardData(matchedBank);
        } else {
          setDebugInfo(`Bank handle "${targetSlug}" does not exist.`);
        }
      } catch (err) {
        setDebugInfo(`Initialization error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadBankBySlug();
  }, [router.isReady, slug]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!bank) return;
    setLoading(true);
    setMessage('');

    const bankCode = bank.bank_code || bank.slug || slug;

    const { error } = await supabase.from('service_tickets').insert([
      {
        bank_code: bankCode,
        bank_id: bank.id,
        atm_id: selectedAtm,
        atm_serial: selectedAtm,
        issue_description: faultDescription,
        priority: priority,
        status: 'PENDING',
      },
    ]);

    setLoading(false);

    if (!error) {
      setMessage('Fault ticket successfully filed.');
      setFaultDescription('');
      setSelectedAtm('');
      fetchDashboardData(bank);
    } else {
      setMessage(`Submission error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs space-y-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Authenticating bank portal...</p>
      </div>
    );
  }

  if (debugInfo || !bank) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-center mx-auto text-lg">
            ⚠️
          </div>
          <p className="text-red-400 text-xs font-mono">{debugInfo || 'Portal access restricted.'}</p>
          <button
            onClick={() => router.push('/bank/login')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const bankName = bank.name || bank.bank_name || bank.bank_code || 'Bank';
  const pendingCount = tickets.filter((t) => t.status === 'PENDING').length;
  const completedCount = tickets.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/20">
              {bankName.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight text-white">{bankName} Portal</h1>
              <p className="text-xs text-slate-400 font-mono">Secure Terminal Management Console</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/bank/login')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned Terminals</p>
            <p className="text-2xl font-bold text-white mt-1">{atms.length}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Pending Incidents</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Resolved Faults</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
          <h2 className="text-base font-bold text-white">Log New ATM Fault Report</h2>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Affected ATM
                </label>
                <select
                  value={selectedAtm}
                  onChange={(e) => setSelectedAtm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                >
                  <option value="" disabled>Choose an ATM Unit...</option>
                  {atms.map((atm) => (
                    <option key={atm.id} value={atm.serial_number || atm.atm_serial || atm.id}>
                      {atm.serial_number || atm.atm_serial} — {atm.location_details || 'Branch Unit'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="CRITICAL">🔴 Critical (Total System Down / Out of Cash)</option>
                  <option value="HIGH">🟠 High (Card Reader / Cash Dispenser Issue)</option>
                  <option value="MEDIUM">🟡 Medium (Receipt Printer Out of Paper)</option>
                  <option value="LOW">🟢 Low (Minor Cosmetic / Screen Touch Issue)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Fault Description
              </label>
              <textarea
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows="3"
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Fault Ticket to Dispatch'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-white">{bankName} Service Tickets</h2>
            <button
              onClick={() => fetchDashboardData(bank)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              🔄 Refresh Status
            </button>
          </div>

          {tickets.length === 0 ? (
            <p className="p-6 text-slate-500 text-xs">No service tickets recorded for this bank.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                    <th className="p-4">ATM Serial</th>
                    <th className="p-4">Fault Description</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Logged Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono font-semibold text-blue-400">
                        {t.atm_serial || t.atm_id || 'Terminal'}
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