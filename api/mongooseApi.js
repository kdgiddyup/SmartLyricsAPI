// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

// allow requests from all domains
var cors = require("cors");

// we'll need our mongo models
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
        res.json({
          success:false,
          message: error
        });
      }
      // Otherwise, send success and song object back
      else {
        res.json(
            {
            success: true,
            song : req.body
          })
      }
    });
  });


// Route to retrieve and show user's favorited articles
app.get("/api/favorites/:user", function(req,res){
  console.log("retrieving favorites");
  // find favorites of currently logged-in user, passed through as a query parameter
  Favorite.find({ user:req.params.user }).sort("artist").exec( function(err, found){
    if(err){
      console.log("error:",err);
      res.json({success:false,message:err});
    }
    else{
      console.log("success",found);
      res.json({success:true,data:found});
    }
  });
});

// Route to remove favorited article
app.get("/api/remove/:id", function(req,res){
  Favorite.remove({song_id: req.params.id}, function(err){
    if (err) {
      res.json({success:false,message:err});
    };
    res.json({success:true,song:req.params.id});
   });
});

// Save new user to mongoDB
    app.post("/api/signup", function(req, res){
        console.log("sign up route hit");
        var newUser = new User(req.body);
        console.log("new user:",newUser);
        newUser.save(function(error,user){
            if (error) {
                if (error.code == 11000) {
                  var message = "That username already exists. Try again!"
                };
                res.json({
                    "success":false,
                    "message": message 
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
          if (!user) {
            res.json({
              "success":false,
              "message": "Unable to log you in. Try again!"            
              })
          }
          else if (user.authenticate(req.body.password)) {
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
