const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD || 'root;',
    database: "recyclingdb"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected.");
    
    const sql = `
    CREATE TABLE IF NOT EXISTS redemption_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recycler_username VARCHAR(100),
        points_deducted INT,
        eth_amount DECIMAL(18, 6),
        wallet_address VARCHAR(100),
        status ENUM('Pending', 'Paid') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    db.query(sql, (err, res) => {
        if(err) console.error(err);
        else console.log("Table 'redemption_requests' created or already exists.");
        process.exit();
    });
});
