const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config({ path: "./.env" });

const app = express();

// Loading Routes
const notes = require("./routes/notes");
const users = require("./routes/users");

// Passport config
require("./config/passport")(passport);

// Map global promise
mongoose.Promise = global.Promise;

//Connecting to the database
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected!!"))
  .catch(err => console.error(err));

// Handlebars = middleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Body Parser MiddleWare
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder set up
app.use(express.static(path.join(__dirname, "public")));

/// method override middleware
app.use(methodOverride("_method"));

// Sessions middleware
app.use(
  session({
    secret: "millord",
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Index page
app.get("/", (req, res) => {
  res.render("index");
});
// About page
app.get("/about", (req, res) => {
  res.render("about");
});

// Routes for the app
app.use("/notes", notes);
app.use("/users", users);

// CREATING THE SERVER
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running successfully on port ${port}...`);
});
