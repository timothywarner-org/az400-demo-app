# CI/CD Pipelines Guide
## Globomantics Robot Fleet - AZ-400 Demo

This document explains the different CI/CD pipeline configurations available in this project, designed to demonstrate various Azure DevOps and GitHub Actions concepts for AZ-400 certification preparation and GitHub Advanced Security course.

## 📋 Pipeline Overview

| Pipeline | File | Purpose | Use Case |
|----------|------|---------|----------|
| **Azure DevOps - Build Only** | `azure-pipelines-build-only.yml` | CI without CD | Classic Release Pipelines demo |
| **Azure DevOps - Multi-Stage** | `azure-pipelines-multistage.yml` | Modern YAML pipelines | Environments, approvals, gates |
| **GitHub Actions - Build Only** | `.github/workflows/build-only.yml` | CI artifacts | Manual deployments |
| **GitHub Actions - Multi-Stage** | `.github/workflows/multistage-environments.yml` | GitOps with environments | Modern GitHub deployment |

---

## 🔧 Azure DevOps Pipelines

### 1. Build-Only Pipeline (`azure-pipelines-build-only.yml`)

**Purpose**: Demonstrates traditional CI/CD separation where build and release are handled separately.

#### Features:
- ✅ Comprehensive testing with SQLite database
- ✅ Code quality checks (ESLint, TypeScript)
- ✅ Test results and coverage reporting
- ✅ Security scanning (SonarCloud integration)
- ✅ Production-ready artifact creation
- ✅ Infrastructure templates as artifacts

#### When to Use:
- **Classic Release Pipelines**: Use this for demonstrating Azure DevOps Release Management
- **Manual Deployments**: When you want to control deployment timing
- **Approval Workflows**: When using classic approval processes
- **Multi-Team Scenarios**: Separate build and deployment responsibilities

#### Demo Scenarios:
1. **CI/CD Separation**: Show how build creates artifacts for release pipelines
2. **Quality Gates**: Demonstrate test failures blocking artifact creation
3. **Artifact Management**: Show how artifacts flow between build and release
4. **Security Integration**: SonarCloud integration for code quality

#### Setup Instructions:
```yaml
# In Azure DevOps:
1. Create new pipeline from azure-pipelines-build-only.yml
2. Configure service connections for SonarCloud (optional)
3. Set up Classic Release Pipeline to consume artifacts
4. Configure environments in Release Pipeline (Dev → Staging → Prod)
```

---

### 2. Multi-Stage Pipeline (`azure-pipelines-multistage.yml`)

**Purpose**: Showcases modern YAML-based pipelines with environments, approvals, and gates.

#### Features:
- 🏗️ **Infrastructure Stage**: Bicep template deployment
- 🚀 **Environment Progression**: Dev → Staging → Production
- ✅ **Built-in Approvals**: Environment protection rules
- 🧪 **Automated Testing**: Smoke tests and validation
- 📊 **Post-deployment Monitoring**: Health checks and notifications
- 🎭 **Blue-Green Deployment**: Staging slot → Production slot

#### Environment Flow:
```
Build → Infrastructure → Development → Staging → Production → Validation
  ↓         ↓              ↓            ↓           ↓           ↓
Tests   Bicep Deploy  Auto Deploy   Manual      Manual    Monitor
              ↓                      Approval    Approval      ↓
         Create Azure                   ↓           ↓      Notify Teams
         Resources               Smoke Tests  Full Tests
```

#### When to Use:
- **Modern DevOps**: Demonstrate YAML pipeline capabilities
- **Environment Management**: Show environment protection and approvals
- **Infrastructure as Code**: Bicep template deployment integration
- **Compliance**: Approval workflows for production deployments

#### Demo Scenarios:
1. **Environment Progression**: Show automatic dev, manual staging/prod
2. **Approval Gates**: Demonstrate manual approvals for production
3. **Infrastructure Deployment**: Bicep templates for consistent environments
4. **Deployment Strategies**: Blue-green deployment with slot swapping

---

## 🐙 GitHub Actions Workflows

### 3. Build-Only Workflow (`.github/workflows/build-only.yml`)

**Purpose**: Creates deployment artifacts without automatic deployment, ideal for manual release processes.

#### Features:
- 🔨 **Comprehensive Build**: Full CI pipeline with testing
- 📦 **Multiple Artifact Formats**: ZIP and TAR.GZ packages
- 🔍 **Code Quality**: ESLint with SARIF reporting
- 🔒 **Security Scanning**: npm audit and Snyk integration
- 📊 **Detailed Reporting**: Build summaries and test results
- ⚡ **Manual Triggers**: Workflow dispatch with options

#### Workflow Dispatch Options:
```yaml
run_tests: true/false        # Skip tests for quick builds
create_artifact: true/false  # Create deployment packages
```

#### When to Use:
- **Manual Deployments**: Create artifacts for later deployment
- **External Tools**: Integration with other deployment systems
- **Compliance Requirements**: Manual review before deployment
- **Development Workflow**: Quick feedback without deployment

#### Demo Scenarios:
1. **Artifact Creation**: Show how to create deployment packages
2. **Quality Checks**: Demonstrate test failures and security scans
3. **Manual Process**: Use artifacts with external deployment tools
4. **Workflow Dispatch**: Show manual trigger capabilities

---

### 4. Multi-Stage with Environments (`.github/workflows/multistage-environments.yml`)

**Purpose**: Demonstrates modern GitOps practices with GitHub environments, protection rules, and automated deployment strategies.

