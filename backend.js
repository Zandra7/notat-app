const expressModul = require('express')
const pathModul = require('path')
const sqliteModul = require('sqlite3').verbose()

const app = expressModul()
const port = 3000 // portnummeret serveren skal kjøre på


// legger til nytt notat i databasen
function insert_note(request, response) {
    const { title, content, tags } = request.body;
    const created = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    let changed = created;
    const sql = `INSERT INTO Notes (title, content, tags, created, changed) VALUES (?, ?, ?, ?, ?)`;

    database.run(sql, [title, content, tags, created, changed], function(error) {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json({ message: 'Notat lagt til i databasen' });
    });
}

// oppdaterer eksisterende notat i databasen
function update_note(request, response) {
    const { title, content, tags } = request.body;
    const changed = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    const sql = `UPDATE Notes SET content = ?, tags = ?, changed = ? WHERE title = ?`;

    database.run(sql, [content, tags, changed, title], function(error) {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json({ message: 'Notat oppdatert' });
    });
}

// eksporterer funksjonene slik at de kan testes
module.exports = { insert_note, update_note };

app.use(expressModul.json()) // tolke forespørsler som json
app.use(expressModul.static(__dirname)) // hoste static filer

// hente database
let database = new sqliteModul.Database("database.db", function(error){
    if(error){
        console.error(error.message) // viser error om det er noe galt
    } else {
        console.log("Database funnet") // skriver i konsollen at databasen er funnet
    }
})

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname, 'index.html')) // sender deg til index.html
})

app.post('/insert-note', insert_note);

app.put('/update-note', update_note);

// hente notater fra databasen
app.get('/get-notes', (request, response) => {
    const sql = `SELECT * FROM Notes`;

    database.all(sql, [], (error, rows) => {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json(rows);
    });
});

app.post('/import-note', (request, response) => {
    const { title, content, tags, created, changed } = request.body;
    const sql = `INSERT INTO Notes (title, content, tags, created, changed) VALUES (?, ?, ?, ?, ?)`;

    database.run(sql, [title, content, tags, created, changed], function(error) {
        if (error) {
            response.status(500).json({ error: error.message });
            return;
        }
        response.json({ message: 'Notat lagt til i databasen' });
    });

})

if (require.main === module) {   
    app.listen(port, () => {
        console.log(`Server kjører på http://localhost:${port}`);
    });
}