# Testing Guide

Comprehensive testing guide for The Gorge RPC Monitor.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
```

## Test Structure

```
tests/
├── services/           # Service layer tests
├── controllers/        # Controller tests
├── middleware/         # Middleware tests
├── utils/             # Utility function tests
└── integration/       # API integration tests
```

## Test Types

### Unit Tests
- **Services**: Business logic testing
- **Controllers**: Request/response handling
- **Middleware**: Authentication and validation
- **Utils**: Helper functions

### Integration Tests
- **API Endpoints**: Full request/response cycle
- **Database**: Repository and model interactions
- **External Services**: Web3 and blockchain interactions

## Running Tests

### All Tests
```bash
npm test                    # Run all tests once
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run with coverage report
npm run test:ci            # CI mode (no watch, with coverage)
```

### Specific Test Suites
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Specific file
npm test tests/services/authService.test.ts

# Pattern matching
npm test -- --testNamePattern="login"
```

### Test Options
```bash
# Verbose output
npm test -- --verbose

# Run specific test file
npm test tests/services/web3Service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should.*login"

# Update snapshots
npm test -- --updateSnapshot
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Test Setup (`tests/setup.ts`)
- Environment variable configuration
- Logger mocking
- Database mocking
- Global test utilities

## Writing Tests

### Service Tests
```typescript
describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  it('should login with valid credentials', async () => {
    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});
```

### Controller Tests
```typescript
describe('AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController(mockAuthService);
    mockRequest = { body: {}, user: { userId: 'test-user' } };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  it('should handle login request', async () => {
    await authController.login(mockRequest as Request, mockResponse as Response);
    
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalled();
  });
});
```

### Integration Tests
```typescript
describe('API Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = createTestApp();
  });

  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });
});
```

## Mocking

### Database Mocking
```typescript
// Mock database connection
jest.mock('../../src/database', () => ({
  database: {
    query: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  }
}));
```

### Service Mocking
```typescript
// Mock external service
const mockWeb3Service = {
  testConnection: jest.fn().mockResolvedValue(true),
  getBlockNumber: jest.fn().mockResolvedValue(12345)
};
```

### Logger Mocking
```typescript
// Mock logger
jest.mock('../../src/utils/logger', () => ({
  apiLogger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));
```

## Test Data

### Mock Users
```typescript
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Mock RPC Configs
```typescript
const mockRpcConfig = new RpcConfig({
  id: 'rpc-1',
  userId: 'user-1',
  name: 'Test RPC',
  url: 'https://test.example.com',
  network: EVM_NETWORKS.ETHEREUM,
  chainId: 1,
  isHealthy: true
});
```

## Coverage Reports

### Coverage Commands
```bash
npm run test:coverage    # Generate coverage report
npm run test:ci         # CI mode with coverage
```

### Coverage Targets
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Coverage Reports
- **Terminal**: Text summary
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`

## Debugging Tests

### Debug Mode
```bash
# Run specific test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand tests/services/authService.test.ts

# Debug with VS Code
# Set breakpoints and run "Debug Jest Tests" configuration
```

### Verbose Output
```bash
npm test -- --verbose
npm test -- --detectOpenHandles
npm test -- --forceExit
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:unit": "jest --testPathPattern='tests/(services|utils|controllers|middleware)'",
    "test:integration": "jest --testPathPattern='tests/integration'"
  }
}
```

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Mocking Strategy
- Mock external dependencies
- Use realistic test data
- Verify mock interactions
- Clean up mocks between tests

### Assertions
- Use specific matchers
- Test both success and error cases
- Verify side effects
- Check error messages and codes

## Troubleshooting

### Common Issues
- **Port conflicts**: Use different ports for test database
- **Async operations**: Use `async/await` or return promises
- **Mock cleanup**: Reset mocks in `afterEach`
- **Environment variables**: Set test-specific values

### Debug Commands
```bash
# Check test configuration
npm test -- --showConfig

# Run tests with detailed output
npm test -- --verbose --no-cache

# Debug specific test
npm test -- --testNamePattern="should login" --verbose
```