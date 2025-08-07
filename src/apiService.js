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

    // Enhance prompts with author information
    const enhancedPrompts = userPrompts.map(prompt => {
      const author = this.users.find(user => user.id === prompt.createdBy);
      return {
        ...prompt,
        authorName: author ? author.name : 'Unknown User'
      };
    });

    return {
      success: true,
      prompts: enhancedPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
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

  // AI-powered BRD Generation
  async generateBRD(inputContent) {
    await this.delay(3000); // Simulate AI processing time

    try {
      // This would typically call an AI service like OpenAI GPT, Claude, etc.
      // For now, we'll simulate intelligent BRD generation
      
      const analysis = this.analyzeBusinessContent(inputContent);
      const brd = this.createComprehensiveBRD(inputContent, analysis);
      
      return {
        success: true,
        brd: brd,
        analysis: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate BRD: ' + error.message
      };
    }
  }

  analyzeBusinessContent(content) {
    const text = content.toLowerCase();
    
    // Advanced content analysis
    const analysis = {
      projectType: this.detectProjectType(text),
      complexity: this.assessComplexity(text),
      stakeholders: this.identifyStakeholders(text),
      functionalAreas: this.extractFunctionalAreas(text),
      integrations: this.detectIntegrations(text),
      businessValue: this.extractBusinessValue(text),
      urgency: this.assessUrgency(text),
      scope: this.determineScope(text)
    };

    return analysis;
  }

  detectProjectType(text) {
    if (text.includes('mobile') || text.includes('app') || text.includes('ios') || text.includes('android')) return 'Mobile Application';
    if (text.includes('web') || text.includes('website') || text.includes('portal')) return 'Web Application';
    if (text.includes('integration') || text.includes('api') || text.includes('connect')) return 'System Integration';
    if (text.includes('dashboard') || text.includes('analytics') || text.includes('report')) return 'Analytics Platform';
    if (text.includes('ecommerce') || text.includes('shopping') || text.includes('payment')) return 'E-commerce Solution';
    if (text.includes('crm') || text.includes('customer')) return 'CRM System';
    if (text.includes('inventory') || text.includes('warehouse') || text.includes('stock')) return 'Inventory Management';
    return 'Business Application';
  }

  assessComplexity(text) {
    let score = 0;
    const complexityIndicators = [
      'integration', 'api', 'database', 'security', 'authentication', 'authorization',
      'workflow', 'approval', 'notification', 'reporting', 'analytics', 'dashboard',
      'mobile', 'responsive', 'scalability', 'performance', 'compliance', 'audit'
    ];
    
    complexityIndicators.forEach(indicator => {
      if (text.includes(indicator)) score++;
    });

    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  }

  identifyStakeholders(text) {
    const stakeholders = [];
    
    if (text.includes('admin') || text.includes('administrator')) stakeholders.push('System Administrator');
    if (text.includes('user') || text.includes('customer') || text.includes('client')) stakeholders.push('End Users');
    if (text.includes('manager') || text.includes('supervisor')) stakeholders.push('Management Team');
    if (text.includes('developer') || text.includes('technical')) stakeholders.push('Development Team');
    if (text.includes('finance') || text.includes('accounting')) stakeholders.push('Finance Department');
    if (text.includes('hr') || text.includes('human resource')) stakeholders.push('HR Department');
    if (text.includes('sales') || text.includes('marketing')) stakeholders.push('Sales & Marketing');
    if (text.includes('support') || text.includes('helpdesk')) stakeholders.push('Support Team');

    return stakeholders.length > 0 ? stakeholders : ['Business Users', 'System Administrator', 'Project Manager'];
  }

  extractFunctionalAreas(text) {
    const areas = [];
    
    if (text.includes('login') || text.includes('auth') || text.includes('password')) areas.push('User Authentication');
    if (text.includes('report') || text.includes('analytics') || text.includes('dashboard')) areas.push('Reporting & Analytics');
    if (text.includes('notification') || text.includes('alert') || text.includes('email')) areas.push('Notifications');
    if (text.includes('payment') || text.includes('transaction') || text.includes('billing')) areas.push('Payment Processing');
    if (text.includes('inventory') || text.includes('stock') || text.includes('product')) areas.push('Inventory Management');
    if (text.includes('order') || text.includes('purchase') || text.includes('cart')) areas.push('Order Management');
    if (text.includes('customer') || text.includes('client') || text.includes('contact')) areas.push('Customer Management');
    if (text.includes('document') || text.includes('file') || text.includes('upload')) areas.push('Document Management');

    return areas.length > 0 ? areas : ['Core Business Logic', 'User Management', 'Data Processing'];
  }

  detectIntegrations(text) {
    const integrations = [];
    
    if (text.includes('api') || text.includes('rest') || text.includes('soap')) integrations.push('External APIs');
    if (text.includes('database') || text.includes('sql') || text.includes('mongodb')) integrations.push('Database Systems');
    if (text.includes('email') || text.includes('smtp')) integrations.push('Email Services');
    if (text.includes('payment') || text.includes('stripe') || text.includes('paypal')) integrations.push('Payment Gateways');
    if (text.includes('sms') || text.includes('twilio')) integrations.push('SMS Services');
    if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) integrations.push('Cloud Services');
    if (text.includes('ldap') || text.includes('active directory')) integrations.push('Directory Services');

    return integrations;
  }

  extractBusinessValue(text) {
    if (text.includes('cost') || text.includes('save') || text.includes('reduce')) return 'Cost Reduction';
    if (text.includes('efficiency') || text.includes('automate') || text.includes('streamline')) return 'Operational Efficiency';
    if (text.includes('customer') || text.includes('satisfaction') || text.includes('experience')) return 'Customer Experience';
    if (text.includes('revenue') || text.includes('sales') || text.includes('profit')) return 'Revenue Growth';
    if (text.includes('compliance') || text.includes('regulation') || text.includes('audit')) return 'Regulatory Compliance';
    return 'Business Process Improvement';
  }

  assessUrgency(text) {
    if (text.includes('urgent') || text.includes('critical') || text.includes('asap')) return 'High';
    if (text.includes('soon') || text.includes('priority') || text.includes('important')) return 'Medium';
    return 'Normal';
  }

  determineScope(text) {
    const wordCount = text.split(' ').length;
    if (wordCount > 200) return 'Large';
    if (wordCount > 100) return 'Medium';
    return 'Small';
  }

  createComprehensiveBRD(content, analysis) {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Extract project title intelligently
    const sentences = content.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0] || analysis.projectType;
    let projectTitle = firstSentence.length > 60 
      ? firstSentence.substring(0, 60).trim() + '...' 
      : firstSentence.trim();
    
    projectTitle = projectTitle.charAt(0).toUpperCase() + projectTitle.slice(1);
    if (!projectTitle.toLowerCase().includes('system') && !projectTitle.toLowerCase().includes('application') && !projectTitle.toLowerCase().includes('platform')) {
      projectTitle += ` ${analysis.projectType}`;
    }

    return `# ${projectTitle}

## Document Version
- **Version:** 1.0
- **Date:** ${currentDate}
- **Prepared By:** AI Business Analyst
- **Document Status:** Draft
- **Project Complexity:** ${analysis.complexity}
- **Estimated Timeline:** ${this.estimateTimeline(analysis)}

## Purpose & Background

### Business Need
${this.generateBusinessNeed(content, analysis)}

### Current State Analysis
${this.generateCurrentStateAnalysis(analysis)}

### Proposed Solution
${this.generateProposedSolution(content, analysis)}

## Scope of the Requirement

### In-Scope:
${this.generateInScopeItems(analysis)}

### Out-of-Scope:
${this.generateOutOfScopeItems(analysis)}

### Success Metrics
${this.generateSuccessMetrics(analysis)}

## Stakeholders / Actors

### Primary Stakeholders:
${analysis.stakeholders.map(stakeholder => `• **${stakeholder}:** ${this.getStakeholderRole(stakeholder)}`).join('\n')}

### Secondary Stakeholders:
• **Quality Assurance Team:** Ensures system meets quality standards and testing requirements
• **Security Team:** Reviews and approves security implementations and protocols
• **Infrastructure Team:** Manages deployment environment and system resources
• **Business Analyst:** Facilitates requirements gathering and stakeholder communication

### External Stakeholders:
${analysis.integrations.length > 0 ? 
  analysis.integrations.map(integration => `• **${integration} Providers:** External service providers for system integration`).join('\n') :
  '• **Vendor Partners:** Third-party service providers as needed'
}

## Business Requirements

### Core Business Objectives:
1. **Primary Goal:** ${this.generatePrimaryGoal(analysis)}
2. **Business Value Delivery:** ${analysis.businessValue}
3. **Operational Excellence:** Improve ${this.generateOperationalFocus(analysis)}
4. **User Experience:** ${this.generateUXRequirement(analysis)}
5. **Scalability:** Support future growth and expansion requirements
6. **Compliance:** Meet all relevant industry standards and regulations

### Key Performance Indicators (KPIs):
${this.generateKPIs(analysis)}

## Functional Requirements

### ${analysis.functionalAreas[0] || 'Core System Functions'}:
${this.generateFunctionalRequirements(analysis.functionalAreas[0] || 'Core System Functions')}

### ${analysis.functionalAreas[1] || 'User Management'}:
${this.generateFunctionalRequirements(analysis.functionalAreas[1] || 'User Management')}

### ${analysis.functionalAreas[2] || 'Data Processing'}:
${this.generateFunctionalRequirements(analysis.functionalAreas[2] || 'Data Processing')}

${analysis.functionalAreas.slice(3).map(area => 
  `### ${area}:\n${this.generateFunctionalRequirements(area)}`
).join('\n\n')}

