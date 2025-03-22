// backend/scripts/hash_existing_passwords.js

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function hashExistingPasswords() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // Get all users with plain text passwords
    const result = await client.query('SELECT id, username, password FROM users');
    console.log(`Found ${result.rows.length} users to update`);
    
    // Hash each user's password
    for (const user of result.rows) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      console.log(`Updated password for user: ${user.username}`);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('All passwords have been hashed successfully');
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error hashing passwords:', error);
  } finally {
    client.release();
    pool.end();
  }
}

// Run the script
hashExistingPasswords();