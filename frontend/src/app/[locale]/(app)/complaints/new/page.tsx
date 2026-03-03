'use client';

// import ComplaintForm from '@/components/ComplaintForm'; // Old form
import { CreateComplaintWizard } from '@/components/complaints/CreateComplaintWizard';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewComplaintPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <section className="py-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-2">Nouvelle R  clamation</h1>
                <p className="text-center text-slate-500 mb-8">Remplissez le formulaire ci-dessous pour signaler un incident.</p>
                <CreateComplaintWizard />
            </div>
        </section>
    );
}
