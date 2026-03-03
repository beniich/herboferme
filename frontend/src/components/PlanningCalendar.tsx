'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { PlanningSlot } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

export default function PlanningCalendar() {
    const [slots, setSlots] = useState<PlanningSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/planning/slots')
            .then((res) => setSlots(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <section className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Planning mensuel</h2>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  quipe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date / Heure D  but
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date / Heure Fin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                R  clamation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {slots.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    Aucun cr  neau pr  vu
                                </td>
                            </tr>
                        ) : (
                            slots.map((slot) => (
                                <tr key={slot._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {slot.teamName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(slot.start).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(slot.end).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {slot.complaintNumber || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
