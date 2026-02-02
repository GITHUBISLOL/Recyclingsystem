const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const session = require("express-session");
const fs = require('fs');
require('dotenv').config();

// Load Contract Artifact
// Adjust query to find the network ID dynamically or default to 5777 (Ganache)
let contractData;
try {
    contractData = require('../build/contracts/RecyclingContract.json');
} catch (e) {
    console.error("Could not load contract artifact. Run 'truffle migrate' first.");
}

const app = express();

// ===============================
// DATABASE CONNECTION
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD || 'root',
    database: "recyclingdb"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to MySQL database!");
    
    // Self-healing: Ensure points column defaults to 0 not NULL if possible, or just fix data
    db.query("UPDATE recycler SET points = 0 WHERE points IS NULL", (err, res) => {
        if(!err && res.affectedRows > 0) console.log(`Fixed ${res.affectedRows} recyclers with NULL points.`);
    });
});

// ===============================
// CONTRACT INFO ENDPOINT
// ===============================
app.get('/api/contract', (req, res) => {
    if (!contractData) return res.status(500).json({ error: "Contract artifact not found" });

    // getting the latest network deployment
    const networkIds = Object.keys(contractData.networks);
    const latestId = networkIds[networkIds.length - 1]; // usually the last one
    const network = contractData.networks[latestId];

    if (network) {
        res.json({
            address: network.address,
            abi: contractData.abi
        });
    } else {
        res.status(500).json({ error: "Contract not deployed on any network" });
    }
});

// ===============================
// MIDDLEWARE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Headers to prevent caching of auth pages
app.use(function(req, res, next) {
    if(!req.path.startsWith('/api') && !req.path.endsWith('.css') && !req.path.endsWith('.js')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    next();
});

// Session Store (Using memory store for simplicity)
app.use(session({
    secret: "your_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        path: "/", 
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24, 
        secure: false,
        sameSite: 'lax'
    } // 24 hours
}));

// ===============================
// AUTH MIDDLEWARE
// ===============================
function requireNEA(req, res, next) {
    if (!req.session.nea) {
        // For browser page loads, show alert and redirect
        if (req.accepts('html')) {
            return res.send(`<script>alert("Access Denied: NEA Session Required. Please login."); window.location.href = "/";</script>`);
        }
        // For API calls, return JSON
        return res.status(403).json({ success: false, message: "Forbidden: NEA only" });
    }
    next();
}

function requireRecycler(req, res, next) {
    if (!req.session.recycler) {
         if (req.accepts('html')) {
            return res.send(`<script>alert("Access Denied: Recycler Session Required. Please login."); window.location.href = "/";</script>`);
        }
        return res.status(403).json({ success: false, message: "Forbidden: Recycler only" });
    }
    next();
}

// ===============================
// PUBLIC ROUTES
// ===============================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// ===============================
// NEA ROUTES
// ===============================
app.get("/nea/login", (req, res) => res.sendFile(path.join(__dirname, "public", "nea_login.html")));
app.get("/nea/dashboard", requireNEA, (req, res) => res.sendFile(path.join(__dirname, "public", "nea_dashboard.html")));
app.get("/nea/binlog", requireNEA, (req, res) => res.sendFile(path.join(__dirname, "public", "bin_log.html")));
app.get("/nea/recyclers", requireNEA, (req, res) => res.sendFile(path.join(__dirname, "public", "nea_recyclers.html")));
app.get("/nea/blockSubmission", requireNEA, (req, res) => res.sendFile(path.join(__dirname, "public", "nea_blockSubmission.html")));
app.get("/nea/redemptions", requireNEA, (req, res) => res.sendFile(path.join(__dirname, "public", "nea_redemptions.html")));

app.post("/nea/login", (req, res) => {
    const { username, password } = req.body;
    console.log("NEA Login attempt:", username);
    const sql = "SELECT * FROM nea WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("NEA Login database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            console.log("NEA Login successful:", username);
            req.session.nea = { id: results[0].id, username: results[0].username, email: results[0].email };
            res.json({ success: true });
        } else {
            console.log("NEA Login failed: Invalid credentials for", username);
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    });
});

app.post("/nea/logout", requireNEA, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.json({ success: true });
    });
});

// ===============================
// RECYCLER ROUTES
// ===============================
app.get("/recycler/login", (req, res) => res.sendFile(path.join(__dirname, "public", "recycler_login.html")));
app.get("/recycler/dashboard", requireRecycler, (req, res) => res.sendFile(path.join(__dirname, "public", "recycler_dashboard.html")));
app.get("/recycler/binlog", requireRecycler, (req, res) => res.sendFile(path.join(__dirname, "public", "bin_log.html")));

