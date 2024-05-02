const expressModul = require('express')
const pathModul = require('path')
const sqliteModul = require('sqlite3').verbose()

const app = expressModul()
const port = 3000 // portnummeret serveren skal kjøre på

app.use(expressModul.json()) // tolke forespørsler som json
app.use(expressModul.static(__dirname)) // hoste static filer

// hente database
let database = new sqliteModul.Database("db.db", function (error) {
    if (error) {
        console.error(error.message) // viser error om det er noe galt
    } else {
        console.log("Database funnet") // skriver i konsollen at databasen er funnet
    }
})

// lage tabell i databasen
database.run(`CREATE TABLE IF NOT EXISTS Notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    created TEXT NOT NULL,
    changed TEXT NOT NULL
)`);

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html')) // sender deg til index.html
})

app.post('/add-note', (request, response) => {
    const { title, content } = request.body;
    let { tags } = request.body;
    const created = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    let changed = created;
    tags = JSON.stringify(tags);
    const sql = `INSERT INTO Notes (title, content, tags, created, changed) VALUES (?, ?, ?, ?, ?)`;

    database.run(sql, [title, content, tags, created, changed], function (error) {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json({ message: 'Notat lagt til i databasen' });
    });
});


// hente notater med id og navn fra databasen
app.get('/notes-list', (request, response) => {
    const sql = `SELECT id, title FROM Notes`;

    database.all(sql, [], (error, rows) => {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json(rows);
    });
});

// hente notat med id fra databasen
app.get('/note/:id', (request, response) => {
    const sql = `SELECT * FROM Notes WHERE id = ?`;

    database.get(sql, [request.params.id], (error, row) => {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        // konverterer tags tilbake til JSON
        try {
            row.tags = JSON.parse(row.tags);
        } catch (e) {
            row.tags = [];
        }
        response.json(row);
    });
});

app.listen(port, () => {
    console.log(`Server kjører på http://localhost:${port}`);
});
