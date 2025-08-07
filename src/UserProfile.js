import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from './apiService';
import './UserProfile.css';

function UserProfile() {
  const { user, organization, updateUser } = useAuth();
  const [orgStats, setOrgStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    preferences: user?.preferences || {}
  });

  // Load organization statistics
  useEffect(() => {
    const loadStats = async () => {
      if (organization?.id) {
        try {
          const response = await apiService.getOrganizationStats(organization.id);
          if (response.success) {
            setOrgStats(response.stats);
          }
        } catch (error) {
          console.error('Failed to load organization stats:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStats();
  }, [organization]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    updateUser({
      name: formData.name,
      department: formData.department,
      preferences: formData.preferences
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      department: user?.department || '',
      preferences: user?.preferences || {}
    });
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-role">{user?.role} • {user?.department}</p>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>
        <button
          className="edit-profile-button"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* User Information Card */}
        <div className="profile-card">
          <h2 className="card-title">Personal Information</h2>
          
          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferences</label>
                <div className="preferences-grid">
                  <label className="preference-item">
                    <input
                      type="checkbox"
                      checked={formData.preferences.notifications || false}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    />
                    <span>Email Notifications</span>
                  </label>
                  
                  <label className="preference-item">
                    <input
                      type="checkbox"
                      checked={formData.preferences.autoSave || false}
                      onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                    />
                    <span>Auto-save Prompts</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="save-button" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info-display">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{user?.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department:</span>
                <span className="info-value">{user?.department || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {new Date(user?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Organization Information Card */}
        <div className="profile-card">
          <h2 className="card-title">Organization Details</h2>
          <div className="org-info">
            <div className="org-header">
              <span className="org-icon">🏢</span>
              <div>
                <h3 className="org-name">{organization?.name}</h3>
                <p className="org-plan">
                  {organization?.plan} Plan • {organization?.domain}
                </p>
              </div>
            </div>

            {orgStats && (
              <div className="org-stats">
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-number">{orgStats.totalUsers}</span>
                    <span className="stat-label">Team Members</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{orgStats.totalPrompts}</span>
                    <span className="stat-label">Total Prompts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{orgStats.aiEnhancedPrompts}</span>
                    <span className="stat-label">AI Enhanced</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{orgStats.totalUsage}</span>
                    <span className="stat-label">Total Usage</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Card */}
        <div className="profile-card">
          <h2 className="card-title">Available Features</h2>
          <div className="features-list">
            {organization?.settings?.featuresEnabled?.map((feature) => (
              <div key={feature} className="feature-item">
                <span className="feature-icon">✅</span>
                <span className="feature-name">
                  {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            )) || (
              <p className="no-features">No specific features configured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;