## Non-Functional Requirements

### Performance Requirements:
• **Response Time:** ${this.getPerformanceRequirement(analysis.complexity, 'response')}
• **Throughput:** ${this.getPerformanceRequirement(analysis.complexity, 'throughput')}
• **Availability:** ${this.getPerformanceRequirement(analysis.complexity, 'availability')}
• **Scalability:** ${this.getPerformanceRequirement(analysis.complexity, 'scalability')}

### Security Requirements:
${this.generateSecurityRequirements(analysis)}

### Usability Requirements:
${this.generateUsabilityRequirements(analysis)}

### Compatibility Requirements:
${this.generateCompatibilityRequirements(analysis)}

## Assumptions and Constraints

### Assumptions:
${this.generateAssumptions(analysis)}

### Constraints:
${this.generateConstraints(analysis)}

### Dependencies:
${this.generateDependencies(analysis)}

## Workflow / Process Flow Diagram (Described in Steps)

### Primary Business Process:
${this.generateWorkflowSteps(content, analysis)}

### Exception Handling:
${this.generateExceptionHandling(analysis)}

### Decision Points:
${this.generateDecisionPoints(analysis)}

## UI/UX Expectations

### Design Principles:
${this.generateDesignPrinciples(analysis)}

### User Interface Requirements:
${this.generateUIRequirements(analysis)}

