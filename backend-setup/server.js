// Sample Express.js backend server for MySQL integration
// Run this separately from your React app

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Routes
app.get('/api/visits/recent', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, ip, city, region, country, loc, org, timezone, user_agent, referer, is_mobile, connection_type, subsource, timestamp
       FROM visits ORDER BY timestamp DESC LIMIT 10`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/conversions/recent', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, network, subid, payout, country, time
       FROM conversions ORDER BY time DESC LIMIT 10`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching conversions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats/summary', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        SUM(total_clicks) as totalClicks,
        SUM(total_unique) as totalUnique,
        SUM(total_conversions) as totalConversions,
        SUM(total_earning) as totalEarning
      FROM stats_summary 
      WHERE date = CURDATE()
    `);
    res.json(rows[0] || { totalClicks: 0, totalUnique: 0, totalConversions: 0, totalEarning: 0 });
  } catch (error) {
    console.error('Error fetching stats summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { start, end } = req.query;
    const [rows] = await pool.execute(
      'SELECT * FROM team_performance WHERE date BETWEEN ? AND ?',
      [start, end]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/team-performance', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        subid,
        SUM(clicks) as clicks,
        SUM(unique_visitors) as unique,
        SUM(conversions) as conversions,
        SUM(earnings) as earnings
      FROM team_performance 
      GROUP BY subid 
      ORDER BY conversions DESC
    `);
    
    // Add rank to each row
    const rankedRows = rows.map((row, index) => ({
      ...row,
      rank: index + 1
    }));
    
    res.json(rankedRows);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database tables
app.post('/api/init-db', async (req, res) => {
  try {
    // Create tables if they don't exist
    const tableSchemas = {
      visits: `
        CREATE TABLE IF NOT EXISTS visits (
          id VARCHAR(36) PRIMARY KEY,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          subsource VARCHAR(50),
          ip VARCHAR(45),
          country VARCHAR(2),
          os VARCHAR(50),
          referrer VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      conversions: `
        CREATE TABLE IF NOT EXISTS conversions (
          id VARCHAR(36) PRIMARY KEY,
          time DATETIME DEFAULT CURRENT_TIMESTAMP,
          subid VARCHAR(50),
          payout DECIMAL(10,2),
          country VARCHAR(2),
          network VARCHAR(50) DEFAULT 'TRAFEE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      stats_summary: `
        CREATE TABLE IF NOT EXISTS stats_summary (
          id INT AUTO_INCREMENT PRIMARY KEY,
          date DATE,
          total_clicks INT DEFAULT 0,
          total_unique INT DEFAULT 0,
          total_conversions INT DEFAULT 0,
          total_earning DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_date (date)
        )
      `,
      team_performance: `
        CREATE TABLE IF NOT EXISTS team_performance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subid VARCHAR(50),
          date DATE,
          clicks INT DEFAULT 0,
          unique_visitors INT DEFAULT 0,
          conversions INT DEFAULT 0,
          earnings DECIMAL(10,2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_subid_date (subid, date)
        )
      `
    };

    for (const [tableName, schema] of Object.entries(tableSchemas)) {
      await pool.execute(schema);
      console.log(`Table ${tableName} created or already exists`);
    }

    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Visit http://localhost:${port}/api/init-db to initialize database tables`);
});
