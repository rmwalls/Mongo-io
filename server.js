//8/24/19 homework
// DEPENDENCIES
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var logger = require("morgan");

// Import the routes
require("./config/routes.js")

// Initialize Express
var app = express();
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function(req, res) {
  res.render("onionScraping");
})


// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);
//mongoose.connect({ useNewUrlParser: true });

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
  db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000");
});