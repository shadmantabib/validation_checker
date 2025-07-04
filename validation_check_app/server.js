const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database on startup
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('validation.db');
    
    db.serialize(() => {
      // Create table if it doesn't exist
      db.run(`CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reg_no TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        father_name TEXT,
        mother_name TEXT,
        venue TEXT,
        verification_no TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Check if data already exists
      db.get("SELECT COUNT(*) as count FROM registrations", (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          // Add sample data only if table is empty
          console.log('Setting up sample data...');
          
          function generateVerificationNumber(regNo) {
            const secret = process.env.SECRET_SALT;
            if (!secret) {
              console.warn('WARNING: SECRET_SALT not set in environment variables. Using default for development.');
              const defaultSecret = 'development-only-secret-key';
              const hash = crypto.createHmac('sha256', defaultSecret)
                                .update(regNo.toString())
                                .digest('hex');
              return hash.substring(0, 8).toUpperCase();
            }
            
            const hash = crypto.createHmac('sha256', secret)
                              .update(regNo.toString())
                              .digest('hex');
            return hash.substring(0, 8).toUpperCase();
          }

          const sampleData = [
            {
              reg_no: '12345678',
              name: 'Sohel Rahman',
              father_name: 'Siddiqur Rahman',
              mother_name: 'Hosne Ara Begu',
              venue: 'BUET, ECE Building, Room 233'
            },
            {
              reg_no: '87654321',
              name: 'John Doe',
              father_name: 'Robert Doe',
              mother_name: 'Jane Doe',
              venue: 'BUET, CSE Building, Room 101'
            },
            {
              reg_no: '11223344',
              name: 'Alice Smith',
              father_name: 'Bob Smith',
              mother_name: 'Carol Smith',
              venue: 'BUET, EEE Building, Room 205'
            },
            {
              reg_no: '55667788',
              name: 'Mohammad Rahman',
              father_name: 'Abdul Rahman',
              mother_name: 'Fatima Rahman',
              venue: 'BUET, ME Building, Room 150'
            },
            {
              reg_no: '99887766',
              name: 'Sarah Johnson',
              father_name: 'Michael Johnson',
              mother_name: 'Lisa Johnson',
              venue: 'BUET, CE Building, Room 301'
            }
          ];

          const stmt = db.prepare(`INSERT OR REPLACE INTO registrations 
            (reg_no, name, father_name, mother_name, venue, verification_no) 
            VALUES (?, ?, ?, ?, ?, ?)`);

          sampleData.forEach(data => {
            const verificationNo = generateVerificationNumber(data.reg_no);
            stmt.run(data.reg_no, data.name, data.father_name, data.mother_name, data.venue, verificationNo);
          });

          stmt.finalize();
          console.log('Sample data added successfully');
        }
        
        db.close();
        resolve();
      });
    });
  });
}

// Database connection
let db;

function connectDatabase() {
  db = new sqlite3.Database('validation.db', (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Validation endpoint
app.post('/api/validate', (req, res) => {
  const { regNo, verificationNo } = req.body;

  // Input validation
  if (!regNo || !verificationNo) {
    return res.status(400).json({
      success: false,
      message: 'Registration number and verification number are required'
    });
  }

  // Sanitize inputs
  const sanitizedRegNo = regNo.toString().trim();
  const sanitizedVerificationNo = verificationNo.toString().trim().toUpperCase();

  // Query database
  const query = `
    SELECT reg_no, name, father_name, mother_name, venue, verification_no 
    FROM registrations 
    WHERE reg_no = ? AND verification_no = ?
  `;

  db.get(query, [sanitizedRegNo, sanitizedVerificationNo], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
    }

    if (row) {
      // Valid registration found
      res.json({
        success: true,
        message: 'Registration validated successfully',
        data: {
          regNo: row.reg_no,
          name: row.name,
          fatherName: row.father_name,
          motherName: row.mother_name,
          venue: row.venue,
          verificationNo: row.verification_no
        }
      });
    } else {
      // Invalid registration
      res.status(404).json({
        success: false,
        message: 'Invalid registration number or verification number'
      });
    }
  });
});

// Get all registrations (for admin purposes - you might want to remove this in production)
app.get('/api/registrations', (req, res) => {
  const query = 'SELECT reg_no, name, verification_no FROM registrations ORDER BY reg_no';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the application at: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}); 