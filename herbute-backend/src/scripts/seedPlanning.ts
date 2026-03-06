import mongoose from 'mongoose';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { User } from '../models/user.model.js';
import { Team } from '../models/Team.js';
import { Intervention } from '../models/Intervention.js';
import { Roster } from '../models/Roster.js';
import { Staff } from '../models/Staff.js';
import { connectDB } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';

// Check if we are running from dist or src
const envPath = path.resolve(process.cwd(), '.env');

dotenv.config({ path: envPath });

const seedPlanning = async () => {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected!');

        console.log('Cleaning old planning data...');
        await Intervention.deleteMany({});
        await Roster.deleteMany({});
        await Staff.deleteMany({}); // Optional: clear staff to ensure clean slate

        // 1. Get or Create Users/Teams
        let technician = await User.findOne({ role: 'employe' });
        if (!technician) {
            console.log('Creating default technician...');
            technician = await User.create({
                nom: 'Technician',
                prenom: 'Default',
                email: 'tech@reclamtrack.com',
                passwordHash: '$2b$10$examplehashfortesting1234567891', // Pre-hashed placeholder
                role: 'employe',
                plan: 'essai'
            });
        }

        let team = await Team.findOne();
        if (!team) {
            console.log('Creating default team...');
            team = await Team.create({
                name: 'Maintenance Squad',
                color: '#3b82f6',
                members: [technician._id]
            });
        }

        let complaint = await Complaint.findOne();
        if (!complaint) {
            console.log('Creating default complaint...');
            complaint = await Complaint.create({
                title: 'Seed Complaint',
                description: 'Created by seed script',
                status: 'nouvelle',
                priority: 'medium',
                category: 'General',
                subcategory: 'Other',
                address: '123 Seed St',
                city: 'Seed City',
                district: 'Seed District'
            });
        }

        // 2. Create Staff (Mirrors Users for Roster purposes in this app logic)
        // Note: Realistically Staff and User should be linked or same collection. 
        // For now, Roster uses 'Staff' model, so let's create one.
        const staffMember = await Staff.create({
            name: `${technician.nom} ${technician.prenom}` || 'Technician 1',
            role: 'Technician',
            email: technician.email,
            phone: '0600000000',
            status: 'active',
            skills: ['Plumbing', 'Electrical'],
            teamId: team._id
        });
        console.log(`Created Staff: ${staffMember.name}`);

        // 3. Create Roster for "2024-W43" (Matches the frontend default state)
        // Ideally we should calculate current week, but frontend hardcoded "2024-W43" in the state 
        // (I saw `const [currentWeek, setCurrentWeek] = useState('2024-W43');`)
        // Let's seed THAT week so it shows up immediately.

        await Roster.create({
            week: '2024-W43',
            shifts: [
                {
                    staffId: staffMember._id,
                    days: {
                        monday: '08:00 - 16:00',
                        tuesday: '08:00 - 16:00',
                        wednesday: '08:00 - 12:00',
                        thursday: 'OFF',
                        friday: '09:00 - 17:00',
                        saturday: 'OFF',
                        sunday: 'OFF'
                    }
                }
            ]
        });
        console.log('Created Roster for 2024-W43');

        // 4. Create Interventions (Planning)
        // Create one for today/tomorrow relative to now
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Align with 2024-W43 if possible? 
        // 2024-W43 is roughly Oct 23-29, 2023. 
        // Providing data for "Now" might not show up if calendar is fixed to 2023.
        // Let's check the frontend Calendar... it uses FullCalendar default view.
        // Usually FullCalendar defaults to "today".
        // The Roster page had hardcoded week. The Planning page might handle current date.
        // Let's add interventions for NOW (so Planning page works) AND for Oct 2023 (so Roster page context makes sense if dates align).

        await Intervention.create({
            complaintId: complaint._id,
            teamId: team._id,
            title: 'Intervention Urgente',
            description: 'Fuite d\'eau majeure',
            start: new Date(now.setHours(9, 0, 0)),
            end: new Date(now.setHours(11, 0, 0)),
            priority: 'high',
            status: 'scheduled',
            location: 'Etage 3, Bloc B',
            assignedTechnicians: [technician._id]
        });

        console.log('Created Intervention for Today');

        console.log('âœ… Seeding completed!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedPlanning();
