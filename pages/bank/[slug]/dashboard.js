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
    if (!slug) return;

    const fetchBankData = async () => {
      setLoading(true);
      try {
        const formattedSlug = slug.toString().trim().toUpperCase();

        // Case-insensitive check across bank_code, acronym, or slug
        const { data, error } = await supabase
          .from('banks')
          .select('*')
          .or(`bank_code.ilike.${formattedSlug},acronym.ilike.${formattedSlug},slug.ilike.${formattedSlug}`)
          .maybeSingle();

        if (error || !data) {
          setErrorMsg('Bank portal not found or unauthorized access.');
        } else {
          setBank(data);
        }
      } catch (err) {
        setErrorMsg('Failed to load bank dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchBankData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        Loading bank dashboard...
      </div>
    );
  }

  if (errorMsg || !bank) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-red-500 font-medium text-xs">{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">{bank.name || bank.bank_name || bank.bank_code} Portal</h1>
            <p className="text-xs text-slate-400">Bank Code: {bank.bank_code || bank.acronym}</p>
          </div>
          <button
            onClick={() => router.push('/bank/login')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs rounded-xl transition"
          >
            Sign Out
          </button>
        </div>

        {/* Dashboard content goes here */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-300">
            Welcome to the incident management console for {bank.bank_code}.
          </p>
        </div>
      </div>
    </div>
  );
}