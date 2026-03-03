'use client'

import Link from 'next/link'

export default function TeamsPage() {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Sidebar */}
            <aside className="w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">engineering</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-sm leading-tight">
                            Intervention
                            <br />
                            System
                        </h1>
                        <p className="text-xs text-slate-500">Admin Portal</p>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link
                        href="/admin/devops"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">report_problem</span>
                        <span className="text-sm font-medium">Complaints</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">construction</span>
                        <span className="text-sm font-medium">Interventions</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">groups</span>
                        <span className="text-sm font-medium">Technical Teams</span>
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">bar_chart</span>
                        <span className="text-sm font-medium">Reports</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Marcus Chen</p>
                            <p className="text-xs text-slate-500 truncate">Senior Dispatcher</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 cursor-pointer">settings</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold dark:text-white">Technical Teams Directory</h2>
                        <div className="relative w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                                placeholder="Search teams, ID, or specialty..."
                                type="text"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        <Link
                            href="/admin/devops"
                            className="size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">home</span>
                        </Link>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 transition-colors">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Team
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Teams</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold dark:text-white">24</span>
                                <span className="text-xs font-semibold text-emerald-500">+1 this month</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Available Now</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-emerald-600">14</span>
                                <span className="text-xs font-semibold text-slate-400">58% capacity</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Interventions</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">8</span>
                                <span className="text-xs font-semibold text-amber-500">2 priority</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Average Response</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-3xl font-bold dark:text-white">42m</span>
                                <span className="text-xs font-semibold text-emerald-500">    4% vs prev week</span>
                            </div>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white">
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                All Specialties
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white">
                                <span className="material-symbols-outlined text-lg">radio_button_checked</span>
                                Status: Any
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">Showing 24 technical teams</p>
                    </div>

                    {/* Teams Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Team Card 1 */}
                        <TeamCard
                            name="Equipe Eau 01"
                            specialty="Water & Plumbing Specialty"
                            icon="water_drop"
                            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                            iconColor="text-emerald-600"
                            status="Available"
                            statusBg="bg-emerald-100 dark:bg-emerald-900/30"
                            statusColor="text-emerald-700 dark:text-emerald-400"
                            members={4}
                            vehicle="VH-2024-X1"
                        />

                        {/* Team Card 2 */}
                        <TeamCard
                            name="Equipe Elec 04"
                            specialty="Electrical & Grid Systems"
                            icon="bolt"
                            iconBg="bg-primary/10"
                            iconColor="text-primary"
                            status="Busy"
                            statusBg="bg-amber-100 dark:bg-amber-900/30"
                            statusColor="text-amber-700 dark:text-amber-400"
                            members={3}
                            vehicle="VH-2022-E9"
                        />

                        {/* Team Card 3 */}
                        <TeamCard
                            name="Equipe Plomb 02"
                            specialty="Emergency Plumbing Repairs"
                            icon="plumbing"
                            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                            iconColor="text-emerald-600"
                            status="Available"
                            statusBg="bg-emerald-100 dark:bg-emerald-900/30"
                            statusColor="text-emerald-700 dark:text-emerald-400"
                            members={2}
                            vehicle="VH-2023-P2"
                        />

                        {/* Team Card 4 */}
                        <TeamCard
                            name="Equipe Maintenance 01"
                            specialty="General Facility Maintenance"
                            icon="settings_suggest"
                            iconBg="bg-slate-100 dark:bg-slate-800"
                            iconColor="text-slate-600 dark:text-slate-400"
                            status="Busy"
                            statusBg="bg-amber-100 dark:bg-amber-900/30"
                            statusColor="text-amber-700 dark:text-amber-400"
                            members={5}
                            vehicle="VH-2024-M5"
                        />
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center py-6">
                        <button className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-white">
                            Load More Teams
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

function TeamCard({
    name,
    specialty,
    icon,
    iconBg,
    iconColor,
    status,
    statusBg,
    statusColor,
    members,
    vehicle,
}: {
    name: string
    specialty: string
    icon: string
    iconBg: string
    iconColor: string
    status: string
    statusBg: string
    statusColor: string
    members: number
    vehicle: string
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className={`size-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBg} ${statusColor} flex items-center gap-1`}
                    >
                        <span className="size-1.5 rounded-full bg-current"></span>
                        {status}
                    </span>
                </div>
                <h3 className="font-bold text-lg mb-1 dark:text-white">{name}</h3>
                <p className="text-xs text-slate-500 mb-4">{specialty}</p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-sm">group</span>
                            <span className="text-xs font-medium">{members} Members</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                        <span className="text-xs font-medium uppercase">{vehicle}</span>
                    </div>
                </div>
            </div>
            <div className="px-5 pb-5 mt-auto">
                <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                    View Schedule
                </button>
            </div>
        </div>
    )
}
