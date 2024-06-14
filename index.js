require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());



app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

app.use(express.static(path.join(__dirname, "public")));

//set template engine
app.set("view engine", "ejs");

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database!"));

// app.get("/", (req, res) => {
//   res.send("Hello Jhelum");
// });
// Route for root URL - Renders login page
// app.get("/login", (req, res) => {
//   // Render the home page view here
//   res.redirect("/index");
// });

//route prefix
app.use("", require("./routes/routes"));

// ---------------------------------------------

// ---------------------------------------------

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
