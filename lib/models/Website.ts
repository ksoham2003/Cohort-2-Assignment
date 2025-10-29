import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsite extends Document {
  title: string;
  url: string;
  note?: string;
  userId: string;
  previewImage?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebsiteSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: [500, 'Note cannot be more than 500 characters'],
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    previewImage: {
      type: String,
      default: '',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
WebsiteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Website || mongoose.model<IWebsite>('Website', WebsiteSchema);