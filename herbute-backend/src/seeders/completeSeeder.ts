import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AgriEvent from '../models/AgriEvent.js';
import AgriTeam from '../models/AgriTeam.js';
import Attendance from '../models/Attendance.js';
import Task from '../models/Task.js';
import { User } from '../models/user.model.js';
// We also need some Workers and Plots to reference.
// The guide assumed they existed. In Herbute we have users and maybe crops/plots. 
// We will just create dummy ones if needed or use valid ObjectIds.
// Let's create some dummy users to act as workers/leaders.

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/herbute';
const DOMAIN_ID = new mongoose.Types.ObjectId(); // Mock domain ID

const seedData = async () => {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    
    // Check if we have at least one valid user/admin to be the creator
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
        admin = await User.findOne();
    }
    const adminId = admin ? admin._id : new mongoose.Types.ObjectId();
    const domainId = admin?.organizationId || DOMAIN_ID; // Use admin's organizationId as domain

    // Create 3 dummy workers
    const worker1Id = new mongoose.Types.ObjectId();
    const worker2Id = new mongoose.Types.ObjectId();
    const worker3Id = new mongoose.Types.ObjectId();
    
    // Create a dummy plot
    const plotId = new mongoose.Types.ObjectId();

    console.log('🧹 Clearing existing AgroMaître data...');
    await Promise.all([
      AgriEvent.deleteMany({}),
      AgriTeam.deleteMany({}),
      Attendance.deleteMany({}),
      Task.deleteMany({})
    ]);

    // 1. Seed Teams
    console.log('👥 Creating Teams...');
    const teams = await AgriTeam.create([
      {
        name: 'Équipe AlphA - Cultures',
        description: 'Responsable des cultures sous serres 1 à 4',
        type: 'cultures',
        leader: worker1Id,
        members: [
          { worker: worker1Id, role: 'leader' },
          { worker: worker2Id, role: 'operator' },
          { worker: worker3Id, role: 'helper' }
        ],
        currentSize: 3,
        status: 'active',
        equipment: ['Tracteur T1', 'Semoir S2'],
        specializations: ['Tomates', 'Poivrons'],
        performance: {
          tasksCompleted: 42,
          tasksOnTime: 40,
          avgQualityScore: 92,
          lastUpdated: new Date()
        },
        domain: domainId,
        createdBy: adminId
      },
      {
        name: 'Équipe Beta - Irrigation',
        description: 'Maintenance du système goutte-à-goutte',
        type: 'irrigation',
        leader: worker2Id,
        members: [
          { worker: worker2Id, role: 'leader' }
        ],
        currentSize: 1,
        status: 'active',
        equipment: ['Kits de réparation, Pompes'],
        specializations: ['Hydraulique'],
        domain: domainId,
        createdBy: adminId
      }
    ]);

    // 2. Seed Calendar Events
    console.log('📅 Creating Calendar Events...');
    const today = new Date();
    
    await AgriEvent.create([
      {
        type: 'culture_cycle',
        title: 'Cycle Tomates Hivernales',
        startDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        endDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), // in 60 days
        allDay: true,
        culture: {
          name: 'Tomate',
          variety: 'Cerise',
          surface: 2.5,
          plotId: plotId
        },
        domain: domainId,
        createdBy: adminId,
        color: '#10B981', // green
      },
      {
        type: 'worker_task',
        title: 'Désherbage Parcelle A',
        startDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow 
        endDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // Tomorrow + 4 hours
        task: {
          assignedTo: [worker1Id, worker2Id],
          status: 'pending',
          priority: 'medium',
          estimatedDuration: 4
        },
        domain: domainId,
        createdBy: adminId,
        color: '#3B82F6', // blue
      },
      {
        type: 'delivery',
        title: 'Livraison Engrais NPK',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
        allDay: true,
        domain: domainId,
        createdBy: adminId,
        color: '#F59E0B', // yellow
      }
    ]);

    // 3. Seed Attendance
    console.log('🕒 Creating Attendance Records...');
    await Attendance.create([
      {
        worker: worker1Id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'present',
        checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).setHours(7, 55, 0, 0),
        checkOut: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).setHours(17, 10, 0, 0),
        workHours: 8.25,
        breakMinutes: 60,
        overtime: 0.25,
        domain: domainId,
      },
      {
        worker: worker2Id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'late',
        checkIn: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).setHours(8, 30, 0, 0),
        checkOut: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).setHours(17, 0, 0, 0),
        workHours: 7.5,
        domain: domainId,
      },
      {
        worker: worker3Id,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        status: 'absent',
        domain: domainId,
      }
    ]);

    // 4. Seed Tasks
    console.log('✅ Creating Operation Tasks...');
    await Task.create([
      {
        title: 'Réparation Pompe P-01',
        description: 'La pompe fuit au niveau du raccord principal.',
        type: 'maintenance',
        priority: 'high',
        status: 'pending',
        assignedTo: [worker2Id],
        team: teams[1]._id,
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        estimatedHours: 3,
        resources: {
           materials: ['Joint torique', 'Mastic']
        },
        domain: domainId,
        createdBy: adminId
      },
      {
        title: 'Inspection Phytosanitaire',
        description: 'Vérifier la présence de pucerons sur serre 3.',
        type: 'inspection',
        priority: 'medium',
        status: 'completed',
        assignedTo: [worker1Id],
        team: teams[0]._id,
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        completedDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        estimatedHours: 2,
        actualHours: 1.5,
        quality: {
          score: 95
        },
        domain: domainId,
        createdBy: adminId
      }
    ]);

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ SEED ERROR:', error);
    process.exit(1);
  }
};

seedData();
