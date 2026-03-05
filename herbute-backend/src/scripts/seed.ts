import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import { Team } from '../models/Team.js';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { Staff } from '../models/Staff.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { Animal } from '../modules/agro/animals.model.js';
import { Crop } from '../modules/agro/crops.model.js';
import { FarmKPI, FarmTransaction } from '../modules/agro/finance.model.js';
import { IrrigationLog } from '../modules/agro/irrigation.model.js';
import ITAsset from '../models/ITAsset.js';
import ITTicket from '../models/ITTicket.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

config();

const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI not defined');

        await mongoose.connect(mongoUri);
        logger.info('✅ Connected to MongoDB');

        // Clear existing
        await Promise.all([
            User.deleteMany({}),
            Team.deleteMany({}),
            Complaint.deleteMany({}),
            Staff.deleteMany({}),
            Organization.deleteMany({}),
            Membership.deleteMany({}),
            Animal.deleteMany({}),
            Crop.deleteMany({}),
            FarmKPI.deleteMany({}),
            FarmTransaction.deleteMany({}),
            IrrigationLog.deleteMany({}),
            ITAsset.deleteMany({}),
            ITTicket.deleteMany({})
        ]);

        // Hash password
        const passwordHash = await bcrypt.hash('Admin123!', 10);

        // Create Admin
        const admin = await User.create({
            email: 'admin@reclamtrack.com',
            passwordHash,
            nom: 'Benali',
            prenom: 'Ahmed',
            role: 'super_admin',
            emailVerified: true
        });

        const org = await Organization.create({
            name: 'Domaine Al Baraka',
            slug: 'al-baraka',
            ownerId: admin._id,
            subscription: {
                plan: 'ENTERPRISE',
                status: 'ACTIVE'
            }
        });

        await Membership.create({
            userId: admin._id,
            organizationId: org._id,
            roles: ['OWNER', 'ADMIN'],
            status: 'ACTIVE'
        });

        // --- SEED AGRICULTURE ---
        
        // Add Transactions for Stats
        await FarmTransaction.create([
            { organizationId: org._id, description: 'Vente Menthe Fine', category: 'VENTE', sector: 'Herbes', type: 'recette', amount: 45000, date: new Date() },
            { organizationId: org._id, description: 'Vente Tomates Cerises', category: 'VENTE', sector: 'Légumes', type: 'recette', amount: 120000, date: new Date() },
            { organizationId: org._id, description: 'Achat Engrais Azoté', category: 'INTRANT', sector: 'Cultures', type: 'depense', amount: 35000, date: new Date() },
            { organizationId: org._id, description: 'Maintenance Système Pompe', category: 'MAINTENANCE', sector: 'Irrigation', type: 'depense', amount: 12000, date: new Date() },
            { organizationId: org._id, description: 'Vente Lait (Mois)', category: 'VENTE', sector: 'Élevage', type: 'recette', amount: 85000, date: new Date() }
        ]);

        await FarmKPI.create({
            organizationId: org._id,
            totalRevenue: 250000,
            totalExpenses: 47000,
            netProfit: 203000,
            cashFlow: 150000,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });

        await Animal.create([
            { organizationId: org._id, type: 'Vaches Laitières', breed: 'Holstein', count: 42, averageAge: 36, status: 'PRODUCTION', estimatedValue: 840000 },
            { organizationId: org._id, type: 'Moutons', breed: 'Sardi', count: 120, averageAge: 12, status: 'ACTIVE', estimatedValue: 240000 },
            { organizationId: org._id, type: 'Poulets de chair', breed: 'Cobb 500', count: 12400, averageAge: 1, status: 'GROWING', estimatedValue: 310000 }
        ]);

        await Crop.create([
            { organizationId: org._id, name: 'Menthe Nanah', category: 'HERB', plotId: 'P1-HERB', status: 'GROWING', estimatedYield: 5000 },
            { organizationId: org._id, name: 'Tomates Cerises', category: 'VEGETABLE', plotId: 'P2-LEG', status: 'READY', estimatedYield: 8000 },
            { organizationId: org._id, name: 'Oliviers', category: 'NURSERY', plotId: 'P3-PEP', status: 'PLANTED', estimatedYield: 2000 }
        ]);

        await IrrigationLog.create([
            { organizationId: org._id, plotId: 'P1-HERB', volume: 450, duration: 120, method: 'DRIP', date: new Date() },
            { organizationId: org._id, plotId: 'P2-LEG', volume: 800, duration: 180, method: 'SPRINKLER', date: new Date() }
        ]);

        logger.info('🌾 Seeding Agriculture: OK');

        // --- SEED IT (GLPI) ---
        const asset = await ITAsset.create({
            organizationId: org._id,
            name: 'Serveur Central ERP',
            type: 'server',
            status: 'active',
            assetTag: 'SRV-001',
            hostname: 'erp-prod',
            ipAddress: '192.168.1.10'
        });

        await ITTicket.create([
            {
                organizationId: org._id,
                title: 'Panne Système Irrigation Wi-Fi',
                description: 'Le contrôleur P2 ne répond plus au ping.',
                status: 'new',
                priority: 'urgent',
                category: 'network',
                requestedBy: admin._id,
                relatedAsset: asset._id,
                ticketNumber: 'INC-2026-001'
            },
            {
                organizationId: org._id,
                title: 'Mise à jour BIOS Tablette Terrain',
                description: 'Besoin de mise à jour pour le nouveau module GPS.',
                status: 'pending',
                priority: 'medium',
                category: 'hardware',
                requestedBy: admin._id,
                ticketNumber: 'REQ-2026-002'
            }
        ]);

        logger.info('💻 Seeding IT/GLPI: OK');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