#### Features:
- 🎯 **Smart Targeting**: Branch-based deployment decisions
- 🛡️ **Environment Protection**: Approval requirements and delays
- 🔄 **Progressive Deployment**: Dev → Staging → Production
- 🧪 **Comprehensive Testing**: Smoke tests, validation, monitoring
- 📊 **Rich Reporting**: Deployment summaries and status updates
- 🚨 **Rollback Capability**: Backup and recovery procedures

#### Environment Configuration:
```
Development Environment:
- Branch: develop, main
- Protection: None (auto-deploy)
- URL: https://globomantics-robot-fleet-dev-app.azurewebsites.net

Staging Environment:
- Branch: main only
- Protection: 1 reviewer required
- URL: https://globomantics-robot-fleet-staging-app.azurewebsites.net

Production Environment:
- Branch: main only
- Protection: 2 reviewers + 30min delay
- URL: https://globomantics-robot-fleet-prod-app.azurewebsites.net
```

#### When to Use:
- **GitOps Demonstrations**: Show environment-based workflows
- **GitHub Enterprise**: Demonstrate advanced GitHub features
- **Modern CI/CD**: Progressive deployment strategies
- **Team Collaboration**: Multi-reviewer approval processes

#### Demo Scenarios:
1. **Environment Progression**: Show branch-based deployment logic
2. **Protection Rules**: Demonstrate approval requirements
3. **Monitoring**: Post-deployment health checks and rollback
4. **Collaboration**: Multi-reviewer approval workflows

---

## 🎓 Educational Use Cases

### AZ-400 Exam Topics Covered

#### Build and Release Management
- **Build Pipelines**: All pipelines demonstrate comprehensive build processes
- **Release Strategies**: Classic vs. modern deployment approaches
- **Artifact Management**: Creating, storing, and consuming deployment packages

#### Environment Management
- **Environment Configuration**: Multiple environments with different configurations
- **Approval Workflows**: Manual and automated approval processes
- **Deployment Slots**: Blue-green deployment strategies

#### Infrastructure as Code
- **Bicep Templates**: Complete infrastructure deployment
- **Environment Consistency**: Same infrastructure across environments
- **Version Control**: Infrastructure templates in source control

#### Testing and Quality
- **Automated Testing**: Unit tests, integration tests, smoke tests
- **Code Quality**: ESLint, TypeScript checking, SonarCloud
- **Security Scanning**: npm audit, Snyk, vulnerability management

### Demonstration Scenarios

#### 1. **Classic vs. Modern CI/CD**
Compare `azure-pipelines-build-only.yml` with `azure-pipelines-multistage.yml`:
- Show artifact-based releases vs. direct deployment
- Demonstrate classic UI vs. YAML configuration
- Compare approval mechanisms

#### 2. **Platform Comparison**
Use Azure DevOps and GitHub Actions side by side:
- Show similar capabilities across platforms
- Demonstrate different approaches to environment management
- Compare integration capabilities

#### 3. **Progressive Deployment**
Use multi-stage pipelines to show:
- Environment progression strategies
- Approval gates and manual interventions
- Rollback and recovery procedures

#### 4. **Security Integration**
Demonstrate security throughout the pipeline:
- Code scanning and vulnerability detection
- Approval requirements for production
- Secure credential management

---

## 🚀 Quick Start Instructions

### Azure DevOps Setup

1. **Import Repository**:
   ```bash
   git clone <repository-url>
   cd az400-demo-app
   ```

2. **Create Service Connections**:
   - Azure Resource Manager connection
   - SonarCloud connection (optional)
   - Teams webhook (optional)

3. **Create Environments** (for multi-stage):
   - `infrastructure`, `development`, `staging`, `production`
   - Configure approval requirements

4. **Create Pipeline**:
   - Choose desired YAML file
   - Configure variable groups for secrets

### GitHub Actions Setup

1. **Configure Secrets**:
   ```
   AZURE_WEBAPP_PUBLISH_PROFILE
   AZURE_WEBAPP_PUBLISH_PROFILE_DEV
   AZURE_WEBAPP_PUBLISH_PROFILE_STAGING
   SNYK_TOKEN (optional)
   ```

2. **Create Environments**:
   - `development`, `staging`, `production`
   - Configure protection rules and reviewers

3. **Enable Workflows**:
   - Workflows activate automatically on push
   - Use workflow dispatch for manual triggers

---

## 🛠️ Customization Guide

### Modifying for Your Environment

#### Update Application Names:
```yaml
# Change these variables in all pipeline files
webAppName: 'your-app-name'
resourceGroupName: 'your-resource-group'
```

#### Adjust Branch Strategies:
```yaml
# Modify trigger branches
trigger:
  branches:
    include:
      - main
      - develop
      - your-branch-pattern
```

#### Configure Environments:
```yaml
# Update environment URLs and configurations
environment: 
  name: your-environment-name
  url: https://your-app-url.azurewebsites.net
```

### Adding New Environments

1. **Azure DevOps**:
   - Add new deployment job in multi-stage pipeline
   - Create environment in Azure DevOps
   - Configure approval requirements

2. **GitHub Actions**:
   - Add new job with environment reference
   - Create environment in GitHub repository settings
   - Set up protection rules

---

## 📚 Additional Resources

- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AZ-400 Exam Guide](https://docs.microsoft.com/en-us/certifications/azure-devops/)
- [Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [ARM Template Reference](https://docs.microsoft.com/en-us/azure/templates/)

---

## 🤝 Support

For questions about these pipelines during learning sessions:
- **Instructor**: Tim Warner
- **Courses**: GitHub Advanced Security (Pluralsight) & AZ-400 Certification Prep (O'Reilly)
- **Platforms**: Pluralsight & O'Reilly Live Learning

This documentation is designed to support hands-on learning and real-world application of DevOps practices covered in the AZ-400 certification exam.