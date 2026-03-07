'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Filter, ShieldCheck, Activity, Search, Edit2, Trash2 } from 'lucide-react';

export default function TeamsManagement() {
  const [teams, setTeams] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({ type: '', status: '' });
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchTeams();
    fetchStats();
  }, [filters]);

  const fetchTeams = async () => {
    try {
      let qs = '?';
      if (filters.type) qs += `type=${filters.type}&`;
      if (filters.status) qs += `status=${filters.status}`;

      const res = await fetch(`http://localhost:4000/api/agro-teams${qs}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des équipes", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/agro-teams/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Erreur stats équipes", err);
    }
  };

  const getTeamTypeColor = (type: string) => {
    switch(type) {
      case 'cultures': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'irrigation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'harvest': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isMounted) return null;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-inter text-gray-900 dark:text-white">Gestion des Équipes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez vos équipes d'ouvriers, leurs spécialisations et leurs performances.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
          <UserPlus className="w-5 h-5 mr-2" />
          Nouvelle Équipe
        </button>
      </div>

      {/* Stats Quick View */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Équipes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.byStatus.reduce((acc: number, curr: any) => acc + curr.count, 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Membres</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.byStatus.reduce((acc: number, curr: any) => acc + curr.totalMembers, 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une équipe..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm dark:text-white"
          />
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select 
              className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Tous les Types</option>
              <option value="cultures">Cultures</option>
              <option value="irrigation">Irrigation</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getTeamTypeColor(team.type)}`}>
                  {team.type}
                </span>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{team.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{team.description}</p>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                    {team.leader?.firstName?.charAt(0) || 'L'}
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chef d'équipe</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{team.leader ? `${team.leader.firstName} ${team.leader.lastName}` : 'Non assigné'}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Taille</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{team.currentSize} membres</p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center">
                    <Activity className="w-4 h-4 mr-1 text-green-500" /> Qualité
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{team.performance?.avgQualityScore || 0}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${team.performance?.avgQualityScore || 0}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-center">
              <button className="text-sm text-green-600 dark:text-green-500 font-medium hover:underline">
                Voir tous les membres ({team.currentSize})
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune équipe trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Ajustez vos filtres ou créez une nouvelle équipe.</p>
        </div>
      )}
    </div>
  );
}
