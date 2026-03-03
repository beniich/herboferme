
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    step1Schema,
    step2Schema,
    step3Schema,
    step4Schema,
    Step1Data,
    Step2Data,
    Step3Data,
    Step4Data,
} from '@/lib/validations/complaint-form.validation';

const STORAGE_KEY = 'complaint_form_draft';
const TOTAL_STEPS = 4;

export type FormStep = 1 | 2 | 3 | 4;

interface UseComplaintFormOptions {
    onSuccess?: (complaintId: string) => void;
    enableAutosave?: boolean;
}

export function useComplaintForm(options: UseComplaintFormOptions = { /* Intentionally empty */ }) {
    const { onSuccess, enableAutosave = true } = options;
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<FormStep>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({ /* Intentionally empty */ });

    // Forms pour chaque   tape
    const step1Form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        mode: 'onBlur',
        defaultValues: loadDraft('step1'),
    });

    const step2Form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        mode: 'onBlur',
        defaultValues: loadDraft('step2'),
    });

    const step3Form = useForm<Step3Data>({
        resolver: zodResolver(step3Schema),
        mode: 'onBlur',
        defaultValues: loadDraft('step3') || { photos: [] },
    });

    const step4Form = useForm<Step4Data>({
        resolver: zodResolver(step4Schema),
        mode: 'onBlur',
        defaultValues: {
            isAnonymous: false,
            notificationPreference: 'both',
            agreeToTerms: false,
            ...loadDraft('step4')
        } as Step4Data,
    });

    const forms = {
        1: step1Form,
        2: step2Form,
        3: step3Form,
        4: step4Form,
    };

    const currentForm = forms[currentStep];

    // Chargement du brouillon depuis localStorage
    function loadDraft(step: string) {
        if (typeof window === 'undefined') return undefined;

        try {
            const draft = localStorage.getItem(STORAGE_KEY);
            if (!draft) return undefined;

            const parsed = JSON.parse(draft);
            return parsed[step];
        } catch (error) {
            console.error('Error loading draft:', error);
            return undefined;
        }
    }

    // Sauvegarde auto du brouillon
    const saveDraft = useCallback(() => {
        if (!enableAutosave || typeof window === 'undefined') return;

        try {
            const draft = {
                step1: step1Form.getValues(),
                step2: step2Form.getValues(),
                step3: step3Form.getValues(),
                step4: step4Form.getValues(),
                savedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
            toast.success('Brouillon sauvegard  ', { duration: 2000 });
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }, [step1Form, step2Form, step3Form, step4Form, enableAutosave]);

    // Suppression du brouillon
    const clearDraft = useCallback(() => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Navigation entre les   tapes
    const goToNextStep = useCallback(async () => {
        const isValid = await currentForm.trigger();

        if (!isValid) {
            toast.error('Veuillez corriger les erreurs avant de continuer');
            return false;
        }

        saveDraft();

        if (currentStep < TOTAL_STEPS) {
            setCurrentStep((prev) => (prev + 1) as FormStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return true;
        }

        return false;
    }, [currentStep, currentForm, saveDraft]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as FormStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentStep]);

    const goToStep = useCallback((step: FormStep) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Upload de fichiers avec progression
    const uploadFile = useCallback(async (
        file: File,
        type: 'photo' | 'document' | 'audio'
    ): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const fileId = `${type}_${Date.now()}_${Math.random()}`;

        try {
            const xhr = new XMLHttpRequest();

            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress((prev) => ({ ...prev, [fileId]: progress }));
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        setUploadProgress((prev) => {
                            const newProgress = { ...prev };
                            delete newProgress[fileId];
                            return newProgress;
                        });
                        resolve(response.url);
                    } else {
                        reject(new Error('Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Upload error')));

                xhr.open('POST', '/api/upload');
                xhr.send(formData);
            });
        } catch (error) {
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
            });
            throw error;
        }
    }, []);

    // Soumission finale du formulaire
    const submitComplaint = useCallback(async () => {
        setIsSubmitting(true);

        try {
            // Validation finale de toutes les   tapes
            const [valid1, valid2, valid3, valid4] = await Promise.all([
                step1Form.trigger(),
                step2Form.trigger(),
                step3Form.trigger(),
                step4Form.trigger(),
            ]);

            if (!valid1 || !valid2 || !valid3 || !valid4) {
                toast.error('Certaines informations sont manquantes ou invalides');

                // Retour    la premi  re   tape avec erreurs
                if (!valid1) setCurrentStep(1);
                else if (!valid2) setCurrentStep(2);
                else if (!valid3) setCurrentStep(3);
                else if (!valid4) setCurrentStep(4);

                return;
            }

            // Collecte des donn  es
            const complaintData = {
                ...step1Form.getValues(),
                ...step2Form.getValues(),
                ...step3Form.getValues(),
                ...step4Form.getValues(),
                submittedAt: new Date().toISOString(),
            };

            // Envoi au backend
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(complaintData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la soumission');
            }

            const result = await response.json();

            // Succ  s
            clearDraft();
            toast.success('R  clamation soumise avec succ  s!', {
                description: `Num  ro de r  f  rence: ${result.id}`,
            });

            if (onSuccess) {
                onSuccess(result.id);
            } else {
                router.push(`/complaints/${result.id}`);
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Erreur lors de la soumission', {
                description: 'Veuillez r  essayer ou contacter le support',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [step1Form, step2Form, step3Form, step4Form, clearDraft, onSuccess, router]);

    return {
        currentStep,
        totalSteps: TOTAL_STEPS,
        currentForm,
        forms,

        // Navigation
        goToNextStep,
        goToPreviousStep,
        goToStep,

        // Actions
        saveDraft,
        clearDraft,
        uploadFile,
        submitComplaint,

        //   tat
        isSubmitting,
        uploadProgress,
        isFirstStep: currentStep === 1,
        isLastStep: currentStep === TOTAL_STEPS,
        progress: Math.round((currentStep / TOTAL_STEPS) * 100),
    };
}
