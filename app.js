const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://0.0.0.0:27017/userDB");

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, { secret: process.env.ENCRYPT_SECRET, encryptedFields: ["password"] });

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
    const userPass = md5(req.body.password);

    User.findOne({ email: userName }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === userPass) {
                    res.render("secrets");
                } else {
                    console.log("Wrong Password.");
                }
            }
        }
    });
});


app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save((err) => {
        err ? console.log(err) : res.render("secrets");
    });
});


app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
