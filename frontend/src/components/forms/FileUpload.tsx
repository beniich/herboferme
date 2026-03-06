// components/forms/FileUpload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, File, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadedFile {
    file?: File;
    name?: string;
    size?: number;
    preview?: string;
    uploadedUrl?: string;
    progress?: number;
    error?: string;
}

interface FileUploadProps {
    accept?: Record<string, string[]>;
    maxSize?: number; // en bytes
    maxFiles?: number;
    multiple?: boolean;
    value?: UploadedFile[];
    onChange?: (files: UploadedFile[]) => void;
    onUpload?: (file: File) => Promise<string>;
    disabled?: boolean;
    label?: string;
    description?: string;
    variant?: 'default' | 'compact' | 'avatar';
}

export function FileUpload({
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 5,
    multiple = true,
    value = [],
    onChange,
    onUpload,
    disabled = false,
    label = 'Ajouter des fichiers',
    description = 'Glissez-déposez ou cliquez pour sélectionner',
    variant = 'default',
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(
        async (acceptedFiles: File[], rejectedFiles: any[]) => {
            // Gérer les fichiers rejetés
            if (rejectedFiles.length > 0) {
                const errors = rejectedFiles.map((rejection) => {
                    const error = rejection.errors[0];
                    if (error.code === 'file-too-large') {
                        return `${rejection.file.name}: Fichier trop volumineux (max ${maxSize / 1024 / 1024}MB)`;
                    }
                    if (error.code === 'file-invalid-type') {
                        return `${rejection.file.name}: Type de fichier non supporté`;
                    }
                    return `${rejection.file.name}: ${error.message}`;
                });

                console.error('Rejected files:', errors);
                // Vous pouvez afficher un toast ici
            }

            // Limiter le nombre de fichiers
            const remainingSlots = maxFiles - value.length;
            const filesToAdd = acceptedFiles.slice(0, remainingSlots);

            if (filesToAdd.length === 0) return;

            const newFiles: UploadedFile[] = filesToAdd.map((file) => ({
                file,
                preview: file.type.startsWith('image/')
                    ? URL.createObjectURL(file)
                    : undefined,
                progress: 0,
            }));

            // Ajouter immédiatement les fichiers
            const updatedFiles = [...value, ...newFiles];
            onChange?.(updatedFiles);

            // Upload si handler fourni
            if (onUpload) {
                setUploading(true);

                try {
                    const uploadPromises = newFiles.map(async (uploadFile, index) => {
                        try {
                            if (!uploadFile.file) return;
                            const url = await onUpload(uploadFile.file);

                            // Mettre à jour avec l'URL
                            updatedFiles[value.length + index] = {
                                ...uploadFile,
                                uploadedUrl: url,
                                progress: 100,
                            };
                            onChange?.([...updatedFiles]);
                        } catch (error) {
                            // Marquer l'erreur
                            updatedFiles[value.length + index] = {
                                ...uploadFile,
                                error: 'Échec de l\'upload',
                            };
                            onChange?.([...updatedFiles]);
                        }
                    });

                    await Promise.all(uploadPromises);
                } finally {
                    setUploading(false);
                }
            }
        },
        [value, maxFiles, maxSize, onChange, onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles: maxFiles - value.length,
        multiple,
        disabled: disabled || value.length >= maxFiles,
    });

    const removeFile = (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);

        // Révoquer l'URL de preview
        if (value[index].preview) {
            URL.revokeObjectURL(value[index].preview!);
        }

        onChange?.(newFiles);
    };

    if (variant === 'compact') {
        return (
            <div className="space-y-3">
                {value.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {value.map((uploadedFile, index) => (
                            <FilePreviewCard
                                key={index}
                                file={uploadedFile}
                                onRemove={() => removeFile(index)}
                            />
                        ))}
                    </div>
                )}

                {value.length < maxFiles && (
                    <div
                        {...getRootProps()}
                        className={cn(
                            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                            isDragActive && 'border-primary bg-primary/5',
                            !isDragActive && 'border-slate-300 dark:border-slate-600 hover:border-primary',
                            disabled && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Upload className="w-4 h-4" />
                            <span>{label}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            {value.length < maxFiles && (
                <div
                    {...getRootProps()}
                    className={cn(
                        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                        isDragActive && 'border-primary bg-primary/5 scale-105',
                        !isDragActive && 'border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    <input {...getInputProps()} />

                    <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>

                        <div>
                            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                {label}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {description}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Max {maxSize / 1024 / 1024}MB par fichier</span>
                            <span>•</span>
                            <span>
                                {value.length} / {maxFiles} fichiers
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* File Previews */}
            {value.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {value.map((uploadedFile, index) => (
                        <FilePreviewCard
                            key={index}
                            file={uploadedFile}
                            onRemove={() => removeFile(index)}
                            variant="detailed"
                        />
                    ))}
                </div>
            )}

            {/* Upload Status */}
            {uploading && (
                <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Upload en cours...</span>
                </div>
            )}
        </div>
    );
}

interface FilePreviewCardProps {
    file: UploadedFile;
    onRemove: () => void;
    variant?: 'compact' | 'detailed';
}

function FilePreviewCard({ file, onRemove, variant = 'compact' }: FilePreviewCardProps) {
    const isImage = file.file?.type.startsWith('image/') || file.uploadedUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
    const fileName = file.file?.name || file.name || file.uploadedUrl?.split('/').pop() || 'Fichier';
    const fileSize = file.file?.size ? (file.file.size / 1024).toFixed(1) : (file.size ? (file.size / 1024).toFixed(1) : '');
    const previewUrl = file.preview || file.uploadedUrl;

    if (variant === 'compact') {
        return (
            <div className="relative group rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
                {isImage && previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt={fileName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <File className="w-8 h-8 text-slate-400" />
                    </div>
                )}

                {/* Progress Overlay */}
                {file.progress !== undefined && file.progress < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm font-bold">{file.progress}%</div>
                    </div>
                )}

                {/* Error Overlay */}
                {file.error && (
                    <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                )}

                {/* Remove Button */}
                <button
                    onClick={onRemove}
                    title="Supprimer"
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {/* Icon/Preview */}
            <div className="shrink-0 w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                {isImage && previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt={fileName}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <File className="w-6 h-6 text-slate-400" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {fileName}
                </p>
                <div className="flex items-center gap-2">
                    {fileSize && <p className="text-xs text-slate-500">{fileSize} KB</p>}
                    {file.uploadedUrl && <p className="text-xs text-green-500 font-medium whitespace-nowrap"> • Uploadé</p>}
                    {file.error && <p className="text-xs text-red-500 font-medium whitespace-nowrap"> • Erreur</p>}
                </div>

                {/* Progress Bar */}
                {file.progress !== undefined && file.progress < 100 && !file.error && (
                    <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Remove Button */}
            <button
                onClick={onRemove}
                title="Supprimer"
                className="shrink-0 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
