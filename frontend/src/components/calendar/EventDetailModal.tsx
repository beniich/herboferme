import React from 'react';
import { X, Calendar as CalendarIcon, MapPin, Users, Droplet, Clock, FileText } from 'lucide-react';

interface EventDetailModalProps {
  event: any;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  // Formatting helpers
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getPriorityBadgeColor = (prio: string) => {
    switch(prio) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-start`} style={{ backgroundColor: event.color || '#10B981' }}>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                {event.type.replace('_', ' ')}
              </span>
              {event.task?.priority && (
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${getPriorityBadgeColor(event.task.priority)}`}>
                  {event.task.priority}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold">{event.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {event.description && (
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Timeline Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Chronologie</h3>
              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Début</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.startDate)}</div>
                </div>
              </div>
              {event.endDate && (
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Fin Estimée</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.endDate)}</div>
                  </div>
                </div>
              )}
              {event.allDay && (
                <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                  Journée Entière
                </div>
              )}
            </div>

            {/* Depending on Type: culture or task */}
            <div className="space-y-4">
               {event.culture && (
                 <>
                   <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Détails Culture</h3>
                   <div className="flex items-start">
                     <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                     <div>
                       <div className="text-sm font-medium text-gray-900 dark:text-white">
                         {event.culture.name} {event.culture.variety && `(${event.culture.variety})`}
                       </div>
                       <div className="text-sm text-gray-500 dark:text-gray-400">Surface: {event.culture.surface} ha</div>
                     </div>
                   </div>
                 </>
               )}

               {event.task && (
                 <>
                   <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Détails Opération</h3>
                   
                   <div className="flex items-center justify-between mb-3">
                     <span className="text-sm text-gray-500 dark:text-gray-400">Statut:</span>
                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(event.task.status)}`}>
                       {event.task.status.replace('_', ' ')}
                     </span>
                   </div>

                   {event.task.assignedTo && event.task.assignedTo.length > 0 && (
                     <div className="flex items-start mt-3">
                       <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                       <div>
                         <div className="text-sm font-medium text-gray-900 dark:text-white">Équipe Assignée</div>
                         <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                           {event.task.assignedTo.map((worker: any, idx: number) => (
                             <div key={idx}>{worker.firstName} {worker.lastName}</div>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}
                 </>
               )}
            </div>

            {/* Resources (if any) */}
            {event.resources && (event.resources.waterUsage || event.resources.fertilizerUsage) && (
              <div className="md:col-span-2 mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Ressources Allouées</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {event.resources.waterUsage && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center">
                      <Droplet className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Eau Prévue</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{event.resources.waterUsage} m³</div>
                      </div>
                    </div>
                  )}
                  {event.resources.fertilizerUsage && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg flex items-center">
                      <FileText className="w-5 h-5 text-yellow-500 mr-2" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Engrais NPK</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{event.resources.fertilizerUsage} kg</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Fermer
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors">
            Modifier cet événement
          </button>
        </div>

      </div>
    </div>
  );
}
