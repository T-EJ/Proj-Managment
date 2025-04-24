import mysql from 'mysql2';

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',          // MySQL server host
  user: 'root',               // MySQL username
  password: '',               // MySQL password (if any)
  database: 'jg_fees_app'     // Name of the database you want to connect to
});

// Attempt to connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database with id:', connection.threadId);
});

// Gracefully handle connection closure
process.on('SIGINT', () => {
  connection.end((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.stack);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Export the connection object for use in other files
export default connection;
