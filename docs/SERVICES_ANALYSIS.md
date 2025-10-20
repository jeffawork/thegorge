# Services Analysis - What Can Be Safely Removed

## ✅ **Currently Used Services (Keep)**

### **Core Services (Active)**
- `monitoringService.ts` - Main service used in app.ts
- `web3Service.ts` - Used by monitoringService and rpc.service
- `alertService.ts` - Used by monitoringService
- `metricsService.ts` - Used by monitoringService and alertService
- `userService.ts` - Used by monitoringService
- `authService.ts` - Used by auth routes and controllers
- `rpc.service.ts` - New refactored service used by rpc routes

### **Supporting Services (Referenced)**
- `authServiceSimple.ts` - Referenced in middleware (commented out)

## ⚠️ **Potentially Unused Services (Review)**

### **Advanced Features (Not Currently Integrated)**
- `advancedAlertingService.ts` - Advanced alerting features
- `advancedBlockchainMetricsService.ts` - Advanced blockchain metrics
- `anomalyDetectionService.ts` - Anomaly detection
- `auditLoggingService.ts` - Audit logging
- `costTrackingService.ts` - Cost tracking
- `multiChainService.ts` - Multi-chain support
- `multiTenantMetricsService.ts` - Multi-tenant metrics
- `organizationService.ts` - Organization management
- `rbacService.ts` - Role-based access control
- `realTimeDashboardService.ts` - Real-time dashboard
- `rpcSyncMonitoringService.ts` - RPC sync monitoring
- `slaMonitoringService.ts` - SLA monitoring
- `usageAnalyticsService.ts` - Usage analytics
- `walletMonitoringService.ts` - Wallet monitoring
- `rateLimitingService.ts` - Rate limiting service

## 🗑️ **Safe to Remove**

These services appear to be **advanced features** that are not currently integrated into the main application flow. They were likely created for future features but are not being used.

### **Recommendation:**
1. **Keep core services** (monitoring, web3, alert, metrics, user, auth, rpc)
2. **Archive advanced services** to a separate folder for future use
3. **Remove unused services** if they're not part of the roadmap

## 🔄 **Refactoring Status**

- ✅ **Refactored**: `authService.ts`, `rpc.service.ts`
- ⚠️ **Needs Refactoring**: `monitoringService.ts`, `alertService.ts`, `metricsService.ts`, `userService.ts`
- 🗑️ **Can Remove**: All advanced feature services
