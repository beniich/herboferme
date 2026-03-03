'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Team } from '@/types';
import TeamCard from '@/components/TeamCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Users } from 'lucide-react';

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<string>('');

    useEffect(() => {
        api.get<Team[]>('/teams')
            .then((teamsData) => {
                if (Array.isArray(teamsData)) {
                    setTeams(teamsData);
                } else {
                    console.error('API returned non-array for teams:', teamsData);
                    setTeams([]);
                }
            })
            .catch((err) => {
                console.error('Error fetching teams:', err);
                setTeams([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const assignTeam = async (teamId: string) => {
        if (!selectedComplaint) {
            alert('Veuillez entrer un num  ro de r  clamation');
            return;
        }
        try {
            await api.post('/assignments', {
                complaintId: selectedComplaint,
                teamId
            });
            alert('  quipe affect  e avec succ  s !');
            // Refresh teams
            const refreshed = await api.get<Team[]>('/teams');
            if (Array.isArray(refreshed)) {
                setTeams(refreshed);
            }
            setSelectedComplaint('');
        } catch (err) {
            console.error(err);
            alert('Erreur lors de l\'affectation');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <section className="max-w-5xl mx-auto py-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6" />
                  quipes disponibles
            </h2>

            <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
                <label className="block text-sm font-medium mb-2">R  clamation    affecter :</label>
                <input
                    type="text"
                    placeholder="ID de la r  clamation"
                    className="border rounded p-2 w-full max-w-md"
                    value={selectedComplaint}
                    onChange={(e) => setSelectedComplaint(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(teams) && teams.map((team) => (
                    <TeamCard key={team._id} team={team} onAssign={assignTeam} />
                ))}
            </div>

            {(!Array.isArray(teams) || teams.length === 0) && (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
                    Aucune   quipe disponible
                </div>
            )}
        </section>
    );
}
