import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function BankDashboard() {
  const router = useRouter();
  const { slug } = router.query;

  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // 1. Wait until Next.js router has finished initializing query parameters
    if (!router.isReady || !slug) return;

    const fetchBankData = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const formattedSlug = slug.toString().trim();

        // 2. Fetch all banks to ensure a fail-safe match in JavaScript
        const { data: banks, error } = await supabase
          .from('banks')
          .select('*');

        if (error || !banks || banks.length === 0) {
          setErrorMsg('Failed to connect to banks database.');
          return;
        }

        // 3. Match slug against bank_code, acronym, slug, or name (case-insensitive)
        const matchedBank = banks.find((b) => {
          const code = (b.bank_code || '').toString().toLowerCase();
          const acronym = (b.acronym || '').toString().toLowerCase();
          const bankSlug = (b.slug || '').toString().toLowerCase();
          const target = formattedSlug.toLowerCase();

          return code === target || acronym === target || bankSlug === target;
        });

        if (matchedBank) {
          setBank(matchedBank);
        } else {
          setErrorMsg(`Bank portal "${formattedSlug}" not found in database.`);
        }
      } catch (err) {
        setErrorMsg('Error loading dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBankData();
  }, [router.isReady, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading portal...</p>
      </div>
    );
  }

  if (errorMsg || !bank) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="text-red-400 text-xs font-mono">{errorMsg}</div>
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">
              🏛️
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {bank.name || bank.bank_name || bank.bank_code || 'Bank'} Portal
              </h1>
              <p className="text-xs text-slate-400">
                Code: <span className="font-mono text-blue-400">{bank.bank_code || bank.acronym}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/bank/login')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl transition"
          >
            Sign Out
          </button>
        </div>

        {/* Console Box */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Incident & Dispatch Console</h2>
          <p className="text-xs text-slate-400">
            Welcome to the dedicated portal for {bank.name || bank.bank_code}. You can monitor active ATM terminal tickets and dispatches here.
          </p>
        </div>
      </div>
    </div>
  );
}