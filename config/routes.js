// This file handles the routes for the Articles
// DEPENDENCIES
var express = require("express");
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");

// Initialize Express
//var app = express();

//articles array to get items from
var articles = [];

module.exports=function(app){
    // Default route  - if no index file. Works
    app.get("/", function(req, res) {
        res.send("Hey Y'all");
        console.log("default route");
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
        //var img = $(element).children("a").attr("srcset");
        //var img = $(element).children("a").find("img").attr("srcset");
        var img = $(element).find("img").attr("srcset");
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