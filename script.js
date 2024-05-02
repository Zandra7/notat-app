function saveNote() {
    if (document.getElementById('title').value === '' || document.getElementById('content').value === '') {
        alert('Title and content must be filled out');
        return;
    } else {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tags = document.getElementById('tags').value;

        fetch('/add-note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content, tags })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Tømmer input-feltene
            document.getElementById('title').value = '';
            document.getElementById('content').value = '';
            document.getElementById('tags').value = '';
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

        // klikke på li for å vise notatet i input-feltene fra databasen
        li.onclick = function() {
            fetch('/get-notes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                const note = data.find(note => note.Title === title);
                console.log('Note:', note);
                if (note) {
                    document.getElementById('title').value = note.Title;
                    document.getElementById('content').value = note.Content;
                    document.getElementById('tags').value = note.Tags;
                } else {
                    console.log('No note found with title:', title);
                }
            })
            .catch((error) => {
                console.error('Error accessing notes:', error);
            });
        }
    }
}

// Lagre notatet som en JSON-fil
function exportNote() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = document.getElementById('tags').value;
    const created = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    const changed = created;
    const note = { title, content, tags, created, changed };
    const data = JSON.stringify(note);
    const filename = title + '.json';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href= url;
    a.download = filename;
    a.click();
}
