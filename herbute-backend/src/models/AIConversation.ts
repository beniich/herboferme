import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  model: string;
  contextType?: string;
  tokensUsed: number;
  lastMessageAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    messages: [chatMessageSchema],
    model: { type: String, default: 'gpt-4' },
    contextType: { type: String },
    tokensUsed: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IAIConversation>('AIConversation', aiConversationSchema);
