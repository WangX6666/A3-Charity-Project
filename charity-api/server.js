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

app.listen(PORT, () => {
  console.log(`The backend API server is running on http://localhost:${PORT}`);
});