require('dotenv').config();  
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'db',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'ngopassword',
  database: process.env.MYSQL_DATABASE || 'ngo_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function query(sql, values) {
  return new Promise((resolve, reject) => {
    pool.execute(sql, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

module.exports = { query };