app.post("/recycler/login", (req, res) => {
    const { username, password } = req.body;
    console.log("Recycler Login attempt:", username);
    const sql = "SELECT * FROM recycler WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Recycler Login database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            console.log("Recycler Login successful:", username);
            req.session.recycler = { id: results[0].id, username: results[0].username, email: results[0].email };
            res.json({ success: true });
        } else {
            console.log("Recycler Login failed: Invalid credentials for", username);
            res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    });
});

app.post("/recycler/logout", requireRecycler, (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: "Logout failed" });
        res.json({ success: true });
    });
});

// ===============================
// SESSION INFO
// ===============================
app.get('/api/sessionInfo', (req, res) => {
    if (req.session.nea) res.json({ success: true, role: "nea", user: req.session.nea });
    else if (req.session.recycler) res.json({ success: true, role: "recycler", user: req.session.recycler });
    else res.status(401).json({ success: false, message: "Not logged in" });
});

// ===============================
// RECYCLER MANAGEMENT (NEA ONLY)
// ===============================
app.get("/recycler_management/list", requireNEA, (req, res) => {
    const sql = "SELECT id, username, email, created_at FROM recycler";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });
        res.json({ success: true, recyclers: results });
    });
});

app.post("/recycler_management/add", requireNEA, (req, res) => {
    const { username, password, email } = req.body;
    const sql = "INSERT INTO recycler (username, password, email) VALUES (?, ?, ?)";
    db.query(sql, [username, password, email], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });
        res.json({ success: true, message: "Recycler added" });
    });
});

app.delete("/recycler_management/delete/:id", requireNEA, (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM recycler WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database Error" });
        res.json({ success: true, message: "Recycler deleted" });
    });
});

