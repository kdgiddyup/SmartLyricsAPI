// ==================================================
// DEPENDENCIES
//===================================================
const express=require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const app = express() 

// BodyParser makes it easy for our server to interpret data sent to it.
// The code below is pretty standard.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" })); 

// set up mongoose connection

var mongoose = require("mongoose");

// Use promise library
//mongoose.Promise = require('bluebird');

// Using `mongoose.connect`...

var promise = mongoose.connect(
  // connection URI
  process.env.MONGODB_URI, 
  // connection options
  {
    useMongoClient: true
  }
  );
  
// Show any mongoose errors
promise.then(function(database){
  db = database;
  db.on("error", function(error) {
  console.log("Mongoose error: ", error);
  });

  // Once connected to the db through mongoose, log a success message
  db.once("open", function() {
    console.log("Mongoose connection successful.");
  });
})



// ===================================================
// ROUTES
// geniusApi routes handle requests to the Genius api.
// mongooseAPI routes handle mongoDB actions.
// htmlRoutes serves the homepage
// ===================================================

require("./api/geniusApi")(app);
require("./api/mongooseApi")(app);



// Sets an initial port. We"ll use this later in our listener
var PORT = process.env.PORT || 8080;

// ==================================================
// start our server
// ==================================================
app.listen(PORT, function() {
  console.log(`App listening on port ${PORT}`);
});
