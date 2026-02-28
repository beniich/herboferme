/**
 * jobs/sync.cron.ts — Tâches CRON de synchronisation automatique
 *
 * Lance un scan toutes les 5 minutes pour trouver les DataSources
 * dont l'intervalle de sync est dépassé, et les synchroniser.
 *
 * Utilise node-cron (npm install node-cron @types/node-cron)
 */

import cron from 'node-cron';
import { DataSource } from '../models/datasource.model.js';
import { syncDataSource } from '../services/sync.service.js';

let isRunning = false;

const runAutoSync = async () => {
  if (isRunning) return; // Éviter les chevauchements
  isRunning = true;

  try {
    const now = new Date();

    // Trouver les sources qui ont besoin d'une sync :
    // - autoSync activé
    // - isActive
    // - (jamais syncé) OU (lastSyncAt + intervalMin < maintenant)
    const due = await DataSource.find({
      autoSync:       true,
      isActive:       true,
      lastSyncStatus: { $ne: 'syncing' },
      $or: [
        { lastSyncAt: { $exists: false } },
        {
          $expr: {
            $lt: [
              '$lastSyncAt',
              {
                $subtract: [
                  now,
                  { $multiply: ['$syncIntervalMin', 60 * 1000] },
                ],
              },
            ],
          },
        },
      ],
    }).limit(20); // Max 20 syncs simultanées par cycle

    if (due.length > 0) {
      console.log(`🔄 [CRON] ${due.length} source(s) à synchroniser...`);

      for (const source of due) {
        await syncDataSource(String(source._id)).catch(err => {
          console.error(`[CRON] Erreur sync ${source.name}:`, err.message);
        });
      }
    }
  } finally {
    isRunning = false;
  }
};

/**
 * Démarre le CRON de sync automatique.
 * À appeler dans server.ts après la connexion MongoDB.
 */
export const startSyncCron = () => {
  // Toutes les 5 minutes
  cron.schedule('*/5 * * * *', runAutoSync);

  console.log('⏰ [CRON] Sync automatique démarré (vérification toutes les 5 min)');

  // Premier run immédiat au démarrage
  setTimeout(runAutoSync, 10_000);
};
