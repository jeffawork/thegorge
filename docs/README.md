# Documentation Index

Welcome to The Gorge RPC Monitor documentation. Find everything you need to get started and understand the system.

## 📚 Quick Reference

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[Environment Setup](ENVIRONMENT_CONFIG.md)** | Environment variables and configuration | Setting up development or production |
| **[Testing Guide](TESTING_GUIDE.md)** | Test suite documentation and examples | Writing or running tests |
| **[API Documentation](API_DOCUMENTATION.md)** | Complete API reference and examples | Integrating with the API |
| **[Docker Setup](DOCKER.md)** | Container deployment guide | Deploying with Docker |
| **[Registration Design](REGISTRATION_DESIGN.md)** | User registration flow design | Understanding user flows |
| **[Services Analysis](SERVICES_ANALYSIS.md)** | Service architecture overview | Understanding system architecture |

## 🚀 Getting Started

### Development Setup
```bash
# Quick setup
npm run setup

# Manual setup
npm install && npm run dev
```

### Production Setup
```bash
# Docker (recommended)
docker-compose up -d

# Manual
npm run setup:prod && npm start
```

## 📖 Documentation Overview

### **[Environment Configuration](ENVIRONMENT_CONFIG.md)**
Essential environment variables for different deployment scenarios:
- Development vs Production settings
- Database configuration
- Security settings
- Docker environment variables

### **[Testing Guide](TESTING_GUIDE.md)**
Comprehensive testing documentation:
- Unit and integration tests
- Test structure and organization
- Mocking strategies
- Coverage reports
- CI/CD integration

### **[API Documentation](API_DOCUMENTATION.md)**
Complete API reference:
- Authentication endpoints
- RPC management
- User management
- Error handling
- Request/response examples

### **[Docker Setup](DOCKER.md)**
Container deployment guide:
- Development profiles
- Production deployment
- Environment configuration
- Troubleshooting
- Health checks

### **[Registration Design](REGISTRATION_DESIGN.md)**
User registration flow documentation:
- Individual registration
- Organization registration
- User roles and permissions
- Validation rules

### **[Services Analysis](SERVICES_ANALYSIS.md)**
Service architecture overview:
- Service responsibilities
- Data flow
- Dependencies
- Integration points

## 🛠️ Development Workflow

### 1. **Setup Environment**
```bash
npm run setup:dev
```

### 2. **Run Tests**
```bash
npm test
```

### 3. **Start Development**
```bash
npm run dev
```

### 4. **API Testing**
```bash
curl http://localhost:3000/api/health
```

## 🐳 Docker Workflow

### Development
```bash
# Mock database (no PostgreSQL)
docker-compose --profile dev up

# PostgreSQL database
docker-compose --profile dev-db up
```

### Production
```bash
docker-compose up -d
```

## 📊 Current Status

- **✅ Application**: Running on port 3000
- **✅ Mock Database**: Working in development mode
- **✅ Core APIs**: Health, logout, refresh token functional
- **✅ Authentication**: Demo token system working
- **✅ Test Coverage**: 90.1% pass rate (64/71 tests)
- **✅ Documentation**: Complete and organized
- **🔄 In Progress**: Database integration for full functionality

## 🧪 Testing the API

### Working Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Logout (demo token)
curl -X POST -H "Authorization: Bearer demo-token" http://localhost:3000/api/auth/logout

# Refresh token
curl -X POST -H "Content-Type: application/json" \
  -d '{"refreshToken": "demo-refreshed-token"}' \
  http://localhost:3000/api/auth/refresh
```

**Demo Tokens:** `demo-token` (access) | `demo-refreshed-token` (refresh)

## 🔗 Quick Links

- **Application**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health
- **API Base**: http://localhost:3000/api
- **Coverage Report**: `coverage/lcov-report/index.html`

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.