const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
}));

const saltRounds = 10;

mongoose.connect("mongodb://0.0.0.0:27017/userDB");

const userSchema = new mongoose.Schema ({
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
    const userName = req.body.username;
    const userPass = req.body.password;

    User.findOne({ email: userName }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(userPass, foundUser.password, (err, result) => {
                    const errMsg = `Password ${userPass} incorrect for ${userName}, err: ${err}`;
                    result ? res.render("secrets") : console.log(errMsg);
                });
            } else {
                console.log(`Username ${userName} not found`);
            }
        }
    });
});


app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        } else {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save((err) => {
                err ? console.log(err) : res.render("secrets");
            });
        }
    });
});


app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