### User Experience Goals:
${this.generateUXGoals(analysis)}

## Integration Requirements

### Internal Systems:
${this.generateInternalIntegrations(analysis)}

### External Systems:
${analysis.integrations.length > 0 ? 
  analysis.integrations.map(integration => `• **${integration}:** ${this.getIntegrationDetails(integration)}`).join('\n') :
  '• **Standard Web Services:** Basic HTTP/REST API integrations as needed'
}

### Data Exchange:
${this.generateDataExchangeRequirements(analysis)}

## Testing & Validation Criteria

### Testing Strategy:
${this.generateTestingStrategy(analysis)}

### Acceptance Criteria:
${this.generateAcceptanceCriteria(analysis)}

### Quality Gates:
${this.generateQualityGates(analysis)}

## Future Enhancements (Optional)

### Phase 2 Roadmap:
${this.generatePhase2Enhancements(analysis)}

### Long-term Vision:
${this.generateLongTermVision(analysis)}

### Technology Evolution:
${this.generateTechnologyEvolution(analysis)}

## Glossary / Definitions

${this.generateGlossary(analysis)}

---

**Document Classification:** ${analysis.urgency} Priority | ${analysis.complexity} Complexity | ${analysis.scope} Scope

**Next Steps:**
1. Stakeholder review and approval of this BRD
2. Technical architecture design and planning
3. Project timeline and resource allocation
4. Development phase initiation

