/**
 * @file auth.dto.ts
 * @description DTOs and validators for authentication routes.
 * @module backend/dto
 */

import { body } from 'express-validator';

// â”€â”€ Interfaces (TypeScript safety) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

// â”€â”€ Validators (express-validator chains) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const registerValidators = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractÃ¨res')
    .matches(/[A-Z]/)
    .withMessage('Doit contenir au moins une majuscule')
    .matches(/[0-9]/)
    .withMessage('Doit contenir au moins un chiffre'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut dÃ©passer 100 caractÃ¨res'),
];

export const loginValidators = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

export const refreshValidators = [
  body('refreshToken').notEmpty().withMessage('refreshToken requis'),
];
