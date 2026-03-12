require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  const client = await pool.connect();
  try {
    const sqlFile = path.join(__dirname, '001_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await client.query(sql);
    console.log('Migrations completed successfully');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
