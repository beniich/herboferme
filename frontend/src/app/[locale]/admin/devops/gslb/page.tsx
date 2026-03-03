import React from 'react';
import { Card } from "@/components/devops-dashboards/ui/Card";
import { Badge } from "@/components/devops-dashboards/ui/Badge";
import { Icon } from "@/components/devops-dashboards/ui/Icon";
import { KPICard } from "@/components/devops-dashboards/ui/KPICard";

/* ------------------------------------------------------------------ */
/* 2        Table des routing policies                                    */
/* ------------------------------------------------------------------ */
type PolicyRow = {
  name: string;
  domain: string;
  type: "GEOLOCATION" | "FAILOVER" | "WEIGHTED";
  regions: string;
  priority: string;
  health: "Healthy" | "Degraded" | "Unhealthy";
  healthColor: string;
};

const policies: PolicyRow[] = [
  {
    name: "EU Latency Optimizer",
    domain: "api.edgeroute.global",
    type: "GEOLOCATION",
    regions: "EU, ASIA, US-East",
    priority: "01",
    health: "Healthy",
    healthColor: "bg-green-500",
  },
  {
    name: "US-East Main Failover",
    domain: "web.edgeroute.global",
    type: "FAILOVER",
    regions: "US-East     US-West",
    priority: "02",
    health: "Healthy",
    healthColor: "bg-green-500",
  },
  {
    name: "Static Assets Cluster",
    domain: "cdn.edgeroute.global",
    type: "WEIGHTED",
    regions: "GLOBAL (60/40 Split)",
    priority: "03",
    health: "Degraded",
    healthColor: "bg-amber-500",
  },
];

export default function GslbPage() {
  return (
    <section className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* -------------------- KPI GRID -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Traffic"
          value="1.48M"
          unit="RPS"
          change="+12.4%"
          changePositive
          icon="public"
        />
        <KPICard
          title="Global Health"
          value="99.98%"
          change="-0.02%"
          changePositive={false}
          icon="health_and_safety"
        />
        <KPICard
          title="Active Failovers"
          value="02"
          change="STABLE"
          changePositive
          icon="sync_alt"
        />
        <KPICard
          title="Latency"
          value="112"
          unit="ms"
          change="+5%"
          changePositive
          icon="speed"
        />
      </div>

      {/* -------------------- GLOBAL TRAFFIC MAP -------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden relative shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Icon name="public" className="text-primary" />
            <h3 className="font-bold text-sm">Global Traffic Distribution</h3>
          </div>
          <div className="flex gap-2 text-xs">
            <Badge variant="success">US-East: Active</Badge>
            <Badge variant="success">EU-West: Active</Badge>
            <Badge variant="warning">ASIA-South: Degraded</Badge>
          </div>
        </div>

        {/* MAP     image placeholder + points */}
        <div className="h-[400px] relative bg-[#0a0f18] flex items-center justify-center overflow-hidden">
          {/* grille de fond */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#135bec_1px,transparent_1px)] [background-size:20px_20px]" />
          {/* points */}
          <div className="absolute top-1/4 left-1/4 size-3 bg-primary rounded-full shadow-[0_0_15px_#135bec] ring-4 ring-primary/20 animate-pulse" />
          <div className="absolute top-1/3 left-1/2 size-3 bg-primary rounded-full shadow-[0_0_15px_#135bec] ring-4 ring-primary/20 animate-pulse delay-75" />
          <div className="absolute top-1/2 right-1/4 size-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b] ring-4 ring-amber-500/20 animate-pulse delay-150" />
          {/* lignes SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <path
              className="opacity-40"
              d="M25% 25% Q 37.5% 20%, 50% 33%"
              fill="none"
              stroke="#135bec"
              strokeDasharray="5,5"
              strokeWidth="1.5"
            />
            <path
              className="opacity-40"
              d="M50% 33% Q 75% 40%, 75% 50%"
              fill="none"
              stroke="#135bec"
              strokeDasharray="5,5"
              strokeWidth="1.5"
            />
          </svg>

          {/* l  gende */}
          <div className="z-10 text-center pointer-events-none">
            <div className="text-slate-500 text-xs font-mono uppercase mb-2">
              Live Edge Nodes
            </div>
            {/* World Map Background Placeholder */}
            <div className="text-slate-700 text-6xl opacity-20 select-none">
              <Icon name="public" className="text-9xl" />
            </div>
          </div>
        </div>
        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button className="size-8 bg-slate-800 hover:bg-slate-700 rounded-t-lg flex items-center justify-center border border-slate-700 text-white">
            <Icon name="add" className="text-xs" />
          </button>
          <button className="size-8 bg-slate-800 hover:bg-slate-700 rounded-b-lg flex items-center justify-center border border-slate-700 border-t-0 text-white">
            <Icon name="remove" className="text-xs" />
          </button>
        </div>
      </div>

      {/* -------------------- Routing Policies Table -------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg">Routing Policies</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              Export Config
            </button>
            <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 transition">
              <Icon name="add" className="text-sm" /> Add New Rule
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Routing Type</th>
                <th className="px-6 py-4">Regions</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Health Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {policies.map((p, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                      <span className="text-xs text-slate-500">{p.domain}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${
                        p.type === "GEOLOCATION"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          : p.type === "FAILOVER"
                          ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                          : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                      } font-bold text-xs`}
                    >
                      <Icon name="location_on" className="text-xs" />
                      {p.type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400">{p.regions}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">{p.priority}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${p.healthColor}`} />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{p.health}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="p-1 text-slate-400 hover:text-primary transition-colors">
                      <Icon name="edit" />
                    </button>
                    <button className="p-1 text-slate-400 hover:text-primary transition-colors">
                      <Icon name="more_vert" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button className="text-xs font-bold text-primary flex items-center gap-2 hover:underline">
            View All Policies <Icon name="arrow_forward" className="text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}
