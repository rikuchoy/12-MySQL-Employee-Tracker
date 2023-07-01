const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'R1ku0612',
    database: 'employee_tracker_db'
});

module.exports = db;