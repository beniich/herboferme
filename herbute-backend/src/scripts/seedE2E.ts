import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint';
import { User } from '../models/user.model';
import { Team } from '../models/Team';
import { connectDB } from '../config/db';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const seedE2E = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected!');

        console.log('Cleaning old data...');
        // await Team.deleteMany({ /* Intentionally empty */ });
        // await Complaint.deleteMany({ /* Intentionally empty */ });
        // await User.deleteMany({ email: { $regex: /@reclamtrack.com/ } }); 

        // 1. Create Technicians
        const techs = [
            { name: 'Mario Plumber', email: 'mario@reclamtrack.com', role: 'technician', type: 'plumbing' },
            { name: 'Luigi Electric', email: 'luigi@reclamtrack.com', role: 'technician', type: 'electrical' }
        ];

        const createdTechs: any[] = [];
        for (const t of techs) {
            let user = await User.findOne({ email: t.email });
            if (!user) {
                user = await User.create({
                    name: t.name,
                    email: t.email,
                    password: 'password123',
                    role: t.role,
                    specialization: t.type
                });
            }
            createdTechs.push(user);
            console.log(`User ready: ${user.email}`);
        }

        // 2. Create Teams with Locations & Specializations
        const teamsData = [
            {
                name: 'Alpha Plomberie',
                specialization: 'plumbing, water, sewage',
                baseLocation: { latitude: 34.020882, longitude: -6.841650 }, // Agdal
                color: '#3b82f6',
                members: [createdTechs[0]._id],
                isActive: true
            },
            {
                name: 'Beta Electricit    ',
                specialization: 'electrical, lighting',
                baseLocation: { latitude: 33.971590, longitude: -6.849813 }, // Hay Riad
                color: '#f59e0b',
                members: [createdTechs[1]._id],
                isActive: true
            }
        ];

        for (const t of teamsData) {
            await Team.create(t);
            console.log(`Team created: ${t.name} (${t.specialization})`);
        }

        // 3. Create a Test Complaint (Unassigned) to verify auto-scheduler later?
        // Actually, the checklist asks to create it manually or via flow. 
        // But having a 'seed' complaint useful for listing.
        await Complaint.create({
            title: 'Fuite Robinet Simple',
            description: 'Petite fuite au niveau du rdc',
            status: 'nouvelle',
            priority: 'low',
            category: 'water',
            subcategory: 'Fuite d\'eau',
            address: 'Avenue de France, Agdal',
            city: 'Rabat',
            district: 'Agdal',
            location: { latitude: 34.020000, longitude: -6.840000 }, // Near Alpha team
            createdBy: createdTechs[0]._id
        });
        console.log('Seed complaint created (Low priority, Water)');

        console.log('        E2E Seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedE2E();
