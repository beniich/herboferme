'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, PlayCircle, Plus, Search, Filter } from 'lucide-react';

export default function TasksManagement() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    urgent: 0
  });
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      let qs = '?';
      if (filters.status) qs += `status=${filters.status}&`;
      if (filters.priority) qs += `priority=${filters.priority}`;

      const res = await fetch(`http://localhost:4000/api/tasks${qs}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setTasks(data.tasks);
        calculateStats(data.tasks);
      }
    } catch (err) {
      console.error("Erreur tasks", err);
    }
  };

  const calculateStats = (allTasks: any[]) => {
    const newStats = { pending: 0, in_progress: 0, completed: 0, urgent: 0 };
    allTasks.forEach(t => {
      if (t.status === 'pending') newStats.pending++;
      if (t.status === 'in_progress') newStats.in_progress++;
      if (t.status === 'completed') newStats.completed++;
      if (t.priority === 'urgent') newStats.urgent++;
    });
    setStats(newStats);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getStatusIcon = (s: string) => {
    switch(s) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-inter text-gray-900 dark:text-white">Opérations & Tâches</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez vos missions, interventions et opérations de maintenance.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Tâche
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">À FAIRE</p>
          <div className="flex items-center mt-2">
            <Clock className="w-6 h-6 text-gray-400 mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">EN COURS</p>
          <div className="flex items-center mt-2">
            <PlayCircle className="w-6 h-6 text-blue-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">TERMINÉES</p>
          <div className="flex items-center mt-2">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <p className="text-sm text-red-500 dark:text-red-400 font-medium">URGENTES</p>
           <div className="flex items-center mt-2">
             <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
             <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.urgent}</span>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une tâche..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm dark:text-white shadow-sm"
          />
        </div>
        
        <div className="flex space-x-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select 
              className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 appearance-none focus:ring-2 focus:ring-green-500"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Tous les statuts</option>
              <option value="pending">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
            </select>
          </div>
          
          <select 
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-green-500"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">Toutes priorités</option>
            <option value="urgent">Urgente</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                 <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tâche</th>
                 <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                 <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priorité</th>
                 <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignation</th>
                 <th className="py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Échéance</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
               {filteredTasks.map((task) => (
                 <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                   <td className="py-4 px-4">
                     <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{task.description}</div>
                   </td>
                   <td className="py-4 px-4">
                     <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                       {getStatusIcon(task.status)}
                       <span className="ml-2 capitalize">{task.status.replace('_', ' ')}</span>
                     </div>
                   </td>
                   <td className="py-4 px-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                       {task.priority || 'Medium'}
                     </span>
                   </td>
                   <td className="py-4 px-4">
                     <div className="flex -space-x-2">
                       {task.assignedTo?.map((w: any, i: number) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400" title={`${w.firstName} ${w.lastName}`}>
                           {w.firstName?.charAt(0)}{w.lastName?.charAt(0)}
                         </div>
                       ))}
                       {(!task.assignedTo || task.assignedTo.length === 0) && (
                         <span className="text-sm text-gray-400 italic">Non assigné</span>
                       )}
                     </div>
                   </td>
                   <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 font-medium">
                     {new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </td>
                 </tr>
               ))}
               {filteredTasks.length === 0 && (
                 <tr>
                   <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                     Aucune tâche trouvée correspondant à vos critères.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>

    </div>
  );
}
