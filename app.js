const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use('view-engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));









app.listen(3000, ()=> {
    console.log("Server started on port 3000.");
});
