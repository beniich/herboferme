import ExcelJS from 'exceljs';
import { Request, Response, Router } from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { authenticate as auth } from '../middleware/security.js';
import { requireOrganization } from '../middleware/security.js';
import { Complaint } from '../modules/complaint/complaint.model.js';
import { Feedback } from '../models/Feedback.js';
import { Organization } from '../models/Organization.js';
import { saveExport } from '../services/storageService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Apply organization context
router.use(auth, requireOrganization);

// GET /api/analytics/satisfaction - Métriques de satisfaction
router.get('/satisfaction', async (req: Request, res: Response) => {
  try {
    const { range = '30d' } = req.query;
    // Date fltering logic can be added here based on 'range'
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Default 30 days

    const matchStage: any = {
      createdAt: { $gte: startDate },
      organizationId: (req as any).organizationId,
    };

    // 1. Calculate Average Rating & Total Responses
    const ratingStats = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalResponses: { $sum: 1 },
          // Calculate satisfaction rate (ratings >= 4)
          satisfiedCount: {
            $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalResponses: 0, satisfiedCount: 0 };
    const satisfactionRate =
      stats.totalResponses > 0
        ? Math.round((stats.satisfiedCount / stats.totalResponses) * 100)
        : 0;

    // 2. Rating Distribution
    const distribution = await Feedback.aggregate([
      { $match: matchStage },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    // Map distribution to UI format
    const distributionMap: Record<number, any> = {
      5: { name: 'Très satisfait', color: '#22c55e' },
      4: { name: 'Satisfait', color: '#84cc16' },
      3: { name: 'Neutre', color: '#eab308' },
      2: { name: 'Insatisfait', color: '#f97316' },
      1: { name: 'Très insatisfait', color: '#ef4444' },
    };

    const formattedDistribution = [5, 4, 3, 2, 1].map((rating) => ({
      name: distributionMap[rating].name,
      value: distribution.find((d) => d._id === rating)?.count || 0,
      color: distributionMap[rating].color,
    }));

    // 3. Category Ratings
    const categoryRatings = await Feedback.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', rating: { $avg: '$rating' } } },
      { $project: { category: '$_id', rating: { $round: ['$rating', 1] }, max: { $literal: 5 } } },
    ]);

    // 4. Recent Feedback
    const recentFeedback = await Feedback.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('rating comment category createdAt');

    // Construct response
    const satisfactionData = {
      averageRating: stats.averageRating ? Number(stats.averageRating.toFixed(1)) : 0,
      satisfactionRate,
      totalResponses: stats.totalResponses,
      averageResponseTime: '2.3h', // Placeholder - requires specific feedback/complaint linking
      trends: {
        rating: '+0.0', // Requires comparing with previous period
        satisfactionRate: '+0%',
        responseTime: '0min',
      },
      distribution: formattedDistribution,
      categoryRatings,
      monthlyTrend: [], // Can be implemented with detailed aggregation
      feedbackKeywords: [], // Requires NLP or simple word count
      recentFeedback: recentFeedback.map((f) => ({
        id: f._id,
        rating: f.rating,
        comment: f.comment,
        category: f.category,
        date: f.createdAt.toISOString().split('T')[0],
      })),
    };

    res.json({
      success: true,
      data: satisfactionData,
      range,
    });
  } catch (error) {
    logger.error('Erreur récupération satisfaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données',
    });
  }
});

// GET /api/analytics/performance - Métriques de performance
router.get('/performance', async (req: Request, res: Response) => {
  try {
    // 1. Completion Rate
    const organizationId = (req as any).organizationId;
    const totalComplaints = await Complaint.countDocuments({ organizationId });
    const resolvedComplaints = await Complaint.countDocuments({
      organizationId,
      status: { $in: ['résolue', 'fermée'] },
    });
    const completionRate =
      totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

    // 2. By Category stats
    const byCategory = await Complaint.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', ['résolue', 'fermée']] }, 1, 0] },
          },
          // Calculate avg resolution time (diff between updatedAt and createdAt for resolved)
          totalDuration: {
            $sum: {
              $cond: [
                { $in: ['$status', ['résolue', 'fermée']] },
                { $subtract: ['$updatedAt', '$createdAt'] },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          category: '$_id',
          completionRate: {
            $cond: [
              { $eq: ['$total', 0] },
              0,
              { $multiply: [{ $divide: ['$resolved', '$total'] }, 100] },
            ],
          },
          avgTimeMs: {
            $cond: [{ $eq: ['$resolved', 0] }, 0, { $divide: ['$totalDuration', '$resolved'] }],
          },
        },
      },
    ]);

    // Format duration
    const formatDuration = (ms: number) => {
      if (!ms) return 'N/A';
      const days = Math.round(ms / (1000 * 60 * 60 * 24));
      return `${days} jours`;
    };

    const formattedByCategory = byCategory.map((c) => ({
      category: c.category,
      completionRate: Math.round(c.completionRate),
      avgTime: formatDuration(c.avgTimeMs),
    }));

    const performanceData = {
      averageResolutionTime: 'N/A', // Global avg can be calculated similarly
      firstResponseTime: 'N/A',
      completionRate,
      onTimeRate: 92, // Requires SLA logic
      byCategory: formattedByCategory,
      byTeam: [], // Requires Team aggregation
    };

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    logger.error('Erreur récupération performance:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données',
    });
  }
});

