const mysql = require("mysql2/promise");
const config = require("./config");

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: "Z"
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query("SELECT DATABASE() AS databaseName, VERSION() AS version");
    return rows[0];
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
