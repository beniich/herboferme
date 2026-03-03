import Link from 'next/link';

const services = [
    { name: 'Claims Engine API', status: 'operational', uptime: '99.99%', ping: '24ms' },
    { name: 'Core Dashboard Web', status: 'operational', uptime: '99.95%', ping: '42ms' },
    { name: 'Notification Hub', status: 'operational', uptime: '99.9%', ping: '110ms' },
    { name: 'Geospatial Intel', status: 'degraded', uptime: '97.2%', ping: '450ms' },
    { name: 'Analytics Pipeline', status: 'operational', uptime: '99.8%', ping: '85ms' },
    { name: 'OAuth Core / SSO', status: 'operational', uptime: '100%', ping: '12ms' },
    { name: 'Real-time WebSockets', status: 'maintenance', uptime: '   ', ping: '   ' },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    operational: { label: 'Operational', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_10px_#10b981]' },
    degraded: { label: 'Degraded', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' },
    maintenance: { label: 'Maintenance', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' },
    outage: { label: 'Critical Outage', color: 'text-red-500 bg-red-500/10 border-red-500/20', dot: 'bg-red-500 shadow-[0_0_10px_#ef4444]' },
};

const incidents = [
    { date: 'Feb 18, 2026', title: 'Latency variance in Global Claims API', status: 'Resolved', duration: '47 min', severity: 'minor' },
    { date: 'Feb 10, 2026', title: 'Partial outage in Geospatial visualization nodes', status: 'In Progress', duration: 'Ongoing', severity: 'major' },
    { date: 'Jan 30, 2026', title: 'PDF Analytics export delay', status: 'Resolved', duration: '12 min', severity: 'minor' },
];

export default function StatusPage() {
    const allOperational = services.every(s => s.status === 'operational');

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col selection:bg-primary/30">
            {/* Sticky Navigation */}
            <header className="fixed top-0 w-full z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl font-variation-fill">track_changes</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">ReclamTrack <span className="text-primary text-primary">Pro</span></h1>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-primary/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status Feed</span>
                        </div>
                        <Link href="/help" className="text-xs font-bold hover:text-primary transition-colors">Support Center</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto px-6 pt-32 pb-24 w-full">
                {/* Status Hero Card */}
                <section className="relative mb-16 rounded-[40px] overflow-hidden bg-slate-900 dark:bg-black p-12 text-center border border-white/10">
                    <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,#ec5b13_0%,transparent_50%)]"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                            <span className={`material-symbols-outlined text-4xl ${allOperational ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {allOperational ? 'verified_user' : 'warning'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
                            {allOperational ? 'All Systems Operational' : 'Partial Service Degraded'}
                        </h1>
                        <p className="text-slate-400 font-light max-w-xl mx-auto mb-8">
                            Real-time health of the ReclamTrack Pro ecosystem. Monitoring globally across 24 regional edge nodes.
                        </p>
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-xl">
                            Verified as of {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} GMT
                        </div>
                    </div>
                </section>

                {/* Service Grid */}
                <section className="mb-20">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-2">Network Health</h2>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">Active Components</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-400 hidden sm:block uppercase tracking-widest">Global Load Balancers: <span className="text-emerald-500 font-black tracking-normal">Online</span></p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((svc, i) => {
                            const cfg = statusConfig[svc.status];
                            return (
                                <div key={i} className="group bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className={`w-3 h-3 rounded-full ${cfg.dot} ${svc.status === 'operational' ? 'animate-[pulse_1.5s_infinite]' : ''}`}></div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cfg.color}`}>
                                            {cfg.label}
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black mb-4 group-hover:text-primary transition-colors leading-tight">{svc.name}</h4>
                                    <div className="flex items-center justify-between pt-6 border-t border-primary/5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>Uptime: <span className="text-slate-900 dark:text-white font-black tracking-normal">{svc.uptime}</span></span>
                                        <span>Ping: <span className="text-slate-900 dark:text-white font-black tracking-normal">{svc.ping}</span></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Uptime Insight */}
                <section className="mb-20">
                    <div className="mb-10">
                        <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-2">Historical Pulse</h2>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">Uptime Insight (90 Days)</h3>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
                        <div className="flex gap-1 mb-8 h-12 items-end">
                            {Array.from({ length: 90 }).map((_, i) => {
                                const hasIssue = [18, 45, 71].includes(i);
                                return (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-sm transition-all cursor-crosshair ${hasIssue ? 'bg-amber-500 h-6 hover:h-12' : 'bg-emerald-500 h-10 hover:h-12 opacity-80'}`}
                                        title={hasIssue ? `Incident ${90-i} days ago` : 'Operational'}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Q4 Analysis Phase</span>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div> Stable</span>
                                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Degraded</span>
                            </div>
                            <span>Current Cycle</span>
                        </div>
                    </div>
                </section>

                {/* Incident Records */}
                <section>
                    <div className="mb-10">
                        <h2 className="text-primary font-black text-xs uppercase tracking-widest mb-2">Mission Logs</h2>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white">Incident History</h3>
                    </div>

                    <div className="space-y-4">
                        {incidents.map((inc, i) => (
                            <div key={i} className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-background-light dark:bg-white/5 border border-primary/5 rounded-3xl p-8 hover:border-primary/20 transition-all">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${inc.severity === 'major' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {inc.severity} Severity
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-primary/10 pl-3">{inc.date}</span>
                                    </div>
                                    <h4 className="text-lg font-black">{inc.title}</h4>
                                    <p className="text-sm font-light text-slate-500 dark:text-slate-400">Resolution Timeframe: {inc.duration}</p>
                                </div>
                                <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${inc.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-blue-500/10 border-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-sm">{inc.status === 'Resolved' ? 'done_all' : 'pending'}</span>
                                    {inc.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-black/40 py-16 border-t border-primary/10 mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">   {new Date().getFullYear()} ReclamTrack Pro. Stability is our standard.</p>
                </div>
            </footer>
        </div>
    );
}
