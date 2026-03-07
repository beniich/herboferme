import mongoose, { Schema, Document } from 'mongoose';

export interface IAIPrediction extends Document {
  domainId: mongoose.Types.ObjectId;
  type: 'yield' | 'disease' | 'weather_impact' | 'market';
  target: string; // e.g., 'Wheat Field A', 'Tomato Crop'
  predictionData: any; // Flexible JSON for the actual prediction details (probabilities, factors)
  confidence: number;
  modelUsed: string;
  generatedAt: Date;
}

const aiPredictionSchema = new Schema<IAIPrediction>(
  {
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
    type: { 
      type: String, 
      enum: ['yield', 'disease', 'weather_impact', 'market'], 
      required: true 
    },
    target: { type: String, required: true },
    predictionData: { type: Schema.Types.Mixed, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    modelUsed: { type: String, default: 'gpt-4-agro' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IAIPrediction>('AIPrediction', aiPredictionSchema);
