import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

// Mock models
vi.mock('../models/Complaint.js', () => ({
    Complaint: {
        aggregate: vi.fn()
    }
}));
vi.mock('../models/Team.js', () => ({
    Team: {
        aggregate: vi.fn()
    }
}));
vi.mock('../models/Animal.js', () => ({
    default: {
        aggregate: vi.fn()
    }
}));
vi.mock('../models/Crop.js', () => ({
    default: {
        aggregate: vi.fn()
    }
}));
vi.mock('../models/FarmKPI.js', () => ({
    default: {
        findOne: vi.fn()
    }
}));
vi.mock('../models/ITTicket.js', () => ({
    default: {
        aggregate: vi.fn()
    }
}));

// Mock middleware
vi.mock('../middleware/security.js', () => ({
    authenticate: (req: Request, res: Response, next: NextFunction) => next(),
    requireOrganization: (req: Request & { organizationId?: string }, res: Response, next: NextFunction) => {
        req.organizationId = '507f1f77bcf86cd799439011';
        next();
    }
}));

vi.mock('../middleware/cache.js', () => ({
    cacheMiddleware: () => (req: Request, res: Response, next: NextFunction) => next(),
    CACHE_TTL: { dashboard: 120 }
}));

import { Complaint } from '../models/Complaint.js';
import { Team } from '../models/Team.js';
import Animal from '../models/Animal.js';
import Crop from '../models/Crop.js';
import FarmKPI from '../models/FarmKPI.js';
import ITTicket from '../models/ITTicket.js';
import router from '../routes/dashboard.js';
import express from 'express';
import request from 'supertest';

const app = express();
app.use(express.json());
app.use('/api/dashboard', router);

describe('Dashboard Route', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return consolidated dashboard data', async () => {
        // Setup mock returns
        vi.mocked(FarmKPI.findOne).mockReturnValue({
            sort: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue({ totalRevenue: 1000, netProfit: 500 })
        } as any);
        vi.mocked(Animal.aggregate).mockResolvedValue([{ total: 100, poultry: 60, bovine: 40 }]);
        vi.mocked(Crop.aggregate).mockResolvedValue([{ _id: 'HERB', count: 5 }]);
        vi.mocked(ITTicket.aggregate).mockResolvedValue([{
            total: [{ count: 10 }],
            byStatus: [{ _id: 'new', count: 5 }],
            byPriority: [{ _id: 'high', count: 2 }],
            slaBreach: [{ count: 1 }]
        }]);
        vi.mocked(Complaint.aggregate).mockResolvedValue([{
            total: [{ count: 20 }],
            byStatus: [{ _id: 'nouvelle', count: 10 }]
        }]);
        vi.mocked(Team.aggregate).mockResolvedValue([{ name: 'Team A', color: 'red', activeAssignments: 2 }]);

        const response = await request(app).get('/api/dashboard');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Check Agro
        expect(response.body.agro.financials.totalRevenue).toBe(1000);
        expect(response.body.agro.cheptel.total).toBe(100);
        expect(response.body.agro.cultures.categories).toHaveLength(1);

        // Check IT
        expect(response.body.it.total).toBe(10);
        expect(response.body.it.slaBreach).toBe(1);

        // Check Maintenance
        expect(response.body.maintenance.total).toBe(20);
        expect(response.body.maintenance.byStatus['nouvelle']).toBe(10);
        expect(response.body.maintenance.teamStats).toHaveLength(1);
    });

    it('should handle empty results gracefully', async () => {
        vi.mocked(FarmKPI.findOne).mockReturnValue({
            sort: vi.fn().mockReturnThis(),
            lean: vi.fn().mockResolvedValue(null)
        } as any);
        vi.mocked(Animal.aggregate).mockResolvedValue([]);
        vi.mocked(Crop.aggregate).mockResolvedValue([]);
        vi.mocked(ITTicket.aggregate).mockResolvedValue([{ total: [], byStatus: [], byPriority: [], slaBreach: [] }]);
        vi.mocked(Complaint.aggregate).mockResolvedValue([{ total: [], byStatus: [] }]);
        vi.mocked(Team.aggregate).mockResolvedValue([]);

        const response = await request(app).get('/api/dashboard');

        expect(response.status).toBe(200);
        expect(response.body.agro.cheptel.total).toBe(0);
        expect(response.body.it.total).toBe(0);
        expect(response.body.maintenance.total).toBe(0);
    });
});
