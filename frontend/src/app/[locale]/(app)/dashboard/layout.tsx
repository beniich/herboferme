import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex flex-1 pt-0">
                <Sidebar />
                <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
