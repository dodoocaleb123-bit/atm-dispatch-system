<div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-lg">
  <h2 className="text-base font-bold text-white">Log New ATM Fault Report</h2>
  <form onSubmit={handleSubmitTicket} className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          ATM ID / Serial Number
        </label>
        <select
          value={selectedAtm}
          onChange={(e) => setSelectedAtm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          required
        >
          <option value="">-- Choose an ATM Terminal --</option>
          {atms.map((atm) => (
            <option key={atm.id} value={atm.id}>
              {atm.serial_number || atm.atm_serial || `ATM ID: ${atm.id}`} {atm.location_details ? `— ${atm.location_details}` : ''}
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