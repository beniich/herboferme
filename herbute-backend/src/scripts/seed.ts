import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import { Team } from '../models/Team.js';
import { Complaint } from '../models/Complaint.js';
import { Staff } from '../models/Staff.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
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
        logger.info('    Connected to MongoDB');

        // Clear existing
        await Promise.all([
            User.deleteMany({ /* Intentionally empty */ }),
            Team.deleteMany({ /* Intentionally empty */ }),
            Complaint.deleteMany({ /* Intentionally empty */ }),
            Staff.deleteMany({ /* Intentionally empty */ }),
            Organization.deleteMany({ /* Intentionally empty */ }),
            Membership.deleteMany({ /* Intentionally empty */ }),
            Animal.deleteMany({ /* Intentionally empty */ }),
            Crop.deleteMany({ /* Intentionally empty */ }),
            FarmKPI.deleteMany({ /* Intentionally empty */ }),
            ITAsset.deleteMany({ /* Intentionally empty */ }),
            ITTicket.deleteMany({ /* Intentionally empty */ })
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
        await FarmKPI.create({
            organizationId: org._id,
            totalRevenue: 1480000,
            totalExpenses: 892000,
            netProfit: 588000,
            cashFlow: 284000,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });

        await Animal.create([
            { organizationId: org._id, type: 'Vaches Laiti  res', breed: 'Holstein', count: 42, averageAge: 36, status: 'PRODUCTION', estimatedValue: 840000 },
            { organizationId: org._id, type: 'Moutons', breed: 'Sardi', count: 120, averageAge: 12, status: 'ACTIVE', estimatedValue: 240000 },
            { organizationId: org._id, type: 'Poulets de chair', breed: 'Cobb 500', count: 12400, averageAge: 1, status: 'GROWING', estimatedValue: 310000 }
        ]);

        await Crop.create([
            { organizationId: org._id, name: 'Menthe Nanah', category: 'HERB', plotId: 'P1-HERB', status: 'GROWING', estimatedYield: 5000 },
            { organizationId: org._id, name: 'Tomates Cerises', category: 'VEGETABLE', plotId: 'P2-LEG', status: 'READY', estimatedYield: 8000 },
            { organizationId: org._id, name: 'Oliviers', category: 'NURSERY', plotId: 'P3-PEP', status: 'PLANTED', estimatedYield: 2000 }
        ]);

        logger.info('     Seeding Agriculture: OK');

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
                title: 'Panne Syst  me Irrigation Wi-Fi',
                description: 'Le contr  leur P2 ne r  pond plus au ping.',
                status: 'new',
                priority: 'urgent',
                category: 'network',
                requestedBy: admin._id,
                relatedAsset: asset._id,
                ticketNumber: 'INC-2026-001'
            },
            {
                organizationId: org._id,
                title: 'Mise    jour BIOS Tablette Terrain',
                description: 'Besoin de mise    jour pour le nouveau module GPS.',
                status: 'pending',
                priority: 'medium',
                category: 'hardware',
                requestedBy: admin._id,
                ticketNumber: 'REQ-2026-002'
            }
        ]);

        logger.info('     Seeding IT/GLPI: OK');

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
