// set up mongoose connection

var mongoose = require("mongoose");
// it would be nice to have promise behavior for simpler code
mongoose.Promise = Promise;

// local or deployed? Use the right mongo db
mongoose.connect(process.env.MONGODB_URI);
//mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/smartlyrics" );

// Hook mongoose connection to db
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once connected to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
}); 

// we'll need our Favorite model
var Favorite = require("../app/models/favorite.js");

var path = require("path"); 

module.exports = function(app) {

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
