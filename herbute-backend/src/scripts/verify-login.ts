
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

const testLogin = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI missing');

        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        const email = 'admin@reclamtrack.com';
        const password = 'Admin123!';

        // Select passwordHash explicitly since it has `select: false`
        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            console.log('    User NOT found');
            process.exit(1);
        }

        console.log('    User found:', user.email);

        const storedHash = (user as any).passwordHash;
        if (!storedHash) {
            console.log('    Password hash missing from DB record');
            process.exit(1);
        }

        const isMatch = await bcrypt.compare(password, storedHash);
        if (isMatch) {
            console.log('    Password Match: SUCCESS');
        } else {
            console.log('    Password Match: FAILED');
            console.log('Stored Hash:', storedHash);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

testLogin();
