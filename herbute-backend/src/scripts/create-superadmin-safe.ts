import mongoose from 'mongoose';
import { config } from 'dotenv';
import { User } from '../models/user.model.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

const createSuperAdmin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI not defined');

        await mongoose.connect(mongoUri);
        logger.info('    Connected to MongoDB');

        const email = 'superadmin@herbute.ma';
        const passwordPlain = 'SuperAdmin2026!';

        // Check if user already exists
        let admin = await User.findOne({ email });

        if (!admin) {
            const passwordHash = await bcrypt.hash(passwordPlain, 10);
            admin = await User.create({
                email,
                passwordHash,
                nom: 'Admin',
                prenom: 'Super',
                role: 'super_admin',
                plan: 'entreprise', // important for access
                emailVerified: true
            });
            logger.info('    Super Admin user created: ' + email);
        } else {
            // Update password just in case
            const passwordHash = await bcrypt.hash(passwordPlain, 10);
            admin.passwordHash = passwordHash;
            admin.role = 'super_admin';
            admin.plan = 'entreprise';
            await admin.save();
            logger.info('    Super Admin user updated: ' + email);
        }

        // Check if org exists
        let org = await Organization.findOne({ slug: 'herbute-hq' });
        if (!org) {
            org = await Organization.create({
                name: 'Herbute HQ',
                slug: 'herbute-hq',
                ownerId: admin._id,
                subscription: {
                    plan: 'ENTERPRISE',
                    status: 'ACTIVE'
                }
            });
            logger.info('    Organization created');
        }

        // Check membership
        const membership = await Membership.findOne({ userId: admin._id, organizationId: org._id });
        if (!membership) {
            await Membership.create({
                userId: admin._id,
                organizationId: org._id,
                roles: ['OWNER', 'ADMIN'],
                status: 'ACTIVE'
            });
            logger.info('    Membership created');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createSuperAdmin();
