'use client';

import { FormStepper, complaintFormSteps } from '@/components/forms/FormStepper';
import { FileUpload } from '@/components/forms/FileUpload';
import { useComplaintForm } from '@/hooks/useComplaintForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { useState } from 'react'; // Ensure useState is imported

export function CreateComplaintWizard() {
    const {
        currentStep,
        currentForm: formRef, // Rename to allow casting
        goToNextStep,
        goToPreviousStep,
        saveDraft,
        uploadFile, // Add uploadFile
        submitComplaint,
        isSubmitting,
        isFirstStep,
        isLastStep,
    } = useComplaintForm({
        enableAutosave: true,
        onSuccess: (complaintId) => {
            console.log('Complaint created:', complaintId);
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentForm = formRef as any; // Cast to any to bypass TS union errors

    // Local state to hold files to submit
    const [files, setFiles] = useState<File[]>([]);

    const handleFileUpload = async (file: File) => {
        try {
            // Upload immediately
            const url = await uploadFile(file, 'photo');

            // Update local state for UI
            setFiles(prev => [...prev, file]);

            // Update form data (assuming step 3 is active or we access step3Form via some means, 
            // but here currentForm is step3Form when on step 3).
            // We should ensure we are on step 3 or safely update step 3 data.
            // CreateComplaintWizard renders step 3, so currentForm is step 3 form.
            const currentPhotos = currentForm.getValues('photos') || [];
            currentForm.setValue('photos', [...currentPhotos, url], { shouldValidate: true });

            return url; // Return URL as preview (or use objectURL if preferred for speed)
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const handleFinalSubmit = () => {
        submitComplaint();
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Stepper */}
            <FormStepper
                steps={complaintFormSteps}
                currentStep={currentStep}
                variant="horizontal"
            />

            {/* Form Container */}
            <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
                <form onSubmit={currentForm.handleSubmit(isLastStep ? handleFinalSubmit : goToNextStep)}>
                    {/*   tape 1: Informations */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Informations sur le probl  me</h2>

                            <div className="grid gap-2">
                                <Label htmlFor="category">Cat  gorie *</Label>
                                <select // Using native select for simplicity since Schema expects string enum and Select component needs manual integration with hook-form
                                    {...currentForm.register('category')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">S  lectionner...</option>
                                    <option value="water">Eau</option>
                                    <option value="electricity">  lectricit  </option>
                                    <option value="roads">Routes</option>
                                    <option value="waste">D  chets</option>
                                    <option value="lighting">  clairage</option>
                                    <option value="sewage">Assainissement</option>
                                    <option value="parks">Parcs</option>
                                    <option value="noise">Bruit</option>
                                    <option value="other">Autre</option>
                                </select>
                                {currentForm.formState.errors.category && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.category.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subcategory">Sous-cat  gorie *</Label>
                                <Input {...currentForm.register('subcategory')} placeholder="Ex: Fuite d'eau, Panne de courant..." />
                                {currentForm.formState.errors.subcategory && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.subcategory.message as string}
                                    </p>
                                )}
                            </div>


                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priorit   *</Label>
                                <select
                                    {...currentForm.register('priority')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="title">Titre *</Label>
                                <Input {...currentForm.register('title')} placeholder="R  sum   du probl  me" />
                                {currentForm.formState.errors.title && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.title.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description *</Label>
                                <textarea
                                    {...currentForm.register('description')}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="D  crivez le probl  me en d  tail..."
                                    rows={5}
                                />
                                {currentForm.formState.errors.description && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.description.message as string}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/*   tape 2: Localisation */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Localisation</h2>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Adresse *</Label>
                                <Input {...currentForm.register('address')} placeholder="Adresse compl  te" />
                                {currentForm.formState.errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.address.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="city">Ville *</Label>
                                    <Input {...currentForm.register('city')} placeholder="Ville" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="district">Quartier *</Label>
                                    <Input {...currentForm.register('district')} placeholder="Quartier" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="postalCode">Code Postal</Label>
                                <Input {...currentForm.register('postalCode')} placeholder="Ex: 10000" />
                                {currentForm.formState.errors.postalCode && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.postalCode.message as string}
                                    </p>
                                )}
                            </div>

                            {/* Note: Latitude/Longitude inputs hidden or map picker would go here */}
                            <Input type="hidden" {...currentForm.register('latitude', { valueAsNumber: true })} value={34.02} />
                            <Input type="hidden" {...currentForm.register('longitude', { valueAsNumber: true })} value={-6.83} />

                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center text-slate-500">
                                <p>Carte de s  lection de position (   int  grer)</p>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Preuves et Documents</h2>

                            <div className="space-y-4">
                                <Label>Photos</Label>
                                <FileUpload
                                    accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
                                    maxFiles={5}
                                    value={files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))}
                                    onChange={(uploadedFiles) => {
                                        setFiles(uploadedFiles.map(uf => uf.file));
                                    }}
                                    onUpload={handleFileUpload}
                                />
                                <p className="text-sm text-slate-500">Ajouter des photos du probl  me (Max 5)</p>
                            </div>
                        </div>
                    )}

                    {/*   tape 4: Contact */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Vos Informations</h2>

                            <div className="flex items-center space-x-2 mb-4">
                                <input type="checkbox" id="isAnonymous" {...currentForm.register('isAnonymous')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                <Label htmlFor="isAnonymous">Rester anonyme</Label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">Pr  nom</Label>
                                    <Input {...currentForm.register('firstName')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Nom</Label>
                                    <Input {...currentForm.register('lastName')} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input {...currentForm.register('email')} type="email" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">T  l  phone</Label>
                                <Input {...currentForm.register('phone')} type="tel" />
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="agreeToTerms" {...currentForm.register('agreeToTerms')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <Label htmlFor="agreeToTerms">J&apos;accepte les conditions d&apos;utilisation</Label>
                                </div>
                                {currentForm.formState.errors.agreeToTerms && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {currentForm.formState.errors.agreeToTerms.message as string}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goToPreviousStep}
                            disabled={isFirstStep || isSubmitting}
                        >
                            Retour
                        </Button>

                        <div className="flex gap-2">
                            {!isFirstStep && (
                                <Button type="button" variant="ghost" onClick={saveDraft}>
                                    Sauvegarder brouillon
                                </Button>
                            )}
                            <Button type="submit" disabled={isSubmitting}>
                                {isLastStep ? (isSubmitting ? 'Envoi...' : 'Soumettre') : 'Suivant'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
