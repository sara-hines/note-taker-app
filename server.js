const express = require("express");
const path = require("path");
// npm package for generating a unique ID when the user submits a POST request
const {Random, MersenneTwister19937} = require("random-js");

const { readFromFile, readAndAppend } = require("./helpers/fsUtils.js");

// const api = require("./routes/index.js")

const PORT = process.env.port || 3001;

const app = express();

// app.use(Random);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api", api);

app.use(express.static("public"));

app.get("/", (req, res) => 
    res.sendFile(path.join(__dirname, "/public/pages/index.html"))
);

app.get("/notes", (req, res) => 
    res.sendFile(path.join(__dirname, "/public/pages/notes.html"))
);

app.get("/api/notes", (req, res) => {
    // read the `db.json` file and return all saved notes as JSON
    console.info(`GET request recieved for notes`)
    readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

app.get("*", (req, res) => 
    res.sendFile(path.join(__dirname, "/public/pages/index.html"))
);

// Referencing DU-VIRT-FSF-PT-12-2023-U-LOLC\11-Express\01-Activities\22-Stu_Modular-Routing
app.post("/api/notes", (req, res) => {
    console.info(`Request received to POST to notes`)

    const { title, text } = req.body;
    if (title && text) {
        const random = new Random(MersenneTwister19937.autoSeed());
        const newNote = {
            title, 
            text, 
            id: random.integer(1, 999999)
        }

        readAndAppend(newNote, "./db/db.json")

        const response = {
            status: "success", 
            body: newNote,
        };

        res.json(response);
    } else {
        res.json("We're sorry, there was an error in posting a new note.")
    }
});

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
