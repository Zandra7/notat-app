const backend = require('./backend.js')

// kaller på insert_note funksjonen for å teste å sette inn et notat
backend.insert_note({
    body: {
        title: 'Test Note',
        content: 'This is a test note.',
        tags: 'test'
    }
}, {
    json: (data) => {
        console.log('Test 1 OK:', data)
    },
    status: (code) => {
        console.log('Test 1 failed:', code)
        return {
            json: (data) => {
                console.log('Test failed json data:', data)
            }
        }
    }
})

// Kaller på update_note funksjonen for å teste å oppdatere et notat
backend.update_note({
    body: {
        title: 'Test Note',
        content: 'This is an updated test note.',
        tags: 'test',
        changed: new Date().toISOString()
    }
}, {
    json: (data) => {
        console.log('Test 2 OK:', data)
    },
    status: (code) => {
        console.log('Test 2 failed:', code)
        return {
            json: (data) => {
                console.log('Test failed json data:', data)
            }
        }
    }
})