**Note:** This AI-generated BRD provides a comprehensive foundation based on the input provided. Please review, validate, and refine all sections with domain experts and stakeholders before proceeding with implementation.`;
  }

  estimateTimeline(analysis) {
    const complexity = analysis.complexity;
    const scope = analysis.scope;
    
    if (complexity === 'High' && scope === 'Large') return '6-12 months';
    if (complexity === 'High' || scope === 'Large') return '4-8 months';
    if (complexity === 'Medium' && scope === 'Medium') return '3-6 months';
    if (complexity === 'Medium' || scope === 'Medium') return '2-4 months';
    return '1-3 months';
  }

  generateBusinessNeed(content, analysis) {
    const sentences = content.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
    const businessContext = sentences.slice(0, 3).join('. ');
    
    return `The organization requires ${analysis.projectType.toLowerCase()} to address current business challenges and opportunities. ${businessContext}

This initiative aligns with strategic business objectives to achieve ${analysis.businessValue.toLowerCase()} and enhance operational capabilities. The proposed solution will serve as a critical enabler for business growth and competitive advantage.`;
  }

  generateCurrentStateAnalysis(analysis) {
    return `**Current Challenges:**
• Manual processes leading to inefficiencies and errors
• Limited visibility into business operations and performance
• Fragmented systems requiring better integration
• Growing user demands for improved digital experiences

**Opportunity Assessment:**
• Automation potential to reduce operational costs by 20-30%
• Enhanced data analytics capabilities for better decision making
• Improved user satisfaction through streamlined processes
• Scalable architecture to support future business growth`;
  }

  generateProposedSolution(content, analysis) {
    return `The proposed ${analysis.projectType.toLowerCase()} will provide a comprehensive solution addressing identified business needs. Key solution components include:

• **Modern Architecture:** Scalable, secure, and maintainable system design
• **User-Centric Design:** Intuitive interfaces optimized for user productivity
• **Integration Capabilities:** Seamless connectivity with existing business systems
• **Advanced Analytics:** Real-time insights and reporting for data-driven decisions
• **Mobile Accessibility:** ${analysis.projectType.includes('Mobile') ? 'Native mobile experience' : 'Responsive design for mobile access'}`;
  }

  // Helper methods for generating specific BRD sections...
  generateInScopeItems(analysis) {
    const items = [
      `• ${analysis.projectType} development and implementation`,
      '• User training and change management',
      '• System testing and quality assurance',
      '• Initial deployment and go-live support',
      '• Documentation and user manuals'
    ];

    analysis.functionalAreas.forEach(area => {
      items.push(`• ${area} functionality`);
    });

    analysis.integrations.forEach(integration => {
      items.push(`• ${integration} integration`);
    });

    return items.join('\n');
  }

  generateOutOfScopeItems(analysis) {
    return `• Hardware procurement and infrastructure setup
• Legacy system decommissioning and data migration
• Third-party software licensing and ongoing maintenance
• Advanced AI/ML capabilities (future enhancement)
• Custom hardware or specialized equipment
• Ongoing operational support beyond warranty period`;
  }

  // Additional helper methods would continue here...
  // (I'll include the key ones for brevity)

  generateSuccessMetrics(analysis) {
    return `• User adoption rate: >90% within 3 months of deployment
