import pool from './src/config/db.js';

const run = async () => {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        const names = tables.map(t => Object.values(t)[0]);
        console.log("Current Tables:", names);
        
        for (const table of names) {
            const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`Table ${table} has ${rows[0].count} rows`);
        }

        process.exit(0);
    } catch (err) {
        console.error("DB Error:", err.message);
        process.exit(1);
    }
};

run();
