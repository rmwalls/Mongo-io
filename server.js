//8/24/19 homework
// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var axios = require("axios");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var logger = require("morgan");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
  db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Default route  - Works
  app.get("/", function(req, res) {
  res.send("Hey Y'all");
  console.log("default route");
});

// Retrieve data from the db - Works
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
  axios.get("https://www.theonion.com/").then(function(response) {
    // Load the html body from axios into cheerio
    console.log("inside axios.get");
    var $ = cheerio.load(response.data);
      // For each element with the class used
      $(".cw4lnv-5").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var headline = $(element).children("a").text();
      console.log("headline = " + headline);
      var url = $(element).children("a").attr("href");
      //var img = $(element).children("a").attr("srcset");
      //var img = $(element).children("a").find("img").attr("srcset");
      //var img = $(element).find("a").find("img").attr("srcset").split(",")[0].split(" ")[0];
        console.log("scraped stuff " + "HEADLINE: " + headline + " STORY URL: " + url);
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
  res.send("Scrape Complete");
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});