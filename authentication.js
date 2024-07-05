// authentication.js (assuming you've named the file like this)
const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const mongodb = require("mongodb");

const app = express();

let db;

MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      console.error("Error connecting to MongoDB:", err);
      return;
    }
    console.log("Connected to MongoDB");
    db = client.db(dbName);
  }
);

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Sign Up Route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store the user in the database
  await db
    .collection("login_credentials")
    .insertOne({ email, password: hashedPassword });

  res.send("Signed up successfully!");
});

// Sign In Route
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Find the user in the database
  const user = await db.collection("login_credentials").findOne({ email });

  if (user) {
    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Redirect to a new page after successful sign in
      res.redirect("/index");
    } else {
      res.send("Incorrect email or password");
    }
  } else {
    res.send("User not found");
  }
});

// Dashboard Route
app.get("/index", (req, res) => {
  res.render("index");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
