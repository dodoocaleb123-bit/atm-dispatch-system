import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function DynamicBankDashboard() {
  const router = useRouter();
  const { slug } = router.query;

  const [bank, setBank] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadBankData() {
      setLoading(true);

      // Fetch bank profile details by slug
      const { data: bankData, error: bankError } = await supabase
        .from('banks')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bankError || !bankData) {
        console.error('Error loading bank details:', bankError);
        setLoading(false);
        return;
      }

      setBank(bankData);

      // Fetch tickets specifically for this bank
      const { data: ticketData, error: ticketError } = await supabase
        .from('service_tickets')
        .select('*')
        .eq('bank_id', bankData.id)
        .order('created_at', { ascending: false });

      if (!ticketError) {
        setTickets(ticketData || []);
      }

      setLoading(false);
    }

    loadBankData();
  }, [slug]);

  if (loading) return <div className="p-8 text-white">Loading Bank Portal...</div>;
  if (!bank) return <div className="p-8 text-red-500">Bank portal not found or unauthorized access.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-400">{bank.name} Portal</h1>
          <p className="text-slate-400 text-sm">Dedicated Service & Dispatch Hub</p>
        </div>
        <button 
          onClick={() => router.push('/bank/portal')}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition"
        >
          Sign Out
        </button>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-4">Active Service Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <p className="text-slate-500">No active tickets for {bank.name}.</p>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <h3 className="font-bold text-purple-300">{ticket.title || 'ATM Fault Report'}</h3>
                <p className="text-slate-400 text-sm mt-1">{ticket.description}</p>
                <span className="inline-block mt-3 px-2.5 py-1 text-xs bg-purple-950 text-purple-300 border border-purple-800 rounded-md font-medium">
                  Status: {ticket.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}