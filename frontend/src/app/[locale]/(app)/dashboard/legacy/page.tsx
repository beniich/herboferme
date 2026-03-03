'use client';
import React, { useState } from 'react';
import { Calendar, Users, Phone, MessageSquare, Bell, Search, BarChart3, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const ComplaintManagementSystem = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [complaints, setComplaints] = useState([
        {
            id: 'REC-001',
            date: '2026-02-07 09:30',
            nom: 'Alami',
            prenom: 'Hassan',
            telephone: '0612345678',
            adresse: '15 Rue Mohammed V, Rabat',
            nature: 'Fuite d\'eau',
            priorite: 'Urgent',
            statut: 'En cours',
            equipe: 'Eau',
            description: 'Fuite importante au niveau du compteur',
            source: 'T  l  phone'
        },
        {
            id: 'REC-002',
            date: '2026-02-07 10:15',
            nom: 'Bennani',
            prenom: 'Fatima',
            telephone: '0623456789',
            adresse: '42 Avenue Hassan II, Sal  ',
            nature: 'Panne   lectrique',
            priorite: 'Haute',
            statut: 'Nouvelle',
            equipe: null,
            description: 'Coupure de courant depuis hier soir',
            source: 'Message'
        },
        {
            id: 'REC-003',
            date: '2026-02-06 14:20',
            nom: 'Idrissi',
            prenom: 'Ahmed',
            telephone: '0634567890',
            adresse: '78 Rue Oued F  s, Rabat',
            nature: 'Menuiserie',
            priorite: 'Normal',
            statut: 'R  solue',
            equipe: 'Menuiserie',
            description: 'R  paration porte d\'entr  e',
            source: 'T  l  phone'
        }
    ]);

    const [equipes, setEquipes] = useState([
        { id: 1, nom: 'Eau', disponible: true, membres: 3, interventionsJour: 2, localisation: 'Agdal' },
        { id: 2, nom: '  lectricit  ', disponible: true, membres: 4, interventionsJour: 3, localisation: 'Hassan' },
        { id: 3, nom: 'Menuiserie', disponible: false, membres: 2, interventionsJour: 1, localisation: 'En intervention' },
        { id: 4, nom: 'Soudure', disponible: true, membres: 2, interventionsJour: 0, localisation: 'Atelier' },
        { id: 5, nom: 'Ma  onnerie', disponible: true, membres: 3, interventionsJour: 1, localisation: 'Souissi' },
        { id: 6, nom: 'Plomberie', disponible: true, membres: 3, interventionsJour: 2, localisation: 'Youssoufia' },
        { id: 7, nom: 'Peinture', disponible: true, membres: 2, interventionsJour: 0, localisation: 'Atelier' },
        { id: 8, nom: 'Climatisation', disponible: false, membres: 2, interventionsJour: 2, localisation: 'En intervention' },
        { id: 9, nom: 'Jardinage', disponible: true, membres: 2, interventionsJour: 1, localisation: 'Hay Riad' },
        { id: 10, nom: 'Nettoyage', disponible: true, membres: 4, interventionsJour: 3, localisation: 'Centre ville' }
    ]);

    const [newComplaint, setNewComplaint] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        nature: '',
        description: '',
        priorite: 'Normal',
        source: 'T  l  phone'
    });

    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Nouvelle r  clamation REC-002 assign  e', time: '5 min', type: 'new' },
        { id: 2, message: '  quipe Eau a termin   REC-001', time: '15 min', type: 'completed' },
        { id: 3, message: 'R  clamation urgente en attente', time: '30 min', type: 'urgent' }
    ]);

    const [selectedMonth] = useState('F  vrier 2026');

    const naturesReclamation = [
        'Fuite d\'eau',
        'Panne   lectrique',
        'Menuiserie',
        'Soudure',
        'Ma  onnerie',
        'Plomberie',
        'Peinture',
        'Climatisation',
        'Jardinage',
        'Nettoyage',
        'Autre'
    ];

    const handleSubmitComplaint = (e: React.FormEvent) => {
        e.preventDefault();
        const newId = `REC-${String(complaints.length + 1).padStart(3, '0')}`;
        const newComplaintData = {
            ...newComplaint,
            id: newId,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            statut: 'Nouvelle',
            equipe: null
        };
        setComplaints([newComplaintData, ...complaints]);
        setNewComplaint({
            nom: '',
            prenom: '',
            telephone: '',
            adresse: '',
            nature: '',
            description: '',
            priorite: 'Normal',
            source: 'T  l  phone'
        });
        setNotifications([
            { id: notifications.length + 1, message: `Nouvelle r  clamation ${newId} cr    e`, time: 'maintenant', type: 'new' },
            ...notifications
        ]);
        alert(`R  clamation ${newId} cr    e avec succ  s !`);
    };

    const assignTeam = (complaintId: string, teamName: string) => {
        setComplaints(complaints.map(c =>
            c.id === complaintId ? { ...c, equipe: teamName, statut: 'En cours' } : c
        ));
        setNotifications([
            { id: notifications.length + 1, message: `${complaintId} assign  e    l'  quipe ${teamName}`, time: 'maintenant', type: 'assigned' },
            ...notifications
        ]);
    };

    const updateStatus = (complaintId: string, newStatus: string) => {
        setComplaints(complaints.map(c =>
            c.id === complaintId ? { ...c, statut: newStatus } : c
        ));
    };

    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'Nouvelle': return 'bg-blue-100 text-blue-800';
            case 'En cours': return 'bg-yellow-100 text-yellow-800';
            case 'R  solue': return 'bg-green-100 text-green-800';
            case 'Ferm  e': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priorite: string) => {
        switch (priorite) {
            case 'Urgent': return 'bg-red-100 text-red-800';
            case 'Haute': return 'bg-orange-100 text-orange-800';
            case 'Normal': return 'bg-blue-100 text-blue-800';
            case 'Basse': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const stats = {
        total: complaints.length,
        nouvelles: complaints.filter(c => c.statut === 'Nouvelle').length,
        enCours: complaints.filter(c => c.statut === 'En cours').length,
        resolues: complaints.filter(c => c.statut === 'R  solue').length,
        urgentes: complaints.filter(c => c.priorite === 'Urgent').length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-3xl font-bold mb-4">Vue Prototype (Legacy)</h1>

            {/* Navigation */}
            <div className="bg-white border-b shadow-sm mb-4">
                <div className="flex space-x-4 overflow-x-auto p-2">
                    {[
                        { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
                        { id: 'nouvelle', label: 'Nouvelle r  clamation', icon: Phone },
                        { id: 'reclamations', label: 'R  clamations', icon: MessageSquare },
                        { id: 'equipes', label: '  quipes', icon: Users },
                        { id: 'planning', label: 'Planning', icon: Calendar }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm">Total</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <MessageSquare className="h-10 w-10 text-blue-500" />
                            </div>
                        </div>
                        {/* ... other stats ... */}
                    </div>

                    {/* ... rest of dashboard ... */}
                    <p className="text-center text-gray-500 mt-10">Prototype View - Limited Functionality</p>
                </div>
            )}

            {/* ... other tabs placeholders ... */}
            {activeTab === 'nouvelle' && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-bold">Formulaire Prototype</h2>
                    {/* Form logic reuse... */}
                </div>
            )}

            {/* Liste des R  clamations */}
            {activeTab === 'reclamations' && (
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-bold">Liste Prototype</h2>
                    <table className="w-full mt-4">
                        <thead>
                            <tr className="text-left bg-gray-100">
                                <th className="p-2">ID</th>
                                <th className="p-2">Nom</th>
                                <th className="p-2">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c.id} className="border-t">
                                    <td className="p-2">{c.id}</td>
                                    <td className="p-2">{c.nom}</td>
                                    <td className="p-2">{c.statut}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default ComplaintManagementSystem;