// GET /api/analytics/heatmap - Données pour carte de chaleur
router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const { category, priority, startDate, endDate } = req.query;

    const filter: any = {
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      organizationId: (req as any).organizationId,
    };

    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter).select(
      'latitude longitude category priority status'
    );

    const heatmapData = complaints.map((c) => ({
      lat: c.latitude,
      lng: c.longitude,
      intensity: c.priority === 'urgent' ? 1 : c.priority === 'high' ? 0.8 : 0.5,
      complaint: {
        id: c._id,
        category: c.category,
        priority: c.priority,
        status: c.status,
      },
    }));

    res.json({
      success: true,
      data: heatmapData,
      filters: { category, priority, startDate, endDate },
    });
  } catch (error) {
    logger.error('Erreur récupération heatmap:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données',
    });
  }
});

// GET /api/analytics/dashboard - Dashboard global metrics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).organizationId;
    // Aggregate high-level stats
    const totalComplaints = await Complaint.countDocuments({ organizationId });
    const activeComplaints = await Complaint.countDocuments({
      organizationId,
      status: { $in: ['nouveau', 'en cours', 'attribuée'] },
    });
    const resolvedComplaints = await Complaint.countDocuments({
      organizationId,
      status: { $in: ['résolue', 'fermée'] },
    });

    // Mock feedback avg for now if Feedback model is empty
    const avgSatisfaction = 4.2;

    res.json({
      success: true,
      data: {
        totalComplaints,
        activeComplaints,
        resolvedComplaints,
        avgSatisfaction,
        complaintsByStatus: {
          new: await Complaint.countDocuments({ organizationId, status: 'nouveau' }),
          assigned: await Complaint.countDocuments({ organizationId, status: 'attribuée' }),
          inProgress: await Complaint.countDocuments({ organizationId, status: 'en cours' }),
          resolved: await Complaint.countDocuments({ organizationId, status: 'résolue' }),
          closed: await Complaint.countDocuments({ organizationId, status: 'fermée' }),
        },
      },
    });
  } catch (error) {
    logger.error('Erreur dashboard analytics:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /api/analytics/complaints - Detailed complaint stats
router.get('/complaints', async (req: Request, res: Response) => {
  // Redirect to performance which has similar data
  res.redirect('/api/analytics/performance');
});

// GET /api/analytics/teams - Team performance stats
router.get('/teams', async (req: Request, res: Response) => {
  // Placeholder: In a real app, this would aggregate from Team and Complaint models
  res.json({
    success: true,
    data: {
      totalTeams: 5,
      activeMembers: 12,
      avgResponseTime: '35min',
      topTeams: [],
    },
  });
});

// GET /api/analytics/export/:type
router.get('/export/:type', async (req: Request, res: Response) => {
  const { type } = req.params;
  if (type !== 'complaints') {
    return res.status(400).json({ success: false, message: 'Invalid export type' });
  }

  try {
    const organizationId = (req as any).organizationId;

    // exceljs imported statically
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ReclamTrack';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Réclamations', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    // Header styling
    const headerFill: ExcelJS.FillPattern = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    };
    const headerFont: Partial<ExcelJS.Font> = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      name: 'Calibri',
      size: 11,
    };

    sheet.columns = [
      { header: 'N° Réclamation', key: 'number', width: 20 },
      { header: 'Date Création', key: 'createdAt', width: 18 },
      { header: 'Catégorie', key: 'category', width: 18 },
      { header: 'Sous-catégorie', key: 'subcategory', width: 18 },
      { header: 'Priorité', key: 'priority', width: 12 },
      { header: 'Statut', key: 'status', width: 14 },
      { header: 'Titre', key: 'title', width: 30 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Ville', key: 'city', width: 16 },
      { header: 'Quartier', key: 'district', width: 16 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Équipe', key: 'team', width: 20 },
      { header: 'Technicien', key: 'technician', width: 20 },
      { header: 'Date Saisie', key: 'assignedAt', width: 18 },
      { header: 'Prénom', key: 'firstName', width: 14 },
      { header: 'Nom', key: 'lastName', width: 14 },
      { header: 'Email', key: 'email', width: 24 },
      { header: 'Téléphone', key: 'phone', width: 16 },
    ];

    // Style header row
    sheet.getRow(1).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { bottom: { style: 'thin', color: { argb: 'FF334155' } } };
    });
    sheet.getRow(1).height = 22;

    // Fetch complaints with population
    const complaints = await Complaint.find({ organizationId })
      .populate<{ assignedTeamId: any }>('assignedTeamId', 'name')
      .populate<{ technicianId: any }>('technicianId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Priority color mapping
    const priorityColors: Record<string, string> = {
      urgent: 'FFEF4444',
      high: 'FFEF4444',
      medium: 'FFFBBF24',
      low: 'FF22C55E',
    };
    const statusColors: Record<string, string> = {
      'résolue': 'FF22C55E',
      'fermée': 'FF64748B',
      'en cours': 'FF3B82F6',
      'nouvelle': 'FFF59E0B',
      'rejetée': 'FFEF4444',
    };

    complaints.forEach((c: any, idx: number) => {
      const row = sheet.addRow({
        number: c.number,
        createdAt: new Date(c.createdAt).toLocaleString('fr-FR'),
        category: c.category,
        subcategory: c.subcategory,
        priority: c.priority,
        status: c.status,
        title: c.title,
        address: c.address,
        city: c.city,
        district: c.district,
        latitude: c.latitude || '',
        longitude: c.longitude || '',
        team: c.assignedTeamId?.name || 'Non assignée',
        technician: c.technicianId ? `${c.technicianId.firstName} ${c.technicianId.lastName}` : '',
        assignedAt: c.assignedAt ? new Date(c.assignedAt).toLocaleString('fr-FR') : '',
        firstName: c.isAnonymous ? 'Anonyme' : c.firstName || '',
        lastName: c.isAnonymous ? '' : c.lastName || '',
        email: c.isAnonymous ? '' : c.email || '',
        phone: c.isAnonymous ? '' : c.phone || '',
      });

      // Alternate row background
      if (idx % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }

      // Color priority cell
      const priorityCell = row.getCell('priority');
      priorityCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: priorityColors[c.priority] || 'FFFFFFFF' },
      };
      priorityCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
      priorityCell.alignment = { horizontal: 'center' };

      // Color status cell
      const statusCell = row.getCell('status');
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColors[c.status] || 'FFFFFFFF' },
      };
      statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 10 };
      statusCell.alignment = { horizontal: 'center' };
    });

    // Auto-filter
    sheet.autoFilter = { from: 'A1', to: sheet.columns[sheet.columns.length - 1].letter + '1' };

    // Generate buffer
    const buffer = Buffer.from((await workbook.xlsx.writeBuffer()) as ArrayBuffer);
    const filename = `reclamations_${new Date().toISOString().slice(0, 10)}_${Date.now()}.xlsx`;
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    // Get organization settings
    const org = await Organization.findById(organizationId).select('settings');
    const settings = org?.settings || {};
    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;

    const saveResult = await saveExport(buffer, filename, mimeType, settings, serverBaseUrl);

    res.json({
      success: true,
      message:
        saveResult.mode === 'local'
          ? 'Export sauvegardé sur le serveur local'
          : 'Export envoyé sur Google Drive',
      data: saveResult,
    });
  } catch (error: any) {
    logger.error('Export Excel error:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de l'export",
      error: error.message,
    });
  }
});

// GET /api/analytics/exports/download/:filename - Download a locally saved export
router.get('/exports/download/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    // Basic validation to prevent path traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }
    const filePath = path.join(process.cwd(), 'exports', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.sendFile(filePath);
  } catch (error) {
    logger.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Erreur de téléchargement' });
  }
});

export default router;
