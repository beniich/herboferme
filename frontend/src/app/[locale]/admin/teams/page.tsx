'use client';

import React, { useEffect, useState } from 'react';
import { useOrgStore } from '@/store/orgStore';
import { teamsApi, organizationApi } from '@/lib/api';
// import { TeamResponse } from '@/types'; // Removed unused import
import {
    WaterDrop,
    Bolt,
    Plumbing,
    Construction,
    Group,
    LocalShipping,
    CalendarMonth,
    FilterList,
    RadioButtonChecked,
    NotificationsActive,
    Add
} from '@/components/icons';
import { Search } from 'lucide-react'; // Import direct for standard UI icons if not in icons.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'react-hot-toast';

// Helper to map specialization to icon
const getSpecialtyIcon = (spec: string) => {
    switch (spec?.toLowerCase()) {
        case 'water':
        case 'plumbing': return <WaterDrop className="text-2xl" />;
        case 'electrical':
        case 'elec': return <Bolt className="text-2xl" />;
        case 'infrastructure': return <Construction className="text-2xl" />;
        default: return <Construction className="text-2xl" />;
    }
};

const getSpecialtyColor = (spec: string) => {
    switch (spec?.toLowerCase()) {
        case 'water':
        case 'plumbing': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600';
        case 'electrical': return 'bg-primary/10 text-primary';
        case 'infrastructure': return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
        default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'disponible': return {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            dot: 'bg-emerald-500',
            label: 'Available'
        };
        case 'intervention': return {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-400',
            dot: 'bg-amber-500',
            label: 'Busy'
        };
        case 'repos': return {
            bg: 'bg-slate-100 dark:bg-slate-800',
            text: 'text-slate-400',
            dot: 'bg-slate-400',
            label: 'Offline'
        };
        default: return {
            bg: 'bg-slate-100',
            text: 'text-slate-500',
            dot: 'bg-slate-500',
            label: status
        };
    }
};

export default function TeamsPage() {
    const { activeOrganization } = useOrgStore();
    const [teams, setTeams] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Team Form State
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamSpec, setNewTeamSpec] = useState('plumbing');

    useEffect(() => {
        if (activeOrganization) {
            fetchTeams();
        }
    }, [activeOrganization]);

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const response = await teamsApi.getAll();
            setTeams(response.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch teams', error);
            toast.error('Could not load teams');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTeam = async () => {
        if (!activeOrganization) return;
        try {
            await teamsApi.create({
                name: newTeamName,
                specialization: newTeamSpec,
                organizationId: activeOrganization._id,
                status: 'disponible'
            });
            toast.success('Team created successfully');
            setIsCreateOpen(false);
            setNewTeamName('');
            fetchTeams();
        } catch (error) {
            toast.error('Failed to create team');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold">Technical Teams Directory</h2>
                    <div className="relative w-72 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                            placeholder="Search teams, ID, or specialty..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="size-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                        <NotificationsActive className="w-5 h-5" />
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:border-slate-800"></div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary/90 transition-colors">
                                <Add className="w-4 h-4" />
                                New Team
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Team Name</label>
                                    <Input
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        placeholder="e.g. Equipe Alpha 01"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Specialization</label>
                                    <Select value={newTeamSpec} onValueChange={setNewTeamSpec}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="plumbing">Plumbing</SelectItem>
                                            <SelectItem value="electrical">Electrical</SelectItem>
                                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateTeam}>Create Team</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Total Teams</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{teams.length}</span>
                            <span className="text-xs font-semibold text-emerald-500">+1 this month</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Available Now</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-emerald-600">
                                {teams.filter(t => t.status === 'disponible').length}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">58% capacity</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Active Interventions</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-primary">
                                {teams.filter(t => t.status === 'intervention').length}
                            </span>
                            <span className="text-xs font-semibold text-amber-500">2 priority</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">Average Response</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold">42m</span>
                            <span className="text-xs font-semibold text-emerald-500">    4% vs prev week</span>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <FilterList className="w-5 h-5" />
                            All Specialties
                            <Search className="w-4 h-4 ml-2 opacity-50" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <RadioButtonChecked className="w-5 h-5" />
                            Status: Any
                            <Search className="w-4 h-4 ml-2 opacity-50" />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500">Showing {teams.length} technical teams</p>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                    {teams.map((team) => {
                        const style = getStatusColor(team.status);
                        return (
                            <div key={team._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`size-12 rounded-lg ${getSpecialtyColor(team.specialization)} flex items-center justify-center`}>
                                            {getSpecialtyIcon(team.specialization)}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} flex items-center gap-1`}>
                                            <span className={`size-1.5 rounded-full ${style.dot}`}></span>
                                            {style.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-1">{team.name}</h3>
                                    <p className="text-xs text-slate-500 mb-4 capitalize">{team.specialization || 'General'} Specialty</p>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Group className="w-4 h-4" />
                                                <span className="text-xs font-medium">{team.members?.length || 0} Members</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {/* Mock avatars if no members, or map real members */}
                                                {(team.members || []).slice(0, 3).map((m: any, i: number) => (
                                                    <div key={i} className="size-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                                        <Avatar className="h-full w-full">
                                                            <AvatarImage src={m.avatar} />
                                                            <AvatarFallback className="text-[8px]">{m.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                ))}
                                                {(!team.members || team.members.length === 0) && (
                                                    <div className="size-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400">?</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <LocalShipping className="w-4 h-4" />
                                            <span className="text-xs font-medium uppercase">VH-{team._id.slice(-6)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 pb-5 mt-auto">
                                    <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                        <CalendarMonth className="w-4 h-4" />
                                        View Schedule
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State / Add Placeholder */}
                    {teams.length === 0 && !isLoading && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No teams found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
