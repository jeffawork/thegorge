# Docker Setup Guide

This guide explains how to run The Gorge backend using Docker Compose with proper database migrations.

## Quick Start

### Development Mode
```bash
# Start development environment with hot reload
npm run docker:dev

# Or manually
docker-compose --profile dev up
```

### Production Mode
```bash
# Build and start production environment
npm run docker:build
npm run docker:up

# Or manually
docker-compose build
docker-compose up -d
```

## Services

### PostgreSQL Database (`postgres`)
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: the_gorge
- **User**: postgres
- **Password**: password (change in production)

### Backend API (`api`)
- **Port**: 3000
- **Environment**: Production optimized
- **Health Check**: Built-in endpoint monitoring

### Development API (`api-dev`)
- **Port**: 3000
- **Environment**: Development with hot reload
- **Volumes**: Source code mounted for live updates

### Migration Service (`migrate`)
- **Purpose**: Run database migrations
- **Profile**: migrate (only runs when explicitly requested)

## Database Migrations

### Development Workflow
1. Create new migration files in `migrations/` directory
2. Use naming convention: `XXX_description.sql` (e.g., `002_add_user_table.sql`)
3. Migrations run automatically in development mode
4. Use `npm run migrate:dev` for file watching

### Production Workflow
1. Run migrations before starting the application:
   ```bash
   npm run docker:migrate
   ```
2. Then start the production services:
   ```bash
   npm run docker:up
   ```

## Environment Variables

### Required Variables
- `DB_HOST`: Database host (default: postgres)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: the_gorge)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: password)

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_REFRESH_SECRET`: Secret key for refresh tokens
- `JWT_EXPIRES_IN`: Access token expiration (default: 1h)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: 7d)

### Optional Variables
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: API port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origins
- `RATE_LIMIT_WINDOW_MS`: Rate limit window (default: 15min)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)

## Available Scripts

### Docker Commands
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start production services
- `npm run docker:down` - Stop all services
- `npm run docker:dev` - Start development environment
- `npm run docker:migrate` - Run database migrations
- `npm run docker:logs` - View service logs
- `npm run docker:clean` - Clean up containers and volumes

### Migration Commands
- `npm run migrate` - Run migrations once
- `npm run migrate:dev` - Run migrations with file watching

## Health Checks

### Database Health Check
- **Command**: `pg_isready -U postgres -d the_gorge`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5

### API Health Check
- **Endpoint**: `http://localhost:3000/api/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

## Data Persistence

### Volumes
- `postgres_data`: PostgreSQL data directory
- `./logs`: Application logs directory

### Backup Strategy
```bash
# Backup database
docker exec the-gorge-postgres pg_dump -U postgres the_gorge > backup.sql

# Restore database
docker exec -i the-gorge-postgres psql -U postgres the_gorge < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Stop conflicting services
   docker stop $(docker ps -q --filter "publish=3000")
   ```

2. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Test database connection
   docker exec the-gorge-postgres psql -U postgres -d the_gorge -c "SELECT version();"
   ```

3. **Migration Failures**
   ```bash
   # Check migration logs
   docker-compose logs migrate
   
   # Manually run migrations
   docker-compose run --rm migrate npm run migrate
   ```

### Logs
```bash
# View all logs
npm run docker:logs

# View specific service logs
docker-compose logs -f api
docker-compose logs -f postgres
```

## Production Deployment

### Security Considerations
1. Change default passwords in production
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Enable SSL/TLS
5. Use secrets management for sensitive data

### Performance Optimization
1. Configure PostgreSQL for production workload
2. Set appropriate connection pool sizes
3. Enable query optimization
4. Monitor resource usage

### Monitoring
1. Set up health check monitoring
2. Configure log aggregation
3. Monitor database performance
4. Set up alerting for critical issues
