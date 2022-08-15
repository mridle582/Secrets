require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: false
}));

const saltRounds = 10;

mongoose.connect("mongodb://0.0.0.0:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res) => {
    res.render("home");
});


app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/register", (req, res) => {
    res.render("register");
});


app.post("/login", (req, res) => {
});


app.post("/register", (req, res) => {
});


app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
