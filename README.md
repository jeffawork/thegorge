# EVM RPC Monitor

A comprehensive monitoring tool for EVM-compatible RPC endpoints with real-time dashboard and alerting capabilities.

## Features

- **Real-time Monitoring**: Continuous monitoring of RPC endpoint health and performance
- **Web3 Integration**: Built with Web3.js for Ethereum and EVM-compatible blockchain interaction
- **Live Dashboard**: Real-time updates via WebSocket connections
- **Alert System**: Configurable alerts for various monitoring thresholds
- **Comprehensive Logging**: Winston-based logging with file and console output
- **TypeScript**: Full TypeScript support with proper type definitions
- **Testing**: Jest-based test suite for services and utilities

## Project Structure

```
evm-rpc-monitor/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── logs/
│   └── .gitkeep
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── types/
│   │   └── index.ts
│   ├── config/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── services/
│   │   ├── web3Service.ts
│   │   ├── monitoringService.ts
│   │   └── alertService.ts
│   └── routes/
│       └── api.ts
└── tests/
    ├── services/
    │   └── web3Service.test.ts
    └── utils/
        └── helpers.test.ts
```

## Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd evm-rpc-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build the project:
```bash
npm run build
```

## Configuration

Copy `.env.example` to `.env` and configure the following variables:

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `WEB3_PROVIDER_URL`: Your RPC endpoint URL
- `WEB3_CHAIN_ID`: Chain ID for the network
- `MONITORING_INTERVAL`: Monitoring check interval in milliseconds
- `ALERT_THRESHOLD`: Threshold for triggering alerts
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Testing
```bash
npm test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/status` - Current monitoring status
- `GET /api/metrics` - Performance metrics
- `GET /api/alerts` - Active alerts

## WebSocket Events

- `status_update` - Real-time status updates
- `metrics_update` - Performance metrics updates
- `alert` - Alert notifications

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue on the GitHub repository.