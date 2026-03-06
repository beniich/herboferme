import mongoose, { Schema, Document } from 'mongoose';

export interface IKnoledgeBase extends Document { // SOP (Standard Operating Procedure)
    title: string;
    category: string;
    content: string;
    version: string;
    author: string;
    tags: string[];
    views: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema({
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    content: { type: String, required: true },
    version: { type: String, default: '1.0' },
    author: { type: String, required: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index textuel pour la recherche
KnowledgeBaseSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const KnowledgeBase = mongoose.model<IKnoledgeBase>('KnowledgeBase', KnowledgeBaseSchema);
