const express = require('express');  // for create API endpoints
const mysql = require('mysql2');    // for database query
const cors = require('cors');
const dayjs = require('dayjs');

// Create a connection pool to the MYSQL database
const pool = mysql.createPool({
    connectionLimit: 30,
    host: 'database-1.cmis6pkt00lz.us-east-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: '!Rl1234567',
    database: 'purchase_record_project'
});

// Create an Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// GET - get all record
app.get('/purchase_record', (req, res) => {
    pool.query('SELECT * FROM purchase_record ORDER BY purchase_date', (err, results) => {
    if (err) {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    } else {
        res.json(results);
    }
    });
});

// GET - get spending amount by category and month
app.get('/purchase_record/category/:catid/purchase_month/:monthid/purchase_year/:yearid', (req, res) => {
  const catId = req.params.catid;
  const monthId = req.params.monthid;
  const yearId = req.params.yearid;
  console.log(catId, monthId, yearId);
  pool.query(`SELECT SUM(price) AS "price" FROM purchase_record WHERE (product_type = "${catId}" AND MONTH(purchase_date) = "${monthId}" AND YEAR(purchase_date) = "${yearId}")`, (err, results) => {
  
    if (err) {
      console.error(err);
      res.status(500).json({error: 'Internal Server Error'});
  } else {
      res.json(results);
  }
  });
});

// POST /tasks - create a new record
app.post('/purchase_record', (req, res) => {
    const record = req.body;
    pool.query('INSERT INTO purchase_record SET ?', record, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ record_id: result.insertId });
      }
    });
  });

  // PUT /tasks - update a purchase record
app.put("/purchase_record/:id", (req, res) => {
  const updateid = parseInt(req.params.id);
  const record = req.body;

  const updateRecord = new Promise((resolve, reject) => {
    pool.query(
      `UPDATE purchase_record SET ? WHERE (id = "${updateid}")`,
      record,
      (err, result) => {
        if (err) {
          reject(new Error("Data saving error."));
        } else {
          resolve(record);
          //resolve(result);
        }
      }
    );
  });

  updateRecord
    .then((updateRecord) => {
      updateRecord.purchase_date = dayjs(updateRecord.purchase_date).format("MM/DD/YYYY");
      console.log(updateRecord);
      res.json({ ...updateRecord, id: updateid });
    })
    .catch((error) => {
      res.status(500).json( {error} );
    });
});
 
  // DELETE /tasks/:id - delete an existing record
  app.delete('/purchase_record/:id', (req, res) => {
    const recordId = req.params.id;
    pool.query('DELETE FROM purchase_record WHERE id = ?', recordId, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: 'Record not found' });
      } else {
        //res.status(204).send();
        res.json(result);
      }
    });
  });

// Start the Express app on port 3001
app.listen(3001, () => {
    console.log('Server started on port 3001');
})
