const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// Create database
const db = new sqlite3.Database('validation.db');

// Create table
db.serialize(() => {
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

  // Function to generate verification number (hash-based)
  function generateVerificationNumber(regNo) {
    // Create a hash using registration number + a secret salt
    const secret = process.env.SECRET_SALT || 'development-only-secret-key';
    if (!process.env.SECRET_SALT) {
      console.warn('WARNING: SECRET_SALT not set. Using development key for local setup.');
    }
    
    const hash = crypto.createHmac('sha256', secret)
                      .update(regNo.toString())
                      .digest('hex');
    
    // Take first 8 characters and make it more readable
    return hash.substring(0, 8).toUpperCase();
  }

  // Sample data based on your spreadsheet
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

  // Insert sample data
  const stmt = db.prepare(`INSERT OR REPLACE INTO registrations 
    (reg_no, name, father_name, mother_name, venue, verification_no) 
    VALUES (?, ?, ?, ?, ?, ?)`);

  sampleData.forEach(data => {
    const verificationNo = generateVerificationNumber(data.reg_no);
    stmt.run(data.reg_no, data.name, data.father_name, data.mother_name, data.venue, verificationNo);
    console.log(`Added: ${data.reg_no} -> ${verificationNo}`);
  });

  stmt.finalize();

  // Display all records
  console.log('\n=== Database Setup Complete ===');
  console.log('Registration records with verification numbers:');
  console.log('Reg No\t\tName\t\t\tVerification No');
  console.log('------\t\t----\t\t\t---------------');
  
  db.each("SELECT reg_no, name, verification_no FROM registrations", (err, row) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`${row.reg_no}\t\t${row.name}\t\t${row.verification_no}`);
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('\nDatabase setup completed successfully!');
    console.log('You can now start the server with: npm start');
  }
}); 