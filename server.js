
// Requiring modules and helpers, setting the port, and initializing the express app.
const express = require('express');
const path = require('path');
// npm package for generating a unique ID when the user submits a POST request.
const {Random, MersenneTwister19937} = require('random-js');
const { readFromFile, writeToFile, readAndAppend } = require('./helpers/fsUtils.js');
const PORT = process.env.port || 3001;
const app = express();


// Setting up the middleware which will allow us to (in order of the lines of code) parse incoming JSON requests; parse incoming URL-encoded data; serve static assets from the 'public' directory.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// When a GET request to the root path is recieved, the index.html will be displayed.
app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/pages/index.html'))
);


// When a GET request to the '/notes' endpoint is received, the notes.html will be displayed.
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/pages/notes.html'))
);


// When a GET request to the '/api/notes' endpoint is received, the db.json file will be read and all saved notes will be returned as JSON.
app.get('/api/notes', (req, res) => {
    console.info('GET request recieved for notes.');
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});


// If a GET request is received to an endpoint that no route has been defined for, the index.html home page will be displayed.
app.get('*', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/pages/index.html'))
);


// When a POST request to the '/api/notes' endpoint is received, assuming the request body includes a title and text, a 6-digit-max id for the note will be randomly generated and the title, text, and id will be appended into db.json. If the title and text were present, and no errors were encountered in the readAndAppend function, a successful response will be returned. 
app.post('/api/notes', (req, res) => {
    console.info('Request received to POST to notes.');
    const { title, text } = req.body;
    
    if (title && text) {
        // The below line creates an instance of random-js's Random function with the MersenneTwister19937 engine. The integer method will be used to generate a random number in the range [1, 999999].
        const random = new Random(MersenneTwister19937.autoSeed());
        const newNote = {
            title, 
            text, 
            id: random.integer(1, 999999)
        }
        
        // Helper function readAndAppend will read db.json, parse the data, push newNote into the parsed JSON, and write all of the data to db.json.
        readAndAppend(newNote, './db/db.json');

        const response = {
            status: 'success', 
            body: newNote,
        };

        res.json(response);
    } else {
        res.json('Sorry, there was an error in posting a new note.');
    }
});


// If a delete request is received to the '/api/notes/:id' endpoint, db.json will be read and parsed, and the filter method will be used to return only all of the notes except for the note that was requested for deletion. The remaining notes will be written to db.json and a json response message will be sent.
app.delete('/api/notes/:id', (req, res) => {
    readFromFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            const parsedJSON = JSON.parse(data);
            let paramId = req.params.id;
            const newJSON = parsedJSON.filter(function(obj) {
                let returnValue = (obj.id == paramId) ? false: true;
                return returnValue;
            });
            writeRemainingNotes(newJSON);
        }
    });

    function writeRemainingNotes(newJSON) {
        writeToFile('./db/db.json', newJSON);
    }

    // If the user deletes a note by clicking on it in the browser, they will see that the note has been deleted. If the user deletes a note by sending a successful DELETE request to the /api/notes/:id endpoint in Insomnia, they will see the below JSON response.
    res.json(`Request to delete a note (note id ${req.params.id}) was received, and the note has been deleted.`);
});
    

// The below line starts the server and instructs the app to listen on the correct port.
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
