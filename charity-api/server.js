const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json()); 

const dbConfig = {
  host: 'localhost',
  user: 'root', 
  password: 'WX20031004wx', 
  database: 'case_study_db' 
};

const connection = mysql.createConnection(dbConfig);
connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Database connection successful!');
});

app.get('/api/activities', (req, res) => {
  const sql = `
    SELECT a.*, c.category_name 
    FROM activities a
    LEFT JOIN event_categories c ON a.category_id = c.id
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Query activity failed:', err);
      res.status(500).json({ error: 'Failed to retrieve the list of activities' });
    } else {
      res.json(results); 
    }
  });
});

app.get('/api/activities/:id', (req, res) => {
  const activityId = req.params.id;
  const activitySql = `
    SELECT a.*, c.category_name 
    FROM activities a
    LEFT JOIN event_categories c ON a.category_id = c.id
    WHERE a.id = ?
  `;
  const regSql = `
    SELECT * FROM event_registrations 
    WHERE activity_id = ? 
    ORDER BY registration_date DESC
  `;
  connection.query(activitySql, [activityId], (err1, activityResult) => {
    if (err1) {
      console.error('Failed to retrieve details of the activity:', err1);
      res.status(500).json({ error: 'Failed to obtain the details of the activity' });
    } else if (activityResult.length === 0) {
      res.status(404).json({ error: 'The activity does not exist.' });
    } else {
      connection.query(regSql, [activityId], (err2, regResult) => {
        if (err2) {
          console.error('Failed to query the registration record:', err2);
          res.status(500).json({ error: 'Failed to obtain the registration record' });
        } else {
          res.json({
            activity: activityResult[0],
            registrations: regResult
          });
        }
      });
    }
  });
});

app.post('/api/registrations', (req, res) => {
  const { activity_id, user_name, user_email, phone, ticket_quantity } = req.body;
  if (!activity_id || !user_name || !user_email || !ticket_quantity) {
    return res.status(400).json({ success: false, message: 'Please fill in the required fields.' });
  }

  const sql = `
    INSERT INTO event_registrations 
    (activity_id, user_name, user_email, phone, ticket_quantity)
    VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(
    sql,
    [activity_id, user_name, user_email, phone || null, ticket_quantity],
    (err, results) => {
      if (err) {
        console.error('Registration submission failed：', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({
            success: false,
            message: 'You have already registered for this activity'
          });
        }
        res.status(500).json({ success: false, message: 'Registration failed' });
      } else {
        res.json({ success: true, message: 'Registration successful' });
      }
    }
  );
});

app.get('/api/categories', (req, res) => {
  const sql = 'SELECT * FROM event_categories';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Query classification failed:', err);
      res.status(500).json({ error: 'Failed to obtain the classification list' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/activities', (req, res) => {
  const { title, description, date, location, category_id } = req.body;
  if (!title || !description || !date || !location || !category_id) {
    return res.status(400).json({ error: 'Please fill in the required fields.' });
  }

  const sql = `
    INSERT INTO activities 
    (title, description, date, location, category_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(
    sql,
    [title, description, date, location, category_id],
    (err, results) => {
      if (err) {
        console.error('New activity failed:', err);
        res.status(500).json({ error: 'The activity creation failed.' });
      } else {
        res.status(201).json({
          id: results.insertId,
          title,
          description,
          date,
          location,
          category_id
        });
      }
    }
  );
});

app.put('/api/activities/:id', (req, res) => {
  const activityId = req.params.id;
  const { title, description, date, location, category_id } = req.body;
  if (!title || !description || !date || !location || !category_id) {
    return res.status(400).json({ error: 'Please fill in the required fields.' });
  }

  const sql = `
    UPDATE activities 
    SET title=?, description=?, date=?, location=?, category_id=?
    WHERE id=?
  `;
  connection.query(
    sql,
    [title, description, date, location, category_id, activityId],
    (err, results) => {
      if (err) {
        console.error('Editing activity failed:', err);
        res.status(500).json({ error: 'Update activity failed' });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: 'The activity does not exist.' });
      } else {
        res.json({
          id: Number(activityId),
          title,
          description,
          date,
          location,
          category_id
        });
      }
    }
  );
});

app.delete('/api/activities/:id', (req, res) => {
  const activityId = req.params.id;
  const sql = 'DELETE FROM activities WHERE id=?';
  connection.query(sql, [activityId], (err, results) => {
    if (err) {
      console.error('Deletion of the activity failed:', err);
      res.status(500).json({ success: false, message: 'Deletion of the activity failed' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'The activity does not exist.' });
    } else {
      res.json({ success: true, message: 'The activity has been deleted.' });
    }
  });
});

app.delete('/api/registrations/:id', (req, res) => {
  const registrationId = req.params.id;
  const sql = 'DELETE FROM event_registrations WHERE id=?';
  connection.query(sql, [registrationId], (err, results) => {
    if (err) {
      console.error('Failed to delete registration record:', err);
      res.status(500).json({ success: false, message: 'Failed to delete the registration record' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Registration record does not exist.' });
    } else {
      res.json({ success: true, message: 'Registration record has been deleted.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`The backend API server is running on http://localhost:${PORT}`);
});