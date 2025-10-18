-- Sample data for development/testing
-- This file contains initial data to populate the database

-- Insert sample organizations
INSERT INTO organizations (id, name, slug, description, settings, limits, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Acme Corp', 'acme-corp', 'A sample organization for testing', '{}', '{}', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Blockchain Inc', 'blockchain-inc', 'Another sample organization', '{}', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, password_hash, name, first_name, last_name, role, organization_id, is_active, email_verified, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', 'admin@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'Admin', 'User', 'admin', '11111111-1111-1111-1111-111111111111', true, true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'user@acme.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Regular User', 'Regular', 'User', 'user', '11111111-1111-1111-1111-111111111111', true, true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'admin@blockchain.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Blockchain Admin', 'Blockchain', 'Admin', 'admin', '22222222-2222-2222-2222-222222222222', true, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample RPC configurations
INSERT INTO rpc_configs (id, user_id, organization_id, name, url, network, chain_id, timeout, enabled, priority, created_at, updated_at) VALUES
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Ethereum Mainnet', 'https://eth-mainnet.g.alchemy.com/v2/demo', 'ethereum', 1, 10000, true, 1, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Polygon', 'https://polygon-rpc.com', 'polygon', 137, 10000, true, 1, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'BSC', 'https://bsc-dataseed.binance.org', 'bsc', 56, 10000, true, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
