// lib/validations/complaint-form.validation.ts
import { z } from 'zod';

// Étape 1: Informations de base
export const step1Schema = z.object({
    category: z.enum([
        'water',
        'electricity',
        'roads',
        'waste',
        'lighting',
        'sewage',
        'parks',
        'noise',
        'other'
    ], {
        required_error: 'Veuillez sélectionner une catégorie',
    }),
    subcategory: z.string().min(1, 'Sous-catégorie requise'),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], {
        required_error: 'Priorité requise',
    }),
    title: z.string()
        .min(10, 'Le titre doit contenir au moins 10 caractères')
        .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: z.string()
        .min(20, 'La description doit contenir au moins 20 caractères')
        .max(1000, 'La description ne peut pas dépasser 1000 caractères'),
});

// Étape 2: Localisation
export const step2Schema = z.object({
    address: z.string().min(5, 'Adresse complète requise'),
    city: z.string().min(2, 'Ville requise'),
    district: z.string().min(2, 'Quartier requis'),
    postalCode: z.string()
        .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres requis)'),
    latitude: z.number()
        .min(-90, 'Latitude invalide')
        .max(90, 'Latitude invalide'),
    longitude: z.number()
        .min(-180, 'Longitude invalide')
        .max(180, 'Longitude invalide'),
    landmark: z.string().optional(),
});

// Étape 3: Documents et preuves
export const step3Schema = z.object({
    photos: z.array(z.string().url())
        .min(1, 'Au moins une photo est requise')
        .max(5, 'Maximum 5 photos'),
    documents: z.array(z.string().url())
        .max(3, 'Maximum 3 documents')
        .optional(),
    audioNote: z.string().url().optional(),
});

// Étape 4: Informations du réclamant
export const step4Schema = z.object({
    isAnonymous: z.boolean(),
    firstName: z.string().min(2, 'Prénom requis').optional(),
    lastName: z.string().min(2, 'Nom requis').optional(),
    email: z.string()
        .email('Email invalide')
        .optional(),
    phone: z.string()
        .regex(/^(\+212|0)[5-7]\d{8}$/, 'Numéro de téléphone marocain invalide')
        .optional(),
    alternatePhone: z.string()
        .regex(/^(\+212|0)[5-7]\d{8}$/, 'Numéro de téléphone marocain invalide')
        .optional(),
    notificationPreference: z.enum(['email', 'sms', 'both', 'none']),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: 'Vous devez accepter les conditions d\'utilisation',
    }),
}).superRefine((data, ctx) => {
    // Si non anonyme, email ou téléphone requis
    if (!data.isAnonymous && !data.email && !data.phone) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Email ou téléphone requis pour les réclamations non-anonymes',
            path: ['email'],
        });
    }

    // Si préférence email, email requis
    if (data.notificationPreference !== 'none' &&
        data.notificationPreference !== 'sms' &&
        !data.email) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Email requis pour les notifications par email',
            path: ['email'],
        });
    }
});

// Schéma complet du formulaire
export const complaintFormSchema = z.object({
    step1: step1Schema,
    step2: step2Schema,
    step3: step3Schema,
    step4: step4Schema,
});

export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
