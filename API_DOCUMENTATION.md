# 🚀 The Gorge API Documentation

## 📋 **Overview**

The Gorge API provides comprehensive blockchain infrastructure monitoring capabilities for both individuals and organizations. This RESTful API enables users to manage RPC endpoints, monitor performance, handle alerts, and manage user accounts.

**Base URL:** `http://localhost:3000/api`  
**Version:** `v1`  
**Authentication:** JWT Bearer Token  
**Rate Limiting:** Yes (varies by endpoint)

---

## 🔐 **Authentication**

### **POST** `/auth/login`
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "organizationId": "org-456"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-here"
  },
  "message": "Login successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### **POST** `/auth/register`
Register a new user account.

**Request Body (Individual):**
```json
{
  "registrationType": "individual",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "jobTitle": "Developer",
  "company": "Acme Corp",
  "website": "https://johndoe.com",
  "bio": "Blockchain developer",
  "industry": "defi",
  "useCase": "DeFi protocol monitoring",
  "blockchainExperience": "intermediate",
  "marketingConsent": true,
  "acceptTerms": true
}
```

**Request Body (Organization):**
```json
{
  "registrationType": "organization",
  "email": "admin@company.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "organizationName": "Blockchain Corp",
  "organizationSlug": "blockchain-corp",
  "organizationDescription": "Leading blockchain infrastructure company",
  "industry": "enterprise",
  "plan": "pro",
  "organizationSize": "51-200",
  "organizationWebsite": "https://blockchaincorp.com",
  "organizationAddress": "123 Blockchain St, Crypto City",
  "organizationCountry": "United States",
  "organizationTimezone": "America/New_York",
  "useCase": "Enterprise blockchain monitoring",
  "blockchainExperience": "advanced",
  "expectedRpcUsage": "high",
  "marketingConsent": true,
  "acceptTerms": true
}
```

**Request Body (Join Organization):**
```json
{
  "registrationType": "join_organization",
  "email": "newuser@company.com",
  "password": "password123",
  "firstName": "Bob",
  "lastName": "Johnson",
  "organizationId": "org-456",
  "invitationCode": "INV-123456",
  "department": "Engineering",
  "managerEmail": "manager@company.com",
  "jobTitle": "Senior Developer",
  "marketingConsent": true,
  "acceptTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "organizationId": "org-456"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-here"
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 3 requests per 15 minutes

---

### **POST** `/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token-here"
  },
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 10 requests per 15 minutes

---

### **GET** `/auth/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "role": "user",
    "avatar": "https://example.com/avatar.jpg",
    "phoneNumber": "+1234567890",
    "jobTitle": "Developer",
    "company": "Acme Corp",
    "website": "https://johndoe.com",
    "bio": "Blockchain developer",
    "timezone": "UTC",
    "organizationId": "org-456",
    "department": "Engineering",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "isActive": true,
    "emailVerified": true,
    "marketingConsent": true,
    "twoFactorEnabled": false,
    "preferences": {
      "theme": "auto",
      "language": "en",
      "notifications": {
        "email": true,
        "push": true,
        "sms": false,
        "slack": false,
        "discord": false
      },
      "dashboard": {
        "defaultView": "overview",
        "refreshInterval": 30,
        "showAdvancedMetrics": false,
        "compactMode": false
      },
      "alerts": {
        "severity": "medium",
        "channels": ["email"],
        "quietHours": {
          "enabled": false,
          "start": "22:00",
          "end": "08:00",
          "timezone": "UTC"
        }
      }
    }
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **PUT** `/auth/profile`
Update current user profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "jobTitle": "Senior Developer",
  "company": "Acme Corp",
  "website": "https://johndoe.com",
  "bio": "Senior blockchain developer",
  "avatar": "https://example.com/new-avatar.jpg",
  "timezone": "America/New_York",
  "marketingConsent": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "role": "user",
    "avatar": "https://example.com/new-avatar.jpg",
    "phoneNumber": "+1234567890",
    "jobTitle": "Senior Developer",
    "company": "Acme Corp",
    "website": "https://johndoe.com",
    "bio": "Senior blockchain developer",
    "timezone": "America/New_York",
    "organizationId": "org-456",
    "lastLoginAt": "2024-01-01T00:00:00.000Z",
    "isActive": true,
    "emailVerified": true,
    "marketingConsent": true,
    "twoFactorEnabled": false,
    "preferences": { ... }
  },
  "message": "Profile updated successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **PUT** `/auth/change-password`
