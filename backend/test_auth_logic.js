import pool from './src/config/db.js';
import bcrypt from 'bcrypt';

const run = async () => {
    try {
        const email = 'test_reg_' + Date.now() + '@test.com';
        const password = 'password';
        const name = 'Test User';
        
        console.log("Hashing password...");
        const hash = await bcrypt.hash(password, 10);
        console.log("Hash:", hash);
        
        console.log("Inserting user...");
        const [res] = await pool.query('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)', [email, hash, name]);
        console.log("Insert result:", res);
        
        console.log("Verifying login...");
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const match = await bcrypt.compare(password, users[0].password_hash);
        console.log("Match:", match);

        process.exit(0);
    } catch (err) {
        console.error("FATAL ERROR:", err);
        process.exit(1);
    }
};

run();
