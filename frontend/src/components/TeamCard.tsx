'use client';

import { Team } from '@/types';
import { Button } from './ui/button';

interface Props {
    team: Team;
    onAssign?: (teamId: string) => void;
}

export default function TeamCard({ team, onAssign }: Props) {
    const statusColors = {
        disponible: 'bg-green-100 text-green-800',
        intervention: 'bg-yellow-100 text-yellow-800',
        repos: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="border rounded-lg p-4 shadow-sm flex justify-between items-center bg-white">
            <div>
                <h3 className="font-medium text-lg">{team.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[team.status]}`}>
                    {team.status}
                </span>
                {team.location && (
                    <p className="text-xs text-gray-500 mt-1">
                             {team.location.lat.toFixed(4)}, {team.location.lng.toFixed(4)}
                    </p>
                )}
            </div>

            {onAssign && (
                <Button
                    onClick={() => onAssign(team._id)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Affecter
                </Button>
            )}
        </div>
    );
}
