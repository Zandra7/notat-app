function addTagOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
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

function saveNote() {
    if (document.getElementById('title').value === '' || document.getElementById('content').value === '') {
        alert('Title and content must be filled out');
        return;
    }

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = Array.from(document.getElementById('current-tags').children).map(li => li.textContent.replace('x', ''));

    fetch('/add-note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            updateNotesList();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to save note. Please try again.');
        });
}

function updateNotesList() {
    fetch('/notes-list', {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            const ul = document.getElementById('prev-notes');
            ul.innerHTML = '';
            data.forEach(note => {
                const li = document.createElement('li');
                li.appendChild(document.createTextNode(note.title));
                li.classList.add('prev-note');
                li.onclick = () => loadNoteDetails(note.id);
                ul.appendChild(li);
            });
        })
        .catch((error) => {
            console.error('Error fetching notes:', error);
        });
}

function loadNoteDetails(id) {
    fetch(`/note/${id}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(note => {
            document.getElementById('title').value = note.title;
            document.getElementById('content').value = note.content;
            const currentTags = document.getElementById('current-tags');
            currentTags.innerHTML = '';
            note.tags.forEach(tag => {
                const li = document.createElement('li');
                li.textContent = tag;
                const span = document.createElement('span');
                span.textContent = 'x';
                span.onclick = function () {
                    currentTags.removeChild(li);
                };
                li.appendChild(span);
                currentTags.appendChild(li);
            });
        })
        .catch((error) => {
            console.error('Error fetching note details:', error);
        });
}

// Lagre notatet som en JSON-fil
function exportNote() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = document.getElementById('tags').value.split(',');
    const created = new Date().toLocaleString('no-NB', { timeZone: 'Europe/Oslo' });
    const changed = created;
    const note = { title, content, tags, created, changed };
    const data = JSON.stringify(note);
    const filename = title.replace(/ /g, '_') + '.json'; // Filenavn sanitering for mellomrom
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

updateNotesList();