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
    
    const sql = "ALTER TABLE bin_details MODIFY COLUMN status ENUM('Pending','Approved','Rejected','Submitted') DEFAULT 'Pending'";
    
    db.query(sql, (err, res) => {
        if(err) console.error(err);
        else console.log("Schema Successfully Updated: Added 'Submitted' to ENUM.");
        process.exit();
    });
});
