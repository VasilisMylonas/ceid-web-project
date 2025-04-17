const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

// const pool = new Pool({
//     user: 'thesis_user',
//     host: 'localhost',
//     database: 'thesis_management',
//     password: 'thesis_password',
//     port: 5432,
// });

// async function resetDatabase() {
//     console.log('Resetting database...');

//     try {
//         // Read schema file
//         const schemaPath = path.join(__dirname, 'schema.sql');
//         const schema = fs.readFileSync(schemaPath, 'utf8');

//         // Execute schema commands
//         await pool.query(schema);

//         console.log('Database reset successful!');
//     } catch (error) {
//         console.error('Error resetting database:', error);
//     }
// }

// resetDatabase();

// Test database connection
// pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//         console.error('Database connection error:', err);
//     } else {
//         console.log('Connected to PostgreSQL database at:', res.rows[0].now);
//     }
// });



/*

1) Topic Management
GET /api/topics (view all topics)
POST /api/topics (create topic)
GET /api/topics/:id (view topic)
PUT /api/topics/:id (update topic)
DELETE /api/topics/:id (delete topic)

2) Topic assignment to student
POST /api/topics/:id/assign (assign topic to student)
POST /api/topics/:id/unassign (unassign topic from student)
POST /api/topics/:id/finalize (finalize topic)

3) Theses management
GET /api/theses (view all thesis)
GET /api/theses/:id  (view thesis)
POST /api/theses (create thesis)
PUT /api/theses/:id (update thesis)
POST /api/theses/:id/notes (add notes)
GET /api/theses/:id/notes (view notes)
POST /api/theses/:id/submit (submit thesis)
POST /api/theses/:id/cancel (cancel thesis)
POST /api/theses/:id/approve (approve thesis)
POST /api/theses/:id/reject (reject thesis)

4)
GET /api/invitations (view all invitations)
POST /api/invitations/:id/accept (accept invitation)
POST /api/invitations/:id/reject (reject invitation)

5)
GET /api/statistics (view statistics)







*/

// Example route
app.get('/', (req, res) => {
    res.send('Hello from Node.js backend!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
