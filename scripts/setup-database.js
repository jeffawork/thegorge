#!/usr/bin/env node

/**
 * Database Setup Script for The Gorge RPC Monitor
 * This script creates the database and runs the schema
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'the_gorge',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function setupDatabase() {
  console.log('🚀 Setting up The Gorge RPC Monitor database...');
  
  // First, connect to postgres database to create our database
  const adminConfig = {
    ...dbConfig,
    database: 'postgres' // Connect to default postgres database
  };

  const adminClient = new Client(adminConfig);
  
  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbCheckResult = await adminClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbConfig.database]
    );

    if (dbCheckResult.rows.length === 0) {
      // Create database
      await adminClient.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`✅ Created database: ${dbConfig.database}`);
    } else {
      console.log(`✅ Database already exists: ${dbConfig.database}`);
    }

    await adminClient.end();
  } catch (error) {
    console.error('❌ Failed to create database:', error.message);
    await adminClient.end();
    process.exit(1);
  }

  // Now connect to our database and run schema
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log(`✅ Connected to database: ${dbConfig.database}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check default data
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const orgCount = await client.query('SELECT COUNT(*) FROM organizations');
    
    console.log(`👥 Users: ${userCount.rows[0].count}`);
    console.log(`🏢 Organizations: ${orgCount.rows[0].count}`);

    await client.end();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to setup database schema:', error.message);
    await client.end();
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
