'use client'

import DashboardTemplate from '@/components/devops-dashboards/shared/DashboardTemplate'


export default function RateLimitingDashboard() {
  const kpis = [
    {
      title: 'Global RPS',
      value: '12.4k',
      change: '+5.2%',
      trend: 'up' as const,
      icon: 'trending_up',
      iconColor: 'green'
    },
    {
      title: 'Active Throttles',
      value: '3',
      change: 'Stable',
      trend: 'neutral' as const,
      icon: 'warning',
      iconColor: 'amber'
    },
    {
      title: 'Avg Latency',
      value: '42ms',
      change: '-12ms',
      trend: 'down' as const,
      icon: 'timer',
      iconColor: 'primary'
    },
    {
      title: 'Rejected Req.',
      value: '142',
      change: '+0.1%',
      trend: 'up' as const,
      icon: 'block',
      iconColor: 'red'
    }
  ]

  return (
    <DashboardTemplate
      title="Traffic Control"
      icon="traffic"
      kpis={kpis}
    >
      {/* Main Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table */}
        <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
            <h3 className="font-bold text-lg">Resource Variables</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Endpoint Path</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Threshold</th>
                  <th className="px-6 py-4">Burst</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono font-bold text-primary">/api/v2/auth/login</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-1">Identity Service</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold">POST</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">500</span>
                      <span className="text-[10px] text-slate-500">RPS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">1,000</span>
                      <span className="text-[10px] text-slate-500">REQ</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 border-l-4 border-orange-500">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-primary">/api/v2/user/profile/*</span>
                        <span className="material-symbols-outlined text-orange-500 text-sm">bolt</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-1">Core API     Throttling Active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold">GET</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">2,500</span>
                      <span className="text-[10px] text-slate-500">RPS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">5,000</span>
                      <span className="text-[10px] text-slate-500">REQ</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Parameters Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span>
            Global Parameters
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">Default Action</label>
                <span className="material-symbols-outlined text-slate-400 text-sm cursor-help" title="What to do when limit is reached">
                  info
                </span>
              </div>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none">
                <option>429 Too Many Requests</option>
                <option>503 Service Unavailable</option>
                <option>Gradual Latency Delay</option>
                <option>Shadow Log (Dry Run)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Algorithm</label>
              <div className="grid grid-cols-2 gap-2">
                <button className="px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white">
                  Token Bucket
                </button>
                <button className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Sliding Window
                </button>
              </div>
            </div>

            <button className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-bold text-sm transition-colors mt-2">
              Update Configuration
            </button>
          </div>
        </div>
      </section>

      {/* Traffic Simulation */}
      <section className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">play_circle</span>
              Traffic Simulation (Dry Run)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Replay historical traffic against proposed rule changes to visualize impact.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-xs font-bold outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Custom Window</option>
            </select>
            <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all">
              Run Simulation
            </button>
          </div>
        </div>

        <div className="h-48 flex items-end gap-1.5 px-2 relative">
          {/* Bar chart visualization */}
          {[40, 35, 45, 60, 85, 70, 55, 40, 30, 50, 65, 80, 75, 60, 50, 40, 30, 45].map((height, i) => (
            <div
              key={i}
              className={`${i === 4 ? 'bg-red-500/50' : 'bg-primary/20'} w-full rounded-t-sm relative`}
              style={{ height: `${height}%` }}
            >
              {i === 4 && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-[10px] text-white px-1.5 rounded font-bold">
                  Throttled
                </div>
              )}
            </div>
          ))}

          {/* Threshold line */}
          <div className="absolute bottom-[70%] left-0 w-full border-t border-dashed border-red-500/50 z-0">
            <span className="absolute right-0 -top-4 text-[10px] text-red-500 font-bold uppercase tracking-widest">
              Global Threshold (15k RPS)
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>23:59</span>
        </div>
      </section>
    </DashboardTemplate>
  )
}
