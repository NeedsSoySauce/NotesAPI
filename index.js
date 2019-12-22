const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

// Setup express
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
 
// Setup mysql driver
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: 'NotesDB'
});

// Queries
const createNoteQuery = 'INSERT INTO notes (title, description) VALUES (?, ?)';
const getNotesQuery = 'SELECT * FROM notes LIMIT ?';
const getNoteQuery = 'SELECT * FROM notes WHERE id=?';
const updateNoteQuery = 'UPDATE notes SET title=?, description=? WHERE id=?';
const deleteNoteQuery = 'DELETE FROM notes WHERE id=?';

// Create a note
app.post('/notes', async (req, res) => {
    let title = req.body.title;
    let description = req.body.description || "";
    pool.query(createNoteQuery, [title, description], (error, results, fields) => res.send(results));
})

// Get notes
app.get('/notes/:id?', async (req, res) => {
    let id = req.params.id;
    if (id) {
        pool.query(getNoteQuery, [id], (error, results, fields) => res.send(results));
    } else {
        let limit = isNaN(req.query.limit) ? 10 : Number.parseInt(req.query.limit);
        pool.query(getNotesQuery, [limit], (error, results, fields) => res.send(results));
    }
});

// Update a note
app.put('/notes/:id', async (req, res) => {
    let id = req.params.id;
    let title = req.body.title;
    let description = req.body.description || "";
    pool.query(updateNoteQuery, [title, description, id], (error, results, fields) => res.send(results));
})

// Delete a note
app.delete('/notes/:id', async (req, res) => {
    let id = req.params.id;
    pool.query(deleteNoteQuery, [id], (error, results, fields) => res.send(results));
})

// Start the server
const server = app.listen(port, 'localhost', function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Listening at ${host}:${port}`);
})

// Close database connections before exiting
function onExit() {
    pool.end();
}

process.on('exit', onExit);
process.on('SIGINT', process.exit);