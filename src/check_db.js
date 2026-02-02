const mysql = require("mysql2");
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
    
    db.query("DESCRIBE bin_details", (err, res) => {
        console.log("--- BIN_DETAILS SCHEMA ---");
        console.table(res);
        
        db.query("SHOW CREATE TABLE bin_details", (err, res) => {
             console.log(res);
             process.exit();
        });
    });
});
