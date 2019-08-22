// This file handles the routes for the Articles
// DEPENDENCIES
const express = require("express");
const mongojs = require("mongojs");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const logger = require("morgan");
console.log("line 10 routes.js")


// If deployed, use the deployed database. Otherwise use the local database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articlescraper";
//mongoose.connect(MONGODB_URI);
mongoose.connect("mongodb://localhost/articlescraper", { useNewUrlParser: true });

// Database configuration
const databaseUrl = "articlescraper";
const collections = ["scrapedData"];

// Hook mongojs configuration to the db constiable
const db = mongojs(databaseUrl, collections);
  db.on("error", function(error) {
  console.log("Database Error:", error);
});

module.exports = function(app) {
    // Default route 
    app.get("/", function(req, res) {
      // Retrieve articles from db
      db.scrapedData.find({}, function(err, scrapedData) {
        var hbsObj = {scrapedData};
      res.render("onionScraping", hbsObj)
      console.log("data returned from db");
    });
  
  // Scrape data from The Onion and save it into the mongo db
  app.get("/scrape", function(req, res) {
    axios.get("https://www.theonion.com/c/news-in-brief").then(function(response) {
      console.log("inside axios.get");
      const $ = cheerio.load(response.data); // Load the html body from axios into cheerio

      // Save the headline and href of each article
      $("article").each(function(i, element) { 
        const result = {}; // start with empty result object
        const headline = $(element).find("h1").text();
        const url = $(element).find("a").last().attr("href");
        const img = $('img').attr("srcset");
        const str = img;
        const words = str.split(' ');
        console.log(words[0]);

        //console.log("scraped stuff " + "HEADLINE: " + headline + " STORY URL: " + url + " IMAGE: " + img);
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
  })})}