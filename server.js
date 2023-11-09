const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3000;

app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use(express.json());

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/public/index.html");
  res.sendFile(filePath);
});

app.get("/notes", (req, res) => {
  const filePath = path.join(__dirname, "/public/notes.html");
  res.sendFile(filePath);
});

app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const notes = JSON.parse(data);
      res.json(notes);
    }
  });
});

app.post("/api/notes", (req, res) => {
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    const existingData = JSON.parse(data);

    existingData.push(newNote);

    fs.writeFile(
      path.join(__dirname, "db/db.json"),
      JSON.stringify(existingData),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing to db.json:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }

        res.json(newNote);
      }
    );
  });
});

app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading db.json:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    let existingData = JSON.parse(data);

    const noteIndex = existingData.findIndex((note) => note.id === noteId);

    if (noteIndex === -1) {
      res.status(404).json({ error: "Note not found" });
    } else {
      existingData.splice(noteIndex, 1);

      fs.writeFile(
        path.join(__dirname, "db/db.json"),
        JSON.stringify(existingData, null, 2),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing to db.json:", err);
            res.status(500).json({ error: "Internal Server Error" });
            return;
          }

          res.json({ message: "Note deleted successfully" });
        }
      );
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
