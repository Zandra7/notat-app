let allNotes = [];

class Note {
    constructor(title, content, tags, created, changed) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        if (created) {
            this.created = created;
        } else {
            this.created = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
        }
        this.changed = changed || this.created;
    }
    // function to change the content of the note
    updateNote(newContent, newTags) {
        this.content = newContent;
        this.tags = newTags;
        this.changed = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    }
}

function addTagOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        console.log('Enter pressed');
        addTag();
    }
}

// Oppdaterer det som er synlig på nettsiden
function addTag() {
    const tagInput = document.getElementById('tags');
    const currentTags = document.getElementById('current-tags');
    let tag = tagInput.value.trim();
    if (tag) {
        // Legg til # prefix hvis brukeren ikke har gjort det
        if (!tag.startsWith('#')) {
            tag = '#' + tag;
        }
        const li = document.createElement('li');
        li.textContent = tag;
        // Lagrer taggen i en data-atributt for å ikke få med 'x'
        li.setAttribute('data-tag', tag);
        const span = document.createElement('span');
        span.textContent = 'x';
        span.onclick = function () {
            currentTags.removeChild(li);
        };
        li.appendChild(span);
        currentTags.appendChild(li);
        tagInput.value = '';
    }
}

function insertNoteInDB(note) {
    fetch('/insert-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function updateNoteInDB(note) {
    fetch('/update-note', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function clearInputFields() {
    // Tømmer input-feltene og tag-listen
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('tags').value = '';
    document.getElementById('current-tags').innerHTML = '';
    document.getElementById('date').style.display = 'none';
}

// denne funksjonen kalles fra GUI når brukeren ønsker å lagre et nytt notat eller eksisterende notat
function saveNote() {
    if (document.getElementById('title').value === '' || document.getElementById('content').value === '') {
        alert('Title and content must be filled out');
        return;
    } else {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tags = Array.from(document.getElementById('current-tags').children).map(li => li.getAttribute('data-tag')).join(';');

        existingNote = allNotes.find(note => note.title === title);
        if (existingNote) {
            console.log('Note already exists, updating');
            existingNote.updateNote(content, tags);
            updateNoteInDB(existingNote);
        } else {
            console.log('Note does not exist, inserting');
            const newNote = new Note(title, content, tags);
            insertNoteInDB(newNote);
            allNotes.push(newNote); 
            // Lager et nytt li-element og legger det til i listen
            const ul = document.getElementById('prev-notes');
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(title));
            li.classList.add('prev-note')
            ul.appendChild(li);
            // Klikke på li for å vise notatet i input-feltene fra databasen
            li.onclick = function() {
                const note = allNotes.find(note => note.title === title);
                console.log('Note:', note);
                if (note) {
                    showNote(note);
                } else {
                    console.log('No note found with title:', title);
                }
            }
        }
        clearInputFields();
    }
}

// Viser notatet i input-feltene
function showNote(note) {
    document.getElementById('title').value = note.title;
    document.getElementById('content').value = note.content;
    document.getElementById('date').style.display = 'block';
    document.getElementById('created').innerHTML = note.created;
    document.getElementById('modified').innerHTML = note.changed;

    if (note.created === note.changed) {
        document.getElementById('modified-info').style.display = 'none';
    } else {
        document.getElementById('modified-info').style.display = 'block';
    }

    const tags = String(note.tags).split(';');
    const currentTags = document.getElementById('current-tags');
    currentTags.innerHTML = '';
    tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = tag;
        // Lagrer taggen i en data-atributt for å ikke få med 'x'
        li.setAttribute('data-tag', tag);
        const span = document.createElement('span');
        span.textContent = 'x';
        span.onclick = function () {
            currentTags.removeChild(li);
        };
        li.appendChild(span);
        currentTags.appendChild(li);
    });
}

// Lagre notatet som en JSON-fil med tags i 'current-tags'
function exportNote() {
    const title = document.getElementById('title').value;
    const note = allNotes.find(note => note.title === title);
    if (note) {
        const data = JSON.stringify(note);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } else {
        console.log('No note found with title:', title);
    }
}

// Importere notatet fra en JSON-fil
function importNote() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        let importedNote;
        reader.onload = function(event) {
            importedNote = JSON.parse(event.target.result);

            if (allNotes.some(note => note.title === importedNote.title)) {
                alert('Note with title, ' + importedNote.title + ', already exists');
                return;
            }

            fetch('/import-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(importedNote)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Legger til notatet i allNotes for å slippe å hente ut fra databasen
                allNotes.push(importedNote);
                // Lager et nytt li-element og legger det til i listen
                const ul = document.getElementById('prev-notes');
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(importedNote.title));
                li.classList.add('prev-note')
                ul.appendChild(li);
                // Klikke på li for å vise notatet i input-feltene fra databasen
                li.onclick = showNote.bind(null, importedNote);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        }
        reader.readAsText(file);
    }
    input.click();
}

// Når enter klikkes i 'filter-tags' input-feltet
function filterTags(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        console.log('Enter pressed');
        showNotes(document.getElementById('filter-tags').value);
    }
}

function showNotes(filter) {
    // split filter string into array of tags
    filter = filter.split(' ');
    const ul = document.getElementById('prev-notes');
    ul.innerHTML = '';
    allNotes.forEach(note => {
        let matchCount = 0;
        for (let i = 0; i < filter.length; i++) {
            if (String(note.tags).includes(filter[i])) {
                matchCount++;
            }
        }
        if (matchCount === filter.length) {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(note.title));
            li.classList.add('prev-note')
            ul.appendChild(li);
            li.onclick = showNote.bind(null, note);
        }
    });
}

document.getElementById('date').style.display = 'none';
// Henter alle notater fra databasen og lister dem opp under prev-notes
fetch('/get-notes', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    // Legg til hvert notat mottatt fra databasen inn i allNotes som Note-objekter
    data.map(note => {
        allNotes.push(new Note(note.Title, note.Content, note.Tags, note.Created, note.Changed));
    })
    console.log('All notes:', allNotes);
    showNotes('');
});
