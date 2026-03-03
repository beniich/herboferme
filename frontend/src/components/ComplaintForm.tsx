'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './ui/button';

interface FormValues {
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    leakType: string;
    description?: string;
}

export default function ComplaintForm() {
    const router = useRouter();
    const [values, setValues] = useState<FormValues>({
        firstName: '',
        lastName: '',
        address: '',
        phone: '',
        leakType: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post('/complaints', values);
            router.push('/complaints/list');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="max-w-3xl mx-auto bg-white rounded shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Nouvelle r  clamation</h2>

            {error && <p className="text-red-600 mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Pr  nom"
                        required
                        value={values.firstName}
                        onChange={handleChange}
                        className="border rounded p-2"
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Nom"
                        required
                        value={values.lastName}
                        onChange={handleChange}
                        className="border rounded p-2"
                    />
                </div>

                <input
                    type="text"
                    name="address"
                    placeholder="Adresse"
                    required
                    value={values.address}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder="T  l  phone"
                    required
                    value={values.phone}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                />

                <select
                    name="leakType"
                    required
                    value={values.leakType}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                >
                    <option value="">-- Nature de la fuite --</option>
                    <option value="eau">Eau</option>
                    <option value="electricite">  lectricit  </option>
                    <option value="menuiserie">Menuiserie</option>
                    <option value="soudure">Soudure</option>
                    <option value="maconnerie">Ma  onnerie</option>
                </select>

                <textarea
                    name="description"
                    placeholder="Description d  taill  e (optionnelle)"
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center disabled:opacity-50"
                >
                    {loading && <LoadingSpinner />}
                    <span className="ml-2">{loading ? 'Enregistrement   ' : 'Enregistrer'}</span>
                </button>
            </form>
        </section>
    );
}
