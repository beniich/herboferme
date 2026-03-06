/**
 * @file organization.dto.ts
 * @description DTOs and validators for organization and membership routes.
 * @module backend/dto
 */

import { body, param } from 'express-validator';

// â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
}

export interface InviteMemberDto {
  email: string;
  roles?: string[];
}

export interface UpdateMemberRoleDto {
  roles: string[];
}

// â”€â”€ Validators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const createOrganizationValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractÃ¨res'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
    .isLength({ max: 50 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

export const inviteMemberValidators = [
  body('email').isEmail().normalizeEmail(),
  body('roles')
    .optional()
    .isArray()
    .withMessage('roles doit Ãªtre un tableau')
    .custom((arr: string[]) => arr.every((r) => typeof r === 'string'))
    .withMessage('Chaque rÃ´le doit Ãªtre une chaÃ®ne'),
];

export const updateMemberRoleValidators = [
  body('roles')
    .isArray({ min: 1 })
    .withMessage('Au moins un rÃ´le est requis')
    .custom((arr: string[]) => arr.every((r) => typeof r === 'string')),
];

export const orgIdParamValidator = [param('orgId').isMongoId().withMessage('orgId invalide')];

export const membershipIdParamValidator = [
  param('membershipId').isMongoId().withMessage('membershipId invalide'),
];

export const CreateApiKeyDto = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ max: 100 }),
  body('scopes')
    .optional()
    .isArray()
    .withMessage('scopes doit Ãªtre un tableau'),
  body('rateLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('rateLimit doit Ãªtre un entier positif'),
  body('expiresInDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('expiresInDays doit Ãªtre un entier positif'),
];
