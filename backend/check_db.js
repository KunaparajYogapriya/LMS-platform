import pool from './src/config/db.js';

const run = async () => {
    try {
        const [users] = await pool.query('SELECT id, email, name FROM users');
        console.log("Users in DB:", users);
        
        const [tables] = await pool.query('SHOW TABLES');
        console.log("Tables in DB:", tables);

        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

run();
