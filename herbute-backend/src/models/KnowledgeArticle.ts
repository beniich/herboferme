// backend/models/KnowledgeArticle.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeArticle extends Document {
  title: string;
  slug: string;
  category: 'guide' | 'procedure' | 'faq' | 'training' | 'documentation';
  subcategory?: string;
  content: string; // Rich text / Markdown
  summary?: string;
  tags: string[];
  attachments?: Array<{
    name: string;
    url: string;
    type: string; // pdf, image, video
    size: number;
  }>;
  relatedArticles?: mongoose.Types.ObjectId[];
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  views: number;
  helpful: {
    yes: number;
    no: number;
  };
  lastReviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  domain: mongoose.Types.ObjectId;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ['guide', 'procedure', 'faq', 'training', 'documentation'],
      required: true,
    },
    subcategory: String,
    content: {
      type: String,
      required: true,
    },
    summary: String,
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    relatedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'KnowledgeArticle',
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      yes: {
        type: Number,
        default: 0,
      },
      no: {
        type: Number,
        default: 0,
      },
    },
    lastReviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    domain: {
      type: Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
knowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });

const KnowledgeArticle = mongoose.model<IKnowledgeArticle>('KnowledgeArticle', knowledgeArticleSchema);
export default KnowledgeArticle;
