function saveNote() {
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

    // save title of note as a list item
    const ul = document.getElementById('prev-notes');
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(title));
    ul.appendChild(li);
}
 