• System performance: Meeting all specified performance requirements
• Business process efficiency: ${analysis.businessValue === 'Cost Reduction' ? '20-30% cost reduction' : '25-40% improvement in process efficiency'}
• User satisfaction score: >4.0/5.0 in post-implementation surveys
• System availability: >99.5% uptime during business hours`;
  }

  getStakeholderRole(stakeholder) {
    const roles = {
      'System Administrator': 'Manages system configuration, user access, and technical maintenance',
      'End Users': 'Primary users who interact with the system for daily business operations',
      'Management Team': 'Provides strategic direction and approves business decisions',
      'Development Team': 'Responsible for technical implementation and system development',
      'Finance Department': 'Manages budget, financial approvals, and cost tracking',
      'HR Department': 'Handles user onboarding, training, and organizational change management',
      'Sales & Marketing': 'Utilizes system for customer engagement and business development',
      'Support Team': 'Provides user support and issue resolution'
    };
    return roles[stakeholder] || 'Key stakeholder in the project implementation and success';
  }

  generatePrimaryGoal(analysis) {
    return `Deliver a comprehensive ${analysis.projectType.toLowerCase()} that enhances ${analysis.businessValue.toLowerCase()}`;
  }

  generateKPIs(analysis) {
    return `• System utilization: >85% user engagement\n• Process efficiency: 30-50% improvement\n• User satisfaction: >4.0/5.0 rating`;
  }

  generateFunctionalRequirements(area) {
    return `• Core functionality for ${area}\n• Data validation and processing\n• User interface components\n• Integration capabilities`;
  }

  generateOperationalFocus(analysis) {
    if (analysis.businessValue === 'Cost Reduction') return 'cost efficiency and resource optimization';
    if (analysis.businessValue === 'Customer Experience') return 'customer satisfaction and engagement';
    if (analysis.businessValue === 'Revenue Growth') return 'revenue generation and market expansion';
    return 'operational efficiency and process automation';
  }

  generateUXRequirement(analysis) {
    return `Provide an intuitive, ${analysis.projectType.includes('Mobile') ? 'mobile-first' : 'responsive'} user experience that minimizes training requirements`;
  }

  getPerformanceRequirement(complexity, type) {
    const requirements = {
      'Low': {
        'response': '< 2 seconds for 95% of user requests',
        'throughput': '100 concurrent users with optimal performance',
        'availability': '99.0% uptime during business hours',
        'scalability': 'Support for 2x current user base growth'
      },
      'Medium': {
        'response': '< 3 seconds for 95% of user requests',
        'throughput': '250 concurrent users with optimal performance',
        'availability': '99.5% uptime during business hours',
        'scalability': 'Support for 3x current user base growth'
      },
      'High': {
        'response': '< 1 second for 90% of requests, < 5 seconds for complex operations',
        'throughput': '500+ concurrent users with optimal performance',
        'availability': '99.9% uptime with 24/7 monitoring',
        'scalability': 'Horizontal scaling to support 5x growth'
      }
    };
    return requirements[complexity] ? requirements[complexity][type] : requirements['Medium'][type];
  }

  generateSecurityRequirements(analysis) {
    return `• **Authentication & Authorization:** Multi-factor authentication and role-based access control
• **Data Protection:** Encryption in transit (TLS 1.3) and at rest (AES-256)
• **Audit & Compliance:** Comprehensive logging and audit trail maintenance
• **Vulnerability Management:** Regular security assessments and penetration testing
• **Access Controls:** Principle of least privilege and regular access reviews
• **Incident Response:** Security incident detection and response procedures`;
  }

  generateUsabilityRequirements(analysis) {
    return `• **Intuitive Design:** User interface following modern UX/UI best practices
