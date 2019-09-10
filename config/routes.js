// This file handles the routes for the Articles
// DEPENDENCIES
const express = require("express");
// const mongojs = require("mongojs");
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const logger = require("morgan");
console.log("line 10 routes.js")


// // Database configuration
// const databaseUrl = "articlescraper";
// const collections = ["scrapedData"];

// // Hook mongojs configuration to the db constiable
// const db = mongojs(databaseUrl, collections);
//   db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// If deployed, use the deployed database. Otherwise use the local database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/articlescraper";
//mongoose.connect(MONGODB_URI);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const db = require('../models');

// ROUTES +++++++++++++++++++++++++++++++++++++++++

module.exports = function(app) {
  // Default route, display what's in the database
  app.get("/", function(req, res) {
    // Retrieve articles from db
    db.Article.find({}, function(err, result) {
      var hbsObj =
      res.render("onionScraping", { scrapedData: result })
      console.log("data returned from db");
    }); //end find
  
//Route for getting a specific article by id and corresponding note
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({
          _id: req.params.id
      })
      .populate("note")
      .then(function (dbArticle) {
          res.json(dbArticle)
      })
      .catch(function (err) {
          res.json(err);
      });
});

//Route for saving/updating an article to be saved
app.post("/saved/:id", function (req, res) {
  db.Article
      .findByIdAndUpdate({
          _id: req.params.id
      }, {
          isSaved: true
      })
      .then(function (dbArticle) {
          res.json(dbArticle);
          console.log(dbArticle)
      })
      .catch(function (err) {
          res.json(err);
      });
});

//Route for Unsaving/updating an article to be saved
app.post("/Unsaved/:id", function (req, res) {
  db.Article
      .findByIdAndUpdate({
          _id: req.params.id
      }, {
          isSaved: false
      })
      .then(function (dbArticle) {
          res.json(dbArticle);
          console.log(dbArticle)
      })
      .catch(function (err) {
          res.json(err);
      });
});


//Route for saving/updating an articles note
app.post("/savedNote/:id", function (req, res) {
  db.Note.create(req.body)
      .then(function (dbNote) {
          return db.Article.findOneAndUpdate({
              _id: req.params.id
          }, {
              note: dbNote._id
          }, {
              new: true
          });
      })
      .then(function (dbArticle) {
          res.json(dbArticle);
      })
      .catch(function (err) {
          res.json(err);
      })
})

//Route for getting saved article
app.get("/savedArticles", function (req, res) {
  db.Article.find({
      "isSaved": true
  }, function (error, data) {
      var hbsObject = {
          article: data
      };
      console.log(hbsObject);
      res.render("saved", hbsObject);
  });
});

//Route for deleting/updating saved article
app.put("/delete/:id", function (req, res) {
  db.Article
      .findByIdAndUpdate({
          _id: req.params.id
      }, {
          $set: {
              isSaved: false
          }
      })
      .then(function (dbArticle) {
          res.json(dbArticle);
      })
      .catch(function (err) {
          res.json(err);
      });
});

  // Scrape data from The Onion and save it into the mongo db
  app.get("/newscrape", function(req, res) {
    axios.get("https://www.theonion.com/c/news-in-brief").then(function(response) {
      console.log("inside axios.get");
      const $ = cheerio.load(response.data); // Load the html body from axios into cheerio

      // Save the headline and href of each article
      $("article").each(function(i, element) { 
        const result = {}; // start with empty result object
        const headline = $(element).find("h1").text();
        const url = $(element).find("a").last().attr("href");
        //const img = $(element).find('img').attr("srcset");
        //const str = img;
        //const words = str.split(' ');
        //console.log(words[0]);
        const articles = [];

        console.log("scraped stuff " + "HEADLINE: " + headline + " STORY URL: " + url);
        // If this found element had both a title and a link
        if (headline && url) {
          // Insert the data in the scrapedData db
          db.Article.save({
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
              articles.push(inserted);
              console.log("data inserted into DB" + inserted);
            }
          });
        } // end top if
      });
      res.render("newscrape", {
        scrapedData: articles
      });
    });  //end axios get
  
    // Send a "Scrape Complete" message to the console
    console.log ("Scrape could be Complete");
  }) //end of scrape route


  //Saved article route
  app.get("/saved", function(req, res) {
    res.render("saved");
})
})
}