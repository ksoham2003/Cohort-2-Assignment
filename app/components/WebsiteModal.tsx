'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Globe } from 'lucide-react';
import { WebsiteModalProps, CreateWebsiteDto } from '@/types';

export default function WebsiteModal({ 
  isOpen, 
  onClose, 
  onAddWebsite, 
  isEditing = false, 
  website = null 
}: WebsiteModalProps) {
  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (isEditing && website) {
        setTitle(website.title);
        setUrl(website.url);
        setNote(website.note || '');
        setTags(website.tags || []);
        setIsPublic(website.isPublic || false);
      } else {
        setTitle('');
        setUrl('');
        setNote('');
        setTags([]);
        setIsPublic(false);
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isEditing, website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!title.trim() || !url.trim()) {
      alert('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      setIsLoading(false);
      return;
    }

    const websiteData: CreateWebsiteDto = {
      title: title.trim(),
      url: url.trim(),
      note: note.trim(),
      userId: 'user-1',
      tags: tags.filter(tag => tag.trim().length > 0),
      isPublic,
    };

    try {
      await onAddWebsite(websiteData);
      handleClose();
    } catch (error) {
      console.error('Error saving website:', error);
      alert('Failed to save website');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleClose = () => {
    setTitle('');
    setUrl('');
    setNote('');
    setTags([]);
    setCurrentTag('');
    setIsPublic(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Website' : 'Add New Website'}
          </h2>
          <button className="close-btn" onClick={handleClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="website-title">Website Title *</label>
            <input
              type="text"
              id="website-title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="Enter website title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website-url">Website URL *</label>
            <input
              type="url"
              id="website-url"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website-note">Note</label>
            <textarea
              id="website-note"
              value={note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
              placeholder="Add a note about this website..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website-tags">
              <Tag size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Tags
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                id="website-tags"
                value={currentTag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
                disabled={isLoading}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={isLoading || !currentTag.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#3730a3',
                      fontSize: '1rem'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (isEditing ? 'Update Website' : 'Add Website')}
          </button>
        </form>
      </div>
    </div>
  );
}