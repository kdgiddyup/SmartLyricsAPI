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
promise.then(function(db){
  db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
  });

  // Once connected to the db through mongoose, log a success message
  db.once("open", function() {
    console.log("Mongoose connection successful.");
  });
})
// we'll need our Favorite model
var Favorite = require("../app/models/favorite.js");

var path = require("path"); 

module.exports = function(app) {
  // default route
  app.get("/", function(req,res){
    res.send("SmartLyrics API by kdgiddup")
  })
  
  // Route to save our favorited song to mongoDB via mongoose
  app.post("/api/favorite", function(req, res) {
    // req.body should include title , artist, song_id, image url, lyrics page url

  // add currently logged-in user to this model
  req.body.user = req.user;
  
  var favorite = new Favorite(req.body);

  // Save new "Favorite" object to mongoDB
  favorite.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise, send success and song_id message back
    else {
      res.json({message:true,song_id:req.body.song_id});
    }
  });
});


// Route to retrieve and show favorited articles
app.get("/api/favorites", function(req,res){
  // find favorites of currently logged-in user
  Favorite.find({ user: req.user }, function(err, found){
    if(err){
      console.log(err);
    }
    else{
      res.json(found);
    }
  });
});

// Route to remove favorited article
app.get("/api/remove/:id", function(req,res){
  Favorite.remove({song_id: req.params.id}, function(err){
    if (err) {
      console.log('There was an error unfavoriting document:',err);
    };
    res.json({song:req.params.id});
   });
})


};
