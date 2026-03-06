/**
 * Script de vérification et création des indexes MongoDB — Herbute
 *
 * Usage (depuis herbute-backend/) :
 *   npx tsx src/scripts/ensure-indexes.ts
 *
 * Ce script crée tous les indexes définis dans les schemas Mongoose.
 * Sans danger à relancer plusieurs fois (idempotent).
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

// Import des modèles — les schemas contiennent les définitions d'indexes
import { Crop }       from '../modules/agro/crops.model.js';
import { Animal }     from '../modules/agro/animals.model.js';
import AnalysisReport from '../models/AnalysisReport.model.js';

// Couleurs terminal (sans dépendance externe)
const C = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue:   (s: string) => `\x1b[34m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
};

async function ensureIndexes(): Promise<void> {
  console.log(C.bold('\n🗄️  Herbute — Vérification des indexes MongoDB\n'));

  await connectDB();

  // Use a typed array to avoid any-casts below
  const models: Array<{ name: string; model: any }> = [
    { name: 'Crop',           model: Crop           as any },
    { name: 'Animal',         model: Animal         as any },
    { name: 'AnalysisReport', model: AnalysisReport as any },
  ];

  let totalCreated = 0;
  let errors = 0;

  for (const { name, model } of models) {
    try {
      // syncIndexes : crée les manquants, supprime les obsolètes
      await model.syncIndexes();
      const indexes = await model.listIndexes() as Array<Record<string, unknown>>;
      totalCreated += indexes.length;

      console.log(C.green(`✅ ${name}`) + C.dim(` — ${indexes.length} index(es)`));

      for (const idx of indexes) {
        const keys   = JSON.stringify(idx.key);
        const flags  = [
          idx.unique             ? C.yellow('[UNIQUE]')                    : '',
          idx.expireAfterSeconds ? C.blue(`[TTL ${idx.expireAfterSeconds}s]`) : '',
          idx.textIndexVersion   ? C.blue('[TEXT]')                        : '',
          idx.background         ? C.dim('[BG]')                           : '',
        ].filter(Boolean).join(' ');

        console.log(`   ${C.dim('•')} ${keys} ${flags}`);
      }
    } catch (err: any) {
      errors++;
      console.error(C.red(`❌ ${name}:`), err.message);
    }
    console.log('');
  }

  // ─── Résumé ──────────────────────────────────────────────────────────────
  console.log('─'.repeat(50));
  console.log(C.bold('📊 Résumé :'));
  console.log(`   Modèles traités : ${models.length}`);
  console.log(`   Indexes totaux  : ${totalCreated}`);
  if (errors > 0) {
    console.log(C.red(`   Erreurs         : ${errors}`));
  } else {
    console.log(C.green(`   Erreurs         : 0`));
  }
  console.log('─'.repeat(50));
  console.log(C.bold('\n✅ Script terminé.\n'));

  await mongoose.disconnect();
  process.exit(errors > 0 ? 1 : 0);
}

ensureIndexes().catch(err => {
  console.error(C.red('❌ Erreur fatale:'), err);
  process.exit(1);
});