• **Accessibility:** WCAG 2.1 AA compliance for users with disabilities
• **Performance:** Fast loading times and responsive interactions
• **Help & Support:** Context-sensitive help and comprehensive user documentation`;
  }

  generateCompatibilityRequirements(analysis) {
    return `• **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
• **Operating Systems:** Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
• **Mobile Devices:** ${analysis.projectType.includes('Mobile') ? 'iOS 12+, Android 8.0+' : 'Responsive design for tablets and smartphones'}
• **Integration Standards:** REST APIs, JSON data format, OAuth 2.0 authentication`;
  }

  generateAssumptions(analysis) {
    return `• Stakeholders will be available for requirements validation and user acceptance testing
• Existing IT infrastructure can support the new system requirements
• Users have basic computer literacy and internet access capabilities
• ${analysis.integrations.length > 0 ? 'External systems will maintain stable API endpoints' : 'Current business processes are documented'}
• Adequate budget and resources will be allocated for the project duration`;
  }

  generateConstraints(analysis) {
    return `• **Budget Limitations:** Project must be completed within approved budget allocation
• **Timeline Constraints:** ${this.estimateTimeline(analysis)} delivery timeline must be maintained
• **Resource Availability:** Limited availability of subject matter experts during peak periods
• **Regulatory Compliance:** Must adhere to industry regulations and data protection laws
• **Technology Standards:** Must comply with organizational technology standards`;
  }

  generateDependencies(analysis) {
    return `• **Infrastructure:** Server provisioning and network configuration completion
• **Third-party Services:** ${analysis.integrations.length > 0 ? 'External API access and service agreements' : 'Standard web service availability'}
• **Data Migration:** Legacy system data extraction and cleansing completion
• **User Training:** Training material development and delivery scheduling
• **Security Approval:** Information security team review and approval`;
  }

  generateWorkflowSteps(content, analysis) {
    return `1. **User Access:** User authenticates and accesses the system dashboard
2. **Navigation:** User navigates to required functional area
3. **Data Input:** User enters or selects required information
4. **Validation:** System validates input against business rules
5. **Processing:** System processes the request and updates relevant data
6. **Confirmation:** User receives confirmation of successful operation
7. **Notification:** ${analysis.functionalAreas.includes('Notifications') ? 'Relevant stakeholders are notified' : 'System logs the transaction'}
8. **Completion:** User can proceed with next task or exit the system`;
  }

  generateExceptionHandling(analysis) {
    return `• **Authentication Failures:** Clear error messages and account lockout protection
• **Data Validation Errors:** Field-specific error messages with correction guidance
• **System Unavailability:** Graceful degradation and user notification procedures
• **Integration Failures:** Fallback procedures and error logging mechanisms`;
  }

  generateDecisionPoints(analysis) {
    return `• **Access Control:** User role verification (Authorized/Unauthorized)
• **Data Validation:** Input validation checks (Valid/Invalid)
• **Business Rules:** Process validation (Approved/Rejected)
• **System Status:** Availability checks (Online/Maintenance)`;
  }

  generateDesignPrinciples(analysis) {
    return `• **User-Centered Design:** Focus on user needs and workflow optimization
• **Consistency:** Uniform design patterns and interaction models
• **Simplicity:** Clean, uncluttered interface with intuitive navigation
• **Accessibility:** Inclusive design supporting users with diverse abilities
• **Responsiveness:** ${analysis.projectType.includes('Mobile') ? 'Mobile-first approach' : 'Responsive design adapting to different screen sizes'}`;
  }

  generateUIRequirements(analysis) {
    return `• **Dashboard:** Personalized dashboard with role-based widgets and quick actions
• **Navigation:** Consistent navigation structure with breadcrumbs and search functionality
• **Forms:** Intuitive forms with real-time validation and progress indicators
• **Data Display:** Sortable tables, filtering options, and pagination for large datasets`;
  }

  generateUXGoals(analysis) {
    return `• **Efficiency:** Minimize clicks and steps required for common tasks
