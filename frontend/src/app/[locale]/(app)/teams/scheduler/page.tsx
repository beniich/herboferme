
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Users,
    AlertCircle,
    Trash2,
    Copy,
    Download,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface ShiftType {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
    requiredStaff: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    skills: string[];
    avatar?: string;
}

interface ShiftAssignment {
    id: string;
    memberId: string;
    shiftId: string;
    date: Date;
    status: 'scheduled' | 'confirmed' | 'absent' | 'replaced';
}

const SHIFT_TYPES: ShiftType[] = [
    {
        id: 'morning',
        name: 'Matin',
        startTime: '08:00',
        endTime: '16:00',
        color: '#3b82f6',
        requiredStaff: 3,
    },
    {
        id: 'afternoon',
        name: 'Apr  s-midi',
        startTime: '14:00',
        endTime: '22:00',
        color: '#f59e0b',
        requiredStaff: 3,
    },
    {
        id: 'night',
        name: 'Nuit',
        startTime: '22:00',
        endTime: '08:00',
        color: '#8b5cf6',
        requiredStaff: 2,
    },
    {
        id: 'oncall',
        name: 'Garde',
        startTime: '00:00',
        endTime: '23:59',
        color: '#ef4444',
        requiredStaff: 1,
    },
];

export default function TeamShiftSchedulerPage() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    // const [selectedTeam, setSelectedTeam] = useState<string>('team-1');
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [selectedCell, setSelectedCell] = useState<{
        date: Date;
        shiftId: string;
    } | null>(null);

    // G  n  rer les dates de la semaine
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Membres d'  quipe factices
    const teamMembers: TeamMember[] = [
        {
            id: 'm1',
            name: 'Mohammed Ali',
            role: 'Chef d\'  quipe',
            skills: ['plomberie', '  lectricit  '],
        },
        {
            id: 'm2',
            name: 'Fatima Zahra',
            role: 'Technicien',
            skills: ['plomberie'],
        },
        {
            id: 'm3',
            name: 'Youssef Bennis',
            role: 'Technicien',
            skills: ['  lectricit  ', '  clairage'],
        },
        {
            id: 'm4',
            name: 'Salma Idrissi',
            role: 'Technicien',
            skills: ['routes', 'signalisation'],
        },
    ];

    // Obtenir les assignations pour une cellule
    const getAssignments = (date: Date, shiftId: string) => {
        return assignments.filter(
            (a) =>
                format(a.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
                a.shiftId === shiftId
        );
    };

    // Assigner un membre    un shift
    const assignMember = (memberId: string, date: Date, shiftId: string) => {
        // V  rifier si le membre n'est pas d  j   assign   ce jour
        const existingAssignments = assignments.filter(
            (a) => a.memberId === memberId && format(a.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );

        if (existingAssignments.length > 0) {
            toast.error('Ce membre est d  j   assign      un autre shift ce jour-l  ');
            return;
        }

        const newAssignment: ShiftAssignment = {
            id: `a-${Date.now()}`,
            memberId,
            shiftId,
            date,
            status: 'scheduled',
        };

        setAssignments([...assignments, newAssignment]);
        toast.success('Membre assign   avec succ  s');
        setSelectedCell(null);
    };

    // Retirer une assignation
    const removeAssignment = (assignmentId: string) => {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
        toast.success('Assignation supprim  e');
    };

    // Copier le planning de la semaine
    const duplicateWeek = () => {
        const nextWeekStart = addDays(weekStart, 7);

        const newAssignments = assignments.map((assignment) => ({
            ...assignment,
            id: `a-${Date.now()}-${Math.random()}`,
            date: addDays(assignment.date, 7),
        }));

        setAssignments([...assignments, ...newAssignments]);
        setCurrentWeek(nextWeekStart);
        toast.success('Planning dupliqu   pour la semaine suivante');
    };

    // V  rifier les conflits et alertes
    const checkConflicts = () => {
        const conflicts: string[] = [];

        weekDays.forEach((day) => {
            SHIFT_TYPES.forEach((shift) => {
                const dayAssignments = getAssignments(day, shift.id);

                if (dayAssignments.length < shift.requiredStaff) {
                    conflicts.push(
                        `${format(day, 'EEEE dd/MM', { locale: fr })} - ${shift.name}: ${shift.requiredStaff - dayAssignments.length
                        } personne(s) manquante(s)`
                    );
                }
            });
        });

        return conflicts;
    };

    const conflicts = checkConflicts();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Planning des Roulements
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Gestion des shifts et horaires des   quipes techniques
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={duplicateWeek}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                        <Copy className="w-4 h-4" />
                        Dupliquer semaine
                    </button>

                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {conflicts.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {conflicts.length} Conflit(s) D  tect  (s)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-1">
                            {conflicts.map((conflict, i) => (
                                <li key={i} className="text-sm text-amber-700 dark:text-amber-300">
                                        {conflict}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <button
                    onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                    className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                        Semaine pr  c  dente
                </button>

                <h2 className="text-lg font-semibold">
                    {format(weekStart, 'dd MMM', { locale: fr })} -{' '}
                    {format(weekEnd, 'dd MMM yyyy', { locale: fr })}
                </h2>

                <button
                    onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                    className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    Semaine suivante
                </button>
            </div>

            {/* Schedule Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 text-left font-semibold bg-slate-50 dark:bg-slate-800 min-w-[150px]">
                                    Shift
                                </th>
                                {weekDays.map((day) => (
                                    <th
                                        key={day.toISOString()}
                                        className="p-4 text-center font-semibold bg-slate-50 dark:bg-slate-800 min-w-[180px]"
                                    >
                                        <div>{format(day, 'EEEE', { locale: fr })}</div>
                                        <div className="text-sm font-normal text-slate-500">
                                            {format(day, 'dd/MM')}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {SHIFT_TYPES.map((shift) => (
                                <tr key={shift.id} className="border-b border-slate-200 dark:border-slate-700">
                                    <td className="p-4 bg-slate-50 dark:bg-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: shift.color }}
                                            />
                                            <div>
                                                <div className="font-semibold">{shift.name}</div>
                                                <div className="text-xs text-slate-500">
                                                    {shift.startTime} - {shift.endTime}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {shift.requiredStaff} pers. requis
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {weekDays.map((day) => {
                                        const cellAssignments = getAssignments(day, shift.id);
                                        const isFull = cellAssignments.length >= shift.requiredStaff;

                                        return (
                                            <td
                                                key={`${day.toISOString()}-${shift.id}`}
                                                className={`p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${cellAssignments.length < shift.requiredStaff
                                                        ? 'bg-red-50 dark:bg-red-900/10'
                                                        : ''
                                                    }`}
                                                onClick={() => setSelectedCell({ date: day, shiftId: shift.id })}
                                            >
                                                <div className="space-y-1">
                                                    {cellAssignments.map((assignment) => {
                                                        const member = teamMembers.find(
                                                            (m) => m.id === assignment.memberId
                                                        );
                                                        return (
                                                            <div
                                                                key={assignment.id}
                                                                className="p-2 rounded text-xs flex items-center justify-between group"
                                                                style={{
                                                                    backgroundColor: `${shift.color}20`,
                                                                    borderLeft: `3px solid ${shift.color}`,
                                                                }}
                                                            >
                                                                <span className="font-medium truncate">{member?.name}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeAssignment(assignment.id);
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded transition-all"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                    {!isFull && (
                                                        <div className="p-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-center text-xs text-slate-400">
                                                            +
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {selectedCell && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelectedCell(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">Assigner un membre</h3>

                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-1">Date:</p>
                            <p className="font-semibold">
                                {format(selectedCell.date, 'EEEE dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-slate-500 mb-1">Shift:</p>
                            <p className="font-semibold">
                                {SHIFT_TYPES.find((s) => s.id === selectedCell.shiftId)?.name}
                            </p>
                        </div>

                        <div className="space-y-2">
                            {teamMembers.map((member) => {
                                const alreadyAssigned = assignments.some(
                                    (a) =>
                                        a.memberId === member.id &&
                                        format(a.date, 'yyyy-MM-dd') === format(selectedCell.date, 'yyyy-MM-dd')
                                );

                                return (
                                    <button
                                        key={member.id}
                                        onClick={() => assignMember(member.id, selectedCell.date, selectedCell.shiftId)}
                                        disabled={alreadyAssigned}
                                        className={`w-full p-3 border rounded-lg text-left transition-colors ${alreadyAssigned
                                                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary'
                                            }`}
                                    >
                                        <div className="font-semibold">{member.name}</div>
                                        <div className="text-sm text-slate-500">{member.role}</div>
                                        {alreadyAssigned && (
                                            <div className="text-xs text-amber-600 mt-1">D  j   assign   ce jour</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setSelectedCell(null)}
                            className="mt-4 w-full px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Team Members Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Membres de l&apos;  quipe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {teamMembers.map((member) => {
                            const memberAssignments = assignments.filter(
                                (a) => a.memberId === member.id && a.date >= weekStart && a.date <= weekEnd
                            );

                            return (
                                <div
                                    key={member.id}
                                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                                >
                                    <h4 className="font-semibold mb-1">{member.name}</h4>
                                    <p className="text-sm text-slate-500 mb-2">{member.role}</p>
                                    <div className="text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">Shifts cette semaine:</span>
                                        <span className="ml-2 font-bold text-primary">{memberAssignments.length}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
