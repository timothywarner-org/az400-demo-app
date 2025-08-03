# Globomantics Robot Fleet - AZ-400 Demo Application

A modern Node.js web application designed for demonstrating Azure DevOps (AZ-400) concepts including CI/CD pipelines, deployment slots, Infrastructure as Code with Bicep, and cloud-native development practices.

## 🤖 About This Application

This is a comprehensive robot fleet management system built specifically for educational purposes in Pluralsight and O'Reilly Live Learning courses. The application demonstrates:

- Modern Node.js development with Express
- SQLite database integration with fallback file storage
- Azure App Service deployment with staging slots
- Infrastructure as Code using Bicep templates
- CI/CD pipelines with Azure DevOps and GitHub Actions
- Comprehensive testing and quality gates
- Security best practices with Snyk integration
- Dependency management with Dependabot

## 🏗️ Architecture

- **Backend**: Node.js 18 LTS with Express framework
- **Database**: SQLite with automatic file-based fallback
- **Frontend**: Server-side rendered EJS templates with Bootstrap 5
- **Infrastructure**: Azure App Service, Key Vault, Application Insights
- **Hosting**: Azure App Service with Linux containers
- **CI/CD**: Azure DevOps Pipelines and GitHub Actions
- **Security**: Snyk scanning, Dependabot alerts

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- npm package manager
- (Optional) SQLite for database features

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd az400-demo-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   ```bash
   # The application works with default settings
   # Create .env only if you need custom configuration
   cp .env.example .env
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reloading
- `npm test` - Run the test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint code linting
- `npm run typecheck` - Run TypeScript type checking
- `npm run build` - Run linting and tests (CI build script)

## 🗄️ Data Layer

The application supports multiple data storage options with automatic fallback:

### Storage Options

1. **SQLite Database** (Primary)
   - Lightweight embedded database
   - Automatic database file creation
   - Environment-specific database files
   - No server setup required

2. **File-Based Storage** (Fallback)
   - JSON file storage when SQLite unavailable
   - Automatically creates sample data
   - Perfect for quick demos and testing

### Environment-Specific Databases

| Environment | Database File | Purpose |
|-------------|---------------|---------|
| `development` | `robotfleet_dev.db` | Local development |
| `staging` | `robotfleet_staging.db` | Pre-production testing |
| `production` | `robotfleet.db` | Live production data |
| `test` | `robotfleet_test.db` | Automated testing |

### Database Schema

#### Robots Table
```sql
CREATE TABLE robots (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  model VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Active', 'Maintenance', 'Offline')),
  location VARCHAR(100),
  battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
  last_maintenance DATE,
  assigned_task VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Maintenance Logs Table
```sql
CREATE TABLE maintenance_logs (
  id SERIAL PRIMARY KEY,
  robot_id INTEGER REFERENCES robots(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL,
  description TEXT,
  performed_by VARCHAR(100) NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Migrations

The application includes a robust migration system:

- **Automatic Migration**: Runs on startup
- **Version Tracking**: `schema_migrations` table tracks applied migrations
- **Environment-Specific Seeds**: Different sample data per environment

#### Migration Files
- `src/db/migrations/001_initial_schema.sql` - Base schema
- `src/db/seeds/development_data.sql` - Development sample data
- `src/db/seeds/staging_data.sql` - Staging test data  
- `src/db/seeds/production_data.sql` - Minimal production data

### Data Resilience

The application gracefully handles different scenarios:

1. **SQLite Available**: Full database functionality with automatic setup
2. **SQLite Unavailable**: Automatic fallback to file storage
3. **No Data**: Creates sample data automatically
4. **Migration Failures**: Logs errors but continues startup

## 🔌 API Endpoints

### Robot Management
- `GET /api/robots` - List all robots
- `GET /api/robots/:id` - Get robot details
- `POST /api/robots` - Create new robot
- `PUT /api/robots/:id` - Update robot
- `DELETE /api/robots/:id` - Delete robot
- `GET /api/robots/status/:status` - Get robots by status

### Maintenance
- `POST /api/robots/:id/maintenance` - Log maintenance activity

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health information
- `GET /api/health/ready` - Readiness probe (for Kubernetes)
- `GET /api/health/live` - Liveness probe (for Kubernetes)

## 🚀 Deployment Options

This project includes multiple CI/CD pipeline configurations to demonstrate different deployment strategies:

### Pipeline Variations

| Pipeline | Purpose | Use Case |
|----------|---------|----------|
| **Azure DevOps - Build Only** | CI without CD | Classic Release Pipelines |
| **Azure DevOps - Multi-Stage** | Modern YAML pipelines | Environments & approvals |
| **GitHub Actions - Build Only** | CI artifacts | Manual deployments |
| **GitHub Actions - Multi-Stage** | GitOps with environments | Modern GitHub deployment |

📖 **See [PIPELINES.md](./PIPELINES.md) for detailed documentation and setup instructions.**

### Quick Deployment

#### Using Bicep Templates

1. **Deploy infrastructure** (from repository root):
   ```bash
   # Deploy to development
   cd infrastructure/bicep
   ./deploy.sh -e dev -g rg-globomantics-dev -l eastus -p "YourSecurePassword123!"
   
   # Or using PowerShell
   .\deploy.ps1 -Environment dev -ResourceGroupName rg-globomantics-dev -Location eastus -SqlAdminPassword (ConvertTo-SecureString "YourSecurePassword123!" -AsPlainText -Force)
   ```

2. **Infrastructure includes**:
   - Azure App Service (Linux)
   - App Service Plan
   - SQL Database (optional)
   - Application Insights
   - Key Vault for secrets
   - Staging slots for blue-green deployment

#### Using Azure DevOps

**Option 1: Build-Only + Classic Release**
1. Create pipeline using `azure-pipelines-build-only.yml`
2. Set up Classic Release Pipeline
3. Configure environments and approvals

**Option 2: Multi-Stage YAML**
1. Create pipeline using `azure-pipelines-multistage.yml`
2. Configure environments (`development`, `staging`, `production`)
3. Set up approval requirements

#### Using GitHub Actions

**Option 1: Build-Only Workflow**
1. Use `.github/workflows/build-only.yml`
2. Download artifacts for manual deployment
3. Deploy using external tools

**Option 2: Multi-Stage with Environments**
1. Configure GitHub environments with protection rules
2. Set up Azure publish profiles as secrets
3. Use `.github/workflows/multistage-environments.yml`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/staging/production) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_CONNECTION_STRING` | Full database connection string (from Key Vault in Azure) | - |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights connection string | - |
| `APP_NAME` | Application display name | Globomantics Robot Fleet |

### Environment-Specific Configuration

The application includes pre-configured environment files:

- **`.env.development`** - Local development settings
- **`.env.staging`** - Staging environment configuration  
- **`.env.production`** - Production environment settings
- **`.env.example`** - Template for custom configuration

### Database Connection Priority

1. **Environment Variables**: `DATABASE_CONNECTION_STRING` if provided
2. **Auto-created SQLite**: Database file based on `NODE_ENV`
3. **Fallback Storage**: File-based JSON storage if SQLite unavailable

### Local Development Setup

```bash
# Install dependencies
npm install

# Start development server (SQLite database created automatically)
npm run dev

# Or start with file storage only
USE_FILE_STORAGE=true npm run dev
```

### Azure App Service Settings

The application is configured for Azure App Service with:
- Node.js 18 LTS runtime
- Linux container
- Staging slot for blue-green deployments
- Health check endpoints
- Application Insights integration ready

## 🧪 Testing

The application includes comprehensive testing:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Health Checks**: Application monitoring
- **Smoke Tests**: Post-deployment validation

Run tests with:
```bash
npm test
```

Generate coverage report:
```bash
npm test -- --coverage
```

## 🔐 Security Features

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation with Joi
- SQL injection prevention
- XSS protection
- Environment variable protection

## 📊 Monitoring and Logging

- Winston logging framework
- Structured JSON logging
- Health check endpoints
- Application metrics ready
- Azure Application Insights compatible

## 🎓 Educational Use

This application is designed for teaching:

- Azure DevOps pipeline creation
- Deployment slot strategies
- Infrastructure as Code (ARM templates)
- CI/CD best practices
- Cloud-native application patterns
- Testing strategies
- Security in DevOps

## 📄 License

MIT License - See LICENSE file for details

## 👨‍🏫 Author

**Tim Warner**
- Pluralsight Author
- O'Reilly Live Learning Instructor
- Microsoft Azure MVP
- Course: GitHub Advanced Security & AZ-400 Certification Prep

## 🤝 Contributing

This is an educational demo application. For suggestions or improvements, please reach out during live learning sessions.

---

**Note**: This application contains intentionally simplified configurations for educational purposes. For production use, additional security hardening and monitoring would be required.