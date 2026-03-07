# 🌾 AgroMaître - Calendrier (Modal, Données Test & Guide)

## 🎨 PARTIE 3 : MODAL DÉTAILS ÉVÉNEMENT

```typescript
// frontend/components/calendar/EventDetailModal.tsx
'use client';

import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Droplet,
  Sprout,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';

interface EventDetailModalProps {
  event: any;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
}) => {
  const { extendedProps } = event;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      culture_cycle: 'Cycle de culture',
      worker_task: "Tâche d'ouvrier",
      admin_meeting: 'Réunion administrative',
      delivery: 'Livraison',
      maintenance: 'Maintenance',
    };
    return labels[type] || type;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    };
    return styles[priority] || styles.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: event.backgroundColor + '20',
                  color: event.backgroundColor,
                }}
              >
                {getTypeLabel(extendedProps.type)}
              </span>
              {extendedProps.task?.priority && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                    extendedProps.task.priority
                  )}`}
                >
                  Priorité {extendedProps.task.priority}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {extendedProps.description && (
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {extendedProps.description}
              </p>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Date de début
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(event.start)}
                </p>
              </div>
            </div>

            {event.end && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Date de fin
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(event.end)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Culture Info */}
          {extendedProps.culture && (
            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sprout size={20} className="text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Informations Culture
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Culture</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {extendedProps.culture.name}
                    {extendedProps.culture.variety &&
                      ` (${extendedProps.culture.variety})`}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Surface</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {extendedProps.culture.surface} hectares
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Task Info */}
          {extendedProps.task && (
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={20} className="text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Informations Tâche
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Statut
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      extendedProps.task.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : extendedProps.task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {extendedProps.task.status}
                  </span>
                </div>
                {extendedProps.task.estimatedDuration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Durée estimée
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {extendedProps.task.estimatedDuration}h
                    </span>
                  </div>
                )}
                {extendedProps.task.equipmentNeeded &&
                  extendedProps.task.equipmentNeeded.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Équipement nécessaire
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {extendedProps.task.equipmentNeeded.map(
                          (equipment: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300"
                            >
                              {equipment}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Weather */}
          {extendedProps.weather && (
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplet size={20} className="text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Conditions Météo
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Température</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {extendedProps.weather.temperature}°C
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Précipitations
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {extendedProps.weather.rainfall}mm
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Vent</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {extendedProps.weather.windSpeed}km/h
                  </p>
                </div>
              </div>
              {extendedProps.weather.favorable && (
                <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">
                    Conditions favorables
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-end gap-3">
          <button className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors">
            <Trash2 size={18} />
            Supprimer
          </button>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Edit size={18} />
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📊 PARTIE 4 : DONNÉES DE TEST RÉALISTES

```typescript
// backend/seeders/calendarSeeder.ts
import AgriEvent from '../models/AgriEvent';
import moment from 'moment';

export const seedCalendarEvents = async (domainId: string, userId: string) => {
  const events = [
    // Cycles de culture
    {
      type: 'culture_cycle',
      title: 'Semis Blé Tendre - Parcelle Nord',
      description: 'Semis de blé tendre variété Arrehane sur 15 hectares',
      startDate: moment().add(2, 'days').hour(8).minute(0).toDate(),
      endDate: moment().add(2, 'days').hour(17).minute(0).toDate(),
      allDay: false,
      culture: {
        name: 'Blé Tendre',
        variety: 'Arrehane',
        surface: 15,
      },
      resources: {
        seedsUsage: 225, // kg (15 kg/ha)
        cost: 11250, // MAD (750 MAD/ha)
      },
      color: '#10b981',
      domain: domainId,
      createdBy: userId,
    },
    {
      type: 'culture_cycle',
      title: 'Irrigation Tomates - Serre 1',
      description: 'Système goutte-à-goutte programmé',
      startDate: moment().add(1, 'days').hour(6).minute(0).toDate(),
      endDate: moment().add(1, 'days').hour(7).minute(30).toDate(),
      allDay: false,
      culture: {
        name: 'Tomate',
        variety: 'Marmande',
        surface: 2,
      },
      resources: {
        waterUsage: 60, // m³
        cost: 180, // MAD
      },
      color: '#10b981',
      domain: domainId,
      createdBy: userId,
      recurrence: {
        pattern: 'daily',
        interval: 2,
        endDate: moment().add(3, 'months').toDate(),
      },
    },
    {
      type: 'culture_cycle',
      title: 'Fertilisation Maïs',
      description: 'Apport NPK 15-15-15',
      startDate: moment().add(5, 'days').hour(7).minute(0).toDate(),
      endDate: moment().add(5, 'days').hour(12).minute(0).toDate(),
      allDay: false,
      culture: {
        name: 'Maïs',
        variety: 'Hybride Pioneer',
        surface: 20,
      },
      resources: {
        fertilizerUsage: 600, // kg
        cost: 18000, // MAD
      },
      color: '#10b981',
      domain: domainId,
      createdBy: userId,
    },

    // Tâches d'ouvriers
    {
      type: 'worker_task',
      title: 'Désherbage manuel - Orangeraie',
      description: 'Enlever les mauvaises herbes autour des arbres',
      startDate: moment().add(1, 'days').hour(8).minute(0).toDate(),
      endDate: moment().add(1, 'days').hour(16).minute(0).toDate(),
      allDay: false,
      task: {
        assignedTo: [], // To be filled with worker IDs
        status: 'pending',
        priority: 'medium',
        equipmentNeeded: ['Houes', 'Gants', 'Chapeaux'],
        estimatedDuration: 8,
      },
      resources: {
        cost: 1200, // 3 workers × 400 MAD
      },
      color: '#f59e0b',
      domain: domainId,
      createdBy: userId,
    },
    {
      type: 'worker_task',
      title: 'Réparation système irrigation - Zone B',
      description: 'Réparer la fuite sur le tuyau principal',
      startDate: moment().hour(9).minute(0).toDate(),
      endDate: moment().hour(12).minute(0).toDate(),
      allDay: false,
      task: {
        assignedTo: [],
        status: 'in_progress',
        priority: 'urgent',
        equipmentNeeded: ['Clés', 'Tuyaux de rechange', 'Colle PVC'],
        estimatedDuration: 3,
      },
      resources: {
        cost: 800,
      },
      color: '#f59e0b',
      domain: domainId,
      createdBy: userId,
    },
    {
      type: 'worker_task',
      title: 'Récolte Laitue - Serre 2',
      description: 'Récolte et conditionnement',
      startDate: moment().add(3, 'days').hour(6).minute(0).toDate(),
      endDate: moment().add(3, 'days').hour(11).minute(0).toDate(),
      allDay: false,
      task: {
        assignedTo: [],
        status: 'pending',
        priority: 'high',
        equipmentNeeded: ['Caisses', 'Couteaux', 'Balance'],
        estimatedDuration: 5,
      },
      resources: {
        cost: 2000,
      },
      color: '#f59e0b',
      domain: domainId,
      createdBy: userId,
    },

    // Réunions administratives
    {
      type: 'admin_meeting',
      title: 'Réunion Planning Mensuel',
      description: 'Revue des performances et planification prochaines cultures',
      startDate: moment().add(7, 'days').hour(14).minute(0).toDate(),
      endDate: moment().add(7, 'days').hour(16).minute(0).toDate(),
      allDay: false,
      color: '#3b82f6',
      domain: domainId,
      createdBy: userId,
    },
    {
      type: 'admin_meeting',
      title: 'Visite Agronome',
      description: 'Consultation sur optimisation des rendements',
      startDate: moment().add(10, 'days').hour(10).minute(0).toDate(),
      endDate: moment().add(10, 'days').hour(12).minute(0).toDate(),
      allDay: false,
      color: '#3b82f6',
      domain: domainId,
      createdBy: userId,
    },

    // Livraisons
    {
      type: 'delivery',
      title: 'Livraison Engrais NPK',
      description: '2 tonnes NPK 15-15-15',
      startDate: moment().add(4, 'days').hour(9).minute(0).toDate(),
      allDay: true,
      resources: {
        cost: 24000,
      },
      color: '#8b5cf6',
      domain: domainId,
      createdBy: userId,
    },
    {
      type: 'delivery',
      title: 'Livraison Semences Carotte',
      description: '50 kg semences variété Nantaise',
      startDate: moment().add(6, 'days').hour(11).minute(0).toDate(),
      allDay: true,
      resources: {
        cost: 7500,
      },
      color: '#8b5cf6',
      domain: domainId,
      createdBy: userId,
    },

    // Maintenance
    {
      type: 'maintenance',
      title: 'Révision Tracteur John Deere',
      description: 'Vidange, filtres, contrôle général',
      startDate: moment().add(8, 'days').hour(8).minute(0).toDate(),
      endDate: moment().add(8, 'days').hour(17).minute(0).toDate(),
      allDay: false,
      resources: {
        cost: 3500,
      },
      color: '#ef4444',
      domain: domainId,
      createdBy: userId,
    },
  ];

  try {
    await AgriEvent.deleteMany({ domain: domainId });
    await AgriEvent.insertMany(events);
    console.log(`✅ ${events.length} calendar events seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding calendar events:', error);
  }
};
```

Suite avec guide d'installation et améliorations UX ! 🚀
