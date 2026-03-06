'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Team } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Team[]>('/api/teams')
            .then((data) => {
                if (Array.isArray(data)) setTeams(data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page active" id="page-teams">
            <div className="page-header">
                    <div className="page-label" style={{ color: 'var(--blue)' }}>Organisation</div>
                    <h1 className="page-title">Équipes</h1>
                    <div className="page-sub">Gestion des équipes opérationnelles et affectations</div>
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-title"><div className="dot" style={{ background: 'var(--blue)' }}></div>Annuaire des Équipes</div>
                    </div>
                    <div className="panel-body" style={{ padding: 0 }}>
                        {loading ? (
                            <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nom de l'équipe</th>
                                        <th>Effectif</th>
                                        <th>Créé le</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text3)' }}>Aucune équipe trouvée.</td>
                                        </tr>
                                    )}
                                    {teams.map(team => (
                                        <tr key={team._id}>
                                            <td style={{ fontWeight: 700 }}>{team.name}</td>
                                            <td>{team.members?.length || 0} membre(s)</td>
                                            <td style={{ fontFamily: 'var(--font-mono)' }}>{team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—'}</td>
                                            <td>
                                                <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)' }}>Éditer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
            </div>
        </div>
    );
}
