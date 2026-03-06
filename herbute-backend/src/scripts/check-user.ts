
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

const checkUser = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI missing');

        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const email = 'admin@reclamtrack.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('âŒ User NOT found');
        } else {
            console.log('âœ… User found:', user.email);
            console.log('   Role:', user.role);
            console.log('   Password Hash:', (user as any).passwordHash ? 'Exists' : 'Missing');
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkUser();
