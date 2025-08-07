// Mock API Service - Replace with real backend implementation
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.users = this.loadMockData('users', []);
    this.organizations = this.loadMockData('organizations', []);
    this.prompts = this.loadMockData('prompts', []);
    
    // Initialize with demo organization if empty
    if (this.organizations.length === 0) {
      this.initializeDemoData();
    }
  }

  // Utility methods
  loadMockData(key, defaultValue) {
    try {
      const data = localStorage.getItem(`mock_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  saveMockData(key, data) {
    localStorage.setItem(`mock_${key}`, JSON.stringify(data));
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  initializeDemoData() {
    const demoOrg = {
      id: 'aexonic-tech',
      name: 'Aexonic Technologies Pvt. Ltd',
      domain: 'aexonic.com',
      plan: 'enterprise',
      createdAt: new Date().toISOString(),
      settings: {
        allowUserRegistration: true,
        maxUsersPerOrg: 100,
        featuresEnabled: ['ai_improvement', 'collaboration', 'analytics']
      }
    };

    this.organizations.push(demoOrg);
    this.saveMockData('organizations', this.organizations);

    // Add sample prompts to demonstrate AI improvement
    if (this.prompts.length === 0) {
      this.addSamplePrompts();
    }
  }

  addSamplePrompts() {
    const samplePrompts = [
      {
        id: 'sample-1',
        title: 'Create React Component',
        description: 'Need to create a reusable React component for user profiles',
        content: 'Create a React component that displays user information like name, email, and avatar. Make it reusable.',
        createdBy: 'demo-user',
        organizationId: 'aexonic-tech',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 5,
        isPublic: true,
        tags: ['react', 'component', 'ui'],
        version: 1
      },
      {
        id: 'sample-2',
        title: 'Fix Authentication Bug',
        description: 'Users are getting logged out randomly during their session',
        content: 'Help me debug this issue where users get logged out unexpectedly. The session seems to expire even though the token is still valid.',
        createdBy: 'demo-user',
        organizationId: 'aexonic-tech',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        usageCount: 2,
        isPublic: true,
        tags: ['debug', 'authentication', 'session'],
        version: 1
      },
      {
        id: 'sample-3',
        title: 'Database Query Optimization',
        description: 'Need to optimize slow-running database queries for better performance',
        content: 'Optimize this SQL query that takes too long to execute. It joins multiple tables and has complex filtering.',
        createdBy: 'demo-user',
        organizationId: 'aexonic-tech',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        usageCount: 1,
        isPublic: false,
        tags: ['database', 'sql', 'optimization'],
        version: 1
      },
      {
        id: 'sample-4',
        title: 'API Documentation',
        description: 'Create comprehensive documentation for our REST API endpoints',
        content: 'Write documentation for our user management API. Include endpoints, parameters, and examples.',
        createdBy: 'demo-user',
        organizationId: 'aexonic-tech',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        usageCount: 0,
        isPublic: true,
        tags: ['documentation', 'api', 'rest'],
        version: 1
      }
    ];

    this.prompts.push(...samplePrompts);
    this.saveMockData('prompts', this.prompts);
  }

  // Authentication APIs
  async login(email, password) {
    await this.delay(1500);

    const user = this.users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Simple password check (in real app, use proper hashing)
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    // Get organization details
    const organization = this.organizations.find(org => org.id === user.organizationId);

    const token = this.generateId();
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      organizationId: user.organizationId,
      organization: organization,
      lastLogin: new Date().toISOString(),
      preferences: user.preferences || {}
    };

    return {
      success: true,
      user: userResponse,
      token: token
    };
  }

  async signup(userData) {
    await this.delay(2000);

    const { name, email, password, department, organizationCode } = userData;

    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Find organization by code or create new one
    let organization = this.organizations.find(org => 
      org.domain.includes(organizationCode) || org.id === organizationCode
    );

    if (!organization) {
      // Create new organization for first user
      organization = {
        id: this.generateId(),
        name: `${name}'s Organization`,
        domain: organizationCode || 'custom.com',
        plan: 'starter',
        createdAt: new Date().toISOString(),
        settings: {
          allowUserRegistration: true,
          maxUsersPerOrg: 10,
          featuresEnabled: ['basic_prompts']
        }
      };
      this.organizations.push(organization);
      this.saveMockData('organizations', this.organizations);
    }

    // Create new user
    const newUser = {
      id: this.generateId(),
      name,
      email,
      password, // In real app, hash this!
      role: this.users.filter(u => u.organizationId === organization.id).length === 0 ? 'admin' : 'user',
      department: department || 'General',
      organizationId: organization.id,
      createdAt: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true
      }
    };

    this.users.push(newUser);
    this.saveMockData('users', this.users);

    const token = this.generateId();
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      organizationId: newUser.organizationId,
      organization: organization,
      lastLogin: new Date().toISOString(),
      preferences: newUser.preferences
    };

    return {
      success: true,
      user: userResponse,
      token: token
    };
  }

  // Prompt Management APIs
  async getPrompts(userId, organizationId) {
    await this.delay(800);

    const userPrompts = this.prompts.filter(prompt => 
      prompt.organizationId === organizationId &&
      (prompt.isPublic || prompt.createdBy === userId)
    );

    return {
      success: true,
      prompts: userPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    };
  }

  async createPrompt(promptData, userId, organizationId) {
    await this.delay(1000);

    const newPrompt = {
      id: this.generateId(),
      ...promptData,
      createdBy: userId,
      organizationId: organizationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      isPublic: promptData.isPublic || false,
      tags: promptData.tags || [],
      version: 1
    };

    this.prompts.push(newPrompt);
    this.saveMockData('prompts', this.prompts);

    return { success: true, prompt: newPrompt };
  }

  async updatePrompt(promptId, promptData, userId) {
    await this.delay(800);

    const promptIndex = this.prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) {
      return { success: false, error: 'Prompt not found' };
    }

    const prompt = this.prompts[promptIndex];
    
    // Check if user has permission to edit
    if (prompt.createdBy !== userId) {
      return { success: false, error: 'Permission denied' };
    }

    const updatedPrompt = {
      ...prompt,
      ...promptData,
      updatedAt: new Date().toISOString(),
      version: prompt.version + 1
    };

    this.prompts[promptIndex] = updatedPrompt;
    this.saveMockData('prompts', this.prompts);

    return { success: true, prompt: updatedPrompt };
  }

  async deletePrompt(promptId, userId) {
    await this.delay(500);

    const promptIndex = this.prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) {
      return { success: false, error: 'Prompt not found' };
    }

    const prompt = this.prompts[promptIndex];
    
    // Check if user has permission to delete
    if (prompt.createdBy !== userId) {
      return { success: false, error: 'Permission denied' };
    }

    this.prompts.splice(promptIndex, 1);
    this.saveMockData('prompts', this.prompts);

    return { success: true };
  }

  async incrementUsage(promptId) {
    const promptIndex = this.prompts.findIndex(p => p.id === promptId);
    if (promptIndex !== -1) {
      this.prompts[promptIndex].usageCount += 1;
      this.prompts[promptIndex].lastUsed = new Date().toISOString();
      this.saveMockData('prompts', this.prompts);
    }
  }

  // Organization APIs
  async getOrganizationStats(organizationId) {
    await this.delay(600);

    const orgPrompts = this.prompts.filter(p => p.organizationId === organizationId);
    const orgUsers = this.users.filter(u => u.organizationId === organizationId);

    return {
      success: true,
      stats: {
        totalPrompts: orgPrompts.length,
        totalUsers: orgUsers.length,
        aiEnhancedPrompts: orgPrompts.filter(p => p.improvedByAI).length,
        totalUsage: orgPrompts.reduce((sum, p) => sum + p.usageCount, 0),
        activeUsers: orgUsers.filter(u => {
          const lastLogin = new Date(u.lastLogin || u.createdAt);
          const daysSinceLogin = (Date.now() - lastLogin) / (1000 * 60 * 60 * 24);
          return daysSinceLogin <= 30;
        }).length
      }
    };
  }

  // AI Enhancement API (mock)
  async enhancePrompt(prompt) {
    await this.delay(2500);

    // Advanced AI enhancement based on prompt content analysis
    const enhancements = this.generateAdvancedEnhancement(prompt);

    return { success: true, enhanced: enhancements };
  }

  generateAdvancedEnhancement(prompt) {
    const title = prompt.title.toLowerCase();
    const content = prompt.content.toLowerCase();
    
    // Detect prompt category and apply specialized improvements
    if (this.isCodeGenerationPrompt(title, content)) {
      return this.enhanceCodeGenerationPrompt(prompt);
    } else if (this.isDebugPrompt(title, content)) {
      return this.enhanceDebugPrompt(prompt);
    } else {
      return this.enhanceGenericPrompt(prompt);
    }
  }

  isCodeGenerationPrompt(title, content) {
    const codeKeywords = ['code', 'function', 'component', 'api', 'class', 'method', 'algorithm', 'script', 'program', 'create', 'build', 'develop'];
    return codeKeywords.some(keyword => title.includes(keyword) || content.includes(keyword));
  }

  isDebugPrompt(title, content) {
    const debugKeywords = ['debug', 'fix', 'error', 'bug', 'issue', 'problem', 'troubleshoot'];
    return debugKeywords.some(keyword => title.includes(keyword) || content.includes(keyword));
  }

  enhanceCodeGenerationPrompt(prompt) {
    return {
      title: `Code Generation Expert: ${prompt.title}`,
      description: `${prompt.description}\n\n🤖 AI Enhancement: This prompt has been optimized for precise code generation with comprehensive specifications, error handling, and best practices integration. The enhanced version ensures consistent, production-ready code output.`,
      content: `You are a senior software engineer with expertise in multiple programming languages and frameworks. Your task is to generate high-quality, production-ready code based on the following specifications.

## Context & Requirements
${prompt.description}

## Specific Instructions
${prompt.content}

## Code Generation Guidelines
Please follow these standards when generating code:

### 🏗️ **Structure & Organization**
- Use clear, descriptive variable and function names
- Follow language-specific naming conventions (camelCase, snake_case, etc.)
- Organize code with proper indentation and spacing
- Include meaningful comments for complex logic

### 🛡️ **Error Handling & Validation**
- Implement comprehensive error handling with try-catch blocks
- Add input validation for all parameters
- Include edge case handling
- Provide meaningful error messages

### 🚀 **Performance & Best Practices**
- Write efficient, optimized code
- Follow SOLID principles and design patterns
- Use appropriate data structures
- Implement proper memory management

### 📝 **Documentation & Testing**
- Include JSDoc/docstring comments for functions/classes
- Add inline comments for complex algorithms
- Suggest unit test cases for the generated code
- Provide usage examples

### 🔧 **Additional Requirements**
- Specify any dependencies or imports needed
- Include type annotations (TypeScript, Python type hints, etc.)
- Follow security best practices
- Make code modular and reusable

## Expected Output Format
1. **Main Code**: Complete, functional implementation  
2. **Dependencies**: List of required packages/modules
3. **Usage Example**: How to use the generated code
4. **Test Cases**: Suggested test scenarios
5. **Notes**: Any important considerations or limitations

Generate clean, well-documented, production-ready code that adheres to industry standards and best practices.`,
      improvedByAI: true,
      aiEnhanceDate: new Date().toISOString()
    };
  }

  enhanceDebugPrompt(prompt) {
    return {
      title: `Debug & Troubleshooting Expert: ${prompt.title}`,
      description: `${prompt.description}\n\n🐛 AI Enhancement: This prompt has been optimized for systematic debugging with comprehensive analysis, root cause identification, and solution strategies.`,
      content: `You are a debugging expert with deep knowledge of software systems, error patterns, and troubleshooting methodologies. Help identify and resolve the following issue.

## Problem Context
${prompt.description}

## Issue Details
${prompt.content}

## Systematic Debugging Approach

### 🔍 **Issue Analysis**
1. **Symptom Identification**: Clearly describe the observed behavior
2. **Expected vs Actual**: Compare expected and actual outcomes
3. **Reproduction Steps**: Outline steps to consistently reproduce the issue
4. **Environment Details**: Consider system, browser, version differences

### 🎯 **Root Cause Investigation**
- **Error Message Analysis**: Decode error messages and stack traces
- **Data Flow Analysis**: Trace data flow through the system
- **State Inspection**: Check variable states and object properties
- **Timeline Analysis**: Understand when and why the issue occurs

### 🛠️ **Common Issue Patterns**
Check for these frequent causes:
- **Null/Undefined References**: Missing null checks
- **Async/Await Issues**: Promise handling problems
- **Scope Problems**: Variable accessibility issues
- **Type Mismatches**: Data type conversion errors
- **Race Conditions**: Timing-related bugs
- **Memory Leaks**: Unreleased resources

### 💡 **Solution Development**
1. **Immediate Fix**: Quick resolution for urgent issues
2. **Proper Solution**: Long-term, maintainable fix
3. **Prevention**: How to avoid similar issues in the future
4. **Testing Strategy**: Verify the fix works correctly

## Expected Output Format
- **Root Cause**: Primary cause of the issue
- **Step-by-Step Fix**: Detailed resolution steps
- **Code Changes**: Specific code modifications needed
- **Testing Instructions**: How to verify the fix
- **Prevention Measures**: Avoid similar issues in future

Provide clear, actionable debugging guidance with specific solutions and preventive measures.`,
      improvedByAI: true,
      aiEnhanceDate: new Date().toISOString()
    };
  }

  enhanceGenericPrompt(prompt) {
    return {
      title: `Enhanced: ${prompt.title}`,
      description: `${prompt.description}\n\n✨ AI Enhancement: This prompt has been optimized for better clarity, specificity, and effectiveness with structured guidelines and comprehensive output expectations.`,
      content: `You are an expert assistant with deep knowledge in ${prompt.title.toLowerCase()}. Provide comprehensive, high-quality assistance based on the following requirements.

## Task Context
${prompt.description}

## Specific Instructions
${prompt.content}

## Response Guidelines

### 🎯 **Accuracy & Quality**
- Provide accurate, well-researched information
- Use authoritative sources and best practices
- Double-check facts and recommendations
- Acknowledge limitations or uncertainties

### 📋 **Structure & Organization**
- Use clear headings and subheadings
- Present information in logical sequence
- Use bullet points and numbered lists for clarity
- Include examples and practical applications

### 💡 **Comprehensiveness**
- Cover all aspects of the request
- Provide context and background information
- Include relevant alternatives or variations
- Address potential challenges or considerations

### 🚀 **Actionability**
- Give specific, implementable recommendations
- Include step-by-step instructions where appropriate
- Provide concrete examples and use cases
- Suggest next steps or follow-up actions

Please ensure your response is comprehensive, well-structured, and directly addresses all aspects of the request with practical, actionable guidance.`,
      improvedByAI: true,
      aiEnhanceDate: new Date().toISOString()
    };
  }

  // Real API implementation would look like this:
  /*
  async makeRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getPrompts(userId, organizationId) {
    return this.makeRequest(`/prompts?org=${organizationId}`);
  }

  // ... other real API methods
  */
}

export const apiService = new ApiService();