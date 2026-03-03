import React from 'react';

// Types pour Gantt
interface Shift {
    title: string;
    time: string;
    left: number;
    width: number;
    color: string;
    emergency?: boolean;
}

interface TeamRow {
    name: string;
    team: string;
    shifts: Shift[];
}

const teamsData: TeamRow[] = [
    {
        name: 'Water Maintenance', team: 'Team 01     4 Staff', shifts: [
            { title: 'Main Valve Repair #122', time: '08:30 - 10:00', left: 16, width: 48, color: 'blue' },
            { title: 'Routine Hydrant Flush', time: '13:00 - 15:00', left: 384, width: 64, color: 'emerald' }
        ]
    },
    {
        name: 'Grid Operations', team: 'Team 02     3 Staff', shifts: [
            { title: 'Transformer Check', time: '10:00 - 11:30', left: 200, width: 40, color: 'amber' },
            { title: 'EMERGENCY: Power Line 4', time: '10:30 - 12:00', left: 240, width: 44, color: 'red', emergency: true }
        ]
    },
    { name: 'Gas Safety', team: 'Team 03     2 Staff', shifts: [] },
    {
        name: 'Climate Systems', team: 'Team 04     5 Staff', shifts: [
            { title: 'Filter Replacement', time: '14:00 - 15:30', left: 512, width: 44, color: 'slate' }
        ]
    }
];

export default function GanttChart() {
    return (
        <div className="flex-1 relative overflow-auto scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950/20">
            {/* Time Header */}
            <div className="sticky top-0 z-40 flex bg-slate-900 border-b border-slate-700 shadow-xl w-fit min-w-full">
                <div className="w-48 shrink-0 border-r border-slate-700 p-4 text-xs font-bold uppercase text-slate-500 bg-slate-900 sticky left-0 z-50">
                    Teams / Assets
                </div>
                <div className="flex flex-1">
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                        <div
                            key={time}
                            className={`w-32 flex-none border-r border-slate-800 p-4 text-center text-[11px] font-bold ${time === '10:00' ? 'text-blue-500 bg-blue-500/5' : 'text-slate-500'}`}
                        >
                            {time}
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="relative min-h-full w-fit min-w-full">
                {/* Current Time Indicator */}
                <div className="absolute top-0 bottom-0 left-[304px] w-px bg-blue-500 z-30 shadow-[0_0_8px_rgba(59,130,246,0.5)] pointer-events-none">
                    <div className="absolute -top-1.5 -left-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-blue-500/20"></div>
                </div>

                {/* Team Rows */}
                {teamsData.map((row, idx) => (
                    <div
                        key={idx}
                        className="flex border-b border-slate-800/50 group h-24 hover:bg-slate-800/20 transition-colors w-fit min-w-full"
                    >
                        <div className="w-48 shrink-0 border-r border-slate-700 p-4 sticky left-0 bg-slate-900 z-10 flex flex-col justify-center group-hover:bg-slate-800 transition-colors">
                            <span className="text-sm font-bold text-slate-200">{row.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{row.team}</span>
                        </div>

                        <div className="flex flex-1 relative">
                            {row.shifts.map((shift, shiftIdx) => {
                                // Dynamic colors based on prop
                                const bgClass = shift.emergency ? 'bg-red-600' :
                                    shift.color === 'blue' ? 'bg-blue-600' :
                                        shift.color === 'emerald' ? 'bg-emerald-600' :
                                            shift.color === 'amber' ? 'bg-amber-600' : 'bg-slate-600';

                                const borderClass = shift.emergency ? 'border-red-400' :
                                    shift.color === 'blue' ? 'border-blue-400' :
                                        shift.color === 'emerald' ? 'border-emerald-400' :
                                            shift.color === 'amber' ? 'border-amber-400' : 'border-slate-400';

                                const shadowClass = shift.emergency ? 'shadow-red-500/20' :
                                    shift.color === 'blue' ? 'shadow-blue-500/20' :
                                        shift.color === 'emerald' ? 'shadow-emerald-500/20' :
                                            shift.color === 'amber' ? 'shadow-amber-500/20' : 'shadow-slate-500/20';

                                return (
                                    <div
                                        key={shiftIdx}
                                        className={`absolute top-5 h-14 ${bgClass} border-2 ${borderClass} rounded-xl p-3 flex flex-col justify-center cursor-pointer shadow-lg ${shadowClass} hover:scale-[1.02] transition-transform z-20 ${shift.emergency ? 'border-dashed z-30 shadow-xl' : ''}`}
                                        style={{ left: `${shift.left}px`, width: `${shift.width * 4}px` }}
                                    >
                                        <span className="text-[11px] font-bold text-white truncate">{shift.title}</span>
                                        <span className="text-[10px] text-slate-100/90">{shift.time}</span>
                                    </div>
                                );
                            })}

                            {/* Time slots grid lines */}
                            {[...Array(11)].map((_, i) => (
                                <div key={i} className={`w-32 h-full border-r border-slate-800/30 flex-none ${i === 2 ? 'bg-blue-500/5' : ''}`}></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
