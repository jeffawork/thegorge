# Environment Configuration

Essential environment variables for The Gorge RPC Monitor.

## Required Variables

### Application
- `NODE_ENV` - Environment mode (development/production) - Default: development
- `PORT` - Server port - Default: 3000
- `LOG_LEVEL` - Logging level (error/warn/info/debug) - Default: info

### Database
- `DB_HOST` - Database host - Default: localhost
- `DB_PORT` - Database port - Default: 5432
- `DB_NAME` - Database name - Default: the_gorge
- `DB_USER` - Database username - Default: postgres
- `DB_PASSWORD` - Database password - Default: password
- `DB_SSL` - Enable SSL connection - Default: false

### Mock Database (Development)
- `MOCK_DATABASE` - Enable mock database mode - Default: true (in development)
- When `MOCK_DATABASE=true`, uses mock data instead of PostgreSQL

### Security
- `JWT_SECRET` - Secret key for JWT tokens - **REQUIRED** (change in production)
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens - **REQUIRED** (change in production)
- `JWT_EXPIRES_IN` - JWT token expiration - Default: 1h
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration - Default: 7d

### CORS & Rate Limiting
- `CORS_ORIGIN` - CORS origin - Default: http://localhost:5173
- `RATE_LIMIT_WINDOW_MS` - Rate limit window - Default: 900000 (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window - Default: 100

## Example .env Files

### Development (Mock Database)
```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
MOCK_DATABASE=true
JWT_SECRET=dev-jwt-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
CORS_ORIGIN=http://localhost:5173
DEBUG=true
```

### Production (PostgreSQL)
```bash
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DB_HOST=postgres
DB_PORT=5432
DB_NAME=the_gorge
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=true
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
CORS_ORIGIN=https://yourdomain.com
DEBUG=false
TRUST_PROXY=true
```

## Optional Variables

### Email Configuration
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address

### External Services
- `INFURA_API_KEY` - Infura API key
- `ALCHEMY_API_KEY` - Alchemy API key
- `ETHERSCAN_API_KEY` - Etherscan API key

### Redis (Caching)
- `REDIS_HOST` - Redis host - Default: localhost
- `REDIS_PORT` - Redis port - Default: 6379
- `REDIS_PASSWORD` - Redis password
- `REDIS_DB` - Redis database number - Default: 0

## Docker Environment Variables

When using Docker Compose, set variables in `.env`:

```bash
# Database
DB_NAME=the_gorge
DB_USER=postgres
DB_PASSWORD=secure_password_here

# Security
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# External Services
INFURA_API_KEY=your-infura-key
ALCHEMY_API_KEY=your-alchemy-key
```

## Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Database | Mock (no setup) | PostgreSQL required |
| Authentication | Demo tokens | Real JWT tokens |
| Logging | Verbose | Optimized |
| SSL | Not required | Recommended |
| Hot Reload | Enabled | Disabled |

## Security Notes

1. **Never commit .env files** to version control
2. **Change JWT secrets** in production to strong, random strings
3. **Use strong database passwords** in production
4. **Enable SSL** for database connections in production
5. **Use environment-specific values** for different deployments
6. **Rotate secrets regularly** in production environments

## Docker Compose Profiles

```bash
# Development with mock database
docker-compose --profile dev up

# Development with PostgreSQL
docker-compose --profile dev-db up

# Production
docker-compose up

# Run migrations
docker-compose --profile migrate up

# Run seeds
docker-compose --profile seed up
```
