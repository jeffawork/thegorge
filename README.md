# The Gorge RPC Monitor

Real-time monitoring tool for EVM-compatible RPC endpoints.

## Quick Start

```bash
# Setup and start
npm run setup && npm run dev

# Docker setup
npm run setup:docker
```

**Application:** http://localhost:3000 | **API Health:** http://localhost:3000/api/health

## Features

- **Real-time Monitoring** - RPC endpoint health tracking
- **Web3 Integration** - EVM-compatible blockchain support
- **Mock Database** - Development without PostgreSQL
- **Docker Support** - Complete containerization
- **TypeScript** - Full type safety

## Commands

```bash
# Setup
npm run setup          # Basic setup
npm run setup:docker   # Docker setup
npm run setup:clean    # Clean install

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm test               # Run tests

# Docker
npm run docker:up      # Start with Docker
npm run docker:down    # Stop Docker
npm run docker:logs    # View logs
```

## API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Logout (demo token)
curl -X POST -H "Authorization: Bearer demo-token" http://localhost:3000/api/auth/logout
```

**Demo Tokens:** `demo-token` (access) | `demo-refreshed-token` (refresh)

## Documentation

- [Environment Setup](docs/ENVIRONMENT_CONFIG.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [API Reference](docs/API_DOCUMENTATION.md)
- [Docker Setup](docs/DOCKER.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.
