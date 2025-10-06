-- Sample data for development/testing
-- This file contains initial data to populate the database

-- Insert sample organizations
INSERT INTO organizations (id, name, slug, description, settings, limits, created_at, updated_at) VALUES
('org-1', 'Acme Corp', 'acme-corp', 'A sample organization for testing', '{}', '{}', NOW(), NOW()),
('org-2', 'Blockchain Inc', 'blockchain-inc', 'Another sample organization', '{}', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, name, role, avatar, organization_id, is_active, created_at, updated_at) VALUES
('user-1', 'admin@acme.com', 'Admin User', 'admin', NULL, 'org-1', true, NOW(), NOW()),
('user-2', 'user@acme.com', 'Regular User', 'user', NULL, 'org-1', true, NOW(), NOW()),
('user-3', 'admin@blockchain.com', 'Blockchain Admin', 'admin', NULL, 'org-2', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample RPC configurations
INSERT INTO rpc_configs (id, user_id, name, url, network, chain_id, timeout, enabled, priority, is_healthy, error_count, created_at, updated_at) VALUES
('rpc-1', 'user-1', 'Ethereum Mainnet', 'https://eth-mainnet.g.alchemy.com/v2/demo', 'ethereum', 1, 10000, true, 1, true, 0, NOW(), NOW()),
('rpc-2', 'user-1', 'Polygon', 'https://polygon-rpc.com', 'polygon', 137, 10000, true, 1, true, 0, NOW(), NOW()),
('rpc-3', 'user-2', 'BSC', 'https://bsc-dataseed.binance.org', 'bsc', 56, 10000, true, 1, true, 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
