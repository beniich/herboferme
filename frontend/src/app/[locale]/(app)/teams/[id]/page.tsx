'use client';

import Link from 'next/link';

export default function TeamDetailsPage() {
    // Dans une vraie application, on utiliserait params.id pour fetcher les donn  es

    return (
        <div className="flex flex-col max-w-[1200px] mx-auto gap-8 p-6 lg:px-40 py-8">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Link href="/teams" className="hover:text-primary">Teams</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">Team Alpha-01 Details</span>
            </div>

            <div className="flex flex-wrap justify-between items-end gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Team Alpha-01</h1>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Lead: Sarah Jenkins     ID: TECH-7729     Field Operations</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 h-11 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit Profile
                    </button>
                    <button className="flex items-center gap-2 px-6 h-11 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-lg">assignment_add</span>
                        Assign New Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Success Rate</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">98.4%</p>
                        <span className="text-emerald-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs">arrow_upward</span> 2.1%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '98%' }}></div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg Response Time</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">4.2h</p>
                        <span className="text-orange-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs">arrow_downward</span> 0.5h
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                        <div className="bg-orange-500 h-full" style={{ width: '65%' }}></div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Interventions</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-3xl font-bold">1,240</p>
                        <span className="text-emerald-500 text-sm font-bold flex items-center">
                            <span className="material-symbols-outlined text-xs">trending_up</span> 12%
                        </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                        <div className="flex-1 h-2 rounded-full bg-primary/20"></div>
                        <div className="flex-1 h-2 rounded-full bg-primary/40"></div>
                        <div className="flex-1 h-2 rounded-full bg-primary/60"></div>
                        <div className="flex-1 h-2 rounded-full bg-primary"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Team Members</h3>
                            <span className="text-primary text-xs font-bold uppercase cursor-pointer hover:underline">Manage</span>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBd4SPDjHPKonfsQnzJo_RSGIoiE_o4OqldFL9QlXIuKOV9ShkrZ8skNye0HD8KAaevWeKZLJAvPYm0FIQp_5jcZdmggfy4KX9_YKcXetRH8fXERbKm3Fs7cRaG2n7hsemsmjKrtavJYy1H5YYzH-WYCoPVsbrrkEyRmfoFtIzpVEGgkFcd7Pn3XswGw5ig2JHeRVOrKKCbTEIToDtlyqI5zuybHaildCCNvaBHckqr_h-trbjxIK-RYKV4ALfRG2fWYuLvz4m2o0vE')" }}></div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-900 dark:text-white font-bold text-sm">Sarah Jenkins</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Team Lead     Specialized</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-xl">chat</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAv-gfOLgKPQPqtp07cu67naw6VXbJP4C6sxcM98emzkVBI_y0DRokNb5Kn0R6AEfVbgDSBHTNa4uecEd3uNJhTpYiZmwDEJYxWZAWhLrJIyn7Kkyyy5NDgzHDHF-k19PTL_V5PklFx3QV7AwhXh1zCxAIZ14N7i5RjJYc74ffCbyJT9536xsXDWTA2TAEObOpX_fR68NgHIxQmZE8Qiu27z_A2SUpq_2OOLYDPJw32q-Z0CL66XRc3S2kL2nN_FsHqEUKPArV-NUOv')" }}></div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-900 dark:text-white font-bold text-sm">David Chen</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Senior Technician</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-xl">chat</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-1o0neeIm5ZZgPNHD_ILyANyhDT8K7AXSaYEPWUc1SoLjbCTFGXB13Zypgi9xzCFxeTLC9-fwQbnPqrE8rAq7sSiHxRT4sX63rDmZUE6d8QR_impEUzSnCo3JwT_QTF0AcsY1nhHECNC-Hz72xJ1tQcGlUXihit_1EdSibZSMRhUjISBq1REmpx6oT0vQQE2eI6pwgSmehybU_AJPBkFdbNFLy5h3Xzpe2dBHCLcu1B-Rdff6kvUY6_lCZOra2ktmLXarRsulOmPp')" }}></div>
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-slate-300 rounded-full border-2 border-white dark:border-slate-900"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-900 dark:text-white font-bold text-sm">Alex Rivera</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">Assistant Technician</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary transition-all">
                                    <span className="material-symbols-outlined text-xl">chat</span>
                                </button>
                            </div>
                        </div>
                        <button className="w-full py-4 text-center text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800">
                            View Full Contact Details
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Activity Trend</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Mon</span>
                                <div className="flex-1 mx-4 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                                </div>
                                <span className="text-xs font-bold w-6">12</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Tue</span>
                                <div className="flex-1 mx-4 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: '65%' }}></div>
                                </div>
                                <span className="text-xs font-bold w-6">08</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Wed</span>
                                <div className="flex-1 mx-4 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: '95%' }}></div>
                                </div>
                                <span className="text-xs font-bold w-6">15</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Thu</span>
                                <div className="flex-1 mx-4 h-6 bg-slate-100 dark:bg-slate-800 rounded flex items-center overflow-hidden">
                                    <div className="bg-primary h-full" style={{ width: '40%' }}></div>
                                </div>
                                <span className="text-xs font-bold w-6">04</span>
                            </div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest pt-2 text-center">Interventions Completed Per Day</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
                        <div className="px-6 pt-6 flex flex-wrap justify-between items-center gap-4">
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Intervention History</h3>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button className="px-4 py-1.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md text-sm font-bold shadow-sm">All</button>
                                <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white">Pending</button>
                                <button className="px-4 py-1.5 text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white">Completed</button>
                            </div>
                        </div>
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                        <th className="pb-4 font-bold">ID & Category</th>
                                        <th className="pb-4 font-bold">Location</th>
                                        <th className="pb-4 font-bold">Date</th>
                                        <th className="pb-4 font-bold">Priority</th>
                                        <th className="pb-4 font-bold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4">
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">#TS-9021</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Electrical Repair</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                Chicago Central
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">Oct 24, 2023</td>
                                        <td className="py-4">
                                            <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-black uppercase rounded">Critical</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                                                <span className="h-2 w-2 bg-slate-300 rounded-full"></span> Pending
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4">
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">#TS-8944</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Network Setup</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                North Side Park
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">Oct 23, 2023</td>
                                        <td className="py-4">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase rounded">Normal</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                                                <span className="h-2 w-2 bg-emerald-500 rounded-full"></span> Completed
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4">
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">#TS-8821</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs">HVAC Maintenance</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                South Shore
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">Oct 22, 2023</td>
                                        <td className="py-4">
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-black uppercase rounded">High</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                                                <span className="h-2 w-2 bg-emerald-500 rounded-full"></span> Completed
                                            </span>
                                        </td>
                                    </tr>
                                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4">
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">#TS-8750</p>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs">Fiber Inspection</p>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                Loop District
                                            </div>
                                        </td>
                                        <td className="py-4 text-slate-600 dark:text-slate-300 text-sm">Oct 21, 2023</td>
                                        <td className="py-4">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase rounded">Normal</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                                                <span className="h-2 w-2 bg-emerald-500 rounded-full"></span> Completed
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                View All Interventions
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
