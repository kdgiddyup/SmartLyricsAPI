// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

// we'll need our models
var Favorite = require("../app/models/favorite.js");
var User = require("../app/models/user.js");

module.exports = function(app) {
  
  // Route to save our favorited song to mongoDB via mongoose
  app.post("/api/favorites", function(req, res) {
    // req.body should include title , artist, song_id, image url, lyrics page url 
  var favorite = new Favorite(req.body);
  console.log("New favorite:",favorite);
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
  console.log("retrieving favorites");
  // find favorites of currently logged-in user
  Favorite.find({ }, function(err, found){
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
});

// Save new user to mongoDB
    app.post("/api/signup", function(req, res){
        console.log("sign up route hit");
        var newUser = new User(req.body);
        console.log("new user:",newUser);
        newUser.save(function(error,user){
            if (error) {
                console.log("Save error",error);
                res.json({
                    "success":false,
                    "message": `There was a problem: ${error}` 
                })
            }
            else { 
                console.log("Success",user.username);
                res.json({
                    "success":true,
                    "user":req.body.username,
                    "message":`Welcome, ${req.body.username}`
                })
            }
        })
    }); // end signup post route

// log-in user
    app.post("/api/login",function(req,res){
      console.log("login route, getting:",req.body);
      User.findOne({'username' : req.body.username}, function (err, user) {
      if (err) console.log(err)
      else {
          if (user.authenticate(req.body.password)) {
              res.json({
                "success":true,
                "user":req.body.username,
                "message":`Welcome, ${req.body.username}`
              })
            } 
          else
              res.json({
                "success":false,
                "message":"Unable to log you in. Try again."})
          }
      });
    });
};