• **Learnability:** New users can complete basic tasks within 15 minutes
• **Error Prevention:** Proactive validation and confirmation for critical actions
• **Satisfaction:** Achieve >4.0/5.0 user satisfaction rating in post-implementation surveys`;
  }

  generateInternalIntegrations(analysis) {
    return `• **User Directory:** Active Directory/LDAP integration for user authentication
• **Database Systems:** Integration with existing organizational databases
• **Monitoring Tools:** System health monitoring and alerting integration
• **Backup Systems:** Automated backup and disaster recovery integration`;
  }

  getIntegrationDetails(integration) {
    const details = {
      'External APIs': 'RESTful API integration with proper authentication and error handling',
      'Database Systems': 'Secure database connectivity with connection pooling',
      'Email Services': 'SMTP integration for automated notifications',
      'Payment Gateways': 'PCI-compliant payment processing with transaction security',
      'SMS Services': 'SMS gateway integration for mobile notifications',
      'Cloud Services': 'Cloud platform integration for scalability and reliability'
    };
    return details[integration] || 'Standard integration following organizational protocols';
  }

  generateDataExchangeRequirements(analysis) {
    return `• **Data Formats:** JSON for API communications, CSV/Excel for bulk operations
• **Security:** Encrypted data transmission using TLS 1.3 protocol
• **Validation:** Data integrity checks and validation at all integration points
• **Error Handling:** Comprehensive error logging and retry mechanisms`;
  }

  generateTestingStrategy(analysis) {
    return `• **Unit Testing:** Individual component testing with >80% code coverage
• **Integration Testing:** End-to-end testing of system integrations
• **Performance Testing:** Load testing to validate performance requirements
• **Security Testing:** Vulnerability assessments and penetration testing
• **User Acceptance Testing:** Business user validation of functionality`;
  }

  generateAcceptanceCriteria(analysis) {
    return `• **Functional Completeness:** All specified requirements implemented and working
• **Performance Standards:** System meets all defined performance benchmarks
• **Security Compliance:** Passes all security assessments and vulnerability scans
• **User Satisfaction:** >90% user acceptance rate in UAT phase`;
  }

  generateQualityGates(analysis) {
    return `• **Code Quality:** Peer review approval and automated code quality checks
• **Testing Coverage:** Minimum 80% test coverage for critical functionality
• **Performance Benchmarks:** Response times meeting specified requirements
• **Security Approval:** Information security team sign-off on security measures`;
  }

  generatePhase2Enhancements(analysis) {
    return `• **Advanced Analytics:** Machine learning capabilities for predictive insights
• **Mobile Applications:** ${analysis.projectType.includes('Mobile') ? 'Enhanced mobile features' : 'Native mobile applications'}
• **Workflow Automation:** Advanced business process automation
• **Integration Expansion:** Additional third-party system integrations`;
  }

  generateLongTermVision(analysis) {
    return `• **AI Integration:** Artificial intelligence for automated decision-making
• **IoT Connectivity:** Internet of Things integration for real-time data
• **Multi-tenant Architecture:** Support for multiple organizations
• **Global Scalability:** International deployment with localization support`;
  }

  generateTechnologyEvolution(analysis) {
    return `• **Cloud-Native Architecture:** Migration to microservices and containerized deployment
• **API-First Design:** Comprehensive API ecosystem for integrations
• **Real-time Processing:** Event-driven architecture for real-time data processing
• **DevOps Integration:** Automated CI/CD pipelines and infrastructure as code`;
  }

  generateGlossary(analysis) {
    return `• **API:** Application Programming Interface - enables communication between software systems
• **BRD:** Business Requirements Document - formal documentation of business needs
• **CRUD:** Create, Read, Update, Delete - basic database operations
• **SLA:** Service Level Agreement - defines expected system performance standards
• **SSO:** Single Sign-On - authentication method allowing access to multiple systems
• **UI/UX:** User Interface/User Experience - design and usability aspects of software
• **WCAG:** Web Content Accessibility Guidelines - standards for accessible web design`;
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