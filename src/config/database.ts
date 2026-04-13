export const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const tableSchemas = {
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
