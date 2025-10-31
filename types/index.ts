export interface Website {
  _id: string;
  title: string;
  url: string;
  note: string;
  userId: string;
  previewImage?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebsiteDto {
  title: string;
  url: string;
  note: string;
  userId: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateWebsiteDto {
  title?: string;
  url?: string;
  note?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface WebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (website: CreateWebsiteDto) => Promise<void>;
  onUpdateWebsite?: (id: string, website: UpdateWebsiteDto) => Promise<void>;
  isEditing?: boolean;
  website?: Website | null;
}

export interface WebsiteCardProps {
  website: Website;
  onEdit?: (website: Website) => void;
  onDelete?: (id: string) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Add these to your existing types in types.ts

export interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

export interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
  name: 'ValidationError';
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: string;
  message?: string;
}

// Type guard functions
export function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  return error instanceof Error && error.name === 'ValidationError';
}

export function isMongoError(error: unknown): error is MongoError {
  return error instanceof Error && 'code' in error;
}