const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password_here',
    database: 'employee_tracker_db'
});

module.exports = db;