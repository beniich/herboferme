// backend/seeders/gestionSeeder.ts
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Organization } from '../models/Organization.js';
import AccountingEntry from '../models/AccountingEntry.js';
import Budget from '../models/Budget.js';
import InventoryItem from '../models/InventoryItem.js';
import KnowledgeArticle from '../models/KnowledgeArticle.js';
import AgriTeam from '../models/AgriTeam.js';
import AgriEvent from '../models/AgriEvent.js';
import AIConversation from '../models/AIConversation.js';
import AIPrediction from '../models/AIPrediction.js';
import slugify from 'slugify';

const seedGestion = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting Gestion & Ressources seeding...');

    // Get an existing user and domain/organization
    let user = await User.findOne({ email: 'admin@herbute.com' });
    if (!user) {
      user = await User.findOne();
    }
    
    if (!user) {
      console.log('⚠️  No users found. Creating a temporary seed user...');
      user = await User.create({
        firstName: 'Seed',
        lastName: 'Admin',
        email: 'admin@herbute.com',
        password: 'password123',
        role: 'admin',
        status: 'active'
      });
    }

    let organizationId = user.organizationId;
    if (!organizationId) {
      console.log('⚠️  User has no organizationId. Creating a default "Herbute Farm" organization...');
      let org = await Organization.findOne({ name: 'Herbute Farm' });
      if (!org) {
        org = await Organization.create({
          name: 'Herbute Farm',
          slug: 'herbute-farm',
          email: 'farm@herbute.com',
          ownerId: user._id,
          type: 'farm',
          status: 'active'
        });
      }
      user.organizationId = org._id as any;
      await user.save();
      organizationId = org._id as any;
      console.log(`✅ Organization created and linked: ${org._id}`);
    }

    const domainId = organizationId;
    console.log(`🔹 Seeding for Domain/Org ID: ${domainId}`);
    // --- 1. Accounting Seed ---
    await AccountingEntry.deleteMany({ domain: domainId });
    const currentYear = new Date().getFullYear();
    
    const entries = [
      {
        date: new Date(currentYear, 0, 15),
        reference: `REF-${currentYear}-0001`,
        type: 'income',
        category: 'Vente Récolte',
        account: { number: '701', name: 'Ventes de produits finis' },
        description: 'Vente de 500kg de tomates',
        debit: 0,
        credit: 15000,
        taxRate: 20,
        taxAmount: 3000,
        paymentMethod: 'bank_transfer',
        status: 'validated',
        fiscalYear: currentYear,
        fiscalPeriod: 1,
        domain: domainId,
        createdBy: user._id
      },
      {
        date: new Date(currentYear, 0, 20),
        reference: `REF-${currentYear}-0002`,
        type: 'expense',
        category: 'Engrais',
        account: { number: '601', name: 'Achats de matières premières' },
        description: 'Achat de 10 sacs NPK',
        debit: 4500,
        credit: 0,
        taxRate: 20,
        taxAmount: 900,
        paymentMethod: 'card',
        status: 'validated',
        fiscalYear: currentYear,
        fiscalPeriod: 1,
        domain: domainId,
        createdBy: user._id
      },
      {
        date: new Date(currentYear, 1, 5),
        reference: `REF-${currentYear}-0003`,
        type: 'expense',
        category: 'Maintenance',
        account: { number: '615', name: 'Entretien et réparations' },
        description: 'Réparation Tracteur John Deere',
        debit: 1200,
        credit: 0,
        status: 'draft',
        fiscalYear: currentYear,
        fiscalPeriod: 2,
        domain: domainId,
        createdBy: user._id
      }
    ];
    await AccountingEntry.insertMany(entries);
    console.log('✅ Accounting entries seeded');

    // --- 2. Budget Seed ---
    await Budget.deleteMany({ domain: domainId });
    await Budget.create({
      name: `Budget Annuel ${currentYear}`,
      description: 'Budget global de fonctionnement et investissement',
      fiscalYear: currentYear,
      type: 'operational',
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
      status: 'active',
      totalBudgeted: 500000,
      totalSpent: 4500, // Matching the expense above
      categories: [
        { name: 'Engrais', budgeted: 50000, spent: 4500, remaining: 45500, percentage: 9 },
        { name: 'Semences', budgeted: 30000, spent: 0, remaining: 30000, percentage: 0 },
        { name: 'Main d\'œuvre', budgeted: 200000, spent: 0, remaining: 200000, percentage: 0 },
        { name: 'Énergie', budgeted: 80000, spent: 0, remaining: 80000, percentage: 0 },
        { name: 'Maintenance', budgeted: 40000, spent: 0, remaining: 40000, percentage: 0 }
      ],
      alerts: [
        { category: 'Engrais', threshold: 80, triggered: false }
      ],
      domain: domainId,
      createdBy: user._id
    });
    console.log('✅ Budgets seeded');

    // --- 3. Inventory Seed ---
    await InventoryItem.deleteMany({ domain: domainId });
    const inventory = [
      {
        name: 'Tracteur Massey Ferguson',
        category: 'equipment',
        code: 'INV-2026-0001',
        quantity: 1,
        unit: 'unit',
        minQuantity: 0,
        unitPrice: 350000,
        location: { storage: 'Hangar Principal', section: 'A1' },
        condition: 'good',
        maintenanceSchedule: { frequency: 'yearly', nextMaintenance: new Date(currentYear, 5, 15) },
        domain: domainId,
        createdBy: user._id
      },
      {
        name: 'Engrais NPK 15-15-15',
        category: 'fertilizer',
        code: 'INV-2026-0002',
        quantity: 5, // Low stock (min is 10)
        unit: 'kg',
        minQuantity: 10,
        unitPrice: 45,
        location: { storage: 'Entrepôt Engrais', section: 'B' },
        domain: domainId,
        createdBy: user._id
      },
      {
        name: 'Semences de Blé Tendres',
        category: 'seed',
        code: 'INV-2026-0003',
        quantity: 500,
        unit: 'kg',
        minQuantity: 100,
        unitPrice: 12,
        location: { storage: 'Chambre Froide', section: 'C2' },
        expiryDate: new Date(currentYear + 1, 0, 1),
        domain: domainId,
        createdBy: user._id
      }
    ];
    await InventoryItem.insertMany(inventory);
    console.log('✅ Inventory items seeded');

    // --- 4. Teams and Events Seed ---
    await AgriTeam.deleteMany({ domain: domainId });
    await AgriEvent.deleteMany({ domain: domainId });
    
    const team1 = await AgriTeam.create({ name: 'Équipe Céréales', type: 'cultures', leader: user._id, status: 'active', domain: domainId, createdBy: user._id });
    const team2 = await AgriTeam.create({ name: 'Équipe Engins', type: 'maintenance', leader: user._id, status: 'active', domain: domainId, createdBy: user._id });

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

    await AgriEvent.create([
        {
            title: 'Semis Parcelle B',
            type: 'culture_cycle',
            startDate,
            endDate,
            assignedTeam: team1._id,
            status: 'planned',
            priority: 'high',
            domain: domainId,
            createdBy: user._id
        },
        {
            title: 'Maintenance Tracteur John',
            type: 'maintenance',
            startDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000), // tomorrow
            endDate: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
            assignedTeam: team2._id,
            status: 'planned',
            priority: 'medium',
            domain: domainId,
            createdBy: user._id
        }
    ]);
    console.log('✅ Teams and Events seeded');

    // --- 5. AI Data Seed ---
    await AIConversation.deleteMany({ userId: user._id as any });
    await AIConversation.create({
        userId: user._id,
        title: 'Analyse mildiou',
        messages: [
            { role: 'user', content: 'J\'ai des taches blanches sur mes feuilles de tomates', timestamp: new Date() },
            { role: 'assistant', content: 'Cela ressemble à du mildiou. Je vous conseille d\'appliquer un traitement cuprique rapidement.', timestamp: new Date() }
        ],
        model: 'gpt-4-agro'
    });

    await AIPrediction.deleteMany({ domainId });
    await AIPrediction.create([
        { domainId, type: 'yield', target: 'Blé Dur (Parcelle A)', predictionData: { estimatedYield: '45 qx/ha', variance: '+/- 2 qx' }, confidence: 90 },
        { domainId, type: 'disease', target: 'Tomates (Serre 1)', predictionData: { riskLevel: 'Élevé', recommendation: 'Ventiler immédiatement' }, confidence: 85 }
    ]);
    console.log('✅ AI Data seeded');

    // --- 6. Knowledge Base Seed ---
    await KnowledgeArticle.deleteMany({ domain: domainId });
    const articles = [
      {
        title: 'Guide de semis du Blé',
        slug: (slugify as any).default('Guide de semis du Blé', { lower: true }) + '-' + Date.now(),
        category: 'guide',
        content: '# Guide complet pour le semis du blé\n\n1. Préparation du sol...\n2. Dosage de l\'engrais...\n3. Période idéale...',
        summary: 'Instructions pas à pas pour réussir sa récolte de blé.',
        tags: ['blé', 'semis', 'céréales'],
        author: user._id,
        status: 'published',
        publishedAt: new Date(),
        views: 124,
        helpful: { yes: 15, no: 1 },
        domain: domainId
      },
      {
        title: 'Procédure Maintenance Tracteur',
        slug: (slugify as any).default('Procédure Maintenance Tracteur', { lower: true }) + '-' + Date.now(),
        category: 'procedure',
        content: '## Routine hebdomadaire\n\n- Vérifier les niveaux d\'huile\n- Pression des pneus...',
        summary: 'Étapes à suivre pour l\'entretien du matériel motorisé.',
        tags: ['maintenance', 'mécanique', 'tracteur'],
        author: user._id,
        status: 'published',
        publishedAt: new Date(),
        views: 45,
        helpful: { yes: 8, no: 0 },
        domain: domainId
      }
    ];
    await KnowledgeArticle.insertMany(articles);
    console.log('✅ Knowledge articles seeded');

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedGestion();
