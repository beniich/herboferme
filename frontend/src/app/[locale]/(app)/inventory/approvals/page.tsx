'use client';

import { useState } from 'react';
import Link from 'next/link';

// Types
interface RequestItem {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    requestedQty: number;
    approvedQty: number; // Modifiable by approver
}

interface Request {
    id: string;
    requester: string;
    department: string;
    timestamp: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
    priority: 'LOW' | 'MEDIUM' | 'URGENT';
    items: RequestItem[];
}

// Mock Data
const mockRequests: Request[] = [
    {
        id: 'REQ-8821',
        requester: 'John Doe',
        department: 'HVAC Maintenance Unit',
        timestamp: '10 mins ago',
        status: 'PENDING',
        priority: 'URGENT',
        items: [
            { id: '1', name: 'Copper Pipe (15mm x 3m)', sku: 'CP-15300-L', currentStock: 124, requestedQty: 12, approvedQty: 12 },
            { id: '2', name: 'Thermal Insulation Wrap', sku: 'TI-WRAP-50', currentStock: 3, requestedQty: 5, approvedQty: 3 }, // Shortage
            { id: '3', name: 'Compression Elbow Fitting', sku: 'CEF-15-B', currentStock: 48, requestedQty: 20, approvedQty: 20 }
        ]
    },
    {
        id: 'REQ-8819',
        requester: 'Sarah Smith',
        department: 'Electrical Division',
        timestamp: '45 mins ago',
        status: 'PENDING',
        priority: 'MEDIUM',
        items: []
    },
    {
        id: 'REQ-8815',
        requester: 'Mike Ross',
        department: 'General Repairs',
        timestamp: '2 hours ago',
        status: 'PENDING',
        priority: 'LOW',
        items: []
    }
];

export default function WarehouseApprovalsPage() {
    // State
    const [selectedRequestId, setSelectedRequestId] = useState<string>('REQ-8821');
    const [requests, setRequests] = useState<Request[]>(mockRequests);
    const [approvalNote, setApprovalNote] = useState('');

    // Derived State
    const selectedRequest = requests.find(r => r.id === selectedRequestId);

    // Handlers
    const handleQtyChange = (itemId: string, newQty: number) => {
        if (!selectedRequest) return;

        const updatedRequests = requests.map(req => {
            if (req.id === selectedRequestId) {
                return {
                    ...req,
                    items: req.items.map(item =>
                        item.id === itemId ? { ...item, approvedQty: newQty } : item
                    )
                };
            }
            return req;
        });
        setRequests(updatedRequests);
    };

    const handleApprove = () => {
        alert(`Request ${selectedRequestId} approved with note: ${approvalNote}`);
        // In a real app, this would submit to API
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Top Navigation */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined block">inventory_2</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Warehouse Ops <span className="text-slate-400 font-normal">| Request Portal</span></h1>
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input
                            className="pl-10 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
                            placeholder="Search requests..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
                            <img alt="User Profile" src="https://ui-avatars.com/api/?name=Warehouse+Manager&background=2424eb&color=fff" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Pending Requests List */}
                <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                            Pending Requests
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                        </h2>
                        <button className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {requests.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => setSelectedRequestId(req.id)}
                                    className={`p-3 rounded-r-lg cursor-pointer border-l-4 transition-colors ${selectedRequestId === req.id
                                        ? 'bg-primary/5 border-primary'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-bold uppercase ${selectedRequestId === req.id ? 'text-primary' : 'text-slate-400'}`}>#{req.id}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${req.priority === 'URGENT' ? 'bg-red-100 text-red-600' :
                                            req.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600' :
                                                'bg-slate-100 text-slate-500'
                                            }`}>{req.priority}</span>
                                    </div>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{req.requester}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{req.department}</p>
                                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        {req.timestamp}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Request Detail */}
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark/50 p-6">
                    {selectedRequest ? (
                        <div className="max-w-5xl mx-auto space-y-6">
                            {/* Header & Status Tracker */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Request Detail: #{selectedRequest.id}</h2>
                                        <p className="text-slate-500 dark:text-slate-400">Requested by {selectedRequest.requester}     Created Oct 24, 2023</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                                            <span className="material-symbols-outlined">print</span>
                                        </button>
                                    </div>
                                </div>
                                {/* Progress Tracker (Static for MVP) */}
                                <div className="mt-8">
                                    <div className="relative">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2"></div>
                                        <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-primary -translate-y-1/2"></div>
                                        <div className="relative flex justify-between">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center z-10">
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-primary">Received</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-primary flex items-center justify-center z-10">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                                                </div>
                                                <span className="mt-2 text-xs font-bold text-primary">Picking</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center z-10"></div>
                                                <span className="mt-2 text-xs font-medium text-slate-400">Ready</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center z-10"></div>
                                                <span className="mt-2 text-xs font-medium text-slate-400">Issued</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Table */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                        <span className="material-symbols-outlined text-slate-400">list_alt</span>
                                        Requested Items & Stock Availability
                                    </h3>
                                    <span className="text-xs text-slate-500">{selectedRequest.items.length} Items Total</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="text-slate-400 font-medium border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-4">Item Name & SKU</th>
                                                <th className="px-6 py-4">Current Stock</th>
                                                <th className="px-6 py-4">Requested Qty</th>
                                                <th className="px-6 py-4">Approved Qty</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {selectedRequest.items.map(item => {
                                                const isShortage = item.currentStock < item.requestedQty;
                                                return (
                                                    <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${isShortage ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                                                            <p className="text-xs text-slate-400 uppercase tracking-tighter">SKU: {item.sku}</p>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                                            {isShortage ? <span className="text-red-600 font-bold">{item.currentStock} units</span> : `${item.currentStock} units`}
                                                            {isShortage && <p className="text-[10px] text-red-500 font-bold uppercase">Critical Low</p>}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{item.requestedQty}</td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                className={`w-20 px-2 py-1 rounded border text-sm focus:ring-2 focus:ring-primary ${isShortage
                                                                    ? 'border-red-200 dark:border-red-900 text-red-600 focus:border-red-500'
                                                                    : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                                                                    } bg-white dark:bg-slate-800`}
                                                                type="number"
                                                                value={item.approvedQty}
                                                                onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isShortage ? (
                                                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                                                    <span className="material-symbols-outlined text-lg">warning</span>
                                                                    Insufficient
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                                                    Available
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer Controls */}
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Approval Note / Reason for Modification</label>
                                    <textarea
                                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary p-3 text-slate-900 dark:text-white"
                                        placeholder="Enter note for the technician..."
                                        rows={2}
                                        value={approvalNote}
                                        onChange={(e) => setApprovalNote(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                                    <button className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                                        Reject
                                    </button>
                                    <button onClick={handleApprove} className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-sm">task_alt</span>
                                        Approve Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-2">inbox</span>
                            <p>Select a request to view details</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

