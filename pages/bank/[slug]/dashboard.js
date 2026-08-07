import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';

export default function BankDashboard() {
  const router = useRouter();

  // 1. Catch whatever dynamic param Next.js parsed ([id], [slug], or [bank])
  const routeParam = router.query.slug || router.query.id || router.query.bank;

  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Wait until router is ready
    if (!router.isReady) return;

    const targetCode = routeParam ? routeParam.toString().trim() : '';

    if (!targetCode) {
      setDebugInfo('No bank code detected in URL parameter.');
      setLoading(false);
      return;
    }

    const fetchBankData = async () => {
      setLoading(true);

      try {
        // Fetch all banks to ensure match works regardless of database column names
        const { data: banks, error } = await supabase
          .from('banks')
          .select('*');

        if (error) {
          setDebugInfo(`Supabase Error: ${error.message}`);
          setLoading(false);
          return;
        }

        if (!banks || banks.length === 0) {
          setDebugInfo('No bank records found in database (Check Supabase RLS policies).');
          setLoading(false);
          return;
        }

        // Match param against bank_code, acronym, slug, or id
        const matchedBank = banks.find((b) => {
          const code = (b.bank_code || '').toString().toLowerCase();
          const acronym = (b.acronym || '').toString().toLowerCase();
          const slug = (b.slug || '').toString().toLowerCase();
          const id = (b.id || '').toString().toLowerCase();
          const search = targetCode.toLowerCase();

          return code === search || acronym === search || slug === search || id === search;
        });

        if (matchedBank) {
          setBank(matchedBank);
        } else {
          setDebugInfo(`Bank "${targetCode}" not found in database records.`);
        }
      } catch (err) {
        setDebugInfo(`Unexpected error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBankData();
  }, [router.isReady, routeParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs space-y-3">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Loading bank portal...</p>
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
          <p className="text-red-400 text-xs font-mono">{debugInfo}</p>
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

        {/* Dashboard Content */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">Incident & Dispatch Console</h2>
          <p className="text-xs text-slate-400">
            Welcome to the dedicated portal for {bank.name || bank.bank_code}. Active terminal incidents and dispatches will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}