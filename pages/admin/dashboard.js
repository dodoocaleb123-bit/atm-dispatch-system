import Link from 'next/link';

export default function CEODashboard() {
  const managementCards = [
    {
      title: 'Manage Banks',
      description: 'Onboard new partner banks, set login passwords, and manage active client partnerships.',
      icon: '🏛️',
      href: '/admin/banks',
      actionText: 'Open Bank Management →',
      color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30 hover:border-blue-500/60',
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
    {
      title: 'Manage Engineers',
      description: 'Onboard field service engineers, manage login accounts, and update availability status.',
      icon: '👷‍♂️',
      href: '/admin/engineers',
      actionText: 'Open Engineer Management →',
      color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/60',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      title: 'Assign Tasks & Dispatch',
      description: 'Review reported ATM fault tickets, assign qualified field engineers, and track dispatch status.',
      icon: '🎯',
      href: '/admin/dispatch',
      actionText: 'Go to Dispatch Hub →',
      color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30 hover:border-purple-500/60',
      badgeColor: 'bg-purple-500/20 text-purple-300',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20">
              👔
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">CEO Operations Control Center</h1>
              <p className="text-xs text-slate-400">ATM Servicing & Dispatch Enterprise Management</p>
            </div>
          </div>
          
          <Link
            href="/"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            🚪 Logout / Home
          </Link>
        </div>
      </header>

      {/* Main Hub */}
      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back, Executive</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Select a management module below to onboard partners, manage field engineers, or handle dispatch assignments for active ATM incident tickets.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managementCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl bg-gradient-to-br ${card.color} group`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-md">
                    {card.icon}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                    Module {idx + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                <span>{card.actionText}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}