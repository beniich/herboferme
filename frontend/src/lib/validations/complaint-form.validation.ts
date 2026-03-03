// lib/validations/complaint-form.validation.ts
import { z } from 'zod';

//   tape 1: Informations de base
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
        required_error: 'Veuillez s  lectionner une cat  gorie',
    }),
    subcategory: z.string().min(1, 'Sous-cat  gorie requise'),
    priority: z.enum(['low', 'medium', 'high', 'urgent'], {
        required_error: 'Priorit   requise',
    }),
    title: z.string()
        .min(10, 'Le titre doit contenir au moins 10 caract  res')
        .max(100, 'Le titre ne peut pas d  passer 100 caract  res'),
    description: z.string()
        .min(20, 'La description doit contenir au moins 20 caract  res')
        .max(1000, 'La description ne peut pas d  passer 1000 caract  res'),
});

//   tape 2: Localisation
export const step2Schema = z.object({
    address: z.string().min(5, 'Adresse compl  te requise'),
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

//   tape 3: Documents et preuves
export const step3Schema = z.object({
    photos: z.array(z.object({
        file: z.instanceof(File)
            .refine((file) => file.size <= 5 * 1024 * 1024, 'La photo ne doit pas d  passer 5MB')
            .refine(
                (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
                'Format accept  : JPG, PNG, WebP'
            ),
        preview: z.string().url(),
        caption: z.string().max(200).optional(),
    }))
        .min(1, 'Au moins une photo est requise')
        .max(5, 'Maximum 5 photos'),
    documents: z.array(z.object({
        file: z.instanceof(File)
            .refine((file) => file.size <= 10 * 1024 * 1024, 'Le document ne doit pas d  passer 10MB')
            .refine(
                (file) => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
                'Format accept  : PDF, DOC, DOCX'
            ),
        name: z.string(),
    }))
        .max(3, 'Maximum 3 documents')
        .optional(),
    audioNote: z.object({
        file: z.instanceof(File)
            .refine((file) => file.size <= 5 * 1024 * 1024, 'L\'enregistrement ne doit pas d  passer 5MB')
            .refine(
                (file) => ['audio/mpeg', 'audio/wav', 'audio/webm'].includes(file.type),
                'Format accept  : MP3, WAV, WebM'
            ),
        duration: z.number().max(300, 'Dur  e maximum: 5 minutes'),
    }).optional(),
});

//   tape 4: Informations du r  clamant
export const step4Schema = z.object({
    isAnonymous: z.boolean(),
    firstName: z.string().min(2, 'Pr  nom requis').optional(),
    lastName: z.string().min(2, 'Nom requis').optional(),
    email: z.string()
        .email('Email invalide')
        .optional(),
    phone: z.string()
        .regex(/^(\+212|0)[5-7]\d{8}$/, 'Num  ro de t  l  phone marocain invalide')
        .optional(),
    alternatePhone: z.string()
        .regex(/^(\+212|0)[5-7]\d{8}$/, 'Num  ro de t  l  phone marocain invalide')
        .optional(),
    notificationPreference: z.enum(['email', 'sms', 'both', 'none']),
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: 'Vous devez accepter les conditions d\'utilisation',
    }),
}).superRefine((data, ctx) => {
    // Si non anonyme, email ou t  l  phone requis
    if (!data.isAnonymous && !data.email && !data.phone) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Email ou t  l  phone requis pour les r  clamations non-anonymes',
            path: ['email'],
        });
    }

    // Si pr  f  rence email, email requis
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

// Sch  ma complet du formulaire
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
