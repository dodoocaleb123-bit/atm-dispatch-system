import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AddBankModal({ onBankCreated }) {
  const [bankName, setBankName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBank = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create a URL-safe slug from the username or bank name
    const slug = username.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const { data, error } = await supabase.from('banks').insert([
      {
        name: bankName,
        username: username,
        password: password, // Note: In production, consider hashing passwords!
        slug: slug,
      },
    ]);

    if (!error) {
      alert(`Bank account created!\nLogin URL: /bank/${slug}/dashboard`);
      setBankName('');
      setUsername('');
      setPassword('');
      if (onBankCreated) onBankCreated();
    } else {
      alert(`Error creating bank: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleCreateBank} className="space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h3 className="text-lg font-bold text-white">Provision New Bank Account</h3>
      
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Full Bank Name</label>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g., Ecobank Ghana"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Portal Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., ecobank"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assigned Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Set password for bank"
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-xs"
      >
        {loading ? 'Creating Account...' : 'Provision Bank Portal'}
      </button>
    </form>
  );
}