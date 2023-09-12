const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "localhost",
  user: "rexlee",
  password: "rl123456",
  database: "purchase_record_project",
});

connection.query(
`CREATE TABLE IF NOT EXISTS purchase_record (
id INT AUTO_INCREMENT PRIMARY KEY,
product_name VARCHAR(255) NOT null,
product_type VARCHAR(99) NOT null,
price DECIMAL(10,2),
purchase_date DATE NOT null
)`,
  (err, results) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Table created successfully");
    }
    connection.close();
  }
);
