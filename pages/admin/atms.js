import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AdminAtmManagement() {
  const router = useRouter();
  const [banks, setBanks] = useState([]);
  const [atms, setAtms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected bank for focused detailed view
  const [selectedBank, setSelectedBank] = useState(null);

  // Form states for adding a new ATM within the focused bank view
  const [locationDetails, setLocationDetails] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bankData, error: bankError } = await supabase.from('banks').select('*');
      if (bankError) console.error('Error fetching banks:', bankError);
      else setBanks(bankData || []);

      const { data: atmData, error: atmError } = await supabase.from('atms').select('*');
      if (atmError) console.error('Error fetching ATMs:', atmError);
      else setAtms(atmData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      const updated = banks.find((b) => b.id === selectedBank.id);
      if (updated) setSelectedBank(updated);
    }
  }, [banks]);

  const handleAddAtm = async (e) => {
    e.preventDefault();
    if (!selectedBank || !locationDetails) {
      setMessage('Please enter location details.');
      return;
    }

    const { error } = await supabase.from('atms').insert([
      {
        bank_id: selectedBank.id,
        location_details: locationDetails,
      },
    ]);

    if (!error) {
      setMessage('ATM successfully created and assigned to this bank.');
      setLocationDetails('');
      fetchData();
    } else {
      setMessage(`Error adding ATM: ${error.message}`);
    }
  };

  const handleRemoveAtm = async (atmId) => {
    if (!confirm('Are you sure you want to remove this ATM?')) return;

    const { error } = await supabase.from('atms').delete().eq('id', atmId);
    if (!error) {
      setMessage('ATM removed successfully.');
      fetchData();
    } else {
      setMessage(`Error removing ATM: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 p-8">Loading ATM Infrastructure...</div>;
  }

  if (selectedBank) {
    const bankAtms = atms.filter((a) => a.bank_id === selectedBank.id);
    const bankName = selectedBank.name || selectedBank.bank_name || 'Bank Details';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8 font-sans">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <button
              onClick={() => { setSelectedBank(null); setMessage(''); }}
              className="text-xs text-blue-400 hover:text-blue-300 font-mono mb-2 inline-block"
            >
              ← Back to All Registered Banks
            </button>
            <h1 className="text-xl font-bold text-white">{bankName} — Terminal Management</h1>
            <p className="text-xs text-slate-400 font-mono">Manage and provision ATMs specifically for this institution</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
            >
              Admin Dashboard
            </button>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl font-mono">
              {bankAtms.length} Active Terminal{bankAtms.length === 1 ? '' : 's'}
            </span>
          </div>
        </header>

        {message && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Add New ATM to {bankName}</h2>
          <form onSubmit={handleAddAtm} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Geographic Location</label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g., Central Branch, Main Hall"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition"
              >
                Provision ATM
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Assigned ATMs</h2>
          {bankAtms.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs italic">
              No ATMs are currently assigned to {bankName}. Use the form above to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAtms.map((atm) => (
                <div key={atm.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {atm.atm_serial}
                    </span>
                    <p className="text-xs text-slate-200 font-medium pt-2">{atm.location_details}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAtm(atm.id)}
                    className="w-full text-xs text-red-400 hover:text-red-300 font-mono bg-red-500/10 hover:bg-red-500/20 py-2 rounded-lg border border-red-500/20 transition"
                  >
                    Remove ATM
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-8 font-sans">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bank & ATM Infrastructure Management</h1>
          <p className="text-xs text-slate-400 font-mono">Select a registered bank below to view, add, or remove its assigned ATMs</p>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono transition"
        >
          Admin Dashboard
        </button>
      </header>

      {message && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium">
          {message}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Registered Banks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks.map((bank) => {
            const bankName = bank.name || bank.bank_name || 'Unnamed Bank';
            const bankAtms = atms.filter((a) => a.bank_id === bank.id);

            return (
              <div
                key={bank.id}
                onClick={() => { setSelectedBank(bank); setMessage(''); }}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-6 space-y-4 cursor-pointer transition shadow-lg group"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center font-bold text-base group-hover:bg-blue-600 group-hover:text-white transition">
                    {bankName.charAt(0)}
                  </div>
                  <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
                    {bankAtms.length} ATM{bankAtms.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition">{bankName}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Click to manage assigned ATMs →</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}