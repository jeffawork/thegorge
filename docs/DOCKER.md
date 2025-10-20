# Docker Setup Guide

Quick setup guide for running The Gorge RPC Monitor with Docker.

## Quick Start

### Development (Mock Database)
```bash
# No PostgreSQL required
docker-compose --profile dev up
```

### Development (PostgreSQL)
```bash
# Full database functionality
docker-compose --profile dev-db up
```

### Production
```bash
# Production deployment
docker-compose up -d
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database |
| `api` | 3000 | Production API |
| `api-dev` | 3000 | Development API (mock DB) |
| `api-dev-db` | 3001 | Development API (PostgreSQL) |

## Docker Compose Profiles

### `dev` - Mock Database Development
- Uses mock database (no PostgreSQL setup required)
- Perfect for API development and testing
- Hot reload enabled
- Runs on port 3000

### `dev-db` - PostgreSQL Development
- Uses PostgreSQL database
- Full database functionality
- Hot reload enabled
- Runs on port 3001

### `migrate` - Database Migrations
```bash
docker-compose --profile migrate up
```

### `seed` - Database Seeding
```bash
docker-compose --profile seed up
```

## Environment Variables

### Development (Mock Database)
```bash
NODE_ENV=development
MOCK_DATABASE=true
JWT_SECRET=dev-jwt-secret-change-me
LOG_LEVEL=debug
```

### Production
```bash
NODE_ENV=production
DB_HOST=postgres
DB_PASSWORD=your_secure_password
JWT_SECRET=your-production-secret
LOG_LEVEL=info
```

## Commands

```bash
# Development
npm run docker:dev     # Mock database
npm run docker:dev-db  # PostgreSQL

# Production
npm run docker:up      # Start production
npm run docker:down    # Stop services
npm run docker:logs    # View logs

# Database
npm run docker:migrate # Run migrations
npm run docker:seed    # Seed database
```

## Health Checks

- **Database**: `pg_isready` check every 10s
- **API**: HTTP health check every 30s
- **Endpoint**: `http://localhost:3000/api/health`

## Troubleshooting

### Port Conflicts
```bash
# Check port usage
lsof -i :3000

# Stop conflicting services
docker stop $(docker ps -q --filter "publish=3000")
```

### Database Issues
```bash
# Check database logs
docker-compose logs postgres

# Test connection
docker exec the-gorge-postgres psql -U postgres -d the_gorge -c "SELECT version();"
```

### Mock Database Issues
```bash
# Check mock database status
docker-compose logs api-dev | grep "mock"

# Restart service
docker-compose restart api-dev
```

## Production Deployment

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Configure CORS origins
- [ ] Enable SSL/TLS
- [ ] Use secrets management

### Performance Optimization
- [ ] Configure PostgreSQL for production
- [ ] Set appropriate connection pools
- [ ] Enable query optimization
- [ ] Monitor resource usage

## Examples

### Complete Development Setup
```bash
# Start PostgreSQL
docker-compose up postgres -d

# Run migrations
docker-compose --profile migrate up

# Seed database
docker-compose --profile seed up

# Start development API
docker-compose --profile dev-db up
```

### Clean Environment
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Clean up images
docker system prune -a
```
