"use client"
import Link from "next/link"

export default function NetworkPage() {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col">
            <header className="h-16 border-b border-border-dark bg-neutral-dark/50 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-xl">hub</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">NetViz <span className="text-primary">Pro</span></h2>
                </div>
                <Link href="/admin/devops" className="p-2 text-slate-400 hover:text-white"><span className="material-symbols-outlined">home</span></Link>
            </header>
            <div className="flex-1 relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] p-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="bg-neutral-dark border border-border-dark rounded-xl p-6">
                        <h3 className="font-bold mb-2 text-white">API Gateway</h3>
                        <p className="text-slate-400 text-sm">104.22.4.15     SSL: Valid</p>
                    </div>
                    <div className="bg-neutral-dark border border-border-dark rounded-xl p-6">
                        <h3 className="font-bold mb-2 text-white">Main Load Balancer</h3>
                        <p className="text-slate-400 text-sm">3 Healthy Instances</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
