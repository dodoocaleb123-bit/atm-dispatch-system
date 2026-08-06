import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 font-sans">
      {/* Header Badge */}
      <div className="pt-8 text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto shadow-xl shadow-blue-500/10 border border-slate-700">
          🏧
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">ATM Service & Dispatch Console</h1>
        <p className="text-xs text-slate-400">Select your account type to access your portal</p>
      </div>

      {/* Main Role Selector */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Sign in as
        </h2>

        <div className="space-y-4">
          {/* Bank Login Card */}
          <Link
            href="/bank/login"
            className="group flex items-center justify-between p-4 bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition duration-200 shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center text-xl font-bold border border-blue-500/20 group-hover:scale-105 transition-transform">
                🏛️
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">A Bank</h3>
                <p className="text-[11px] text-slate-400">Log fault reports & track status</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-blue-400 transition-colors font-semibold text-sm">→</span>
          </Link>

          {/* Engineer Login Card */}
          <Link
            href="/engineer/login"
            className="group flex items-center justify-between p-4 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition duration-200 shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-emerald-600/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-bold border border-emerald-500/20 group-hover:scale-105 transition-transform">
                👷‍♂️
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">An Engineer</h3>
                <p className="text-[11px] text-slate-400">View assigned tasks & resolve tickets</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-emerald-400 transition-colors font-semibold text-sm">→</span>
          </Link>
        </div>

        {/* CEO Option */}
        <div className="pt-4 border-t border-slate-800/80 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center text-xs text-slate-400 hover:text-purple-400 font-medium transition space-x-1 py-1 px-3 rounded-lg hover:bg-slate-800/60"
          >
            <span>👔</span>
            <span>I am the CEO</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-4 text-center">
        <p className="text-[11px] text-slate-600">
          ATM Servicing & Dispatch Management System • Built with Next.js & Supabase
        </p>
      </footer>
    </div>
  );
}