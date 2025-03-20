const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
    user: "your_db_user",
    host: "your_db_host",
    database: "your_db_name",
    password: "your_db_password",
    port: 5432,
});

const createUser = async (username, plainPassword) => {
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash password
    const query = "INSERT INTO users (username, password) VALUES ($1, $2)";
    
    try {
        await pool.query(query, [username, hashedPassword]);
        console.log(`User ${username} created successfully!`);
    } catch (error) {
        console.error("Error inserting user:", error);
    }
};

// Run the script
createUser("admin", "securepassword123");