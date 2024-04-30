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
        li.onclick = function() {
            document.getElementById('title').value = title;
            document.getElementById('content').value = content;
            document.getElementById('tags').value = tags;
        }
    
        ul.appendChild(li);
    }
}
 