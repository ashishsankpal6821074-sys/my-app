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
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [documentInput, setDocumentInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [documentOutput, setDocumentOutput] = useState('');
  const [emailOutput, setEmailOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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
          // Close modal
          setShowAddPromptModal(false);
          setEditingId(null);
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
    setShowAddPromptModal(true);
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

  // Open add prompt modal
  const handleOpenAddPromptModal = () => {
    setShowAddPromptModal(true);
  };

  // Close add prompt modal
  const handleCloseAddPromptModal = () => {
    setShowAddPromptModal(false);
    // Reset form when closing modal
    setFormData({
      title: '',
      description: '',
      content: '',
      isPublic: false
    });
    setErrors({});
    setEditingId(null);
  };

  // Document Enhancement handlers
  const handleOpenDocumentModal = () => {
    setShowDocumentModal(true);
    setDocumentInput('');
    setDocumentOutput('');
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setDocumentInput('');
    setDocumentOutput('');
  };

  const handleDocumentEnhancement = async () => {
    if (!documentInput.trim()) {
      alert('Please enter content to analyze');
      return;
    }

    setIsProcessing(true);
    try {
      const documentPrompt = `You are a business analyst AI assistant.

Analyze the uploaded content and produce a professional, structured Business Requirements Document (BRD) that includes:
- Title
- Purpose and Background
- Scope (In-Scope and Out-of-Scope)
- Actors or Stakeholders
- Functional Requirements
- Non-Functional Requirements
- Assumptions and Constraints
- Flow Diagram (stepwise explanation)
- Future Enhancements
- Version History

If any data is missing, mention "Not provided".

Input:
${documentInput}`;

      // Simulate API call for document enhancement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const enhancedDocument = `# Business Requirements Document

## Title
Document Enhancement Analysis

## Purpose and Background
${documentInput.length > 100 ? documentInput.substring(0, 100) + '...' : documentInput}

## Scope
**In-Scope:**
- Analysis of provided content
- Generation of structured BRD format
- Identification of key requirements

**Out-of-Scope:**
- Not provided

## Actors or Stakeholders
- Business Analyst
- Project Manager
- Development Team
- End Users

## Functional Requirements
1. System shall process the provided input content
2. System shall generate structured documentation
3. System shall identify key business requirements

## Non-Functional Requirements
- Performance: Response time < 3 seconds
- Reliability: 99.9% uptime
- Scalability: Support multiple concurrent users

## Assumptions and Constraints
**Assumptions:**
- Input content is relevant to business requirements
- Users have appropriate access permissions

**Constraints:**
- Limited to provided input data
- Processing time dependent on content complexity

## Flow Diagram (Stepwise Explanation)
1. User provides input content
2. System analyzes content structure
3. System extracts key requirements
4. System generates BRD format
5. System presents structured output

## Future Enhancements
- Integration with project management tools
- Advanced AI analysis capabilities
- Multi-format export options

## Version History
- v1.0 - Initial BRD generation (${new Date().toLocaleDateString()})`;

      setDocumentOutput(enhancedDocument);
    } catch (error) {
      console.error('Error enhancing document:', error);
      alert('Failed to enhance document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Email Rewriting handlers
  const handleOpenEmailModal = () => {
    setShowEmailModal(true);
    setEmailInput('');
    setEmailOutput('');
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailInput('');
    setEmailOutput('');
  };

  const handleEmailRewriting = async () => {
    if (!emailInput.trim()) {
      alert('Please enter email content to rewrite');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call for email rewriting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze the original email for context and tone
      const originalText = emailInput.toLowerCase();
      const isUrgent = originalText.includes('urgent') || originalText.includes('asap') || originalText.includes('immediately');
      const isRequest = originalText.includes('can you') || originalText.includes('could you') || originalText.includes('please');
      const isFollowUp = originalText.includes('follow up') || originalText.includes('checking in') || originalText.includes('following up');
      const isThankYou = originalText.includes('thank') || originalText.includes('appreciate');
      const isMeeting = originalText.includes('meeting') || originalText.includes('schedule') || originalText.includes('call');
      
      // Generate varied subject lines based on content
      const subjectLines = {
        urgent: ["Time-Sensitive Request", "Quick Response Needed", "Urgent Matter - Action Required"],
        request: ["Request for Assistance", "Quick Question", "Need Your Help With Something"],
        followUp: ["Following Up on Our Previous Discussion", "Checking In", "Quick Follow-Up"],
        thankYou: ["Thank You", "Much Appreciated", "Grateful for Your Help"],
        meeting: ["Meeting Request", "Let's Schedule a Time to Chat", "Quick Call Request"],
        general: ["Quick Update", "Reaching Out", "Hope You're Doing Well"]
      };

      let subjectCategory = 'general';
      if (isUrgent) subjectCategory = 'urgent';
      else if (isRequest) subjectCategory = 'request';
      else if (isFollowUp) subjectCategory = 'followUp';
      else if (isThankYou) subjectCategory = 'thankYou';
      else if (isMeeting) subjectCategory = 'meeting';

      const selectedSubject = subjectLines[subjectCategory][Math.floor(Math.random() * subjectLines[subjectCategory].length)];

      // Generate varied greetings
      const greetings = [
        "Hi there,",
        "Hello,",
        "Hey,",
        "Good morning/afternoon,",
        "Hope you're having a great day,",
        "Hope this finds you well,"
      ];

      // Generate varied closings
      const closings = {
        formal: [
          "Best regards,",
          "Kind regards,",
          "Sincerely,",
          "Best,"
        ],
        casual: [
          "Thanks,",
          "Cheers,",
          "Best,",
          "Talk soon,",
          "Have a great day,",
        ]
      };

      const isFormalContext = originalText.includes('sir') || originalText.includes('madam') || originalText.includes('dear') || originalText.length > 200;
      const selectedClosing = isFormalContext 
        ? closings.formal[Math.floor(Math.random() * closings.formal.length)]
        : closings.casual[Math.floor(Math.random() * closings.casual.length)];

      const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];

      // Process the main content more naturally
      const sentences = emailInput.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const processedContent = sentences.map(sentence => {
        let processed = sentence.trim();
        
        // Capitalize first letter
        processed = processed.charAt(0).toUpperCase() + processed.slice(1);
        
        // Make it more conversational
        processed = processed
          .replace(/\bu\b/g, 'you')
          .replace(/\bur\b/g, 'your')
          .replace(/\btxt\b/g, 'text')
          .replace(/\bmsg\b/g, 'message')
          .replace(/\bthx\b/g, 'thank you')
          .replace(/\bpls\b/g, 'please')
          .replace(/\basap\b/g, 'as soon as possible');
        
        return processed;
      }).join('. ');

      // Add natural transitions and connecting phrases
      let enhancedContent = processedContent;
      
      if (isRequest) {
        const requestPhrases = [
          "I was wondering if you could help me with something. ",
          "I hope you don't mind me reaching out about this. ",
          "When you have a moment, could you please ",
          "I'd really appreciate your help with "
        ];
        const randomPhrase = requestPhrases[Math.floor(Math.random() * requestPhrases.length)];
        enhancedContent = randomPhrase + enhancedContent.toLowerCase();
      }

      if (isFollowUp) {
        const followUpPhrases = [
          "I wanted to circle back on ",
          "Just checking in about ",
          "Following up on our conversation about ",
          "I thought I'd touch base regarding "
        ];
        const randomPhrase = followUpPhrases[Math.floor(Math.random() * followUpPhrases.length)];
        enhancedContent = randomPhrase + enhancedContent.toLowerCase();
      }

      // Add natural ending phrases
      const endingPhrases = {
        request: [
          "Let me know what works best for you.",
          "Thanks so much for considering this.",
          "I'd be grateful for any help you can provide.",
          "No rush at all - whenever you get a chance."
        ],
        general: [
          "Let me know if you have any questions.",
          "Feel free to reach out if you need anything.",
          "Hope to hear from you soon.",
          "Thanks for your time."
        ],
        urgent: [
          "I'd appreciate a quick response when possible.",
          "Thanks for your prompt attention to this.",
          "Looking forward to hearing back from you soon."
        ]
      };

      let endingCategory = 'general';
      if (isRequest) endingCategory = 'request';
      else if (isUrgent) endingCategory = 'urgent';

      const selectedEnding = endingPhrases[endingCategory][Math.floor(Math.random() * endingPhrases[endingCategory].length)];

      const rewrittenEmail = `**Subject:** ${selectedSubject}

**Enhanced Email:**

${selectedGreeting}

${enhancedContent}

${selectedEnding}

${selectedClosing}
[Your Name]`;

      setEmailOutput(rewrittenEmail);
    } catch (error) {
      console.error('Error rewriting email:', error);
      alert('Failed to rewrite email. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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

      {/* Action Buttons Section */}
      <div className="action-buttons-section">
        <div className="primary-actions">
          <button 
            className="add-prompt-button"
            onClick={handleOpenAddPromptModal}
          >
            <span className="button-icon">➕</span>
            Add New Prompt
          </button>
        </div>
        
        <div className="utility-actions">
          <button 
            className="utility-button document-button"
            onClick={handleOpenDocumentModal}
          >
            <span className="button-icon">📄</span>
            Document Enhancement
          </button>
          <button 
            className="utility-button email-button"
            onClick={handleOpenEmailModal}
          >
            <span className="button-icon">✉️</span>
            Email Rewriting
          </button>
        </div>
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

      {/* Document Enhancement Modal */}
      {showDocumentModal && (
        <div className="modal-overlay" onClick={handleCloseDocumentModal}>
          <div className="modal-content utility-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                📄 Document Enhancement
              </h2>
              <button 
                className="modal-close-button"
                onClick={handleCloseDocumentModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="utility-content">
                <div className="input-section">
                  <label className="form-label">
                    Input Content for Analysis
                  </label>
                  <textarea
                    value={documentInput}
                    onChange={(e) => setDocumentInput(e.target.value)}
                    className="form-textarea"
                    placeholder="Paste your content here to generate a Business Requirements Document..."
                    rows="8"
                    disabled={isProcessing}
                  />
                </div>
                
                {documentOutput && (
                  <div className="output-section">
                    <label className="form-label">
                      Generated Business Requirements Document
                    </label>
                    <div className="output-content">
                      <pre className="output-text">{documentOutput}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  onClick={handleDocumentEnhancement}
                  className={`modal-button accept-button ${isProcessing ? 'loading' : ''}`}
                  disabled={isProcessing || !documentInput.trim()}
                >
                  {isProcessing ? 'Analyzing...' : 'Generate BRD'}
                </button>
                <button
                  className="modal-button reject-button"
                  onClick={handleCloseDocumentModal}
                  disabled={isProcessing}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Rewriting Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={handleCloseEmailModal}>
          <div className="modal-content utility-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                ✉️ Email Rewriting
              </h2>
              <button 
                className="modal-close-button"
                onClick={handleCloseEmailModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="utility-content">
                <div className="input-section">
                  <label className="form-label">
                    Original Email Content
                  </label>
                  <textarea
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="form-textarea"
                    placeholder="Paste your email content here to make it more professional..."
                    rows="6"
                    disabled={isProcessing}
                  />
                </div>
                
                {emailOutput && (
                  <div className="output-section">
                    <label className="form-label">
                      Professional Email
                    </label>
                    <div className="output-content">
                      <pre className="output-text">{emailOutput}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  onClick={handleEmailRewriting}
                  className={`modal-button accept-button ${isProcessing ? 'loading' : ''}`}
                  disabled={isProcessing || !emailInput.trim()}
                >
                  {isProcessing ? 'Rewriting...' : 'Rewrite Email'}
                </button>
                <button
                  className="modal-button reject-button"
                  onClick={handleCloseEmailModal}
                  disabled={isProcessing}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Prompt Modal */}
      {showAddPromptModal && (
        <div className="modal-overlay" onClick={handleCloseAddPromptModal}>
          <div className="modal-content add-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? 'Edit Prompt' : 'Add New Prompt'}
              </h2>
              <button 
                className="modal-close-button"
                onClick={handleCloseAddPromptModal}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
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

                <div className="modal-footer">
                  <button
                    type="submit"
                    className={`modal-button accept-button ${isSubmitting ? 'loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : editingId ? 'Update Prompt' : 'Save Prompt'}
                  </button>
                  <button
                    type="button"
                    className="modal-button reject-button"
                    onClick={handleCloseAddPromptModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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