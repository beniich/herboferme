/**
 * @file complaint.dto.ts
 * @description DTOs and validators for complaint routes.
 * @module backend/dto
 */

import { body, param, query } from 'express-validator';

// â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CreateComplaintDto {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  location?: string;
}

export interface UpdateComplaintDto {
  title?: string;
  description?: string;
  status?: 'ouvert' | 'en cours' | 'rÃ©solu' | 'fermÃ©';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTeamId?: string;
  resolution?: string;
}

export interface QueryComplaintDto {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
  from?: string;
  to?: string;
}

// â”€â”€ Valid enums â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const VALID_STATUSES = ['ouvert', 'en cours', 'rÃ©solu', 'fermÃ©'];

// â”€â”€ Validators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createComplaintValidators = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Titre: 3 Ã  200 caractÃ¨res'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description: 10 Ã  5000 caractÃ¨res'),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`PrioritÃ© invalide. Valeurs: ${VALID_PRIORITIES.join(', ')}`),
  body('category').optional().trim().isLength({ max: 100 }),
  body('location').optional().trim().isLength({ max: 200 }),
];

export const updateComplaintValidators = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 5000 }),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Statut invalide. Valeurs: ${VALID_STATUSES.join(', ')}`),
  body('priority').optional().isIn(VALID_PRIORITIES),
  body('assignedTeamId').optional().isMongoId().withMessage('assignedTeamId invalide'),
  body('resolution').optional().trim().isLength({ max: 2000 }),
];

export const queryComplaintValidators = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(VALID_STATUSES),
  query('priority').optional().isIn(VALID_PRIORITIES),
  query('search').optional().trim().isLength({ max: 100 }),
  query('from').optional().isISO8601().withMessage('Format date ISO 8601 requis'),
  query('to').optional().isISO8601(),
];

export const complaintIdParamValidator = [
  param('id').isMongoId().withMessage('ID de rÃ©clamation invalide'),
];