Change user password.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **POST** `/auth/forgot-password`
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset email sent",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 3 requests per 15 minutes

---

### **POST** `/auth/reset-password`
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### **POST** `/auth/logout`
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔗 **RPC Management**

### **GET** `/rpcs`
Get all RPC configurations for the authenticated user.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `limit` (optional): Number of results per page (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rpc-123",
      "userId": "user-123",
      "name": "Ethereum Mainnet",
      "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
      "network": "ethereum",
      "chainId": 1,
      "timeout": 10000,
      "enabled": true,
      "priority": 1,
      "lastCheckedAt": "2024-01-01T00:00:00.000Z",
      "isHealthy": true,
      "responseTime": 150,
      "errorCount": 0,
      "lastError": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "RPC configurations retrieved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **GET** `/rpcs/{rpcId}`
Get specific RPC configuration.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rpc-123",
    "userId": "user-123",
    "name": "Ethereum Mainnet",
    "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
    "network": "ethereum",
    "chainId": 1,
    "timeout": 10000,
    "enabled": true,
    "priority": 1,
    "lastCheckedAt": "2024-01-01T00:00:00.000Z",
    "isHealthy": true,
    "responseTime": 150,
    "errorCount": 0,
    "lastError": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "RPC configuration retrieved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **POST** `/rpcs`
Create new RPC configuration.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Ethereum Mainnet",
  "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
  "network": "ethereum",
  "chainId": 1,
  "timeout": 10000,
  "enabled": true,
  "priority": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rpc-123",
    "userId": "user-123",
    "name": "Ethereum Mainnet",
    "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
    "network": "ethereum",
    "chainId": 1,
    "timeout": 10000,
    "enabled": true,
    "priority": 1,
    "isHealthy": true,
    "responseTime": 150,
    "errorCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "RPC configuration created successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit:** 10 requests per 15 minutes

---

### **PUT** `/rpcs/{rpcId}`
Update RPC configuration.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Ethereum Mainnet Updated",
  "url": "https://eth-mainnet.g.alchemy.com/v2/new-key",
  "timeout": 15000,
  "priority": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rpc-123",
    "userId": "user-123",
    "name": "Ethereum Mainnet Updated",
    "url": "https://eth-mainnet.g.alchemy.com/v2/new-key",
    "network": "ethereum",
    "chainId": 1,
    "timeout": 15000,
    "enabled": true,
    "priority": 2,
    "lastCheckedAt": "2024-01-01T00:00:00.000Z",
    "isHealthy": true,
    "responseTime": 150,
    "errorCount": 0,
    "lastError": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "RPC configuration updated successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **DELETE** `/rpcs/{rpcId}`
Delete RPC configuration.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "RPC configuration deleted successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **GET** `/rpcs/{rpcId}/status`
Get current status of RPC endpoint.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rpc-123",
    "name": "Ethereum Mainnet",
    "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
    "isHealthy": true,
    "responseTime": 150,
    "lastCheckedAt": "2024-01-01T00:00:00.000Z",
    "errorCount": 0,
    "lastError": null,
    "enabled": true
  },
  "message": "RPC status retrieved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **GET** `/rpcs/{rpcId}/metrics`
Get metrics for RPC endpoint.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `timeRange` (optional): Time range for metrics (default: "24h")
  - Options: "1h", "24h", "7d", "30d"

