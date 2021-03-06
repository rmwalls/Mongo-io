//8/24/19 homework
// DEPENDENCIES
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var logger = require("morgan");


const PORT = process.env.PORT || 3000;


// Initialize Express 
var app = express();
app.use(logger("dev"));

console.log("line 15 server.js");

// express router
var router = express.Router();

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(router);

// Import the routes
require("./config/routes.js")(app);

console.log("line 34 server.js")

// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port " + PORT);
});