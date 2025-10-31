'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, AlertCircle, Database } from 'lucide-react';
import WebsiteModal from './components/WebsiteModal';
import WebsiteCard from './components/WebsiteCard';
import { Website, CreateWebsiteDto, UpdateWebsiteDto } from '@/types';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [error, setError] = useState<string>('');
  const [connectionMode, setConnectionMode] = useState<'live' | 'error'>('live');

  // Fetch websites from API
  const fetchWebsites = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/websites?userId=user-1');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch websites: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setWebsites(result.data || []);
        setConnectionMode('live');
      } else {
        throw new Error(result.error || 'Failed to fetch websites');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load websites: ${errorMessage}`);
      setConnectionMode('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleAddWebsite = async (websiteData: CreateWebsiteDto) => {
    try {
      setError('');
      
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to create website`);
      }

      await fetchWebsites();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  const handleUpdateWebsite = async (id: string, websiteData: UpdateWebsiteDto) => {
    try {
      setError('');
      
      const response = await fetch(`/api/websites/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(websiteData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to update website`);
      }

      await fetchWebsites();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      throw error;
    }
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    setIsModalOpen(true);
  };

  const handleDeleteWebsite = async (id: string) => {
    try {
      const response = await fetch(`/api/websites/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete website');
      }

      // Remove the website from the local state immediately for better UX
      setWebsites(prev => prev.filter(website => website._id !== id));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete website';
      setError(errorMessage);
      // Refresh the list to ensure consistency
      await fetchWebsites();
    }
  };

  const openModal = () => {
    setError('');
    setEditingWebsite(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWebsite(null);
  };

  const handleModalSubmit = editingWebsite 
    ? (websiteData: CreateWebsiteDto) => handleUpdateWebsite(editingWebsite._id, websiteData)
    : handleAddWebsite;

  const getConnectionStatus = () => {
    switch (connectionMode) {
      case 'live':
        return { text: 'Connected to database', color: '#10b981', icon: Database };
      case 'error':
        return { text: 'Connection issues', color: '#ef4444', icon: AlertCircle };
      default:
        return { text: 'Unknown', color: '#6b7280', icon: AlertCircle };
    }
  };

  const connectionStatus = getConnectionStatus();
  const StatusIcon = connectionStatus.icon;

  return (
    <>
      <header>
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Cohort 2 Assignment</h1>
              <p className="subtitle">Collect and preview your favorite websites</p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: connectionStatus.color,
                fontSize: '0.875rem',
                marginTop: '0.25rem'
              }}>
                <StatusIcon size={16} />
                <span>{connectionStatus.text}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="add-btn" onClick={openModal}>
                <Plus size={20} />
                Add Website
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Error Display */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <div className="error-content">
              <strong>Error</strong>
              {error}
            </div>
            <button 
              onClick={() => setError('')}
              className="error-close-btn"
            >
              ×
            </button>
          </div>
        )}

        <section className="websites-section">
          {isLoading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="animate-spin" />
              <p>Loading websites...</p>
            </div>
          ) : websites.length === 0 ? (
            <div className="empty-state">
              <h2>No websites added yet</h2>
              <p>Click the &quot;Add Website&quot; button to get started!</p>
            </div>
          ) : (
            <div className="websites-grid">
              {websites.map(website => (
                <WebsiteCard 
                  key={website._id} 
                  website={website}
                  onEdit={handleEditWebsite}
                  onDelete={handleDeleteWebsite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <WebsiteModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddWebsite={handleModalSubmit}
        isEditing={!!editingWebsite}
        website={editingWebsite}
      />
    </>
  );
}