**Response:**
```json
{
  "success": true,
  "data": {
    "rpcId": "rpc-123",
    "timeRange": "24h",
    "metrics": {
      "uptime": 99.9,
      "averageResponseTime": 150,
      "errorRate": 0.1,
      "totalRequests": 10000,
      "successfulRequests": 9990,
      "failedRequests": 10
    },
    "healthHistory": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "isHealthy": true,
        "responseTime": 150,
        "errorMessage": null
      }
    ],
    "alerts": [
      {
        "id": "alert-123",
        "type": "high_latency",
        "severity": "medium",
        "message": "Response time exceeded threshold",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "resolved": true
      }
    ]
  },
  "message": "RPC metrics retrieved successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **PUT** `/rpcs/{rpcId}/toggle`
Toggle RPC enabled/disabled status.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "enabled": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rpc-123",
    "userId": "user-123",
    "name": "Ethereum Mainnet",
    "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
    "network": "ethereum",
    "chainId": 1,
    "timeout": 10000,
    "enabled": false,
    "priority": 1,
    "lastCheckedAt": "2024-01-01T00:00:00.000Z",
    "isHealthy": true,
    "responseTime": 150,
    "errorCount": 0,
    "lastError": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "RPC disabled successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **POST** `/rpcs/test`
Test RPC connection without saving.

**Request Body:**
```json
{
  "name": "Test RPC",
  "url": "https://eth-mainnet.g.alchemy.com/v2/demo",
  "network": "ethereum",
  "chainId": 1,
  "timeout": 10000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isHealthy": true,
    "responseTime": 150,
    "blockNumber": 18500000,
    "chainId": 1,
    "error": null
  },
  "message": "RPC connection test completed",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🏥 **Health & System**

### **GET** `/health`
Get system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 86400,
    "monitoring": true,
    "version": "1.0.0",
    "database": "connected",
    "services": {
      "monitoring": "active",
      "alerts": "active",
      "metrics": "active"
    }
  },
  "message": "System is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📊 **Error Responses**

### **400 Bad Request**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication failed",
  "code": "AUTH_FAILED",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "error": "Access denied",
  "code": "ACCESS_DENIED",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **404 Not Found**
```json
{
  "success": false,
  "error": "Resource not found",
  "code": "RESOURCE_NOT_FOUND",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **429 Too Many Requests**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "details": {
    "retryAfter": 900
  }
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔒 **Rate Limiting**

| Endpoint Category | Rate Limit | Window |
|------------------|------------|--------|
| Authentication | 5 requests | 15 minutes |
| Registration | 3 requests | 15 minutes |
| RPC Creation | 10 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Password Reset | 3 requests | 15 minutes |

---

## 🔑 **Authentication**

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

**Token Expiration:**
- Access Token: 1 hour
- Refresh Token: 7 days

---

## 📝 **Data Types**

### **EVM Networks**
```typescript
enum EVM_NETWORKS {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  AVALANCHE = 'avalanche',
  FANTOM = 'fantom',
  ETHEREUM_GOERLI = 'ethereum-goerli',
  POLYGON_MUMBAI = 'polygon-mumbai'
}
```

### **User Roles**
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ORG_ADMIN = 'org_admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  BILLING = 'billing',
  USER = 'user'
}
```

### **Organization Plans**
```typescript
enum OrganizationPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}
```

### **Industries**
```typescript
enum Industry {
  DEFI = 'defi',
  NFT = 'nft',
  GAMING = 'gaming',
  ENTERPRISE = 'enterprise',
  STARTUP = 'startup',
  RESEARCH = 'research',
  EDUCATION = 'education',
  OTHER = 'other'
}
```

---

## 🚀 **Getting Started**

1. **Register** a new account using `/auth/register`
2. **Login** to get access token using `/auth/login`
3. **Add RPC endpoints** using `/rpcs` POST
4. **Monitor status** using `/rpcs/{id}/status`
5. **View metrics** using `/rpcs/{id}/metrics`

---

## 📞 **Support**

For API support and questions:
- **Email:** support@thegorge.com
- **Documentation:** https://docs.thegorge.com
- **Status Page:** https://status.thegorge.com

---

## 🔄 **Changelog**

### **v1.0.0** (2024-01-01)
- Initial API release
- User authentication and registration
- RPC management endpoints
- Basic monitoring capabilities
