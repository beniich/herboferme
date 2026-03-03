'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserPlus, Filter, MoreVertical, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Appel de l'API backend connect  e
                const response = await adminApi.getUsers();
                if (response && response.data) {
                    setUsers(response.data);
                } else if (Array.isArray(response)) {
                    setUsers(response);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                // Fallback avec des donn  es mock  es issues du backend en cas de fail API
                setUsers([
                    {
                        id: 'u1', name: 'Admin Principal', email: 'admin@reclamtrack.com', role: 'admin', status: 'active', lastLogin: '2025-02-11 08:30'
                    },
                    {
                        id: 'u2', name: 'Chef   quipe Nord', email: 'chef.nord@reclamtrack.com', role: 'manager', status: 'active', lastLogin: '2025-02-11 09:15'
                    },
                    {
                        id: 'u3', name: 'Tech 1', email: 'tech1@reclamtrack.com', role: 'technician', status: 'active', lastLogin: '2025-02-10 17:00'
                    },
                     {
                        id: 'u4', name: 'Citoyen Lambda', email: 'citoyen@mail.com', role: 'citizen', status: 'inactive', lastLogin: '2025-01-20 10:00'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'manager': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'technician': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'User Details',
            sortable: true,
            render: (value: any, row: User) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm">
                        {row.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{row.name}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Role',
            sortable: true,
            render: (value: any, row: User) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeColor(row.role)}`}>
                    {row.role}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value: any, row: User) => (
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${row.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`}></span>
                    <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">{row.status}</span>
                </div>
            )
        },
        {
            key: 'lastLogin',
            label: 'Last Session',
            sortable: true,
            render: (value: any, row: User) => (
                <span className="text-sm text-slate-500 font-mono text-xs">{row.lastLogin}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (value: any, row: User) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold bg-primary/5 hover:bg-primary/10">
                        Permissions
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 md:p-8 space-y-8 flex-1 w-full max-w-[1400px] mx-auto animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        User & Roles Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage access levels and profiles for platform operators and field staff.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 font-bold text-slate-700 dark:text-slate-300">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                    <Button className="gap-2 font-bold bg-primary hover:bg-blue-700 text-white shadow-lg shadow-primary/20">
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Smart Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{users.length}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Now</CardTitle>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{users.filter(u => u.status === 'active').length}</div>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Admins</CardTitle>
                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{users.filter(u => u.role === 'admin').length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Content */}
             <div className="space-y-4">
                 {/* Tabs */}
                 <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 px-2 overflow-x-auto">
                    <button className="border-b-2 border-primary text-primary pb-3 font-bold text-sm whitespace-nowrap">All Staff</button>
                    <button className="border-b-2 border-transparent text-slate-500 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap">Administrators</button>
                    <button className="border-b-2 border-transparent text-slate-500 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap">Operators</button>
                    <button className="border-b-2 border-transparent text-slate-500 pb-3 font-medium text-sm hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap">Field Technicians</button>
                </div>
                
                {loading ? (
                    <div className="flex justify-center flex-col items-center py-20 gap-4">
                         <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary"></div>
                         <span className="text-sm font-medium text-slate-500 animate-pulse">Loading system users...</span>
                    </div>
                ) : (
                    <DataTable 
                        data={users}
                        columns={columns}
                        pagination={true}
                        pageSize={10}
                    />
                )}
            </div>
            
             {/* Role Info Cards Wrapper */}
             <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Roles Definitions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Administrators</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">Full system access including financial records, system configuration, and data exports.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Operators</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">Can manage complaints, dispatch interventions, and communicate with customers.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                 <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Technicians</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">Restricted to mobile interface for resolving field interventions and reporting status.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
