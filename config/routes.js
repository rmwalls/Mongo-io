// This file handles the routes for the Articles
// DEPENDENCIES
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var logger = require("morgan");
console.log("line 10 routes.js")


// If deployed, use the deployed database. Otherwise use the local database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articlescraper";
//mongoose.connect(MONGODB_URI);
mongoose.connect("mongodb://localhost/articlescraper", { useNewUrlParser: true });

// Database configuration
var databaseUrl = "articlescraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
  db.on("error", function(error) {
  console.log("Database Error:", error);
});

//articles array to get items from
//var articles = [];

module.exports = function(app) {
    // Default route 
    app.get("/", function(req, res) {
        res.render("onionScraping");
    });
  
  // Retrieve data from the db -
  app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function(error, found) {
      // Throw any errors to the console
      if (error) { 
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        res.json(found);
        console.log("data returned from db");
      }
    });
  });
  
  // Scrape data from one site and place it into the mongodb db
  app.get("/scrape", function(req, res) {
    axios.get("https://www.theonion.com/c/news-in-brief").then(function(response) {
      // Load the html body from axios into cheerio
      console.log("inside axios.get");
      var $ = cheerio.load(response.data);
        // For each element with the class used
        $("article").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element"
        // start with empty result object
        var result = {};
        console.log("result = " + result);
        var headline = $(element).find("h1").text();
        var url = $(element).find("a").last().attr("href");
        var img = $('img').attr("srcset");
          console.log("scraped stuff " + "HEADLINE: " + headline + " STORY URL: " + url + " IMAGE: " + img);
        // If this found element had both a title and a link
        if (headline && url) {
          // Insert the data in the scrapedData db
          db.scrapedData.save({
            Headline: headline,
            URL: url,
            created: Date.now()
          },
          function(err, inserted) {
            if (err) {
              // Log the error if one is encountered during the query
              console.log("error is " + err);
            }
            else {
              // Otherwise, log the inserted data
              console.log("data inserted into DB" + inserted);
            }
          });
        }
      });
    });
  
    // Send a "Scrape Complete" message to the browser
    res.send("Scrape could be Complete");
  });
}