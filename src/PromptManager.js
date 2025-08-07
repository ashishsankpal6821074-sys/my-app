import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from './apiService';
import './PromptManager.css';

function PromptManager() {
  const { user, organization } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    isPublic: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [improvingId, setImprovingId] = useState(null);
  const [improvedPrompt, setImprovedPrompt] = useState(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load prompts from API on component mount
  useEffect(() => {
    const loadPrompts = async () => {
      if (user && organization) {
        try {
          const response = await apiService.getPrompts(user.id, organization.id);
          if (response.success) {
            setPrompts(response.prompts);
          }
        } catch (error) {
          console.error('Failed to load prompts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPrompts();
  }, [user, organization]);

  // Validation functions
  const validateTitle = (value) => {
    if (!value.trim()) {
      return 'Title is required';
    }
    if (value.trim().length < 3) {
      return 'Title must be at least 3 characters long';
    }
    return '';
  };

  const validateDescription = (value) => {
    if (!value.trim()) {
      return 'Description is required';
    }
    if (value.trim().length < 10) {
      return 'Description must be at least 10 characters long';
    }
    return '';
  };

  const validateContent = (value) => {
    if (!value.trim()) {
      return 'Prompt content is required';
    }
    if (value.trim().length < 5) {
      return 'Prompt content must be at least 5 characters long';
    }
    return '';
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors = {};
    newErrors.title = validateTitle(formData.title);
    newErrors.description = validateDescription(formData.description);
    newErrors.content = validateContent(formData.content);

    // Remove empty error messages
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);

    // If no errors, proceed with saving
    if (Object.keys(newErrors).length === 0) {
      try {
        let result;
        
        if (editingId) {
          // Update existing prompt
          result = await apiService.updatePrompt(editingId, formData, user.id);
          if (result.success) {
            setPrompts(prev => prev.map(prompt => 
              prompt.id === editingId ? result.prompt : prompt
            ));
            setEditingId(null);
          }
        } else {
          // Add new prompt
          result = await apiService.createPrompt(formData, user.id, organization.id);
          if (result.success) {
            setPrompts(prev => [result.prompt, ...prev]);
          }
        }

        if (result.success) {
          // Reset form
          setFormData({
            title: '',
            description: '',
            content: '',
            isPublic: false
          });
        } else {
          throw new Error(result.error || 'Failed to save prompt');
        }
      } catch (error) {
        console.error('Error saving prompt:', error);
        alert(error.message || 'Failed to save prompt. Please try again.');
      }
    }

    setIsSubmitting(false);
  };

  // Handle editing a prompt
  const handleEdit = (prompt) => {
    setFormData({
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      isPublic: prompt.isPublic || false
    });
    setEditingId(prompt.id);
    // Scroll to form
    document.querySelector('.prompt-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting a prompt
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        const result = await apiService.deletePrompt(id, user.id);
        if (result.success) {
          setPrompts(prev => prev.filter(prompt => prompt.id !== id));
        } else {
          alert(result.error || 'Failed to delete prompt');
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };

  // Handle using a prompt (increment usage count)
  const handleUsePrompt = async (id) => {
    try {
      await apiService.incrementUsage(id);
      setPrompts(prev => prev.map(prompt => 
        prompt.id === id 
          ? { ...prompt, usageCount: prompt.usageCount + 1 }
          : prompt
      ));
    } catch (error) {
      console.error('Error updating usage count:', error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      isPublic: false
    });
    setErrors({});
  };

  // Handle improving a prompt with AI
  const handleImprovePrompt = async (prompt) => {
    setImprovingId(prompt.id);
    
    try {
      const response = await apiService.enhancePrompt(prompt);
      if (response.success) {
        setImprovedPrompt({
          ...response.enhanced,
          originalId: prompt.id
        });
        setShowImprovementModal(true);
      } else {
        throw new Error('Failed to enhance prompt');
      }
    } catch (error) {
      console.error('Error improving prompt:', error);
      alert('Failed to improve prompt. Please try again.');
    } finally {
      setImprovingId(null);
    }
  };

  // Accept improved prompt
  const handleAcceptImprovement = async () => {
    if (improvedPrompt) {
      try {
        const updateData = {
          title: improvedPrompt.title,
          description: improvedPrompt.description,
          content: improvedPrompt.content,
          improvedByAI: true
        };
        
        const result = await apiService.updatePrompt(improvedPrompt.originalId, updateData, user.id);
        if (result.success) {
          setPrompts(prev => prev.map(prompt => 
            prompt.id === improvedPrompt.originalId ? result.prompt : prompt
          ));
          handleCloseImprovementModal();
        } else {
          throw new Error(result.error || 'Failed to save improved prompt');
        }
      } catch (error) {
        console.error('Error saving improved prompt:', error);
        alert('Failed to save improved prompt. Please try again.');
      }
    }
  };

  // Reject improved prompt
  const handleRejectImprovement = () => {
    handleCloseImprovementModal();
  };

  // Close improvement modal
  const handleCloseImprovementModal = () => {
    setShowImprovementModal(false);
    setImprovedPrompt(null);
  };

  // Filter prompts based on search term
  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="prompt-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-manager">
      {/* Header */}
      <div className="prompt-header">
        <div className="company-branding">
          <div className="company-logo">
            <span className="logo-icon">🚀</span>
            <span className="company-name">Aexonic Technologies Pvt. Ltd</span>
          </div>
          <div className="company-tagline">Innovating Tomorrow, Today</div>
        </div>
        <div className="header-content">
          <h1 className="prompt-title">AI Prompt Manager</h1>
          <p className="prompt-subtitle">Create, enhance, and manage your AI prompts with intelligent automation</p>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{prompts.length}</span>
              <span className="stat-label">Total Prompts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{prompts.filter(p => p.improvedByAI).length}</span>
              <span className="stat-label">AI Enhanced</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{prompts.reduce((sum, p) => sum + p.usageCount, 0)}</span>
              <span className="stat-label">Total Uses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Prompt Form */}
      <div className="prompt-card">
        <h2 className="card-title">
          {editingId ? 'Edit Prompt' : 'Add New Prompt'}
        </h2>
        
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Prompt Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter a descriptive title for your prompt"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe what this prompt is for and how it should be used"
              rows="3"
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Prompt Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className={`form-textarea ${errors.content ? 'error' : ''}`}
              placeholder="Enter your prompt content here..."
              rows="6"
              disabled={isSubmitting}
            />
            {errors.content && (
              <span className="error-message">{errors.content}</span>
            )}
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  disabled={isSubmitting}
                />
                <span className="checkbox-text">
                  <strong>Make this prompt public</strong>
                  <small>Other team members in your organization can view and use this prompt</small>
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`submit-button ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Prompt' : 'Save Prompt'}
            </button>
            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search and Filter */}
      <div className="prompt-card">
        <div className="search-section">
          <label htmlFor="search" style={{ marginRight: '5px'}} className="form-label">
            Search Prompts
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            placeholder="Search by title, description, or content..."
          />
        </div>
      </div>

      {/* Historical Prompts List */}
      <div className="prompt-card">
        <h2 className="card-title">
          Prompt History ({filteredPrompts.length})
        </h2>
        
        {filteredPrompts.length === 0 ? (
          <div className="empty-state">
            <p>No prompts found. {searchTerm ? 'Try adjusting your search.' : 'Start by adding your first prompt!'}</p>
          </div>
        ) : (
          <div className="prompts-list">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="prompt-item">
                <div className="prompt-header-item">
                  <div className="title-section">
                    <h3 className="prompt-item-title">{prompt.title}</h3>
                    <div className="badges-container">
                      {prompt.improvedByAI && (
                        <span className="ai-badge" title="This prompt has been enhanced by AI">
                          ✨ AI Enhanced
                        </span>
                      )}
                      {prompt.isPublic ? (
                        <span className="public-badge" title="This prompt is shared with your organization">
                          🌐 Public
                        </span>
                      ) : (
                        <span className="private-badge" title="This prompt is private to you">
                          🔒 Private
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="prompt-meta">
                    <span className="author-info">
                      {prompt.createdBy === user?.id ? 'Created by you' : `Created by ${prompt.authorName || 'Team member'}`}
                    </span>
                    <span className="usage-count">Used {prompt.usageCount} times</span>
                    <span className="date-info">
                      {prompt.updatedAt !== prompt.createdAt ? 'Updated' : 'Created'}: {formatDate(prompt.updatedAt)}
                    </span>
                  </div>
                </div>
                
                <p className="prompt-description">{prompt.description}</p>
                
                <div className="prompt-content">
                  <pre className="content-preview">{prompt.content}</pre>
                </div>
                
                <div className="prompt-actions">
                  <button
                    className="action-button use-button"
                    onClick={() => handleUsePrompt(prompt.id)}
                  >
                    Use Prompt
                  </button>
                  <button
                    className="action-button improve-button"
                    onClick={() => handleImprovePrompt(prompt)}
                    disabled={improvingId === prompt.id}
                  >
                    {improvingId === prompt.id ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        Improving...
                      </>
                    ) : (
                      <>
                        🤖 Improve with AI
                      </>
                    )}
                  </button>
                  <button
                    className="action-button edit-button"
                    onClick={() => handleEdit(prompt)}
                    disabled={improvingId === prompt.id}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(prompt.id)}
                    disabled={improvingId === prompt.id}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Improvement Modal */}
      {showImprovementModal && improvedPrompt && (
        <div className="modal-overlay" onClick={handleCloseImprovementModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">AI-Improved Prompt</h2>
              <button 
                className="modal-close-button"
                onClick={handleCloseImprovementModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="improvement-comparison">
                <div className="comparison-section">
                  <h3 className="improvement-label">📝 Title Enhancement</h3>
                  <div className="before-after">
                    <div className="before">
                      <small className="label">Original:</small>
                      <div className="content">{prompts.find(p => p.id === improvedPrompt.originalId)?.title}</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="after">
                      <small className="label">AI Enhanced:</small>
                      <div className="content">{improvedPrompt.title}</div>
                    </div>
                  </div>
                </div>

                <div className="comparison-section">
                  <h3 className="improvement-label">📋 Description Enhancement</h3>
                  <div className="before-after">
                    <div className="before">
                      <small className="label">Original:</small>
                      <div className="content">{prompts.find(p => p.id === improvedPrompt.originalId)?.description}</div>
                    </div>
                    <div className="arrow">→</div>
                    <div className="after">
                      <small className="label">AI Enhanced:</small>
                      <div className="content">{improvedPrompt.description}</div>
                    </div>
                  </div>
                </div>

                <div className="comparison-section full-width">
                  <h3 className="improvement-label">🚀 Content Enhancement</h3>
                  <div className="content-comparison">
                    <div className="before-content">
                      <small className="label">Original Prompt:</small>
                      <pre className="content">{prompts.find(p => p.id === improvedPrompt.originalId)?.content}</pre>
                    </div>
                    <div className="after-content">
                      <small className="label">AI Enhanced Prompt:</small>
                      <pre className="content">{improvedPrompt.content}</pre>
                    </div>
                  </div>
                </div>

                <div className="ai-improvements-badge">
                  <div className="badge-content">
                    <span className="badge-icon">✨</span>
                    <div className="badge-text">
                      <strong>AI Enhancements Applied</strong>
                      <p>This prompt has been optimized for better clarity, structure, and effectiveness when used with AI agents for code generation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-button accept-button"
                onClick={handleAcceptImprovement}
              >
                Accept Improvement
              </button>
              <button
                className="modal-button reject-button"
                onClick={handleRejectImprovement}
              >
                Keep Original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptManager;