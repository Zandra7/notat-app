let allNotes = [];

function addTagOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        console.log('Enter pressed');
        addTag();
    }
}

function addTag() {
    const tagInput = document.getElementById('tags');
    const currentTags = document.getElementById('current-tags');
    const tag = tagInput.value.trim();
    if (tag) {
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

function insertNote() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    // Lager en string av tags separert med semikolon
    const tags = Array.from(document.getElementById('current-tags').children).map(li => li.getAttribute('data-tag')).join(';');
    console.log('tags:', tags);
    fetch('/insert-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Tømmer input-feltene og tag-listen
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('tags').value = '';
        document.getElementById('current-tags').innerHTML = '';
        // Legger til notatet i allNotes for å slippe å hente ut fra databasen
        allNotes.push({ Title: title, Content: content, Tags: tags });
    })
    .catch((error) => {
        console.error('Error:', error);
    });
    // Lager et nytt li-element og legger det til i listen
    const ul = document.getElementById('prev-notes');
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(title));
    li.classList.add('prev-note')
    ul.appendChild(li);
    // Klikke på li for å vise notatet i input-feltene fra databasen
    li.onclick = function() {
        const note = allNotes.find(note => note.Title === title);
        console.log('Note:', note);
        if (note) {
            showNote(note);
        } else {
            console.log('No note found with title:', title);
        }
    }
}

function updateNote() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = Array.from(document.getElementById('current-tags').children).map(li => li.getAttribute('data-tag')).join(';');
    fetch('/update-note', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Tømmer input-feltene og tag-listen
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('tags').value = '';
        document.getElementById('current-tags').innerHTML = '';
        // Oppdaterer notatet i allNotes
        const note = allNotes.find(note => note.Title === title);
        if (note) {
            note.Content = content;
            note.Tags = tags;
        } else {
            console.log('No note found with title:', title);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function saveNote() {
    if (document.getElementById('title').value === '' || document.getElementById('content').value === '') {
        alert('Title and content must be filled out');
        return;
    } else {  
        if (allNotes.some(note => note.Title === document.getElementById('title').value)) {
            console.log('Note already exists, updating');
            updateNote();
        } else {
            console.log('Note does not exist, inserting');
            insertNote(); 
        }
    }
}

function showNote(note) {
    document.getElementById('title').value = note.Title;
    document.getElementById('content').value = note.Content;
    const tags = String(note.Tags).split(';');
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
    const note = allNotes.find(note => note.Title === title);
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

            if (allNotes.some(note => note.Title === importedNote.Title)) {
                alert('Note with title, ' + importedNote.Title + ', already exists');
                return;
            }

            fetch('/import-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({title:importedNote.Title, content:importedNote.Content, tags:importedNote.Tags, created:importedNote.Created, changed:importedNote.Changed})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                // Legger til notatet i allNotes for å slippe å hente ut fra databasen
                allNotes.push(importedNote);
                // Lager et nytt li-element og legger det til i listen
                const ul = document.getElementById('prev-notes');
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(importedNote.Title));
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
            if (note.Tags.includes(filter[i])) {
                matchCount++;
            }
        }
        if (matchCount === filter.length) {
            const li = document.createElement('li');
            li.appendChild(document.createTextNode(note.Title));
            li.classList.add('prev-note')
            ul.appendChild(li);
            li.onclick = showNote.bind(null, note);
        }
    });
}

// Henter alle notater fra databasen og lister dem opp under prev-notes
fetch('/get-notes', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
.then(response => response.json())
.then(data => {
    allNotes = data;
    console.log('All notes:', allNotes);
    showNotes('');
});