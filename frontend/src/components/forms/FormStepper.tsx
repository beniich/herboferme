// components/forms/FormStepper.tsx
'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: Assuming `cn` is utility function for className merging such as clsx. Adjust import if needed.

export interface Step {
    id: number;
    title: string;
    description: string;
    icon?: React.ReactNode;
}

interface FormStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    allowStepNavigation?: boolean;
    variant?: 'horizontal' | 'vertical';
}

export function FormStepper({
    steps,
    currentStep,
    onStepClick,
    allowStepNavigation = false,
    variant = 'horizontal',
}: FormStepperProps) {
    const isStepComplete = (stepId: number) => stepId < currentStep;
    const isStepCurrent = (stepId: number) => stepId === currentStep;
    const isStepAccessible = (stepId: number) =>
        allowStepNavigation ? stepId <= currentStep : stepId === currentStep;

    const handleStepClick = (stepId: number) => {
        if (isStepAccessible(stepId) && onStepClick) {
            onStepClick(stepId);
        }
    };

    if (variant === 'vertical') {
        return (
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const isComplete = isStepComplete(step.id);
                    const isCurrent = isStepCurrent(step.id);
                    const isAccessible = isStepAccessible(step.id);
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.id} className="relative">
                            <div
                                onClick={() => handleStepClick(step.id)}
                                className={cn(
                                    'flex items-start gap-4 p-4 rounded-lg transition-all',
                                    isAccessible && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
                                    isCurrent && 'bg-primary/5 border-2 border-primary',
                                    !isCurrent && 'border border-slate-200 dark:border-slate-700'
                                )}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shrink-0 transition-all',
                                        isComplete && 'bg-primary text-white',
                                        isCurrent && 'bg-primary text-white ring-4 ring-primary/20',
                                        !isComplete && !isCurrent && 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.icon || step.id
                                    )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className={cn(
                                            'font-semibold mb-1',
                                            isCurrent && 'text-primary',
                                            !isCurrent && 'text-slate-700 dark:text-slate-300'
                                        )}
                                    >
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Status Indicator */}
                                {isComplete && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <Check className="w-4 h-4" />
                                        <span>Compl  t  </span>
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                                        En cours
                                    </div>
                                )}
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="ml-9 mt-2 mb-2 h-8 w-0.5 bg-slate-200 dark:bg-slate-700" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal Variant
    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="mb-8 px-4">
                <div className="relative">
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                <div className="relative flex justify-between">
                    {steps.map((step) => {
                        const isComplete = isStepComplete(step.id);
                        const isCurrent = isStepCurrent(step.id);
                        const isAccessible = isStepAccessible(step.id);

                        return (
                            <div
                                key={step.id}
                                onClick={() => handleStepClick(step.id)}
                                className={cn(
                                    'flex flex-col items-center gap-3 transition-all',
                                    isAccessible && 'cursor-pointer'
                                )}
                            >
                                {/* Step Circle */}
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all',
                                        isComplete && 'bg-primary text-white scale-110',
                                        isCurrent && 'bg-primary text-white ring-4 ring-primary/20 scale-125',
                                        !isComplete && !isCurrent && 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-500'
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.icon || step.id
                                    )}
                                </div>

                                {/* Step Label */}
                                <div className="text-center max-w-[120px]">
                                    <p
                                        className={cn(
                                            'text-sm font-semibold mb-1',
                                            isCurrent && 'text-primary',
                                            isComplete && 'text-slate-700 dark:text-slate-300',
                                            !isComplete && !isCurrent && 'text-slate-400'
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Step Indicator */}
            <div className="md:hidden bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">
                          tape {currentStep} sur {steps.length}
                    </span>
                    <span className="text-sm font-bold text-primary">
                        {Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}%
                    </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all duration-500 rounded-full"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Exemple d'utilisation
export const complaintFormSteps: Step[] = [
    {
        id: 1,
        title: 'Informations',
        description: 'Type et description',
        icon: '    ',
    },
    {
        id: 2,
        title: 'Localisation',
        description: 'Adresse et carte',
        icon: '    ',
    },
    {
        id: 3,
        title: 'Preuves',
        description: 'Photos et documents',
        icon: '    ',
    },
    {
        id: 4,
        title: 'Contact',
        description: 'Vos informations',
        icon: '    ',
    },
];