// ===============================
// BIN MANAGEMENT
// ===============================
app.post('/api/addBin', requireRecycler, (req, res) => {
    // 1️⃣ Log session to debug
    console.log("SESSION RECYCLER:", req.session.recycler);

    if (!req.session.recycler) {
        return res.status(401).json({ message: "Session expired. Please login again." });
    }

    // Use recycler info from session, not from body
    const recycler_name = req.session.recycler.username;
    const email = req.session.recycler.email;
    const { material_type, weight, bin_number } = req.body;

    if (!material_type || !weight || !bin_number) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = `
        INSERT INTO bin_details
        (recycler_name, email, material_type, weight, bin_number, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.query(sql, [recycler_name, email, material_type, weight, bin_number], (err, result) => {
        if (err) {
            console.log("SQL ERROR:", err);
            return res.status(500).json({ message: "Database error" });
        }
        console.log("BIN INSERTED ID:", result.insertId);
        res.json({ message: "Bin added successfully!" });
    });
});




app.post('/api/updateBinStatus/:id', requireNEA, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending','Approved','Rejected', 'Submitted'].includes(status))
        return res.status(400).json({ message: "Invalid status" });

    const sql = "UPDATE bin_details SET status = ? WHERE id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: `Bin ${status.toLowerCase()}!` });
    });
});

// ===============================
// GET BINS
// ===============================
app.get('/api/getBins', (req, res) => {
    const sql = "SELECT * FROM bin_details ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// ===============================
// MARK BIN AS SUBMITTED TO BLOCKCHAIN
// ===============================
app.post('/api/markSubmitted', requireNEA, (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "Bin ID required" });

    const sql = "UPDATE bin_details SET submitted_to_blockchain = 1 WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ success: true, message: "Bin marked as submitted" });
    });
});


app.post('/api/submitBin', requireNEA, (req, res) => {
    const { binId } = req.body;
    console.log(`[submitBin] Received request for binId: ${binId}`);

    if (!binId) {
        return res.status(400).json({ success: false, message: "Missing binId" });
    }

    const sql = `SELECT * FROM bin_details WHERE id = ?`;

    db.query(sql, [binId], (err, bins) => {
         if (err) {
             console.error("[submitBin] Select Error:", err);
             return res.status(500).json({ success: false, message: "DB Error: " + err.message });
         }
         
         if (bins.length === 0) {
             return res.status(404).json({ success: false, message: "Bin not found" });
         }
         
         const bin = bins[0];
         const pointsEarned = Math.floor(bin.weight * 10);
         
         // 1. Update Bin Status
         const updateBinSql = `UPDATE bin_details SET status = 'Submitted', submitted_to_blockchain = 1 WHERE id = ?`;
         
         db.query(updateBinSql, [binId], (err2, result) => {
             if(err2) {
                 console.error("[submitBin] Update Error:", err2);
                 return res.status(500).json({ success:false, message:"Update failed: " + err2.message });
             }
             
             // 2. Award Points to Recycler
             const awardSql = "UPDATE recycler SET points = COALESCE(points, 0) + ? WHERE username = ? OR email = ?";
             
             db.query(awardSql, [pointsEarned, bin.recycler_name, bin.email], (err3, res3) => {
                 if(err3) {
                     console.error("Failed to award points:", err3);
                     // Note: We don't fail the request if point awarding fails, but we log it.
                     // Or maybe we should warn?
                 } else if (res3.affectedRows === 0) {
                     console.warn(`WARNING: Points NOT awarded! User '${bin.recycler_name}'/'${bin.email}' not found.`);
                 } else {
                    console.log(`Awarded ${pointsEarned} points to ${bin.recycler_name}`);
                 }
                 
                 res.json({ success: true, message: `Bin submitted! Recycler awarded ${pointsEarned} points.` });
             });
         });
    });
});

// ===============================
// REWARDS SYSTEM
// ===============================
app.get('/api/recyclerPoints', requireRecycler, (req, res) => {
    const username = req.session.recycler.username;
    db.query("SELECT points FROM recycler WHERE username = ?", [username], (err, results) => {
        if(err || results.length === 0) return res.json({ points: 0 });
        res.json({ points: results[0].points || 0 });
    });
});

app.post('/api/requestRedemption', requireRecycler, (req, res) => {
    const { pointsToRedeem, walletAddress } = req.body;
    const username = req.session.recycler.username;
    
    // Rate: 50 Points = 1 SGD. 
    // Approx Exchange: 1 SGD = 0.0003 ETH (Simplified for demo)
    const ethAmount = (pointsToRedeem / 50) * 0.0003; 

    db.query("SELECT points FROM recycler WHERE username = ?", [username], (err, results) => {
        const currentPoints = results[0].points || 0;
        
        if (currentPoints < pointsToRedeem) {
            return res.status(400).json({ success: false, message: "Insufficient points" });
        }

        // Deduct points immediately (optimistic) or wait? 
        // Let's deduct immediately to prevent double spend, refund if failed later.
        db.query("UPDATE recycler SET points = points - ? WHERE username = ?", [pointsToRedeem, username], (err) => {
            if(err) return res.status(500).json({ success: false });

            const sql = "INSERT INTO redemption_requests (recycler_username, points_deducted, eth_amount, wallet_address) VALUES (?, ?, ?, ?)";
            db.query(sql, [username, pointsToRedeem, ethAmount, walletAddress], (err, result) => {
                if(err) return res.status(500).json({ success: false, message: "Request failed" });
                res.json({ success: true, message: "Redemption requested!" });
            });
        });
    });
});

app.get('/api/redemptionRequests', requireNEA, (req, res) => {
    db.query("SELECT * FROM redemption_requests WHERE status = 'Pending' ORDER BY id DESC", (err, results) => {
         res.json({ success: true, requests: results });
    });
});

app.post('/api/confirmPayment', requireNEA, (req, res) => {
    const { requestId, txHash } = req.body;
    // We assume NEA frontend sent the ETH successfully and provided the hash
    const sql = "UPDATE redemption_requests SET status = 'Paid' WHERE id = ?";
    db.query(sql, [requestId], (err) => {
        if(err) return res.status(500).json({ success:false });
        res.json({ success: true });
    });
});

// ===============================
// GET SUBMITTED BINS (BLOCKCHAIN LOG)
// ===============================
app.get('/api/getSubmittedBins', requireNEA, (req, res) => {
    const sql = "SELECT * FROM bin_details WHERE submitted_to_blockchain = 1 ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// ===============================
// GET LEADERBOARD
// ===============================
app.get('/api/leaderboard', (req, res) => {
    const sql = `
        SELECT recycler_name, SUM(weight) as total_weight 
        FROM bin_details 
        WHERE status IN ('Approved', 'Submitted')
        GROUP BY recycler_name 
        ORDER BY total_weight DESC 
        LIMIT 5
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});

// ===============================
// START SERVER
// ===============================
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
