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