'use client';

import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { WebsiteCardProps } from '@/types';

export default function WebsiteCard({ website, onEdit, onDelete }: WebsiteCardProps) {
  // Generate a colored gradient background based on website title
  const generatePreviewStyle = (title: string) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    
    // Generate a consistent index based on the title
    const index = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return {
      background: colors[index],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    };
  };

  // Get initials from title for the preview
  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(website);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete "${website.title}"?`)) {
      onDelete(website._id);
    }
  };

  return (
    <div className="website-card">
      <div className="website-preview" style={generatePreviewStyle(website.title)}>
        <div className="preview-content">
          {getInitials(website.title)}
        </div>
        <div className="card-actions">
          {onEdit && (
            <button 
              onClick={handleEdit}
              className="action-btn edit-btn"
              title="Edit website"
            >
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="action-btn delete-btn"
              title="Delete website"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="website-info">
        <h3 className="website-title">{website.title}</h3>
        <a 
          href={website.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="website-url"
        >
          <ExternalLink size={16} />
          {website.url}
        </a>
        {website.note && (
          <p className="website-note">{website.note}</p>
        )}
        {website.tags && website.tags.length > 0 && (
          <div className="website-tags">
            {website.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="website-date">
          Added: {new Date(website.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}